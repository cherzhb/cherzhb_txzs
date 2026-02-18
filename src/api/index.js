import axios from 'axios'

const API_BASE = '/api'

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

// ==================== 认证相关 ====================
export const authAPI = {
  // 发送验证码
  sendCode: (data) => api.post('/auth/send-code', data),
  
  // 注册
  register: (data) => api.post('/auth/register', data),
  
  // 登录
  login: (data) => api.post('/auth/login', data),
  
  // 获取当前用户
  getMe: () => api.get('/auth/me'),
  
  // 更新档案
  updateProfile: (data) => api.put('/auth/profile', data),
  
  // 注销账号
  deleteAccount: () => api.delete('/auth/account'),
  
  // 重置密码
  resetPassword: (data) => api.post('/auth/reset-password', data)
}

// ==================== 文章相关 ====================
export const articleAPI = {
  // 获取文章列表
  getList: (params) => api.get('/articles', { params }),
  
  // 获取文章详情
  getDetail: (id) => api.get(`/articles/${id}`)
}

// ==================== 收藏相关 ====================
export const favoriteAPI = {
  // 获取收藏列表
  getList: () => api.get('/favorites'),
  
  // 添加收藏
  add: (article_id) => api.post('/favorites', { article_id }),
  
  // 取消收藏
  remove: (article_id) => api.delete(`/favorites/${article_id}`)
}

export default api
