<template>
  <div class="product-images" 
       @mouseenter="stopAutoPlay"
       @mouseleave="startAutoPlay">
    <img
      :src="currentImage"
      :alt="productName || '商品图片'"
      class="main-image"
    />
    <div class="thumbnail-list">
      <img
        v-for="(thumb, index) in thumbnails"
        :key="index"
        :src="thumb"
        :alt="`缩略图${index + 1}`"
        class="thumbnail"
        :class="{ active: currentThumb === index }"
        @click="switchMainImage(index)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  productName: {
    type: String,
    default: ''
  },
  images: {
    type: Object,
    required: true
  }
});

// 缩略图列表
const thumbnails = computed(() => {
  if (!props.images) return [];
  return [
    props.images.imgSrc1,
    props.images.imgSrc2,
    props.images.imgSrc3,
    props.images.imgSrc4,
  ].filter(Boolean);
});

const currentThumb = ref(null);
const autoPlayTimer = ref(null);

// 当前显示的图片
const currentImage = computed(() => {
  if (currentThumb.value !== null) {
    return thumbnails.value[currentThumb.value];
  }
  return props.images?.imgSrc || "http://127.0.0.1:3000/yang/img/img/default.jpg";
});

// 自动播放函数
const startAutoPlay = () => {
  stopAutoPlay();
  autoPlayTimer.value = setInterval(() => {
    const nextIndex = currentThumb.value === null ? 0 : 
      (currentThumb.value + 1) % thumbnails.value.length;
    switchMainImage(nextIndex);
  }, 3000);
};

// 停止自动播放
const stopAutoPlay = () => {
  if (autoPlayTimer.value) {
    clearInterval(autoPlayTimer.value);
    autoPlayTimer.value = null;
  }
};

// 切换主图
const switchMainImage = (index) => {
  currentThumb.value = index;
  stopAutoPlay();
  startAutoPlay();
};

onMounted(() => {
  startAutoPlay();
});

onUnmounted(() => {
  stopAutoPlay();
});
</script>

<style scoped>
.product-images {
  flex: 1;
  position: relative;
}

.main-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0;
  transition: all 0.5s ease;
  opacity: 1;
}

.thumbnail-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.thumbnail:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.2);
}

.thumbnail.active {
  border-color: #2ecc71;
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.2);
}
</style> 