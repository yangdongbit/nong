<template>
  <div class="shop-info-card">
    <img
      src="https://via.placeholder.com/60"
      alt="店铺头像"
      class="shop-avatar"
    />
    <div class="shop-details">
      <div class="shop-name">鲜果优选自营店</div>
      <div class="shop-stats">
        <span>商品数: 238</span>
        <span>关注数: 1.2万</span>
        <span>好评率: 98%</span>
      </div>
    </div>
    <div class="shop-actions">
      <button
        class="shop-btn follow-btn"
        :class="{ followed: isFollowed }"
        @click="toggleFollow"
      >
        {{ isFollowed ? "已关注" : "+ 关注店铺" }}
      </button>
      <button class="shop-btn enter-shop-btn" @click="enterShop">
        进入店铺
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isFollowed = ref(false);

const toggleFollow = () => {
  isFollowed.value = !isFollowed.value;
  alert(isFollowed.value ? "关注成功！" : "已取消关注该店铺");
};

const enterShop = () => {
  router.push("/shop/1");
};
</script>

<style scoped>
.shop-info-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 15px;
}

.shop-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.shop-details {
  flex: 1;
}

.shop-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.shop-stats {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
}

.shop-actions {
  display: flex;
  gap: 10px;
}

.shop-btn {
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.follow-btn {
  background: #fff;
  border: 1px solid #2ecc71;
  color: #2ecc71;
}

.follow-btn:hover {
  background: #2ecc71;
  color: white;
}

.follow-btn.followed {
  background: #eee;
  border-color: #999;
  color: #666;
}

.enter-shop-btn {
  background: #2ecc71;
  border: 1px solid #2ecc71;
  color: white;
}

.enter-shop-btn:hover {
  background: #27ae60;
}
</style> 