<template>
  <div class="users-container">
    <!-- 搜索栏 -->
    <div class="header-actions">
      <el-input
        v-model="search"
        placeholder="请输入用户名搜索"
        class="search-input"
      >
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
      
      <el-button 
        type="primary" 
        @click="handleAdd"
        :disabled="!isAdmin"
      >
        新增用户
      </el-button>
    </div>

    <!-- 用户列表 -->
    <el-table
      :data="paginatedData"
      v-loading="loading"
      border
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="用户名" width="120" />
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column prop="login" label="登录状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.login === '1' ? 'success' : 'info'">
            {{ row.login === '1' ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button 
            size="small" 
            @click="handleEdit(scope.row)"
            :disabled="!canEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.row)"
            :disabled="!isAdmin && scope.row.id !== getCurrentUser()?.id"
          >注销</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="filterTableData.length"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 用户编辑抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="editedUser?.id ? '编辑用户' : '新增用户'"
      size="600px"
    >
      <template #header>
        <div style="flex: 1">
          <span>{{ editedUser?.id ? '编辑用户' : '新增用户' }}</span>
        </div>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
      
      <template v-if="editedUser">
        <el-form :model="editedUser" label-width="100px">
          <el-tabs>
            <el-tab-pane label="基本信息">
              <el-form-item label="用户名">
                <el-input v-model="editedUser.name" disabled />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="editedUser.email" disabled />
              </el-form-item>
              <el-form-item label="修改密码">
                <div style="display: flex; gap: 10px; align-items: center">
                  <el-input 
                    v-model="newPassword" 
                    type="password" 
                    placeholder="输入新密码"
                    show-password
                    style="flex: 1"
                  />
                  <el-button 
                    type="primary"
                    :disabled="!newPassword"
                    @click="handleResetPassword"
                  >
                    修改密码
                  </el-button>
                </div>
              </el-form-item>
              <el-form-item label="权限">
                <el-switch
                  v-model="editedUser.administrator"
                  :disabled="!isAdmin"
                  active-value="1"
                  inactive-value="0"
                  active-text="管理员"
                  inactive-text="普通用户"
                />
              </el-form-item>
            </el-tab-pane>
            
            <el-tab-pane label="收货地址">
              <el-scrollbar height="400px">
                <div v-if="editedUser.delivery_address">
                  <template v-for="(address, index) in JSON.parse(editedUser.delivery_address)" :key="index">
                    <div class="address-card">
                      <div class="address-content">
                        <p><b>收货人：</b>{{ address.name }} - {{ address.phone }}</p>
                        <p><b>地址：</b>{{ address.province }}{{ address.city }}{{ address.district }}{{ address.detailAddress }}</p>
                      </div>
                      <div class="address-actions">
                        <el-button 
                          type="primary" 
                          link 
                          @click="handleEditAddress(index)"
                        >
                          编辑
                        </el-button>
                        <el-button 
                          type="danger" 
                          link 
                          @click="handleDeleteAddress(index)"
                        >
                          删除
                        </el-button>
                      </div>
                    </div>
                  </template>
                  <div class="add-address">
                    <el-button type="primary" @click="handleAddAddress">
                      添加新地址
                    </el-button>
                  </div>
                </div>
                <el-empty v-else description="暂无收货地址">
                  <el-button type="primary" @click="handleAddAddress">
                    添加收货地址
                  </el-button>
                </el-empty>
              </el-scrollbar>
            </el-tab-pane>

            <el-tab-pane label="购物车">
              <el-scrollbar height="400px">
                <div v-if="userCart.length">
                  <el-card v-for="item in userCart" :key="item.id" class="cart-item">
                    <template #header>
                      <div class="cart-item-header">
                        <span>{{ item.product_name }}</span>
                        <span class="price">¥{{ item.price }}</span>
                      </div>
                    </template>
                    <div class="cart-item-content">
                      <el-image 
                        :src="item.product_img" 
                        fit="cover"
                        style="width: 80px; height: 80px"
                      />
                      <div class="cart-item-info">
                        <p>数量：{{ item.quantity }}</p>
                        <p>加入时间：{{ new Date(item.added_time).toLocaleString() }}</p>
                        <p>总价：¥{{ (item.price * item.quantity).toFixed(2) }}</p>
                      </div>
                    </div>
                  </el-card>
                </div>
                <el-empty v-else description="购物车为空" />
              </el-scrollbar>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </template>
    </el-drawer>

    <!-- 添加地址编辑对话框 -->
    <el-dialog
      v-model="addressDialogVisible"
      :title="currentAddressIndex !== null ? '编辑地址' : '新增地址'"
      width="500px"
    >
      <el-form :model="addressForm" label-width="100px">
        <el-form-item label="收货人">
          <el-input v-model="addressForm.name" />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="addressForm.phone" />
        </el-form-item>
        <el-form-item label="所在地区">
          <div class="address-select">
            <el-input v-model="addressForm.province" placeholder="省" />
            <el-input v-model="addressForm.city" placeholder="市" />
            <el-input v-model="addressForm.district" placeholder="区" />
          </div>
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input 
            v-model="addressForm.detailAddress" 
            type="textarea" 
            rows="2"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addressDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAddress">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { useProductfetcherStore } from '@/stores/ProductFetcher'  // 导入 store

interface Address {
  name: string
  phone: string
  province: string
  city: string
  district: string
  detailAddress: string
}

interface User {
  id: number
  name: string
  email: string
  password: string
  login: string
  administrator: string
  delivery_address?: string  // JSON string of Address[]
  product_id?: string
}

// 状态定义
const loading = ref(false)
const search = ref('')
const tableData = ref<User[]>([])
const drawerVisible = ref(false)
const editedUser = ref<User | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const newPassword = ref('')
const userCart = ref([])

// 地址相关状态
const addressDialogVisible = ref(false)
const currentAddressIndex = ref<number | null>(null)
const addressForm = ref({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: ''
})

const productStore = useProductfetcherStore()
const products = ref([])

// 获取所有商品信息
const getProducts = async () => {
  try {
    const data = await productStore.getfarms()
    products.value = data
  } catch (error) {
    console.error('获取商品数据失败:', error)
  }
}

// 获取当前用户信息
const getCurrentUser = () => {
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    return JSON.parse(storedUserInfo)
  }
  return null
}

// 判断是否是管理员
const isAdmin = computed(() => {
  const user = getCurrentUser()
  return user?.administrator === '1'
})

// 检查编辑权限
const canEdit = (user: User) => {
  const currentUser = getCurrentUser()
  if (!currentUser) return false
  return currentUser.administrator === '1' || currentUser.id === user.id
}

// 获取用户列表
const getUsers = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/yang')
    tableData.value = response.data
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1  // 重置到第一页
}

// 过滤数据
const sortedTableData = computed(() => {
  const currentUser = getCurrentUser()
  if (!currentUser) return tableData.value

  return [...tableData.value].sort((a, b) => {
    if (a.id === currentUser.id) return -1
    if (b.id === currentUser.id) return 1
    return 0
  })
})

const filterTableData = computed(() =>
  sortedTableData.value.filter(
    (data) =>
      !search.value ||
      data.name.toLowerCase().includes(search.value.toLowerCase()) ||
      data.email.toLowerCase().includes(search.value.toLowerCase())
  )
)

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filterTableData.value.slice(start, end)
})

// 编辑用户
const handleEdit = async (row: User) => {
  if (!canEdit(row)) {
    ElMessage.warning('您没有权限编辑此用户')
    return
  }
  editedUser.value = JSON.parse(JSON.stringify(row))
  drawerVisible.value = true
  newPassword.value = '' // 清空密码字段
  await getUserCart(row.id) // 加载购物车数据
}

// 删除用户
const handleDelete = async (row: User) => {
  const currentUser = getCurrentUser()
  const isSelfDelete = currentUser?.id === row.id
  
  try {
    await ElMessageBox.confirm(
      isSelfDelete 
        ? '确定要注销自己的账号吗？此操作不可恢复，注销后将退出登录'
        : '确定要删除该用户吗？此操作不可恢复',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 使用新的注销接口
    await axios.delete(`/api/yang/deleteAccount/${row.id}`)
    
    if (isSelfDelete) {
      // 如果是注销自己的账号，清除登录信息并跳转到登录页
      localStorage.removeItem('userInfo')
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else {
      await getUsers() // 刷新用户列表
      ElMessage.success('删除成功')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

// 新增用户
const handleAdd = () => {
  editedUser.value = {
    id: Math.max(...tableData.value.map(item => item.id)) + 1,
    name: '',
    email: '',
    password: '',
    login: '0',
    administrator: '0',
    delivery_address: '',
    product_id: ''
  }
  drawerVisible.value = true
}

// 保存用户信息
const handleSave = async () => {
  try {
    if (!editedUser.value) return

    const saveData = { ...editedUser.value }
    if (newPassword.value) {
      saveData.password = newPassword.value
    }

    const isNew = !tableData.value.find(item => item.id === editedUser.value?.id)
    
    if (isNew) {
      await axios.post('/api/yang', saveData)
    } else {
      await axios.put(`/api/yang/${editedUser.value.id}`, saveData)
    }

    await getUsers()
    ElMessage.success(isNew ? '添加成功' : '更新成功')
    drawerVisible.value = false
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 修改获取用户购物车数据的函数
const getUserCart = async (userId: number) => {
  try {
    const response = await axios.post('/api/yang/shopping_cat', {
      user_id: userId
    })
    console.log('购物车数据:', response.data)

    // 获取商品信息
    await getProducts()
    
    // 将购物车数据与商品信息合并
    userCart.value = response.data.map(cartItem => {
      const product = products.value.find(p => p.id === cartItem.product_id)
      return {
        ...cartItem,
        product_name: product?.title || '未知商品',
        product_img: product?.imgSrc || '',
        price: product?.price || 0
      }
    })
  } catch (error) {
    console.error('获取购物车失败:', error)
    ElMessage.warning('获取购物车数据失败')
  }
}

// 编辑地址
const handleEditAddress = (index: number) => {
  const addresses = JSON.parse(editedUser.value?.delivery_address || '[]')
  currentAddressIndex.value = index
  addressForm.value = { ...addresses[index] }
  addressDialogVisible.value = true
}

// 删除地址
const handleDeleteAddress = async (index: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个地址吗？', '提示', {
      type: 'warning'
    })
    
    const addresses = JSON.parse(editedUser.value?.delivery_address || '[]')
    addresses.splice(index, 1)
    editedUser.value!.delivery_address = JSON.stringify(addresses)
    
    // 保存到服务器
    await axios.post('/api/yang/dong/address', {
      id: editedUser.value?.id,
      delivery_address: editedUser.value?.delivery_address
    })
    
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除地址失败:', error)
      ElMessage.error('删除地址失败')
    }
  }
}

// 添加新地址
const handleAddAddress = () => {
  currentAddressIndex.value = null
  addressForm.value = {
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detailAddress: ''
  }
  addressDialogVisible.value = true
}

// 保存地址
const saveAddress = async () => {
  try {
    const addresses = JSON.parse(editedUser.value?.delivery_address || '[]')
    
    if (currentAddressIndex.value !== null) {
      // 编辑现有地址
      addresses[currentAddressIndex.value] = addressForm.value
    } else {
      // 添加新地址
      addresses.push(addressForm.value)
    }
    
    editedUser.value!.delivery_address = JSON.stringify(addresses)
    
    // 保存到服务器
    await axios.post('/api/yang/dong/address', {
      id: editedUser.value?.id,
      delivery_address: editedUser.value?.delivery_address
    })
    
    addressDialogVisible.value = false
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存地址失败:', error)
    ElMessage.error('保存地址失败')
  }
}

// 添加修改密码的处理函数
const handleResetPassword = async () => {
  try {
    if (!editedUser.value || !newPassword.value) return
    
    await ElMessageBox.confirm(
      '确定要修改密码吗？修改后需要重新登录',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await axios.post('/api/yang/resetpassword', {
      email: editedUser.value.email,
      password: newPassword.value
    })

    ElMessage.success('密码修改成功')
    
    // 如果是修改自己的密码，则退出登录
    const currentUser = getCurrentUser()
    if (currentUser?.id === editedUser.value.id) {
      localStorage.removeItem('userInfo')
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else {
      // 清空密码输入框
      newPassword.value = ''
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('修改密码失败:', error)
      ElMessage.error('修改密码失败')
    }
  }
}

// 初始化
onMounted(() => {
  getUsers()
})
</script>

<style scoped>
.users-container {
  padding: 20px;
}

.header-actions {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  width: 300px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.address-item {
  margin-bottom: 8px;
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.address-item:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

.address-card {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-content {
  flex: 1;
}

.address-actions {
  display: flex;
  gap: 8px;
}

.add-address {
  margin-top: 20px;
  text-align: center;
}

.address-select {
  display: flex;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.address-content p {
  margin: 5px 0;
}

.cart-item {
  margin-bottom: 12px;
}

.cart-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-item-content {
  display: flex;
  gap: 12px;
}

.cart-item-info {
  flex: 1;
}

.price {
  color: #ff4d4f;
  font-weight: bold;
}

:deep(.el-tabs__content) {
  padding: 20px 0;
}
</style>