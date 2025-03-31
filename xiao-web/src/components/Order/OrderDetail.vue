<template>
  <div class="order-detail">
    <div v-if="loading" class="loading">
      加载中...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <template v-else-if="orderInfo.order_id">
      <div class="header">
        <span class="back" @click="goBack">&lt;</span>
        <span>订单详情</span>
        <span></span>
      </div>

      <div class="main">
        <!-- 订单状态 -->
        <div class="status-section">
          <h3>订单状态</h3>
          <div class="status">{{ getStatusText(orderInfo.order_status) }}</div>
        </div>

        <!-- 收货地址 -->
        <div class="address-section">
          <h3>收货地址</h3>
          <div class="address" v-if="orderInfo.shipping_address">
            <div class="user-info">
              <span class="name">{{ shippingAddress.name }}</span>
              <span class="phone">{{ shippingAddress.phone }}</span>
            </div>
            <div class="address-text">
              {{ shippingAddress.province }}{{ shippingAddress.city }}{{ shippingAddress.district }}{{ shippingAddress.detailAddress }}
            </div>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="products-section">
          <h3>商品信息</h3>
          <div class="product-list">
            <div class="product-item" v-for="item in orderItems" :key="item.id">
              <img :src="item.imgSrc" :alt="item.title" class="product-img">
              <div class="product-info">
                <div class="title">{{ item.title }}</div>
                <div class="price">￥{{ item.order_price }}</div>
              </div>
            </div>
          </div>
          <div class="product-summary">
            共{{ orderItems.length }}件商品
          </div>
        </div>

        <!-- 订单信息 -->
        <div class="order-info">
          <h3>订单信息</h3>
          <div class="info-item">
            <span>订单编号：</span>
            <span>{{ orderInfo.order_id }}</span>
          </div>
          <div class="info-item">
            <span>创建时间：</span>
            <span>{{ formatDate(orderInfo.created_at) }}</span>
          </div>
          <div class="info-item">
            <span>支付时间：</span>
            <span>{{ formatDate(orderInfo.payment_time) }}</span>
          </div>
          <div class="info-item">
            <span>订单备注：</span>
            <span>{{ orderInfo.order_note || '无' }}</span>
          </div>
        </div>

        <!-- 支付信息 -->
        <div class="payment-info">
          <h3>支付信息</h3>
          <div class="total-amount">
            <span>实付款：</span>
            <span class="amount">￥{{ orderInfo.total_amount }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id
const orderInfo = ref({})
const orderItems = ref([])
const shippingAddress = ref({})
const loading = ref(true)
const error = ref('')

// 获取订单详情
const fetchOrderDetail = async () => {
  try {
    loading.value = true
    error.value = ''
    
    console.log('正在获取订单:', orderId)
    const response = await axios.get(`/api/yang/order/detail/${orderId}`)
    console.log('订单详情响应:', response.data)
    
    if (response.data.status === 0) {
      orderInfo.value = response.data.data
      // 解析收货地址
      if (orderInfo.value.shipping_address) {
        shippingAddress.value = JSON.parse(orderInfo.value.shipping_address)
      }
      // 获取订单商品详情
      await fetchOrderItems()
    } else {
      throw new Error(response.data.message)
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    error.value = '获取订单详情失败: ' + (error.response?.data?.message || error.message)
  } finally {
    loading.value = false
  }
}

// 获取订单商品详情
const fetchOrderItems = async () => {
  try {
    const response = await axios.get(`/api/yang/order/items/${orderId}`)
    if (response.data.status === 0) {
      orderItems.value = response.data.data
    }
  } catch (error) {
    console.error('获取订单商品详情失败:', error)
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

// 返回上一页
const goBack = () => {
  router.go(-1)
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.order-detail {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 15px;
}

.header {
  padding: 15px 20px;
  background: linear-gradient(135deg, #1890ff, #36a3ff);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.back {
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s;
}

.back:hover {
  transform: translateX(-3px);
}

.main > div {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

h3 {
  color: #333;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

h3::before {
  content: '';
  width: 4px;
  height: 16px;
  background: #1890ff;
  border-radius: 2px;
}

.status {
  display: inline-block;
  padding: 6px 16px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.address {
  background: #fafafa;
  padding: 15px;
  border-radius: 8px;
}

.user-info {
  margin-bottom: 10px;
}

.name {
  font-weight: 500;
  margin-right: 15px;
}

.phone {
  color: #666;
}

.address-text {
  color: #666;
  line-height: 1.5;
}

.product-item {
  display: flex;
  padding: 15px 0;
  gap: 15px;
  border-bottom: 1px solid #f5f5f5;
}

.product-item:last-child {
  border-bottom: none;
}

.product-img {
  width: 90px;
  height: 90px;
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
}

.product-info .price {
  color: #ff4d4f;
  font-weight: bold;
  font-size: 16px;
}

.product-summary {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
  color: #666;
  font-size: 14px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.info-item span:first-child {
  color: #666;
}

.info-item span:last-child {
  color: #333;
}

.payment-info {
  background: #fff9f9;
}

.total-amount {
  text-align: right;
  font-size: 14px;
  color: #666;
}

.amount {
  color: #ff4d4f;
  font-size: 24px;
  font-weight: bold;
  margin-left: 8px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.loading {
  color: #666;
}

.error {
  color: #ff4d4f;
}
</style> 