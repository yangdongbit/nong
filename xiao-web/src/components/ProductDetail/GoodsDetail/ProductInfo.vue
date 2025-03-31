<template>
  <div class="product-info">
    <h2 class="product-title">{{ product.product_name }}</h2>
    <div class="product-price">¥{{ product.price }}/斤</div>
    <div class="product-desc">
      {{ product.title }}
    </div>
    <div class="product-meta">
      <div class="meta-item">
        <span class="meta-label">产地：</span>
        <span>{{ product.shelf_life }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">规格：</span>
        <span>{{ product.specification }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">储存方式：</span>
        <span>{{ product.storage_method }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">保质期：</span>
        <span>7天</span>
      </div>
    </div>
    <div class="quantity-control">
      <button class="quantity-btn" @click="updateQuantity(-1)">-</button>
      <input
        type="number"
        class="quantity-input"
        v-model="quantity"
        min="1"
      />
      <button class="quantity-btn" @click="updateQuantity(1)">+</button>
    </div>
    <div class="action-buttons">
      <button class="btn btn-secondary" @click="addToCart">
        加入购物车
      </button>
      <button class="btn btn-primary" @click="buyNow">立即购买</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLoginStore } from '../../../nweStore/logins';
import axios from 'axios';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const loginStore = useLoginStore();
const quantity = ref(1);

const emit = defineEmits(['showMessage']);

const updateQuantity = (delta) => {
  const newValue = quantity.value + delta;
  if (newValue >= 1) {
    quantity.value = newValue;
  }
};

const addToCart = () => {
  if (Object.keys(loginStore.Loginuser).length !== 0) {
    axios({
      url: "/api/yang/add_cat",
      method: "POST",
      data: {
        user_id: loginStore.Loginuser.id,
        product_id: props.product.id,
        quantity: quantity.value
      },
    })
    .then((result) => {
      if (result.status === 200) {
        emit('showMessage', "成功添加到购物车", "success");
      } else {
        emit('showMessage', "服务器繁忙，请稍后重试", "error");
        console.error("添加购物车失败:", result);
      }
    })
    .catch((error) => {
      emit('showMessage', "服务器繁忙，请稍后重试", "error");
      console.error("添加购物车错误:", error);
    });
  } else {
    emit('showMessage', "请先登录后再操作", "warning");
    router.push("/logins");
  }
};

const buyNow = () => {
  const totalPrice = (props.product.price * quantity.value).toFixed(2);
  router.push({
    path: '/BuyNow',
    query: {
      id: props.product.id,
      price: totalPrice,
      quantity: quantity.value
    }
  });
};
</script>

<style scoped>
.product-info {
  flex: 1;
}

.product-title {
  font-size: 24px;
  margin-bottom: 20px;
}

.product-price {
  color: #2ecc71;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
}

.product-desc {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.product-meta {
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  margin-bottom: 10px;
  color: #666;
}

.meta-label {
  width: 80px;
  color: #999;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.quantity-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  font-size: 18px;
}

.quantity-input {
  width: 60px;
  height: 36px;
  text-align: center;
  border: 1px solid #ddd;
}

.action-buttons {
  display: flex;
  gap: 20px;
}

.btn {
  flex: 1;
  padding: 12px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn-primary {
  background: #2ecc71;
  color: white;
}

.btn-secondary {
  background: #ff9f43;
  color: white;
}
</style> 