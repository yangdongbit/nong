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
  import { ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  
  const props = defineProps({
    product: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['show-message']);
  const route = useRoute();
  const router = useRouter();
  
  const loading = ref(false);
  const recommendedProducts = ref([]);
  
  // 获取推荐商品的函数
  const fetchRecommendations = async () => {
    loading.value = true;
    try {
      // 构建请求数据
      const data = {
        product_name: props.product.product_name,
        image_url: props.product.imgSrc || props.product.imgSrc1,
        text_weight: 0.5,
        image_weight: 0.5,
        top_n: 5
      };
  
      const response = await fetch('http://127.0.0.1:5000/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      if (response.ok) {
        recommendedProducts.value = result.recommendations;
      } else {
        emit('show-message', '获取推荐商品失败', 'error');
      }
    } catch (error) {
      console.error('获取推荐失败:', error);
      emit('show-message', '获取推荐商品失败', 'error');
    } finally {
      loading.value = false;
    }
  };
  
  // 导航到商品详情页
  const navigateToProduct = (productId) => {
    // 如果点击的是当前商品，不进行跳转
    if (productId === Number(route.params.id)) {
      emit('show-message', '当前已经在该商品页面', 'info');
      return;
    }
    // 跳转到新的商品详情页
    router.push(`/GoodsDetail/${productId}`);
  };
  
  // 监听商品变化，重新获取推荐
  watch(
    () => props.product,
    () => {
      if (props.product && Object.keys(props.product).length > 0) {
        fetchRecommendations();
      }
    },
    { immediate: true }
  );
  </script>
  
  <style scoped>
  .recommendations-container {
    padding: 20px;
  }
  
  .loading-state {
    text-align: center;
    padding: 40px;
    color: #666;
  }
  
  .recommended-products {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .recommendation-item {
    background: white;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  
  .recommendation-item::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(46, 204, 113, 0.05);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .recommendation-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .recommendation-item:hover::after {
    opacity: 1;
  }
  
  .recommendation-item:active {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .product-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #333;
  }
  
  .product-images {
    display: flex;
    gap: 10px;
    margin: 10px 0;
    overflow-x: auto;
    padding: 10px 0;
  }
  
  .product-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #eee;
  }
  
  .product-price {
    color: #ff6b6b;
    font-size: 18px;
    font-weight: bold;
    margin: 10px 0;
  }
  
  .product-info {
    margin: 15px 0;
  }
  
  .info-item {
    display: flex;
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  .info-label {
    color: #666;
    width: 80px;
    flex-shrink: 0;
  }
  
  .similarity-scores {
    display: flex;
    gap: 20px;
    margin-top: 10px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 4px;
  }
  
  .score-item {
    flex: 1;
    text-align: center;
  }
  
  .score-value {
    font-size: 16px;
    font-weight: bold;
    color: #2ecc71;
    margin-top: 5px;
  }
  
  /* 滚动条样式 */
  .product-images::-webkit-scrollbar {
    height: 6px;
  }
  
  .product-images::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  .product-images::-webkit-scrollbar-thumb {
    background: #2ecc71;
    border-radius: 3px;
  }
  
  .product-images::-webkit-scrollbar-thumb:hover {
    background: #27ae60;
  }
  </style>