const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '123456',
  database: 'webyang',
};
 
// 创建连接池
const pool = mysql.createPool(dbConfig);

// 创建一个包装了连接池的 db 对象
const db = {
  query: async (sql, values) => {
    try {
      const [rows] = await pool.execute(sql, values);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
};

// 导出数据库连接池和 db 对象
module.exports = {
  pool,
  db,
};
