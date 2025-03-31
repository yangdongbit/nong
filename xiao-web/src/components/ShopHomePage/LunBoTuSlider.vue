<template>
  <div class="swiper-container">
    <swiper
      :modules="modules"
      :loop="true"
      :pagination="{ clickable: true, el: '.swiper-pagination' }"
      :navigation="{ nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }"
      :autoplay="{ delay: 3000, disableOnInteraction: false }"
      @swiper="setSwiper"
      @mouseenter="stopAutoplay"
      @mouseleave="startAutoplay"
    >
      <swiper-slide>
        <img src="http://127.0.0.1:3000/yang/img/img/轮播图1.jpg" alt="轮播图 1" />
      </swiper-slide>
      <swiper-slide>
        <img src="http://127.0.0.1:3000/yang/img/img/轮播图2.jpg" alt="轮播图 2" />
      </swiper-slide>
      <swiper-slide>
        <img src="http://127.0.0.1:3000/yang/img/img/轮播图3.jpg" alt="轮播图 3" />
      </swiper-slide>
      <swiper-slide>
        <img src="http://127.0.0.1:3000/yang/img/img/轮播图4.jpg" alt="轮播图 4" />
      </swiper-slide>
      <swiper-slide>
        <img src="http://127.0.0.1:3000/yang/img/img/轮播图5.jpg" alt="轮播图 5" />
      </swiper-slide>
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
      <div class="swiper-pagination"></div>
    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const modules = [Pagination, Navigation, Autoplay];

let swiperInstance = null;

const setSwiper = (swiper) => {
  swiperInstance = swiper;
};

const stopAutoplay = () => {
  if (swiperInstance && swiperInstance.autoplay) {
    swiperInstance.autoplay.stop();
  }
};

const startAutoplay = () => {
  if (swiperInstance && swiperInstance.autoplay) {
    swiperInstance.autoplay.start();
  }
};
</script>

<style scoped>
.swiper-container {
  width: 1280px;
  height: 512px;
  margin: 0 auto;
  position: relative;
}

.swiper {
  width: 100%;
  height: 100%;
}

.swiper-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  color: #333;
  transition: all 0.3s ease;
}

:deep(.swiper-button-next:hover),
:deep(.swiper-button-prev:hover) {
  background-color: rgba(255, 255, 255, 0.8);
}

:deep(.swiper-button-next::after),
:deep(.swiper-button-prev::after) {
  font-size: 24px;
  font-weight: bold;
}

:deep(.swiper-pagination-bullet) {
  width: 12px;
  height: 12px;
  background-color: rgba(255, 255, 255, 0.5);
  opacity: 1;
  transition: all 0.3s ease;
}

:deep(.swiper-pagination-bullet-active) {
  background-color: #fff;
  width: 30px;
  border-radius: 6px;
}

:deep(.swiper-pagination) {
  bottom: 20px !important;
}
</style>
