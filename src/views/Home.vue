<script setup>
import { ref, computed, onMounted, onActivated } from 'vue'
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

// 弹窗控制
const showGenderPicker = ref(false)
const showDatePicker = ref(false)
const showAgePicker = ref(false)
const birthDateValue = ref(['1990', '01', '01'])

// 退休年龄选项
const ageOptions = Array.from({ length: 21 }, (_, i) => ({ text: (50 + i) + '岁', value: 50 + i }))

// 计算退休日期
const retirementDate = computed(() => {
  if (!birthDate.value) return ''
  const birth = dayjs(birthDate.value)
  return birth.add(retirementAge.value, 'year').format('YYYY年MM月DD日')
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

// 从后端加载用户档案
const loadUserProfile = async () => {
  if (!userStore.isLoggedIn) return
  try {
    const data = await authAPI.getMe()
    if (data) {
      gender.value = data.gender || 1
      birthDate.value = data.birth_date || ''
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
</script>

<template>
  <div class="home-page">
    <!-- 头部背景区域 -->
    <div class="header-bg">
      <div class="header">
        <h1 class="title">退休规划助手</h1>
        <p class="subtitle">科学规划 · 快乐退休</p>
      </div>

      <!-- 倒计时区域 -->
      <div class="countdown-section">
        <div class="countdown-label">距离退休还有</div>
        <div class="countdown-number-wrap">
          <span v-if="daysUntilRetirement && daysUntilRetirement > 0" class="days-number">{{ daysUntilRetirement }}</span>
          <span v-else class="days-text">{{ countdownText }}</span>
        </div>
        <div v-if="daysUntilRetirement && daysUntilRetirement > 0" class="countdown-unit">天</div>
      </div>
    </div>

    <!-- 退休信息卡片 -->
    <div class="retirement-card">
      <div class="card-title">退休信息</div>
      <van-cell-group :border="false">
        <van-cell title="性别" :value="genderText" is-link @click="showGenderPicker = true" />
        <van-cell title="出生日期" :value="birthDate || '请选择'" is-link @click="showDatePicker = true" />
        <van-cell title="退休年龄" :value="retirementAge + '岁'" is-link @click="showAgePicker = true" />
        <van-cell title="预计退休日期" :value="retirementDate || '请先填写信息'" />
      </van-cell-group>
    </div>

    <!-- 未登录提示 -->
    <div class="login-tip" v-if="!userStore.isLoggedIn">
      <p>登录后可保存个人档案信息</p>
      <van-button type="primary" size="small" @click="router.push('/login')">去登录</van-button>
    </div>

    <!-- 温馨提示 -->
    <div class="tips-card">
      <div class="tips-title">💡 温馨提示</div>
      <div class="tips-list">
        <div class="tip-item">• 本应用计算结果仅供参考，实际退休待遇以当地社保部门核定为准。</div>
        <div class="tip-item">• 提前规划退休生活，享受美好时光</div>
        <div class="tip-item">• 关注养老金政策变化</div>
        <div class="tip-item">• 保持健康的生活方式</div>
      </div>
    </div>

    <!-- 选择器弹窗 -->
    <van-popup v-model:show="showGenderPicker" position="bottom" round>
      <van-picker title="选择性别" :columns="[{ text: '男', value: 1 }, { text: '女', value: 2 }]" @confirm="onConfirmGender" @cancel="showGenderPicker = false" />
    </van-popup>

    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker v-model="birthDateValue" title="选择出生日期" :min-date="new Date(1940, 0, 1)" :max-date="new Date(2010, 11, 31)" @confirm="onConfirmDate" @cancel="showDatePicker = false" />
    </van-popup>

    <van-popup v-model:show="showAgePicker" position="bottom" round>
      <van-picker title="选择退休年龄" :columns="ageOptions" @confirm="onConfirmAge" @cancel="showAgePicker = false" />
    </van-popup>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 80px;
}

/* 头部背景区域 */
.header-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px 16px 48px;
}

.header {
  text-align: center;
  color: white;
  padding-bottom: 32px;
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

/* 倒计时区域 - 无背景 */
.countdown-section {
  text-align: center;
  color: white;
  padding: 24px 0;
}

.countdown-label {
  font-size: 20px;
  opacity: 0.95;
  margin-bottom: 16px;
}

.countdown-number-wrap {
  display: flex;
  justify-content: center;
  align-items: baseline;
}

.days-number {
  font-size: 96px;
  font-weight: bold;
  color: white;
  line-height: 1;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.days-text {
  font-size: 28px;
  font-weight: bold;
  color: white;
}

.countdown-unit {
  font-size: 28px;
  color: white;
  margin-top: 8px;
  font-weight: 500;
}

/* 退休信息卡片 */
.retirement-card {
  background: white;
  border-radius: 16px;
  margin: -24px 16px 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  padding: 16px;
  color: #323233;
  border-bottom: 1px solid #f5f5f5;
}

:deep(.van-cell-group) {
  background: transparent;
}

:deep(.van-cell) {
  padding: 14px 16px;
}

:deep(.van-cell__value) {
  color: #323233;
}

.login-tip {
  background: white;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  margin: 0 16px 16px;
}

.login-tip p {
  color: #969799;
  margin-bottom: 12px;
}

/* 温馨提示 */
.tips-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 0 16px 16px;
}

.tips-title {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 12px;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-item {
  font-size: 14px;
  color: #646566;
  line-height: 1.6;
}
</style>
