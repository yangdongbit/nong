const WebSocket = require('ws');
const { db } = require('../db/index');
const fetch = require('node-fetch');

module.exports = function setupWebSocket(httpServer) {
    // 创建一个新的 WebSocket 服务器实例，与HTTP服务器实例关联
    const wss = new WebSocket.Server({ server: httpServer });

    // 存储在线用户信息
    const onlineUsers = new Map();

    // 获取所有用户列表
    async function getAllUsers() {
        try {
            const sql = `
                SELECT u.*, up.avatar_url 
                FROM users u 
                LEFT JOIN user_profiles up ON u.id = up.user_id 
                ORDER BY u.id
            `;
            const result = await db.query(sql);
            
            // 处理查询结果
            let users = [];
            if (result && typeof result === 'object') {
                users = Object.values(result).filter(item => item && typeof item === 'object');
            }

            // 转换用户数据，添加在线状态
            const processedUsers = users.map(user => ({
                id: user.id,
                name: user.name,
                avatar: user.avatar_url || null,
                isOnline: onlineUsers.has(user.id)
            }));

            console.log('当前用户列表:', processedUsers.map(u => 
                `${u.name}(${u.id}) - ${u.isOnline ? '在线' : '离线'}`
            ));
            
            return processedUsers;
        } catch (error) {
            console.error('获取用户列表失败:', error.message);
            return [];
        }
    }

    // 广播用户列表
    async function broadcastUserList() {
        try {
            const allUsers = await getAllUsers();
            const onlineCount = allUsers.filter(u => u.isOnline).length;
            
            console.log(`广播用户列表更新: 共 ${allUsers.length} 人，在线 ${onlineCount} 人`);
            
            broadcast({
                type: 'userList',
                data: { users: allUsers }
            });
        } catch (error) {
            console.error('广播用户列表失败:', error.message);
        }
    }

    // 更新用户登录状态
    async function updateUserLoginStatus(userId, status) {
        try {
            const sql = 'UPDATE users SET login = ? WHERE id = ?';
            await db.query(sql, [status, userId]);
            console.log(`用户状态更新: ID ${userId} - ${status ? '上线' : '离线'}`);
            await broadcastUserList();
        } catch (error) {
            console.error('更新用户状态失败:', error.message);
        }
    }

    // WebSocket 连接事件处理
    wss.on('connection', function (socket) {
        socket.on('message', async function (message) {
            try {
                const data = JSON.parse(message);
                
                switch (data.type) {
                    case 'join':
                        socket.userName = data.name;
                        socket.userId = data.id;
                        socket.userAvatar = data.avatar;
                        
                        await updateUserLoginStatus(socket.userId, 1);
                        onlineUsers.set(data.id, {
                            id: data.id,
                            name: data.name,
                            avatar: data.avatar
                        });
                        
                        broadcast({
                            type: 'system',
                            data: {
                                msg: `${socket.userName}进入了聊天室`,
                                time: new Date().toISOString()
                            }
                        });
                        
                        await broadcastUserList();
                        break;

                    case 'public_message':
                        try {
                            const sql = `INSERT INTO public_messages 
                                (user_id, content, created_at) 
                                VALUES (?, ?, NOW())`;
                            const result = await db.query(sql, [
                                socket.userId,
                                data.content
                            ]);

                            const messageInfoResult = await db.query(
                                `SELECT pm.*, u.name as sender_name, up.avatar_url as sender_avatar 
                                 FROM public_messages pm 
                                 LEFT JOIN users u ON pm.user_id = u.id 
                                 LEFT JOIN user_profiles up ON u.id = up.user_id 
                                 WHERE pm.id = ?`, 
                                [result.insertId]
                            );

                            if (!messageInfoResult || !messageInfoResult[0]) {
                                throw new Error('无法获取插入的消息信息');
                            }

                            const messageInfo = messageInfoResult[0];
                            
                            const publicMessageData = {
                                type: 'public_message',
                                data: {
                                    id: messageInfo.id,
                                    content: messageInfo.content,
                                    sender_id: messageInfo.user_id,
                                    sender_name: messageInfo.sender_name,
                                    sender_avatar: messageInfo.sender_avatar,
                                    created_at: messageInfo.created_at
                                }
                            };
                            
                            broadcast(publicMessageData);
                        } catch (error) {
                            console.error('处理公共消息失败:', error);
                        }
                        break;

                    case 'private_message':
                        const messageData = data.data;
                        try {
                            // 消息已经在前端保存过了，这里只需要转发
                            const fullMessage = {
                                type: 'private_message',
                                data: messageData
                            };
                            
                            [messageData.receiver_id, messageData.sender_id].forEach(userId => {
                                const client = Array.from(wss.clients).find(c => c.userId === userId);
                                if (client && client.readyState === WebSocket.OPEN) {
                                    client.send(JSON.stringify(fullMessage));
                                }
                            });
                        } catch (error) {
                            console.error('处理私聊消息失败:', error);
                        }
                        break;
                }
            } catch (error) {
                console.error('WebSocket 消息处理错误:', error);
            }
        });

        socket.on('close', async () => {
            if (socket.userId && onlineUsers.has(socket.userId)) {
                await updateUserLoginStatus(socket.userId, 0);
                onlineUsers.delete(socket.userId);
                await broadcastUserList();
            }
        });
    });

    // 给所有用户发消息
    function broadcast(message) {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }

    // 添加一个检查是否是好友的辅助函数
    async function checkFriendship(userId1, userId2) {
        try {
            const sql = `
                SELECT * FROM friends 
                WHERE (user_id = ? AND friend_id = ? AND status = 1)
                OR (user_id = ? AND friend_id = ? AND status = 1)
            `;
            const [rows] = await db.query(sql, [userId1, userId2, userId2, userId1]);
            return rows && rows.length > 0;
        } catch (error) {
            console.error('检查好友关系失败:', error.message);
            return false;
        }
    }
};