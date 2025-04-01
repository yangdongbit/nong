<template>
  <div class="header wrapper">
    <!-- logo -->
    <div class="logo">
      <h1>
        <a href="#">
          <img src="../img/logo.png" alt="" />
        </a>
      </h1>
    </div>
    <!-- 导航 -->
    <div class="nav">
      <ul>
        <li><router-link to="ShopHomePage">首页</router-link></li>
        <li><router-link to="LookAll?category=水果">水果</router-link></li>   
        <li><router-link to="LookAll?category=蔬菜">蔬菜</router-link></li>
        <li><router-link to="LookAll?category=农副产品">农副加工</router-link></li>
        <li><router-link to="LookAll?category=粮油米面">粮油米面</router-link></li>
        <li><router-link to="LookAll?category=种子种苗">种子种苗</router-link></li>
        <li><router-link to="LookAll?category=禽畜肉蛋" target="_blank">禽畜肉蛋</router-link></li>
      </ul>
    </div>
    
    <!-- 购物车 -->
    <div class="search" @click="search">
      <span class="iconfont icon-fangdajing"></span>
      <input type="text" placeholder="搜一搜" />
    </div>
    <!-- 购物车 -->
    <div class="cart">
      <router-link to="/shoppingCart">
        <span class="iconfont icon-gouwuche"></span>
      </router-link>

      <i v-if="cartCount > 0">
        {{ displayCount }}
      </i>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { onMounted, computed } from 'vue';
import { useLoginStore } from "../../nweStore/logins";
import { useCatStore } from "../../nweStore/shop_cat";

const router = useRouter();
const loginStore = useLoginStore();
const catStore = useCatStore();

const search = () => {
  router.push('/SearchForm');
}

// 计算购物车数量
const cartCount = computed(() => {
  return catStore.shopCat.length;
});

// 计算显示的数量
const displayCount = computed(() => {
  return cartCount.value > 99 ? '99+' : cartCount.value;
});

onMounted(async () => {
  await loginStore.getLoginuser();
  await catStore.getshopCat();
});
</script>

<style scoped>
.header {
  display: flex;
  margin-top: 22px;
  margin-bottom: 22px;
  height: 88px;
}

/* logo */
.logo {
  width: 200px;
  height: 88px;
}

.logo a {
  display: block;
  width: 200px;
  height: 88px;
}
.logo a img {
  width: 100%;  /* 改为宽度100%适应容器 */
  height: auto;  /* 高度自动保持比例 */
  max-height: 88px;  /* 最大高度限制 */
  object-fit: contain;  /* 保持图片比例 */
}

/* 导航 */

.nav {
  margin-top: 33px;
  margin-right: 28px;
}

.nav ul {
  display: flex;
}
.nav li {
  margin-right: 47px;
}
.nav li a {
  padding-bottom: 10px;
}
.nav li a:hover {
  border-bottom: 2px solid #5eb69c;
  color: #5eb69c;
}

/* 搜索框样式优化 */
.search {
  display: flex;
  align-items: center;
  margin-top: 33px;
  margin-right: 45px;
  width: 170px;
  height: 34px;
  border-radius: 17px;  /* 设置为高度的一半，实现圆角效果 */
  border: 2px solid #a5a5a5;
  padding: 0 12px;     /* 添加内边距 */
  transition: all 0.3s ease;  /* 添加过渡效果 */
}

.search:hover {
  border-color: #5eb69c;  /* 悬浮时改变边框颜色 */
  box-shadow: 0 2px 8px rgba(94, 182, 156, 0.1);  /* 添加阴影效果 */
}

.search .iconfont {
  margin-right: 8px;
  font-size: 18px;
  color: #a5a5a5;
  transition: color 0.3s ease;
}

.search:hover .iconfont {
  color: #5eb69c;  /* 悬浮时改变图标颜色 */
}

.search input {
  width: 0;
  flex: 1;
  border: none;  /* 移除输入框边框 */
  outline: none; /* 移除输入框焦点边框 */
  background: transparent;  /* 背景透明 */
}

.search input::placeholder {
  font-size: 14px;
  color: #a5a5a5;
  transition: color 0.3s ease;
}

.search:hover input::placeholder {
  color: #5eb69c;  /* 悬浮时改变占位符颜色 */
}

/* 购物车 */

.cart {
  position: relative;
  margin-top: 32px;
}
.cart .iconfont {
  font-size: 24px;
  cursor: pointer;
}
.cart i {
  position: absolute;
  top: -5px;
  left: 15px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background-color: #e26237;
  border-radius: 8px;
  color: #fffefe;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  font-style: normal;
}
/* 完结2 */

/* 版心 */
.wrapper {
  width: 1240px;
  margin: 0 auto;
}
</style>