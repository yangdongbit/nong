<template>
  <div class="farmer-stories">
    <!-- 故事卡片网格布局 -->
    <div class="stories-grid">
      <!-- 遍历显示故事卡片，根据当前选中状态添加active类 -->
      <div class="story-card" 
           v-for="(story, index) in displayedStories" 
           :key="story.id"
           :class="{ active: index === currentStory }"
           @click="selectStory(story)">
        <div class="card-content">
          <!-- 农户头像区域 -->
          <div class="image-wrapper">
            <img :src="`http://127.0.0.1:3000/${story.farmer_image}`" :alt="story.farmerName">
          </div>
          <!-- 故事内容区域 -->
          <div class="story-text">
            <h3>{{ story.farmerName }}</h3>
            <p>{{ story.title }}</p>
            <!-- 故事卡片底部信息 -->
            <div class="story-footer">
              <span class="years">从农经验 {{ story.experience }} 年</span>
              <span class="location">{{ story.location }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 查看更多按钮，当还有未显示的故事时显示 -->
    <div class="view-more" v-if="displayedStories.length < stories.length">
      <button class="view-more-btn" @click="showMore">
        查看更多故事
        <span class="arrow">↓</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

// 响应式状态声明
const currentStory = ref(0);  // 当前选中的故事索引
const displayCount = ref(4);  // 当前显示的故事数量，初始为4个
const stories = ref([]);      // 存储所有故事数据

// 组件挂载时获取故事数据
onMounted(() => {
  axios({
    url: 'api/yang/farm_story',
    method: 'get'
  }).then(res => {
    console.log(res.data);
    stories.value = res.data;
  })
})

// 计算属性：根据displayCount显示部分故事
const displayedStories = computed(() => {
  return stories.value.slice(0, displayCount.value);
});

// 选择故事的方法
const selectStory = (story) => {
  currentStory.value = stories.value.indexOf(story);
  router.push({
    path: `/farmer-stories/${story.id}`,
    query: {
      story: encodeURIComponent(JSON.stringify(story))
    }
  });
};

// 显示更多故事的方法，每次增加2个
const showMore = () => {
  displayCount.value = Math.min(displayCount.value + 2, stories.value.length);
};


</script>

<style scoped>
/* 整体容器样式 */
.farmer-stories {
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 标题样式 */
.title {
  text-align: center;
  color: #2c3e50;
  font-size: 2em;
  margin-bottom: 50px;
  position: relative;
}

/* 标题下划线装饰 */
.title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: #4CAF50;
  border-radius: 2px;
}

/* 故事卡片网格布局 */
.stories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  padding: 20px;
}

/* 故事卡片基础样式 */
.story-card {
  background: #ffffff;
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  position: relative;
  animation: fadeIn 0.5s ease-out;
}

/* 卡片左侧装饰条 */
.story-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 0;
  background: #4CAF50;
  transition: height 0.3s ease;
}

/* 卡片悬停效果 */
.story-card:hover::before {
  height: 100%;
}

.story-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
}

/* 选中状态样式 */
.story-card.active {
  background: #f1f8e9;
}

/* 卡片内容布局 */
.card-content {
  padding: 25px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 图片包装器样式 */
.image-wrapper {
  margin-bottom: 20px;
  text-align: center;
}

/* 农户头像样式 */
.image-wrapper img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid #4CAF50;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

/* 头像悬停效果 */
.story-card:hover img {
  transform: scale(1.05);
}

/* 故事文本区域样式 */
.story-text {
  flex: 1;
}

/* 故事标题样式 */
.story-text h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.4em;
  text-align: center;
}

/* 故事内容样式 */
.story-text p {
  margin: 0 0 20px 0;
  color: #666;
  line-height: 1.6;
  text-align: justify;
}

/* 故事底部信息样式 */
.story-footer {
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 0.9em;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px dashed #ddd;
}

/* 年限和位置信息样式 */
.years, .location {
  display: flex;
  align-items: center;
}

/* 年限和位置图标 */
.years::before {
  content: '🌱';
  margin-right: 5px;
}

.location::before {
  content: '📍';
  margin-right: 5px;
}

/* 响应式布局调整 */
@media (max-width: 1024px) {
  /* 平板设备样式调整 */
}

@media (max-width: 768px) {
  /* 手机横屏样式调整 */
}

@media (max-width: 480px) {
  /* 手机竖屏样式调整 */
}

/* 查看更多按钮样式 */
.view-more {
  text-align: center;
  margin-top: 40px;
  padding-bottom: 20px;
}

/* 按钮基础样式 */
.view-more-btn {
  background: transparent;
  border: 2px solid #4CAF50;
  color: #4CAF50;
  padding: 12px 30px;
  font-size: 1.1em;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

/* 按钮悬停效果 */
.view-more-btn:hover {
  background: #4CAF50;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

/* 箭头动画效果 */
.view-more-btn .arrow {
  font-size: 1.2em;
  transition: transform 0.3s ease;
}

.view-more-btn:hover .arrow {
  transform: translateY(4px);
}

/* 淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>