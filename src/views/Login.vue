<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { authAPI } from '@/api'

const router = useRouter()
const userStore = useUserStore()

// 模式：login 或 register
const mode = ref('login')

// 登录方式：phone 或 email
const loginType = ref('email')

// 表单数据
const username = ref('')
const phone = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const code = ref('')
const codeSent = ref(false)
const countdown = ref(0)
const loading = ref(false)
const agree = ref(false)

// 发送验证码
const sendCode = async () => {
  if (loginType.value === 'phone' && !phone.value) {
    showToast('请输入手机号')
    return
  }
  if (loginType.value === 'email' && !email.value) {
    showToast('请输入邮箱')
    return
  }
  
  try {
    await authAPI.sendCode({
      phone: loginType.value === 'phone' ? phone.value : undefined,
      email: loginType.value === 'email' ? email.value : undefined
    })
    showSuccessToast('验证码已发送')
    codeSent.value = true
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
        codeSent.value = false
      }
    }, 1000)
  } catch (err) {
    showToast(err.error || '发送失败')
  }
}

// 登录
const handleLogin = async () => {
  if (!username.value) {
    showToast('请输入用户名/手机号/邮箱')
    return
  }
  if (!password.value) {
    showToast('请输入密码')
    return
  }
  
  loading.value = true
  
  try {
    const res = await authAPI.login({ 
      username: username.value.trim(), 
      password: password.value 
    })
    localStorage.setItem('token', res.token)
    userStore.setUser(res.user)
    showSuccessToast('登录成功')
    router.push('/')
  } catch (err) {
    console.error('登录错误:', err)
    showToast(err.error || '登录失败')
  } finally {
    loading.value = false
  }
}

// 跳转找回密码
const goResetPassword = () => {
  router.push('/reset-password')
}

// 注册
const handleRegister = async () => {
  if (!username.value) {
    showToast('请输入用户名')
    return
  }
  if (loginType.value === 'phone' && !phone.value) {
    showToast('请输入手机号')
    return
  }
  if (loginType.value === 'email' && !email.value) {
    showToast('请输入邮箱')
    return
  }
  if (!password.value) {
    showToast('请输入密码')
    return
  }
  if (password.value !== confirmPassword.value) {
    showToast('两次密码不一致')
    return
  }
  if (!agree.value) {
    showToast('请阅读并同意用户协议')
    return
  }
  
  loading.value = true
  try {
    const res = await authAPI.register({
      username: username.value,
      phone: loginType.value === 'phone' ? phone.value : undefined,
      email: loginType.value === 'email' ? email.value : undefined,
      password: password.value,
      code: code.value || undefined
    })
    localStorage.setItem('token', res.token)
    userStore.setUser(res.user)
    showSuccessToast('注册成功')
    router.push('/profile')
  } catch (err) {
    showToast(err.error || '注册失败')
  } finally {
    loading.value = false
  }
}

// 切换模式
const switchMode = (newMode) => {
  mode.value = newMode
  username.value = ''
  phone.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  code.value = ''
}
</script>

<template>
  <div class="login-page">
    <!-- 头部 -->
    <div class="header">
      <div class="logo">👴</div>
      <h1 class="title">退休规划助手</h1>
      <p class="subtitle">科学规划 · 快乐退休</p>
    </div>
    
    <!-- 切换标签 -->
    <div class="tab-switch">
      <div 
        :class="['tab', { active: mode === 'login' }]" 
        @click="switchMode('login')"
      >
        登录
      </div>
      <div 
        :class="['tab', { active: mode === 'register' }]" 
        @click="switchMode('register')"
      >
        注册
      </div>
    </div>
    
    <!-- 登录表单 -->
    <div v-if="mode === 'login'" class="form-card">
      <van-cell-group inset>
        <van-field 
          v-model="username" 
          label="" 
          placeholder="请输入用户名/手机号/邮箱"
          left-icon="user-o"
          clearable
        />
        <van-field 
          v-model="password" 
          type="password" 
          label="" 
          placeholder="请输入密码"
          left-icon="lock"
          clearable
        />
      </van-cell-group>
      
      <van-button 
        type="primary" 
        block 
        size="large" 
        :loading="loading"
        @click="handleLogin"
      >
        登录
      </van-button>
      
      <div class="footer-links">
        <span class="link" @click="goResetPassword">忘记密码？</span>
        <span @click="switchMode('register')">没有账号？立即注册</span>
      </div>
    </div>
    
    <!-- 注册表单 -->
    <div v-else class="form-card">
      <!-- 登录方式切换 -->
      <div class="login-type-switch">
        <span 
          :class="['type-btn', { active: loginType === 'phone' }]" 
          @click="loginType = 'phone'"
        >
          📱 手机号
        </span>
        <span 
          :class="['type-btn', { active: loginType === 'email' }]" 
          @click="loginType = 'email'"
        >
          📧 邮箱
        </span>
      </div>
      
      <van-cell-group inset>
        <van-field 
          v-model="username" 
          label="" 
          placeholder="请输入用户名"
          left-icon="user-o"
          clearable
        />
        
        <van-field 
          v-if="loginType === 'phone'"
          v-model="phone" 
          type="tel" 
          label="" 
          placeholder="请输入手机号"
          left-icon="phone-o"
          clearable
        />
        
        <van-field 
          v-if="loginType === 'email'"
          v-model="email" 
          type="email" 
          label="" 
          placeholder="请输入邮箱"
          left-icon="envelop-o"
          clearable
        />
        
        <van-field 
          v-model="password" 
          type="password" 
          label="" 
          placeholder="请输入密码"
          left-icon="lock"
          clearable
        />
        
        <van-field 
          v-model="confirmPassword" 
          type="password" 
          label="" 
          placeholder="请再次输入密码"
          left-icon="lock"
          clearable
        />
        
        <van-field 
          v-model="code" 
          label="" 
          placeholder="请输入验证码"
          left-icon="shield-o"
          clearable
        >
          <template #button>
            <van-button 
              size="small" 
              type="primary" 
              :disabled="countdown > 0"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}秒后重发` : '获取验证码' }}
            </van-button>
          </template>
        </van-field>
      </van-cell-group>
      
      <!-- 用户协议 -->
      <div class="agreement">
        <van-checkbox v-model="agree" shape="square" icon-size="16px">
          我已阅读并同意
          <span class="link">《用户协议》</span>
          和
          <span class="link">《隐私政策》</span>
        </van-checkbox>
      </div>
      
      <van-button 
        type="primary" 
        block 
        size="large" 
        :loading="loading"
        @click="handleRegister"
      >
        注册
      </van-button>
      
      <div class="footer-links">
        <span @click="switchMode('login')">已有账号？立即登录</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 40%, #f7f8fa 40%);
  padding: 16px;
  padding-bottom: 80px;
}

.header {
  text-align: center;
  color: white;
  padding: 30px 0 20px;
}

.logo {
  font-size: 60px;
  margin-bottom: 12px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
}

.tab-switch {
  display: flex;
  background: white;
  border-radius: 25px;
  padding: 4px;
  margin-bottom: 20px;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  border-radius: 22px;
  font-size: 16px;
  color: #969799;
  cursor: pointer;
  transition: all 0.3s;
}

.tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
}

.form-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
}

.login-type-switch {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.type-btn {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  color: #969799;
  cursor: pointer;
  background: #f7f8fa;
  transition: all 0.3s;
}

.type-btn.active {
  background: #e8f4fd;
  color: #1989fa;
}

:deep(.van-cell-group--inset) {
  margin: 0 0 20px;
}

:deep(.van-field) {
  padding: 14px 16px;
}

:deep(.van-field__control) {
  font-size: 16px;
}

.agreement {
  margin-bottom: 16px;
}

.agreement :deep(.van-checkbox__label) {
  font-size: 12px;
  color: #969799;
}

.link {
  color: #1989fa;
}

.footer-links {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #1989fa;
  cursor: pointer;
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style>
