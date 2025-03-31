<template>
  <div class="shop-home">
    <myTop2></myTop2>
    <myHeader />
    <LunBoTuSlider />
    <main class="main-content">
      <!-- 这是商品展示，用了插槽 -->
      <myGoods :dataSon="getMyson" category="水果">
        <template #MyH3> 水果 </template>
        <template #MyP> 新鲜水果 健康生活 </template>
      </myGoods>
      <myGoods :dataSon="getMyson1" category="蔬菜">
        <template #MyH3> 蔬菜 </template>
        <template #MyP> 绿色蔬菜 健康首选 </template>
      </myGoods>
      <myGoods :dataSon="getMyson2" category="农副产品">
        <template #MyH3> 农副加工 </template>
        <template #MyP> 农副加工 品质之选 </template>
      </myGoods>
      <section class="farmer-stories">
        <h2>农户故事</h2>
        <FarmerStories />
      </section>
      
    </main>
    <buttonLun />
    <myFooter></myFooter>
    <RightNav></RightNav>
    <CustomerService></CustomerService>
  </div>
</template>

<script setup>
import myTop2 from "./ShopHomePage/myTop2.vue";
import myHeader from "./ShopHomePage/myHeader.vue";
import LunBoTuSlider from "./ShopHomePage/LunBoTuSlider.vue";
import myGoods from "./ShopHomePage/myGoods.vue";
import FarmerStories from "./ShopHomePage/FarmerStories.vue";
import buttonLun from "./ShopHomePage/buttonLun.vue";
import myFooter from "./myFooter.vue";
import { ref, onMounted, onUnmounted } from 'vue'
import axios from "axios";
import RightNav from "./RightNav.vue";
import CustomerService from "./CustomerService.vue";

// 给子组件传数据
const getMyson = ref([[]]);
const getMyson1 = ref([]);
const getMyson2 = ref([]);

// 请求数据

axios({
  url: "/api/yang/farms",
  method: "GET",
}).then((result) => {
  getMyson.value = Object.values(result.data).filter(
    (item) => item.type === "水果"
  );
  getMyson1.value = Object.values(result.data).filter(
    (item) => item.type === "蔬菜"
  );
  getMyson2.value = Object.values(result.data).filter(
    (item) => item.type === "农副产品"
  );
});


</script>

<style scoped>
.shop-home {
  font-family: "Arial", sans-serif;
  color: #333;
  line-height: 1.6;
}

.main-content {
  max-width: 1240px;
  margin: 0 auto;
  padding: 20px;
}

.featured-products,
.farmer-stories,
.news-updates {
  margin-top: 40px;
  margin-bottom: 40px;
}

.featured-products h2,
.farmer-stories h2,
.news-updates h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #5eb69c;
}

.footer {
  background-color: #f8f8f8;
  text-align: center;
  padding: 20px;
  margin-top: 40px;
  border-top: 1px solid #e7e7e7;
}


</style>
