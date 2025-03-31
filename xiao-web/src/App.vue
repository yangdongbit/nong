<template>
  <div id="app">
    <div class="content-wrapper">
      <!-- 路由视图 -->
      <router-view></router-view>
    </div>

    
  </div>
</template>

<script setup>
import {onUnmounted} from 'vue'
import axios from "axios";
import { useLoginStore } from "./nweStore/logins";
// 这是pinia数据库
const loginStore = useLoginStore();




 </script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.content-wrapper {
  flex: 1;
}


</style>
