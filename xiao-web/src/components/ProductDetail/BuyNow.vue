<template>
  <myTop2></myTop2>
  <div class="buy-now-container">
    <div class="header">
      <a href="#" class="back-button" @click="fanhui(id)">&#8249; 返回</a>
      <div class="title">订单确认</div>
      <img class="logo" src="http://127.0.0.1:3000/yang/img/img/logo.png" alt="农乐购 Logo">
    </div>
    <div class="content">
      <div class="left-column">
        <div class="address-section">
          <h3>收货地址</h3>
          <div 
            class="address-text" 
            @click="showAddressForm = true"
            :class="{ 'has-address': selectedAddress }"
          >
            <template v-if="selectedAddress">
              <div class="address-content">
                <div class="user-info">
                  <span class="name">{{ selectedAddress.name }}</span>
                  <span class="phone">{{ selectedAddress.phone }}</span>
                </div>
                <div class="address-line">
                  {{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detailAddress }}
                </div>
              </div>
              <div class="edit-hint">
                <span class="iconfont">&#xe65c;</span>
                <span>修改</span>
              </div>
            </template>
            <template v-else>
              <div class="add-address">
                <span class="plus">+</span>
                <span>添加收货地址</span>
              </div>
            </template>
          </div>
        </div>
        <div class="product-section">
          <h3>商品信息</h3>
          <div class="products-container">
            <div class="item" v-for="(product, index) in products" :key="product.id">
              <img :src="product.imgSrc" alt="产品图片" class="item-image" />
              <div class="item-details">
                <div class="item-name">{{ product.title }}</div>
                <div class="item-price">{{ price.split(",").map(item => Number(item))[index] }}￥</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right-column">
        <div class="order-summary">
          <h3>订单摘要</h3>
          <div class="summary-list">
            <div class="summary-item">
              <span class="label">商品总额</span>
              <span class="value price">{{ computedData }}￥</span>
            </div>
            <div class="summary-item">
              <span class="label">运费</span>
              <span class="value">免运费</span>
            </div>
            <div class="summary-item">
              <span class="label">优惠券</span>
              <span class="value">无</span>
            </div>
            <div class="summary-item note">
              <span class="label">订单备注</span>
              <input 
                v-model="noteInput"
                type="text" 
                placeholder="选填，请先和商家协商一致" 
                class="note-input"
              />
            </div>
          </div>
          <div class="total-section">
            <div class="total-row">
              <span class="total-label">总计</span>
              <span class="total-amount">{{ computedData }}￥</span>
            </div>
            <button class="submit-button" @click="sub">提交订单</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 模态框 -->
    <div v-if="showAddressForm" class="modal-overlay">
      <div class="modal-content">
        <AddressForm 
          @address-saved="handleAddressSaved" 
          @select-address="handleAddressSelect"
          @close-modal="showAddressForm = false"
        />
        <button class="close-modal" @click="showAddressForm = false">x</button>
      </div>
    </div>
    

   </div>
   <myFooter></myFooter>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEvaluationsStore } from "../../nweStore/evaluations";
import { storeToRefs } from "pinia";
import AddressForm from './AddressForm.vue';
import myTop2 from "../ShopHomePage/myTop2.vue";
import myFooter from "../myFooter.vue";

// 获取路由对象
const route = useRoute();
const router = useRouter();
// 获取路由参数中的 id
const id = route.query.id;
// 获取价格
const price = route.query.price   // 传过来的价格
 // console.log(price.split(",").map(item => Number(item)));




let products = ref([]);  // 商品具数据

const showAddressForm = ref(false);
const selectedAddress = ref('');

const handleAddressSaved = (address) => {
  selectedAddress.value = address;
  showAddressForm.value = false;
};

const handleAddressSelect = (address) => {
  selectedAddress.value = address;
};

// pinia数据
const evaluationsStore = useEvaluationsStore();
const { farms } = storeToRefs(evaluationsStore);


// onMounted
onMounted(async () => {
  await evaluationsStore.getfarms();

  products.value = farms.value.filter(obj => id.split(",").map(item => Number(item)).includes(obj.id))
  
  console.log(farms.value.filter(obj => id.split(",").map(item => Number(item)).includes(obj.id)));
  
});

// 返回按钮
const fanhui = ()=> {
  router.go(-1);
}

// 计算商品总额
const computedData = computed(() => price.split(",").map(item => Number(item)).reduce((acc, curr) => acc + curr, 0));

// 添加订单备注的 ref
const noteInput = ref('');

// 提交订单
const sub = () => {
  // 检查是否选择了收货地址
  if (!selectedAddress.value) {
    alert('请选择收货地址');
    return;
  }
  
  router.push({
    path: '/Pay',
    query: {
      id: id,
      price: price,
      address: JSON.stringify(selectedAddress.value),
      note: noteInput.value // 现在可以直接使用 noteInput.value
    }
  })
}
</script>

<style scoped>
.buy-now-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.back-button {
  font-size: 18px;
  color: #333;
  text-decoration: none;
  transition: color 0.3s ease;
}

.back-button:hover {
  color: #ff6700;
}

.title {
  font-size: 24px;
  font-weight: bold;
}

.logo {
  width: 100px;
  height: auto;
}

.content {
  display: flex;
  gap: 30px;
  align-items: stretch;
}

.left-column {
  flex: 2;
  display: flex;
  flex-direction: column;
}

.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.address-text{
    cursor: pointer;
}

.address-section, .product-section, .order-summary {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
}

.products-container {
  height: 300px;
  overflow-y: auto;
  padding-right: 10px;
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #ff6700 #f5f5f5;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-top: 10px;
}

.products-container::-webkit-scrollbar {
  width: 6px;
}

.products-container::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.products-container::-webkit-scrollbar-thumb {
  background: #ff6700;
  border-radius: 3px;
}

.item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.item:last-child {
  border-bottom: none;
}

.item:hover {
  background-color: #f8f9fa;
  transform: translateX(5px);
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 15px;
  border-radius: 4px;
  transition: transform 0.3s ease;
}

.item:hover .item-image {
  transform: scale(1.05);
}

.item-details {
  flex-grow: 1;
}

.item-name {
  font-size: 16px;
  margin-bottom: 5px;
}

.item-price {
  font-size: 16px;
  color: #ff6700;
  font-weight: bold;
}

.summary-list {
  flex: 1;
  margin-top: 15px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-item .label {
  color: #666;
  font-size: 14px;
}

.summary-item .value {
  color: #333;
  font-weight: 500;
}

.summary-item .price {
  color: #ff6700;
  font-weight: bold;
}

.summary-item.note {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.note-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.note-input:focus {
  border-color: #ff6700;
  box-shadow: 0 0 0 2px rgba(255, 103, 0, 0.1);
  outline: none;
}

.total-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #f0f0f0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.total-label {
  font-size: 16px;
  color: #333;
  font-weight: bold;
}

.total-amount {
  font-size: 24px;
  color: #ff6700;
  font-weight: bold;
}

.submit-button {
  width: 100%;
  padding: 12px 0;
  background-color: #ff6700;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button:hover {
  background-color: #f25807;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 103, 0, 0.2);
}

.submit-button:active {
  transform: translateY(0);
}

input[type="text"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input[type="text"]:hover, input[type="text"]:focus {
  border-color: #ff6700;
  box-shadow: 0 0 5px rgba(255, 103, 0, 0.3);
}

.order-summary {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    align-items: center;
  }

  .footer-section {
    text-align: center;
    margin-bottom: 30px;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-modal {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ff6700;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.address-text {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  margin-top: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-text:hover {
  border-color: #ff6700;
  box-shadow: 0 2px 8px rgba(255, 103, 0, 0.1);
}

.address-content {
  flex: 1;
}

.user-info {
  margin-bottom: 8px;
}

.user-info .name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-right: 15px;
}

.user-info .phone {
  color: #666;
}

.address-line {
  color: #333;
  line-height: 1.5;
}

.edit-hint {
  color: #999;
  font-size: 14px;
  display: flex;
  align-items: center;
  margin-left: 20px;
}

.edit-hint span {
  margin-left: 5px;
}

.add-address {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff6700;
  font-size: 16px;
}

.add-address .plus {
  font-size: 20px;
  margin-right: 8px;
  font-weight: bold;
}

.address-text.has-address {
  background-color: #fafafa;
}

.address-text.has-address:hover {
  background-color: #fff;
}

</style>
