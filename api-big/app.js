// 导入 express 模块
const express = require('express');
// 创建 express 的服务器实例
const app = express();
const http = require('http').createServer(app);

// 导入 cors 中间件
const cors = require('cors');
// 将 cors 注册为全局中间件
app.use(cors());

// 配置解析 application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 导入并注册用户路由模块
const userRouter = require('./router/use');
app.use('/api', userRouter);

// 导入并注册好友路由模块
const friendRouter = require('./router_handler/friend');
app.use(friendRouter);  // 直接使用，因为路由中已经包含了 /api 前缀

// 导入并注册私聊消息路由模块
const privateMessageRouter = require('./router_handler/private_message');
app.use(privateMessageRouter);

// 导入并注册支付路由模块
const payRouter = require('./router_handler/pay');
app.use('/api', payRouter);

// 导入并注册公共消息路由模块
const publicMessageRouter = require('./router_handler/public_message');
app.use(publicMessageRouter);

// 导入并注册后台模块
const AdminPro = require('./router_handler/AdminPro');
const AdminPro_2 = require('./router_handler/AdminPro_2');
const AdminPro_3 = require('./router_handler/AdminPro_3');
app.use(AdminPro);
app.use(AdminPro_2);
app.use(AdminPro_3);

// 引入并设置WebSocket服务器
const setupWebSocket = require('./router_handler/websocket');
setupWebSocket(http);

// 调用 app.listen 方法，指定端口号并启动web服务器
http.listen(3007, function () {
  console.log('api server running at http://127.0.0.1:3007');
}); 