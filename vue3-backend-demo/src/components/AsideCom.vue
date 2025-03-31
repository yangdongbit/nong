<script setup>
</script>

<template>
    <div>
        <el-menu
        default-active="goods"
        router
        >
            <el-menu-item index="goods">
                <el-icon><Star /></el-icon>
                <span>商品管理</span>
            </el-menu-item>
            <el-menu-item index="users">
                <el-icon><User /></el-icon>
                <span>用户管理</span>
            </el-menu-item>
            <el-menu-item index="orders">
                <el-icon><Message /></el-icon>
                <span>订单管理</span>
            </el-menu-item>
            <el-menu-item index="reviews">
                <el-icon><ChatDotSquare /></el-icon>
                <span>评论管理</span>
            </el-menu-item>
            <el-menu-item index="storymanager">
                <el-icon><ForkSpoon /></el-icon>
                <span>故事管理</span>
            </el-menu-item>
            <el-menu-item index="autoreplymanager">
                <el-icon><Service /></el-icon>
                <span>客服管理</span>  
            </el-menu-item>
            <el-menu-item index="message">
                <el-icon><ChatRound /></el-icon>
                <span>消息管理</span>  
            </el-menu-item>
        </el-menu>
    </div>
</template>

<style scoped></style>