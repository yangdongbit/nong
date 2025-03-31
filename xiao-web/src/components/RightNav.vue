<template>
  <!-- 修改返回顶部按钮组 -->
  <div class="float-btns" v-show="showBackToTop">
      <div class="btn-item" @click="scrollToTop">
        <i class="el-icon-top"></i>
        <span class="btn-text">顶部</span>
      </div>
      <div class="btn-item">
        <i class="el-icon-star-off"></i>
        <span class="btn-text">收藏</span>
      </div>
    </div>
  
</template>

<script setup>
import { ref, onMounted, onUnmounted} from 'vue'
// 控制返回顶部按钮的显示
const showBackToTop = ref(false)

// 监听滚动事件
const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

// 返回顶部方法
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 组件挂载时添加滚动监听
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

// 组件卸载时移除滚动监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.float-btns {
  position: fixed;
  right: 20px;
  bottom: 100px;
  z-index: 999;
  width: 60px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 2px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.btn-item {
  position: relative;
  height: 60px;
  border-bottom: 1px solid #eee;
  color: #666;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.btn-item:last-child {
  border-bottom: none;
}

.btn-item i {
  font-size: 20px;
  margin-bottom: 4px;
}

.btn-item .btn-text {
  font-size: 12px;
}

.btn-item:hover {
  color: #ff6700;
  background-color: #f5f5f5;
}

.btn-item:hover .btn-text {
  color: #ff6700;
}
</style>