const express = require('express');
const router = express.Router();
const { db } = require('../db/index');

// 获取私聊历史记录
router.get('/api/private/messages/:userId/:friendId', async (req, res) => {
    const { userId, friendId } = req.params;
    
    try {
        const sql = `
            SELECT 
                pm.*,
                u.name as sender_name,
                u.login as sender_online,
                COALESCE(up.avatar_url, '') as sender_avatar
            FROM private_messages pm
            JOIN users u ON pm.sender_id = u.id
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE (pm.sender_id = ? AND pm.receiver_id = ?)
            OR (pm.sender_id = ? AND pm.receiver_id = ?)
            ORDER BY pm.created_at DESC
            LIMIT 100
        `;
        
        const messages = await db.query(sql, [userId, friendId, friendId, userId]);

        res.json({
            status: 0,
            data: messages.reverse()
        });
    } catch (error) {
        console.error('获取私聊记录失败:', error);
        res.json({
            status: 1,
            message: '获取聊天记录失败'
        });
    }
});

// 发送私聊消息
router.post('/api/private/message', async (req, res) => {
    const { sender_id, receiver_id, content } = req.body;
    
    try {
        // 插入消息
        const insertSql = `
            INSERT INTO private_messages 
            (sender_id, receiver_id, content, created_at) 
            VALUES (?, ?, ?, NOW())
        `;
        const result = await db.query(insertSql, [sender_id, receiver_id, content]);
        
        // 获取完整的消息信息，包括发送者的名字和头像
        const messageSql = `
            SELECT pm.*, u.name as sender_name, up.avatar_url as sender_avatar
            FROM private_messages pm
            LEFT JOIN users u ON pm.sender_id = u.id
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE pm.id = ?
        `;
        const messageInfo = await db.query(messageSql, [result.insertId]);

        res.json({
            status: 0,
            data: messageInfo[0]
        });
    } catch (error) {
        console.error('发送私聊消息失败:', error);
        res.json({
            status: 1,
            message: '发送消息失败'
        });
    }
});

// 更新消息已读状态
router.put('/api/private/messages/read', async (req, res) => {
    const { userId, friendId } = req.body;
    
    try {
        const sql = `
            UPDATE private_messages 
            SET is_read = 1 
            WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
        `;
        
        // 直接使用 db.query 的返回结果
        const result = await db.query(sql, [friendId, userId]);
        
        console.log(`标记用户 ${friendId} 发送给用户 ${userId} 的消息为已读, 影响行数:`, result.affectedRows);
        
        res.json({
            status: 0,
            message: '消息已更新为已读状态',
            updatedCount: result.affectedRows || 0
        });
    } catch (error) {
        console.error('更新消息状态失败:', error);
        res.json({
            status: 1,
            message: '更新消息状态失败'
        });
    }
});

// 修改消息状态
const updateMessageStatus = async (req, res) => {
    const { senderId, receiverId } = req.body;
    
    try {
        const sql = 'UPDATE private_messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?';
        await db.query(sql, [senderId, receiverId]);
        
        res.json({
            status: 0,
            message: '消息状态更新成功'
        });
    } catch (error) {
        console.error('更新消息状态失败:', error);
        res.json({
            status: 1,
            message: '更新消息状态失败'
        });
    }
};

// 获取所有私信消息列表
router.get('/api/private/messages', async (req, res) => {
    try {
        const sql = `
            SELECT 
                pm.*,
                s.name as sender_name,
                s.login as sender_online,
                sp.avatar_url as sender_avatar,
                r.name as receiver_name,
                r.login as receiver_online,
                rp.avatar_url as receiver_avatar
            FROM private_messages pm
            JOIN users s ON pm.sender_id = s.id
            JOIN users r ON pm.receiver_id = r.id
            LEFT JOIN user_profiles sp ON s.id = sp.user_id
            LEFT JOIN user_profiles rp ON r.id = rp.user_id
            ORDER BY pm.created_at DESC
            LIMIT 100
        `;
        
        const messages = await db.query(sql);

        res.json({
            status: 0,
            data: messages
        });
    } catch (error) {
        console.error('获取私信列表失败:', error);
        res.json({
            status: 1,
            message: '获取私信列表失败'
        });
    }
});

module.exports = router; 