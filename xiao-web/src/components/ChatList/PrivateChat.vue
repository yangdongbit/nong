<template>
    <div class="private-chat-container">
        <!-- 聊天头部 -->
        <div class="chat-header">
            <div class="friend-info">
                <img 
                    :src="getAvatarUrl(friend.avatar)"
                    :alt="friend.name"
                    class="friend-avatar"
                >
                <div class="friend-details">
                    <div class="friend-name">{{ friend.name }}</div>
                    <div class="friend-status" :class="{ 'online': friend.isOnline }">
                        {{ friend.isOnline ? '在线' : '离线' }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 聊天消息区域 -->
        <div class="messages-container" ref="messagesContainer">
            <div v-for="(msg, index) in messages" 
                 :key="msg.id"
                 class="message-wrapper"
                 :class="{ 'my-message': msg.sender_id === myId }"
            >
                <!-- 时间分割线 -->
                <div v-if="shouldShowTime(msg, index)" class="time-divider">
                    {{ formatMessageTime(msg.created_at) }}
                </div>
                
                <!-- 消息内容 -->
                <div class="message-content">
                    <div class="avatar-container">
                        <img 
                            :src="getAvatarUrl(msg.sender_avatar)"
                            :alt="msg.sender_id === myId ? loginStore.Loginuser.name : msg.sender_name"
                            class="user-avatar"
                            @error="handleImageError"
                        />
                    </div>
                    <div class="message-body">
                        <div class="message-bubble">{{ msg.content }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
            <form @submit.prevent="sendMessage" class="message-form">
                <input 
                    type="text" 
                    v-model="newMessage" 
                    placeholder="输入消息..."
                    @keypress.enter.prevent="sendMessage"
                >
                <button type="submit" :disabled="!newMessage.trim()">发送</button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { useLoginStore } from "../../nweStore/logins";

const props = defineProps({
    friend: {
        type: Object,
        required: true
    }
});

const loginStore = useLoginStore();
const myId = loginStore.Loginuser.id;
const myAvatar = ref(loginStore.Loginuser.avatar || '');
const defaultAvatar = 'http://127.0.0.1:3000/yang/img/img/logo.png';

const messages = ref([]);
const newMessage = ref('');
const messagesContainer = ref(null);

// 获取历史消息
const fetchMessages = async () => {
    try {
        const response = await fetch(`/api/private/messages/${myId}/${props.friend.id}`);
        const data = await response.json();
        
        if (data.status === 0) {
            messages.value = data.data;
            await scrollToBottom();
            updateMessageStatus();
        }
    } catch (error) {
        console.error('获取私聊消息失败:', error);
    }
};

// 发送消息
const sendMessage = async () => {
    if (!newMessage.value.trim()) return;
    
    try {
        const messageData = {
            sender_id: myId,
            receiver_id: props.friend.id,
            content: newMessage.value,
            sender_avatar: loginStore.Loginuser.avatar
        };

        const response = await fetch('/api/private/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        });

        const data = await response.json();
        
        if (data.status === 0) {
            // 不直接添加消息到列表，而是通过 WebSocket 统一处理
            const wsMessage = {
                type: 'private_message',
                data: {
                    ...data.data,
                    sender_name: loginStore.Loginuser.name
                }
            };

            if (window.socket && window.socket.readyState === WebSocket.OPEN) {
                window.socket.send(JSON.stringify(wsMessage));
            }
            newMessage.value = '';
            // 移除这里的 scrollToBottom，因为在接收消息时会调用
        }
    } catch (error) {
        console.error('发送消息失败:', error);
    }
};

// 更新消息已读状态
const updateMessageStatus = async () => {
    try {
        await fetch('/api/private/messages/read', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: myId,
                friendId: props.friend.id
            })
        });
    } catch (error) {
        console.error('更新消息状态失败:', error);
    }
};

// 滚动到底部
const scrollToBottom = async () => {
    await nextTick();
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
};

// 处理收到的新消息
const handleNewMessage = (message) => {
    messages.value.push(message);
    scrollToBottom();
    updateMessageStatus();
};

// 时间显示相关函数
const shouldShowTime = (msg, index) => {
    if (!msg || !msg.created_at) return false;
    if (index === 0) return true;
    const prevMsg = messages.value[index - 1];
    if (!prevMsg || !prevMsg.created_at) return true;
    return new Date(msg.created_at) - new Date(prevMsg.created_at) > 5 * 60 * 1000;
};

const formatMessageTime = (time) => {
    const date = new Date(time);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// WebSocket 消息处理
const setupWebSocket = () => {
    // 如果已经有连接，不要重复创建
    if (window.socket && window.socket.readyState === WebSocket.OPEN) {
        return;
    }

    // 如果有旧的连接，先关闭
    if (window.socket) {
        window.socket.close();
        window.socket = null;
    }

    window.socket = new WebSocket('ws://localhost:3007');
    
    window.socket.onopen = () => {
        window.socket.send(JSON.stringify({
            type: 'join',
            id: myId,
            name: loginStore.Loginuser.name,
            avatar: loginStore.Loginuser.avatar
        }));
    };

    window.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'private_message') {
            const msg = data.data;
            
            // 只处理与当前聊天好友相关的消息
            if (msg.sender_id === props.friend.id || 
                (msg.sender_id === myId && msg.receiver_id === props.friend.id)) {
                const newMsg = {
                    ...msg,
                    created_at: msg.created_at || new Date().toISOString()
                };
                messages.value.push(newMsg);
                scrollToBottom();
                
                // 如果是收到的消息，标记为已读
                if (msg.sender_id === props.friend.id) {
                    updateMessageStatus();
                }
            }
        }
    };

    window.socket.onclose = () => {
        // 只有在组件没有卸载的情况下才重连
        if (!isUnmounted.value) {
            setTimeout(setupWebSocket, 3000);
        }
    };
};

// 添加一个标记来跟踪组件是否已卸载
const isUnmounted = ref(false);

onUnmounted(() => {
    isUnmounted.value = true;
    if (window.socket) {
        window.socket.close();
        window.socket = null;
    }
});

// 生命周期钩子
onMounted(async () => {
    console.log('组件挂载，当前用户ID:', myId);
    console.log('当前好友ID:', props.friend.id);
    if (loginStore.Loginuser.avatar) {
        myAvatar.value = loginStore.Loginuser.avatar;
    }
    setupWebSocket();
    await fetchMessages();
    updateMessageStatus();
});

// 监听好友变化
watch(() => props.friend, () => {
    fetchMessages();
    updateMessageStatus();
}, { deep: true });

const handleImageError = (e) => {
    e.target.src = defaultAvatar;
};

const getAvatarUrl = (avatar) => {
    if (!avatar) return defaultAvatar;
    if (avatar.startsWith('http')) return avatar;
    return `http://127.0.0.1:3000${avatar}`;
};

// 添加一个监听器来更新头像
watch(() => loginStore.Loginuser.avatar, (newAvatar) => {
    if (newAvatar) {
        myAvatar.value = newAvatar;
    }
});
</script>

<style scoped>
.private-chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #f5f5f5;
}

.chat-header {
    padding: 1rem;
    background: white;
    border-bottom: 1px solid #eee;
}

.messages-container {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    background: #f5f5f5;
}

.input-area {
    background: white;
    padding: 1rem;
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
    font-size: 0.95rem;
    transition: background 0.2s;
}

button:hover {
    background: #06ae56;
}

button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.friend-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.friend-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.friend-name {
    font-weight: 500;
    color: #333;
}

.friend-status {
    font-size: 0.8rem;
    color: #999;
}

.friend-status.online {
    color: #07c160;
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

.my-message .message-content {
    flex-direction: row-reverse;
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

.message-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.message-bubble {
    padding: 0.8rem 1rem;
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.my-message .message-bubble {
    background: #95ec69;
}

.message-status {
    font-size: 0.8rem;
    color: #999;
    text-align: right;
}

.time-divider {
    text-align: center;
    margin: 1rem 0;
    font-size: 0.8rem;
    color: #999;
}
</style> 