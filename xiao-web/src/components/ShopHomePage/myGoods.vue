<template>
  <div class="goods wrapper">
    <!-- 标题 -->
    <div class="title">
      <div class="left">
        <h3>
          <slot name="MyH3"></slot>
        </h3>
        <p>
          <slot name="MyP"></slot>
        </p>
      </div>
      <div class="right">
        <a href="#" class="more" @click.prevent="handleViewAll">
          查看全部<span class="iconfont icon-xiangyoujiantou"></span>
        </a>
      </div>
    </div>
    <!-- 内容 -->
    <div class="bd">
      <ul>
        <li v-for="item in randomizedItems" :key="item.id" @click="handleItemClick(item.id)">
          <a href="#" @click.prevent>
            <div class="pic">
              <img :src="`${URL}${item.imgSrc}`" :alt="item.title" />
              <div class="sales-badge">
                销量: {{ item.sales_volume }}
              </div>
            </div>
            <div class="txt">
              <div class="title-desc">{{ item.title }}</div>
              <h4>{{ item.product_name }}</h4>
              <div class="price-row">
                <p class="price">
                  <span class="currency">￥</span>
                  <span class="amount">{{ item.price }}</span>
                </p>
              </div>
            </div>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { defineProps } from 'vue';
import { useRouter } from 'vue-router'; // 导入 useRouter

// 获取 router 实例
const router = useRouter();

const  URL = 'http://127.0.0.1:3000'

// 声明从父组件接收的 props
const props = defineProps({
  dataSon: {
    type: Array,
    default: () => []
  },
  category: {
    type: String,
    default: '全部'
  }
});

// 计算属性：随机排序并限制数量为4个
const randomizedItems = computed(() => {
  const shuffled = [...props.dataSon].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
});

// 点击事件处理函数
const handleItemClick = (id) => {
  // console.log('Clicked item id:', id);
  // 导航到商品详情页
  router.push(`/GoodsDetail/${id}`);
};




// 处理"查看全部"点击事件
const handleViewAll = () => {
  router.push({
    name: 'LookAll',
    query: { 
      category: props.category,  // 使用 props.category 而不是 props.dataSon[0].type
      count: props.dataSon.length
    }
  });
};
</script>

<style scoped>
.goods .bd p {
  font-size: 18px;
  color: #aa2113;
  transition: all 0.3s ease;
  margin-top: auto;
}
.goods .bd p span {
  margin-left: 5px;
  font-size: 22px;
  font-weight: bold;
}
.wrapper {
  width: 1240px;
  margin: 0 auto;
}
.title {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  margin-bottom: 30px;
  height: 42px;
}
.title .left {
  display: flex;
}

.title .left h3 {
  margin-right: 35px;
  font-size: 30px;
}

.title .left p {
  align-self: flex-end;
  color: #a1a1a1;
}

.title .right .more {
  line-height: 42px;
  color: #a1a1a1;
}

.title .right .more span {
  margin-left: 10px;
}

/* 类容 */
.bd ul {
  display: flex;
  justify-content: space-between;
}
.bd li {
  width: 304px;
  height: 440px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
}

.bd .pic {
  position: relative;
  width: 304px;
  height: 304px;
  overflow: hidden;
}

.sales-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.bd .txt {
  padding: 12px 16px;
  height: 136px;
  display: flex;
  flex-direction: column;
}

.title-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  line-clamp: 1;
  box-orient: vertical;
}

.bd .txt h4 {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 12px 0;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  box-orient: vertical;
}

.price-row {
  margin-top: auto;
}

.price {
  display: flex;
  align-items: baseline;
  color: #ff4d4f;
}

.currency {
  font-size: 14px;
  margin-right: 2px;
}

.amount {
  font-size: 24px;
  font-weight: bold;
}

.bd li:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.bd .pic img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.bd li:hover .pic img {
  transform: scale(1.05);
}

.goods .bd p {
  font-size: 18px;
  color: #aa2113;
  transition: all 0.3s ease;
  margin-top: auto;
}

.bd li:hover .goods .bd p {
  transform: scale(1.1);
}

.goods .bd p span {
  margin-left: 5px;
  font-size: 22px;
  font-weight: bold;
}

.title .right .more {
  line-height: 42px;
  color: #a1a1a1;
  transition: all 0.3s ease;
}

.title .right .more:hover {
  color: #1fa83d;
  transform: translateX(5px);
}

/* 其他样式保持不变 */
</style>
