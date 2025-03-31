<template>
  <myTop2></myTop2>
  <div>
    <!-- 页面头部 -->
    <header>
      <div class="container header-content">
        <!-- 网站 logo -->
        <img src="http://127.0.0.1:3000/yang/img/img/logo.png" alt="" class="logo">
        <div class="search-bar">
          <!-- 搜索栏的下拉选择框 -->
          <div class="search-select">农乐购</div>
          <!-- 搜索输入框，绑定了 search 变量 -->
          <input type="text" placeholder="请输入你想要的商品" class="search-input" v-model="search" />
        </div>
        <!-- 免费开店按钮 -->
        <button class="open-store-button">免费开店卖货</button>
      </div>
    </header>
    <!-- 页面主体内容 -->
    <main class="container">
      <section class="categories">
        <h2>分类</h2>
        <!-- 分类图标网格 -->
        <div class="category-grid">
          <!-- 遍历 categories 数组生成每个分类项 -->
          <div
            class="category-item"
            v-for="category in categories"
            :key="category.text"
            @click="xiaoLogo(category.text)"
          >
            <!-- 分类图标 -->
            <img
              :src="category.image"
              :alt="category.text"
              class="category-icon"
            />
            <!-- 分类名称 -->
            <p>{{ category.text }}</p>
          </div>
        </div>
      </section>
      <section class="products">
        <div
          class="product-card"
          v-for="product in filteredProducts"
          :key="product.title"
          @click="shangping(product.id)"
        >
          <!-- 商品图片 -->
          <img :src="product.imgSrc" :alt="product.title" class="product-image" />
          <!-- 商品标题 -->
          <h3 class="product-title">{{ product.title }}</h3>
          <!-- 商品价格 -->
          <p class="product-price">
            {{ product.price }}<span class="product-unit">元</span>
          </p>
          <!-- 这是已经售出的数量 -->
          <!-- <div class="product-actions">
            <span class="sales-info">已售: {{ product.sales }}+</span>
          </div> -->
        </div>
      </section>
    </main>
    <!-- 二维码区域 -->
    <div class="qr-code">
      <!-- 二维码图片 -->
      <img src="https://via.placeholder.com/100x100.png?text=扫码下载" alt="QR Code" />
      <!-- 下载提示文字 -->
      <p>下载农乐购 APP</p>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { reactive, ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import myTop2 from './ShopHomePage/myTop2.vue';



// 定义一个响应式数组，用于存储分类信息
const categories = reactive([
  { text: '水果', image: 'http://127.0.0.1:3000/yang/img/小logo/水果.png' },
  { text: '蔬菜', image: 'http://127.0.0.1:3000/yang/img/小logo/蔬菜.png' },
  { text: '禽畜肉蛋', image: 'http://127.0.0.1:3000/yang/img/小logo/禽畜肉蛋.png' },
  { text: '农副加工', image: 'http://127.0.0.1:3000/yang/img/小logo/农副加工.png' },
  { text: '粮油米面', image: 'http://127.0.0.1:3000/yang/img/小logo/粮油米面.png' },
  { text: '种子种苗', image: 'http://127.0.0.1:3000/yang/img/小logo/种子种苗.png' },
]);

// 定义点击小图标跳转
const xiaoLogo = (text) => {
  router.push(`/LookAll?category=${text}`);
}

// 定义一个引用，用于存储商品数据，初始为空数组
const products = ref([]);

// 定义一个输入框的引用，用于存储用户输入的搜索关键词
let search = ref('');

// 添加一个计算属性，用于根据搜索关键词筛选商品
const filteredProducts = computed(() => {
  // 如果搜索框为空，则返回所有商品
  if (!search.value) {
    return products.value;
  }
  // 否则，返回标题中包含搜索关键词（不区分大小写）的商品
  return products.value.filter(product =>
    product.title.toLowerCase().includes(search.value.toLowerCase())
  );
});

// 在组件挂载后执行的生命周期函数
onMounted(() => {
  axios({
    url: '/api/yang/farms',
    method: 'GET',
  }).then(result => {
    // 将获取到的商品数据赋值给 products 引用
    products.value = result.data;
  });
});

// 进入商品详情案例
const router = useRouter();
const shangping = (id) => {
  router.push(`/GoodsDetail/${id}`);
}
</script>
  <style scoped>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
  }
  header {
    background-color: #fff;
    padding: 10px 0;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .logo {
    width: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
  }
  .search-bar {
    display: flex;
    align-items: center;
  }
  .search-select {
    background-color: #4CAF50;
    color: white;
    padding: 8px;
    border: none;
    border-radius: 4px 0 0 4px;
  }
  .search-input {
    padding: 10px;
    width: 300px;
    border: 2px solid #4CAF50;
    border-left: none;
  }
  .open-store-button {
    background-color: #FF8C00;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  nav {
    background-color: #fff;
    margin-top: 10px;
    padding: 10px 0;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  .nav-list {
    display: flex;
    justify-content: space-between;
    list-style-type: none;
  }
  .nav-item {
    color: #333;
    text-decoration: none;
  }
  .categories {
    background-color: #fff;
    margin-top: 20px;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  .category-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 10px;
    margin-top: 10px;
  }
  .category-item {
    text-align: center;
    cursor: pointer;
  }
  .category-icon {
    width: 50px;
    height: 50px;
    margin-bottom: 5px;
    border-radius: 50%;
  }
  .products {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-top: 20px;
  }
  .product-card {
    background-color: #fff;
    border-radius: 4px;
    padding: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease; /* 添加过渡效果 */
  }
  .product-card:hover {
    transform: translateY(-5px); /* 悬停时向上移动 */
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); /* 增强阴影效果 */
  }
  .product-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 4px;
    transition: all 0.3s ease; /* 添加过渡效果 */
  }
  .product-card:hover .product-image {
    transform: scale(1.05); /* 悬停时图片稍微放大 */
  }
  .product-title {
    margin: 10px 0;
    font-size: 14px;
    height: 40px;
    overflow: hidden;
    transition: color 0.3s ease; /* 添加颜色过渡效果 */
  }
  .product-card:hover .product-title {
    color: #4CAF50; /* 悬停时改变标题颜色 */
  }
  .product-price {
    color: #FF4500;
    font-weight: bold;
  }
  .product-unit {
    color: #999;
    font-size: 12px;
  }
  .product-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
  }
  .sales-info {
    color: #999;
    font-size: 12px;
  }
  .qr-code {
    position: fixed;
    right: 20px;
    bottom: 20px;
    background-color: #fff;
    padding: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  .qr-code img {
    width: 100px;
    height: 100px;
  }
  .qr-code p {
    margin-top: 5px;
    font-size: 12px;
  }
  @media (max-width: 768px) {
   .category-grid {
      grid-template-columns: repeat(4, 1fr);
    }
   .products {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  </style>
