const express = require('express');
const router = express.Router();
const { db } = require('../db/index');

// 获取公共消息
router.get('/api/public/messages', async (req, res) => {
    try {
        const sql = `
            SELECT pm.*, u.name as sender_name, up.avatar_url as sender_avatar 
            FROM public_messages pm 
            LEFT JOIN users u ON pm.user_id = u.id 
            LEFT JOIN user_profiles up ON u.id = up.user_id 
            ORDER BY pm.created_at DESC
            LIMIT 100
        `;
        const messages = await db.query(sql);
        
        res.json({
            status: 0,
            data: messages.reverse()
        });
    } catch (error) {
        console.error('获取公共消息失败:', error);
        res.json({
            status: 1,
            message: '获取消息失败'
        });
    }
});

// 保存公共聊天消息
router.post('/api/public/message', async (req, res) => {
    const { userId, content } = req.body;
    
    try {
        const sql = 'INSERT INTO public_messages (user_id, content) VALUES (?, ?)';
        const result = await db.query(sql, [userId, content]);
        
        console.log('插入结果:', result);
        
        // 获取插入的消息ID
        const insertId = result.insertId || result[0]?.insertId;
        
        if (!insertId) {
            throw new Error('Failed to get insertId');
        }
        
        console.log(`用户 ${userId} 发送公共消息, ID: ${insertId}`);
        
        res.json({
            status: 0,
            data: {
                id: insertId,
                user_id: userId,
                content,
                created_at: new Date()
            }
        });
    } catch (error) {
        console.error('保存公共聊天消息失败:', error);
        res.json({
            status: 1,
            message: '发送消息失败'
        });
    }
});

module.exports = router; 