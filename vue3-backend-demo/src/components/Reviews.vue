<template>
  <div class="reviews-container">
    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-select 
        v-if="isAdmin" 
        v-model="selectedSeller" 
        placeholder="选择卖家" 
        clearable
        @change="handleSellerChange"
      >
        <el-option label="所有卖家" value="" />
        <el-option 
          v-for="seller in sellers" 
          :key="seller.id" 
          :label="seller.name" 
          :value="seller.id" 
        />
      </el-select>

      <el-input
        v-model="searchText"
        placeholder="搜索商品名称/评论内容"
        class="search-input"
      >
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <!-- 评论列表 -->
    <el-table :data="paginatedReviews" style="width: 100%" v-loading="loading">
      <el-table-column label="商品信息" min-width="300">
        <template #default="{ row }">
          <div class="product-info">
            <el-image
              :src="row.product_image"
              :preview-src-list="[row.product_image]"
              fit="cover"
              style="width: 60px; height: 60px"
              :preview-teleported="true"
              :initial-index="0"
            />
            <span>{{ row.product_title }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="评论用户" width="220">
        <template #default="{ row }">
          <div class="user-info">
            <el-image
              v-if="row.avatar_img"
              :src="formatImageUrl(row.avatar_img)"
              fit="cover"
              class="user-avatar"
              :preview-src-list="[formatImageUrl(row.avatar_img)]"
              :preview-teleported="true"
              :initial-index="0"
            />
            <div class="user-details">
              <span>{{ row.reviewer_name }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="content" label="评论内容" min-width="400" />
      
      <el-table-column prop="rating" label="评分" width="150">
        <template #default="{ row }">
          <el-rate v-model="row.rating" disabled />
        </template>
      </el-table-column>

      <el-table-column prop="created_at" label="评论时间" width="200" />

      <el-table-column 
        v-if="isAdmin" 
        prop="seller_name" 
        label="卖家" 
        width="150"
      />

      <el-table-column label="操作" width="120" fixed="right">
        <template #default="scope">
          <el-button 
            size="small" 
            type="danger"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredReviews.length"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 获取用户信息
const getUserInfo = () => {
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    return JSON.parse(storedUserInfo)
  }
  return null
}

// 判断是否是管理员
const isAdmin = computed(() => {
  const user = getUserInfo()
  return user?.administrator === '1'
})

// 基础数据
const loading = ref(false)
const reviews = ref([])
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const sellers = ref([])
const selectedSeller = ref('')

// 获取卖家列表（仅管理员可见）
const fetchSellers = async () => {
  if (!isAdmin.value) return
  try {
    const response = await axios.get('/api/yang/sellers')
    if (response.data.status === 0) {
      sellers.value = response.data.data
    }
  } catch (error) {
    console.error('获取卖家列表失败:', error)
  }
}

// 获取评论列表
const fetchReviews = async () => {
  loading.value = true
  try {
    const user = getUserInfo()
    if (!user) {
      ElMessage.warning('请先登录')
      return
    }

    // 管理员可以查看所有评论或指定卖家的评论
    const url = isAdmin.value && selectedSeller.value
      ? `/api/yang/reviews/seller/${selectedSeller.value}`
      : `/api/yang/reviews/seller/${user.id}`

    const response = await axios.get(url)
    if (response.data.status === 0) {
      reviews.value = response.data.data || []
    } else {
      throw new Error(response.data.message)
    }
  } catch (error: any) {
    console.error('获取评论列表失败:', error)
    ElMessage.error('获取评论列表失败')
    reviews.value = []
  } finally {
    loading.value = false
  }
}

// 处理卖家选择变化
const handleSellerChange = () => {
  currentPage.value = 1
  fetchReviews()
}

// 过滤评论
const filteredReviews = computed(() => {
  if (!searchText.value) return reviews.value

  const keyword = searchText.value.toLowerCase()
  return reviews.value.filter(review => 
    review.product_title?.toLowerCase().includes(keyword) ||
    review.content?.toLowerCase().includes(keyword)
  )
})

// 分页数据
const paginatedReviews = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredReviews.value.slice(start, end)
})

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 处理删除
const handleDelete = async (review: any) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条评论吗？此操作不可恢复',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await axios.delete(`/api/yang/reviews/${review.id}`)
    if (response.data.status === 0) {
      ElMessage.success('删除成功')
      await fetchReviews()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 处理图片URL，拼接完整路径
const formatImageUrl = (url: string) => {
  if (!url) return ''
  // 如果已经是完整路径，直接返回
  if (url.startsWith('http')) return url
  // 如果是相对路径，拼接基础URL
  return 'http://127.0.0.1:3000/' + url.replace(/^\//, '')
}

// 组件挂载时获取数据
onMounted(() => {
  if (isAdmin.value) {
    fetchSellers()
  }
  fetchReviews()
})
</script>

<style scoped>
.reviews-container {
  padding: 20px;
  min-width: 1200px;
}

.filter-section {
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
}

.search-input {
  width: 300px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 0;
}

.product-info img {
  width: 60px;
  height: 60px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-rate) {
  --el-rate-void-color: #C6D1DE;
}

/* 确保图片预览显示在最顶层 */
:deep(.el-image-viewer__wrapper) {
  z-index: 2999 !important;
}

:deep(.el-image-viewer__mask) {
  z-index: 2998 !important;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}



/* 调整表格列的宽度 */
:deep(.el-table) {
  .el-table__cell {
    padding: 12px 0;
  }
}
</style>