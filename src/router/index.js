import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页', showTabbar: true }
  },
  {
    path: '/calculator',
    name: 'Calculator',
    component: () => import('@/views/Calculator.vue'),
    meta: { title: '计算', showTabbar: true, requiresAuth: true }
  },
  {
    path: '/countdown',
    name: 'Countdown',
    component: () => import('@/views/Countdown.vue'),
    meta: { title: '退休倒计时', showTabbar: false, requiresAuth: true }
  },
  {
    path: '/info',
    name: 'Info',
    component: () => import('@/views/Info.vue'),
    meta: { title: '资讯', showTabbar: true }
  },
  {
    path: '/info/:id',
    name: 'InfoDetail',
    component: () => import('@/views/InfoDetail.vue'),
    meta: { title: '文章详情', showTabbar: false }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { title: '我的', showTabbar: true, requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', showTabbar: false }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPassword.vue'),
    meta: { title: '找回密码', showTabbar: false }
  },
  {
    path: '/agreement',
    name: 'Agreement',
    component: () => import('@/views/Agreement.vue'),
    meta: { title: '用户协议', showTabbar: false }
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('@/views/Privacy.vue'),
    meta: { title: '隐私政策', showTabbar: false }
  },
  {
    path: '/version-manage',
    name: 'VersionManage',
    component: () => import('@/views/VersionManage.vue'),
    meta: { title: '版本管理', showTabbar: false, requiresAuth: true }
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
  const token = localStorage.getItem('token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    document.title = to.meta.title || '退休规划助手'
    next()
  }
})

export default router
