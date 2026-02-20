<script setup>
import { ref, computed, onMounted, onActivated, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { authAPI } from '@/api'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const gender = ref(1)
const birthDate = ref('')
const retirementAge = ref(60)
const paidYears = ref(null) // 从后端读取的缴费年限

// 弹窗控制
const showGenderPicker = ref(false)
const showDatePicker = ref(false)
const showAgePicker = ref(false)
const birthDateValue = ref(['1990', '01', '01'])

// 退休年龄选项
const ageOptions = Array.from({ length: 21 }, (_, i) => ({
  text: (50 + i) + '岁',
  value: 50 + i
}))

// 计算退休日期
const retirementDate = computed(() => {
  if (!birthDate.value) return ''
  const birth = dayjs(birthDate.value)
  return birth.add(retirementAge.value, 'year').format('YYYY年MM月DD日')
})

// 计算退役日期的星期
const retirementWeekday = computed(() => {
  if (!birthDate.value) return ''
  const birth = dayjs(birthDate.value)
  const retireDate = birth.add(retirementAge.value, 'year')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[retireDate.day()] || ''
})

// 计算距离退休天数
const daysUntilRetirement = computed(() => {
  if (!birthDate.value || !retirementDate.value) return null
  const retireDate = dayjs(birthDate.value).add(retirementAge.value, 'year')
  const today = dayjs()
  const diff = retireDate.diff(today, 'day')
  return diff > 0 ? diff : 0
})

// 显示的倒计时文本
const countdownText = computed(() => {
  if (!daysUntilRetirement.value && daysUntilRetirement.value !== 0) return '请先填写信息'
  if (daysUntilRetirement.value === 0) return '已退休'
  const years = Math.floor(daysUntilRetirement.value / 365)
  const days = daysUntilRetirement.value % 365
  if (years > 0) {
    return `还有${years}年${days}天`
  }
  return `还有${daysUntilRetirement.value}天`
})

// 性别显示
const genderText = computed(() => gender.value === 1 ? '男' : '女')

// 计算年龄
const currentAge = computed(() => {
  if (!birthDate.value) return ''
  const birth = dayjs(birthDate.value)
  const today = dayjs()
  return today.diff(birth, 'year')
})

// 进度环进度
const progressValue = computed(() => {
  if (!birthDate.value) return 0
  const birth = dayjs(birthDate.value)
  const retire = birth.add(retirementAge.value, 'year')
  const today = dayjs()
  const totalDays = retire.diff(birth, 'day')
  const passedDays = today.diff(birth, 'day')
  return totalDays > 0 ? Math.min((passedDays / totalDays), 1) : 0
})

// 进度环dashoffset
const progressCircleOffset = computed(() => {
  const circumference = 213.63
  return circumference * (1 - progressValue.value)
})

// 进度百分比
const progressPercent = computed(() => {
  return Math.round(progressValue.value * 100)
})

// 从后端加载用户档案
const loadUserProfile = async () => {
  if (!userStore.isLoggedIn) return
  try {
    const data = await authAPI.getMe()
    if (data) {
      gender.value = data.gender || 1
      birthDate.value = data.birth_date || ''
      paidYears.value = data.contribution_years || 0
      if (data.birth_date) {
        birthDateValue.value = data.birth_date.split('-')
      }
      // 计算退休年龄
      if (data.gender === 2) {
        if (data.job_type === 2) {
          retirementAge.value = 50
        } else if (data.job_type === 3 || data.job_type === 4) {
          retirementAge.value = 55
        } else {
          retirementAge.value = 55
        }
      } else {
        retirementAge.value = 60
      }
    }
  } catch (err) {
    console.error('加载档案失败:', err)
  }
}

// 页面首次加载
onMounted(loadUserProfile)

// 页面重新激活时（从其他页面返回）
onActivated(loadUserProfile)

// 选择器确认
const onConfirmGender = ({ selectedValues }) => {
  gender.value = selectedValues[0]
  showGenderPicker.value = false
}

const onConfirmDate = ({ selectedValues }) => {
  birthDateValue.value = selectedValues
  birthDate.value = selectedValues.join('-')
  showDatePicker.value = false
}

const onConfirmAge = ({ selectedValues }) => {
  retirementAge.value = selectedValues[0]
  showAgePicker.value = false
}

// 页面进入后的动画
onMounted(() => {
  nextTick(() => {
    const items = document.querySelectorAll('.stagger')
    items.forEach((item, i) => {
      setTimeout(() => {
        item.classList.add('animate')
      }, i * 100)
    })
  })
})
</script>

<template>
  <div class="home-page">
    <!-- 页面容器 -->
    <div class="page-container">
      <!-- Header -->
      <div class="header-section stagger">
        <h1 class="page-title">退休规划助手</h1>
      </div>

      <!-- Main Countdown Card -->
      <div class="countdown-section stagger">
        <div class="glass-card glow">
          <div class="flex items-start justify-between mb-6">
            <div class="countdown-left">
              <p class="countdown-label">距离退休还有</p>
              <div class="countdown-display-wrap">
                <span v-if="daysUntilRetirement && daysUntilRetirement > 0" class="countdown-display">
                  {{ daysUntilRetirement }}
                </span>
                <span v-else class="countdown-display">{{ countdownText }}</span>
                <span v-if="daysUntilRetirement && daysUntilRetirement > 0" class="countdown-unit">天</span>
              </div>
            </div>

            <!-- Progress Ring -->
            <div class="progress-ring">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                <circle class="progress-ring-track" cx="40" cy="40" r="34" fill="none" stroke-width="6" />
                <circle class="progress-ring-value" cx="40" cy="40" r="34" fill="none" stroke="url(#progressGradient)" stroke-width="6" stroke-dasharray="213.63" :stroke-dashoffset="progressCircleOffset" />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color: #58A6FF" />
                    <stop offset="100%" style="stop-color: #3FB950" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="progress-text">
                <span class="progress-percent">{{ progressPercent }}%</span>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="stats-grid">
            <div class="stat-card">
              <p class="stat-label">现年</p>
              <p class="stat-value">{{ currentAge || '--' }}岁</p>
            </div>
            <div class="stat-card highlight">
              <p class="stat-label">退休年龄</p>
              <p class="stat-value">{{ retirementAge }}岁</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Retirement Info Card -->
      <div class="info-section stagger">
        <div class="glass-card">
          <div class="glass-header">
            <div class="header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h3 class="glass-title">退休信息</h3>
          </div>

          <div class="retirement-date-box">
            <div>
              <p class="retirement-date-large">{{ retirementDate || 'YYYY年MM月DD日' }}</p>
              <p class="retirement-weekday">{{ retirementWeekday || '周X' }}</p>
            </div>
            <div class="tag-group">
              <span class="chip chip-primary">{{ genderText }}</span>
              <span class="chip chip-success">企业职工</span>
            </div>
          </div>

          <div class="info-rows">
            <div class="info-row" @click="showGenderPicker = true">
              <span class="info-label">性别</span>
              <div class="info-value-wrap">
                <span class="info-value">{{ genderText }}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B949E" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
            <div class="info-row" @click="showDatePicker = true">
              <span class="info-label">出生日期</span>
              <div class="info-value-wrap">
                <span class="info-value">{{ birthDate || '请选择' }}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B949E" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
            <div class="info-row" @click="showAgePicker = true">
              <span class="info-label">退休年龄</span>
              <div class="info-value-wrap">
                <span class="info-value">{{ retirementAge }}岁</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B949E" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tips -->
      <div class="tips-section stagger">
        <h3 class="tips-title">温馨提示</h3>
        <div class="tips-simple-list">
          <p class="tips-simple-item">1. 建议提前5-10年开始规划退休后的生活方式和财务安排</p>
          <p class="tips-simple-item">2. 确保缴费基数和年限准确无误，影响养老金领取金额</p>
          <p class="tips-simple-item">3. 了解当地社保政策，合理规划个人账户</p>
          <p class="tips-simple-item">4. 关注养老金调整政策，及时了解最新变化</p>
        </div>
      </div>

      <!-- 未登录提示 -->
      <div class="login-tip" v-if="!userStore.isLoggedIn">
        <div class="glass-card">
          <p class="login-tip-text">登录后可保存个人档案信息</p>
          <button class="btn-primary" @click="router.push('/login')">去登录</button>
        </div>
      </div>
    </div>

    <!-- 选择器弹窗 -->
    <van-popup v-model:show="showGenderPicker" position="bottom" round teleport="body" :style="{ zIndex: 3000 }">
      <van-picker title="选择性别" :columns="[{ text: '男', value: 1 }, { text: '女', value: 2 }]" @confirm="onConfirmGender" @cancel="showGenderPicker = false" />
    </van-popup>
    <van-popup v-model:show="showDatePicker" position="bottom" round teleport="body" :style="{ zIndex: 3000 }">
      <van-date-picker v-model="birthDateValue" title="选择出生日期" :min-date="new Date(1940, 0, 1)" :max-date="new Date(2010, 11, 31)" @confirm="onConfirmDate" @cancel="showDatePicker = false" />
    </van-popup>
    <van-popup v-model:show="showAgePicker" position="bottom" round teleport="body" :style="{ zIndex: 3000 }">
      <van-picker title="选择退休年龄" :columns="ageOptions" @confirm="onConfirmAge" @cancel="showAgePicker = false" />
    </van-popup>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  padding-bottom: 100px;
  position: relative;
  z-index: 1;
}

.page-container {
  padding: 56px 24px 0;
}

/* Header Section */
.header-section {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--fg);
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.mb-6 {
  margin-bottom: 24px;
}

/* Countdown Section */
.countdown-section {
  margin-bottom: 24px;
}

.countdown-left {
  padding-left: 8px;
}

.countdown-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--fg-muted);
  margin-bottom: 12px;
}

.countdown-display-wrap {
  display: flex;
  align-items: flex-end;
  gap: 4px;
}

.countdown-display {
  font-family: 'Space Grotesk', 'Helvetica Neue', sans-serif;
  font-size: clamp(56px, 15vw, 72px);
  font-weight: 700;
  background: linear-gradient(135deg, #FFFFFF 0%, var(--accent-primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  letter-spacing: -2px;
}

.countdown-unit {
  font-size: 18px;
  color: var(--fg-muted);
  font-weight: 500;
  margin-bottom: 12px;
}

.progress-ring {
  position: relative;
  width: 80px;
  height: 80px;
}

.progress-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-percent {
  font-size: 14px;
  font-weight: 600;
  color: var(--fg);
}

.countdown-unit {
  font-size: 14px;
  color: var(--fg-muted);
  margin-top: 8px;
  font-weight: 500;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 24px;
}

.stat-label {
  font-size: 12px;
  color: var(--fg-muted);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--fg);
}

/* Info Section */
.info-section {
  margin-bottom: 24px;
}

.glass-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 0 20px;
  padding-top: 20px;
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--highlight), #FFA657);
}

.glass-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--fg);
}

.retirement-date-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: 12px;
  background: rgba(88, 166, 255, 0.08);
  margin: 0 20px 20px;
}

.retirement-date-large {
  font-size: 24px;
  font-weight: 600;
  color: var(--accent-primary);
  line-height: 1.2;
}

.retirement-weekday {
  font-size: 14px;
  color: var(--fg-muted);
  margin-top: 4px;
}

.tag-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Info Rows - 新样式 */
.info-rows {
  padding: 0 20px 20px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  margin-bottom: 8px;
  background: rgba(30, 37, 46, 0.9);
  border: 1px solid rgba(240, 246, 252, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.info-row:hover {
  background: rgba(40, 47, 56, 0.9);
  border-color: rgba(88, 166, 255, 0.3);
}

.info-label {
  font-size: 15px;
  color: #8B949E;
}

.info-value-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-value {
  font-size: 15px;
  color: #F0F6FC;
  font-weight: 500;
}

/* Tips Section - 简单列表样式 */
.tips-section {
  margin-bottom: 24px;
}

.tips-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--fg);
  margin-bottom: 16px;
  padding: 0;
}

.tips-simple-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tips-simple-item {
  font-size: 14px;
  color: var(--fg-muted);
  line-height: 1.6;
  padding-left: 0;
}

/* Login Tip */
.login-tip {
  padding: 0;
}

.login-tip-text {
  color: var(--fg-muted);
  text-align: center;
  margin-bottom: 12px;
  font-size: 14px;
}
</style>
