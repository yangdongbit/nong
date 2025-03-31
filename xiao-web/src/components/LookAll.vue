<template>
  <div class="look-all">
    <!-- 头部区域 -->
    <header>
      <div class="container header-content">
        <div class="header-left">
          <router-link to="/ShopHomePage" class="logo-link">
            <img src="./img/logo.png" alt="农乐购" class="logo-img" />
            <span class="logo-text">农乐购</span>
          </router-link>
        </div>
        <div class="header-right">
          <div class="category-badge">
            <span class="category-icon">📦</span>
            <span class="category-text">{{ category }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 主体内容区域 -->
    <div class="container main-content">
      <!-- 搜索栏和返回首页按钮的容器 -->
      <div class="search-nav-container">
        <!-- 返回首页按钮 -->
        <router-link to="/ShopHomePage" class="home-button">
          <span class="home-icon">🏠</span>
          <span class="home-text">返回首页</span>
        </router-link>

        <div class="search-sort-wrapper">
          <!-- 搜索栏 -->
          <div class="search-bar">
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input type="text" v-model="searchQuery" placeholder="请输入您要查找的产品" />
              <span class="camera-icon" @click="handleImageSearch" title="拍照识图">📸</span>
              <button @click="search" class="search-button">搜索</button>
            </div>
          </div>

          <!-- 排序选择器 -->
          <div class="sort-wrapper">
            <select v-model="sortOrder" class="sort-select" @change="handleSort">
              <option value="default">默认排序</option>
              <option value="asc">价格从低到高</option>
              <option value="desc">价格从高到低</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 修改筛选标签区域 -->
      <div class="filter-tags-container">
        <div class="filter-tags">
          <label class="filter-checkbox">
            <input type="checkbox" v-model="filters.refund" />
            <span class="checkbox-custom"></span>
            <span class="tag-icon">✓</span>
            <span class="tag-text">七天无理由退货</span>
          </label>

          <label class="filter-checkbox">
            <input type="checkbox" v-model="filters.freeShipping" />
            <span class="checkbox-custom"></span>
            <span class="tag-icon">🚚</span>
            <span class="tag-text">包邮</span>
          </label>

          <label class="filter-checkbox">
            <input type="checkbox" v-model="filters.homeDelivery" />
            <span class="checkbox-custom"></span>
            <span class="tag-icon">🏠</span>
            <span class="tag-text">送货上门</span>
          </label>

          <label class="filter-checkbox">
            <input type="checkbox" v-model="filters.subsidy" />
            <span class="checkbox-custom"></span>
            <span class="tag-icon">💰</span>
            <span class="tag-text">百亿补贴</span>
          </label>

          <label class="filter-checkbox">
            <input type="checkbox" v-model="filters.flash" />
            <span class="checkbox-custom"></span>
            <span class="tag-icon">⚡</span>
            <span class="tag-text">秒杀</span>
          </label>

          <label class="filter-checkbox">
            <input type="checkbox" v-model="filters.gift" />
            <span class="checkbox-custom"></span>
            <span class="tag-icon">🎁</span>
            <span class="tag-text">赠品</span>
          </label>
        </div>
      </div>

      <!-- 产品列表区域 -->
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="product-grid">
        <div
          class="product-card"
          v-for="product in filteredProducts"
          :key="product.id"
          @click="tianzhuang(product.id)"
        >
          <div class="pic">
            <img :src="product.imgSrc" :alt="product.title" />
            <div class="sales-badge" v-if="product.sales_volume">销量: {{ product.sales_volume }}</div>
          </div>
          <div class="txt">
            <div class="title-desc">{{ product.title }}</div>
            <h4>{{ product.product_name }}</h4>
            <div class="price-row">
              <p class="price">
                <span class="currency">￥</span>
                <span class="amount">{{ product.price }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <myFooter></myFooter>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import myFooter from "./myFooter.vue";

// 获取当前路由信息
const route = useRoute();
// 搜索关键词输入框的双向绑定变量
const searchQuery = ref("");
// 产品列表数据
const products = ref([]);
const loading = ref(true);
const error = ref(null);

let intervalId;

// 当前页面的产品类别
const category = ref("");
// 产品数量
const count = ref(0);

// 添加排序相关的响应式变量
const sortOrder = ref("default");

// 添加筛选状态
const filters = ref({
  refund: false,
  freeShipping: false,
  homeDelivery: false,
  subsidy: false,
  flash: false,
  gift: false
});

// 计算属性，过滤产品列表
const filteredProducts = computed(() => {
  let filtered = products.value.filter(product =>
    product.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );

  // 根据选择的排序方式进行排序
  if (sortOrder.value !== "default") {
    filtered.sort((a, b) => {
      const priceA = parseFloat(a.price);
      const priceB = parseFloat(b.price);
      return sortOrder.value === "asc" ? priceA - priceB : priceB - priceA;
    });
  }

  return filtered;
});

// 在组件挂载时执行
onMounted(() => {
  // 从路由的查询参数中获取类别，如果没有则默认设置为'全部'
  category.value = route.query.category || "全部";
  // 从路由的查询参数中获取产品数量，如果没有则默认为 0
  count.value = parseInt(route.query.count) || 0;

  // 获取数据
  fetchProducts();
});

// 获取数据
const fetchProducts = async () => {
  try {
    const response = await axios.get("/api/yang/farms");
    if (category.value === "全部") {
      products.value = Object.values(response.data);
    } else {
      products.value = Object.values(response.data).filter(
        item => item.type === category.value
      );
      // console.log(response.data);
    }
    loading.value = false;
  } catch (err) {
    console.error("Error fetching data:", err);
    error.value = "获取数据失败，请稍后再试";
    loading.value = false;
  }
};

// 在组件卸载时清除 interval
onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

// 搜索功能函数
const search = () => {
  console.log("Searching for:", searchQuery.value);
  // 搜索功能已通过 computed 属性 filteredProducts 实现
};

// 进行跳转
// 获取 router 实例
const router = useRouter();
const tianzhuang = id => {
  router.push(`/GoodsDetail/${id}`);
};

// 处理排序变化的函数
const handleSort = () => {
  console.log("Sorting by:", sortOrder.value);
};

// 添加拍照识图处理函数
const handleImageSearch = () => {
  console.log("启动拍照识图功能");
  // 这里可以添加拍照识图的具体实现
};
</script>

<style scoped>
.look-all {
  font-family: "Roboto", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f8f9fa;
  color: #333;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: linear-gradient(135deg, #8acd58, #bdf98c);
  padding: 15px 0;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
}

.container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}
.container img {
  width: 100px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: transform 0.3s ease;
}

.logo-link:hover {
  transform: translateY(-2px);
}

.logo-img {
  width: 45px;
  height: 45px;
  object-fit: contain;
  margin-right: 12px;
}

.logo-text {
  font-size: 28px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;
}

.header-right {
  display: flex;
  align-items: center;
}

.category-badge {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 20px;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.category-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.category-icon {
  font-size: 20px;
  margin-right: 8px;
}

.category-text {
  font-size: 16px;
  font-weight: 600;
  color: #2ac050;
}

.main-content {
  flex-grow: 1;
  padding: 40px 0;
  max-width: 1400px;
  margin: 0 auto;
}

.search-nav-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto 40px;
}

.search-sort-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 70%;
}

.home-button {
  display: flex;
  align-items: center;
  padding: 12px 25px;
  background: linear-gradient(45deg, #b5f89a, #abeeff);
  border-radius: 50px;
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.2);
  height: 47px; /* 与搜索框高度保持一致 */
  min-width: 140px;
}

.home-icon {
  font-size: 20px;
  margin-right: 8px;
  transition: transform 0.3s ease;
}

.home-text {
  letter-spacing: 1px;
}

.home-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 204, 113, 0.3);
  background: linear-gradient(45deg, #a9f478, #2ecc71);
}

.home-button:hover .home-icon {
  transform: scale(1.1);
}

.home-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(46, 204, 113, 0.2);
}

.search-bar {
  flex: 1;
  display: flex;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 30px;
  padding: 0 8px 0 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-icon {
  font-size: 20px;
  color: #8cd74a;
  margin-right: 10px;
  cursor: pointer;
}

.search-bar input {
  flex: 1;
  width: auto;
  padding: 15px 10px;
  border: none;
  font-size: 16px;
  background: transparent;
}

.search-bar input:focus {
  outline: none;
}

.camera-icon {
  font-size: 20px;
  color: #8cd74a;
  margin: 0 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.camera-icon:hover {
  transform: scale(1.1);
  color: #7ed957;
}

.search-button {
  padding: 10px 25px;
  margin-left: 5px;
  background: linear-gradient(45deg, #bcfab0, #82c536);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.search-button:hover {
  background: linear-gradient(45deg, #82c536, #bcfab0);
  transform: translateX(2px);
}

/* 添加搜索框焦点效果 */
.search-input-wrapper:focus-within {
  box-shadow: 0 0 0 2px rgba(140, 215, 74, 0.2);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  padding: 20px 40px;
  justify-items: center;
  align-items: start;
}

.product-card {
  width: 100%;
  max-width: 300px;
  height: 440px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
  cursor: pointer;
  margin: 0 auto;
}

.pic {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
}

.pic img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.sales-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.txt {
  padding: 12px 16px;
  height: 136px;
  display: flex;
  flex-direction: column;
}

.title-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  line-clamp: 1;
  box-orient: vertical;
}

.txt h4 {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 12px 0;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  box-orient: vertical;
}

.price-row {
  margin-top: auto;
}

.price {
  display: flex;
  align-items: baseline;
  color: #ff4d4f;
}

.currency {
  font-size: 14px;
  margin-right: 2px;
}

.amount {
  font-size: 24px;
  font-weight: bold;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.product-card:hover .pic img {
  transform: scale(1.05);
}

@media (min-width: 1400px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1399px) and (min-width: 1100px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1099px) and (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .product-grid {
    grid-template-columns: repeat(1, 1fr);
    padding: 20px;
  }
}

footer {
  background-color: #34495e;
  color: #ecf0f1;
  text-align: center;
  padding: 30px 0;
  margin-top: auto;
}

footer p {
  font-size: 16px;
  opacity: 0.8;
}

.loading,
.error,
.no-products {
  text-align: center;
  padding: 20px;
  font-size: 18px;
}

.error {
  color: red;
}

.sort-wrapper {
  min-width: 140px;
  height: 47px; /* 与搜索框高度保持一致 */
  display: flex;
  align-items: center;
}

.sort-label {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.sort-select {
  width: 100%;
  height: 100%;
  background-color: #8cd74a;
  padding: 0 15px;
  border: none;
  border-radius: 25px;
  color: rgb(66, 59, 59);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  appearance: none;
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  padding-right: 35px;
  /* box-shadow: 0 4px 15px rgba(131, 231, 42, 0.2); */
}

.sort-select:hover {
  background: linear-gradient(45deg, #82c536, #bcfab0);
  box-shadow: 0 6px 20px rgba(131, 231, 42, 0.3);
}

.filter-tags-container {
  width: 100%;
  max-width: 1000px;
  margin: -20px auto 20px;
  padding: 0 40px;
}

.filter-tags {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: white;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
}

.filter-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox-custom {
  position: relative;
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-right: 8px;
  border: 2px solid #8cd74a;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.filter-checkbox:hover .checkbox-custom {
  border-color: #7ed957;
}

.filter-checkbox input:checked + .checkbox-custom {
  background: #8cd74a;
  border-color: #8cd74a;
}

.filter-checkbox input:checked + .checkbox-custom::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.tag-icon {
  margin-right: 6px;
  font-size: 16px;
}

.tag-text {
  color: #666;
  transition: color 0.3s ease;
}

.filter-checkbox:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.filter-checkbox input:checked ~ .tag-text {
  color: #8cd74a;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .filter-tags-container {
    padding: 0 20px;
  }

  .filter-tags {
    gap: 10px;
  }

  .filter-checkbox {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
