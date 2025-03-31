<template>
  <div class="farmer-story-detail">
    <header>
      <div class="container">
        <div class="header-content">
          <h1>农户故事详情</h1>
          <div class="logo">
            <img src="http://127.0.0.1:3000/yang/img/img/logo.png" alt="Logo" />
          </div>
        </div>
      </div>
    </header>

    <div class="container">
      <main>
        <article class="story-content">
          <h2>{{ story.title }}</h2>
          <div class="farmer-info">
            <img :src="`http://127.0.0.1:3000/${story.farmer_image}`" alt="农户照片" class="farmer-avatar" />
            <div class="farmer-details">
              <h3>{{ story.farmer_name }}</h3>
              <p>{{ story.location }}</p>
              <p>种植年限：{{ story.experience }}年</p>
            </div>
          </div>
          <img :src="`http://127.0.0.1:3000/${story.image}`" alt="Story Image" class="story-image" />
          <div class="story-text">
            <p>{{ story.content }}</p>
          </div>
          <div class="product-section">
            <h3>相关农产品</h3>
            <div class="products">
              <div v-for="product in relatedProducts" :key="product.id" class="product-card">
                <img :src="product.imgSrc" :alt="product.name" />
                <h4>{{ product.product_name }}</h4>
                <p class="price">¥{{ product.price }}/斤</p>
                <button class="view-detail-btn" @click="router.push(`/GoodsDetail/${product.id}`)">
                  查看详情
                </button>
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>

    <myFooter></myFooter>
  </div>
</template>

<script setup>
import myFooter from "../myFooter.vue";
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from 'vue-router';
import { useEvaluationsStore } from "../../nweStore/evaluations";

const evaluationsStore = useEvaluationsStore();
const router = useRouter();
const route = useRoute();

const story = ref({});
const relatedProducts = ref([]);

// 监听 farms 数据变化
watch(() => evaluationsStore.farms, (newFarms) => {
  if (newFarms.length > 0 && story.value.products) {
    // 当 farms 数据加载完成且有 story 数据时，进行过滤
    relatedProducts.value = newFarms.filter(obj => 
      story.value.products.split(",").map(String).includes(String(obj.id))
    );
    // console.log('相关商品已更新:', relatedProducts.value);
  }
}, { deep: true });

onMounted(async () => {
  try {
    // 1. 获取并解析故事数据
    const storyStr = route.query.story;
    if (storyStr) {
      const decodedStoryStr = decodeURIComponent(storyStr);
      story.value = JSON.parse(decodedStoryStr);
      // console.log('解析后的故事数据:', story.value);
    }

    // 2. 请求商品数据
    await evaluationsStore.getfarms();
    
    // 3. 如果商品数据已经加载，立即过滤
    if (evaluationsStore.farms.length > 0 && story.value.products) {
      relatedProducts.value = evaluationsStore.farms.filter(obj => 
        story.value.products.split(",").map(String).includes(String(obj.id))
      );
      // console.log('相关商品:', relatedProducts.value);
    }
  } catch (error) {
    console.error('数据处理失败:', error);
  }
});
</script>

<style scoped>
.farmer-story-detail {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #f8fff4;
  color: #333;
  line-height: 1.6;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

header {
  background: linear-gradient(135deg, #8acd58 0%, #6fb840 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(138, 205, 88, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

header h1 {
  font-size: 28px;
  margin: 0;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.story-content {
  background-color: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin: 2rem auto;
  max-width: 900px;
}

.story-content h2 {
  font-size: 2.2rem;
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 600;
}

.story-image {
  width: 100%;
  height: auto;
  margin: 2rem 0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.story-image:hover {
  transform: scale(1.02);
}

.farmer-info {
  display: flex;
  align-items: center;
  margin: 2rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fff4 0%, #eefbe6 100%);
  border-radius: 12px;
  border: 1px solid rgba(138, 205, 88, 0.2);
}

.farmer-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 2rem;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.farmer-details {
  flex: 1;
}

.farmer-details h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.farmer-details p {
  margin: 0.5rem 0;
  color: #666;
  font-size: 1.1rem;
}

.story-text p {
  margin: 1.8rem 0;
  line-height: 1.8;
  color: #2c3e50;
  font-size: 1.1rem;
  text-align: justify;
}

.product-section {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
}

.product-section h3 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
}

.products {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(138, 205, 88, 0.15);
  border-color: #8acd58;
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  transition: transform 0.3s ease;
}

.product-card:hover img {
  transform: scale(1.05);
}

.product-card h4 {
  color: #2c3e50;
  font-size: 1.3rem;
  margin: 1rem 0 0.5rem 0;
}

.product-name {
  color: #666;
  font-size: 1rem;
  margin: 0.5rem 0;
}

.price {
  color: #8acd58;
  font-weight: bold;
  font-size: 1.3rem;
  margin-top: 1rem;
}

.logo {
  height: 80px;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.logo img {
  height: 100%;
  object-fit: contain;
}

/* 响应式设计优化 */
@media screen and (max-width: 768px) {
  .story-content {
    padding: 2rem;
  }

  .story-content h2 {
    font-size: 1.8rem;
  }

  .farmer-info {
    flex-direction: column;
    text-align: center;
  }

  .farmer-avatar {
    margin: 0 0 1rem 0;
  }

  .products {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media screen and (max-width: 480px) {
  .story-content {
    padding: 1.5rem;
  }

  .story-content h2 {
    font-size: 1.5rem;
  }

  .product-card img {
    height: 150px;
  }
}

.view-detail-btn {
  background-color: #8acd58;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.3s ease;
}

.view-detail-btn:hover {
  background-color: #6fb840;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(138, 205, 88, 0.2);
}
</style>