import { defineStore } from 'pinia';
import { ref } from "vue";
import axios from 'axios';

export const useProductfetcherStore = defineStore('Productfetcher', () => {
    const farms = ref();
    
    // 获取商品数据
    const getfarms = async () => {
        try {
            const result = await axios({
                url: '/api/yang/farms',
                method: 'GET',
            });
            farms.value = result.data;
            return result.data;
        } catch (error) {
            console.error('获取商品数据失败:', error);
            return null;
        }
    };

    return {
        farms,
        getfarms
    };
});