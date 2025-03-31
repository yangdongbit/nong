// 导入数据库操控模块
const { log } = require('console');
const { db } = require('../db/index')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置 multer 存储头像
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'E:\\农乐购项目\\农乐购源码\\静态资源托管\\img\\用户上传的头像') // 保存的路径，需要确保这个文件夹存在
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// 获取数据
exports.yang = async (req, res) => {
    try {
        const query = 'SELECT * FROM users';
        const results = await db.query(query);
        res.send(results);
    } catch (err) {
        console.error(err);
        res.status(500).send('服务器错误');
    }
}

// 删除数据库对应的东西
exports.del = async (req, res) => {
    try {
        const userinfo = req.body
        const sql = 'DELETE FROM users WHERE id = ?'
        const result = await db.query(sql, [userinfo.id]);
        if (result.affectedRows === 1) {
            res.send('删除数据成功！！！')
        } else {
            res.status(404).send('未找到要删除的用户');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('服务器错误');
    }
}

// 往数据中添加数据
exports.add = async (req, res) => {
    try {
        const userinfo = req.body;
        // 先查询数据库中是否存在相同用户名或相同邮箱
        const checkSql = 'SELECT * FROM users WHERE name = ? OR email = ?';
        const results = await db.query(checkSql, [userinfo.name, userinfo.email]);

        // 检查查询结果是否有数据
        if (results && results.length > 0) {
            // 检查具体是用户名重复还是邮箱重复
            const existingUser = results[0];
            if (existingUser.name === userinfo.name) {
                return res.send('该用户名已存在，注册失败');
            } else {
                return res.send('该邮箱已被注册，注册失败');
            }
        }

        // 不存在同名用户且邮箱未被使用，可以注册
        const sql = 'INSERT INTO users (name, password, email) VALUES (?,?,?);';
        const result = await db.query(sql, [userinfo.name, userinfo.password, userinfo.email]);

        if (result && result.affectedRows === 1) {
            res.send('注册成功！！！');
        } else {
            res.status(400).send('注册失败');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('服务器错误');
    }
};

// 退出往数据库提交登录状态
exports.login = async (req, res) => {
    try {
        const userinfo = req.body
        const sql = 'UPDATE users SET login = ? WHERE id = ?;'
        const result = await db.query(sql, [userinfo.number, userinfo.id]);
        if (result.affectedRows === 1) {
            res.send('退出成功！！！')
        } else {
            res.status(404).send('未找到要更新的用户');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('服务器错误');
    }
}

// 先查询是否有那个邮箱
exports.check_email = async (req, res) => {
    try {
        const userinfo = req.body
        const sql = ' SELECT * FROM users WHERE email =?'
        const result = await db.query(sql, [userinfo.email]);

        if (result.length > 0) {
            res.send('有这个邮箱')
        } else {
            res.send('这个邮箱还没有注册');
        } 
    } catch (err) {
        console.error(err);
        res.status(500).send('服务器错误');
    }
}

// 密码
exports.resetpassword = async (req, res) => {
    try {
        const userinfo = req.body
        const sql = 'UPDATE users SET password = ? WHERE email = ?;'
        const result = await db.query(sql, [userinfo.password, userinfo.email]);
        if (result.affectedRows === 1) {
            res.send('修改密码成功！！！')
        } else {
            res.send('你还没有注册');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('服务器错误');
    }
}

// 商品数据请求
exports.farms = async (req, res) => {
    try {
        const query = 'SELECT * FROM farms;';
        const results = await db.query(query);
        res.send(results);
    } catch (err) {
        console.error(err);
        res.status(500).send('服务器错误');
    }
}

// 商品评论数据请求
exports.evaluations = async (req, res) => {
    try {
        const query = 'SELECT * FROM user_evaluations;';
        const results = await db.query(query);
        res.send(results);
    } catch (err) {
        console.error(err);
        res.status(500).send('服务器错误');
    }
}


// 用户收获地址的存储
exports.address = async (req, res) => {
    try {
        const userinfo = req.body
        const sql = 'UPDATE users SET delivery_address = ? WHERE id = ?;'
        const result = await db.query(sql, [userinfo.delivery_address, userinfo.id]);
        if (result.affectedRows === 1) {
            res.send('存储成功！！！')
        } else {
            res.status(404).send('未找到要更新的用户');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('服务器错误');
    }
}


// 验证用户输入的账号密码是否正确
exports.logins = async (req, res) => {
    try {
        const userinfo = req.body;

        // 定义 SQL 语句
        const sql = 'SELECT * FROM users WHERE name = ? AND password = ?';
        const [results] = await db.query(sql, [userinfo.name, userinfo.password]);
        
        if (!results || results.length === 0) {
            res.send({});
        } else {
            // 用户登录成功，更新用户的登录状态
            const updateSql = 'UPDATE users SET login = 1 WHERE name = ?';
            await db.query(updateSql, [userinfo.name]); 

            // 发送用户信息
            res.send(results);
        }
    } catch (err) {
        console.error(err);
        res.send('发生错误，请稍后重试');
    }
};



// 获取在线客服的回复
exports.getAuto = async (req, res) => {
    try {
        // 定义 SQL 语句
        const query = 'SELECT * FROM auto_reply_table;';
        const results = await db.query(query);
        res.send(results);


    } catch (err) {
        console.error(err);
        res.send('发生错误，请稍后重试。错误信息：' + err.message);
    }
};

// 获取购物车
exports.shopping_cat = async (req, res) => {
    try {
        const userinfo = req.body;
        // 定义 SQL 语句
        const sql = `SELECT * FROM shopping_cart WHERE user_id = ?;`;

        const results = await db.query(sql, [userinfo.user_id]);  // 执行sql语句并且返回数据
        res.send(results)  //给用户看

    } catch (err) {
        console.error(err)
        res.send('发生错误，请稍后重试。错误信息：' + err.message);
    }
}

// 添加数据进购物车
exports.add_cat = async (req, res) => {
    try {
        const userinfo = req.body;

        // 1. 先插入新数据
        const insertSql = 'INSERT INTO shopping_cart (user_id, product_id, quantity, added_time) VALUES (?, ?, ?, NOW())';
        await db.query(insertSql, [userinfo.user_id, userinfo.product_id, userinfo.quantity]);

        // 2. 创建临时表
        const createTempSql = `
            CREATE TEMPORARY TABLE temp_table AS
            SELECT 
                MIN(id) as id,
                user_id,
                product_id,
                SUM(quantity) as quantity,
                MAX(added_time) as added_time
            FROM shopping_cart
            GROUP BY user_id, product_id`;
        await db.query(createTempSql);

        // 3. 清空原表
        const deleteSql = 'DELETE FROM shopping_cart';
        await db.query(deleteSql);

        // 4. 从临时表插入合并后的数据
        const mergeSql = `
            INSERT INTO shopping_cart (id, user_id, product_id, quantity, added_time)
            SELECT id, user_id, product_id, quantity, added_time 
            FROM temp_table`;
        await db.query(mergeSql);

        // 5. 删除临时表
        const dropSql = 'DROP TEMPORARY TABLE IF EXISTS temp_table';
        await db.query(dropSql);

        res.send('加入成功');

    } catch (err) {
        // 如果发生错误，确保删除临时表
        try {
            await db.query('DROP TEMPORARY TABLE IF EXISTS temp_table');
        } catch (dropErr) {
            console.error('清理临时表失败:', dropErr);
        }

        console.error('操作失败:', err);
        res.send('发生错误，请稍后重试。错误信息：' + err.message);
    }
}

// update_cart 更新购物车接口
exports.update_cart = async (req, res) => {
    try {
        const userinfo = req.body;
        // 定义 SQL 语句
        const sql = `UPDATE shopping_cart
                        SET quantity = ?
                        WHERE user_id = ? AND product_id = ?;	`;

        const results = await db.query(sql, [userinfo.quantity, userinfo.user_id, userinfo.product_id]);  // 执行sql语句并且返回数据
        if (results.affectedRows === 1) {
            res.send('更新成功！！！')
        } else {
            res.status(404).send('未找到要更新的用户');
        }

    } catch (err) {
        console.error(err)
        res.send('发生错误，请稍后重试。错误信息：' + err.message);
    }
}

// 删除购物车接口
exports.delete_cart = async (req, res) => {
    try {
        const userinfo = req.body;
        // 定义 SQL 语句
        const sql = `DELETE FROM shopping_cart
                WHERE user_id = ? AND product_id = ?; `;

        const results = await db.query(sql, [userinfo.user_id, userinfo.product_id]);  // 执行sql语句并且返回数据
        if (results.affectedRows === 1) {
            res.send('删除成功！！！')
        } else {
            res.status(404).send('未找到要更新的用户');
        }

    } catch (err) {
        console.error(err)
        res.send('发生错误，请稍后重试。错误信息：' + err.message);
    }
}

// 个人中心数据的获取
exports.UserHub = async (req, res) => {
    try {
        const userinfo = req.body;
        // 定义 SQL 语句
        const sql = `SELECT * FROM user_profiles WHERE user_id = ?;`;

        const results = await db.query(sql, [userinfo.user_id]);  // 执行sql语句并且返回数据
        res.send(results)  //给用户看

    } catch (err) {
        console.error(err)
        res.send('发生错误，请稍后重试。错误信息：' + err.message);
    }
}

// 头像上传处理函数
exports.avatar = [
    upload.single('avatar'),
    (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ code: 400, message: 'No file uploaded' });
            }


            // console.log(req.file.filename, req.body.userId);
            // 定义 SQL 语句
            const sql = `UPDATE user_profiles SET avatar_url = ? WHERE user_id = ?;`;
            const results = db.query(sql, [`/yang/img/用户上传的头像/${req.file.filename}`, req.body.userId]);
            if (results.affectedRows === 1) {
                res.send('换头像成功！！！')
            } else {
                res.status(404).send('未找到要更新的用户');
            }


        } catch (err) {
            console.error(err);
            res.status(500).json({ code: 500, message: '服务器错误' });
        }
    }
];

// 获取农户故事
exports.farm_story = async (req, res) => {
    try {
        // 定义 SQL 语句
        const sql = `SELECT * FROM farmer_story;`;

        const results = await db.query(sql);  // 执行sql语句并且返回数据
        res.send(results)  //给用户看

    } catch (err) {
        console.error(err)
        res.send('发生错误，请稍后重试。错误信息：' + err.message);
    }
}

// 用户上传要上门回收的商品
exports.upload_goods = async (req, res) => {
    try {
        const userinfo = req.body;
        // 定义 SQL 语句
        const sql = `INSERT INTO supply_info (product_name, estimated_supply, harvest_date, supply_address, contact_phone, notes, user_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?);`;

        const results = await db.query(sql, [userinfo.product_name, userinfo.estimated_supply, userinfo.harvest_date, userinfo.supply_address, userinfo.contact_phone, userinfo.notes, userinfo.user_id]);  // 执行sql语句
        if (results.affectedRows === 1) {
            res.send('上传成功！！')
        } else {
            res.status(404).send('上传失败');
        }

    } catch (err) {
        console.error(err)
        res.send('发生错误，请稍后重试。错误信息：' + err.message);
    }
}

// 获取用户上传要上门回收的商品
exports.get_goods = async (req, res) => {
    try {
        const userinfo = req.body;
        // 定义 SQL 语句
        const sql = `SELECT * FROM supply_info WHERE user_id = ?;`;

        const results = await db.query(sql, [userinfo.user_id]);  // 执行sql语句并且返回数据
        res.send(results)  //给用户看

    } catch (err) {
        console.error(err)
        res.send('发生错误，请稍后重试。错误信息：' + err.message);
    }
}

// 添加商品上传处理函数
exports.uploadProduct = [
    multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                // 从请求体中获取userId
                const userId = req.body.userId;
                console.log('获取到的userId:', userId, '来自请求体');
                
                if (!userId) {
                    return cb(new Error('缺少用户ID'));
                }
                
                // 先创建基础目录路径
                const baseDir = path.join('E:', '农乐购项目', '农乐购源码', '静态资源托管', 'img', '用户上传的头像');
                
                // 先确保基础目录存在
                try {
                    if (!fs.existsSync(baseDir)) {
                        fs.mkdirSync(baseDir, { recursive: true });
                        console.log(`基础目录创建成功: ${baseDir}`);
                    }

                    // 然后创建用户特定的目录，使用下划线代替冒号
                    const userDir = path.join(baseDir, `userId_${userId}`);
                    if (!fs.existsSync(userDir)) {
                        fs.mkdirSync(userDir);
                        console.log(`用户目录创建成功: ${userDir}`);
                    }

                    cb(null, userDir);
                } catch (error) {
                    console.error('创建目录失败:', error);
                    cb(error);
                }
            },
            filename: function (req, file, cb) {
                // 从请求体中获取商品名称
                const productName = req.body.name;
                console.log('获取到的productName:', productName, '来自请求体');
                
                if (!productName) {
                    return cb(new Error('缺少商品名称'));
                }
                
                // 使用商品名称加时间戳作为文件名
                const timestamp = Date.now();
                const filename = `${productName}${timestamp}.jpg`;
                console.log(`保存的文件名: ${filename}`);
                cb(null, filename);
            }
        }),
        fileFilter: function (req, file, cb) {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('只允许上传图片文件！'));
            }
        }
    }).single('image'),
    
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ 
                    code: 400, 
                    message: '没有上传图片' 
                });
            }

            const userId = req.body.userId;
            const productName = req.body.name;

            // 构建图片URL路径，使用相同的命名规则
            const imageUrl = `/yang/img/用户上传的头像/userId_${userId}/${req.file.filename}`;

            // 插入商品数据到数据库
            const sql = `
                INSERT INTO products (
                    product_name,
                    product_image,
                    product_price,
                    product_category,
                    product_description,
                    origin,
                    specifications,
                    storage_method,
                    shelf_life,
                    user_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const result = await db.query(sql, [
                productName,
                imageUrl,
                req.body.price,
                req.body.category,
                req.body.description,
                req.body.origin,
                req.body.specifications,
                req.body.storage_method,
                req.body.shelf_life,
                userId
            ]);

            if (result.affectedRows === 1) {
                res.json({
                    code: 200,
                    message: '商品上传成功！',
                    data: {
                        productId: result.insertId,
                        imageUrl: imageUrl,
                        filePath: req.file.path
                    }
                });
            } else {
                res.status(500).json({
                    code: 500,
                    message: '商品上传失败'
                });
            }

        } catch (err) {
            console.error('商品上传错误:', err);
            res.status(500).json({
                code: 500,
                message: '服务器错误',
                error: err.message
            });
        }
    }
];
 

// 获取添加的商品
exports.getProduct = async (req, res) => {
    try {
        const userinfo = req.body;
        // 定义 SQL 语句
        const sql = `SELECT * FROM products WHERE user_id = ?;`;

        const results = await db.query(sql, [userinfo.user_id]);  // 执行sql语句并且返回数据
        res.send(results)  //给用户看

    } catch (err) {
        console.error(err)
        res.send('发生错误，请稍后重试。错误信息：' + err.message);
    }
}
