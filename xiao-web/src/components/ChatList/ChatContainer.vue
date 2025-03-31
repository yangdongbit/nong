<template>
    <div class="chat-container-wrapper">
        <!-- 左侧聊天列表 -->
        <div class="chat-sidebar">
            <!-- 顶部导航 -->
            <div class="sidebar-header">
                <div class="logo-container">
                    <img src="http://127.0.0.1:3000/yang/img/img/logo.png" alt="Logo" class="logo">
                    <span class="logo-text">农乐聊</span>
                </div>
                <div class="nav-items">
                    <div 
                        class="nav-item" 
                        :class="{ active: currentView === 'chats' }"
                        @click="currentView = 'chats'"
                    >
                        消息
                    </div>
                    <div 
                        class="nav-item" 
                        :class="{ active: currentView === 'contacts' }"
                        @click="currentView = 'contacts'"
                    >
                        联系人
                    </div>
                </div>
            </div>

            <!-- 聊天列表/联系人列表 -->
            <div class="sidebar-content">
                <!-- 消息列表 -->
                <div v-if="currentView === 'chats'" class="chat-list">
                    <!-- 公共聊天室 -->
                    <div 
                        class="chat-item" 
                        :class="{ active: currentChat === 'public' }"
                        @click="selectChat('public')"
                    >
                        <div class="chat-avatar">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="chat-info">
                            <div class="chat-name">公共聊天室</div>
                            <div class="chat-preview">在线人数: {{ onlineCount }}</div>
                        </div>
                    </div>
                    
                    <!-- 好友聊天列表 -->
                    <div v-for="friend in friendList" 
                         :key="friend.id"
                         class="chat-item"
                         :class="{ active: currentChat === `friend-${friend.id}` }"
                         @click="selectChat(`friend-${friend.id}`)"
                    >
                        <div class="chat-avatar">
                            <img :src="'http://127.0.0.1:3000' +friend.avatar || defaultAvatar" :alt="friend.name">
                            <span class="status-dot" :class="{ online: friend.isOnline }"></span>
                        </div>
                        <div class="chat-info">
                            <div class="chat-name">{{ friend.name }}</div>
                            <div class="chat-preview">{{ friend.isOnline ? '在线' : '离线' }}</div>
                        </div>
                    </div>
                </div>

                <!-- 联系人列表 -->
                <div v-else class="contacts-list">
                    <!-- 搜索框 -->
                    <div class="search-container">
                        <input 
                            type="text" 
                            v-model="searchKeyword"
                            placeholder="输入ID或用户名搜索..."
                            @input="handleSearch"
                            class="search-input"
                        >
                        <!-- 搜索结果列表 -->
                        <div v-if="searchResults.length > 0" class="search-results">
                            <div v-for="user in searchResults" 
                                 :key="user.id"
                                 class="search-result-item"
                            >
                                <div class="user-avatar">
                                    <img :src="user.avatar ? `http://127.0.0.1:3000${user.avatar}` : defaultAvatar" 
                                         :alt="user.name"
                                    >
                                    <span class="status-dot" :class="{ 'online': user.isOnline === '1' }"></span>
                                </div>
                                <div class="user-info">
                                    <div class="user-name">{{ user.name }}</div>
                                    <div class="user-id">ID: {{ user.id }}</div>
                                </div>
                                <button 
                                    v-if="!isFriend(user.id)"
                                    class="add-friend-btn"
                                    @click="handleAddFriend(user)"
                                >
                                    加好友
                                </button>
                                <span v-else class="friend-status">
                                    已是好友
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- 好友请求部分 -->
                    <FriendRequests @friend-added="fetchFriendList" />
                    
                    <!-- 好友列表部分 -->
                    <div class="section">
                        <div class="section-header">我的好友</div>
                        <div class="section-content">
                            <div v-if="!friendList?.length" class="no-friends">
                                暂无好友
                            </div>
                            <div v-else v-for="friend in friendList" 
                                 :key="friend.id"
                                 class="contact-item"
                            >
                                <div class="contact-avatar">
                                    <img :src="friend.avatar ? `http://127.0.0.1:3000${friend.avatar}` : defaultAvatar" 
                                         :alt="friend.name"
                                    >
                                    <span class="status-dot" :class="{ online: friend.isOnline }"></span>
                                </div>
                                <div class="contact-info">
                                    <div class="contact-name">{{ friend.name }}</div>
                                    <div class="contact-status">
                                        <span :class="{ 'status-online': friend.isOnline, 'status-offline': !friend.isOnline }">
                                            {{ friend.isOnline ? '在线' : '离线' }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 右侧聊天内容 -->
        <div class="chat-content">
            <Chats 
                v-if="currentChat === 'public'" 
                :friend-list="friendList"
            />
            <div v-else-if="currentChat.startsWith('friend-')" class="private-chat">
                <PrivateChat 
                    :friend="getCurrentChatFriend"
                    @message-sent="handleMessageSent"
                />
            </div>
            <div v-else class="welcome-screen">
                请选择一个聊天
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Chats from './Chats.vue';
import FriendRequests from './FriendRequests.vue';
import { useLoginStore } from "../../nweStore/logins";
import PrivateChat from './PrivateChat.vue';

const defaultAvatar = 'http://127.0.0.1:3000/yang/img/img/logo.png';
const currentView = ref('chats');  // 'chats' 或 'contacts'
const currentChat = ref('public');
const friendList = ref([]);  // 好友列表
const onlineCount = ref(0);  // 在线人数
const loginStore = useLoginStore();

const searchKeyword = ref('');
const searchResults = ref([]);
let searchTimeout = null;

// 选择聊天
const selectChat = (chatId) => {
    currentChat.value = chatId;
};

// 获取好友列表
const fetchFriendList = async () => {
    try {
        const response = await fetch(`/api/friends/list/${loginStore.Loginuser.id}`);
        const data = await response.json();
        
        if (data.status === 0) {
            const friendsData = data.data ? (Array.isArray(data.data) ? data.data : [data.data]) : [];
            friendList.value = friendsData.map(friend => ({
                ...friend,
                isOnline: friend.isOnline === 1 || friend.isOnline === '1',
                avatar: friend.avatar || defaultAvatar
            }));
        }
    } catch (error) {
        console.error('获取好友列表失败:', error);
        friendList.value = [];
    }
};

// 监听好友请求处理完成事件
const handleFriendAdded = () => {
    fetchFriendList();
};

// 添加好友状态变化的处理函数
const handleUserStatusChange = (userId, isOnline) => {
    const friend = friendList.value.find(f => f.id === userId);
    if (friend) {
        friend.isOnline = isOnline;
    }
};

// 检查是否是好友
const isFriend = (userId) => {
    return friendList.value.some(friend => friend.id === userId);
};

// 添加计算属性来处理搜索结果
const normalizedSearchResults = computed(() => {
    if (!searchResults.value) return [];
    return Array.isArray(searchResults.value) ? searchResults.value : [searchResults.value];
});

// 修改搜索处理函数
const handleSearch = () => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    if (!searchKeyword.value.trim()) {
        searchResults.value = [];
        return;
    }
    
    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`/api/users/search?keyword=${searchKeyword.value}&userId=${loginStore.Loginuser.id}`);
            const data = await response.json();
            
            if (data.status === 0) {
                searchResults.value = Array.isArray(data.data) ? data.data : [data.data];
                console.log('搜索结果:', searchResults.value);
            }
        } catch (error) {
            console.error('搜索用户失败:', error);
            searchResults.value = [];
        }
    }, 300);
};

// 处理添加好友
const handleAddFriend = async (user) => {
    try {
        const response = await fetch('/api/friends/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: loginStore.Loginuser.id,
                friendId: user.id
            })
        });

        const data = await response.json();
        alert(data.message);

        if (data.status === 0) {
            // 清空搜索结果
            searchResults.value = [];
            searchKeyword.value = '';
        }
    } catch (error) {
        console.error('发送好友请求失败:', error);
        alert('发送请求失败，请稍后重试');
    }
};

// 在组件挂载时设置定时刷新
let friendListInterval;

// 添加获取当前聊天好友的计算属性
const getCurrentChatFriend = computed(() => {
    if (!currentChat.value.startsWith('friend-')) return null;
    const friendId = parseInt(currentChat.value.split('-')[1]);
    return friendList.value.find(f => f.id === friendId);
});

// 处理消息发送成功
const handleMessageSent = () => {
    // 可以在这里添加一些额外的处理逻辑
};

onMounted(() => {
    console.log('ChatContainer组件已挂载');
    fetchFriendList();
    friendListInterval = setInterval(fetchFriendList, 30000);
});

onUnmounted(() => {
    if (friendListInterval) {
        clearInterval(friendListInterval);
    }
});
</script>

<style scoped>
.chat-container-wrapper {
    display: flex;
    height: 100vh;
    background: #f5f5f5;
}

.chat-sidebar {
    width: 280px;
    background: white;
    border-right: 1px solid #eee;
    display: flex;
    flex-direction: column;
}

.sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
}

.logo-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0 0.5rem;
}

.logo {
    width: 100px;
    height: px;
    border-radius: 6px;
}

.logo-text {
    font-size: 1.2rem;
    font-weight: 500;
    color: #333;
}

.nav-items {
    display: flex;
    background: #f5f5f5;
    padding: 2px;
    border-radius: 8px;
}

.nav-item {
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.nav-item:hover {
    background: #f0f7ff;
}

.nav-item.active {
    background: #007AFF;
    color: white;
}

.sidebar-content {
    flex: 1;
    overflow-y: auto;
}

.chat-item, .contact-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    gap: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.chat-item:hover, .contact-item:hover {
    background: #f5f5f5;
}

.chat-item.active {
    background: #f0f7ff;
}

.chat-avatar, .contact-avatar {
    position: relative;
    width: 40px;
    height: 40px;
}

.chat-avatar img, .contact-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}

.status-dot {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ccc;
    border: 2px solid white;
}

.status-dot.online {
    background: #4CAF50;
}

.chat-info, .contact-info {
    flex: 1;
    min-width: 0;
}

.chat-name, .contact-name {
    font-weight: 500;
    margin-bottom: 0.2rem;
}

.chat-preview, .contact-status {
    font-size: 0.8rem;
    color: #666;
}

.section-header {
    padding: 1rem;
    font-size: 0.9rem;
    color: #666;
    background: #f9f9f9;
}

.chat-content {
    flex: 1;
    overflow: hidden;
}

.welcome-screen {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 1.2rem;
}

.no-friends {
    text-align: center;
    padding: 2rem;
    color: #999;
    font-size: 0.9rem;
}

.status-online {
    color: #07c160;
}

.status-offline {
    color: #999;
}

.contact-item {
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid #f5f5f5;
    transition: all 0.3s ease;
}

.contact-item:hover {
    background: #f8f8f8;
    transform: translateX(4px);
}

.search-container {
    padding: 1rem;
    position: relative;
    background: white;
    border-bottom: 1px solid #eee;
}

.search-input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #eee;
    border-radius: 8px;
    outline: none;
    font-size: 0.9rem;
}

.search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    max-height: 300px;
    overflow-y: auto;
    z-index: 1000;
}

.search-result-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    gap: 1rem;
    border-bottom: 1px solid #f5f5f5;
    transition: background-color 0.3s ease;
}

.search-result-item:hover {
    background-color: #f8f8f8;
}

.search-result-item .user-avatar {
    position: relative;
    width: 40px;
    height: 40px;
}

.search-result-item .user-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}

.search-result-item .user-info {
    flex: 1;
}

.search-result-item .user-name {
    font-weight: 500;
    color: #333;
}

.search-result-item .user-id {
    font-size: 0.8rem;
    color: #999;
    margin-top: 0.2rem;
}

.search-result-item .add-friend-btn {
    padding: 6px 12px;
    background: #007AFF;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.search-result-item .add-friend-btn:hover {
    background: #0056b3;
}

.search-result-item .friend-status {
    padding: 6px 12px;
    color: #999;
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
</style> 