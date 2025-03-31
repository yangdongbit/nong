<script setup lang="ts">
import { useUserpinyindbStore } from '@/stores/UserPinyinDB'
import { useProductfetcherStore } from '@/stores/ProductFetcher'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const userpinyindb = useUserpinyindbStore()
const userInfo = ref(null)
const userAvatar = ref('')

onMounted(async () => {
    try {
        const storedUserInfo = localStorage.getItem('userInfo')
        if (storedUserInfo) {
            userInfo.value = JSON.parse(storedUserInfo)
            const userData = await userpinyindb.getUserpinyindb(userInfo.value.id)
            userAvatar.value = `http://127.0.0.1:3000${userData.avatar_url}`
        }
    } catch (error) {
        console.error('获取用户信息失败:', error)
        userAvatar.value = 'http://124.223.88.78:3000/yang/img/img/logo.png'
    }
})

const farms = useProductfetcherStore()
farms.getfarms()

const router = useRouter()

const handleCommand = (command: string) => {
  if (command === 'logout') {
    localStorage.removeItem('userInfo')
    router.push('/login')
  }
}
</script>

<template>
    <div>
        <!-- logo -->
        <img src="http://124.223.88.78:3000/yang/img/img/logo.png" alt="" class="logo">
        <div class="avatar">
            <el-dropdown @command="handleCommand">
                <el-avatar 
                    :src="userAvatar"
                    :size="40"
                    @error="() => true"
                />
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<style scoped>
.logo {
    width: 100px;
    margin-top: -20px;
}

.avatar {
    float: right;
    margin: 10px;
    cursor: pointer;
}
</style>