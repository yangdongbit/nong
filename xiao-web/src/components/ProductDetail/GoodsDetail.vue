<template>
  <div>
    <header class="header">
      <h1>农乐购</h1>
    </header>

    <div class="container">
      <router-link to="/ShopHomePage" class="back-btn">返回首页</router-link>
      <div class="product-detail">
        <ProductImages 
          :product-name="farms?.name"
          :images="farms"
        />
        <div class="product-info-container">
          <ShopInfo />
          <ProductInfo 
            :product="farms"
            @show-message="showMessage"
          />
        </div>
      </div>

      <div class="product-details-tabs">
        <div class="tab-buttons">
          <h3
            v-for="tab in tabs"
            :key="tab.key"
            class="section-title"
            :class="{ active: currentTab === tab.key }"
            @click="currentTab = tab.key"
          >
            {{ tab.name }}
          </h3>
        </div>
        <div class="tab-content">
          <ProductDescription
            v-if="currentTab === 'description'"
            :product="farms"
          />
          <ProductSpecs
            v-else-if="currentTab === 'specs'"
            :product="farms"
          />
          <ProductReviews
            v-else-if="currentTab === 'reviews'"
            :evaluations="evaluations"
            :current-image="currentImage"
          />
          <ProductRecommendations
            v-else-if="currentTab === 'recommendations'"
            :product="farms"
            @show-message="showMessage"
          />
        </div>
      </div>
    </div>

    <!-- 添加提示框 -->
    <transition name="message-fade">
      <div v-if="messageVisible" class="message-box" :class="messageType">
        <span class="message-icon">{{ messageIcon }}</span>
        <span class="message-content">{{ messageText }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useEvaluationsStore } from "../../nweStore/evaluations";
import ProductImages from './GoodsDetail/ProductImages.vue';
import ShopInfo from './GoodsDetail/ShopInfo.vue';
import ProductInfo from './GoodsDetail/ProductInfo.vue';
import ProductDescription from './GoodsDetail/ProductDescription.vue';
import ProductSpecs from './GoodsDetail/ProductSpecs.vue';
import ProductReviews from './GoodsDetail/ProductReviews.vue';
import ProductRecommendations from './GoodsDetail/ProductRecommendations.vue';

const router = useRouter();
const route = useRoute();
const evaluationsStore = useEvaluationsStore();
const farms = ref({});
const evaluations = ref([]);
const currentTab = ref("description");

// 标签页配置
const tabs = [
  { key: "description", name: "商品详情" },
  { key: "specs", name: "规格参数" },
  { key: "reviews", name: "用户评价" },
  { key: "recommendations", name: "相关推荐" }
];

// 消息提示相关
const messageVisible = ref(false);
const messageText = ref("");
const messageType = ref("info");
const messageIcon = computed(() => {
  switch (messageType.value) {
    case "success":
      return "✓";
    case "error":
      return "✕";
    case "warning":
      return "!";
    default:
      return "i";
  }
});

const showMessage = (text, type = "info") => {
  messageText.value = text;
  messageType.value = type;
  messageVisible.value = true;

  setTimeout(() => {
    messageVisible.value = false;
  }, 2000);
};

// 监听路由参数变化
watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId !== oldId) {
      currentTab.value = "description";
      await loadProductData();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  },
  { immediate: true }
);

// 加载商品数据
const loadProductData = async () => {
  try {
    await evaluationsStore.getfarms();
    await evaluationsStore.fetchEvaluations();
    
    const product = evaluationsStore.farms.find((item) => item.id == route.params.id);
    if (product) {
      farms.value = product;
    }

    evaluations.value = evaluationsStore.evaluations.filter(
      (item) => item.ids == route.params.id
    );
  } catch (error) {
    console.error("获取商品数据失败:", error);
    showMessage("获取商品数据失败", "error");
  }
};

onMounted(loadProductData);
</script>

<style scoped>
.header {
  background-color: #2ecc71;
  color: white;
  padding: 15px 0;
  text-align: center;
}

.container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.product-detail {
  display: flex;
  gap: 40px;
}

.product-info-container {
  flex: 1;
}

.back-btn {
  display: inline-block;
  padding: 8px 16px;
  background: #f1f1f1;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  margin-bottom: 20px;
}

.product-details-tabs {
  margin-top: 40px;
}

.tab-buttons {
  display: flex;
  justify-content: flex-start;
  gap: 40px;
  margin-bottom: 30px;
  padding: 0 20px;
  position: relative;
}

.tab-buttons::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: #eee;
}

.section-title {
  font-size: 20px;
  color: #666;
  padding: 15px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0;
  position: relative;
  text-align: center;
  min-width: 100px;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #2ecc71;
  transform: scaleX(0);
  transition: transform 0.3s ease;
  z-index: 1;
}

.section-title:hover {
  color: #2ecc71;
}

.section-title.active {
  color: #2ecc71;
  font-weight: bold;
}

.section-title.active::after {
  transform: scaleX(1);
}

.message-box {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  font-size: 14px;
}

.message-icon {
  font-weight: bold;
  font-size: 16px;
}

.success {
  background-color: #f0f9eb;
  color: #67c23a;
  border: 1px solid #c2e7b0;
}

.error {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

.warning {
  background-color: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #f5dab1;
}

.info {
  background-color: #f4f4f5;
  color: #909399;
  border: 1px solid #d3d4d6;
}

.message-fade-enter-active,
.message-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>