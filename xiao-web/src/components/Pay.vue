<template>
  <div class="box">
    <div class="header">
      <span class="back" @click="goback">⬅️</span>
      <span>支付界面</span>
      <span></span>
    </div>

    <div class="main">
      <div class="money">
        <h3>支付金额</h3>
        <p>
          ￥
          <span class="moneys">{{ prices.reduce((acc, curr) => acc + Number(curr), 0) }}</span>
        </p>
      </div>

      <div class="paytype">
        <h4>支付方式</h4>
        <div class="paytype-list">
          <div
            v-for="item in paymentTypes"
            :key="item.id"
            class="paytype-item"
            :class="{ active: selectedType === item.id }"
            @click="selectPayType(item.id)"
          >
            <div class="left">
              <img :src="item.img" alt="" />
              <span>{{ item.name }}</span>
            </div>
            <div class="right">
              <div class="radio-circle" :class="{ checked: selectedType === item.id }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button class="pay" @click="Pay">确认支付</button>

    <!-- 支付密码弹窗 -->
    <div class="payment-modal" v-if="isShow">
      <div class="modal-content">
        <div class="modal-header">
          <div class="zhiwen">支付密码</div>
          <div class="close" @click="clone">×</div>
        </div>
        <div class="modal-body">
          <p class="amount">
            ￥
            <span>{{ prices.reduce((acc, curr) => acc + Number(curr), 0) }}</span>
          </p>
          <div class="pwd-input">
            <ul>
              <li v-for="index in 6" :key="index">{{ index <= sum.length ? '*' : '' }}</li>
            </ul>
          </div>
          <div class="num-pad">
            <ul>
              <li v-for="n in 9" :key="n" @click="data_num" :data-num="n">{{ n }}</li>
              <li class="empty"></li>
              <li @click="data_num" data-num="0">0</li>
              <li @click="data_num" data-num="x" class="delete">
                <svg class="delete-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" />
                </svg>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 支付宝二维码弹窗 -->
    <div class="alipay-modal" v-if="showQRCode">
      <div class="alipay-content">
        <div class="alipay-header">
          <h2>支付宝支付</h2>
          <span class="close-alipay" @click="closeQRCode">&times;</span>
        </div>
        <div class="alipay-qrcode">
          <div id="qrcode-container"></div>
          <p class="amount">支付金额：<span class="price">￥{{ prices.reduce((acc, curr) => acc + Number(curr), 0) }}</span></p>
          <p class="scan-tip">请使用支付宝扫码支付</p>
        </div>
        <div id="status-container" class="status-text"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useProductfetcherStore } from "../nweStore/ProductFetcher";
import { useUserHub } from "../nweStore/UserHub";
import axios from "axios";

const router = useRouter();
const route = useRoute();

// 添加空值检查
const ids = route.query.id?.split(",") || [];
const prices = route.query.price?.split(",") || [];
const address = route.query.address ? JSON.parse(route.query.address) : null;
const orderNote = route.query.note || "";

// 获取商品和用户数据
const productStore = useProductfetcherStore();
const UserHub = useUserHub();

// 商品数据
const products = ref([]);

onMounted(async () => {
  // 获取商品和用户数据
  await productStore.getfarms();
  await UserHub.getUserHub();

  // 筛选出要购买的商品
  products.value = productStore.farms.filter(item =>
    ids.includes(item.id.toString())
  );

  // 在组件挂载后获取元素引用
  qrcodeContainer.value = document.getElementById('qrcode-container');
  statusContainer.value = document.getElementById('status-container');
});

// 支付方式数据
const paymentTypes = ref([
  {
    id: 1,
    name: "农乐付",
    img: "http://127.0.0.1:3000/yang/img/img/logo.png"
  },
  {
    id: 2,
    name: "支付宝支付",
    img: "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2Fc7c4907e-2ad6-494a-bf23-3eebb2918047%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1743330103&t=8d19cced521655cd7e25350d958495f3"
  }
]);

// 选中的支付方式
const selectedType = ref(null);

// 选择支付方式
const selectPayType = (id) => {
  selectedType.value = id;
};

const isShow = ref(false);
const num1 = ref("");
const numList = ref([]);
const xx = ref("");

// 使用 ref 来引用 DOM 元素
const qrcodeContainer = ref(null);
const statusContainer = ref(null);

// 添加控制二维码显示的状态
const showQRCode = ref(false);

// 修改支付按钮的处理函数
const Pay = async () => {
  if (!selectedType.value) {
    alert("请选择支付方式");
    return;
  }

  // 如果是支付宝支付
  if (selectedType.value === 2) {
    try {
      await handleAlipayPayment();
    } catch (error) {
      console.error('支付处理失败:', error);
      showQRCode.value = false; // 发生错误时隐藏容器
    }
  } else {
    // 原有的农乐付支付逻辑
    isShow.value = true;
  }
};

const clone = () => {
  isShow.value = false;
  num1.value = "";
  numList.value = [];
  xx.value = "";
};

const sum = ref('');
const data_num = (e) => {
  if (!e.target || !e.target.dataset) return;
  
  const num = e.target.dataset.num;
  if (num === "x") {
    sum.value = sum.value.slice(0, -1);
  } else {
    if (sum.value.length < 6) {
      sum.value += num;
    }
  }
};

// 监听密码长度
watch(() => sum.value, (newVal) => {
  if (newVal.length === 6) {
    validatePayment();
  }
});

// 添加处理状态标记
const isProcessing = ref(false);

// 验证支付密码
const validatePayment = async () => {
  if (isProcessing.value) return; // 防止重复提交
  
  try {
    isProcessing.value = true;
    if (!UserHub.UserHub?.[0]?.payment_password) {
      throw new Error('支付密码未设置');
    }

    if (sum.value === UserHub.UserHub[0].payment_password) {
      await handlePaymentSuccess();
    } else {
      handlePaymentError('支付密码错误');
    }
  } catch (error) {
    handlePaymentError(error.message);
  } finally {
    isProcessing.value = false;
    isShow.value = false; // 关闭支付密码弹窗
  }
};

// 处理支付成功
const handlePaymentSuccess = async () => {
  try {
    const response = await axios.post("/api/yang/payment/success", {
      userId: UserHub.UserHub[0].user_id,
      products: products.value.map((item, index) => ({
        id: item.id,
        price: prices[index]
      })),
      totalAmount: prices.reduce((acc, curr) => acc + Number(curr), 0),
      address: address,
      orderNote: orderNote
    });

    if (response.data.status === 0) {
      router.push({
        path: "/payment/success",
        query: {
          orderId: response.data.data.orderId,
          amount: prices.reduce((acc, curr) => acc + Number(curr), 0)
        }
      });
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('支付处理失败:', error);
    handlePaymentError(error.response?.data?.message || '支付失败');
  }
};

// 处理支付错误
const handlePaymentError = (message) => {
  // 显示错误消息...
  sum.value = ''; // 清空密码
};

// 返回按钮
const goback = () => {
  router.go(-1);
};

// 处理支付宝支付
const handleAlipayPayment = async () => {
  try {
    showQRCode.value = true;
    const response = await axios.post("/api/create-payment", {
      productName: "农产品订单",
      amount: prices.reduce((acc, curr) => acc + Number(curr), 0),
      products: products.value,
      address: address,
      userId: UserHub.UserHub[0].user_id,
      note: orderNote
    });

    if (response.data.success) {
      const qrcodeContainer = document.getElementById('qrcode-container');
      qrcodeContainer.innerHTML = `<img src="${response.data.qrcode}" alt="支付二维码">`;

      // 开始轮询订单状态
      const checkStatus = setInterval(async () => {
        try {
          const statusRes = await axios.get(`/api/order/status/${response.data.orderId}`);
          const statusContainer = document.getElementById('status-container');
          
          if (statusRes.data.success && statusRes.data.orderInfo) {
            const status = statusRes.data.orderInfo.status;
            
            if (status === 'TRADE_SUCCESS') {
              clearInterval(checkStatus);
              statusContainer.innerHTML = '支付成功';
              statusContainer.className = 'status-text success';
              setTimeout(() => {
                showQRCode.value = false;
                router.push({
                  path: "/payment/success",
                  query: {
                    orderId: response.data.orderId,
                    amount: prices.reduce((acc, curr) => acc + Number(curr), 0)
                  }
                });
              }, 1500);
            } else {
              statusContainer.innerHTML = '等待支付...';
            }
          }
        } catch (error) {
          console.error('查询订单状态失败:', error);
        }
      }, 2000);
    }
  } catch (error) {
    console.error('创建支付失败:', error);
    showQRCode.value = false;
  }
};

// 关闭二维码
const closeQRCode = () => {
  showQRCode.value = false;
};
</script>


<style scoped>
.box {
  position: relative;
  margin: 40px auto;
  width: 800px;
  min-height: 600px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header {
  padding: 0 24px;
  height: 60px;
  background-color: #8acd58;
  line-height: 60px;
  display: flex;
  justify-content: space-between;
  color: #fff;
  border-radius: 16px 16px 0 0;
}

.back {
  font-size: 24px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.back:hover {
  opacity: 0.8;
}

.money {
  margin: 30px;
  padding: 24px;
  background-color: #f8f9fa;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.money h3 {
  font-size: 18px;
  color: #333;
  font-weight: 500;
}

.moneys {
  font-size: 32px;
  font-weight: 600;
  color: #f60;
}

.paytype {
  margin: 30px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.paytype h4 {
  padding: 16px 24px;
  font-size: 16px;
  color: #666;
  border-bottom: 1px solid #f0f0f0;
}

.paytype-list {
  padding: 15px;
}

.paytype-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.paytype-item:hover {
  border-color: #1890ff;
  background-color: #f0f9ff;
}

.paytype-item.active {
  border-color: #1890ff;
  background-color: #e6f7ff;
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.left img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.right {
  position: relative;
  width: 24px;
  height: 24px;
}

.right input[type="radio"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.radio-circle {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s;
}

.radio-circle.checked {
  border-color: #1890ff;
}

.radio-circle.checked:after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  background: #1890ff;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.pay {
  display: block;
  margin: 30px auto 80px;
  width: 200px;
  height: 48px;
  border-radius: 24px;
  background-color: #8acd58;
  border: none;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.pay:hover {
  background-color: #a2e08e;
}

/* 支付密码弹窗样式 */
.payment-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #817a7a77;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 400px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}

.modal-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.close {
  font-size: 24px;
  cursor: pointer;
  color: #999;
  transition: color 0.3s;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close:hover {
  color: #666;
  background-color: #f5f5f5;
}

.modal-body {
  padding: 24px;
}

.amount {
  text-align: center;
  font-size: 24px;
  color: #333;
  margin-bottom: 24px;
}

.pwd-input ul {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.pwd-input li {
  width: 45px;
  height: 45px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: #f8f9fa;
}

.num-pad ul {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.num-pad li {
  height: 48px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.num-pad li:hover {
  background: #e6f7ff;
}

.num-pad .delete {
  background: #fff2f0;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.num-pad .delete:hover {
  background: #ffd6d6;
}

.num-pad .delete:hover .delete-icon {
  color: #ff1f1f;
  transform: scale(1.1);
}

.num-pad .delete:active {
  background: #ffbfbf;
}

.num-pad .delete:active .delete-icon {
  transform: scale(0.95);
}

.delete-icon {
  width: 24px;
  height: 24px;
  color: #ff4d4f;
  transition: all 0.3s;
}

.empty {
  background: transparent !important;
  cursor: default !important;
}

/* 自定义单选框样式 */
.custom-radio {
  display: block;
  position: relative;
  padding-left: 35px;
  cursor: pointer;
  user-select: none;
  width: 35px;
  height: 35px;
}

.custom-radio input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #1890ff;
}

.right input[type="radio"]:checked ~ .checkmark:after {
  display: block;
}

/* 调整右侧容器样式 */
.right {
  position: relative;
  width: 24px;
  height: 24px;
}

.right input[type="radio"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

/* 支付方式项的hover效果 */
.paytype-item:hover .checkmark {
  border-color: #1890ff;
}

/* 添加选中状态的样式 */
.paytype-item.selected {
  border-color: #1890ff;
  background-color: #e6f7ff;
}

.paytype-item.selected .checkmark {
  border-color: #1890ff;
}

.paytype-item.selected .checkmark:after {
  display: block;
}

.alipay-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.alipay-content {
  background: white;
  width: 360px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.alipay-header {
  background: #1677ff;
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alipay-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: normal;
}

.close-alipay {
  cursor: pointer;
  font-size: 24px;
}

.alipay-qrcode {
  padding: 24px;
  text-align: center;
  background: #f5f5f5;
}

#qrcode-container {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  padding: 10px;
  background: white;
  border-radius: 4px;
}

#qrcode-container img {
  width: 100%;
  height: 100%;
}

.amount {
  margin: 16px 0 8px;
  color: #333;
}

.price {
  font-size: 20px;
  color: #f60;
  font-weight: bold;
}

.scan-tip {
  color: #666;
  font-size: 14px;
}

.status-text {
  padding: 12px;
  text-align: center;
  color: #666;
  border-top: 1px solid #f0f0f0;
}

.status-text.success {
  color: #52c41a;
}

.status-text.error {
  color: #ff4d4f;
}
</style>