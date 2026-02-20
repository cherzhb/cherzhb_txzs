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
    <div class="page-container">
      <!-- Header -->
      <div class="header">
        <van-icon name="arrow-left" @click="router.back()" />
        <h1 class="page-title">找回密码</h1>
        <div style="width: 20px;"></div>
      </div>

      <!-- 步骤指示 -->
      <div class="steps glass-card">
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
      <div v-if="step === 1" class="form-card glass-card">
        <h3 class="form-title">请选择验证方式</h3>

        <div class="type-switch">
          <div :class="['type-btn', { active: resetType === 'phone' }]" @click="resetType = 'phone'">
            <span class="icon">📱</span>
            <span>手机号</span>
          </div>
          <div :class="['type-btn', { active: resetType === 'email' }]" @click="resetType = 'email'">
            <span class="icon">📧</span>
            <span>邮箱</span>
          </div>
        </div>

        <van-field
          v-if="resetType === 'phone'"
          v-model="phone"
          type="tel"
          placeholder="请输入绑定的手机号"
          left-icon="phone-o"
          clearable
        />
        <van-field
          v-if="resetType === 'email'"
          v-model="email"
          type="email"
          placeholder="请输入绑定的邮箱"
          left-icon="envelop-o"
          clearable
        />
      </div>

      <!-- 步骤2: 输入验证码 -->
      <div v-else-if="step === 2" class="form-card glass-card">
        <h3 class="form-title">请输入验证码</h3>
        <p class="form-desc">
          验证码已发送至 {{ resetType === 'phone' ? phone : email }}
        </p>

        <van-field
          v-model="code"
          placeholder="请输入6位验证码"
          left-icon="shield-o"
          clearable
          maxlength="6"
        >
          <template #button>
            <button
              class="code-btn"
              :disabled="countdown > 0"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}秒` : '重新获取' }}
            </button>
          </template>
        </van-field>
      </div>

      <!-- 步骤3: 设置新密码 -->
      <div v-else-if="step === 3" class="form-card glass-card">
        <h3 class="form-title">设置新密码</h3>

        <van-field
          v-model="newPassword"
          type="password"
          placeholder="请输入新密码（至少6位）"
          left-icon="lock"
          clearable
        />
        <van-field
          v-model="confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          left-icon="lock"
          clearable
        />
      </div>

      <!-- 按钮组 -->
      <div class="btn-group">
        <button v-if="step > 1" class="btn-ghost" @click="step--">
          上一步
        </button>
        <button v-if="step === 1 || step === 2" class="btn-primary" @click="nextStep">
          下一步
        </button>
        <button v-if="step === 3" class="btn-primary" :loading="loading" @click="handleReset">
          完成重置
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reset-page {
  min-height: 100vh;
  position: relative;
  z-index: 1;
  padding-bottom: 100px;
}

.page-container {
  padding: 56px 20px 0;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header .van-icon {
  font-size: 20px;
  color: var(--fg);
  cursor: pointer;
  padding: 8px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--fg);
}

/* Steps */
.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  margin-bottom: 24px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-num {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(240, 246, 252, 0.1);
  color: var(--fg-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight:600;
  margin-bottom: 8px;
  border: 2px solid var(--border);
  transition: all 0.3s;
}

.step.active .step-num {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.step.done .step-num {
  background: var(--success);
  color: white;
  border-color: var(--success);
}

.step-text {
  font-size: 11px;
  color: var(--fg-muted);
}

.step.active .step-text {
  color: var(--fg);
  font-weight: 500;
}

.step-line {
  width: 48px;
  height: 2px;
  background: var(--border);
  margin: 0 8px 20px;
  transition: all 0.3s;
}

.step-line.active {
  background: var(--accent-primary);
}

/* Form Card */
.form-card {
  padding: 24px;
  margin-bottom: 24px;
}

.form-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--fg);
  margin-bottom: 8px;
  text-align: center;
}

.form-desc {
  font-size: 14px;
  color: var(--fg-muted);
  text-align: center;
  margin-bottom: 20px;
}

/* Type Switch */
.type-switch {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.type-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border-radius: 16px;
  background: rgba(240, 246, 252, 0.05);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.3s;
}

.type-btn.active {
  background: rgba(88, 166, 255, 0.15);
  border-color: var(--accent-primary);
}

.type-btn .icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.type-btn span:last-child {
  font-size: 13px;
  color: var(--fg-muted);
}

.type-btn.active span:last-child {
  color: var(--accent-primary);
}

/* Van Field */
:deep(.van-cell) {
  padding: 14px 0;
  background: transparent;
  margin-bottom: 8px;
}

:deep(.van-field__control) {
  font-size: 15px;
  color: var(--fg);
}

:deep(.van-field__control::placeholder) {
  color: var(--fg-muted);
}

/* Code Button */
.code-btn {
  padding: 6px 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--accent-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.code-btn:hover:not(:disabled) {
  background: rgba(88, 166, 255, 0.1);
}

.code-btn:disabled {
  color: var(--fg-muted);
  border-color: rgba(240, 246, 252, 0.05);
}

/* Button Group */
.btn-group {
  display: flex;
  gap: 12px;
}

.btn-group button {
  flex: 1;
}
</style>
