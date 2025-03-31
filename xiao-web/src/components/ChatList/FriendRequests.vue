<template>
    <div class="friend-requests-container">
        <div class="requests-header">
            <span class="request-count" v-if="requests?.length > 0">
                ({{ requests.length }})
            </span>
        </div>
        
        <div class="requests-list">
            <div v-if="!requests?.length || requests[0]?.id === undefined" class="no-requests">
                暂无好友请求
            </div>
            <template v-else>
                <div v-for="request in requests" 
                     :key="request.id" 
                     class="request-item"
                >
                    <div class="request-info">
                        <img 
                            :src="request.avatar ? `http://127.0.0.1:3000${request.avatar}` : defaultAvatar"
                            :alt="request.name"
                            class="request-avatar"
                        />
                        <div class="request-details">
                            <div class="request-name">{{ request.name }}</div>
                            <div class="request-time">{{ formatTime(request.created_at) }}</div>
                        </div>
                    </div>
                    <div class="request-actions">
                        <button 
                            class="accept-btn"
                            @click="handleResponse(request, true)"
                        >
                            接受
                        </button>
                        <button 
                            class="reject-btn"
                            @click="handleResponse(request, false)"
                        >
                            拒绝
                        </button>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useLoginStore } from "../../nweStore/logins";

const loginStore = useLoginStore();
const defaultAvatar = 'http://127.0.0.1:3000/yang/img/img/logo.png';

const requests = ref([]);
const socket = ref(null);
let interval; // 添加这个变量来存储定时器

// 获取好友请求列表
const fetchRequests = async () => {
    try {
        const response = await fetch(`/api/friends/requests/${loginStore.Loginuser.id}`);
        const data = await response.json();
        
        if (data.status === 0) {
            requests.value = Array.isArray(data.data) ? data.data : [data.data];
        }
    } catch (error) {
        console.error('获取好友请求失败:', error);
    }
};

// 处理好友请求响应
const handleResponse = async (request, isAccepted) => {
    try {
        const response = await fetch('/api/friends/response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requestId: request.id,
                userId: loginStore.Loginuser.id,
                friendId: request.user_id,
                status: isAccepted ? 1 : 2
            })
        });

        const data = await response.json();
        if (data.status === 0) {
            // 从列表中移除该请求
            requests.value = requests.value.filter(r => r.id !== request.id);
            
            // 发送 WebSocket 消息通知对方
            if (socket.value && socket.value.readyState === WebSocket.OPEN) {
                socket.value.send(JSON.stringify({
                    type: 'friend_response',
                    data: {
                        from: loginStore.Loginuser.id,
                        to: request.user_id,
                        status: isAccepted ? 1 : 2
                    }
                }));
            }
        }
    } catch (error) {
        console.error('处理好友请求失败:', error);
    }
};

const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 初始化 WebSocket 连接
const initWebSocket = () => {
    socket.value = new WebSocket('ws://localhost:3007');
    
    socket.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'friend_request') {
            // 收到新的好友请求时刷新列表
            fetchRequests();
        }
    };
};

// 在组件挂载时初始化 WebSocket
onMounted(() => {
    initWebSocket();
    fetchRequests();
    interval = setInterval(fetchRequests, 30000);
});

// 将 onUnmounted 移到外面
onUnmounted(() => {
    if (interval) {
        clearInterval(interval);
    }
    if (socket.value) {
        socket.value.close();
    }
});
</script>

<style scoped>
.friend-requests-container {
    background: white;
    border-radius: 8px;
    margin: 1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.requests-header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.requests-header h3 {
    margin: 0;
    font-size: 1rem;
    color: #333;
}

.request-count {
    color: #007AFF;
    font-size: 0.9rem;
}

.requests-list {
    max-height: 400px;
    overflow-y: auto;
}

.no-requests {
    text-align: center;
    padding: 2rem;
    color: #666;
}

.request-item {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.request-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.request-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.request-name {
    font-weight: 500;
    color: #333;
    margin-bottom: 0.2rem;
}

.request-time {
    font-size: 0.8rem;
    color: #666;
}

.request-actions {
    display: flex;
    gap: 0.5rem;
}

.accept-btn, .reject-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s ease;
}

.accept-btn {
    background: #007AFF;
    color: white;
}

.accept-btn:hover {
    background: #0056b3;
}

.reject-btn {
    background: #f5f5f5;
    color: #333;
}

.reject-btn:hover {
    background: #e5e5e5;
}
</style> 