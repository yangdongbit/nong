const express = require('express');
const router = express.Router();
const { db } = require('../db/index');
const { pool } = require('../db/index');

// 利用邮箱登录
router.post('/api/yang/emailLogin', async (req, res) => {

    try {
        const userinfo = req.body
        const sql = 'SELECT * FROM users WHERE email = ?;'
        const result = await db.query(sql, [userinfo.email]);
        if (result.length > 0) {
            res.send(result)
            
        }else {
            res.send(result)
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('服务器错误');
    }


});




// 订单交易成功的处理
router.post('/api/yang/payment/success', async (req, res) => {
    try {
        const { 
            userId,
            products,
            totalAmount,
            address,
            orderNote = ''
        } = req.body;

        // 参数验证
        if (!userId || !products || !products.length || !totalAmount || !address) {
            return res.status(400).send({
                status: 1,
                message: '缺少必要参数'
            });
        }

        // 1. 检查用户余额是否足够
        const userInfo = await db.query('SELECT balance FROM user_profiles WHERE user_id = ?', [userId]);
        
        if (!userInfo.length || Number(userInfo[0].balance) < totalAmount) {
            return res.status(400).send({
                status: 1,
                message: '余额不足'
            });
        }

        // 2. 更新用户余额
        await db.query(
            'UPDATE user_profiles SET balance = balance - ? WHERE user_id = ?',
            [totalAmount, userId]
        );

        // 3. 创建订单记录
        const orderId = `${Date.now()}${userId}${Math.floor(Math.random() * 1000)}`;
        await db.query(
            'INSERT INTO orders (order_id, user_id, total_amount, shipping_address, order_status, order_note, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [orderId, userId, totalAmount, JSON.stringify(address), 'paid', orderNote]
        );

        // 4. 处理每个商品
        for (const product of products) {
            // 创建订单商品记录
            await db.query(
                'INSERT INTO order_items (order_id, product_id, price, user_id) VALUES (?, ?, ?, ?)',
                [orderId, product.id, product.price, userId]
            );

            // 更新商品库存和销量
            const result = await db.query(
                `UPDATE farms 
                 SET stock = stock - 1,
                     sales_volume = CONCAT(CAST(SUBSTRING(sales_volume, 1, LENGTH(sales_volume)-1) AS UNSIGNED) + 1, '+')
                 WHERE id = ? AND stock > 0`,
                [product.id]
            );

            if (result.affectedRows === 0) {
                throw new Error(`商品ID ${product.id} 库存更新失败`);
            }
        }

        // 5. 记录交易流水
        await db.query(
            'INSERT INTO transactions (user_id, order_id, amount, type, created_at) VALUES (?, ?, ?, ?, NOW())',
            [userId, orderId, totalAmount, 'payment']
        );

        // 创建订单记录后，清空购物车中对应的商品
        const productIds = products.map(p => p.id);
        if (productIds.length > 0) {
            const placeholders = productIds.map(() => '?').join(',');
            await db.query(
                `DELETE FROM shopping_cart WHERE user_id = ? AND product_id IN (${placeholders})`,
                [userId, ...productIds]
            );
        }

        res.send({
            status: 0,
            message: '支付成功',
            data: { 
                orderId,
                orderStatus: 'paid',
                paymentTime: new Date().toISOString()
            }
        });

    } catch (err) {
        console.error('支付处理失败:', err);
        res.status(500).send({
            status: 1,
            message: '支付处理失败',
            error: err.message
        });
    }
});

// 更新订单发货状态
router.post('/api/yang/order/updateStatus', async (req, res) => {
    try {
        const { orderId, status } = req.body;
        
        const sql = `
            UPDATE orders 
            SET order_status = ?,
                updated_at = NOW()
            WHERE order_id = ?
        `;
        
        const result = await db.query(sql, [status, orderId]);
        
        res.send({
            status: 0,
            message: '订单状态更新成功',
            data: result
        });
        
    } catch (err) {
        console.error('更新订单状态失败:', err);
        res.status(500).send({
            status: 1,
            message: '更新订单状态失败',
            error: err.message
        });
    }
});

// 获取订单详情
router.get('/api/yang/order/detail/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        console.log('查询订单ID:', orderId);
        
        const sql = `
            SELECT * FROM orders 
            WHERE order_id = ?
        `;
        
        const result = await db.query(sql, [orderId]);
        console.log('查询结果:', result);
        
        if (result.length === 0) {
            return res.status(404).send({
                status: 1,
                message: '订单不存在'
            });
        }
        
        res.send({
            status: 0,
            message: '获取订单详情成功',
            data: result[0]
        });
        
    } catch (err) {
        console.error('获取订单详情失败:', err);
        res.status(500).send({
            status: 1,
            message: '获取订单详情失败',
            error: err.message
        });
    }
});

// 获取订单商品详情
router.get('/api/yang/order/items/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const sql = `
            SELECT f.id, f.imgSrc, f.title, oi.price as order_price
            FROM order_items oi
            LEFT JOIN farms f ON oi.product_id = f.id
            WHERE oi.order_id = ?
            ORDER BY oi.id ASC
        `;
        
        const result = await db.query(sql, [orderId]);
        
        if (!result.length) {
            return res.status(404).send({
                status: 1,
                message: '未找到订单商品'
            });
        }
        
        res.send({
            status: 0,
            message: '获取订单商品详情成功',
            data: result
        });
        
    } catch (err) {
        console.error('获取订单商品详情失败:', err);
        res.status(500).send({
            status: 1,
            message: '获取订单商品详情失败',
            error: err.message
        });
    }
});

// 获取用户订单列表
router.get('/api/yang/orders/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // 获取订单基本信息
        const orders = await db.query(`
            SELECT o.*, 
                   GROUP_CONCAT(DISTINCT oi.product_id) as product_ids, 
                   GROUP_CONCAT(DISTINCT oi.price) as prices,
                   COUNT(DISTINCT oi.product_id) as product_count
            FROM orders o
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
            WHERE o.user_id = ?
            GROUP BY o.order_id
            ORDER BY o.created_at DESC
        `, [userId]);

        // 获取订单商品详情
        for (let order of orders) {
            if (order.product_ids) {  // 添加空值检查
                const productIds = order.product_ids.split(',');
                const prices = order.prices.split(',');
                
                const products = await db.query(`
                    SELECT id, title, imgSrc, price
                    FROM farms
                    WHERE id IN (?)
                `, [productIds]);

                // 将价格信息添加到商品信息中
                order.products = products.map((product, index) => ({
                    ...product,
                    price: prices[index]
                }));
            } else {
                order.products = [];
            }

            // 删除中间数据
            delete order.product_ids;
            delete order.prices;
            delete order.product_count;
        }
        
        res.send({
            status: 0,
            message: '获取订单列表成功',
            data: orders
        });
        
    } catch (err) {
        console.error('获取订单列表失败:', err);
        res.status(500).send({
            status: 1,
            message: '获取订单列表失败',
            error: err.message
        });
    }
});

// 注销账户
router.delete('/api/yang/deleteAccount/:id', async (req, res) => {
    // 获取连接以使用事务
    const connection = await pool.getConnection();
    
    try {
        // 开启事务
        await connection.beginTransaction();

        const userId = req.params.id;

        // 验证用户是否存在
        const [checkUser] = await connection.execute(
            'SELECT * FROM users WHERE id = ?', 
            [userId]
        );

        if (checkUser.length === 0) {
            await connection.rollback();
            return res.status(404).send({
                status: 1,
                message: '用户不存在'
            });
        }

        // 删除 users 表中的数据
        const [result] = await connection.execute(
            'DELETE FROM users WHERE id = ?',
            [userId]
        );

        // 提交事务
        await connection.commit();

        if (result.affectedRows > 0) {
            res.send({
                status: 0,
                message: '账户注销成功'
            });
        } else {
            await connection.rollback();
            res.status(400).send({
                status: 1,
                message: '账户注销失败'
            });
        }

    } catch (err) {
        // 发生错误时回滚事务
        await connection.rollback();
        console.error('注销账户失败:', err);
        res.status(500).send({
            status: 1,
            message: '注销账户失败',
            error: err.message
        });
    } finally {
        // 释放连接
        connection.release();
    }
});

module.exports = router; 
