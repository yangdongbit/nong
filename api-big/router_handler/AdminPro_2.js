const express = require('express');
const router = express.Router();
const { db } = require('../db/index');
const { pool } = require('../db/index');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            // 获取商品类型和用户ID
            const type = req.body.type;
            
            if (!type) {
                console.error('商品类型未定义:', req.body);
                return cb(new Error('商品类型不能为空'));
            }

            // 确保两处的 typeMap 保持一致
            const typeMap = {
                '蔬菜': '蔬菜',
                '水果': '水果',
                '农副加工': '农副加工',
                '种子种苗': '种子种苗',
                '粮油米面': '粮油米面',
                '禽畜肉蛋': '禽畜肉蛋',
                '农副产品': '农副产品'
            };
            
            // 获取映射后的类型，如果没有映射则使用默认类型
            const mappedType = typeMap[type] || '其他';
            
            // 构建目标文件夹路径
            const targetDir = path.join('E:', '农乐购项目', '农乐购源码', '静态资源托管', 'img', mappedType);
            
            console.log('存储目录:', targetDir);
            console.log('商品类型:', type);
            console.log('映射类型:', mappedType);
            
            // 确保目录存在
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            
            cb(null, targetDir);
        } catch (error) {
            console.error('设置存储目录失败:', error);
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        try {
            // 获取文件扩展名
            const ext = path.extname(file.originalname);
            // 使用用户ID和图片序号命名
            const userId = req.body.buyer;
            const imageIndex = req.body.imageIndex;

            if (!userId || !imageIndex) {
                console.error('用户ID或图片序号未定义:', req.body);
                return cb(new Error('用户ID和图片序号不能为空'));
            }

            const fileName = `${userId}_${imageIndex}${ext}`;
            console.log('文件名:', fileName);
            
            cb(null, fileName);
        } catch (error) {
            console.error('设置文件名失败:', error);
            cb(error);
        }
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        console.log('Upload request body:', req.body);
        
        // 检查必要的字段
        const { type, buyer, imageIndex } = req.body;
        
        if (!type || !buyer || !imageIndex) {
            console.log('Missing fields:', { type, buyer, imageIndex });
            cb(new Error(`缺少必要的字段: ${!type ? 'type' : ''} ${!buyer ? 'buyer' : ''} ${!imageIndex ? 'imageIndex' : ''}`.trim()));
            return;
        }
        
        // 检查文件类型
        if (!file.mimetype.startsWith('image/')) {
            cb(new Error('只能上传图片文件'));
            return;
        }
        
        cb(null, true);
    }
});

// 处理图片上传
router.post('/api/yang/upload/goods', (req, res) => {
    upload.single('image')(req, res, function(err) {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).send({
                status: 1,
                message: err.message
            });
        }

        try {
            const { type, buyer, imageIndex } = req.body;
            const file = req.file;
            
            if (!file) {
                return res.status(400).send({
                    status: 1,
                    message: '没有上传文件'
                });
            }

            // 使用相同的 typeMap
            const typeMap = {
                '蔬菜': '蔬菜',
                '水果': '水果',
                '农副加工': '农副加工',
                '种子种苗': '种子种苗',
                '粮油米面': '粮油米面',
                '禽畜肉蛋': '禽畜肉蛋',
                '农副产品': '农副产品'
            };

            const mappedType = typeMap[type] || '其他';
            const imageUrl = `http://127.0.0.1:3000/yang/img/${mappedType}/${buyer}_${imageIndex}${path.extname(file.originalname)}`;

            res.send({
                status: 0,
                message: '上传成功',
                data: {
                    url: imageUrl
                }
            });
        } catch (err) {
            console.error('Upload processing error:', err);
            res.status(500).send({
                status: 1,
                message: '上传失败',
                error: err.message
            });
        }
    });
});

// 获取单个商品详情
router.get('/api/yang/goods/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM farms WHERE id = ?', [id]);
        
        if (result.length === 0) {
            return res.status(404).send({
                status: 1,
                message: '商品不存在'
            });
        }

        res.send({
            status: 0,
            message: '获取商品详情成功',
            data: result[0]
        });
    } catch (err) {
        console.error('获取商品详情失败:', err);
        res.status(500).send({
            status: 1,
            message: '获取商品详情失败',
            error: err.message
        });
    }
});

// 添加商品
router.post('/api/yang/goods', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        const {
            title,
            price,
            type,
            imgSrc,
            imgSrc1,
            imgSrc2,
            imgSrc3,
            imgSrc4,
            shipping_from,
            express_name,
            product_name,
            specification,
            storage_method,
            shelf_life,
            sales_volume,
            stock,
            buyer
        } = req.body;

        // 处理可能为undefined的字段，设置默认值
        const data = {
            title: title || '',
            price: price || 0,
            type: type || '',
            imgSrc: imgSrc || 'http://124.223.88.78:3000/yang/img/img/logo.png',
            imgSrc1: imgSrc1 || null,
            imgSrc2: imgSrc2 || null,
            imgSrc3: imgSrc3 || null,
            imgSrc4: imgSrc4 || null,
            shipping_from: shipping_from || '',
            express_name: express_name || '',
            product_name: product_name || '',
            specification: specification || '',
            storage_method: storage_method || '',
            shelf_life: shelf_life || '',
            sales_volume: sales_volume || '0+',
            stock: stock || '0',
            buyer: buyer || ''
        };

        // 插入商品数据
        const [result] = await connection.execute(
            `INSERT INTO farms (
                title, price, type, imgSrc, imgSrc1, imgSrc2, imgSrc3, imgSrc4,
                shipping_from, express_name, product_name, specification,
                storage_method, shelf_life, sales_volume, stock, buyer
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.title, data.price, data.type, data.imgSrc, data.imgSrc1, 
                data.imgSrc2, data.imgSrc3, data.imgSrc4, data.shipping_from, 
                data.express_name, data.product_name, data.specification,
                data.storage_method, data.shelf_life, data.sales_volume, 
                data.stock, data.buyer
            ]
        );

        await connection.commit();

        res.send({
            status: 0,
            message: '添加商品成功',
            data: { id: result.insertId }
        });
    } catch (err) {
        await connection.rollback();
        console.error('添加商品失败:', err);
        res.status(500).send({
            status: 1,
            message: '添加商品失败',
            error: err.message
        });
    } finally {
        connection.release();
    }
});

// 更新商品
router.put('/api/yang/goods/:id', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const {
            title,
            price,
            type,
            imgSrc,
            imgSrc1,
            imgSrc2,
            imgSrc3,
            imgSrc4,
            shipping_from,
            express_name,
            product_name,
            specification,
            storage_method,
            shelf_life,
            sales_volume,
            stock,
            buyer
        } = req.body;

        // 检查商品是否存在
        const [checkResult] = await connection.execute(
            'SELECT id FROM farms WHERE id = ?',
            [id]
        );

        if (checkResult.length === 0) {
            await connection.rollback();
            return res.status(404).send({
                status: 1,
                message: '商品不存在'
            });
        }

        // 更新商品信息
        const [result] = await connection.execute(
            `UPDATE farms SET
                title = ?, price = ?, type = ?, imgSrc = ?, imgSrc1 = ?,
                imgSrc2 = ?, imgSrc3 = ?, imgSrc4 = ?, shipping_from = ?,
                express_name = ?, product_name = ?, specification = ?,
                storage_method = ?, shelf_life = ?, sales_volume = ?,
                stock = ?, buyer = ?
            WHERE id = ?`,
            [
                title, price, type, imgSrc, imgSrc1, imgSrc2, imgSrc3, imgSrc4,
                shipping_from, express_name, product_name, specification,
                storage_method, shelf_life, sales_volume, stock, buyer, id
            ]
        );

        await connection.commit();

        if (result.affectedRows > 0) {
            res.send({
                status: 0,
                message: '更新商品成功'
            });
        } else {
            await connection.rollback();
            res.status(400).send({
                status: 1,
                message: '更新商品失败'
            });
        }
    } catch (err) {
        await connection.rollback();
        console.error('更新商品失败:', err);
        res.status(500).send({
            status: 1,
            message: '更新商品失败',
            error: err.message
        });
    } finally {
        connection.release();
    }
});

// 删除商品
router.delete('/api/yang/goods/:id', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        const { id } = req.params;

        // 检查商品是否存在
        const [checkResult] = await connection.execute(
            'SELECT id FROM farms WHERE id = ?',
            [id]
        );

        if (checkResult.length === 0) {
            await connection.rollback();
            return res.status(404).send({
                status: 1,
                message: '商品不存在'
            });
        }

        // 删除商品
        const [result] = await connection.execute(
            'DELETE FROM farms WHERE id = ?',
            [id]
        );

        await connection.commit();

        if (result.affectedRows > 0) {
            res.send({
                status: 0,
                message: '删除商品成功'
            });
        } else {
            await connection.rollback();
            res.status(400).send({
                status: 1,
                message: '删除商品失败'
            });
        }
    } catch (err) {
        await connection.rollback();
        console.error('删除商品失败:', err);
        res.status(500).send({
            status: 1,
            message: '删除商品失败',
            error: err.message
        });
    } finally {
        connection.release();
    }
});

// 获取买家/卖家订单列表
router.get('/api/yang/orders/:type/:userId', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { type, userId } = req.params;
        
        // 先获取订单基本信息
        const ordersSql = type === 'buy' 
            ? `SELECT o.*, u.name as buyer_name 
               FROM orders o
               LEFT JOIN users u ON o.user_id = u.id
               WHERE o.user_id = ? 
               ORDER BY o.created_at DESC`
            : `SELECT DISTINCT o.*, u.name as buyer_name
               FROM orders o
               JOIN order_items oi ON o.order_id = oi.order_id
               JOIN farms f ON oi.product_id = f.id
               LEFT JOIN users u ON o.user_id = u.id
               WHERE f.buyer = ? 
               ORDER BY o.created_at DESC`;
        
        const [orders] = await connection.execute(ordersSql, [userId]);

        // 为每个订单获取商品信息
        for (let order of orders) {
            // 获取订单商品
            const [products] = await connection.execute(`
                SELECT 
                    f.title,
                    f.imgSrc,
                    oi.price as order_price,
                    f.id as product_id,
                    u.name as seller_name
                FROM order_items oi
                JOIN farms f ON oi.product_id = f.id
                LEFT JOIN users u ON f.buyer = u.id
                WHERE oi.order_id = ?
            `, [order.order_id]);

            // 添加商品信息到订单对象
            order.products = products.map(product => ({
                title: product.title,
                imgSrc: product.imgSrc,
                price: product.order_price,  // 使用下单时的价格
                product_id: product.product_id
            }));

            // 添加卖家/买家信息
            if (type === 'buy') {
                order.seller_names = products.map(p => p.seller_name);
            }

            // 解析收货地址
            try {
                order.shipping_address = JSON.parse(order.shipping_address);
            } catch (e) {
                console.error('解析收货地址失败:', e);
                order.shipping_address = {};
            }
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
    } finally {
        connection.release();
    }
});

// 确认收货接口
router.post('/api/yang/orders/confirm/:orderId', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 更新订单状态
        const [result] = await connection.execute(
            'UPDATE orders SET order_status = "completed", updated_at = NOW() WHERE order_id = ?',
            [req.params.orderId]
        );

        if (result.affectedRows === 0) {
            throw new Error('订单不存在或已完成');
        }

        await connection.commit();
        res.send({
            status: 0,
            message: '确认收货成功'
        });
    } catch (err) {
        await connection.rollback();
        console.error('确认收货失败:', err);
        res.status(500).send({
            status: 1,
            message: '确认收货失败',
            error: err.message
        });
    } finally {
        connection.release();
    }
});

// 发货接口
router.post('/api/yang/orders/ship/:orderId', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 先检查订单状态
        const [orderCheck] = await connection.execute(
            'SELECT order_status FROM orders WHERE order_id = ?',
            [req.params.orderId]
        );

        if (!orderCheck.length || orderCheck[0].order_status !== 'paid') {
            throw new Error('订单不存在或状态不正确');
        }

        // 更新订单状态
        const [result] = await connection.execute(
            `UPDATE orders 
             SET order_status = 'shipped',
                 updated_at = NOW() 
             WHERE order_id = ?`,
            [req.params.orderId]
        );

        if (result.affectedRows === 0) {
            throw new Error('更新订单失败');
        }

        await connection.commit();
        res.send({
            status: 0,
            message: '发货成功'
        });
    } catch (err) {
        await connection.rollback();
        console.error('发货失败:', err);
        res.status(500).send({
            status: 1,
            message: '发货失败',
            error: err.message
        });
    } finally {
        connection.release();
    }
});

// 获取订单详情
router.get('/api/yang/orders/detail/:orderId', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { orderId } = req.params;

        // 获取订单基本信息
        const [orderInfo] = await connection.execute(`
            SELECT o.*, 
                   u_buyer.name as buyer_name,
                   u_seller.name as seller_name
            FROM orders o
            LEFT JOIN users u_buyer ON o.user_id = u_buyer.id
            LEFT JOIN farms f ON o.product_id = f.id
            LEFT JOIN users u_seller ON f.buyer = u_seller.id
            WHERE o.order_id = ?
        `, [orderId]);

        if (orderInfo.length === 0) {
            throw new Error('订单不存在');
        }

        // 获取订单商品信息
        const [orderItems] = await connection.execute(`
            SELECT f.title, f.imgSrc, f.price, oi.quantity
            FROM order_items oi
            LEFT JOIN farms f ON oi.product_id = f.id
            WHERE oi.order_id = ?
        `, [orderId]);

        // 合并信息
        const orderDetail = {
            ...orderInfo[0],
            items: orderItems
        };

        res.send({
            status: 0,
            message: '获取订单详情成功',
            data: orderDetail
        });

    } catch (err) {
        console.error('获取订单详情失败:', err);
        res.status(500).send({
            status: 1,
            message: '获取订单详情失败',
            error: err.message
        });
    } finally {
        connection.release();
    }
});

// 获取卖家商品的评论列表
router.get('/api/yang/reviews/seller/:userId', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { userId } = req.params;

        // 检查用户是否是管理员
        const [userInfo] = await connection.execute(
            'SELECT administrator FROM users WHERE id = ?',
            [userId]
        );

        let reviews;
        if (userInfo[0]?.administrator === '1') {
            // 管理员可以看到所有评论
            [reviews] = await connection.execute(`
                SELECT 
                    ue.*,
                    f.title as product_title,
                    f.imgSrc as product_image,
                    ue.author as reviewer_name,
                    ue.date as created_at,
                    ue.content,
                    ue.rating,
                    ue.avatar_img,
                    u.name as seller_name
                FROM user_evaluations ue
                JOIN farms f ON ue.ids = f.id
                LEFT JOIN users u ON f.buyer = u.id
                ORDER BY ue.date DESC
            `);
        } else {
            // 普通卖家只能看到自己商品的评论
            [reviews] = await connection.execute(`
                SELECT 
                    ue.*,
                    f.title as product_title,
                    f.imgSrc as product_image,
                    ue.author as reviewer_name,
                    ue.date as created_at,
                    ue.content,
                    ue.rating,
                    ue.avatar_img
                FROM user_evaluations ue
                JOIN farms f ON ue.ids = f.id
                WHERE f.buyer = ?
                ORDER BY ue.date DESC
            `, [userId]);
        }

        res.send({
            status: 0,
            message: '获取评论列表成功',
            data: reviews
        });

    } catch (err) {
        console.error('获取评论列表失败:', err);
        res.status(500).send({
            status: 1,
            message: '获取评论列表失败',
            error: err.message
        });
    } finally {
        connection.release();
    }
});

// 删除评论
router.delete('/api/yang/reviews/:reviewId', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { reviewId } = req.params;

        // 检查评论是否存在
        const [review] = await connection.execute(
            'SELECT * FROM user_evaluations WHERE id = ?',
            [reviewId]
        );

        if (!review.length) {
            throw new Error('评论不存在');
        }

        // 删除评论
        const [result] = await connection.execute(
            'DELETE FROM user_evaluations WHERE id = ?',
            [reviewId]
        );

        if (result.affectedRows === 0) {
            throw new Error('删除评论失败');
        }

        await connection.commit();
        res.send({
            status: 0,
            message: '删除评论成功'
        });

    } catch (err) {
        await connection.rollback();
        console.error('删除评论失败:', err);
        res.status(500).send({
            status: 1,
            message: '删除评论失败',
            error: err.message
        });
    } finally {
        connection.release();
    }
});

// 获取卖家列表（仅管理员可用）
router.get('/api/yang/sellers', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [sellers] = await connection.execute(`
            SELECT DISTINCT u.id, u.name
            FROM users u
            JOIN farms f ON u.id = f.buyer
            ORDER BY u.name
        `);

        res.send({
            status: 0,
            message: '获取卖家列表成功',
            data: sellers
        });
    } catch (err) {
        console.error('获取卖家列表失败:', err);
        res.status(500).send({
            status: 1,
            message: '获取卖家列表失败',
            error: err.message
        });
    } finally {
        connection.release();
    }
});

module.exports = router; 
