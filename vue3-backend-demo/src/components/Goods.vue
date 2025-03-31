<template>
  <div>
    <div class="header-actions">
      <el-button 
        type="primary" 
        @click="handleAdd"
      >
        新增商品
      </el-button>
    </div>

    <div v-if="userInfo[0]?.administrator !== '1'" class="info-banner">
      <el-alert
        title="您正在查看您发布的商品"
        type="info"
        :closable="false"
        show-icon
      />
    </div>
    
    <el-table :data="paginatedData" style="width: 100%">
      <el-table-column label="ID" prop="id" width="80" />
      <el-table-column label="商品图片" width="120">
        <template #default="scope">
          <el-image 
            :src="scope.row.imgSrc" 
            :preview-src-list="[scope.row.imgSrc]"
            style="width: 80px; height: 80px"
            :preview-teleported="true"
            :initial-index="4"
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column label="商品名称" prop="title" show-overflow-tooltip />
      <el-table-column label="价格" width="100">
        <template #default="scope">
          ¥{{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column label="类型" prop="type" width="100" />
      <el-table-column label="销量" prop="sales_volume" width="100" />
      <el-table-column align="right" width="180">
        <template #header>
          <el-input v-model="search" size="small" placeholder="输入商品名称搜索" />
        </template>
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">
            编辑
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 添加分页组件 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :total="filterTableData.length"
        layout="total, sizes, prev, pager, next, jumper"
        :pager-count="7"
        background
        popper-class="custom-pagination"
        prev-text="上一页"
        next-text="下一页"
        :page-size-opts="[
          { value: 10, label: '10条/页' },
          { value: 20, label: '20条/页' },
          { value: 30, label: '30条/页' },
          { value: 50, label: '50条/页' }
        ]"
      />
    </div>

    <el-drawer
      v-model="drawerVisible"
      title="商品详情"
      size="50%"
      :destroy-on-close="true"
    >
      <template #header>
        <div style="flex: 1">
          <span>商品详情</span>
        </div>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
      
      <template v-if="editedGood">
        <div class="drawer-content">
          <!-- 商品图片上传 -->
          <div class="image-upload-section">
            <h3>商品图片</h3>
            <div class="upload-list">
              <div 
                v-for="(field, index) in ['imgSrc', 'imgSrc1', 'imgSrc2', 'imgSrc3', 'imgSrc4']"
                :key="field"
                class="image-uploader"
                @click="handleClickUpload(field)"
              >
                <input
                  type="file"
                  :ref="(el: any) => { if (el) uploadRefs[field] = el }"
                  style="display: none"
                  accept="image/*"
                  @change="(e) => handleFileChange(e, field)"
                />
                <div class="upload-content">
                  <img
                    v-if="editedGood[field] || previewImages[field]"
                    :src="previewImages[field] || editedGood[field]"
                    class="uploaded-image"
                  />
                  <div v-else class="upload-placeholder">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <span>点击上传</span>
                  </div>
                  <div class="upload-label">图片 {{index + 1}}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 商品信息 -->
          <div class="good-info">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="商品ID">
                {{ editedGood.id }}
              </el-descriptions-item>
              <el-descriptions-item label="商品名称">
                <el-input v-model="editedGood.title" />
              </el-descriptions-item>
              <el-descriptions-item label="价格">
                <el-input v-model="editedGood.price" type="number">
                  <template #prefix>¥</template>
                </el-input>
              </el-descriptions-item>
              <el-descriptions-item label="商品类型">
                <el-select v-model="editedGood.type" placeholder="请选择商品类型">
                  <el-option label="蔬菜" value="蔬菜" />
                  <el-option label="水果" value="水果" />
                  <el-option label="农副加工" value="农副加工" />
                  <el-option label="种子种苗" value="种子种苗" />
                  <el-option label="粮油米面" value="粮油米面" />
                  <el-option label="禽畜肉蛋" value="禽畜肉蛋" />
                  <el-option label="农副产品" value="农副产品" />
                </el-select>
              </el-descriptions-item>
              <el-descriptions-item label="发货地">
                <el-input v-model="editedGood.shipping_from" />
              </el-descriptions-item>
              <el-descriptions-item label="快递">
                <el-input v-model="editedGood.express_name" />
              </el-descriptions-item>
              <el-descriptions-item label="产品名">
                <el-input v-model="editedGood.product_name" />
              </el-descriptions-item>
              <el-descriptions-item label="规格">
                <el-input v-model="editedGood.specification" />
              </el-descriptions-item>
              <el-descriptions-item label="储存方式">
                <el-input v-model="editedGood.storage_method" />
              </el-descriptions-item>
              <el-descriptions-item label="产地">
                <el-input v-model="editedGood.shelf_life" />
              </el-descriptions-item>
              <el-descriptions-item label="销量">
                <el-tooltip
                  content="只有管理员可以修改销量"
                  placement="top"
                  :disabled="isAdmin"
                >
                  <el-input 
                    v-model="editedGood.sales_volume" 
                    :disabled="!isAdmin"
                    placeholder="只有管理员可以修改销量"
                  />
                </el-tooltip>
              </el-descriptions-item>
              <el-descriptions-item label="库存">
                <el-input v-model="editedGood.stock" />
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useProductfetcherStore } from '@/stores/ProductFetcher'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'
import axios from 'axios'

interface Good {
  id: number
  imgSrc: string
  title: string
  price: number
  type: string
  imgSrc1?: string
  imgSrc2?: string
  imgSrc3?: string
  imgSrc4?: string
  shipping_from: string
  express_name: string
  product_name: string
  specification: string
  storage_method: string
  shelf_life: string
  sales_volume: string
  stock: string
  buyer: string
}

interface UserInfo {
  id: number
  name: string
  password: string
  email: string
  login: string
  administrator: string
}

const productStore = useProductfetcherStore()
const search = ref('')
const tableData = ref<Good[]>([])
const userInfo = ref<UserInfo[]>([])

// 获取用户信息和权限
const getUserInfo = () => {
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    const parsedUser = JSON.parse(storedUserInfo)
    userInfo.value = [parsedUser]
    return parsedUser
  }
  return null
}

// 获取商品数据
const fetchGoods = async () => {
  try {
    const data = await productStore.getfarms()
    const user = getUserInfo()
    
    if (!user) {
      tableData.value = data
      return
    }

    if (data) {
      if (user.administrator === '1') {
        tableData.value = data
      } else {
        tableData.value = data.filter(item => 
          item.buyer === user.id.toString()
        )
      }
    }
  } catch (error) {
    console.error('获取商品数据失败:', error)
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchGoods()
})

// 修改过滤数据的计算属性
const filterTableData = computed(() =>
  tableData.value.filter(
    (data) =>
      !search.value ||
      data.title.toLowerCase().includes(search.value.toLowerCase())
  )
)

const currentGood = ref<Good | null>(null)
const editedGood = ref<Good | null>(null)
const drawerVisible = ref(false)

// 修改上传相关的代码
const uploadRefs = ref<{ [key: string]: HTMLInputElement | null }>({})
const uploadFiles = ref<Record<string, File>>({})
const previewImages = ref<Record<string, string>>({})

// 处理点击上传区域
const handleClickUpload = (field: string) => {
  const inputEl = uploadRefs.value[field]
  if (inputEl) {
    inputEl.click()
  }
}

// 修改文件选择处理函数
const handleFileChange = async (e: Event, field: string) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return
  
  // 检查商品类型是否已选择
  if (!editedGood.value?.type) {
    ElMessage.warning('请先选择商品类型')
    return
  }

  // 获取用户ID
  const userId = getUserInfo()?.id?.toString()
  if (!userId) {
    ElMessage.warning('请先登录')
    return
  }

  // 检查文件类型和大小
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return
  }

  // 创建本地预览
  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      previewImages.value[field] = e.target.result as string
    }
  }
  reader.readAsDataURL(file)

  // 准备表单数据
  const formData = new FormData()
  
  // 注意：先添加其他字段，最后添加文件
  formData.append('type', editedGood.value.type)
  formData.append('buyer', userId)
  formData.append('imageIndex', field === 'imgSrc' ? '1' : field.replace('imgSrc', ''))
  formData.append('image', file)

  // 调试信息
  console.log('上传参数:', {
    type: editedGood.value.type,
    buyer: userId,
    imageIndex: field === 'imgSrc' ? '1' : field.replace('imgSrc', ''),
    fileName: file.name
  })

  try {
    const response = await axios.post('/api/yang/upload/goods', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.data.status === 0) {
      editedGood.value[field] = response.data.data.url
      ElMessage.success('上传成功')
    } else {
      throw new Error(response.data.message)
    }
  } catch (error: any) {
    console.error('上传图片失败:', error)
    ElMessage.error(error.response?.data?.message || '上传失败')
  }

  // 清空 input 的值，允许重复选择同一个文件
  input.value = ''
}

// 修改保存函数
const handleSave = async () => {
  try {
    if (!editedGood.value) return
    
    // 验证必填字段
    if (!editedGood.value.title || !editedGood.value.type || !editedGood.value.price) {
      ElMessage.warning('请填写商品名称、类型和价格')
      return
    }

    // 设置用户ID
    editedGood.value.buyer = getUserInfo()?.id?.toString() || ''

    // 保存商品信息
    if (!editedGood.value.id) {
      const response = await axios.post('/api/yang/goods', editedGood.value)
      if (response.data.status === 0) {
        editedGood.value.id = response.data.data.id
        ElMessage.success('添加商品成功')
      }
    } else {
      const response = await axios.put(`/api/yang/goods/${editedGood.value.id}`, editedGood.value)
      if (response.data.status === 0) {
        ElMessage.success('更新商品成功')
      }
    }

    drawerVisible.value = false
    await fetchGoods()
    
  } catch (error: any) {
    console.error('保存失败:', error)
    ElMessage.error(error.response?.data?.message || error.message || '保存失败')
  }
}

// 修改编辑权限判断
const handleEdit = (index: number, row: Good) => {
  const user = getUserInfo()
  if (!user) return

  // 检查是否有权限编辑
  if (user.administrator === '1' || row.buyer === user.id.toString()) {
    currentGood.value = row
    editedGood.value = JSON.parse(JSON.stringify(row))
    drawerVisible.value = true
  } else {
    ElMessage.warning('您没有权限编辑此商品')
  }
}

// 修改删除权限判断
const handleDelete = async (index: number, row: Good) => {
  const user = getUserInfo();
  if (!user) return;

  if (user.administrator === '1' || row.buyer === user.id.toString()) {
    try {
      await ElMessageBox.confirm(
        '确定要删除这个商品吗？此操作不可恢复',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      );
      
      const response = await axios.delete(`/api/yang/goods/${row.id}`);
      if (response.data.status === 0) {
        ElMessage.success('删除成功');
        await fetchGoods(); // 刷新商品列表
      } else {
        throw new Error(response.data.message);
      }
      
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('删除失败:', error);
        ElMessage.error(error.response?.data?.message || error.message || '删除失败');
      }
    }
  } else {
    ElMessage.warning('您没有权限删除此商品');
  }
}

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

// 计算分页后的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filterTableData.value.slice(start, end)
})

// 处理每页显示数量变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1  // 重置到第一页
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 新增商品的默认值
const defaultGood: Partial<Good> = {
  title: '',
  price: 0,
  type: '',  // 确保这里不要设置默认类型
  shipping_from: '',
  express_name: '',
  product_name: '',
  specification: '',
  storage_method: '',
  shelf_life: '',
  sales_volume: '0',
  stock: '0',
  buyer: '',  // 不要在这里设置默认值
  imgSrc: 'http://127.0.0.1:3000/yang/img/img/logo.png',
}

// 新增商品处理函数
const handleAdd = () => {
  const user = getUserInfo()
  if (!user) {
    ElMessage.warning('请先登录')
    return
  }
  
  editedGood.value = { 
    ...defaultGood,
    buyer: user.id.toString()  // 在这里设置用户ID
  } as Good
  drawerVisible.value = true
}

// 1. 抽取权限检查函数
const checkPermission = (good: Good) => {
  const user = getUserInfo()
  return user && (user.administrator === '1' || good.buyer === user.id.toString())
}

// 2. 改进图片预览逻辑
const getGoodImages = (good: Good) => {
  return [good.imgSrc, good.imgSrc2, good.imgSrc3, good.imgSrc4].filter(Boolean)
}

// 添加一个计算属性来判断是否是管理员
const isAdmin = computed(() => {
  const user = getUserInfo()
  return user?.administrator === '1'
})

// 1. 在 script 部分添加商品类型选项
const goodTypes = [
  '蔬菜',
  '水果',
  '农副加工',
  '种子种苗',
  '粮油米面',
  '禽畜肉蛋',
  '农副产品'
];
</script>

<style scoped>
:deep(.el-image-viewer__wrapper) {
  z-index: 2100;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-pagination) {
  --el-pagination-font-size: 14px;
}

:deep(.el-pagination .el-select .el-input .el-input__inner) {
  min-width: 110px;
}

:deep(.custom-pagination) {
  .el-select-dropdown__item {
    padding: 0 20px;
  }
}

/* 修改总数显示的文本 */
:deep(.el-pagination__total) {
  &::before {
    content: '共 ';
  }
  &::after {
    content: ' 条';
  }
}

/* 修改跳转文本 */
:deep(.el-pagination__jump) {
  .el-pagination__goto {
    &::before {
      content: '前往';
      margin-right: 5px;
    }
    &::after {
      content: '页';
      margin-left: 5px;
    }
  }
}

.drawer-content {
  padding: 20px;
}

.image-preview {
  margin-bottom: 20px;
}

.good-info {
  margin-top: 20px;
}

:deep(.el-descriptions__label) {
  width: 120px;
  justify-content: flex-end;
}

:deep(.el-descriptions__cell) {
  padding: 12px !important;
}

:deep(.el-input) {
  width: 100%;
}

.info-banner {
  margin-bottom: 20px;
}

.header-actions {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 添加图片上传相关样式 */
.image-upload-section {
  margin-bottom: 30px;
}

.image-upload-section h3 {
  margin-bottom: 15px;
  font-size: 16px;
  color: #333;
}

.upload-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 15px;
}

.image-uploader {
  width: 150px;
  height: 150px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration);
}

.image-uploader:hover {
  border-color: var(--el-color-primary);
}

.upload-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8c939d;
}

.upload-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.upload-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  text-align: center;
  padding: 4px 0;
  font-size: 12px;
}
</style>
  