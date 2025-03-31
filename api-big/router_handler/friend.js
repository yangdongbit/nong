const express = require('express');
const router = express.Router();
const { db, pool } = require('../db/index');

// 发送好友请求
router.post('/api/friends/request', async (req, res) => {
    const { userId, friendId } = req.body;
    
    try {
        // 检查是否已经是好友
        const checkFriendSql = `
            SELECT * FROM friends 
            WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
            AND status = 1
        `;
        const [existingFriend] = await db.query(checkFriendSql, [userId, friendId, friendId, userId]);
        
        if (existingFriend && existingFriend.length > 0) {
            return res.json({
                status: 1,
                message: '已经是好友了'
            });
        }

        // 检查是否有待处理的请求
        const checkPendingSql = `
            SELECT * FROM friends 
            WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
            AND status = 0
        `;
        const [pendingRequest] = await db.query(checkPendingSql, [userId, friendId, friendId, userId]);
        
        if (pendingRequest && pendingRequest.length > 0) {
            return res.json({
                status: 1,
                message: '已有待处理的好友请求'
            });
        }
        
        // 添加好友请求
        const sql = 'INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 0)';
        await db.query(sql, [userId, friendId]);
        
        res.json({
            status: 0,
            message: '好友请求已发送'
        });
    } catch (error) {
        console.error('处理好友请求失败:', error);
        res.json({
            status: 1,
            message: '发送好友请求失败'
        });
    }
});

// 获取好友列表
router.get('/api/friends/list/:userId', async (req, res) => {
    const userId = req.params.userId;
    
    try {
        const sql = `
            SELECT DISTINCT 
                u.id, 
                u.name, 
                u.login as isOnline, 
                up.avatar_url as avatar
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id IN (
                SELECT friend_id FROM friends 
                WHERE user_id = ? AND status = 1
                UNION
                SELECT user_id FROM friends 
                WHERE friend_id = ? AND status = 1
            )
        `;
        const friends = await db.query(sql, [userId, userId]);
        
        res.json({
            status: 0,
            data: friends
        });
    } catch (error) {
        console.error(`获取用户 ${userId} 的好友列表失败:`, error);
        res.json({
            status: 1,
            message: '获取好友列表失败'
        });
    }
});

// 获取好友请求列表
router.get('/api/friends/requests/:userId', async (req, res) => {
    const userId = req.params.userId;
    
    try {
        const sql = `
            SELECT f.id, f.user_id, f.created_at, u.name, up.avatar_url as avatar
            FROM friends f
            JOIN users u ON f.user_id = u.id
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE f.friend_id = ? AND f.status = 0
            ORDER BY f.created_at DESC
        `;
        const requests = await db.query(sql, [userId]);
        
        // 确保返回空数组而不是 undefined
        res.json({
            status: 0,
            data: Array.isArray(requests) ? requests : []
        });
    } catch (error) {
        console.error(`获取用户 ${userId} 的好友请求失败:`, error);
        res.json({
            status: 1,
            message: '获取好友请求列表失败'
        });
    }
});

// 处理好友请求响应
router.post('/api/friends/response', async (req, res) => {
    const { requestId, userId, friendId, status } = req.body;
    
    try {
        // 1. 更新原始请求的状态
        const updateSql = 'UPDATE friends SET status = ? WHERE id = ?';
        await db.query(updateSql, [status, requestId]);

        // 2. 如果接受了好友请求，创建反向的好友关系
        if (status === 1) {
            // 先检查是否已存在反向记录
            const checkSql = 'SELECT id FROM friends WHERE user_id = ? AND friend_id = ?';
            const existingRecord = await db.query(checkSql, [friendId, userId]);

            if (!existingRecord || existingRecord.length === 0) {
                // 不存在反向记录，创建一条
                const insertSql = 'INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 1)';
                await db.query(insertSql, [friendId, userId]);
            } else {
                // 存在反向记录，更新状态
                const updateReverseSql = 'UPDATE friends SET status = 1 WHERE user_id = ? AND friend_id = ?';
                await db.query(updateReverseSql, [friendId, userId]);
            }
        }

        console.log(`好友请求处理完成 - 请求ID: ${requestId}, 状态: ${status === 1 ? '接受' : '拒绝'}`);
        
        res.json({
            status: 0,
            message: status === 1 ? '已接受好友请求' : '已拒绝好友请求'
        });
    } catch (error) {
        console.error(`处理好友请求失败 - 请求ID: ${requestId}:`, error);
        res.json({
            status: 1,
            message: '处理好友请求失败'
        });
    }
});

// 获取好友请求列表
router.get('/api/friends/pending/:userId', async (req, res) => {
    const userId = req.params.userId;
    
    try {
        const sql = `
            SELECT f.id, f.user_id, f.created_at, u.name, up.avatar_url as avatar
            FROM friends f
            JOIN users u ON f.user_id = u.id
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE f.friend_id = ? AND f.status = 0
            ORDER BY f.created_at DESC
        `;
        const requests = await db.query(sql, [userId]);
        
        // 确保返回空数组而不是 undefined
        res.json({
            status: 0,
            data: Array.isArray(requests) ? requests : []
        });
    } catch (error) {
        console.error('获取待处理好友请求失败:', error);
        res.json({
            status: 1,
            message: '获取好友请求列表失败'
        });
    }
});

// 搜索用户
router.get('/api/users/search', async (req, res) => {
    const { keyword } = req.query;
    const currentUserId = req.query.userId; // 当前用户ID，用于排除自己
    
    try {
        const sql = `
            SELECT u.id, u.name, u.login as isOnline, up.avatar_url as avatar
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id != ? 
            AND (
                u.id LIKE ? 
                OR u.name LIKE ? 
                OR u.email LIKE ?
            )
            LIMIT 10
        `;
        
        const searchPattern = `%${keyword}%`;
        const [users] = await db.query(sql, [
            currentUserId,
            searchPattern,
            searchPattern,
            searchPattern
        ]);
        
        console.log(`用户搜索结果 - 关键词: ${keyword}:`, users);
        
        res.json({
            status: 0,
            data: users || []
        });
    } catch (error) {
        console.error('搜索用户失败:', error);
        res.json({
            status: 1,
            message: '搜索用户失败'
        });
    }
});

module.exports = router; 