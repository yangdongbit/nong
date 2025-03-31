<template>
  <div class="customer-service">
    <!-- 客服按钮 -->
    <button 
      class="service-btn"
      @click="toggleServicePanel"
    >
      <div class="service-icon">
        <MessageCircle v-if="!isOpen" />
        <X v-else />
      </div>
      <span>{{ isOpen ? '收起' : '在线客服' }}</span>
    </button>

    <!-- 客服面板 -->
    <div class="service-panel" v-show="isOpen">
      <div class="panel-header">
        <h3>在线客服</h3>
        <span class="online-status">
          <span class="status-dot"></span>
          在线
        </span>
      </div>
      
      <div class="chat-container">
        <div class="messages" ref="messagesContainer">
          <!-- 系统消息 -->
          <div class="message system">
            <p>客服小农已接入对话</p>
          </div>
          
          <!-- 消息列表 -->
          <div v-for="(msg, index) in messages" 
               :key="index" 
               :class="['message', msg.type]">
            <div class="avatar" v-if="msg.type === 'service'">
              <img src="http://127.0.0.1:3000/yang/img/img/logo.png" alt="客服头像">
            </div>
            <div class="message-content">
              <p>{{ msg.content }}</p>
            </div>
          </div>
        </div>

        <!-- 输入框区域 -->
        <div class="input-area">
          <input 
            type="text" 
            v-model="inputMessage"
            @keyup.enter="sendMessage"
            placeholder="请输入您的问题..."
          >
          <button @click="sendMessage" class="send-btn">发送</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { MessageCircle, X } from 'lucide-vue-next'
import axios from 'axios';

const isOpen = ref(false)
const inputMessage = ref('')
const messages = ref([
  {
    type: 'service',
    content: '您好！请问有什么可以帮助您？'
  }
])
const messagesContainer = ref(null)

// 修改为数组形式
const autoReplies = ref([])

const toggleServicePanel = () => {
  isOpen.value = !isOpen.value
}

// 默认回复
const defaultReplies = [
  '您好，请问还有什么可以帮助您的吗？',
  '抱歉，我可能没太明白您的问题，您能换个方式描述一下吗？',
  '这个问题我需要更多信息才能帮您解答，您能详细说明一下吗？',
  '您可以咨询开店流程、费用、优惠政策等问题，我很乐意为您解答'
]

onMounted(() => {
  axios({
    url: 'api/yang/getAuto',
    method: 'GET'
  }).then(result => {
    autoReplies.value = result.data
  })
})

// 修改发送消息的逻辑
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return
  
  // 添加用户消息
  const userMessage = inputMessage.value
  messages.value.push({
    type: 'user',
    content: userMessage
  })
  
  // 清空输入框
  inputMessage.value = ''
  
  // 查找匹配的关键词回复
  let reply = defaultReplies[Math.floor(Math.random() * defaultReplies.length)]
  
  // 找到所有匹配当前输入关键词的回复
  const matchingReplies = autoReplies.value.filter(item => 
    userMessage.includes(item.trigger_keyword)
  )
  
  // 如果有匹配的回复，随机选择一个
  if (matchingReplies.length > 0) {
    const randomReply = matchingReplies[Math.floor(Math.random() * matchingReplies.length)]
    reply = randomReply.reply_content
  }
  
  // 模拟客服回复延迟
  setTimeout(() => {
    messages.value.push({
      type: 'service',
      content: reply
    })
    scrollToBottom()
  }, 1000)
  
  await scrollToBottom()
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 监听消息变化，自动滚动到底部
watch(messages, scrollToBottom)
</script>

<style scoped>
.customer-service {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
}

.service-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.service-btn:hover {
  background-color: #059669;
  transform: translateY(-2px);
}

.service-icon {
  display: flex;
  align-items: center;
}

.service-panel {
  position: absolute;
  bottom: calc(100% + 16px);
  right: 0;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  background-color: #10b981;
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
}

.online-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: #4ade80;
  border-radius: 50%;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100% - 56px);
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.message {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  overflow: hidden;
  border: 2px solid #10b981;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: #f3f4f6;
}

.message.user .message-content {
  background-color: #10b981;
  color: white;
}

.message.system {
  justify-content: center;
}

.message.system .message-content {
  background-color: transparent;
  color: #6b7280;
  font-size: 12px;
}

.input-area {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
}

.input-area input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  outline: none;
}

.input-area input:focus {
  border-color: #10b981;
}

.send-btn {
  padding: 8px 16px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.send-btn:hover {
  background-color: #059669;
}
</style> 