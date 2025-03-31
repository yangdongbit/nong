<template>
    <div class="chat-container">
        <!-- 聊天室头部 -->
        <div class="chat-header">
            <div class="header-title">
                <h2>农乐聊</h2>
                <div class="header-actions">
                    <span class="online-count" @click="toggleUserDrawer">
                        {{ onlineUsers.filter(u => u.isOnline).length }}/{{ onlineUsers.length }}
                        <i class="fas fa-chevron-right" :class="{ 'rotate': showUserDrawer }"></i>
                    </span>
                </div>
            </div>
        </div>

        <!-- 聊天内容区域 -->
        <div class="chat-body">
            <!-- 聊天消息区域 -->
            <div class="messages-container" ref="messagesContainer">
                <template v-for="(msg, index) in messages" :key="msg.time">
                    <!-- 时间分割线 -->
                    <div v-if="shouldShowTime(msg, index)" class="time-divider">
                        {{ formatMessageTime(msg.time) }}
                    </div>
                    
                    <!-- 消息气泡 -->
                    <div class="message-wrapper" :class="{ 'my-message': msg.isMine, 'system-message': msg.isSystem }">
                        <!-- 系统消息 -->
                        <div v-if="msg.isSystem" class="message-content system">
                            <div class="message-bubble system">{{ msg.text }}</div>
                        </div>
                        <!-- 普通消息 -->
                        <div v-else class="message-content">
                            <!-- 对方的头像 -->
                            <template v-if="!msg.isMine">
                                <div class="avatar-container">
                                    <img 
                                        :src="msg.avatar ? `http://127.0.0.1:3000${msg.avatar}` : defaultAvatar"
                                        :alt="msg.name"
                                        class="user-avatar"
                                    />
                                </div>
                                <div class="message-body">
                                    <div class="message-sender">{{ msg.name }}</div>
                                    <div class="message-bubble">{{ msg.text }}</div>
                                </div>
                            </template>
                            
                            <!-- 自己的消息和头像 -->
                            <template v-else>
                                <div class="message-body">
                                    <div class="message-sender text-right">{{ msg.name }}</div>
                                    <div class="message-bubble">{{ msg.text }}</div>
                                </div>
                                <div class="avatar-container">
                                    <img 
                                        :src="myAvatarUrl ? `http://127.0.0.1:3000${myAvatarUrl}` : defaultAvatar"
                                        :alt="myName"
                                        class="user-avatar"
                                    />
                                </div>
                            </template>
                        </div>
                    </div>
                </template>
            </div>

            <!-- 在线用户抽屉 -->
            <div class="users-drawer" :class="{ 'drawer-open': showUserDrawer }">
                <div class="drawer-header">
                    <h3>在线用户 ({{ onlineUsers.filter(u => u.isOnline).length }}/{{ onlineUsers.length }})</h3>
                    <button class="close-btn" @click="showUserDrawer = false">×</button>
                </div>
                <div class="users-list">
                    <div v-for="user in sortedUsers" 
                         :key="user.id"
                         class="user-item"
                         :class="{ 'current-user': user.id === myId }"
                    >
                        <div class="user-avatar">
                            <img 
                                :src="user.avatar ? `http://127.0.0.1:3000${user.avatar}` : defaultAvatar"
                                :alt="user.name"
                            />
                            <span class="status-dot" :class="{ 'online': user.isOnline }"></span>
                        </div>
                        <div class="user-info">
                            <div class="user-name">
                                {{ user.id === myId ? `${user.name} (我)` : user.name }}
                            </div>
                            <div class="user-status">
                                {{ user.isOnline ? '在线' : '离线' }}
                            </div>
                        </div>
                        <button 
                            v-if="user.id !== myId && !isFriend(user.id)" 
                            class="add-friend-btn"
                            @click="handleAddFriend(user)"
                        >
                            加好友
                        </button>
                        <span v-else-if="user.id !== myId" class="friend-status">
                            已是好友
                        </span>
                    </div>
                </div>
            </div>

            <!-- 输入框区域 -->
            <div class="input-container">
                <form @submit.prevent="sendMessage" class="message-form">
                    <input 
                        type="text" 
                        v-model="message" 
                        placeholder="输入消息..."
                        @keypress.enter.prevent="sendMessage"
                    >
                    <button type="submit" :disabled="!message.trim()">发送</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, onUnmounted, computed } from 'vue';
import { useLoginStore } from "../../nweStore/logins";
import { useUserHub } from "../../nweStore/UserHub";

const loginStore = useLoginStore();
const UserHub = useUserHub();
const messages = ref([]);
const message = ref('');
const isConnected = ref(false);
const messagesContainer = ref(null);

const myId = ref(loginStore.Loginuser.id);
const myName = ref(loginStore.Loginuser.name || `用户${Math.floor(Math.random() * 1000)}`);
const myAvatarUrl = ref('');
const defaultAvatar = 'http://127.0.0.1:3000/yang/img/img/logo.png';

let socket = null;

// 添加在线用户列表
const onlineUsers = ref([]);

// 添加新的响应式变量
const showAddFriendModal = ref(false);
const selectedUser = ref(null);

// 添加抽屉控制变量
const showUserDrawer = ref(false);

function getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

async function scrollToBottom() {
    await nextTick();
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
}

// 获取历史消息
const fetchMessages = async () => {
    try {
        const response = await fetch('http://localhost:3007/api/public/messages');
        const data = await response.json();
        
        if (data.status === 0) {
            messages.value = data.data.map(msg => ({
                id: msg.id,
                name: msg.sender_name,
                text: msg.content,
                time: msg.created_at,
                avatar: msg.sender_avatar,
                isMine: msg.user_id === myId.value
            }));
            await scrollToBottom();
        }
    } catch (error) {
        console.error('获取公共聊天记录失败:', error);
    }
};

// 初始化WebSocket连接
const setupWebSocket = async () => {
    // 确保先获取到头像
    if (!myAvatarUrl.value && UserHub.UserHub[0]?.avatar_url) {
        myAvatarUrl.value = UserHub.UserHub[0].avatar_url;
    }

    socket = new WebSocket('ws://localhost:3007');

    socket.onopen = () => {
        console.log('WebSocket 连接已建立');
        socket.send(JSON.stringify({
            type: 'join',
            id: myId.value,
            name: myName.value,
            avatar: myAvatarUrl.value
        }));
    };

    socket.onerror = (error) => {
        console.error('WebSocket 错误：', error);
        isConnected.value = false;
    };

    socket.onclose = () => {
        console.log('WebSocket 连接已关闭');
        isConnected.value = false;
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
            case 'public_message':
                const messageData = {
                    id: data.data.id,
                    name: data.data.sender_name,
                    text: data.data.content,
                    time: data.data.created_at,
                    isMine: data.data.sender_id === myId.value,
                    avatar: data.data.sender_avatar
                };
                messages.value.push(messageData);
                break;
                
            case 'system':
                messages.value.push({
                    text: data.data.msg,
                    time: data.data.time,
                    isSystem: true
                });
                break;

            case 'userList':
                onlineUsers.value = data.data.users.map(user => ({
                    ...user,
                    avatar: user.avatar
                }));
                break;

            case 'friend_request':
                handleFriendRequest(data.data);
                break;
        }
        
        scrollToBottom();
    };
};

// 发送消息函数
function sendMessage() {
    if (!message.value.trim() || !socket) return;
    
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'public_message',
            content: message.value,
            sender_id: myId.value,
            sender_name: myName.value,
            sender_avatar: myAvatarUrl.value
        }));
        message.value = '';
    }
}

// 修改组件挂载函数
onMounted(async () => {
    // 先获取用户信息
    await UserHub.getUserHub();
    if (UserHub.UserHub[0]?.avatar_url) {
        myAvatarUrl.value = UserHub.UserHub[0].avatar_url;
    }
    
    fetchMessages();
    setupWebSocket();
});

// 组件卸载时清理WebSocket连接
onUnmounted(() => {
    if (socket) {
        socket.close();
        socket = null;
    }
});

// 监听头像变化
watch(() => UserHub.UserHub[0]?.avatar_url, (newVal) => {
    if (newVal) {
        myAvatarUrl.value = newVal;
    }
});

// 判断是否需要显示时间
function shouldShowTime(currentMsg, index) {
    if (index === 0) return true;
    
    const prevMsg = messages.value[index - 1];
    const currentTime = new Date(currentMsg.time);
    const prevTime = new Date(prevMsg.time);
    
    // 如果两条消息时间相差超过3分钟，显示时间
    return (currentTime - prevTime) > 3 * 60 * 1000;
}

// 格式化消息时间显示
function formatMessageTime(timeStr) {
    const msgDate = new Date(timeStr);
    const now = new Date();
    
    // 如果是今天的消息
    if (msgDate.toDateString() === now.toDateString()) {
        return msgDate.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
    }
    
    // 如果是昨天的消息
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (msgDate.toDateString() === yesterday.toDateString()) {
        return `昨天 ${msgDate.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit'
        })}`;
    }
    
    // 其他日期的消息
    return msgDate.toLocaleDateString('zh-CN', { 
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 计算属性：排序后的用户列表
const sortedUsers = computed(() => {
    return [...onlineUsers.value].sort((a, b) => {
        // 1. 自己永远排在最前面
        if (a.id === myId.value) return -1;
        if (b.id === myId.value) return 1;
        
        // 2. 在线用户排在离线用户前面
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        
        // 3. 同样状态的用户按名字排序
        return a.name.localeCompare(b.name, 'zh-CN');
    });
});

// 处理添加好友
const handleAddFriend = async (user) => {
    console.log('点击加好友按钮:', user);
    try {
        const response = await fetch('/api/friends/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: myId.value,
                friendId: user.id
            })
        });

        const data = await response.json();
        alert(data.message); // 显示服务器返回的消息

        if (data.status === 0) {
            // 发送WebSocket消息通知对方
            socket.send(JSON.stringify({
                type: 'friend_request',
                data: {
                    from: myId.value,
                    to: user.id,
                    name: myName.value,
                    avatar: myAvatarUrl.value
                }
            }));
        }
    } catch (error) {
        console.error('发送好友请求失败:', error);
        alert('发送请求失败，请稍后重试');
    }
};

// 确认添加好友
const confirmAddFriend = async () => {
    try {
        const response = await fetch('/api/friends/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: myId.value,
                friendId: selectedUser.value.id
            })
        });

        const data = await response.json();
        if (data.status === 0) {
            // 发送WebSocket消息通知对方
            socket.send(JSON.stringify({
                type: 'friend_request',
                data: {
                    from: myId.value,
                    to: selectedUser.value.id,
                    name: myName.value
                }
            }));
            alert('好友请求已发送');
        } else {
            alert(data.message || '发送好友请求失败');
        }
    } catch (error) {
        console.error('发送好友请求失败:', error);
        alert('发送请求失败，请稍后重试');
    } finally {
        showAddFriendModal.value = false;
        selectedUser.value = null;
    }
};

// 处理收到的好友请求
const handleFriendRequest = (data) => {
    // 不再使用 confirm，而是直接发送系统消息提醒
    messages.value.push({
        text: `${data.name} 请求添加您为好友`,
        time: new Date().toISOString(),
        isSystem: true
    });
    // 更新好友请求列表会通过 FriendRequests 组件自动刷新
};

// 切换抽屉显示状态
const toggleUserDrawer = () => {
    showUserDrawer.value = !showUserDrawer.value;
};

onMounted(() => {
    scrollToBottom();
});

// 检查是否已经是好友
const isFriend = (userId) => {
    // 从 props 中获取好友列表
    return props.friendList.some(friend => friend.id === userId);
};

// 定义 props
const props = defineProps({
    friendList: {
        type: Array,
        required: true,
        default: () => []
    }
});
</script>

<style scoped>
.chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #f5f5f5;
}

.chat-header {
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid #eee;
}

.header-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.header-title h2 {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.online-count {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 4px 12px;
    border-radius: 12px;
    transition: all 0.3s ease;
    background: #f0fff0;
    color: #07c160;
    font-size: 0.9rem;
}

.online-count:hover {
    background: #e6f7e6;
}

.online-count i {
    transition: transform 0.3s ease;
}

.online-count i.rotate {
    transform: rotate(90deg);
}

.chat-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
}

.messages-container {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
}

.message-wrapper {
    margin-bottom: 1rem;
    width: 100%;
}

.message-content {
    display: flex;
    gap: 12px;
    max-width: 70%;
}

.my-message {
    display: flex;
    justify-content: flex-end;
}

.message-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.message-sender {
    font-size: 0.8rem;
    color: #999;
}

.text-right {
    text-align: right;
}

.message-bubble {
    padding: 0.8rem 1rem;
    border-radius: 4px;
    background: white;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.my-message .message-bubble {
    background: #95ec69;
}

.avatar-container {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
}

.user-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}

.system-message {
    display: flex;
    justify-content: center;
    width: 100%;
}

.system-message .message-content {
    max-width: none;
    justify-content: center;
}

.system-message .message-bubble {
    background: rgba(0, 0, 0, 0.03);
    color: #999;
    font-size: 0.9em;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    box-shadow: none;
    text-align: center;
}

.time-divider {
    text-align: center;
    margin: 1rem 0;
    font-size: 0.8rem;
    color: #999;
}

.input-container {
    padding: 1rem;
    background: #fff;
    border-top: 1px solid #eee;
}

.message-form {
    display: flex;
    gap: 0.8rem;
}

input {
    flex: 1;
    padding: 0.8rem;
    border: 1px solid #eee;
    border-radius: 4px;
    outline: none;
    font-size: 0.95rem;
}

input:focus {
    border-color: #07c160;
}

button {
    padding: 0.8rem 1.5rem;
    background: #07c160;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 0.95rem;
}

button:hover {
    background: #06ae56;
}

button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.users-drawer {
    position: absolute;
    top: 0;
    right: -300px;
    width: 300px;
    height: 100%;
    background: white;
    box-shadow: -2px 0 8px rgba(0,0,0,0.1);
    transition: right 0.3s ease;
    display: flex;
    flex-direction: column;
}

.users-drawer.drawer-open {
    right: 0;
}

.drawer-header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.drawer-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #999;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.close-btn:hover {
    background: #f5f5f5;
    color: #666;
}

.users-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
}

.user-item {
    display: flex;
    align-items: center;
    padding: 0.8rem;
    gap: 0.8rem;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.user-item:hover {
    background: #f5f5f5;
}

.user-item.current-user {
    background: #f0f7ff;
}

.user-avatar {
    position: relative;
    width: 40px;
    height: 40px;
}

.user-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}

.status-dot {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ccc;
    border: 2px solid white;
}

.status-dot.online {
    background: #07c160;
}

.user-info {
    flex: 1;
    min-width: 0;
}

.user-name {
    font-weight: 500;
    color: #333;
    margin-bottom: 0.2rem;
}

.user-status {
    font-size: 0.8rem;
    color: #999;
}

.add-friend-btn {
    padding: 4px 12px;
    font-size: 0.9rem;
    background: #007AFF;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    opacity: 0;
    transition: all 0.3s ease;
}

.user-item:hover .add-friend-btn {
    opacity: 1;
}

.add-friend-btn:hover {
    background: #0056b3;
}

.friend-status {
    font-size: 0.9rem;
    color: #999;
    padding: 4px 12px;
}
</style>