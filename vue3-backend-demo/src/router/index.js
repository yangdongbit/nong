import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
   {
    path: '/admin',
    component: () => import('@/views/AdminHome.vue'),
    children: [
      {
        path: '',
        redirect: '/admin/goods'
      },
      {
        path: 'goods',
        component: () => import('@/components/Goods.vue')
      },
      {
        path: 'users',
        component: () => import('@/components/Users.vue')
      },  
      {
        path: 'reviews',
        component: () => import('@/components/Reviews.vue')
      },
      {
        path: 'storymanager',
        component: () => import('@/components/StoryManager.vue')
      },
      {
        path: 'orders',
        component: () => import('@/components/Orders.vue')
      },
      {
        path: 'autoreplymanager',
        component: () => import('@/components/AutoReplyManager.vue')
      },
      {
        path: 'message',
        component: () => import('@/components/MessageManager.vue')
      }
    ]
   },
   {
    path: '/login',
    component: () => import('@/views/logins.vue')
   }
  ],
})

export default router
