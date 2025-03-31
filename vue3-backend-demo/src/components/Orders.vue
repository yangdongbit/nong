<template>
  <div class="orders-container">
    <!-- 切换按钮组 -->
    <div class="switch-buttons">
      <el-radio-group v-model="viewType" size="large">
        <el-radio-button :value="'buy'">我的购买</el-radio-button>
        <el-radio-button :value="'sell'">我的销售</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-select v-model="filterStatus" placeholder="订单状态" clearable>
        <el-option label="待付款" value="unpaid" />
        <el-option label="待发货" value="paid" />
        <el-option label="已发货" value="shipped" />
        <el-option label="已完成" value="completed" />
        <el-option label="已取消" value="cancelled" />
      </el-select>

      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY年MM月DD日"
        value-format="YYYY-MM-DD"
        :shortcuts="dateShortcuts"
        :locale="zhCn"
      />

      <el-input
        v-model="searchText"
        placeholder="搜索订单号/商品名称"
        class="search-input"
      >
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
      </el-input>

      <el-button 
        type="primary" 
        :icon="Download"
        @click="exportToExcel"
        :loading="exporting"
      >
        导出订单
      </el-button>
    </div>

    <!-- 订单列表 -->
    <el-table :data="paginatedOrders" style="width: 100%" v-loading="loading">
      <el-table-column prop="order_id" label="订单号" width="180" />
      
      <el-table-column label="商品信息" min-width="300">
        <template #default="{ row }">
          <div v-if="row.products && row.products.length" class="goods-list">
            <div v-for="product in row.products" :key="product.title" class="goods-info">
              <el-image
                :src="product.imgSrc"
                :preview-src-list="[product.imgSrc]"
                fit="cover"
                style="width: 50px; height: 50px"
              />
              <div class="goods-detail">
                <div class="goods-title">{{ product.title }}</div>
                <div class="goods-price">¥{{ product.price }}</div>
              </div>
            </div>
          </div>
          <div v-else class="no-products">暂无商品信息</div>
        </template>
      </el-table-column>

      <el-table-column prop="total_amount" label="订单金额" width="120">
        <template #default="{ row }">
          ¥{{ row.total_amount || '0.00' }}
        </template>
      </el-table-column>

      <el-table-column prop="order_status" label="订单状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.order_status)">
            {{ getStatusText(row.order_status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="created_at" label="下单时间" width="180" />

      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="handleViewDetail(scope.row)">
            查看
          </el-button>
          <el-button 
            v-if="canConfirmReceive(scope.row)"
            size="small" 
            type="success"
            @click="handleConfirmReceive(scope.row)"
          >
            确认收货
          </el-button>
          <el-button
            v-if="canShip(scope.row)"
            size="small"
            type="primary"
            @click="handleShip(scope.row)"
          >
            发货
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredOrders.length"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 订单详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="订单详情"
      size="50%"
      :destroy-on-close="true"
    >
      <template #default>
        <div class="drawer-content" v-if="currentOrder">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="订单号">
              {{ currentOrder.order_id }}
            </el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag :type="getStatusType(currentOrder.order_status)">
                {{ getStatusText(currentOrder.order_status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="商品信息">
              <div v-for="product in currentOrder.products" :key="product.title" class="goods-info">
                <el-image
                  :src="product.imgSrc"
                  :preview-src-list="[product.imgSrc]"
                  fit="cover"
                  style="width: 80px; height: 80px"
                />
                <div class="goods-detail">
                  <div class="goods-title">{{ product.title }}</div>
                  <div class="goods-price">¥{{ product.price }}</div>
                </div>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="收货信息" v-if="currentOrder.shipping_address">
              <div>收货人：{{ currentOrder.shipping_address.name }}</div>
              <div>联系电话：{{ currentOrder.shipping_address.phone }}</div>
              <div>收货地址：{{ currentOrder.shipping_address.address }}</div>
            </el-descriptions-item>
            <el-descriptions-item label="订单金额">
              ¥{{ currentOrder.total_amount }}
            </el-descriptions-item>
            <el-descriptions-item label="下单时间">
              {{ currentOrder.created_at }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- 操作按钮 -->
          <div class="drawer-footer">
            <el-button 
              v-if="canConfirmReceive(currentOrder)"
              type="success"
              @click="handleConfirmReceive(currentOrder)"
            >
              确认收货
            </el-button>
            <el-button
              v-if="canShip(currentOrder)"
              type="primary"
              @click="handleShip(currentOrder)"
            >
              发货
            </el-button>
          </div>
        </div>
      </template>
    </el-drawer>

    <!-- 发货对话框 -->
    <el-dialog
      v-model="shipDialogVisible"
      title="确认发货"
      width="400px"
    >
      <div class="ship-confirm-content">
        <p>确认要发货吗？</p>
        <p class="order-info">订单号：{{ currentOrder?.order_id }}</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="shipDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmShip">
            确认发货
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as XLSX from 'xlsx'
import FileSaver from 'file-saver'
import { Download } from '@element-plus/icons-vue'

// 类型定义
type ViewType = 'buy' | 'sell'

// 视图类型
const viewType = ref<ViewType>('buy')
const loading = ref(false)

// 筛选条件
const filterStatus = ref('')
const dateRange = ref<[string, string] | null>(null)
const searchText = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 抽屉和对话框
const drawerVisible = ref(false)
const shipDialogVisible = ref(false)
const currentOrder = ref<any>(null)
const shipForm = ref({
  tracking_number: '',
  express_company: ''
})

// 订单数据
const orders = ref([])

// 获取用户信息
const getUserInfo = () => {
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    return JSON.parse(storedUserInfo)
  }
  return null
}

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    const user = getUserInfo()
    if (!user) {
      ElMessage.warning('请先登录')
      return
    }

    const response = await axios.get(`/api/yang/orders/${viewType.value}/${user.id}`)
    if (response.data.status === 0) {
      orders.value = response.data.data || []
    } else {
      throw new Error(response.data.message)
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
    orders.value = []
  } finally {
    loading.value = false
  }
}

// 监听视图类型变化
watch(viewType, () => {
  fetchOrders()
})

// 过滤后的订单
const filteredOrders = computed(() => {
  let result = orders.value || []

  // 状态筛选
  if (filterStatus.value) {
    result = result.filter(order => order.order_status === filterStatus.value)
  }

  // 日期筛选
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const [startDate, endDate] = dateRange.value
    result = result.filter(order => {
      if (!order.created_at) return false
      const orderDate = order.created_at.split(' ')[0]
      return orderDate >= startDate && orderDate <= endDate
    })
  }

  // 搜索过滤
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    result = result.filter(order => {
      return (
        (order.order_id && order.order_id.toLowerCase().includes(keyword)) ||
        (order.products && order.products.some(product => 
          product.title.toLowerCase().includes(keyword)
        ))
      )
    })
  }

  return result
})

// 分页数据
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

// 状态相关方法
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    unpaid: 'warning',
    paid: 'info',
    shipped: 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    unpaid: '待付款',
    paid: '待发货',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

// 操作权限判断
const canConfirmReceive = (order: any) => {
  return viewType.value === 'buy' && order.order_status === 'shipped'
}

const canShip = (order: any) => {
  return viewType.value === 'sell' && order.order_status === 'paid'
}

// 处理方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const handleViewDetail = (order: any) => {
  currentOrder.value = order
  drawerVisible.value = true
}

const handleConfirmReceive = async (order: any) => {
  try {
    await ElMessageBox.confirm(
      '确认已收到商品吗？',
      '确认收货',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await axios.post(`/api/yang/orders/confirm/${order.order_id}`)
    if (response.data.status === 0) {
      ElMessage.success('确认收货成功')
      await fetchOrders()
      if (drawerVisible.value) {
        drawerVisible.value = false
      }
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('确认收货失败:', error)
      ElMessage.error(error.response?.data?.message || '确认收货失败')
    }
  }
}

const handleShip = (order: any) => {
  currentOrder.value = order
  shipDialogVisible.value = true
}

const confirmShip = async () => {
  try {
    const response = await axios.post(`/api/yang/orders/ship/${currentOrder.value.order_id}`)
    if (response.data.status === 0) {
      ElMessage.success('发货成功')
      shipDialogVisible.value = false
      await fetchOrders()
      if (drawerVisible.value) {
        drawerVisible.value = false
      }
    }
  } catch (error: any) {
    console.error('发货失败:', error)
    ElMessage.error(error.response?.data?.message || '发货失败')
  }
}

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  }
]

// 组件挂载时获取数据
onMounted(() => {
  fetchOrders()
})

const exporting = ref(false)

const exportToExcel = async () => {
  if (filteredOrders.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }

  exporting.value = true
  try {
    // 准备导出数据
    const exportData = filteredOrders.value.map(order => {
      const data = {
        '订单号': order.order_id,
        '订单状态': getStatusText(order.order_status),
        '商品信息': order.products?.map(p => p.title).join('\n') || '暂无商品信息',
        '订单金额': `¥${order.total_amount || '0.00'}`,
        '下单时间': order.created_at,
      }
      
      // 处理收货地址 - shipping_address 已经是对象，不需要解析
      const shippingAddress = order.shipping_address || {}
      const fullAddress = [
        shippingAddress.province,
        shippingAddress.city,
        shippingAddress.district,
        shippingAddress.detailAddress
      ].filter(Boolean).join(' ')
      
      return {
        ...data,
        '收货人': shippingAddress.name || '',
        '联系电话': shippingAddress.phone || '',
        '收货地址': fullAddress || ''
      }
    })

    // 创建工作簿和工作表
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '订单数据')

    // 设置列宽
    const columnWidths = [
      { wch: 20 }, // 订单号
      { wch: 10 }, // 订单状态
      { wch: 40 }, // 商品信息
      { wch: 10 }, // 订单金额
      { wch: 20 }, // 下单时间
      { wch: 10 }, // 收货人
      { wch: 15 }, // 联系电话
      { wch: 50 }, // 收货地址
    ]
    worksheet['!cols'] = columnWidths

    // 导出文件
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    // 生成文件名
    const fileName = `订单数据_${new Date().toLocaleDateString()}.xlsx`
    FileSaver.saveAs(blob, fileName)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.orders-container {
  padding: 20px;
}

.switch-buttons {
  margin-bottom: 20px;
}

.filter-section {
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.goods-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.goods-info:not(:last-child) {
  border-bottom: 1px solid #eee;
}

.goods-detail {
  flex: 1;
  min-width: 0;
}

.goods-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-price {
  font-size: 14px;
  color: #f56c6c;
}

.no-products {
  color: #999;
  text-align: center;
  padding: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.drawer-content {
  padding: 20px;
}

.drawer-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-descriptions__label) {
  width: 120px;
  justify-content: flex-end;
}

:deep(.el-descriptions__cell) {
  padding: 12px !important;
}

.ship-confirm-content {
  text-align: center;
  padding: 20px 0;
}

.order-info {
  color: #666;
  margin-top: 10px;
}

.goods-list {
  max-height: 200px;
  overflow-y: auto;
}

/* 表格样式优化 */
:deep(.el-table) {
  --el-table-border-color: #ebeef5;
  --el-table-header-bg-color: #f5f7fa;
}

:deep(.el-table th) {
  background-color: var(--el-table-header-bg-color);
  font-weight: bold;
}

:deep(.el-table td) {
  padding: 8px 0;
}

/* 操作按钮样式 */
:deep(.el-button--small) {
  padding: 6px 12px;
  font-size: 12px;
}

.el-button + .el-button {
  margin-left: 8px;
}

.el-button [class*='el-icon'] + span {
  margin-left: 6px;
}
</style>
