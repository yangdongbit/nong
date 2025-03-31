<template>
  <div class="featured-products">
    <div v-for="product in products" :key="product.id" class="product">
      <img :src="product.image" :alt="product.name">
      <h3>{{ product.name }}</h3>
      <p>{{ product.description }}</p>
      <p class="price">¥{{ product.price }}</p>
    </div>
    <div class="view-more">
      <button @click="viewMore">查看更多产品</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FeaturedProducts',
  data() {
    return {
      products: [
        { id: 1, name: '有机蔬菜套装', description: '新鲜采摘的有机蔬菜', price: 59.9, image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
        { id: 2, name: '当季水果礼盒', description: '精选当季水果', price: 99.9, image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
        { id: 3, name: '土鸡蛋', description: '散养土鸡下的新鲜鸡蛋', price: 29.9, image: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
      ]
    }
  },
  methods: {
    viewMore() {
      // 实现查看更多产品的逻辑
      console.log('查看更多产品');
    }
  }
}
</script>

<style scoped>
.featured-products {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.product {
  width: 30%;
  margin-bottom: 20px;
  text-align: center;
}
.product img {
  max-width: 100%;
  height: auto;
}
.price {
  font-weight: bold;
  color: #e44d26;
}
.view-more {
  width: 100%;
  text-align: center;
  margin-top: 20px;
}
.view-more button {
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .product {
    width: 48%;
  }
}

@media (max-width: 480px) {
  .product {
    width: 100%;
  }
}
</style>