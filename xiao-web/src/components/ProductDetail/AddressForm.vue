<template>
  <div class="address-form">
    <!-- 已有地址列表 -->
    <div class="existing-addresses" v-if="savedAddresses.length">
      <h3>已保存的地址</h3>
      <div 
        class="address-card" 
        v-for="(address, index) in savedAddresses" 
        :key="index"
        @click="selectAddress(address)"
        :class="{ 'selected': selectedAddressIndex === index }"
      >
        <div class="address-info">
          <p><strong>收货人：</strong>{{ address.name }}</p>
          <p><strong>电话：</strong>{{ address.phone }}</p>
          <p><strong>地址：</strong>{{ address.province }}{{ address.city }}{{ address.district }}{{ address.detailAddress }}</p>
        </div>
        <div class="address-actions">
          <button @click.stop="editAddress(address)" class="edit-btn">编辑</button>
          <button @click.stop="deleteAddress(index)" class="delete-btn">删除</button>
        </div>
      </div>
    </div>

    <!-- 添加新地址表单 -->
    <form @submit.prevent="submitAddress">
      <h3>{{ isEditing ? '编辑地址' : '新增地址' }}</h3>
      <div class="form-group">
        <label for="name">收货人姓名</label>
        <input type="text" id="name" v-model="addressForm.name" required>
      </div>
      <div class="form-group">
        <label for="phone">手机号码</label>
        <input type="tel" id="phone" v-model="addressForm.phone" required>
      </div>
      <div class="form-group">
        <label for="province">省份</label>
        <select id="province" v-model="addressForm.province" @change="handleProvinceChange" required>
          <option value="">请选择省份</option>
          <option v-for="prov in provinces" :key="prov.code" :value="prov.name">
            {{ prov.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="city">城市</label>
        <select id="city" v-model="addressForm.city" @change="handleCityChange" required>
          <option value="">请选择城市</option>
          <option v-for="city in cities" :key="city.code" :value="city.name">
            {{ city.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="district">区/县</label>
        <select id="district" v-model="addressForm.district" required>
          <option value="">请选区/县</option>
          <option v-for="dist in districts" :key="dist.code" :value="dist.name">
            {{ dist.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="detailAddress">详细地址</label>
        <textarea id="detailAddress" v-model="addressForm.detailAddress" required></textarea>
      </div>
      <button type="submit" class="submit-btn">{{ isEditing ? '保存修改' : '添加地址' }}</button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { areaData } from './areaData';
import axios from 'axios';
import { useLoginStore } from '../../nweStore/logins'

const loginStore = useLoginStore()
const isEditing = ref(false);
const savedAddresses = ref([]);

// 初始化地址数据
onMounted(() => {
  loadSavedAddresses();
});

// 加载保存的地址
const loadSavedAddresses = () => {
  if (loginStore.Loginuser && loginStore.Loginuser.delivery_address) {
    try {
      savedAddresses.value = JSON.parse(loginStore.Loginuser.delivery_address);
    } catch (error) {
      console.error('解析地址数据失败:', error);
      savedAddresses.value = [];
    }
  }
};

// 编辑地址
const editAddress = (address) => {
  isEditing.value = true;
  Object.assign(addressForm, address);
  handleProvinceChange();
  handleCityChange();
};

// 删除地址
const deleteAddress = (index) => {
  savedAddresses.value.splice(index, 1);
  updateUserAddresses();
};

// 更新用户地址到服务器和本地存储
const updateUserAddresses = async () => {
  try {
    // 更新到服务器
    await axios.post('api/yang/dong/address', {
      delivery_address: savedAddresses.value,
      id: loginStore.Loginuser.id,
    });
    
    // 更新本地存储
    loginStore.Loginuser = {
      ...loginStore.Loginuser,
      delivery_address: JSON.stringify(savedAddresses.value)
    };
    
  } catch (error) {
    console.error('更新地址失败:', error);
  }
};

const addressForm = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: ''
});

const provinces = ref(areaData);
const cities = ref([]);
const districts = ref([]);

const handleProvinceChange = () => {
  addressForm.city = '';
  addressForm.district = '';
  const selectedProvince = provinces.value.find(p => p.name === addressForm.province);
  cities.value = selectedProvince ? selectedProvince.children : [];
  districts.value = [];
};

const handleCityChange = () => {
  addressForm.district = '';
  const selectedProvince = provinces.value.find(p => p.name === addressForm.province);
  const selectedCity = selectedProvince?.children.find(c => c.name === addressForm.city);
  districts.value = selectedCity ? selectedCity.children : [];
};

const selectedAddressIndex = ref(-1);

// 选择地址
const selectAddress = (address) => {
  selectedAddressIndex.value = savedAddresses.value.findIndex(addr => addr === address);
  emit('select-address', address);
  emit('close-modal');
};

const emit = defineEmits(['address-saved', 'select-address', 'close-modal']);

const submitAddress = () => {
  const newAddress = { ...addressForm };
  
  if (isEditing.value) {
    // 更新现有地址
    const index = savedAddresses.value.findIndex(addr => 
      addr.name === addressForm.name && addr.phone === addressForm.phone
    );
    if (index !== -1) {
      savedAddresses.value[index] = newAddress;
    }
  } else {
    // 添加新地址
    savedAddresses.value.push(newAddress);
  }

  // 重置表单
  Object.keys(addressForm).forEach(key => addressForm[key] = '');
  isEditing.value = false;
  
  // 更新到服务器
  updateUserAddresses();
  
  // 触发保存事件
  emit('address-saved', savedAddresses.value);
};

</script>

<style scoped>
.address-form {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, textarea, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

select {
  background-color: white;
}

textarea {
  height: 100px;
  resize: vertical;
}

.submit-btn {
  background-color: #ff6700;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #ff8533;
}

.existing-addresses {
  margin-bottom: 20px;
}

.address-card {
  background-color: white;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.address-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.address-card.selected {
  border: 2px solid #ff6700;
  background-color: #fff8f0;
}

.address-info {
  flex: 1;
}

.address-info p {
  margin: 5px 0;
}

.address-actions {
  display: flex;
  gap: 10px;
}

.edit-btn, .delete-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn {
  background-color: #4CAF50;
  color: white;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

h3 {
  margin-bottom: 15px;
  color: #333;
}
</style>

