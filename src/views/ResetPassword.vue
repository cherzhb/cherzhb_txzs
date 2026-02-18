<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { authAPI } from '@/api'

const router = useRouter()

// 步骤
const step = ref(1)

// 方式：phone 或 email
const resetType = ref('email')

// 表单数据
const phone = ref('')
const email = ref('')
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const countdown = ref(0)
const loading = ref(false)

// 发送验证码
const sendCode = async () => {
  if (resetType.value === 'phone' && !phone.value) {
    showToast('请输入手机号')
    return
  }
  if (resetType.value === 'email' && !email.value) {
    showToast('请输入邮箱')
    return
  }
  
  try {
    await authAPI.sendCode({
      phone: resetType.value === 'phone' ? phone.value : undefined,
      email: resetType.value === 'email' ? email.value : undefined,
      type: 'reset'
    })
    showSuccessToast('验证码已发送')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (err) {
    showToast(err.error || '发送失败')
  }
}

// 下一步
const nextStep = () => {
  if (step.value === 1) {
    if (resetType.value === 'phone' && !phone.value) {
      showToast('请输入手机号')
      return
    }
    if (resetType.value === 'email' && !email.value) {
      showToast('请输入邮箱')
      return
    }
    step.value = 2
  } else if (step.value === 2) {
    if (!code.value) {
      showToast('请输入验证码')
      return
    }
    step.value = 3
  }
}

// 重置密码
const handleReset = async () => {
  if (!newPassword.value) {
    showToast('请输入新密码')
    return
  }
  if (newPassword.value.length < 6) {
    showToast('密码至少6位')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    showToast('两次密码不一致')
    return
  }
  
  loading.value = true
  try {
    await authAPI.resetPassword({
      phone: resetType.value === 'phone' ? phone.value : undefined,
      email: resetType.value === 'email' ? email.value : undefined,
      code: code.value,
      password: newPassword.value
    })
    showSuccessToast('密码重置成功')
    router.push('/login')
  } catch (err) {
    showToast(err.error || '重置失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="reset-page">
    <!-- 头部 -->
    <div class="header">
      <van-nav-bar 
        title="找回密码" 
        left-arrow 
        @click-left="router.back()" 
      />
    </div>
    
    <!-- 步骤指示 -->
    <div class="steps">
      <div :class="['step', { active: step >= 1, done: step > 1 }]">
        <div class="step-num">1</div>
        <div class="step-text">验证身份</div>
      </div>
      <div class="step-line" :class="{ active: step > 1 }"></div>
      <div :class="['step', { active: step >= 2, done: step > 2 }]">
        <div class="step-num">2</div>
        <div class="step-text">输入验证码</div>
      </div>
      <div class="step-line" :class="{ active: step > 2 }"></div>
      <div :class="['step', { active: step >= 3 }]">
        <div class="step-num">3</div>
        <div class="step-text">设置密码</div>
      </div>
    </div>
    
    <!-- 步骤1: 选择方式 -->
    <div v-if="step === 1" class="form-card">
      <h3 class="form-title">请选择验证方式</h3>
      
      <div class="type-switch">
        <div 
          :class="['type-btn', { active: resetType === 'phone' }]" 
          @click="resetType = 'phone'"
        >
          <span class="icon">📱</span>
          <span>手机号</span>
        </div>
        <div 
          :class="['type-btn', { active: resetType === 'email' }]" 
          @click="resetType = 'email'"
        >
          <span class="icon">📧</span>
          <span>邮箱</span>
        </div>
      </div>
      
      <van-cell-group inset>
        <van-field 
          v-if="resetType === 'phone'"
          v-model="phone" 
          type="tel" 
          label="" 
          placeholder="请输入绑定的手机号"
          left-icon="phone-o"
          clearable
        />
        <van-field 
          v-if="resetType === 'email'"
          v-model="email" 
          type="email" 
          label="" 
          placeholder="请输入绑定的邮箱"
          left-icon="envelop-o"
          clearable
        />
      </van-cell-group>
      
      <van-button type="primary" block size="large" @click="nextStep">
        下一步
      </van-button>
    </div>
    
    <!-- 步骤2: 输入验证码 -->
    <div v-else-if="step === 2" class="form-card">
      <h3 class="form-title">请输入验证码</h3>
      <p class="form-desc">
        验证码已发送至 {{ resetType === 'phone' ? phone : email }}
      </p>
      
      <van-cell-group inset>
        <van-field 
          v-model="code" 
          label="" 
          placeholder="请输入6位验证码"
          left-icon="shield-o"
          clearable
          maxlength="6"
        >
          <template #button>
            <van-button 
              size="small" 
              type="primary" 
              :disabled="countdown > 0"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}秒` : '重新获取' }}
            </van-button>
          </template>
        </van-field>
      </van-cell-group>
      
      <div class="btn-group">
        <van-button plain block size="large" @click="step = 1">
          上一步
        </van-button>
        <van-button type="primary" block size="large" @click="nextStep">
          下一步
        </van-button>
      </div>
    </div>
    
    <!-- 步骤3: 设置新密码 -->
    <div v-else-if="step === 3" class="form-card">
      <h3 class="form-title">设置新密码</h3>
      
      <van-cell-group inset>
        <van-field 
          v-model="newPassword" 
          type="password" 
          label="" 
          placeholder="请输入新密码（至少6位）"
          left-icon="lock"
          clearable
        />
        <van-field 
          v-model="confirmPassword" 
          type="password" 
          label="" 
          placeholder="请再次输入新密码"
          left-icon="lock"
          clearable
        />
      </van-cell-group>
      
      <div class="btn-group">
        <van-button plain block size="large" @click="step = 2">
          上一步
        </van-button>
        <van-button 
          type="primary" 
          block 
          size="large" 
          :loading="loading"
          @click="handleReset"
        >
          完成重置
        </van-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reset-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 80px;
}

.header :deep(.van-nav-bar) {
  background: transparent;
}

.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  background: white;
  margin-bottom: 16px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ddd;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin-bottom: 8px;
}

.step.active .step-num {
  background: #1989fa;
}

.step.done .step-num {
  background: #07c160;
}

.step-text {
  font-size: 12px;
  color: #969799;
}

.step.active .step-text {
  color: #323233;
}

.step-line {
  width: 40px;
  height: 2px;
  background: #ddd;
  margin: 0 8px 20px;
}

.step-line.active {
  background: #1989fa;
}

.form-card {
  background: white;
  padding: 20px;
  margin: 16px;
  border-radius: 12px;
}

.form-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
}

.form-desc {
  font-size: 14px;
  color: #969799;
  text-align: center;
  margin-bottom: 20px;
}

.type-switch {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.type-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  background: #f7f8fa;
  cursor: pointer;
  transition: all 0.3s;
}

.type-btn.active {
  background: #e8f4fd;
  border: 2px solid #1989fa;
}

.type-btn .icon {
  font-size: 32px;
  margin-bottom: 8px;
}

:deep(.van-cell-group--inset) {
  margin: 0 0 20px;
}

.btn-group {
  display: flex;
  gap: 12px;
}

.btn-group .van-button {
  flex: 1;
}
</style>
