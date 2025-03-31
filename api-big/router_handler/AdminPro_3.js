const express = require('express');
const router = express.Router();
const { db } = require('../db/index');
const { pool } = require('../db/index');

// 管理员验证中间件
const checkAdmin = async (req, res, next) => {
  try {
    // 从请求头获取用户ID
    const userId = req.headers['user-id'];
    
    if (!userId) {
      return res.send({
        status: 1,
        message: '请先登录'
      });
    }

    // 查询用户是否是管理员
    const [rows] = await pool.execute(
      'SELECT administrator FROM users WHERE id = ?',
      [userId]
    );

    if (!rows.length || rows[0].administrator !== '1') {
      return res.send({
        status: 1,
        message: '无权限操作，需要管理员权限'
      });
    }

    next();
  } catch (error) {
    console.error('验证管理员权限失败:', error);
    res.send({
      status: 1,
      message: '验证权限失败'
    });
  }
};

// 农户故事相关接口 - 只保留更新和获取单个故事的功能
router.put('/api/yang/farm_story/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { title, farmer_name, location, experience, content } = req.body

    // 参数验证
    if (!title || !farmer_name || !location || !experience || !content) {
      return res.send({
        status: 1,
        message: '缺少必要的参数'
      })
    }

    // SQL 语句 - 只包含实际存在的字段
    const sql = `
      UPDATE webyang.farmer_story 
      SET title = ?, 
          farmer_name = ?, 
          location = ?, 
          experience = ?, 
          content = ?
      WHERE id = ?
    `

    // 执行 SQL - 使用 pool 而不是 db
    const [result] = await pool.execute(sql, [
      title,
      farmer_name,
      location,
      experience,
      content,
      id
    ])

    if (result.affectedRows !== 1) {
      return res.send({
        status: 1,
        message: '更新农户故事失败'
      })
    }

    // 更新成功
    res.send({
      status: 0,
      message: '更新农户故事成功'
    })

  } catch (error) {
    console.error('更新农户故事失败:', error)
    res.send({
      status: 1,
      message: '更新农户故事失败'
    })
  }
})

router.get('/api/yang/farm_story/:id', async (req, res) => {
  try {
    const { id } = req.params
    const sql = `
      SELECT 
        id, title, farmer_name, farmer_image, 
        location, experience, content, image,
        products
      FROM webyang.farmer_story
      WHERE id = ?
    `

    // 执行 SQL - 使用 pool 而不是 db
    const [rows] = await pool.execute(sql, [id])

    if (rows.length === 0) {
      return res.send({
        status: 1,
        message: '农户故事不存在'
      })
    }

    res.send({
      status: 0,
      message: '获取农户故事成功',
      data: rows[0]
    })

  } catch (error) {
    console.error('获取农户故事失败:', error)
    res.send({
      status: 1,
      message: '获取农户故事失败'
    })
  }
})

// 自动回复管理接口


// 添加自动回复
router.post('/api/yang/auto_reply', checkAdmin, async (req, res) => {
  try {
    const { trigger_keyword, reply_content } = req.body;
    
    if (!trigger_keyword || !reply_content) {
      return res.send({
        status: 1,
        message: '缺少必要参数'
      });
    }

    const sql = `INSERT INTO auto_reply_table (trigger_keyword, reply_content) VALUES (?, ?)`;
    const [result] = await pool.execute(sql, [trigger_keyword, reply_content]);

    if (result.affectedRows !== 1) {
      return res.send({
        status: 1,
        message: '添加自动回复失败'
      });
    }

    res.send({
      status: 0,
      message: '添加自动回复成功'
    });
  } catch (error) {
    console.error('添加自动回复失败:', error);
    res.send({
      status: 1,
      message: '添加自动回复失败'
    });
  }
});

// 更新自动回复
router.put('/api/yang/auto_reply/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { trigger_keyword, reply_content } = req.body;

    if (!trigger_keyword || !reply_content) {
      return res.send({
        status: 1,
        message: '缺少必要参数'
      });
    }

    const sql = `UPDATE auto_reply_table SET trigger_keyword = ?, reply_content = ? WHERE id = ?`;
    const [result] = await pool.execute(sql, [trigger_keyword, reply_content, id]);

    if (result.affectedRows !== 1) {
      return res.send({
        status: 1,
        message: '更新自动回复失败'
      });
    }

    res.send({
      status: 0,
      message: '更新自动回复成功'
    });
  } catch (error) {
    console.error('更新自动回复失败:', error);
    res.send({
      status: 1,
      message: '更新自动回复失败'
    });
  }
});

// 删除自动回复
router.delete('/api/yang/auto_reply/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `DELETE FROM auto_reply_table WHERE id = ?`;
    const [result] = await pool.execute(sql, [id]);

    if (result.affectedRows !== 1) {
      return res.send({
        status: 1,
        message: '删除自动回复失败'
      });
    }

    res.send({
      status: 0,
      message: '删除自动回复成功'
    });
  } catch (error) {
    console.error('删除自动回复失败:', error);
    res.send({
      status: 1,
      message: '删除自动回复失败'
    });
  }
});

// 删除私信消息
router.delete('/api/yang/private_message/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `DELETE FROM private_messages WHERE id = ?`;
    const [result] = await pool.execute(sql, [id]);

    if (result.affectedRows !== 1) {
      return res.send({
        status: 1,
        message: '删除私信失败'
      });
    }

    res.send({
      status: 0,
      message: '删除私信成功'
    });
  } catch (error) {
    console.error('删除私信失败:', error);
    res.send({
      status: 1,
      message: '删除私信失败'
    });
  }
});

// 删除公共消息
router.delete('/api/yang/public_message/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `DELETE FROM public_messages WHERE id = ?`;
    const [result] = await pool.execute(sql, [id]);

    if (result.affectedRows !== 1) {
      return res.send({
        status: 1,
        message: '删除公共消息失败'
      });
    }

    res.send({
      status: 0,
      message: '删除公共消息成功'
    });
  } catch (error) {
    console.error('删除公共消息失败:', error);
    res.send({
      status: 1,
      message: '删除公共消息失败'
    });
  }
});

// 批量删除私信消息
router.delete('/api/yang/private_messages', checkAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.send({
        status: 1,
        message: '请选择要删除的消息'
      });
    }

    // 修改 SQL 语句，使用 IN 和问号占位符的正确格式
    const sql = `DELETE FROM private_messages WHERE id IN (${ids.map(() => '?').join(',')})`;
    const [result] = await pool.execute(sql, ids);

    if (result.affectedRows === 0) {
      return res.send({
        status: 1,
        message: '删除私信失败'
      });
    }

    res.send({
      status: 0,
      message: `成功删除 ${result.affectedRows} 条私信`
    });
  } catch (error) {
    console.error('批量删除私信失败:', error);
    res.send({
      status: 1,
      message: '删除私信失败'
    });
  }
});

// 批量删除公共消息
router.delete('/api/yang/public_messages', checkAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.send({
        status: 1,
        message: '请选择要删除的消息'
      });
    }

    // 修改 SQL 语句，使用 IN 和问号占位符的正确格式
    const sql = `DELETE FROM public_messages WHERE id IN (${ids.map(() => '?').join(',')})`;
    const [result] = await pool.execute(sql, ids);

    if (result.affectedRows === 0) {
      return res.send({
        status: 1,
        message: '删除公共消息失败'
      });
    }

    res.send({
      status: 0,
      message: `成功删除 ${result.affectedRows} 条公共消息`
    });
  } catch (error) {
    console.error('批量删除公共消息失败:', error);
    res.send({
      status: 1,
      message: '删除公共消息失败'
    });
  }
});

module.exports = router; 
