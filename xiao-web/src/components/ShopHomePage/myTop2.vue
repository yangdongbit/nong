<template>
  <div>
    <div class="shortcut">
      <div class="wrapper">
        <ul>
          <li v-if="Object.keys(loginStore.Loginuser).length !== 0">
              <router-link to="/"
                >欢迎您，{{ loginStore.Loginuser.name }}</router-link
              >
          </li>
          <li v-else><router-link to="/logins">请先登录</router-link></li>
          <li  v-if="Object.keys(loginStore.Loginuser).length !== 0">
            <a href="#" @click="Logout">退出登录</a>
          </li>
          <li><router-link to="/order">我的订单</router-link></li>
          <li><router-link to="/MySpace">个人中心</router-link></li>
          <li><router-link to="/ShopInfo">我要卖货</router-link></li>
          <li><router-link to="/ChatWindow">消息列表</router-link></li>
          
          <li>
            <router-link to="/">返回首页</router-link>
          </li>
        </ul>
      </div>
    </div>

  
  </div>
</template>

<script setup>
import axios from "axios";
import { useLoginStore } from "../../nweStore/logins";
// 这是pinia数据库
const loginStore = useLoginStore();
console.log(
  loginStore.Loginuser,
  Object.keys(loginStore.Loginuser).length !== 0
); // 从pinia获取过来当前用户登录的数据

// 退出登录
const Logout = () => {
  // console.log(loginStore.Loginuser.id);  登录用户的id
  axios({
    url: '/api/yang/login',
    method: 'post',
    data: {
      number: 0,
      id: loginStore.Loginuser.id
    }
  }).then(result => {
    console.log(result);
    
  })
  
  loginStore.Loginuser = {};

};
</script>

<style scoped>
.wrapper {
  width: 1240px;
  margin: 0 auto;
}

/* 导航 */
.shortcut {
  height: 60px;
  background-color: #8acd58;
}

.shortcut .wrapper {
  display: flex;
  justify-content: flex-end;
  height: 60px;
}

.shortcut .wrapper ul {
  display: flex;
  line-height: 60px;
}

.shortcut li a {
  padding: 0 15px;
  border-right: 1px solid #999;
  font-size: 14px;
  color: #fff;
}

.shortcut li:last-child {
  border-right: 0;
}

.shortcut li .iconfont {
  margin-right: 4px;
  vertical-align: middle;
}

.shortcut li .login {
  color: #5eb69c;
}
.brand .wrapper {
  overflow: hidden;
  height: 468px;
}

.banner .wrapper {
  position: relative;
  height: 500px;
  background-color: pink;
  overflow: hidden;
  /* 超出父级就隐藏 */
}

.customer-service-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 300px;
}

.dialog-content h3 {
  margin-top: 0;
}

.dialog-content button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #5eb69c;
  color: white;
  border: none;
  cursor: pointer;
}
</style>