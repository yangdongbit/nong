<template>
  <div class="gallery-container">
    <div class="gallery" :style="{ '--item-count': images.length }">
      <div 
        v-for="(image, index) in images" 
        :key="index" 
        class="gallery-item"
        @mouseenter="activeIndex = index"
        @mouseleave="activeIndex = null"
      >
        <img :src="image.urls" :alt="`Gallery image ${index + 1}`">
        <div class="overlay">
          <span class="image-number">{{ image.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const images = ref([
  {urls: 'http://127.0.0.1:3000/yang/img/img/1.gif', message: '欢'},
  {urls: 'http://127.0.0.1:3000/yang/img/img/2.gif', message: '迎'},
  {urls: 'http://127.0.0.1:3000/yang/img/img/3.gif', message: '来'},
  {urls: 'http://127.0.0.1:3000/yang/img/img/4.gif', message: '到'},
  {urls: 'http://127.0.0.1:3000/yang/img/img/5.gif', message: '农'},
  {urls: 'http://127.0.0.1:3000/yang/img/img/6.gif', message: '乐'},
  {urls: 'http://127.0.0.1:3000/yang/img/img/7.gif', message: '购'},
])

const activeIndex = ref(null)
</script>

<style scoped>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

.gallery-container {
  /* background-color: rgb(60, 60, 70); */
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 6vh;
  padding: 20px;
}

.gallery {
  width: 100%;
  max-width: 900px;
  height: 400px;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  border-radius: 10px;
}

.gallery-item {
  position: relative;
  transition: all 0.7s ease;
  overflow: hidden;
  flex: 1;
  cursor: pointer;
}

.gallery-item:hover {
  flex-grow: 3;
  box-shadow: 0 0 20px rgba(255,255,255,0.3);
}

.gallery-item:not(:hover) {
  flex-grow: 0.5;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s ease;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.7s ease;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 20px;
}

.gallery-item:hover .overlay {
  opacity: 1;
}

.image-number {
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
}

@media (max-width: 768px) {
  .gallery {
    height: auto;
    flex-direction: column;
  }

  .gallery-item {
    height: 150px;
    transition: all 0.5s ease;
  }

  .gallery-item:hover {
    flex-grow: 2;
  }

  .gallery-item:not(:hover) {
    flex-grow: 1;
  }
}

@media (min-width: 769px) {
  .gallery-item {
    width: calc(100% / var(--item-count));
  }
}
</style>
