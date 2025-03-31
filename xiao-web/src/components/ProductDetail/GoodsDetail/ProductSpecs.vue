<template>
  <div class="specs-container">
    <div class="specs-grid">
      <div class="spec-item">
        <div class="spec-label">产地</div>
        <div class="spec-value">{{ product.shipping_from }}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">规格</div>
        <div class="spec-value">{{ product.specification }}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">储存方式</div>
        <div class="spec-value">{{ product.storage_method }}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">保质期</div>
        <div class="spec-value">{{ specsInfo.shelfLife }}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">{{ specsInfo.sizeLabel }}</div>
        <div class="spec-value">{{ specsInfo.size }}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">{{ specsInfo.qualityLabel }}</div>
        <div class="spec-value">{{ specsInfo.quality }}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">包装方式</div>
        <div class="spec-value">{{ specsInfo.packaging }}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">适用人群</div>
        <div class="spec-value">{{ specsInfo.suitableFor }}</div>
      </div>
    </div>

    <div class="storage-tips">
      <h4>储存建议</h4>
      <ul>
        <li v-for="(tip, index) in specsInfo.storageTips" :key="index">
          {{ tip }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const specsInfo = computed(() => {
  switch (props.product?.type) {
    case "水果":
    case 1:
      return {
        shelfLife: "7-10天",
        sizeLabel: "果径",
        size: "75-85mm",
        qualityLabel: "甜度",
        quality: "13-15度",
        packaging: "精美礼盒装",
        suitableFor: "老少皆宜",
        storageTips: [
          "常温储存时建议放置通风处",
          "可放入冰箱冷藏保存更持久",
          "避免阳光直射",
          "建议开箱后3-5天内食用完",
        ],
      };
    case "蔬菜":
    case 2:
      return {
        shelfLife: "3-5天",
        sizeLabel: "规格",
        size: "标准",
        qualityLabel: "新鲜度",
        quality: "当日采摘",
        packaging: "专业保鲜包装",
        suitableFor: "全家食用",
        storageTips: [
          "建议放入冰箱保鲜",
          "清洗后沥干水分再储存",
          "避免挤压",
          "建议3天内食用完",
        ],
      };
    case "农副加工":
    case 3:
      return {
        shelfLife: "6个月",
        sizeLabel: "净含量",
        size: "500g",
        qualityLabel: "等级",
        quality: "优质",
        packaging: "密封包装",
        suitableFor: "全家食用",
        storageTips: [
          "请放置阴凉干燥处",
          "开封后请密封保存",
          "避免受潮",
          "开封后建议一个月内食用完",
        ],
      };
    case "粮油米面":
    case 4:
      return {
        shelfLife: "12个月",
        sizeLabel: "净含量",
        size: "5kg",
        qualityLabel: "产品等级",
        quality: "优质",
        packaging: "真空装",
        suitableFor: "全家食用",
        storageTips: [
          "放于阴凉干燥处",
          "防止受潮",
          "避免阳光直射",
          "开封后请密封保存",
        ],
      };
    case "种子种苗":
    case 5:
      return {
        shelfLife: "12个月",
        sizeLabel: "规格",
        size: "标准",
        qualityLabel: "发芽率",
        quality: "95%以上",
        packaging: "防潮包装",
        suitableFor: "种植户",
        storageTips: [
          "避免高温潮湿",
          "存放于阴凉干燥处",
          "避免挤压",
          "建议适时播种",
        ],
      };
    case "禽畜肉蛋":
    case 6:
      return {
        shelfLife: "7天",
        sizeLabel: "规格",
        size: "标准",
        qualityLabel: "品质",
        quality: "新鲜优质",
        packaging: "真空包装",
        suitableFor: "全家食用",
        storageTips: [
          "需冷藏保存",
          "0-4℃储存温度",
          "避免反复冷冻解冻",
          "建议3天内食用完",
        ],
      };
    default:
      return {
        shelfLife: "7天",
        sizeLabel: "规格",
        size: "标准",
        qualityLabel: "品质",
        quality: "优质",
        packaging: "标准包装",
        suitableFor: "老少皆宜",
        storageTips: [
          "常温储存时建议放置通风处",
          "可放入冰箱冷藏保存更持久",
          "避免阳光直射",
          "建议及时食用",
        ],
      };
  }
});
</script>

<style scoped>
.specs-container {
  padding: 30px;
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
  margin: 30px 0;
}

.spec-item {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.4s ease;
  border: 1px solid rgba(46, 204, 113, 0.1);
  position: relative;
  overflow: hidden;
}

.spec-item::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: #2ecc71;
  opacity: 0;
  transition: all 0.4s ease;
}

.spec-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(46, 204, 113, 0.1);
}

.spec-item:hover::before {
  opacity: 1;
}

.spec-label {
  color: #888;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
}

.spec-value {
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.storage-tips {
  background: linear-gradient(135deg, #e8f5e9, #f1f8e9);
  padding: 30px;
  border-radius: 20px;
  margin-top: 40px;
  box-shadow: 0 10px 25px rgba(46, 204, 113, 0.1);
  border: 1px solid rgba(46, 204, 113, 0.2);
}

.storage-tips h4 {
  color: #2ecc71;
  font-size: 22px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  font-weight: 600;
}

.storage-tips h4::before {
  content: "📝";
  margin-right: 12px;
  font-size: 24px;
}

.storage-tips ul {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.storage-tips li {
  color: #555;
  padding: 15px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  margin-bottom: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.storage-tips li:hover {
  background: white;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(46, 204, 113, 0.1);
}

.storage-tips li::before {
  content: "✓";
  color: #2ecc71;
  font-weight: bold;
  margin-right: 10px;
}
</style> 