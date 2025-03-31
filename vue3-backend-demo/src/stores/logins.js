import { defineStore } from 'pinia';
import { ref } from "vue";
import axios from 'axios';

export const useLoginStore = defineStore('Login', () => {
    const Loginuser = ref({});

    
    // 重新获取
    const getLoginuser = () => {
        const loginData = JSON.parse(localStorage.getItem('userInfo'));
        if (loginData && loginData.Loginuser && loginData.Loginuser.name && loginData.Loginuser.password) {
            axios({
                url: "/api/logins",
                method: "POST",
                data: {
                    name: loginData.Loginuser.name,
                    password: loginData.Loginuser.password,
                },
            }).then((result) => {
                Loginuser.value = result.data;
            });
        }
    };

    return {
        Loginuser,
        getLoginuser
    };
}, {
    persist: {
        enabled: true,
        strategies: [
            {
                key: 'Login-store',
                storage: localStorage,
            },
        ],
    },
});