<template>
  <div class="merchant-registration">
    <header class="header">
      <h1>选择经营模式</h1>
    </header>

    <div class="container">
      <router-link to="/" class="back-btn">返回首页</router-link>
      
      <div class="type-selection">
        <div class="type-card" @click="selectType('platform')">
          <div class="type-icon">🏢</div>
          <h2 class="type-title">平台回收模式</h2>
          <p class="type-desc">适合想要快速销售农产品的农户，平台提供上门回收服务</p>
          <div class="features">
            <div class="feature-item">无需管理店铺</div>
            <div class="feature-item">平台统一定价</div>
            <div class="feature-item">专业物流配送</div>
            <div class="feature-item">快速回款结算</div>
          </div>
          <button class="select-btn">选择此模式</button>
        </div>

        <div class="type-card" @click="selectType('self')">
          <div class="type-icon">🏪</div>
          <h2 class="type-title">自营店铺模式</h2>
          <p class="type-desc">适合想要自主经营的农户，可以自由定价和管理店铺</p>
          <div class="features">
            <div class="feature-item">自主定价权</div>
            <div class="feature-item">个性化店铺</div>
            <div class="feature-item">灵活库存管理</div>
            <div class="feature-item">直接客户沟通</div>
          </div>
          <button class="select-btn">选择此模式</button>
        </div>
      </div>
    </div>
    <CustomerService></CustomerService>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import CustomerService from '../CustomerService.vue';

const router = useRouter()

const selectType = (type) => {
  // 存储商家类型
  localStorage.setItem('merchantType', type)
  // 根据选择的类型跳转到不同的管理页面
  if (type === 'platform') {
    router.push('/StoreManage1')  // 平台回收模式
  } else {
    router.push('/StoreManage2')  // 自营店铺模式
  }
}
</script>

<style scoped>
.merchant-registration {
  min-height: 100vh;
  background-color: #f5f5f5;
  font-family: "Microsoft YaHei", sans-serif;
}

.header {
  background-color: #8acd58;
  color: white;
  padding: 15px 0;
  text-align: center;
}

.container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
}

.back-btn {
  display: inline-block;
  padding: 8px 16px;
  background: #f1f1f1;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  margin-bottom: 20px;
}

.type-selection {
  display: flex;
  gap: 30px;
  justify-content: center;
}

.type-card {
  flex: 1;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s;
  cursor: pointer;
}

.type-card:hover {
  transform: translateY(-10px);
}

.type-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.type-title {
  font-size: 24px;
  color: #10b981;
  margin-bottom: 15px;
}

.type-desc {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.features {
  text-align: left;
  margin: 20px 0;
}

.feature-item {
  display: flex;
  align-items: center;
  margin: 10px 0;
  color: #666;
}

.feature-item:before {
  content: "✓";
  color: #10b981;
  margin-right: 10px;
}

.select-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.select-btn:hover {
  background: #059669;
}

@media (max-width: 768px) {
  .type-selection {
    flex-direction: column;
    align-items: center;
  }

  .type-card {
    width: 100%;
  }
}
</style> 