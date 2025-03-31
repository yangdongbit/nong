<template>
  <div class="payment-success">
    <div class="success-card">
      <div class="success-icon">✓</div>
      <h2>支付成功</h2>
      <p class="order-id">订单号：{{ orderId }}</p>
      <div class="amount">￥{{ amount }}</div>
      <div class="actions">
        <button class="view-order" @click="viewOrder">查看订单</button>
        <button class="back-home" @click="goHome">返回首页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const orderId = route.query.orderId
const amount = route.query.amount

const viewOrder = () => {
  router.push(`/order/${orderId}`)
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.payment-success {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  padding: 20px;
}

.success-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  max-width: 400px;
  width: 100%;
}

.success-icon {
  width: 72px;
  height: 72px;
  line-height: 72px;
  background: #f6ffed;
  color: #52c41a;
  border-radius: 50%;
  font-size: 36px;
  margin: 0 auto 24px;
}

h2 {
  color: #333;
  margin-bottom: 16px;
  font-size: 24px;
}

.order-id {
  color: #666;
  margin-bottom: 16px;
  font-size: 14px;
}

.amount {
  color: #ff4d4f;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 32px;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.actions button {
  padding: 10px 24px;
  border-radius: 24px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.view-order {
  background: #1890ff;
  color: white;
  border: none;
}

.view-order:hover {
  background: #40a9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.back-home {
  background: white;
  color: #1890ff;
  border: 1px solid #1890ff;
}

.back-home:hover {
  color: #40a9ff;
  border-color: #40a9ff;
  transform: translateY(-2px);
}
</style> 