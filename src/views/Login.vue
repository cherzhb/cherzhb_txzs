<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { authAPI } from '@/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeTab = ref('email') // phone | email
const phone = ref('')
const email = ref('')
const code = ref('')
const password = ref('')
const step = ref(1) // 1: 输入账号 2: 验证码设置密码
const countdown = ref(0)
const loading = ref(false)

onMounted(() => {
  // 检查是否已登录
  if (userStore.isLoggedIn) {
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  }
})

// 发送验证码
const sendCode = async () => {
  let account = activeTab.value === 'phone' ? phone.value : email.value
  
  if (!account) {
    showToast('请输入手机号或邮箱')
    return
  }
  
  // 验证手机号格式
  if (activeTab.value === 'phone') {
    const phoneReg = /^1[3-9]\d{9}$/
    if (!phoneReg.test(account)) {
      showToast('请输入正确的手机号')
      return
    }
  }
  
  // 验证邮箱格式
  if (activeTab.value === 'email') {
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailReg.test(account)) {
      showToast('请输入正确的邮箱')
      return
    }
  }
  
  loading.value = true
  try {
    const res = await authAPI.sendCode({
      email: activeTab.value === 'email' ? email.value : undefined,
      phone: activeTab.value === 'phone' ? phone.value : undefined
    })
    
    showToast('验证码已发送')
    step.value = 2
    
    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (err) {
    showToast(err.error || '发送失败')
  } finally {
    loading.value = false
  }
}

// 提交表单（登录/注册）
const submitForm = async () => {
  if (!code.value) {
    showToast('请输入验证码')
    return
  }
  if (!password.value) {
    showToast('请设置密码')
    return
  }
  if (password.value.length < 8) {
    showToast('密码至少8位')
    return
  }
  
  loading.value = true
  try {
    const data = {
      username: activeTab.value === 'phone' ? phone.value : email.value.split('@')[0],
      email: activeTab.value === 'email' ? email.value : undefined,
      phone: activeTab.value === 'phone' ? phone.value : undefined,
      password: password.value,
      code: code.value
    }
    
    const res = await authAPI.register(data)
    
    // 保存登录状态
    localStorage.setItem('token', res.token)
    userStore.login(res.user)
    
    showToast('登录成功')
    setTimeout(() => {
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    }, 1000)
  } catch (err) {
    // 如果注册失败，尝试登录
    try {
      const loginRes = await authAPI.login({
        username: activeTab.value === 'phone' ? phone.value : email.value,
        password: password.value
      })
      
      localStorage.setItem('token', loginRes.token)
      userStore.login(loginRes.user)
      
      showToast('登录成功')
      setTimeout(() => {
        const redirect = route.query.redirect || '/'
        router.push(redirect)
      }, 1000)
    } catch (loginErr) {
      showToast(loginErr.error || '登录失败')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <!-- Logo -->
    <div class="logo">
      <div class="logo-icon">👴</div>
      <h1>退休规划助手</h1>
      <p>科学规划 · 快乐退休</p>
    </div>
    
    <!-- 步骤1：输入账号 -->
    <div class="form-container">
      <h2 class="form-title">{{ step === 1 ? '登录 / 注册' : '验证账号' }}</h2>
      
      <!-- 步骤1 -->
      <div v-if="step === 1">
        <van-tabs v-model:active="activeTab">
          <van-tab title="邮箱" name="email">
            <van-field
              v-model="email"
              type="email"
              label="邮箱"
              placeholder="请输入邮箱地址"
            />
          </van-tab>
          <van-tab title="手机号" name="phone">
            <van-field
              v-model="phone"
              type="tel"
              label="手机号"
              placeholder="请输入11位手机号"
              maxlength="11"
            />
          </van-tab>
        </van-tabs>
        
        <div class="next-step">
          <van-button type="primary" block :loading="loading" @click="sendCode">
            获取验证码
          </van-button>
        </div>
      </div>
      
      <!-- 步骤2 -->
      <div v-if="step === 2">
        <van-field
          v-model="code"
          type="number"
          label="验证码"
          placeholder="请输入6位验证码"
          maxlength="6"
          center
        >
          <template #button>
            <van-button
              size="small"
              type="primary"
              :disabled="countdown > 0"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}秒` : '重新发送' }}
            </van-button>
          </template>
        </van-field>
        
        <van-field
          v-model="password"
          type="password"
          label="设置密码"
          placeholder="8-20位字符"
        />
        
        <div class="tips">
          <van-icon name="info-o" />
          <span>验证码将发送到您的{{ activeTab === 'phone' ? '手机' : '邮箱' }}</span>
        </div>
        
        <div class="next-step">
          <van-button type="primary" block :loading="loading" @click="submitForm">
            登录 / 注册
          </van-button>
        </div>
        
        <div class="back-btn" @click="step = 1">
          返回上一步
        </div>
      </div>
    </div>
    
    <!-- 管理员入口 -->
    <div class="admin-link">
      <a href="/admin.html">管理员登录</a>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.logo {
  text-align: center;
  color: white;
  padding: 40px 0;
}

.logo-icon {
  font-size: 60px;
  margin-bottom: 16px;
}

.logo h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.logo p {
  font-size: 14px;
  opacity: 0.9;
}

.form-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-top: 20px;
}

.form-title {
  font-size: 20px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 20px;
  text-align: center;
}

.next-step {
  margin-top: 24px;
}

.tips {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #ff976a;
  padding: 12px;
  background: #fff7ed;
  border-radius: 8px;
  margin-top: 16px;
}

.back-btn {
  text-align: center;
  color: #1989fa;
  margin-top: 16px;
  cursor: pointer;
}

.admin-link {
  text-align: center;
  margin-top: 20px;
}

.admin-link a {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  text-decoration: none;
}

.admin-link a:hover {
  color: white;
}
</style>
