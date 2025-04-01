<template>
  <div>
    <header class="header">
      <h1>农乐购</h1>
    </header>

    <div class="container">
      <router-link to="/ShopHomePage" class="back-btn">← 返回首页</router-link>
      <div class="product-detail">
        <ProductImages 
          :product-name="farms?.name"
          :images="farms"
          :base-url="URL"
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
            :base-url="URL"
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
            :base-url="URL"
            @show-message="showMessage"
          />
        </div>
      </div>
    </div>

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

const  URL = 'http://127.0.0.1:3000'

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
  background: linear-gradient(135deg, #8acd58, #8acd58);
  color: white;
  /* padding: 1rem 0; */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
  height: 70px;
  line-height: 70px;
}

.header h1 {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  position: relative;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.2rem;
  background: #28a745;
  color: white;
  text-decoration: none;
  border-radius: 24px;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.back-btn:hover {
  background: #218838;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.product-detail {
  display: flex;
  gap: 30px;
  margin-top: 1rem;
}

.product-info-container {
  flex: 1;
  padding-left: 1.5rem;
  border-left: 2px solid #f0f0f0;
}

.product-details-tabs {
  margin-top: 2.5rem;
}

.tab-buttons {
  display: flex;
  gap: 2.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #eee;
}

.section-title {
  font-size: 1.1rem;
  color: #666;
  padding: 0.8rem 0;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0;
  position: relative;
  font-weight: 500;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 3px;
  background: #28a745;
  transform: scaleX(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.section-title:hover {
  color: #28a745;
}

.section-title.active {
  color: #28a745;
  font-weight: 600;
}

.section-title.active::after {
  transform: scaleX(1);
}

.message-box {
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.8rem 1.8rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  font-size: 0.95rem;
  backdrop-filter: blur(4px);
}

.message-icon {
  font-weight: 700;
  font-size: 1.1rem;
}

.success {
  background: rgba(104, 214, 137, 0.95);
  color: #155724;
  border: 1px solid #b7ebc9;
}

.error {
  background: rgba(245, 108, 108, 0.95);
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.warning {
  background: rgba(255, 193, 77, 0.95);
  color: #856404;
  border: 1px solid #ffeeba;
}

.info {
  background: rgba(144, 147, 153, 0.95);
  color: #f8f9fa;
  border: 1px solid #d3d4d6;
}

.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -30px);
}
</style>