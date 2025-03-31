const express = require('express')
const userHandler = require('../router_handler/user')
const mailbox = require('../e-malin/index')



// 创建路由对象
const router = express.Router()


// 获取数据库信息
router.get('/yang', userHandler.yang)

// 验证用户账号密码是否正确
router.post('/logins', userHandler.logins)

// 删除数据库对应的信息
router.post('/yang/del', userHandler.del)

// 往数据中加入新数据
router.post('/yang/add', userHandler.add)

// 退出登录往数据库提交登录状态
router.post('/yang/login', userHandler.login)

// 获取邮箱验证码
router.post('/yang/mailbox', mailbox.mailbox)

// 用户重置密码
router.post('/yang/resetpassword', userHandler.resetpassword)

// 先查询是否有某个邮箱
router.post('/yang/check-email', userHandler.check_email)

// 渲染商品
router.get('/yang/farms', userHandler.farms)

// 获取用户的评论
router.get('/yang/dong/evaluations', userHandler.evaluations)


// 获取用户的收货地址
router.post('/yang/dong/address', userHandler.address)


// 获取在线客服的回复
router.get('/yang/getAuto', userHandler.getAuto)

// 获取用户购物车
router.post('/yang/shopping_cat', userHandler.shopping_cat)

// 添加数据进购物车
router.post('/yang/add_cat', userHandler.add_cat)   

// update_cart 更新购物车接口
router.post('/yang/update_cart', userHandler.update_cart) 

// delete_cart 删除购物车接口
router.post('/yang/delete_cart', userHandler.delete_cart)

// 个人中心数据的获取
router.post('/yang/UserHub', userHandler.UserHub)

// 修改个人头像
router.post('/yang/upload/avatar', userHandler.avatar)

// 获取农户故事
router.get('/yang/farm_story', userHandler.farm_story)

// 用户上传要上门回收的商品
router.post('/yang/upload_goods', userHandler.upload_goods)

// 获取用户上传要上门回收的商品
router.post('/yang/get_goods', userHandler.get_goods)

// 添加商品上传路由
router.post('/yang/upload-product', userHandler.uploadProduct); 

// 获取添加的商品
router.post('/yang/get-product', userHandler.getProduct)

// 将路由对象共享出去
module.exports = router