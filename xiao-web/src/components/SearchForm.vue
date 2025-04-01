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
        <h2 class="section-title">分类</h2>
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
            <div class="category-icon-wrapper">
              <img
                :src="category.image"
                :alt="category.text"
                class="category-icon"
              />
            </div>
            <!-- 分类名称 -->
            <p class="category-name">{{ category.text }}</p>
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
  padding: 5px 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo {
  width: 120px; /* 放大logo */
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}
.search-bar {
  display: flex;
  align-items: center;
  flex-grow: 1;
  margin: 0 20px;
}
.search-select {
  background-color: #4CAF50;
  color: white;
  padding: 0px 5px;
  border: none;
  border-radius: 4px 0 0 4px;
  font-size: 16px;
}
.search-input {
  padding: 10px 15px;
  width: 100%;
  border: 2px solid #4CAF50;
  border-left: none;
  font-size: 16px;
}
.open-store-button {
  background-color: #FF8C00;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
}
.open-store-button:hover {
  background-color: #FF6F00;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 分类部分样式 */
.categories {
  background-color: #fff;
  margin-top: 30px;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.section-title {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}
.category-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr); /* 6个分类正好占满一行 */
  gap: 20px;
}
.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}
.category-item:hover {
  transform: translateY(-5px);
}
.category-icon-wrapper {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  border-radius: 50%;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}
.category-item:hover .category-icon-wrapper {
  background-color: #e8f5e9;
}
.category-icon {
  width: 50px;
  height: 50px;
  object-fit: contain;
}
.category-name {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  transition: color 0.3s ease;
}
.category-item:hover .category-name {
  color: #4CAF50;
}

/* 商品部分样式 */
.products {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 30px;
}
.product-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}
.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 6px;
  transition: all 0.3s ease;
}
.product-card:hover .product-image {
  transform: scale(1.05);
}
.product-title {
  margin: 15px 0 10px;
  font-size: 15px;
  height: 40px;
  overflow: hidden;
  color: #333;
  transition: color 0.3s ease;
}
.product-card:hover .product-title {
  color: #4CAF50;
}
.product-price {
  color: #FF4500;
  font-weight: bold;
  font-size: 18px;
}
.product-unit {
  color: #999;
  font-size: 14px;
  margin-left: 2px;
}

/* 二维码区域 */
.qr-code {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.3s ease;
}
.qr-code:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}
.qr-code img {
  width: 100px;
  height: 100px;
}
.qr-code p {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
  }
  .search-bar {
    width: 100%;
    margin: 10px 0;
  }
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .products {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .products {
    grid-template-columns: 1fr;
  }
}
</style>