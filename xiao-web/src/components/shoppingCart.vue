<template>
  <div class="shoppingCart">
    <!-- 购物车头部 -->
    <div class="cart-header">
      <div class="cart-header-content">
        <p>
          <i
            class="el-icon-shopping-cart-full"
            style="color: #ff6700; font-weight: 600"
          ></i>
          我的购物车
        </p>
        <span>温馨提示：产品是否购买成功，以最终下单为准哦，请尽快结算</span>
      </div>
    </div>
    <!-- 购物车头部END -->

    <!-- 购物车主要内容区 -->
    <div class="content" v-if="shoppingCart.length > 0">
      <ul>
        <!-- 购物车表头 -->
        <li class="header">
          <div class="pro-check">
            <el-checkbox v-model="isAllCheck" @change="handleAllCheck"
              >全选</el-checkbox
            >
          </div>
          <div class="pro-img"></div>
          <div class="pro-name">商品名称</div>
          <div class="pro-price">单价</div>
          <div class="pro-num">数量</div>
          <div class="pro-total">小计</div>
          <div class="pro-action">操作</div>
        </li>
        <!-- 购物车表头END -->

        <!-- 购物车列表 -->
        <li
          class="product-list"
          v-for="(item, index) in shoppingCart"
          :key="item.id"
          :data-id="item.id"
        >
          <div class="pro-check">
            <el-checkbox
              v-model="item.check"
              @change="checkChange($event, index)"
            ></el-checkbox>
          </div>
          <div class="pro-img">
            <router-link :to="{ path: `/GoodsDetail/${item.id} ` }">
              <img :src="item.imgSrc" />
            </router-link>
          </div>
          <div class="pro-name">
            <router-link :to="{ path: `/GoodsDetail/${item.id} ` }">
              {{ item.title }}
            </router-link>
            <div class="add-time">
              添加时间：{{ formatDate(item.added_time) }}
            </div>
          </div>
          <div class="pro-price">{{ Number(item.price).toFixed(2) }}元/斤</div>
          <div class="pro-num">
            <el-input-number
              size="small"
              v-model="item.num"
              @change="handleChange($event, item.id)"
              :min="1"
              :controls="true"
              @input="validateInput(index)"
              :step="1"
              step-strictly
            ></el-input-number>
          </div>
          <div class="pro-total pro-total-in">
            {{ (item.price * item.num).toFixed(2) }}元
          </div>
          <div class="pro-action">
            <el-popconfirm
              title="确定删除该商品吗？"
              @confirm="deleteItem(item.id)"
              confirm-button-text="确定"
              cancel-button-text="取消"
            >
              <template #reference>
                <el-button type="danger" size="small" class="delete-btn">
                  <i class="el-icon-delete"></i>
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </li>
        <!-- 购物车列表END -->
      </ul>
      <div style="height: 20px; background-color: #f5f5f5"></div>
      <!-- 购物车底部导航条 -->
      <div class="cart-bar">
        <div class="cart-bar-left">
          <span>
            <router-link to="/">继续购物</router-link>
          </span>
          <span class="sep">|</span>
          <span class="cart-total">
            共
            <span class="cart-total-num">{{ getNum }}</span> 件商品，已选择
            <span class="cart-total-num">{{ getCheckNum }}</span> 件
          </span>
        </div>
        <div class="cart-bar-right">
          <span>
            <span class="total-price-title">合计：</span>
            <span class="total-price">{{ getTotalPrice }}元</span>
          </span>
          <router-link :to="getBuyNowLink">
            <div
              :class="getCheckNum > 0 ? 'btn-primary' : 'btn-primary-disabled'"
            >
              去结算
            </div>
          </router-link>
        </div>
      </div>
      <!-- 购物车底部导航条END -->
    </div>
    <!-- 购物车主要内容区END -->

    <!-- 在购物车列表后面添加推荐商品区域 -->
    <div class="recommend-section" v-if="shoppingCart.length > 0">
      <h3 class="recommend-title">
        <span>猜你喜欢</span>
        <a href="#" class="refresh-btn">
          <i class="el-icon-refresh"></i>
          换一批
        </a>
      </h3>
      <div class="recommend-list">
        <div class="recommend-item" v-for="item in recommendProducts" :key="item.id">
          <img :src="item.imgSrc" :alt="item.title">
          <h4>{{ item.title }}</h4>
          <p class="recommend-price">{{ item.price }}元</p>
          <button class="add-to-cart-btn" @click="addToCart(item)">加入购物车</button>
        </div>
      </div>
    </div>

    <!-- 修改空购物车的展示 -->
    <div v-else class="cart-empty">
      <div class="empty">
        <img src="http://127.0.0.1:3000/yang/img/img/logo.png" alt="空购物车" class="empty-cart-img">
        <h2>购物车还是空的！</h2>
        <p>快去挑选心仪的商品吧~</p>
        <div class="empty-actions">
          <router-link to="/" class="btn-primary">去首页逛逛</router-link>
          <router-link to="/user/favorites" class="btn-secondary">查看收藏夹</router-link>
        </div>
      </div>
      
      <!-- 添加分类快捷入口 -->
      <div class="category-shortcuts">
        <h3>商品分类</h3>
        <div class="category-list">
          <router-link to="LookAll?category=水果" class="category-item">
            <i class="category-icon">🍎</i>
            <span>新鲜水果</span>
          </router-link>
          <router-link to="LookAll?category=蔬菜" class="category-item">
            <i class="category-icon">🥬</i>
            <span>时令蔬菜</span>
          </router-link>
          <router-link to="/LookAll?category=禽畜肉蛋" class="category-item">
            <i class="category-icon">🥩</i>
            <span>肉禽蛋品</span>
          </router-link>
          <router-link to="/LookAll?category=粮油米面" class="category-item">
            <i class="category-icon">🌾</i>
            <span>粮油调味</span>
          </router-link>
        </div>
      </div>
    </div>
    <!-- 购物车为空的时候显示的内容END -->
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUpdated, watchEffect } from "vue";
import { ElMessage } from "element-plus";
import { useLoginStore } from "../nweStore/logins";
import { useEvaluationsStore } from "../nweStore/evaluations";
import axios from "axios";
// 购物车数据
import { useCatStore } from "../nweStore/shop_cat";

const loginStore = useLoginStore();
const Evaluations = useEvaluationsStore();

const CatStore = useCatStore();

// 购物车数据
const shoppingCart = ref([]);
const userShop = ref([]);

// 修改初始化购物车的方法
const initShoppingCart = () => {
  // 直接将购物车数据转换为所需格式
  const cartItems = CatStore.shopCat.map(cartItem => {
    const product = Evaluations.farms.find(item => item.id === cartItem.product_id);
    if (product) {
      return {
        ...product,
        num: cartItem.quantity,
        check: false,
        added_time: cartItem.added_time
      };
    }
    return null;
  }).filter(item => item !== null);

  // 更新购物车数据
  shoppingCart.value = cartItems;
};

onMounted(async () => {
  try {
    // 同时获取所需数据
    await Promise.all([
      Evaluations.getfarms(),
      loginStore.getLoginuser(),
      CatStore.getshopCat()
    ]);

    // 初始化购物车
    initShoppingCart();
  } catch (error) {
    console.error("初始化购物车失败:", error);
    ElMessage.error("加载购物车数据失败，请刷新页面重试");
  }
});

// 方案1：使用计数器
let updateCount = 0;
onUpdated(() => {
  if (updateCount === 0) {
    console.log(CatStore.shopCat);
  }
  updateCount = (updateCount + 1) % 2;
});

// 监听登录用户数据变化
watch(
  () => loginStore.Loginuser,   
  (newVal) => {
    if (newVal?.product_id) {
      initShoppingCart();
    }
  },
  { deep: true }
);

// 全选状态
const isAllCheck = ref(false);

// 计算属性
const getCheckNum = computed(() => {
  return shoppingCart.value.filter((item) => item.check).length;
});

const getTotalPrice = computed(() => {
  return shoppingCart.value
    .reduce((total, item) => {
      return item.check ? total + item.price * item.num : total;
    }, 0)
    .toFixed(2);
});

const getNum = computed(() => {
  return shoppingCart.value.length;
});

// 方法
const handleChange = async (value, productId) => {
  try {
    // 确保数量不小于1
    if (value < 1) {
      value = 1;
    }

    // 找到对应商品的索引
    const itemIndex = shoppingCart.value.findIndex(item => item.id === productId);
    if (itemIndex !== -1) {
      shoppingCart.value[itemIndex].num = value;
    }

    // 发送更新请求
    await axios({
      url: "/api/yang/update_cart",
      method: "POST",
      data: {
        user_id: loginStore.Loginuser.id,
        product_id: productId,
        quantity: value
      }
    });
    
    // 更新成功后重新获取购物车数据
    await CatStore.getshopCat();
    ElMessage.success('更新成功');
  } catch (error) {
    console.error("更新购物车数量失败:", error);
    ElMessage.error("更新购物车数量失败，请重试");
  }
};

const checkChange = (value, index) => {
  shoppingCart.value[index].check = value;
  isAllCheck.value = shoppingCart.value.every((item) => item.check);
};

const handleAllCheck = (value) => {
  isAllCheck.value = value;
  shoppingCart.value.forEach((item) => {
    item.check = value;
  });
};

const deleteItem = async (id) => {
  try {
    await axios({
      url: "/api/yang/delete_cart",
      method: "POST",
      data: {
        user_id: loginStore.Loginuser.id,
        product_id: id
      }
    });

    // 删除成功后重新获取购物车数据
    await CatStore.getshopCat();
    
    // 更新本地购物车数据 - 使用 filter 而不是 splice
    shoppingCart.value = shoppingCart.value.filter(item => item.id !== id);

    // 更新全选状态
    if (shoppingCart.value.length === 0) {
      isAllCheck.value = false;
    } else {
      isAllCheck.value = shoppingCart.value.every(item => item.check);
    }

    ElMessage.success('删除成功');
  } catch (error) {
    console.error("删除购物车商品失败:", error);
    ElMessage.error("删除失败，请重试");
  }
};

// 添加输入验证方法
const validateInput = (index) => {
  const item = shoppingCart.value[index];
  if (item.num < 1 || isNaN(item.num)) {
    item.num = 1;
  }
};

// 监听购物车变化
watch(
  shoppingCart,
  (newVal) => {
    if (newVal.length > 0) {
      isAllCheck.value = newVal.every((item) => item.check);
    } else {
      isAllCheck.value = false;
    }
  },
  { deep: true }
);

// 添加一个计算属性来获取选中商品的ID和价格
const getSelectedItems = computed(() => {
  const selectedItems = shoppingCart.value.filter((item) => item.check);
  return {
    ids: selectedItems.map((item) => item.id).join(","),
    prices: selectedItems
      .map((item) => (item.price * item.num).toFixed(2))
      .join(","),
  };
});

// 添加一个计算属性来生成路由链接
const getBuyNowLink = computed(() => {
  if (getCheckNum.value > 0) {
    return `/BuyNow?id=${getSelectedItems.value.ids}&price=${getSelectedItems.value.prices}`;
  }
  return "";
});

// 添加对 CatStore.shopCat 的监听
watch(() => CatStore.shopCat, () => {
  initShoppingCart();
}, { deep: true });

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 添加推荐商品数据
const recommendProducts = computed(() => {
  return Evaluations.farms
    .filter(item => !shoppingCart.value.find(cartItem => cartItem.id === item.id))
    .slice(0, 4);
});

// 添加加入购物车方法
const addToCart = async (product) => {
  if (!loginStore.Loginuser.id) {
    ElMessage.warning('请先登录');
    router.push('/logins');
    return;
  }

  try {
    await axios({
      url: '/api/yang/add_cat',
      method: 'POST',
      data: {
        user_id: loginStore.Loginuser.id,
        product_id: product.id,
        quantity: 1
      }
    });
    
    await CatStore.getshopCat();
    ElMessage.success('添加成功');
  } catch (error) {
    console.error('添加购物车失败:', error);
    ElMessage.error('添加失败，请重试');
  }
};
</script>

<style scoped>
/* 全局样式优化 */
.shoppingCart {
  background: linear-gradient(135deg, #f8f9fa, #eef2f5);
  min-height: 100vh;
  padding: 20px 0 40px;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

/* 购物车头部优化 */
.cart-header {
  width: 1200px;
  margin: 0 auto 25px;
  padding: 15px 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border-left: 5px solid #ff6700;
}

.cart-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-header p {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  color: #333;
  font-weight: 600;
  margin: 0;
}

.header-logo {
  height: 50px;
  object-fit: contain;
}

.cart-header span {
  font-size: 14px;
  color: #666;
}

/* 主要内容区域优化 */
.content {
  width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* 表头优化 */
.content ul .header {
  display: grid;
  grid-template-columns: 80px 120px 2fr 1fr 1fr 1fr 120px;
  align-items: center;
  padding: 18px 30px;
  background: #f5f7fa;
  color: #555;
  font-size: 15px;
  font-weight: 600;
  border-bottom: 1px solid #eaeaea;
}

/* 商品列表优化 */
.product-list {
  display: grid;
  grid-template-columns: 80px 120px 2fr 1fr 1fr 1fr 120px;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.product-list:hover {
  background-color: #fafafa;
  transform: translateY(-1px);
}

/* 商品图片优化 */
.pro-img img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.3s;
  border: 1px solid #f0f0f0;
}

.pro-img img:hover {
  transform: scale(1.05);
}

/* 商品信息优化 */
.pro-name {
  padding-right: 20px;
}

.pro-name a {
  color: #333;
  text-decoration: none;
  font-size: 16px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  font-weight: 500;
}

.pro-name a:hover {
  color: #ff6700;
}

.add-time {
  margin-top: 8px;
  font-size: 13px;
  color: #999;
}

/* 价格和数量优化 */
.pro-price {
  color: #666;
  font-size: 16px;
  font-weight: 500;
}

.pro-total-in {
  color: #ff6700;
  font-weight: 600;
  font-size: 17px;
}

/* 数量控制器优化 */
:deep(.el-input-number) {
  width: 120px !important;
}

:deep(.el-input-number .el-input__wrapper) {
  box-shadow: 0 0 0 1px #e0e0e0 inset !important;
  height: 36px !important;
  border-radius: 6px;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  width: 30px;
}

/* 删除按钮优化 */
.delete-btn {
  padding: 7px 14px;
  font-size: 14px;
  color: #ff4d4f;
  border: 1px solid #ff4d4f !important;
  background: transparent;
  border-radius: 6px;
  transition: all 0.3s;
}

.delete-btn:hover {
  background-color: #ff4d4f;
  color: white;
}

/* 底部结算栏优化 */
.cart-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: white;
  border-top: 1px solid #f0f0f0;
}

.cart-bar-left {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 15px;
}

.cart-bar-left a {
  color: #666;
  text-decoration: none;
  transition: color 0.3s;
}

.cart-bar-left a:hover {
  color: #ff6700;
}

.cart-total {
  color: #666;
  font-size: 15px;
}

.cart-total-num {
  color: #ff6700;
  font-weight: 600;
  font-size: 16px;
}

.total-price-title {
  color: #666;
  font-size: 16px;
}

.total-price {
  color: #ff6700;
  font-size: 24px;
  font-weight: 600;
  margin-right: 20px;
}

/* 结算按钮优化 */
.btn-primary {
  padding: 12px 36px;
  background: linear-gradient(135deg, #ff6700, #ff8c00);
  color: white;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  box-shadow: 0 2px 8px rgba(255, 103, 0, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 103, 0, 0.4);
}

.btn-primary-disabled {
  padding: 12px 36px;
  background: #ccc;
  color: white;
  border-radius: 6px;
  font-size: 16px;
  cursor: not-allowed;
  border: none;
}

/* Checkbox优化 */
:deep(.el-checkbox__inner) {
  width: 18px !important;
  height: 18px !important;
  border-radius: 4px;
}

:deep(.el-checkbox__inner::after) {
  width: 6px !important;
  height: 10px !important;
}

:deep(.el-checkbox__label) {
  font-size: 14px;
}

/* 推荐商品区域优化 */
.recommend-section {
  width: 1200px;
  margin: 25px auto 0;
  background: white;
  border-radius: 12px;
  padding: 25px 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.recommend-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.recommend-title span {
  font-size: 20px;
  color: #333;
  font-weight: 600;
}

.refresh-btn {
  color: #666;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
  font-size: 14px;
}

.refresh-btn:hover {
  color: #ff6700;
}

.recommend-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.recommend-item {
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid #f0f0f0;
}

.recommend-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border-color: #ff6700;
}

.recommend-item img {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 12px;
  border: 1px solid #f0f0f0;
}

.recommend-item h4 {
  font-size: 15px;
  color: #333;
  margin-bottom: 8px;
  height: 40px;
  overflow: hidden;
  font-weight: 500;
}

.recommend-price {
  color: #ff6700;
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 12px;
}

.add-to-cart-btn {
  padding: 7px 20px;
  background: linear-gradient(135deg, #ff6700, #ff8c00);
  color: white;
  border: none;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.add-to-cart-btn:hover {
  background: linear-gradient(135deg, #ff5700, #ff7c00);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(255, 103, 0, 0.3);
}

/* 空购物车优化 */
.cart-empty {
  width: 1200px;
  margin: 0 auto;
  padding: 60px 0;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.empty h2 {
  color: #333;
  font-size: 22px;
  margin-bottom: 12px;
  font-weight: 600;
}

.empty p {
  color: #666;
  font-size: 15px;
  margin-bottom: 25px;
}

.empty-cart-img {
  width: 150px;
  margin-bottom: 20px;
  opacity: 0.8;
}

.empty-actions {
  margin-top: 25px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn-primary {
  padding: 12px 36px;
  background: linear-gradient(135deg, #ff6700, #ff8c00);
  color: white;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(255, 103, 0, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 103, 0, 0.4);
}

.btn-secondary {
  padding: 12px 36px;
  background: #f5f5f5;
  color: #666;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 15px;
  font-weight: 500;
}

.btn-secondary:hover {
  background: #e0e0e0;
  color: #333;
}

/* 分类快捷入口优化 */
.category-shortcuts {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #f0f0f0;
}

.category-shortcuts h3 {
  text-align: center;
  font-size: 18px;
  color: #333;
  margin-bottom: 25px;
  font-weight: 600;
}

.category-list {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #666;
  transition: all 0.3s;
  padding: 10px 15px;
  border-radius: 8px;
}

.category-item:hover {
  transform: translateY(-5px);
  color: #ff6700;
  background: #fff8f5;
}

.category-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.category-item span {
  font-size: 14px;
}

/* 分隔符 */
.sep {
  color: #ddd;
  margin: 0 10px;
}

/* 响应式设计 */
@media (max-width: 1240px) {
  .shoppingCart,
  .cart-header,
  .content,
  .recommend-section,
  .cart-empty {
    width: 95%;
  }
  
  .content ul .header,
  .product-list {
    grid-template-columns: 60px 100px 2fr 1fr 1fr 1fr 100px;
    padding: 15px 20px;
  }
  
  .recommend-list {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .category-list {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .cart-header-content {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .content ul .header,
  .product-list {
    grid-template-columns: 50px 80px 2fr 1fr;
    grid-template-areas: 
      "check img name name"
      "check img price price"
      "check img num total"
      "check img action action";
  }
  
  .pro-check { grid-area: check; }
  .pro-img { grid-area: img; }
  .pro-name { grid-area: name; }
  .pro-price { grid-area: price; }
  .pro-num { grid-area: num; }
  .pro-total { grid-area: total; }
  .pro-action { grid-area: action; }
  
  .pro-name,
  .pro-price,
  .pro-num,
  .pro-total,
  .pro-action {
    padding: 5px 0;
  }
  
  .cart-bar {
    flex-direction: column;
    gap: 15px;
  }
  
  .recommend-list {
    grid-template-columns: 1fr;
  }
  
  .empty-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>