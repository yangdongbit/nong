import { defineStore } from 'pinia'
import { ref } from "vue";
import axios from 'axios';

export const useEvaluationsStore = defineStore('evaluations', () => {
    // 声明数组
     
    // 声明 用来接受评论的变量
    const evaluations = ref([]);

    // 声明操作数据的方法
    
    const fetchEvaluations = async () => {
        try {
            const response = await axios.get('/api/yang/dong/evaluations');
            
            
            evaluations.value = response.data;
        } catch (error) {
            console.error('Error fetching evaluations:', error);
        }
    };

    // 请求商品数据
    const farms = ref([])   // 商品
    const getfarms = async () => {
        try {
            const response = await axios.get('/api/yang/farms');
            
            
            farms.value = response.data;
        } catch (error) {
            console.error('Error fetching evaluations:', error);
        }
    };

    // 获取商品购物车
    const shopping_cat = ref()

    return {
        evaluations,
        fetchEvaluations,
        farms,
        getfarms
    }
}) 