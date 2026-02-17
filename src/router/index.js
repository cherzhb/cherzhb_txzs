import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '退休规划助手' }
  },
  {
    path: '/countdown',
    name: 'Countdown',
    component: () => import('@/views/Countdown.vue'),
    meta: { title: '退休倒计时', requiresAuth: true }
  },
  {
    path: '/calculator',
    name: 'Calculator',
    component: () => import('@/views/Calculator.vue'),
    meta: { title: '养老金计算器', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { title: '个人档案', requiresAuth: true }
  },
  {
    path: '/info',
    name: 'Info',
    component: () => import('@/views/Info.vue'),
    meta: { title: '退休资讯' }
  },
  {
    path: '/info/:id',
    name: 'InfoDetail',
    component: () => import('@/views/InfoDetail.vue'),
    meta: { title: '文章详情' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录/注册' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = JSON.parse(localStorage.getItem('user'))
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !userStore) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    document.title = to.meta.title || '退休规划助手'
    next()
  }
})

export default router
