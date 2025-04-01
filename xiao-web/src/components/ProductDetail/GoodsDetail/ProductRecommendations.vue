<template>
  <div class="recommendations-container">
    <div v-if="loading" class="loading-state">
      <p>正在加载推荐商品...</p>
    </div>
    <div v-else class="recommended-products">
      <div v-for="(product, index) in recommendedProducts" 
           :key="product.id" 
           class="recommendation-item"
           @click="navigateToProduct(product.id)">
        <div class="product-title">{{ index + 1 }}. {{ product.product_name }}</div>
        <div class="product-images">
          <img v-if="product.imgSrc" :src="product.imgSrc" class="product-image" alt="主图">
          <img v-if="product.imgSrc1" :src="product.imgSrc1" class="product-image" alt="图片1">
          <img v-if="product.imgSrc2" :src="product.imgSrc2" class="product-image" alt="图片2">
          <img v-if="product.imgSrc3" :src="product.imgSrc3" class="product-image" alt="图片3">
          <img v-if="product.imgSrc4" :src="product.imgSrc4" class="product-image" alt="图片4">
        </div>
        <div class="product-price">￥{{ product.price || '暂无价格' }}</div>
        <div class="product-info">
          <div class="info-item">
            <span class="info-label">商品类型：</span>
            <span>{{ product.type || '未知' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">发货地：</span>
            <span>{{ product.shipping_from || '未知' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">快递：</span>
            <span>{{ product.express_name || '未知' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">规格：</span>
            <span>{{ product.specification || '未知' }}</span>
          </div>
        </div>
        <div class="similarity-scores">
          <div class="score-item">
            <div class="info-label">文本相似度</div>
            <div class="score-value">{{ (product.text_similarity * 100).toFixed(2) }}%</div>
          </div>
          <div class="score-item">
            <div class="info-label">图像相似度</div>
            <div class="score-value">{{ (product.image_similarity * 100).toFixed(2) }}%</div>
          </div>
          <div class="score-item">
            <div class="info-label">综合相似度</div>
            <div class="score-value">{{ (product.combined_similarity * 100).toFixed(2) }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  baseUrl: {
    type: String,
    default: ''
  }
});

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const recommendedProducts = ref([]);

// 获取推荐商品
const fetchRecommendations = async () => {
  try {
    loading.value = true;
    
    // 验证商品数据
    if (!props.product) {
      console.error('商品数据为空');
      return;
    }

    // 确保商品名称存在
    const productName = props.product.name || props.product.product_name;
    if (!productName) {
      console.error('商品名称不存在');
      return;
    }
    
    // 收集所有可用的图片URL
    const availableImages = [
      props.product.imgSrc,
      props.product.imgSrc1,
      props.product.imgSrc2,
      props.product.imgSrc3,
      props.product.imgSrc4
    ].filter(img => img); // 过滤掉空值

    // 随机选择一张图片
    const randomImage = availableImages.length > 0 
      ? availableImages[Math.floor(Math.random() * availableImages.length)]
      : null;

    const requestData = {
      product_name: productName,
      image_url: randomImage ? `http://127.0.0.1:3000${randomImage}` : null,
      text_weight: 0.5,
      image_weight: 0.5,
      top_n: 5
    };


    const response = await fetch('http://127.0.0.1:5000/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || '请求失败');
    }

    recommendedProducts.value = data.recommendations || [];
    
  } catch (error) {
    console.error('获取推荐商品失败:', error.message);
    recommendedProducts.value = [];
  } finally {
    loading.value = false;
  }
};

// 导航到商品详情
const navigateToProduct = (id) => {
  router.push(`/GoodsDetail/${id}`);
};

// 监听商品变化
watch(() => props.product, (newProduct) => {
  if (newProduct && Object.keys(newProduct).length > 0) {
    fetchRecommendations();
  }
}, { immediate: true });

// 组件挂载时获取推荐
onMounted(fetchRecommendations);
</script>

<style scoped>
.recommendations-container {
  padding: 20px;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
}

.recommended-products {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  padding: 10px;
}

.recommendation-item {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 15px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.recommendation-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.product-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.4;
  height: 3em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-images {
  display: flex;
  gap: 8px;
  margin: 12px 0;
  overflow-x: auto;
  padding: 5px 0;
  scrollbar-width: thin;
  -ms-overflow-style: none;
}

.product-images::-webkit-scrollbar {
  height: 4px;
}

.product-images::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.product-images::-webkit-scrollbar-thumb {
  background: #8acd58;
  border-radius: 4px;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #eee;
  transition: transform 0.2s ease;
}

.product-image:hover {
  transform: scale(1.05);
}

.product-price {
  font-size: 1.4rem;
  font-weight: bold;
  color: #ff6b6b;
  margin: 12px 0;
}

.product-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin: 6px 0;
  font-size: 0.9rem;
  color: #666;
}

.info-label {
  color: #888;
  font-weight: 500;
}

.similarity-scores {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 15px;
  padding: 12px;
  background: #f0f7ed;
  border-radius: 8px;
}

.score-item {
  text-align: center;
  padding: 8px;
}

.score-item .info-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 5px;
}

.score-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #8acd58;
}

@media (max-width: 768px) {
  .recommended-products {
    grid-template-columns: 1fr;
  }

  .recommendation-item {
    margin: 10px 0;
  }

  .product-images {
    gap: 6px;
  }

  .product-image {
    width: 80px;
    height: 80px;
  }
}
</style>