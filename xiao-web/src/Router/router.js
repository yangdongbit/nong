import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    { path: '/', redirect: '/ShopHomePage' },
    { path: '/ShopHomePage', name: 'ShopHomePage', component: () => import('../components/ShopHomePage.vue') },
    { 
        path: '/shoppingCart', 
        name: 'shoppingCart', 
        component: () => import('../components/shoppingCart.vue'), 
        meta: { requiresAuth: true } 
    },
    { path: '/FindPassword', name: 'FindPassword', component: () => import('../components/FindPassword.vue') },
    { 
        path: '/GoodsDetail/:id', 
        name: 'GoodsDetail', 
        component: () => import('../components/ProductDetail/GoodsDetail.vue'),
        children: [
            { 
                path: 'BuyNow', 
                name: 'GoodsDetailBuyNow', 
                component: () => import('../components/ProductDetail/BuyNow.vue'),
                meta: { requiresAuth: true }
            }
        ] 
    },
    { path: '/LookAll', name: 'LookAll', component: () => import('../components/LookAll.vue') },
    { path: '/SearchForm', name: 'SearchForm', component: () => import('../components/SearchForm.vue') },
    { 
        path: '/BuyNow', 
        name: 'BuyNow', 
        component: () => import('../components/ProductDetail/BuyNow.vue'),
        meta: { requiresAuth: true }
    },
    { path: '/logins', name: 'logins', component: () => import('../components/logins.vue') },
    { path: '/Pay', name: 'Pay', component: () => import('../components/Pay.vue') },
    { path: '/MySpace', name: 'MySpace', component: () => import('../components/MySpace/MySpace.vue'),meta: { requiresAuth: true }  },  // 加了路由守卫
    { path: '/ShopInfo', name: 'ShopInfo', component: () => import('../components/ShopInfo/ShopInfo.vue') },
    { path: '/StoreManage1',  name: 'StoreManage1',  component: () => import('../components/ShopInfo/StoreManage1.vue')  },
    { path: '/StoreManage2',  name: 'StoreManage2',  component: () => import('../components/ShopInfo/StoreManage2.vue')  },
    { path: '/FarmerStories_Detail',  name: 'FarmerStories_Detail',  component: () => import('../components/ShopHomePage/FarmerStories_Detail.vue')  },
    { path: '/farmer-stories/:id',  name: 'FarmerStoriesDetail',  component: () => import('../components/ShopHomePage/FarmerStories_Detail.vue')  },
    { path: '/ChatWindow',  name: 'ChatWindow',  component: () => import('../components/ChatList/ChatContainer.vue'),meta: { requiresAuth: true }  },
    { path: '/order/:id',  name: 'Order',  component: () => import('../components/Order/OrderDetail.vue')  },
    { path: '/order',  name: 'OrderList',  component: () => import('../components/Order/OrderList.vue'),meta: { requiresAuth: true }   },
    { path: '/payment/success',  name: 'PaymentSuccess',  component: () => import('../components/Order/PaymentSuccess.vue')  },
   
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
    // 如果路由需要验证
    if (to.meta.requiresAuth) {
        const { useLoginStore } = await import('../nweStore/logins');
        const loginStore = useLoginStore();
        
        // 检查是否已登录
        if (!loginStore.Loginuser || Object.keys(loginStore.Loginuser).length === 0) {
            // 显示提示消息
            alert('请先登录后再操作');
            // 将用户重定向到登录页面，并保存原目标路由
            next({
                path: '/logins',
                query: { redirect: to.fullPath }
            });
        } else {
            next();
        }
    } else {
        next();
    }
});

// 添加全局路由守卫
router.beforeEach((to, from, next) => {
  // 在路由切换时滚动到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  next();
});

export default router;
