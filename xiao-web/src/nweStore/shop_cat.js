import { defineStore } from 'pinia'; // 从 pinia 导入 defineStore 函数来创建 store
import { ref } from "vue"; // 从 Vue 导入 ref 函数，用于创建响应式引用
import axios from 'axios'; // 导入 axios 用于发送 HTTP 请求

// 使用 defineStore 创建一个名为 'Cat' 的 store
export const useCatStore = defineStore('Cat', () => {
    // 创建一个响应式引用 shopCat，用于存储购物车数据，初始值为空对象
    const shopCat = ref({});

    // 定义一个方法 getshopCat，用于获取购物车数据
    const getshopCat = () => {
        // 从 localStorage 中获取存储的登录信息
        const loginData = JSON.parse(localStorage.getItem('Login'));

        // 检查登录信息是否存在，并且包含用户名和密码
        if (loginData && loginData.Loginuser && loginData.Loginuser.name && loginData.Loginuser.password) {

            axios({
                url: '/api/yang/shopping_cat', // 请求的 URL
                method: 'POST', // 请求方法
                // 请求的数据体，包含用户 ID
                data: {
                    user_id: loginData.Loginuser.id // 用户 ID
                }
            }).then(result => {
                // 如果请求成功，将响应的数据赋值给 shopCat
                shopCat.value = result.data;
            });
        }
    };

    // 在 store 定义中直接调用 getshopCat 方法，以便在 store 初始化时自动执行
    getshopCat();

    // 返回 store 的状态和方法，供外部使用
    return {
        shopCat, // 返回 shopCat 响应式引用
        getshopCat // 返回 getshopCat 方法
    };
});