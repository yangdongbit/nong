<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('private')
const messageList = ref([])
const loading = ref(false)
const BASE_URL = 'http://127.0.0.1:3000'
const selectedMessages = ref([])

// 检查是否为管理员
const isAdmin = computed(() => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  return userInfo.administrator === '1'
})

// 删除单条消息
const deleteMessage = async (row) => {
  if (!isAdmin.value) {
    ElMessage.warning('只有管理员可以删除消息')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除这条消息吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const url = activeTab.value === 'private'
      ? `/api/yang/private_message/${row.id}`
      : `/api/yang/public_message/${row.id}`

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'user-id': userInfo.id
      }
    })

    const result = await response.json()
    if (result.status === 0) {
      ElMessage.success(result.message)
      fetchMessages(activeTab.value)
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除消息失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除消息
const deleteSelected = async () => {
  if (!isAdmin.value) {
    ElMessage.warning('只有管理员可以删除消息')
    return
  }

  if (selectedMessages.value.length === 0) {
    ElMessage.warning('请选择要删除的消息')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedMessages.value.length} 条消息吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const url = activeTab.value === 'private'
      ? '/api/yang/private_messages'
      : '/api/yang/public_messages'

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userInfo.id
      },
      body: JSON.stringify({
        ids: selectedMessages.value.map(msg => msg.id)
      })
    })

    const result = await response.json()
    if (result.status === 0) {
      ElMessage.success(result.message)
      selectedMessages.value = []
      fetchMessages(activeTab.value)
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除消息失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 获取消息列表
const fetchMessages = async (type = 'private') => {
  try {
    loading.value = true
    let url
    
    if (type === 'private') {
      url = '/api/private/messages'
    } else {
      url = '/api/public/messages'
    }
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.status === 0) {
      messageList.value = data.data.map(msg => ({
        ...msg,
        status: msg.is_read ? 'read' : 'unread',
        sender_avatar: msg.sender_avatar ? BASE_URL + msg.sender_avatar : '',
        receiver_avatar: msg.receiver_avatar ? BASE_URL + msg.receiver_avatar : ''
      }))
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error('获取消息列表失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 处理Tab切换
const handleTabChange = (tab) => {
  activeTab.value = tab
  fetchMessages(tab)
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

onMounted(() => {
  fetchMessages('private')
})
</script>

<template>
  <div class="message-container">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="私信消息" name="private">
        <div class="table-header" v-if="isAdmin">
          <el-button 
            type="danger" 
            :disabled="selectedMessages.length === 0"
            @click="deleteSelected"
          >
            批量删除
          </el-button>
        </div>
        
        <el-table 
          :data="messageList" 
          style="width: 100%" 
          v-loading="loading"
          @selection-change="selectedMessages = $event"
        >
          <el-table-column 
            v-if="isAdmin"
            type="selection" 
            width="55"
          />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="发送者" min-width="120">
            <template #default="{ row }">
              <div class="user-info">
                <el-avatar 
                  :size="30" 
                  :src="row.sender_avatar"
                />
                <span>{{ row.sender_name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="接收者" min-width="120">
            <template #default="{ row }">
              <div class="user-info">
                <el-avatar 
                  :size="30" 
                  :src="row.receiver_avatar"
                />
                <span>{{ row.receiver_name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="消息内容" min-width="300">
            <template #default="{ row }">
              <div class="message-content">{{ row.content }}</div>
            </template>
          </el-table-column>
          <el-table-column label="发送时间" width="180">
            <template #default="{ row }">
              {{ formatTime(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag 
                :type="row.status === 'read' ? 'success' : 'warning'"
                size="small"
              >
                {{ row.status === 'read' ? '已读' : '未读' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column 
            v-if="isAdmin"
            label="操作" 
            width="100" 
            fixed="right"
          >
            <template #default="{ row }">
              <el-button 
                type="danger" 
                size="small"
                @click="deleteMessage(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="公共消息" name="public">
        <div class="table-header" v-if="isAdmin">
          <el-button 
            type="danger" 
            :disabled="selectedMessages.length === 0"
            @click="deleteSelected"
          >
            批量删除
          </el-button>
        </div>
        
        <el-table 
          :data="messageList" 
          style="width: 100%" 
          v-loading="loading"
          @selection-change="selectedMessages = $event"
        >
          <el-table-column 
            v-if="isAdmin"
            type="selection" 
            width="55"
          />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="发送者" min-width="120">
            <template #default="{ row }">
              <div class="user-info">
                <el-avatar 
                  :size="30" 
                  :src="row.sender_avatar"
                />
                <span>{{ row.sender_name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="消息内容" min-width="300">
            <template #default="{ row }">
              <div class="message-content">{{ row.content }}</div>
            </template>
          </el-table-column>
          <el-table-column label="发送时间" width="180">
            <template #default="{ row }">
              {{ formatTime(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag 
                :type="row.type === 'announcement' ? 'danger' : 'info'"
                size="small"
              >
                {{ row.type === 'announcement' ? '公告' : '普通' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column 
            v-if="isAdmin"
            label="操作" 
            width="100" 
            fixed="right"
          >
            <template #default="{ row }">
              <el-button 
                type="danger" 
                size="small"
                @click="deleteMessage(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.message-container {
  padding: 20px;
}

:deep(.el-table) {
  margin-top: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-content {
  white-space: pre-wrap;
  line-height: 1.5;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 20px;
}

:deep(.el-tabs__content) {
  padding: 20px 0;
}

.table-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}
</style> 