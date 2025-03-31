<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElCard, ElSkeleton, ElSkeletonItem, ElAvatar, ElTag, ElDrawer, ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'

const stories = ref([])
const loading = ref(false)
const BASE_URL = 'http://127.0.0.1:3000/'
const drawerVisible = ref(false)
const currentStory = ref(null)
const isEditing = ref(false)

// 获取农户故事数据
const fetchStories = async () => {
  try {
    loading.value = true
    const response = await fetch('/api/yang/farm_story')
    const data = await response.json()
    stories.value = data.map(story => ({
      ...story,
      image: story.image?.startsWith('http') ? story.image : BASE_URL + story.image,
      farmer_image: story.farmer_image?.startsWith('http') ? story.farmer_image : BASE_URL + story.farmer_image
    }))
  } catch (error) {
    console.error('获取农户故事失败:', error)
  } finally {
    loading.value = false
  }
}

// 打开抽屉查看/编辑故事
const openDrawer = (story) => {
  currentStory.value = JSON.parse(JSON.stringify(story)) // 深拷贝防止直接修改
  drawerVisible.value = true
  isEditing.value = false
}

// 切换编辑模式
const toggleEdit = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  
  if (!userInfo.id) {
    ElMessage.warning('请先登录');
    return;
  }
  
  if (userInfo.administrator !== '1') {
    ElMessage.warning('您是普通用户，无权编辑农户故事');
    return;
  }
  
  isEditing.value = !isEditing.value;
}

// 保存修改
const saveStory = async () => {
  try {
    // 获取用户信息
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    if (!userInfo.id) {
      ElMessage.error('请先登录');
      return;
    }

    const response = await fetch(`/api/yang/farm_story/${currentStory.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userInfo.id // 添加用户ID到请求头
      },
      body: JSON.stringify({
        title: currentStory.value.title,
        farmer_name: currentStory.value.farmer_name,
        location: currentStory.value.location,
        experience: currentStory.value.experience,
        content: currentStory.value.content
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (result.status === 0) {
      ElMessage.success(result.message);
      fetchStories();
      isEditing.value = false;
    } else {
      ElMessage.error(result.message || '保存失败');
    }
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败: ' + error.message);
  }
};

// 根据用户权限显示/隐藏编辑按钮
const showEditButton = computed(() => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  return userInfo.administrator === '1';
});

onMounted(() => {
  fetchStories()
})
</script>

<template>
  <div class="story-container">
    
    <div v-if="loading" class="story-grid">
      <el-card v-for="n in 3" :key="n" class="story-card">
        <el-skeleton :loading="true" animated>
          <template #template>
            <el-skeleton-item variant="image" style="width: 100%; height: 200px"/>
            <div style="padding: 14px">
              <el-skeleton-item variant="h3" style="width: 50%"/>
              <div style="display: flex; align-items: center; margin: 16px 0">
                <el-skeleton-item variant="circle" style="width: 40px; height: 40px; margin-right: 16px"/>
                <el-skeleton-item variant="text" style="width: 30%"/>
              </div>
              <el-skeleton-item variant="text" :rows="3"/>
            </div>
          </template>
        </el-skeleton>
      </el-card>
    </div>
    
    <div v-else class="story-grid">
      <el-card v-for="story in stories" 
               :key="story.id" 
               class="story-card"
               :body-style="{ padding: '0px' }"
               @click="openDrawer(story)">
        <div class="story-image">
          <img :src="story.image" :alt="story.title">
        </div>
        
        <div class="story-content">
          <h3>{{ story.title }}</h3>
          
          <div class="farmer-info">
            <el-avatar 
              :size="50"
              :src="story.farmer_image"
              :alt="story.farmer_name"/>
            <div class="farmer-details">
              <p class="farmer-name">{{ story.farmer_name }}</p>
              <el-tag size="small" type="success">{{ story.location }}</el-tag>
              <el-tag size="small" type="info" class="experience-tag">
                从农经验: {{ story.experience }}年
              </el-tag>
            </div>
          </div>
          
          <p class="story-text">{{ story.content }}</p>
        </div>
      </el-card>
    </div>

    <!-- 抽屉组件 -->
    <el-drawer
      v-model="drawerVisible"
      :title="isEditing ? '编辑故事' : '故事详情'"
      direction="rtl"
      size="50%">
      <template #header>
        <div class="drawer-header">
          <span>{{ isEditing ? '编辑故事' : '故事详情' }}</span>
          <div class="header-right">
            <el-tag 
              v-if="!showEditButton" 
              type="info" 
              size="small" 
              class="role-tag"
            >
              普通用户仅可查看
            </el-tag>
            <el-button 
              v-if="showEditButton"
              type="primary" 
              :icon="isEditing ? 'Check' : 'Edit'"
              @click="isEditing ? saveStory() : toggleEdit()"
            >
              {{ isEditing ? '保存' : '编辑' }}
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="currentStory" class="drawer-content">
        <el-form label-position="top">
          <el-form-item label="标题">
            <el-input 
              v-model="currentStory.title"
              :readonly="!isEditing"/>
          </el-form-item>

          <el-form-item label="农户姓名">
            <el-input 
              v-model="currentStory.farmer_name"
              :readonly="!isEditing"/>
          </el-form-item>

          <el-form-item label="地区">
            <el-input 
              v-model="currentStory.location"
              :readonly="!isEditing"/>
          </el-form-item>

          <el-form-item label="从农经验（年）">
            <el-input 
              v-model="currentStory.experience"
              type="number"
              :readonly="!isEditing"/>
          </el-form-item>

          <el-form-item label="故事内容">
            <el-input 
              v-model="currentStory.content"
              type="textarea"
              :rows="6"
              :readonly="!isEditing"/>
          </el-form-item>

          <div class="story-images">
            <div class="image-preview">
              <h4>故事图片</h4>
              <img :src="currentStory.image" alt="故事图片">
            </div>
            <div class="image-preview">
              <h4>农户头像</h4>
              <img :src="currentStory.farmer_image" alt="农户头像">
            </div>
          </div>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped>
.story-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}



.story-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.story-card {
  transition: transform 0.3s ease;
}

.story-card:hover {
  transform: translateY(-5px);
}

.story-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.story-content {
  padding: 20px;
}

.story-content h3 {
  margin: 0 0 15px 0;
  color: var(--el-text-color-primary);
  font-size: 18px;
}

.farmer-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.farmer-details {
  margin-left: 15px;
}

.farmer-name {
  margin: 0 0 8px 0;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.experience-tag {
  margin-left: 8px;
}

.story-text {
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin-top: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.role-tag {
  margin-right: 8px;
}

.drawer-content {
  padding: 20px;
}

.story-images {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.image-preview {
  text-align: center;
}

.image-preview h4 {
  margin-bottom: 10px;
  color: var(--el-text-color-primary);
}

.image-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 让卡片可点击的样式 */
.story-card {
  cursor: pointer;
}
</style>