<template>
  <div class="merchant-registration">
    <!-- 添加自定义提示框 -->
    <div class="custom-toast" ref="toastRef">
      <span class="toast-message"></span>
    </div>
    
    <!-- 页面头部 -->
    <header class="header">
      <h1>农乐购自营店铺管理系统</h1>
    </header>

    <div class="container">
      <!-- 左侧导航菜单 -->
      <div class="sidebar">
        <div 
          :class="['menu-item', { active: currentTab === 'upload' }]" 
          @click="currentTab = 'upload'"
        >
          上传商品
        </div>
        <div 
          :class="['menu-item', { active: currentTab === 'manage' }]" 
          @click="currentTab = 'manage'"
        >
          商品管理
        </div>
        <div 
          :class="['menu-item', { active: currentTab === 'orders' }]" 
          @click="currentTab = 'orders'"
        >
          订单管理
        </div>
        <div 
          :class="['menu-item', { active: currentTab === 'settings' }]" 
          @click="currentTab = 'settings'"
        >
          店铺设置
        </div>
      </div>

      <!-- 右侧主要内容区域 -->
      <div class="main-content">
        <!-- 上传商品页面 -->
        <div v-if="currentTab === 'upload'">
          <!-- 商品上传须知提示 -->
          <div class="upload-notice" v-show="!showUploadForm">
            <h3>📢 上传商品须知</h3>
            <div class="notice-content">
              <p>1. 商品图片要求：</p>
              <ul>
                <li>图片清晰，真实反映商品外观</li>
                <li>建议尺寸：800x800像素以上</li>
                <li>支持格式：JPG、PNG</li>
              </ul>
              <p>2. 商品信息要求：</p>
              <ul>
                <li>商品名称准确描述，不含特殊字符</li>
                <li>价格设置合理，符合市场行情</li>
                <li>商品描述详细、真实</li>
              </ul>
              <p>3. 注意事项：</p>
              <ul>
                <li>所有生鲜商品必须标注保质期和储存方式</li>
                <li>进口商品需标明原产地</li>
                <li>商品规格需标注重量误差范围</li>
              </ul>
            </div>
            <button class="btn btn-primary" @click="showUploadForm = true">
              我已了解，开始上传
            </button>
          </div>

          <!-- 商品上传表单 -->
          <div v-show="showUploadForm" class="upload-form-container">
            <h2>上传新商品</h2>
            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label class="form-label">商品名称</label>
                <input v-model="formData.name" type="text" class="form-input" required>
              </div>
              
              <div class="form-group">
                <label class="form-label">商品图片</label>
                <input type="file" class="form-input" @change="handleImageUpload" accept="image/*" required>
                <img v-if="formData.imageUrl" :src="formData.imageUrl" class="preview-image">
              </div>

              <div class="form-group">
                <label class="form-label">商品价格</label>
                <input v-model="formData.price" type="number" step="0.01" class="form-input" required>
              </div>

              <div class="form-group">
                <label class="form-label">商品分类</label>
                <select v-model="formData.category" class="form-input" required>
                  <option value="fruit">新鲜水果</option>
                  <option value="vegetable">时令蔬菜</option>
                  <option value="imported">进口生鲜</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">商品描述</label>
                <textarea v-model="formData.description" class="form-input" required></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">产地</label>
                <input v-model="formData.origin" type="text" class="form-input" required>
              </div>

              <div class="form-group">
                <label class="form-label">规格</label>
                <input v-model="formData.specifications" type="text" class="form-input" required>
              </div>

              <div class="form-group">
                <label class="form-label">储存方式</label>
                <input v-model="formData.storage_method" type="text" class="form-input" required>
              </div>

              <div class="form-group">
                <label class="form-label">保质期</label>
                <input v-model="formData.shelf_life" type="text" class="form-input" required>
              </div>

              <button type="submit" class="btn btn-primary">上传商品</button>
            </form>
          </div>
        </div>

        <!-- 商品管理页面 -->
        <div v-if="currentTab === 'manage'">
          <h2>商品管理</h2>
          <div class="product-list">
            <!-- 添加空状态显示 -->
            <div v-if="!products.length" class="empty-state">
              <img src="http://124.223.88.78:3000/yang/img/img/logo.png" alt="空状态图片" class="empty-image">
              <p class="empty-text">暂无商品</p>
              <button class="btn btn-primary" @click="currentTab = 'upload'">
                去上传商品
              </button>
            </div>
            
            <!-- 有数据时显示商品列表 -->
            <div v-else v-for="product in products" :key="product.id" class="product-item">
              <img :src="`http://127.0.0.1:3000${product.product_image}`" :alt="product.product_name">
              <div class="product-info">
                <h3>{{ product.product_name }}</h3>
                <p>价格：¥{{ product.product_price }}</p>
                <p>分类：{{ product.product_category }}</p>
                <p>产地：{{ product.origin }}</p>
                <p>规格：{{ product.specifications }}</p>
                <p>状态：{{ product.status || '在售' }}</p>
              </div>
              <div class="product-actions">
                <button class="btn-edit" @click="editProduct(product)">编辑</button>
                <button class="btn-delete" @click="deleteProduct(product.id)">下架</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 订单管理页面 -->
        <div v-if="currentTab === 'orders'">
          <h2>订单管理</h2>
          <div class="order-list">
            <div class="order-item">
              <div class="order-header">
                <span class="order-id">订单号：2024020101</span>
                <span class="order-status">待发货</span>
              </div>
              <div class="order-content">
                <div class="order-product">
                  <img src="http://124.223.88.78:3000/yang/img/img/logo.png" alt="商品图片">
                  <div class="product-detail">
                    <h4>新鲜水果</h4>
                    <p>数量：2件</p>
                    <p>金额：¥198.00</p>
                  </div>
                </div>
                <div class="order-actions">
                  <button class="btn-primary">发货</button>
                  <button class="btn-secondary">联系买家</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 店铺设置页面 -->
        <div v-if="currentTab === 'settings'" class="settings-container">
          <h2>店铺设置</h2>
          <div class="shop-profile">
            <!-- 店铺头像 -->
            <div class="avatar-section">
              <div class="avatar-wrapper" @click="triggerAvatarUpload">
                <img 
                  :src="settingsForm.avatarUrl || 'http://124.223.88.78:3000/yang/img/img/logo.png'" 
                  class="shop-avatar"
                >
                <div class="avatar-overlay">
                  <span>点击更换头像</span>
                </div>
              </div>
              <input 
                type="file" 
                ref="avatarInput"
                @change="handleAvatarUpload" 
                accept="image/*" 
                style="display: none"
              >
            </div>

            <!-- 店铺信息 -->
            <div class="info-section">
              <div class="info-item" @click="startEdit('shopName')">
                <div class="info-label">店铺名称</div>
                <div v-if="!editingField.shopName" class="info-content">
                  {{ settingsForm.shopName || 'default的生鲜店' }}
                  <span class="edit-icon">✎</span>
                </div>
                <input
                  v-else
                  v-model="settingsForm.shopName"
                  @blur="finishEdit('shopName')"
                  @keyup.enter="finishEdit('shopName')"
                  ref="shopNameInput"
                  class="edit-input"
                  type="text"
                >
              </div>

              <div class="info-item" @click="startEdit('description')">
                <div class="info-label">店铺简介</div>
                <div v-if="!editingField.description" class="info-content">
                  {{ settingsForm.description || '专注优质农产品，让您吃得放心，让农民增收致富' }}
                  <span class="edit-icon">✎</span>
                </div>
                <textarea
                  v-else
                  v-model="settingsForm.description"
                  @blur="finishEdit('description')"
                  ref="descriptionInput"
                  class="edit-input"
                  rows="3"
                ></textarea>
              </div>

              <div class="info-item" @click="startEdit('phone')">
                <div class="info-label">联系电话</div>
                <div v-if="!editingField.phone" class="info-content">
                  {{ settingsForm.phone || '未设置' }}
                  <span class="edit-icon">✎</span>
                </div>
                <input
                  v-else
                  v-model="settingsForm.phone"
                  @blur="finishEdit('phone')"
                  @keyup.enter="finishEdit('phone')"
                  ref="phoneInput"
                  class="edit-input"
                  type="tel"
                >
              </div>

              <div class="info-item" @click="startEdit('address')">
                <div class="info-label">经营地址</div>
                <div v-if="!editingField.address" class="info-content">
                  {{ settingsForm.address || '未设置' }}
                  <span class="edit-icon">✎</span>
                </div>
                <input
                  v-else
                  v-model="settingsForm.address"
                  @blur="finishEdit('address')"
                  @keyup.enter="finishEdit('address')"
                  ref="addressInput"
                  class="edit-input"
                  type="text"
                >
              </div>

              <div class="info-item">
                <div class="info-label">营业时间</div>
                <div class="time-range">
                  <input
                    type="time"
                    v-model="settingsForm.openTime"
                    class="time-input"
                  >
                  <span>至</span>
                  <input
                    type="time"
                    v-model="settingsForm.closeTime"
                    class="time-input"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 客服组件 -->
    <CustomerService />
  </div>
</template>

<script setup>
// 导入所需的组件和函数
import { ref, reactive, nextTick, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CustomerService from '../CustomerService.vue'
import axios from 'axios'

// 路由实例
const router = useRouter()

// 当前选中的标签页
const currentTab = ref('upload')

// 控制是否显示上传表单
const showUploadForm = ref(false)

// 商品表单数据
const formData = reactive({
  name: '',          // 商品名称
  image: null,       // 商品图片文件
  imageUrl: '',      // 商品图片预览URL
  price: '',         // 商品价格
  category: '',      // 商品分类
  description: '',   // 商品描述
  origin: '',        // 产地
  specifications: '', // 规格（改名以匹配后端）
  storage_method: '', // 储存方式（改以匹配后端）
  shelf_life: ''     // 保质期
})

// 店铺设置表单数据
const settingsForm = reactive({
  shopName: '',      // 店铺名称
  description: '',   // 店铺描述
  avatarUrl: '',     // 店铺头像
  phone: '',         // 联系电话
  address: '',       // 经营地址
  openTime: '09:00', // 营业开始时间
  closeTime: '21:00' // 营业结束时间
})

// 控制各字段是否处于编辑状态
const editingField = reactive({
  shopName: false,
  description: false,
  phone: false,
  address: false
})

// 头像上传相关
const avatarInput = ref(null)
const triggerAvatarUpload = () => {
  avatarInput.value.click()
}

// 开始编辑字段
const startEdit = (field) => {
  editingField[field] = true
  nextTick(() => {
    const inputRef = refs[`${field}Input`]
    if (inputRef) {
      inputRef.value.focus()
    }
  })
}

// 完成编辑字段
const finishEdit = (field) => {
  editingField[field] = false
  console.log(`${field} 已更新为:`, settingsForm[field])
}

// 处理图片上传
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    formData.image = file
    formData.imageUrl = URL.createObjectURL(file)
  }
}

// 处理表单提交
const handleSubmit = async () => {
  try {
    // 验证必要字段
    if (!formData.image) {
      throw new Error('请选择商品图片');
    }
    if (!formData.name) {
      throw new Error('请输入商品名称');
    }

    // 从本地存储获取用户ID
    const loginData = JSON.parse(localStorage.getItem('Login'));
    const userId = loginData?.Loginuser?.id;
    if (!userId) {
      throw new Error('请先登录');
    }

    // 创建 FormData 对象
    const formDataToSend = new FormData();
    
    // 按照后端期望的顺序添加字段
    formDataToSend.append('userId', userId);
    formDataToSend.append('name', formData.name);
    formDataToSend.append('image', formData.image);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('origin', formData.origin);
    formDataToSend.append('specifications', formData.specifications);
    formDataToSend.append('storage_method', formData.storage_method);
    formDataToSend.append('shelf_life', formData.shelf_life);

    // 打印发送的数据（调试用）
    // for (let pair of formDataToSend.entries()) {
    //   console.log('发送的数据:', pair[0], pair[1]);
    // }

    // 发送请求
    const response = await axios.post('api/yang/upload-product', formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('服务器响应:', response);

    if (response.data.code === 200) {
      showToast('商品上传成功！');
      showUploadForm.value = false;
      // 重置表单
      Object.keys(formData).forEach(key => formData[key] = '');
      formData.imageUrl = ''; // 清除图片预览
    } else {
      throw new Error(response.data.message || '上传失败');
    }
  } catch (error) {
    console.error('上传失败详细信息:', error);
    let errorMessage = '上传失败：';
    
    if (error.response) {
      errorMessage += error.response.data.message || '服务器错误';
      console.error('服务器响应:', error.response.data);
    } else if (error.request) {
      errorMessage += '网络连接失败';
      console.error('没有收到响应');
    } else {
      errorMessage += error.message;
    }
    
    showToast(errorMessage, 'error');
  }
};

// 添加商品列表的响应式引用
const products = ref([]);

// 获取商品列表
const getProducts = async () => {
  try {
    const loginData = JSON.parse(localStorage.getItem('Login'));
    const userId = loginData?.Loginuser?.id;
    if (!userId) {
      showToast('请先登录', 'error');
      return;
    }

    const response = await axios.post('api/yang/get-product', {
      user_id: userId
    });

    if (response.data) {
      products.value = response.data;
      // console.log('商品列表:', products.value);
    }
  } catch (error) {
    console.error('获取商品列表失败:', error);
    showToast('获取商品列表失败', 'error');
  }
};

// 编辑商品
const editProduct = (product) => {
  // TODO: 实现编辑功能
  console.log('编辑商品:', product);
  alert('编辑功能开发中...');
};

// 下架商品
const deleteProduct = async (productId) => {
  if (confirm('确定要下架此商品吗？')) {
    try {
      const response = await axios.post('api/yang/delete-product', {
        productId: productId
      });

      if (response.data.code === 200) {
        showToast('商品已下架');
        // 重新获取商品列表
        getProducts();
      } else {
        throw new Error(response.data.message || '下架失败');
      }
    } catch (error) {
      console.error('下架商品失败:', error);
      showToast('下架商品失败', 'error');
    }
  }
};

// 监听标签页变化
watch(currentTab, (newTab) => {
  if (newTab === 'manage') {
    getProducts();
  }
});

// 在组件挂载时获取商品列表
onMounted(() => {
  if (currentTab.value === 'manage') {
    getProducts();
  }
});

// 返回首页
const backToHome = () => {
  router.push('/')
}

// 处理头像上传
const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    settingsForm.avatarUrl = URL.createObjectURL(file)
  }
}

const toastRef = ref(null);

// 显示提示的方法
const showToast = (message, type = 'success') => {
  const toast = toastRef.value;
  toast.querySelector('.toast-message').textContent = message;
  toast.className = `custom-toast ${type}`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
};
</script>

<style scoped>
.merchant-registration {
  min-height: 100vh;
  background-color: #f5f5f5;
  font-family: "Microsoft YaHei", sans-serif;
}

.header {
  background-color: #10b981;
  color: white;
  padding: 15px 0;
  text-align: center;
}

.container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  display: flex;
  gap: 20px;
}

.sidebar {
  width: 200px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.main-content {
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.menu-item {
  padding: 10px;
  margin: 5px 0;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.menu-item:hover {
  background: #f0f0f0;
}

.menu-item.active {
  background: #2ecc71;
  color: white;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 5px;
}

.form-input:focus {
  border-color: #2ecc71;
  outline: none;
  box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.1);
}

textarea.form-input {
  height: 100px;
  resize: vertical;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.btn-primary {
  background: #2ecc71;
  color: white;
}

.btn-primary:hover {
  background: #27ae60;
}

.product-list {
  margin-top: 20px;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.product-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 20px;
  border-radius: 4px;
}

.product-info {
  flex: 1;
}

.product-actions {
  display: flex;
  gap: 10px;
}

.btn-edit, .btn-delete {
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-edit {
  background: #3498db;
  color: white;
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  margin-top: 10px;
  display: none;
}

.upload-notice {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.upload-notice h3 {
  color: #2ecc71;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.notice-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  margin-bottom: 20px;
}

.notice-content p {
  font-weight: bold;
  margin: 15px 0 5px 0;
  color: #2ecc71;
}

.notice-content ul {
  list-style: none;
  margin-left: 20px;
}

.notice-content li {
  margin: 8px 0;
  color: #666;
  position: relative;
}

.notice-content li:before {
  content: "•";
  color: #2ecc71;
  font-weight: bold;
  position: absolute;
  left: -15px;
}

.upload-notice .btn {
  width: 100%;
  margin-top: 10px;
}

#uploadFormContainer {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.order-list {
  margin-top: 20px;
}

.order-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
  margin-bottom: 12px;
}

.order-status {
  color: #10b981;
  font-weight: bold;
}

.order-product {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.order-product img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.product-detail h4 {
  margin: 0 0 8px 0;
}

.order-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.settings-container {
  padding: 20px;
}

.shop-profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.avatar-section {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.shop-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #10b981;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.info-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.info-item {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}

.info-content {
  font-size: 16px;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-icon {
  color: #10b981;
  opacity: 0;
  transition: opacity 0.3s;
}

.info-item:hover .edit-icon {
  opacity: 1;
}

.edit-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #10b981;
  border-radius: 4px;
  font-size: 16px;
}

.time-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 120px;
}

.time-input:focus {
  border-color: #10b981;
  outline: none;
}

.custom-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(-100px);
  padding: 15px 25px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  opacity: 0;
  transition: all 0.3s ease;
  font-size: 16px;
}

.custom-toast.success {
  background-color: #67C23A;
  color: white;
}

.custom-toast.error {
  background-color: #F56C6C;
  color: white;
}

.custom-toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.toast-message {
  display: inline-block;
  padding-left: 10px;
  border-left: 3px solid rgba(255, 255, 255, 0.4);
}

/* 商品列表样式优化 */
.product-list {
  display: grid;
  gap: 20px;
  padding: 20px 0;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.product-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.product-item img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 20px;
}

.product-info {
  flex: 1;
}

.product-info h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 1.2em;
}

.product-info p {
  margin: 5px 0;
  color: #666;
}

.product-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-edit, .btn-delete {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit {
  background: #3498db;
  color: white;
}

.btn-edit:hover {
  background: #2980b9;
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background: #c0392b;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 20px 0;
}

.empty-image {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-text {
  color: #909399;
  font-size: 16px;
  margin-bottom: 20px;
}
</style>