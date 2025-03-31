import { defineStore } from 'pinia';
import { ref } from "vue";
import axios from 'axios';

export const useUserpinyindbStore = defineStore('Userpinyindb', () => {
    const Userpinyindb = ref();

    // 重新获取
    const getUserpinyindb = async (id) => {
        try {
            const result = await axios({
                url: '/api/yang/UserHub',
                method: 'POST',
                data: {
                    user_id: id
                }
            });
            Userpinyindb.value = result.data[0];
            return result.data[0]; // 返回数据
        } catch (error) {
            console.error('获取用户数据失败:', error);
            return null;
        }
    };

    return {
        Userpinyindb,
        getUserpinyindb
    };
});