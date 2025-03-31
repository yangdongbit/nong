const express = require('express');
const { AlipaySdk } = require('alipay-sdk');
const QRCode = require('qrcode');
const { db, pool } = require('../db/index');

const router = express.Router();

// 配置支付宝SDK
const alipaySdk = new AlipaySdk({
    appId: '9021000143682448',
    privateKey: 'MIIEpAIBAAKCAQEA6uwnAvHkDxyo2R/v3sxcfCjGgiDpLbD/bIVRE2D5dmwHZvUWaNDc7gJ8+QYTr1uPP8KmK7SoVe9Nw81yG8mhRrlxXTXlfdh5V+3G3xItpd970cCuP8vo/PxsoaZsO7sS0T4IH7L2S9eoQO4a/qgsuhfrlrTtdIhIVx0DtihXfLNQBqMQ/lI/eM0RzEJ7X96E6oW/wYoGr/r8q3ypARduW+uf7nz9hWx5VgqmQhk44SIz+jr19jeHXyO1R3iZPY+X0cctFS1sNzWYWmvJXg+YURFP72aEsYa17w4fg7uOf/PHQKoKeacGk8Gws/v+EE6CZT2eqz2eHGGPzJ4WXAFVNQIDAQABAoIBAQDBu2oYlZ67j6j3Fc1c8S87/Oxnl/h0A8lAl1jbIFfZfxFDqM6INeZcKZUiUA6fyGQD8uPSmzNPWv/If36gx9DGYFvKwI23EHRRPPeKMpWOexTDT6DjX6eOKiTz0ijjwUytXfiZG57dwMUydqmwZMQt21gfeqlwNothu7251N8BJ9I0UDr4oUwqwu86aWnzOJv+Ml4fp4419LCPJXbk4CYrmYg9bAQr3YOKjgZzUf/x54CTqWdAcUvA641+HKdG6XkxJbAOfTR30dkjNCItjXbfeGIc9uG5Cw3lEovSf+6WklX0vN776t1vx+cNpJ3KsK+OHt1h/SNKdLOVL4sWdWUpAoGBAPucbc066A9M1tBqHv2Jn3znyP5E8g2U/LMNQbW3jlh8h2aYro++OWN577z7lfKSak+fjXJzwpQltnx3Rr0JV48Oap9oMXRQVAK9d8b4Sz2JUWVlsMF1A+Ys3uujdqdr5ntQtdbPEQpvzcjBcr3UH8Tomm7c2kanwPhJ58I94DdvAoGBAO8FM1N3V49GaA8+YgiGTpJH4c4HhdKZLMVq2xkhxUi1SJmqcMupAmA8NwYHxKxO5DdAIiVh7CwLeXM8xNL4LqyLxuCWD+VZHC6yzWOiVQyq5a3dIzvv/ZUgglFwB4KBlq/gcShN0qy2WThg+o47o+zUxq0uyXpWrpCfu8FsAgubAoGBAOrEtPdPxYOxMKbavfvX08aaB0KpVikyIO94qR1DHkCWQUiLoiVhWu7ksbrmDK1/zE5rE3H9bUsKPVG5gXmVI+vJidcfQzXCVgEQhJhUyO+sFxTDY7++zVqR95ZquaXR2gap8mFyZ/YTCDIPvl49dT8nwiE7VTekAzwoyWTGk1VlAoGATQfPB8pBZMJbDPac34RxVAFoi16vSTTmUeVjIRFaJFmQQT3Fxkz8oAkn7oCYaLOwJwI7PvL1CyjThkkCYb9sQ110xbJ3AwIZ7A7h1Idfg4qcJNFM5qcsgWANv7MsKGodJyddMJEMIW9PB7Vxal9cMBpOwUd/1TaUYbWo6+gkLJsCgYA/k2Lyo2zeX58TmfsN4eiJaICv/Mnw4nDoIEdff6gzp5LT5Nx/CS1AxcMOXYHyI0w7O+zcvS9K6YcFDKVwMn89vMSCa+cJMsmk/mMFbdim0CIKM/y8LJx4glma3/ImuLP8moKGHPRsZLQWXrU+0vaODbfzUnFFY2RiwJKawFGNqw==',
    gateway: 'https://openapi-sandbox.dl.alipaydev.com/gateway.do',
    alipayPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApAfK0llnYc1HyjIlmRGExCOgef/EMfxJjmlHJec01OYvbPufvTYJvk6ScNoS2tJZHad1aHCpLuQpLEcjn5ZnysJY1+8o+HYmfr6ABx2JfEnLIwNfevYs0jvdXZgStLWwumsEcJBvUYRIjHtM+617Q/isvDpMuTI5Sm47OEwU8sq5h20VZ9xIe9yIboXVns683xgJm7YYZqNO7/AUVB399PKwpsCLLSSVdmDM79QXB/JIhADki2Q3nR0Xs82gx3k6nTsZs9QMx2GJxieL1uYpWkAiFUwXpVZLLTm3j1nuG4xMZPKBjtxd1+7f/I0GsniiQ87TutH9JtadLqWY0Jmu+wIDAQAB',
    charset: 'utf-8',
    version: '1.0',
    signType: 'RSA2'
});

// 添加一个内存存储来跟踪订单状态
const orderStatus = new Map();

// 创建支付接口
router.post('/create-payment', async (req, res) => {
    try {
        const { productName, amount, products, address, userId, note } = req.body;
        // 使用和 AdminPro.js 相同的订单号格式
        const outTradeNo = `${Date.now()}${userId}${Math.floor(Math.random() * 1000)}`;
        
        // 存储更多订单信息
        orderStatus.set(outTradeNo, {
            status: 'WAIT_BUYER_PAY',
            amount: amount,
            productName: productName,
            createTime: new Date().toISOString(),
            products: products,
            address: address,
            userId: userId,
            note: note
        });

        // 调用支付宝接口
        const result = await alipaySdk.exec('alipay.trade.precreate', {
            notify_url: 'http://localhost:3000/api/alipay/notify',
            bizContent: {
                out_trade_no: outTradeNo,
                total_amount: Number(amount).toFixed(2),
                subject: productName || '商品购买',
                product_code: 'FACE_TO_FACE_PAYMENT'
            }
        });

        console.log('支付宝返回结果:', result);

        if (result.code === '10000' && result.qrCode) {
            try {
                const qrCodeBase64 = await QRCode.toDataURL(result.qrCode);
                console.log(`订单创建成功，订单号: ${outTradeNo}`);
                
                res.json({
                    success: true,
                    qrcode: qrCodeBase64,
                    orderId: outTradeNo,
                    qr_code: result.qrCode,
                    merchantInfo: {
                        account: 'mqjkwm3663@sandbox.com',
                        pid: '2088721056975853',
                        storeName: '测试商户',
                    },
                    orderInfo: {
                        amount: amount,
                        productName: productName,
                        createTime: new Date().toISOString(),
                        status: 'WAIT_BUYER_PAY'
                    }
                });
            } catch (qrError) {
                throw new Error('二维码生成失败: ' + qrError.message);
            }
        } else {
            console.error('支付宝返回错误:', result);
            throw new Error(`支付宝接口调用失败: ${result.msg || '未知错误'} (${result.subMsg || ''})`);
        }
    } catch (error) {
        console.error('创建支付订单失败:', error);
        res.status(500).json({
            success: false,
            message: '创建支付订单失败',
            error: error.message
        });
    }
});

// 查询订单状态接口
router.get('/order/status/:orderId', async (req, res) => {
    const orderId = req.params.orderId;
    try {
        const status = orderStatus.get(orderId);

        if (!status) {
            return res.json({
                success: false,
                message: '订单不存在'
            });
        }

        const result = await alipaySdk.exec('alipay.trade.query', {
            bizContent: {
                out_trade_no: orderId
            }
        });

        if (result.code === '10000') {
            const newStatus = {
                ...status,
                status: result.tradeStatus || result.trade_status || 'WAIT_BUYER_PAY'
            };
            orderStatus.set(orderId, newStatus);

            // 如果支付成功，创建订单
            if (newStatus.status === 'TRADE_SUCCESS') {
                console.log(`订单支付成功，订单号: ${orderId}`);
                try {
                    // 创建订单记录
                    await db.query(
                        'INSERT INTO orders (order_id, user_id, total_amount, shipping_address, order_status, order_note, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                        [orderId, status.userId, status.amount, JSON.stringify(status.address), 'paid', status.note || '']
                    );

                    // 处理每个商品
                    for (const product of status.products) {
                        // 创建订单商品记录
                        await db.query(
                            'INSERT INTO order_items (order_id, product_id, price, user_id) VALUES (?, ?, ?, ?)',
                            [orderId, product.id, product.price, status.userId]
                        );

                        // 更新商品库存和销量
                        await db.query(
                            `UPDATE farms 
                             SET stock = stock - 1,
                                 sales_volume = CONCAT(CAST(SUBSTRING(sales_volume, 1, LENGTH(sales_volume)-1) AS UNSIGNED) + 1, '+')
                             WHERE id = ? AND stock > 0`,
                            [product.id]
                        );
                    }

                    // 记录交易流水
                    await db.query(
                        'INSERT INTO transactions (user_id, order_id, amount, type, created_at) VALUES (?, ?, ?, ?, NOW())',
                        [status.userId, orderId, status.amount, 'payment']
                    );

                    // 清空购物车
                    const productIds = status.products.map(p => p.id);
                    if (productIds.length > 0) {
                        const placeholders = productIds.map(() => '?').join(',');
                        await db.query(
                            `DELETE FROM shopping_cart WHERE user_id = ? AND product_id IN (${placeholders})`,
                            [status.userId, ...productIds]
                        );
                    }
                } catch (error) {
                    console.error('创建订单失败:', error);
                }
            }

            res.json({
                success: true,
                orderInfo: {
                    ...newStatus,
                    tradeNo: result.tradeNo || result.trade_no
                }
            });
        } else {
            res.json({
                success: true,
                orderInfo: status
            });
        }
    } catch (error) {
        const status = orderStatus.get(orderId);
        if (status) {
            res.json({
                success: true,
                orderInfo: status
            });
        } else {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
});

// 修改支付处理逻辑
router.post('/api/yang/payment/success', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { userId, products, totalAmount, address, orderNote = '' } = req.body;

        // 参数验证
        if (!userId || !products || !products.length || !totalAmount || !address) {
            return res.status(400).send({
                status: 1,
                message: '缺少必要参数'
            });
        }

        await connection.beginTransaction();

        // 生成订单号并检查是否存在
        let orderId;
        let existingOrder;
        let retries = 0;
        const maxRetries = 3;

        do {
            orderId = `${Date.now()}${userId}${Math.floor(Math.random() * 1000)}`;
            [existingOrder] = await connection.execute(
                'SELECT order_id FROM orders WHERE order_id = ?',
                [orderId]
            );
            retries++;
        } while (existingOrder?.length > 0 && retries < maxRetries);

        if (retries >= maxRetries) {
            throw new Error('无法生成唯一订单号');
        }

        // 检查并锁定用户余额
        const [[userInfo]] = await connection.execute(
            'SELECT balance FROM user_profiles WHERE user_id = ? FOR UPDATE',
            [userId]
        );

        if (!userInfo || Number(userInfo.balance) < totalAmount) {
            throw new Error('余额不足');
        }

        // 创建订单
        await connection.execute(
            'INSERT INTO orders (order_id, user_id, total_amount, shipping_address, order_status, order_note, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [orderId, userId, totalAmount, JSON.stringify(address), 'PAID', orderNote]
        );

        // 更新用户余额
        await connection.execute(
            'UPDATE user_profiles SET balance = balance - ? WHERE user_id = ?',
            [totalAmount, userId]
        );

        // 创建订单商品记录并更新库存
        for (const product of products) {
            await connection.execute(
                'INSERT INTO order_items (order_id, product_id, price, user_id) VALUES (?, ?, ?, ?)',
                [orderId, product.id, product.price, userId]
            );

            await connection.execute(
                `UPDATE farms 
                 SET stock = stock - 1,
                     sales_volume = CONCAT(CAST(SUBSTRING(sales_volume, 1, LENGTH(sales_volume)-1) AS UNSIGNED) + 1, '+')
                 WHERE id = ? AND stock > 0`,
                [product.id]
            );
        }

        // 清空购物车
        if (products.length > 0) {
            const placeholders = products.map(() => '?').join(',');
            await connection.execute(
                `DELETE FROM shopping_cart WHERE user_id = ? AND product_id IN (${placeholders})`,
                [userId, ...products.map(p => p.id)]
            );
        }

        await connection.commit();

        res.send({
            status: 0,
            message: '支付成功',
            data: { orderId }
        });

    } catch (error) {
        await connection.rollback();
        console.error('创建订单失败:', error);
        res.status(500).send({
            status: 1,
            message: error.message || '支付失败'
        });
    } finally {
        connection.release();
    }
});

module.exports = router;
