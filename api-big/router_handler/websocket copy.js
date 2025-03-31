const WebSocket = require('ws');
const { db } = require('../db/index')

// 导出一个函数，用于创建WebSocket服务器并附加到提供的HTTP服务器上
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
        console.log('新的WebSocket连接建立');
        
        socket.on('message', async function (message) {
            try {
                const data = JSON.parse(message);
                const currentTime = new Date().toISOString();
                
                switch (data.type) {
                    case 'join':
                        socket.userName = data.name;
                        socket.userId = data.id;
                        socket.userAvatar = data.avatar;
                        
                        console.log(`用户加入: ${data.name}(${data.id})`);
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
                                time: currentTime
                            }
                        });
                        
                        await broadcastUserList();
                        break;

                    case 'message':
                        if (!socket.userName || !data.msg?.trim()) return;
                        console.log(`收到消息: ${socket.userName} 说: ${data.msg}`);
                        broadcast({
                            type: 'message',
                            data: {
                                id: socket.userId,
                                name: socket.userName,
                                msg: data.msg,
                                time: currentTime,
                                avatar: socket.userAvatar
                            }
                        });
                        break;
                }
            } catch (error) {
                console.error('消息处理错误:', error.message);
            }
        });

        socket.on('close', async () => {
            if (socket.userId && onlineUsers.has(socket.userId)) {
                console.log(`用户离开: ${socket.userName}(${socket.userId})`);
                await updateUserLoginStatus(socket.userId, 0);
                onlineUsers.delete(socket.userId);
                
                broadcast({
                    type: 'system',
                    data: {
                        msg: `${socket.userName}离开了聊天室`,
                        time: new Date().toISOString()
                    }
                });
            }
        });

        socket.on('error', (error) => {
            console.error('WebSocket连接错误:', error.message);
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
};