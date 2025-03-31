<template>
  <div class="merchant-registration">
    <header class="header">
      <h1>农乐购回收管理系统</h1>
    </header>

    <div class="container">
      <!-- 左侧菜单 -->
      <div class="sidebar">
        <div :class="['menu-item', { active: currentTab === 'supply' }]" @click="currentTab = 'supply'">
          供货登记
        </div>
        <div :class="['menu-item', { active: currentTab === 'records' }]" @click="currentTab = 'records'">
          回收记录
        </div>
        <div :class="['menu-item', { active: currentTab === 'settlement' }]" @click="currentTab = 'settlement'">
          结算中心
        </div>
        <div :class="['menu-item', { active: currentTab === 'about' }]" @click="currentTab = 'about'">
          关于我们
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="main-content">
        <!-- 供货登记页面 -->
        <div v-if="currentTab === 'supply'">
          <!-- 供货须知，根据 showSupplyForm 状态显示/隐藏 -->
          <div class="upload-notice" v-show="!showSupplyForm">
            <h3>📢 供货须知</h3>
            <div class="notice-content">
              <p>1. 农产品要求：</p>
              <ul>
                <li>保证产品新鲜度和品质</li>
                <li>符合农产品质量标准</li>
                <li>包装完整无损</li>
              </ul>
              <p>2. 回收流程：</p>
              <ul>
                <li>提交供货信息</li>
                <li>平台24小时内上门验收</li>
                <li>当场确认价格和数量</li>
                <li>签署回收单据</li>
              </ul>
              <p>3. 结算方式：</p>
              <ul>
                <li>验收合格后3个工作日内结算</li>
                <li>支持银行卡或支付宝到账</li>
              </ul>
            </div>
            <button class="btn btn-primary" @click="showSupplyForm = true">
              开始登记供货信息
            </button>
          </div>

          <!-- 供货表单 -->
          <div v-show="showSupplyForm" class="supply-form-container">
            <h2>供货登记</h2>
            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label class="form-label">农产品名称</label>
                <input v-model="formData.name" type="text" class="form-input" required>
              </div>

              <div class="form-group">
                <label class="form-label">预计供货量(kg)</label>
                <input v-model="formData.quantity" type="number" class="form-input" required>
              </div>

              <div class="form-group">
                <label class="form-label">预计采摘时间</label>
                <input v-model="formData.harvestDate" type="date" class="form-input" required>
              </div>

              <div class="form-group">
                <label class="form-label">供货地址</label>
                <input v-model="formData.address" type="text" class="form-input" required>
              </div>

              <div class="form-group">
                <label class="form-label">联系电话</label>
                <input v-model="formData.phone" type="tel" class="form-input" required>
              </div>

              <div class="form-group">
                <label class="form-label">备注说明</label>
                <textarea v-model="formData.notes" class="form-input"></textarea>
              </div>

              <button type="submit" class="btn btn-primary">提交供货信息</button>
            </form>
          </div>
        </div>

        <!-- 回收记录页面 -->
        <div v-if="currentTab === 'records'">
          <h2>回收记录</h2>
          <div class="records-list">
            <!-- 添加空状态显示 -->
            <div v-if="!supplyRecords.length" class="empty-state">
              <img src="http://124.223.88.78:3000/yang/img/img/logo.png" alt="空状态图片" class="empty-image">
              <p class="empty-text">暂无回收记录</p>
              <button class="btn btn-primary" @click="currentTab = 'supply'">
                去登记供货信息
              </button>
            </div>
            
            <!-- 有数据时显示记录列表 -->
            <div v-else v-for="record in supplyRecords" :key="record.id" class="record-item">
              <div class="record-header">
                <!-- 订单号使用 id -->
                <span class="record-id">订单号：{{ record.id }}</span>
                <!-- 根据 doing 状态显示不同颜色 -->
                <span :class="['record-status', record.doing === '未完成' ? 'pending' : 'success']">
                  {{ record.doing }}
                </span>
              </div>
              <div class="record-content">
                <!-- 左侧图片 -->
                <div class="record-image">
                  <img src="http://124.223.88.78:3000/yang/img/img/logo.png" alt="农产品图片">
                </div>
                <!-- 右侧信息 -->
                <div class="record-info">
                  <p><strong>农产品：</strong>{{ record.product_name }}</p>
                  <p><strong>供货量：</strong>{{ record.estimated_supply }}kg</p>
                  <p><strong>采摘时间：</strong>{{ formatDate(record.harvest_date) }}</p>
                  <p><strong>供货地址：</strong>{{ record.supply_address }}</p>
                  <p><strong>联系电话：</strong>{{ record.contact_phone }}</p>
                  <p><strong>结算金额：</strong>{{ record.money === '暂无' ? '待定' : `¥${record.money}` }}</p>
                  <p v-if="record.notes"><strong>备注：</strong>{{ record.notes }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 结算中心页面 -->
        <div v-if="currentTab === 'settlement'">
          <h2>结算中心</h2>
          <div class="settlement-info">
            <div class="balance-card">
              <h3>账户余额</h3>
              <div class="balance">¥{{ UserHub.UserHub[0]?.balance }}</div>
              <button class="btn btn-primary">申请提现</button>
            </div>
            <div class="settlement-records">
              <h3>结算记录</h3>
              <div class="settlement-item">
                <span>2024-01-20</span>
                <span>回收款项</span>
                <span class="amount">+¥2500.00</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 关于我们页面 -->
        <div v-if="currentTab === 'about'" class="about-container">
          <div class="mission-section">
            <h2>我们的使命</h2>
            <div class="mission-cards">
              <div class="mission-card" @click="showMissionDetail('assist')">
                <div class="mission-icon">🌾</div>
                <h3>助农增收</h3>
                <p>通过上门收购服务，解决农民"卖难"问题，让农产品不再愁销路</p>
              </div>
              <div class="mission-card" @click="showMissionDetail('direct')">
                <div class="mission-icon">🚛</div>
                <h3>产地直达</h3>
                <p>专业物流配送，确保农产品新鲜送达，减少中间环节</p>
              </div>
              <div class="mission-card" @click="showMissionDetail('fair')">
                <div class="mission-icon">💰</div>
                <h3>公平交易</h3>
                <p>合理定价机制，保障农民利益，实现农民增收</p>
              </div>
            </div>
          </div>

          <div class="map-section">
            <h2>服务网点</h2>
            <div id="container" class="amap-container"></div>
          </div>
        </div>
      </div>
    </div>
    <CustomerService />
    <div class="modal" v-if="showModal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ currentMission.title }}</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="mission-detail">
            <div class="mission-icon large">{{ currentMission.icon }}</div>
            <h4>{{ currentMission.subtitle }}</h4>
            <div class="detail-content">
              <div v-for="(item, index) in currentMission.details" :key="index" class="detail-item">
                <div class="detail-icon">✓</div>
                <div class="detail-text">{{ item }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="custom-toast" ref="toastRef">
      <span class="toast-message">供货信息提交成功！平台将在24小时内联系您安排回收。</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, onUpdated } from 'vue'
import { useRouter } from 'vue-router'
import CustomerService from '../CustomerService.vue'
import { useUserHub } from "../../nweStore/UserHub"; // 个人中心数据
import axios from 'axios';
const UserHub = useUserHub();

const router = useRouter()
const currentTab = ref('supply')
const showSupplyForm = ref(false)

const loginData = JSON.parse(localStorage.getItem('Login')); // 获取登录数据从本地

const formData = reactive({
  name: '',
  quantity: '',
  harvestDate: '',
  address: '',
  phone: '',
  notes: ''
})

const toastRef = ref(null);

// 存储供货记录数据
const supplyRecords = ref([]);

// 格式化日期的方法
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 显示提示的方法
const showToast = () => {
  const toast = toastRef.value;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000); // 3秒后消失
};

// 修改 handleSubmit 方法，使用新的提示
const handleSubmit = () => {
  console.log('提交的供货信息：', formData)
  // 上传到后端
  if (loginData && loginData.Loginuser && loginData.Loginuser.name && loginData.Loginuser.password) {
    axios({
      url: 'api/yang/upload_goods',
      method: 'post',
      data: {
        product_name: formData.name,
        estimated_supply: formData.quantity,
        harvest_date: formData.harvestDate,
        supply_address: formData.address,
        contact_phone: formData.phone,
        notes: formData.notes,
        user_id: loginData.Loginuser.id
      }
    }).then(res => {
      console.log(res)
      showToast() // 使用新的提示方法
      showSupplyForm.value = false
      // 重置表单
      Object.keys(formData).forEach(key => formData[key] = '')
    })
  }
}

const backToHome = () => {
  router.push('/')
}

// 获取供货信息
const getSupplyInfo = () => {
  if (loginData && loginData.Loginuser && loginData.Loginuser.name && loginData.Loginuser.password) {
    console.log(loginData.Loginuser.id);
    // 获取供货信息
    axios({
      url: 'api/yang/get_goods',
      method: 'post',
      data: {
        user_id: loginData.Loginuser.id
      }
    }).then(res => {
      // 将获取的数据保存到 supplyRecords
      supplyRecords.value = res.data;
      console.log('供货记录：', res.data);
    })
  }
}

// 监听 currentTab 变化
watch(currentTab, (newVal) => {
  if (newVal === 'about') {
    nextTick(() => {
      initMap()
    })
  }
})

// 将地图初始化逻辑封装成函数
const initMap = () => {
  // 加载高德地图
  const map = new AMap.Map('container', {
    zoom: 5,
    center: [112.987890, 28.005366],
    viewMode: '3D',
    mapStyle: 'amap://styles/fresh'
  })

  // 添加定位控件
  const geolocation = new AMap.Geolocation({
    enableHighAccuracy: true,
    timeout: 10000,
    buttonPosition: 'RB',
    buttonOffset: new AMap.Pixel(10, 20),
    zoomToAccuracy: true
  })
  map.addControl(geolocation)

  // 添加比例尺控件
  const scale = new AMap.Scale()
  map.addControl(scale)

  // 添加全国各省服务网点标记
  const markers = [
    {
      position: [112.987890, 28.005366],
      title: '长沙总部',
      content: '长沙市天心区服务中心'
    },
    {
      position: [121.472644, 31.231706],
      title: '上海中心',
      content: '上海市浦东新区服务中心'
    },
    {
      position: [113.280637, 23.125178],
      title: '广州中心',
      content: '广州市天河区服务中心'
    },
    {
      position: [104.065735, 30.659462],
      title: '成都中心',
      content: '成都市锦江区服务中心'
    },
    {
      position: [108.948024, 34.263161],
      title: '西安中心',
      content: '西安市雁塔区服务中心'
    },
    {
      position: [126.642464, 45.756967],
      title: '哈尔滨中心',
      content: '哈尔滨市南岗区服务中心'
    },
    {
      position: [114.298572, 30.584355],
      title: '武汉中心',
      content: '武汉市武昌区服务中心'
    },
    {
      position: [120.153576, 30.287459],
      title: '杭州中心',
      content: '杭州市西湖区服务中心'
    },
    {
      position: [139.7333, 35.6833],
      title: '日本中心',
      content: '日本市东京区服务中心'
    }
  ]

  // 创建信息窗体
  const createInfoWindow = (content) => {
    return new AMap.InfoWindow({
      content: `
        <div class="marker-content">
          <h4>${content}</h4>
          <p>服务时间：9:00-18:00</p>
          <p>联系电话：173-4710-8353</p>
        </div>
      `,
      offset: new AMap.Pixel(0, -30),
      closeWhenClickMap: true,
      anchor: 'bottom-center'
    })
  }

  // 监听地图缩放事件
  map.on('zoomend', () => {
    const zoom = map.getZoom()
    // 增大基础系数，从12改为20，并增加最小和最大尺寸
    markers.forEach(marker => {
      const size = Math.max(100, Math.min(200, zoom * 20)) // 修改最小值为100px，最大值为200px
      marker.marker.setIcon(new AMap.Icon({
        size: new AMap.Size(size, size),
        image: 'http://124.223.88.78:3000/yang/img/img/logo.png',
        imageSize: new AMap.Size(size, size)
      }))
    })
  })

  // 添加标记和信息窗体
  markers.forEach(markerInfo => {
    const size = Math.max(100, Math.min(200, map.getZoom() * 20)) // 同样修改初始大小
    const marker = new AMap.Marker({
      position: markerInfo.position,
      title: markerInfo.title,
      animation: 'AMAP_ANIMATION_DROP',
      icon: new AMap.Icon({
        size: new AMap.Size(size, size),
        image: 'http://124.223.88.78:3000/yang/img/img/logo.png',
        imageSize: new AMap.Size(size, size)
      })
    })

    const infoWindow = createInfoWindow(markerInfo.content)

    // 点击标记时打开信息窗体
    marker.on('click', () => {
      infoWindow.open(map, marker.getPosition())
    })

    map.add(marker)
    markerInfo.marker = marker // 保存marker引用以便后续更新
  })
}

// 在组件挂载时如果当前是 about 页面就初始化地图
onMounted(() => {
  if (currentTab.value === 'about') {
    initMap()
  }
  UserHub.getUserHub()  // 获取当前用户的数据
  getSupplyInfo()  // 获取供货信息
})

onUpdated(() => {
  console.log(UserHub.UserHub);

})

const showModal = ref(false)
const currentMission = ref({})

const missionDetails = {
  assist: {
    icon: '🌾',
    title: '助农增收计划',
    subtitle: '让每一位农民都能轻松销售农产品',
    details: [
      '提供上门收购服务，节省农民运输成本',
      '保证收购价格，让农民收入有保障',
      '提供农业技术指导，提高产品品质',
      '建立长期合作关系，稳定销售渠道',
      '开展农产品品牌化建设，提升产品价值'
    ]
  },
  direct: {
    icon: '🚛',
    title: '产地直达服务',
    subtitle: '打造高效农产品供应链',
    details: [
      '建立冷链物流体系，保证产品新鲜度',
      '优化配送路线，缩短运输时间',
      '提供全程温控监测，保证品质',
      '实现产地到餐桌的全程可追溯',
      '减少中间环节，降低流通成本'
    ]
  },
  fair: {
    icon: '💰',
    title: '公平交易保障',
    subtitle: '创造共赢的交易环境',
    details: [
      '采用市场化定价机制，确保价格公平',
      '提供透明的价格信息服务',
      '建立农产品价格保护机制',
      '设立农民权益保障基金',
      '提供及时结算服务，保障农民收益'
    ]
  }
}

const showMissionDetail = (type) => {
  currentMission.value = missionDetails[type]
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}



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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.main-content {
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.btn-edit,
.btn-delete {
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

.record-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.record-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
}

.record-id {
  font-weight: bold;
  color: #666;
}

/* 状态样式 */
.record-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.record-status.pending {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.record-status.success {
  background-color: #f0f9eb;
  color: #67c23a;
}

/* 记录内容布局 */
.record-content {
  display: flex;
  gap: 20px;
}

.record-image {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
}

.record-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.record-info {
  flex: 1;
}

.record-info p {
  margin: 8px 0;
  color: #666;
}

.record-info strong {
  color: #333;
  margin-right: 8px;
}

.balance-card {
  background: #10b981;
  color: white;
  padding: 24px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 24px;
}

.balance {
  font-size: 32px;
  font-weight: bold;
  margin: 16px 0;
}

.settlement-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.amount {
  color: #10b981;
  font-weight: bold;
}

.about-container {
  padding: 20px;
}

.mission-section {
  margin-bottom: 40px;
}

.mission-section h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #10b981;
}

.mission-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.mission-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  cursor: pointer;
}

.mission-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.mission-icon {
  font-size: 36px;
  margin-bottom: 16px;
}

.mission-card h3 {
  color: #10b981;
  margin-bottom: 12px;
}

.mission-card p {
  color: #666;
  line-height: 1.6;
}

.map-section {
  margin-top: 40px;
}

.map-section h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #10b981;
}

.amap-container {
  width: 100%;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.marker-content {
  padding: 10px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  line-height: 1.5;
}

.amap-info-content {
  padding: 0 !important;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 12px;
  overflow: hidden;
}

.modal-header {
  background: #10b981;
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0 8px;
}

.modal-body {
  padding: 24px;
}

.mission-detail {
  text-align: center;
}

.mission-icon.large {
  font-size: 48px;
  margin-bottom: 16px;
}

.mission-detail h4 {
  color: #374151;
  margin-bottom: 24px;
}

.detail-content {
  text-align: left;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}

.detail-icon {
  color: #10b981;
  margin-right: 12px;
  font-weight: bold;
}

.detail-text {
  color: #4b5563;
  line-height: 1.5;
}

/* 添加提示框样式 */
.custom-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(-100px);
  background-color: #67C23A;
  color: white;
  padding: 15px 25px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  opacity: 0;
  transition: all 0.3s ease;
  font-size: 16px;
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

/* 添加空状态样式 */
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