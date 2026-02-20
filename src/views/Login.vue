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

// 表单数据
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const code = ref('')
const countdown = ref(0)
const loading = ref(false)
const agree = ref(false)
const sendingCode = ref(false)

// 密码可见性
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 手机号提示
const showPhoneTip = () => {
    showToast('手机号注册暂未开放，请用邮箱注册')
}

// 发送验证码
const sendCode = async () => {
    if (sendingCode.value) return // 防止重复提交
    if (!email.value) {
        showToast('请输入邮箱')
        return
    }

    sendingCode.value = true

    try {
        await authAPI.sendCode({ email: email.value })
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
    } finally {
        sendingCode.value = false
    }
}

// 登录
const handleLogin = async () => {
    if (!username.value) {
        showToast('请输入用户名/邮箱')
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
    if (!email.value) {
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
            email: email.value,
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
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    code.value = ''
}

// 打开用户协议
const openAgreement = () => {
    router.push('/agreement')
}

// 打开隐私政策
const openPrivacy = () => {
    router.push('/privacy')
}
</script>

<template>
    <div class="login-page">
        <!-- Header -->
        <div class="header">
            <div class="logo-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="url(#logoGradient)" stroke-width="1.5">
                    <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color: #58A6FF" />
                            <stop offset="100%" style="stop-color: #1F6FEB" />
                        </linearGradient>
                    </defs>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <h1 class="title">退休规划助手</h1>
            <p class="subtitle">科学规划 · 快乐退休</p>
        </div>

        <!-- 切换标签 -->
        <div class="tab-switch">
            <div :class="['tab', { active: mode === 'login' }]" @click="switchMode('login')">
                登录
            </div>
            <div :class="['tab', { active: mode === 'register' }]" @click="switchMode('register')">
                注册
            </div>
        </div>

        <!-- 登录表单 -->
        <div v-if="mode === 'login'" class="form-card">
            <van-cell-group :border="false">
                <van-field v-model="username" placeholder="请输入用户名/邮箱" left-icon="user-o" clearable autocomplete="off" />
                <van-field v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="请输入密码" left-icon="lock" clearable autocomplete="new-password">
                    <template #right-icon>
                        <van-icon :name="showPassword ? 'eye-o' : 'closed-eye'" @click="showPassword = !showPassword" style="cursor: pointer;" />
                    </template>
                </van-field>
            </van-cell-group>

            <button class="btn-primary" :disabled="loading" @click="handleLogin">
                {{ loading ? '登录中...' : '登录' }}
            </button>

            <div class="footer-links">
                <span class="link" @click="goResetPassword">忘记密码？</span>
                <span @click="switchMode('register')">没有账号？立即注册</span>
            </div>
        </div>

        <!-- 注册表单 -->
        <div v-else class="form-card">
            <!-- 注册方式提示 -->
            <div class="login-type-switch">
                <span class="type-btn disabled" @click="showPhoneTip">
                    📱 手机号
                </span>
                <span class="type-btn active">
                    📧 邮箱
                </span>
            </div>

            <van-cell-group :border="false">
                <van-field v-model="username" placeholder="请输入用户名" left-icon="user-o" clearable autocomplete="off" />
                <van-field v-model="email" type="email" placeholder="请输入邮箱" left-icon="envelop-o" clearable autocomplete="off" />
                <van-field v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="请输入密码" left-icon="lock" clearable autocomplete="new-password">
                    <template #right-icon>
                        <van-icon :name="showPassword ? 'eye-o' : 'closed-eye'" @click="showPassword = !showPassword" style="cursor: pointer;" />
                    </template>
                </van-field>
                <van-field v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="请再次输入密码" left-icon="lock" clearable autocomplete="new-password">
                    <template #right-icon>
                        <van-icon :name="showConfirmPassword ? 'eye-o' : 'closed-eye'" @click="showConfirmPassword = !showConfirmPassword" style="cursor: pointer;" />
                    </template>
                </van-field>
                <van-field v-model="code" placeholder="请输入验证码" left-icon="shield-o" clearable>
                    <template #button>
                        <button class="code-btn" :disabled="countdown > 0 || sendingCode" @click="sendCode">
                            {{ sendingCode ? '发送中...' : (countdown > 0 ? `${countdown}秒后重发` : '获取验证码') }}
                        </button>
                    </template>
                </van-field>
            </van-cell-group>

            <!-- 用户协议 -->
            <div class="agreement">
                <van-checkbox v-model="agree" shape="square" icon-size="16px">
                    我已阅读并同意 <span class="link" @click="openAgreement">《用户协议》</span> 和 <span class="link" @click="openPrivacy">《隐私政策》</span>
                </van-checkbox>
            </div>

            <button class="btn-primary" :disabled="loading" @click="handleRegister">
                {{ loading ? '注册中...' : '注册' }}
            </button>

            <div class="footer-links">
                <span @click="switchMode('login')">已有账号？立即登录</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-page {
    min-height: 100vh;
    padding: 60px 20px 20px;
    background: #0D1117;
    position: relative;
    z-index: 1;
}

/* Header */
.header {
    text-align: center;
    padding: 40px 0 32px;
}

.logo-icon {
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
}

.title {
    font-size: 28px;
    font-weight: 600;
    color: #F0F6FC;
    margin-bottom: 8px;
}

.subtitle {
    font-size: 14px;
    color: #8B949E;
}

/* Tab Switch */
.tab-switch {
    display: flex;
    background: rgba(240, 246, 252, 0.05);
    border: 1px solid rgba(240, 246, 252, 0.1);
    border-radius: 16px;
    padding: 4px;
    margin-bottom: 24px;
}

.tab {
    flex: 1;
    text-align: center;
    padding: 12px 0;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    color: #8B949E;
    cursor: pointer;
    transition: all 0.3s;
}

.tab.active {
    background: linear-gradient(135deg, #58A6FF, #1F6FEB);
    color: white;
}

/* Form Card */
.form-card {
    background: rgba(30, 37, 46, 0.9);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(240, 246, 252, 0.1);
    border-radius: 20px;
    padding: 24px;
}

/* Login Type Switch */
.login-type-switch {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 20px;
}

.type-btn {
    padding: 8px 20px;
    border-radius: 16px;
    font-size: 13px;
    color: #8B949E;
    cursor: pointer;
    background: rgba(240, 246, 252, 0.05);
    border: 1px solid rgba(240, 246, 252, 0.1);
    transition: all 0.3s;
}

.type-btn.active {
    background: rgba(88, 166, 255, 0.15);
    color: #58A6FF;
    border-color: rgba(88, 166, 255, 0.3);
}

.type-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Van Field */
:deep(.van-cell-group) {
    margin-bottom: 16px;
    background: transparent;
}

:deep(.van-cell) {
    background: transparent !important;
    color: #F0F6FC !important;
    padding: 14px 0;
    border-bottom: 1px solid rgba(240, 246, 252, 0.1);
}

:deep(.van-cell:last-child) {
    border-bottom: none;
}

:deep(.van-field__label) {
    color: #8B949E;
}

:deep(.van-field__control) {
    font-size: 15px;
    color: #F0F6FC !important;
    background: transparent !important;
}

:deep(.van-field__control::placeholder) {
    color: #8B949E;
}

:deep(.van-field__left-icon) {
    color: #8B949E;
}

:deep(.van-field__right-icon) {
    color: #8B949E;
    cursor: pointer;
}

/* Code Button */
.code-btn {
    padding: 6px 16px;
    border-radius: 12px;
    border: 1px solid rgba(240, 246, 252, 0.1);
    background: transparent;
    color: #58A6FF;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
}

.code-btn:hover:not(:disabled) {
    background: rgba(88, 166, 255, 0.1);
}

.code-btn:disabled {
    color: #8B949E;
    border-color: rgba(240, 246, 252, 0.05);
}

/* Agreement */
.agreement {
    margin-bottom: 16px;
}

.agreement :deep(.van-checkbox__label) {
    font-size: 12px;
    color: #8B949E;
}

.link {
    color: #58A6FF;
}

/* Footer Links */
.footer-links {
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    color: #8B949E;
    cursor: pointer;
    display: flex;
    justify-content: center;
    gap: 20px;
}

.footer-links .link {
    color: #58A6FF;
}
</style>
