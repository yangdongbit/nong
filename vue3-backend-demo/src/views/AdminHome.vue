<script setup>
import Header from '@/components/Header.vue';
import AsideCom from '@/components/AsideCom.vue';
import { useUserpinyindbStore } from '@/stores/UserPinyinDB'
const userpinyindb = useUserpinyindbStore()
let username = JSON.parse(localStorage.getItem('userInfo'))  // 用户信息
userpinyindb.getUserpinyindb(username.id)


 
</script>

<template>
    <div class="common-layout">
        <el-container class="admin-container">
            <el-header class="admin-header">
                <Header></Header>
            </el-header>
            <el-container class="main-container">
                <el-aside width="200px" class="admin-aside">
                    <AsideCom></AsideCom>
                </el-aside>
                <el-main class="admin-main">
                    <RouterView></RouterView>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<style scoped>
.admin-container {
    min-height: 100vh;
    background-color: #f0f2f5;
}

.admin-header {
    padding: 0;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 1000;
    height: 80px;
}

.main-container {
    height: calc(100vh - 80px);
    padding-top: 5px;
}

.admin-aside {
    background-color: #fff;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    border-right: 1px solid #e0e0e0;
    overflow-y: auto;
    padding-top: 20px;
}

.admin-main {
    padding: 25px;
    background-color: #f0f2f5;
    overflow-y: auto;
}

/* 自定义滚动条样式 */
.admin-main::-webkit-scrollbar,
.admin-aside::-webkit-scrollbar {
    width: 6px;
}

.admin-main::-webkit-scrollbar-thumb,
.admin-aside::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 3px;
}

.admin-main::-webkit-scrollbar-track,
.admin-aside::-webkit-scrollbar-track {
    background-color: #f0f2f5;
}
</style>