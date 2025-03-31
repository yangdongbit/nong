<template>
  <div class="order-list">
    <div class="main">
      <div class="title-bar">
        <h2>我的订单</h2>
      </div>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
      
      <div v-else-if="error" class="error">
        <i class="error-icon">!</i>
        {{ error }}
      </div>
      
      <template v-else>
        <!-- 空订单提示 -->
        <div v-if="!orders.length" class="empty-state">
          <div class="empty-icon">📦</div>
          <div class="empty-text">暂无订单</div>
          <button class="go-shopping" @click="goShopping">去逛逛</button>
        </div>

        <!-- 订单列表 -->
        <div v-else class="order-item" v-for="order in orders" :key="order.order_id" @click="goToDetail(order.order_id)">
          <div class="order-header">
            <div class="left">
              <i class="order-icon">📦</i>
              <span class="order-id">订单号：{{ order.order_id }}</span>
            </div>
            <span class="order-status" :class="order.order_status">
              {{ getStatusText(order.order_status) }}
            </span>
          </div>
          
          <div class="order-content">
            <div class="product-list">
              <div class="product-item" v-for="product in order.products" :key="product.id">
                <img :src="product.imgSrc" :alt="product.title">
                <div class="product-info">
                  <div class="title">{{ product.title }}</div>
                  <div class="price">￥{{ product.price }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="order-footer">
            <div class="total">
              总计：<span class="amount">￥{{ order.total_amount }}</span>
            </div>
            <div class="order-meta">
              <span class="order-time">{{ formatDate(order.created_at) }}</span>
              <button class="detail-btn">查看详情 ></button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserHub } from '../../nweStore/UserHub'
import axios from 'axios'

const router = useRouter()
const UserHub = useUserHub()
const orders = ref([])
const loading = ref(true)
const error = ref('')

// 获取订单列表
const fetchOrders = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // 等待用户数据加载
    await UserHub.getUserHub()
    
    // 检查用户数据是否存在
    if (!UserHub.UserHub || !UserHub.UserHub[0]) {
      throw new Error('请先登录')
    }
    
    const userId = UserHub.UserHub[0].user_id
    const response = await axios.get(`/api/yang/orders/${userId}`)
    
    if (response.data.status === 0) {
      orders.value = response.data.data
    } else {
      throw new Error(response.data.message)
    }
  } catch (err) {
    console.error('获取订单列表失败:', err)
    error.value = '获取订单列表失败: ' + (err.response?.data?.message || err.message)
    
    // 如果是未登录错误，跳转到登录页
    if (err.message === '请先登录') {
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '暂无'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'pending': '待付款',
    'paid': '已付款',
    'shipped': '已发货',
    'delivered': '已送达',
    'completed': '已完成'
  }
  return statusMap[status] || status
}

// 跳转到订单详情
const goToDetail = (orderId) => {
  router.push(`/order/${orderId}`)
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 添加去购物的方法
const goShopping = () => {
  router.push('/')
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-list {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 15px;
}

.title-bar {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

h2 {
  font-size: 24px;
  color: #333;
  font-weight: 500;
}

.main {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.order-item {
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  background: #f8f8f8;
  transition: all 0.3s ease;
  cursor: pointer;
}

.order-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.order-header .left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.order-icon {
  font-size: 20px;
}

.order-id {
  color: #666;
  font-size: 14px;
}

.order-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.order-status.paid {
  background: #e6f7ff;
  color: #1890ff;
}

.order-status.shipped {
  background: #f6ffed;
  color: #52c41a;
}

.product-list {
  margin: 15px 0;
}

.product-item {
  display: flex;
  padding: 10px 0;
  gap: 15px;
  border-bottom: 1px solid #f5f5f5;
}

.product-item:last-child {
  border-bottom: none;
}

.product-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-info .title {
  color: #333;
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-info .price {
  color: #ff4d4f;
  font-weight: bold;
  font-size: 16px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.total {
  color: #666;
  font-size: 14px;
}

.amount {
  color: #ff4d4f;
  font-size: 18px;
  font-weight: bold;
  margin-left: 5px;
}

.order-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.order-time {
  color: #999;
  font-size: 13px;
}

.detail-btn {
  background: transparent;
  border: 1px solid #1890ff;
  color: #1890ff;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.detail-btn:hover {
  background: #1890ff;
  color: white;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f0f0f0;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 40px;
  color: #ff4d4f;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.error-icon {
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background: #fff2f0;
  border-radius: 50%;
  font-style: normal;
  font-weight: bold;
  color: #ff4d4f;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  color: #999;
  font-size: 16px;
  margin-bottom: 24px;
}

.go-shopping {
  background: #1890ff;
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.go-shopping:hover {
  background: #40a9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}
</style> 