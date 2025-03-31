import { createApp } from 'vue';
import { createPinia } from 'pinia';
import persist from 'pinia-plugin-persistedstate'
import App from './App.vue';
import router from '../src/Router/router.js';
import './css/base.css'
import './css/icofont5/iconfont.css'
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const app = createApp(App);
const pinia = createPinia() //创建pinia实例

app.use(router);
app.use(pinia.use(persist));
app.use(ElementPlus);

// 禁用 WebGL 警告
console.warn = () => {};

app.mount('#app');