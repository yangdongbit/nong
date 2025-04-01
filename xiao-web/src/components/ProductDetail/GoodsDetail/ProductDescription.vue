<template>
  <div class="description-container">
    <div class="product-highlights">
      <div class="highlight-item">
        <div class="highlight-icon">🌟</div>
        <div class="highlight-content">
          <h4>优选品质</h4>
          <p>{{ product.title }}</p>
        </div>
      </div>
      <div class="highlight-item">
        <div class="highlight-icon">💪</div>
        <div class="highlight-content">
          <h4>营养价值</h4>
          <p>{{ nutritionInfo }}</p>
        </div>
      </div>
      <div class="highlight-item">
        <div class="highlight-icon">🚚</div>
        <div class="highlight-content">
          <h4>{{ deliveryTitle }}</h4>
          <p>{{ deliveryInfo }}</p>
        </div>
      </div>
    </div>
    <div class="product-images-detail">
      <img
        v-for="(img, index) in detailImages"
        :key="index"
        :src="baseUrl + img"
        :alt="'商品展示图' + (index + 1)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

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

const deliveryTitle = computed(() => {
  switch (props.product?.type) {
    case "水果":
    case 1:
      return "新鲜配送";
    case "蔬菜":
    case 2:
      return "新鲜配送";
    case "农副加工":
    case 3:
      return "品质保障";
    case "粮油米面":
    case 4:
      return "品质保障";
    case "种子种苗":
    case 5:
      return "精心培育";
    case "禽畜肉蛋":
    case 6:
      return "冷链配送";
    default:
      return "快速配送";
  }
});

const deliveryInfo = computed(() => {
  switch (props.product?.type) {
    case "水果":
    case 1:
      return "从果园直达您家，全程冷链，保证新鲜度";
    case "蔬菜":
    case 2:
      return "当日采摘，24小时内直达，保证新鲜";
    case "农副加工":
    case 3:
      return "严格质检，品质保，安全可靠";
    case "粮油米面":
    case 4:
      return "真空包装，干燥储存，保质期长";
    case "种子种苗":
    case 5:
      return "专业育苗，品质保证，免费技术指导";
    case "禽畜肉蛋":
    case 6:
      return "全程冷链配送，保证新鲜，48小时内送达";
    default:
      return "快速配送到家，品质保障";
  }
});

const nutritionInfo = computed(() => {
  switch (props.product?.type) {
    case "水果":
    case 1:
      return "富含维生素C、膳食纤维和天然果糖，具有多种抗氧化物质，有助于增强免疫力";
    case "蔬菜":
    case 2:
      return "富含维生素、矿物质和膳食纤维，营养均衡，有助于维持健康的消化系统";
    case "农副加工":
    case 3:
      return "采用传统工艺精心制作，保留原料营养，无添加剂，健康美味";
    case "粮油米面":
    case 4:
      return "富含碳水化合物、膳食纤维和植物蛋白，提供持久能量，是日常饮食的重要组成";
    case "种子种苗":
    case 5:
      return "优质种源，发芽率高，抗病性强，生长势旺盛，适应性好";
    case "禽畜肉蛋":
    case 6:
      return "富含优质蛋白质、铁质和维生素B族，是理想的优质蛋白来源";
    default:
      return "营养丰富，健康美味";
  }
});

const detailImages = computed(() => {
  const allImages = [
    props.product?.imgSrc1,
    props.product?.imgSrc2,
    props.product?.imgSrc3,
    props.product?.imgSrc4,
  ].filter(Boolean);

  if (allImages.length <= 2) return allImages;

  const shuffled = [...allImages].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
});
</script>

<style scoped>
.description-container {
  padding: 30px;
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.product-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin: 30px 0;
}

.highlight-item {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.4s ease;
  border: 1px solid rgba(46, 204, 113, 0.1);
}

.highlight-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(46, 204, 113, 0.1);
  border-color: #2ecc71;
}

.highlight-icon {
  font-size: 32px;
  padding: 15px;
  background: linear-gradient(135deg, #e8f5e9, #ffffff);
  border-radius: 50%;
  margin-bottom: 15px;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(46, 204, 113, 0.15);
}

.highlight-content h4 {
  font-size: 20px;
  color: #2ecc71;
  margin-bottom: 12px;
  font-weight: 600;
}

.highlight-content p {
  color: #666;
  line-height: 1.8;
  font-size: 15px;
}

.product-images-detail {
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

.product-images-detail img {
  width: 100%;
  border-radius: 15px;
  transition: all 0.4s ease;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.product-images-detail img:hover {
  transform: scale(1.02);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}
</style>