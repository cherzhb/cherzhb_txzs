<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeTab = ref('phone') // phone | email
const phone = ref('')
const email = ref('')
const code = ref('')
const password = ref('')
const step = ref(1) // 1: 输入账号 2: 验证码设置密码 3: 设置档案
const countdown = ref(0)

onMounted(() => {
  // 检查是否已登录
  if (userStore.isLoggedIn) {
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  }
})

// 退出聚焦输入
const handleBlur = () => {
  window.scrollTo(0, window.scrollY)
}

// 发送验证码
const sendCode = () => {
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
  
  // 开始倒计时
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
  
  showToast('验证码已发送')
  
  // 实际项目中这里应该调用后端API发送验证码
  // 模拟验证码：123456
  console.log('验证码：123456')
}

// 验证码并进入下一步
const verifyCode = () => {
  if (!code.value) {
    showToast('请输入验证码')
    return
  }
  
  // 模拟验证
  if (code.value !== '123456') {
    showToast('验证码错误')
    return
  }
  
  step.value = 2
}

// 提交表单
const submitForm = () => {
  if (!password.value) {
    showToast('请设置密码')
    return
  }
  
  if (password.value.length < 8) {
    showToast('密码至少8位')
    return
  }
  
  // 模拟登录/注册
  const userData = {
    id: Date.now(),
    username: activeTab.value === 'phone' ? phone.value : email.value,
    phone: phone.value,
    email: email.value
  }
  
  userStore.login(userData)
  
  showToast('登录成功')
  
  setTimeout(() => {
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  }, 1500)
}

// 设置性别
const genderRef = ref(1)

// 设置出生日期
const birthDateRef = ref('')

// 设置人员身份
const jobTypeRef = ref(1)

// 选择人员身份点击
const onJobTypeConfirm = ({ selectedOptions }) => {
  jobTypeRef.value = selectedOptions[0].value
};

// 设置参保地
const locationRef = ref('110000')

// 完成档案设置
const completeProfile = () => {
  if (!birthDateRef.value) {
    showToast('请选择出生日期')
    return
  }
  
  userStore.updateProfile({
    gender: genderRef.value,
    birthDate: birthDateRef.value,
    jobType: jobTypeRef.value,
    locationCode: locationRef.value,
    isVerified: true
  })
  
  showToast('档案设置完成')
  
  const redirect = route.query.redirect || '/'
  router.push(redirect)
}

// 人员身份选项
const jobTypeOptions = [
  { text: '企业职工', value: 1 },
  { text: '灵活就业人员', value: 2 },
  { text: '公务员', value: 3 },
  { text: '事业单位人员', value: 4 },
]
</script>

<template>
  <div class="login-page">
    <!-- 步骤指示器 -->
    <div class="steps">
      <div class="step" :class="{ active: step >= 1 }">1</div>
      <div class="step-line" :class="{ active: step >= 2 }"></div>
      <div class="step" :class="{ active: step >= 2 }">2</div>
      <div class="step-line" :class="{ active: step >= 3 }"></div>
      <div class="step" :class="{ active: step >= 3 }">3</div>
      <div class="step-line" :class="{ active: step >= 4 }"></div>
      <div class="step" :class="{ active: step >= 4 }">4</div>
    </div>

    <!-- 步骤1：输入账号 -->
    <div v-if="step === 1" class="form-container">
      <h2 class="form-title">欢迎使用</h2>
      <p class="form-desc">请选择登录/注册方式</p>
      
      <van-tabs v-model:active="activeTab">
        <van-tab title="手机号" name="phone">
          <van-field
            v-model="phone"
            type="tel"
            label="手机号"
            placeholder="请输入11位手机号"
            maxlength="11"
            :rules="[{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]"
            @blur="handleBlur"
          />
        </van-tab>
        <van-tab title="邮箱" name="email">
          <van-field
            v-model="email"
            type="email"
            label="邮箱"
            placeholder="请输入邮箱地址"
            @blur="handleBlur"
          />
        </van-tab>
      </van-tabs>

      <div class="next-step">
        <van-button type="primary" block @click="sendCode">
          获取验证码
        </van-button>
      </div>
    </div>

    <!-- 步骤2：验证并设置密码 -->
    <div v-if="step === 2" class="form-container">
      <h2 class="form-title">账号验证</h2>
      
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
        placeholder="8-20位，包含字母和数字"
        :rules="[
          { required: true, message: '请设置密码' },
          { min: 8, message: '密码至少8位' }
        ]"
      />

      <div class="tips">
        <van-icon name="info-o" />
        <span>测试验证码：123456</span>
      </div>

      <div class="next-step">
        <van-button type="primary" block @click="submitForm">
          登录 / 注册
        </van-button>
      </div>
    </div>

    <!-- 步骤3：设置档案 -->
    <div v-if="step === 3" class="form-container">
      <h2 class="form-title">完善个人档案</h2>
      <p class="form-desc">此信息用于计算退休年龄和待遇</p>

      <van-field name="gender" label="性别">
        <template #input>
          <van-radio-group v-model="genderRef" direction="horizontal">
            <van-radio :name="1">男</van-radio>
            <van-radio :name="2">女</van-radio>
          </van-radio-group>
        </template>
      </van-field>

      <van-field
        v-model="birthDate"
        is-link
        readonly
        label="出生日期"
        placeholder="请选择出生日期"
        @click="showDatePicker = true"
      />
      <van-popup v-model:show="showDatePicker" position="bottom">
        <van-date-picker
          v-model="birthDateRef"
          title="选择出生日期"
          :min-date="new Date(1940, 0, 1)"
          :max-date="new Date(2010, 11, 31)"
          @confirm="birthDate = birthDateRef.join('-'); showDatePicker = false"
          @cancel="showDatePicker = false"
        />
      </van-popup>

      <van-field
        v-model="location"
        is-link
        readonly
        label="参保地"
        placeholder="请选择参保地"
        @click="showLocationPicker = true"
      />
      <van-popup v-model:show="showLocationPicker" position="bottom">
        <van-picker
          :columns="locationColumns"
          title="选择参保地"
          @confirm="onLocationConfirm"
          @cancel="showLocationPicker = false"
        />
      </van-popup>

      <div class="next-step">
        <van-button type="primary" block @click="completeProfile">
          完成
        </van-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 20px;
}

.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
}

.step {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ddd;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.step.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #ddd;
  margin: 0 8px;
}

.step-line.active {
  background: linear-gradient(90deg, #667eea 50%, #ddd 50%);
}

.form-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
}

.form-title {
  font-size: 24px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 8px;
  text-align: center;
}

.form-desc {
  font-size: 14px;
  color: #969799;
  margin-bottom: 24px;
  text-align: center;
}

.next-step {
  margin-top: 32px;
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
</style>
