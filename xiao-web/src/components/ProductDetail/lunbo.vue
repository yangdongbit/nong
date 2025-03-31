<template>
  <div class="carousel-container">
    <!-- 轮播容器 -->
    <div class="carousel" v-if="images.length > 0">
      <!-- 大图展示区域 -->
      <div
        class="large-image"
        :style="{ backgroundImage: `url('${images[currentIndex]}')` }"
        role="img"
        :aria-label="`大图 ${currentIndex + 1}`"
      ></div>
      <!-- 小图展示区域 -->
      <div class="small-images">
        <div
          v-for="(image, index) in images"
          :key="index"
          class="small-image"
          :class="{ active: index === currentIndex }"
          @mouseenter="handleMouseEnter(index)"
        >
          <!-- 小图 -->
          <img :src="image" :alt="`缩略图 ${index + 1}`" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";

// 获取路由对象，用于获取路由参数中的 id
const route = useRoute();
// 获取路由参数中的 id
const id = route.params.id;
// 存储图片数组
const images = ref([]);
// 存储当前显示的图片索引
const currentIndex = ref(0);
// 用于存储轮播定时器的 id
let intervalId = null;

// 定义 emit
const emit = defineEmits(['update:product']);

// 当鼠标移入小图时触发，切换到大图对应的索引，并重置轮播定时器
const handleMouseEnter = (index) => {
  currentIndex.value = index;
  resetInterval();
};

// 启动轮播功能，每隔 1500 毫秒切换到下一张图片
const startCarousel = () => {
  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % images.value.length;
  }, 1500);
};

// 重置轮播定时器
const resetInterval = () => {
  clearInterval(intervalId);
  startCarousel();
};

// 在组件挂载时执行
onMounted(() => {
  axios({
    url: '/api/yang/farms',
    method: 'GET'
  }).then(result => {
    const product = Object.values(result.data).find((item) => item.id === parseInt(id));
    if (product) {
      images.value = [
        product.imgSrc,
        product.imgSrc1,
        product.imgSrc2,
        product.imgSrc3,
        product.imgSrc4
      ].filter(Boolean);
      
      // 发送 product 数据到父组件
      emit('update:product', product);
    }
    // console.log(product);
    startCarousel();
  }).catch(error => {
    console.error("Error fetching data:", error);
  });
});

// 在组件卸载时执行，清除轮播定时器
onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<style scoped>
.carousel-container {
  /* 背景颜色，设置了一定的透明度 */
  /* background-color: rgba(206, 182, 182, 0.637); */
  display: flex;
  height: 75vh;
  justify-content: center;
  align-items: center;
}

.carousel {
  position: relative;
  width: 650px;
  display: flex;
  justify-content: space-evenly;
  margin-top: 100px;
}

.large-image {
  width: 400px;
  height: 500px;
  transition: 0.4s;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
}

.small-images {
  width: 200px;
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.small-image {
  position: relative;
  width: 200px;
  height: 90px;
  right: 0;
  transition: 0.5s;
  overflow: hidden;
  border-radius: 8px;
}

.small-image img {
  position: absolute;
  width: 200px;
  height: 90px;
  object-fit: cover;
  transition: 0.5s;
  right: 0;
}

.small-image.active {
  opacity: 0.5;
  right: 50px;
}

.small-image:hover img {
  opacity: 0.7;
  right: 50px;
}
</style>
