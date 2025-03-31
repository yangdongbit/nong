<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const replyList = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const currentReply = ref(null)
const isEditing = ref(false)

// 获取自动回复列表
const fetchReplyList = async () => {
  try {
    loading.value = true
    const response = await fetch('/api/yang/getAuto')
    const data = await response.json()
    replyList.value = data
  } catch (error) {
    console.error('获取自动回复列表失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 打开编辑/添加对话框
const openDialog = (reply = null) => {
  currentReply.value = reply ? { ...reply } : {
    trigger_keyword: '',
    reply_content: ''
  }
  isEditing.value = !!reply
  dialogVisible.value = true
}

// 保存自动回复
const saveReply = async () => {
  try {
    if (!currentReply.value.trigger_keyword || !currentReply.value.reply_content) {
      ElMessage.warning('请填写完整信息')
      return
    }

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    if (!userInfo.id || userInfo.administrator !== '1') {
      ElMessage.warning('需要管理员权限')
      return
    }

    const method = isEditing.value ? 'PUT' : 'POST'
    const url = isEditing.value 
      ? `/api/yang/auto_reply/${currentReply.value.id}`
      : '/api/yang/auto_reply'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'user-id': userInfo.id
      },
      body: JSON.stringify(currentReply.value)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    if (result.status === 0) {
      ElMessage.success(result.message)
      dialogVisible.value = false
      fetchReplyList()
    } else {
      ElMessage.error(result.message || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败: ' + error.message)
  }
}

// 删除自动回复
const deleteReply = async (reply) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    if (!userInfo.id || userInfo.administrator !== '1') {
      ElMessage.warning('需要管理员权限')
      return
    }

    await ElMessageBox.confirm(
      '确定要删除这条自动回复吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await fetch(`/api/yang/auto_reply/${reply.id}`, {
      method: 'DELETE',
      headers: {
        'user-id': userInfo.id
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    if (result.status === 0) {
      ElMessage.success(result.message)
      fetchReplyList()
    } else {
      ElMessage.error(result.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败: ' + error.message)
    }
  }
}

// 检查是否为管理员
const isAdmin = computed(() => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  return userInfo.administrator === '1'
})

onMounted(() => {
  fetchReplyList()
})
</script>

<template>
  <div class="auto-reply-container">
    <div class="header">
      <h2>自动回复管理</h2>
      <el-button 
        v-if="isAdmin"
        type="primary" 
        @click="openDialog()"
      >
        添加自动回复
      </el-button>
    </div>

    <el-table 
      :data="replyList" 
      style="width: 100%" 
      v-loading="loading"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="trigger_keyword" label="触发关键词" min-width="150" />
      <el-table-column prop="reply_content" label="回复内容" min-width="300" />
      
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button 
            v-if="isAdmin"
            size="small"
            type="primary"
            @click="openDialog(row)"
          >
            编辑
          </el-button>
          <el-button 
            v-if="isAdmin"
            size="small"
            type="danger"
            @click="deleteReply(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑/添加对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑自动回复' : '添加自动回复'"
      width="500px"
    >
      <el-form label-position="top">
        <el-form-item label="触发关键词">
          <el-input 
            v-model="currentReply.trigger_keyword"
            placeholder="请输入触发关键词"
          />
        </el-form-item>

        <el-form-item label="回复内容">
          <el-input 
            v-model="currentReply.reply_content"
            type="textarea"
            :rows="4"
            placeholder="请输入回复内容"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveReply">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.auto-reply-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

:deep(.el-table) {
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 