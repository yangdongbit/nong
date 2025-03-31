import { defineStore } from 'pinia'; // 从 pinia 导入 defineStore 函数来创建 store
import { ref } from "vue"; // 从 Vue 导入 ref 函数，用于创建响应式引用
import axios from 'axios'; // 导入 axios 用于发送 HTTP 请求

// 定义一个名为 useUserHub 的 store，用于管理用户中心数据
export const useUserHub =  defineStore('UserHub', () => {
    // 创建一个响应式引用 UserHub，用于存储用户中心数据，初始值为空对象
    const UserHub = ref({});

    // 定义一个方法 getUserHub，用于获取用户中心数据
    const getUserHub = async () => {
        // 从 localStorage 中获取存储的登录信息
        const loginData = JSON.parse(localStorage.getItem('Login'));

        // 检查登录信息是否存在，并且包含用户名和密码
        if (loginData && loginData.Loginuser && loginData.Loginuser.name && loginData.Loginuser.password) {

            // 使用 axios 发送 POST 请求到服务器获取用户中心数据
            await axios({
                url: '/api/yang/UserHub', // 请求的 URL
                method: 'POST', // 请求方法
                // 请求的数据体，包含用户 ID
                data: {
                    user_id: loginData.Loginuser.id // 用户 ID
                }
            }).then(result => {
                // 如果请求成功，将响应的数据赋值给 UserHub
                UserHub.value = result.data;
            }).catch(error => {
                // 如果请求失败，可以在这里处理错误，例如显示错误信息
                console.error('Error fetching user hub data:', error);
            });
            
        }
    };

    // 返回 store 的状态和方法，供外部使用
    return {
        UserHub,
        getUserHub
    };
});