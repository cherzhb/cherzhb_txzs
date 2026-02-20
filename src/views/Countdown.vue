<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { authAPI } from '@/api'
import dayjs from 'dayjs'

const userStore = useUserStore()
const years = ref(0)
const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
const retirementDate = ref(null)
const isRetired = ref(false)

// 档案数据
const profile = ref({
  birthDate: '',
  gender: 1,
  jobType: 1,
  locationCode: '110000'
})

// 计算退休日期
const calculateRetirementDate = () => {
  if (!profile.value.birthDate) return
  
  const birth = dayjs(profile.value.birthDate)
  
  // 根据性别和身份确定退休年龄
  let retirementAge = 60
  if (profile.value.gender === 2) {
    // 女
    retirementAge = [1, 3].includes(profile.value.jobType) ? 55 : 50
  }
  
  const retireDate = birth.add(retirementAge, 'year')
  retirementDate.value = retireDate.format('YYYY-MM-DD')
  
  // 检查是否已退休
  const now = dayjs()
  isRetired.value = now.isAfter(retireDate)
}

// 更新倒计时
const updateCountdown = () => {
  if (!retirementDate.value) return
  
  const now = dayjs()
  const retire = dayjs(retirementDate.value)
  
  if (now.isAfter(retire)) {
    isRetired.value = true
    return
  }
  
  const diff = retire.diff(now, 'second')
  
  years.value = Math.floor(diff / (365 * 24 * 60 * 60))
  days.value = Math.floor((diff % (365 * 24 * 60 * 60)) / (24 * 60 * 60))
  hours.value = Math.floor((diff % (24 * 60 * 60)) / (60 * 60))
  minutes.value = Math.floor((diff % (60 * 60)) / 60)
  seconds.value = diff % 60
}

// 根据剩余天数获取情感化文案
const getEmotionalText = () => {
  if (isRetired.value) {
    return '已退休 · 享受美好生活'
  }
  
  const totalDays = years.value * 365 + days.value
  
  if (totalDays > 5000) {
    return '距离退休还很远，正是奋斗好时光'
  } else if (totalDays > 2000) {
    return '距离退休不远了，提前做好准备'
  } else if (totalDays > 365) {
    return '马上就要退休啦，可以开始憧憬了'
  } else if (totalDays > 30) {
    return '即将迎来退休时刻，倒数开始'
  } else {
    return '准备迎接新的生活阶段'
  }
}

const emotionalText = computed(() => getEmotionalText())

// 格式化日期
const formatDate = (dateStr) => {
  return dayjs(dateStr).format('YYYY年MM月DD日')
}

// 获取参保地名称
const getLocationName = (code) => {
  const locationMap = {
    '110000': '北京市',
    '440100': '广州市',
    '320100': '南京市',
    '410100': '郑州市',
    '310000': '上海市',
    '440300': '深圳市',
    '430100': '长沙市',
    '420100': '武汉市',
    '330100': '杭州市',
    '320500': '苏州市'
  }
  return locationMap[code] || '其他城市'
}

// 当前年龄
const currentAge = computed(() => {
  if (!profile.value.birthDate) return '-'
  return dayjs().diff(profile.value.birthDate, 'year')
})

onMounted(async () => {
  // 加载用户档案
  if (userStore.isLoggedIn) {
    try {
      const data = await authAPI.getMe()
      if (data) {
        profile.value = {
          birthDate: data.birth_date || '',
          gender: data.gender ?? 1,
          jobType: data.job_type ?? 1,
          locationCode: data.location_code || '110000'
        }
      }
    } catch (err) {
      console.error('加载档案失败:', err)
    }
  }
  
  calculateRetirementDate()
  updateCountdown()
  
  // 每秒更新
  setInterval(updateCountdown, 1000)
})
</script>

<template>
  <div class="countdown-page">
    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">退休倒计时</h1>
        <p class="emotion">{{ emotionalText }}</p>
      </div>

      <!-- 倒计时显示 -->
      <div class="countdown-card glass-card" v-if="!isRetired && profile.birthDate">
        <div class="countdown-display">
          <div class="time-box">
            <div class="time-value countdown-text">{{ years }}</div>
            <div class="time-unit">年</div>
          </div>
          <div class="time-separator">:</div>
          <div class="time-box">
            <div class="time-value countdown-text">{{ days }}</div>
            <div class="time-unit">天</div>
          </div>
          <div class="time-separator">:</div>
          <div class="time-box">
            <div class="time-value">{{ String(hours).padStart(2, '0') }}</div>
            <div class="time-unit">时</div>
          </div>
          <div class="time-separator">:</div>
          <div class="time-box">
            <div class="time-value">{{ String(minutes).padStart(2, '0') }}</div>
            <div class="time-unit">分</div>
          </div>
          <div class="time-separator">:</div>
          <div class="time-box">
            <div class="time-value">{{ String(seconds).padStart(2, '0') }}</div>
            <div class="time-unit">秒</div>
          </div>
        </div>
      </div>

      <!-- 已退休显示 -->
      <div class="retired-card glass-card" v-else-if="isRetired">
        <div class="retired-icon">🎉</div>
        <div class="retired-title">已退休</div>
        <div class="retired-desc">享受您的退休生活吧</div>
      </div>

      <!-- 未填写出生日期提示 -->
      <div class="tip-card glass-card" v-else>
        <div class="tip-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--highlight);">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="tip-content">
          <p class="tip-title">请完善个人档案</p>
          <p class="tip-text">填写出生日期后即可查看退休倒计时</p>
        </div>
        <button class="btn-primary" @click="$router.push('/profile')">去填写</button>
      </div>

      <!-- 退休信息卡片 -->
      <div class="info-card glass-card" v-if="profile.birthDate">
        <div class="card-title">退休信息</div>
        <div class="info-rows">
          <div class="info-row">
            <span class="row-label">出生日期</span>
            <span class="row-value">{{ formatDate(profile.birthDate) }}</span>
          </div>
          <div class="info-row">
            <span class="row-label">当前年龄</span>
            <span class="row-value">{{ currentAge }}岁</span>
          </div>
          <div class="info-row">
            <span class="row-label">退休年龄</span>
            <span class="row-value highlight">
              {{
                profile.gender === 2 
                  ? (profile.jobType === 1 || profile.jobType === 3 ? '55岁' : '50岁')
                  : '60岁'
              }}
            </span>
          </div>
          <div class="info-row">
            <span class="row-label">退休日期</span>
            <span class="row-value highlight">{{ formatDate(retirementDate) }}</span>
          </div>
        </div>
      </div>

      <!-- 个人档案状态 -->
      <div class="profile-card glass-card" v-if="profile.birthDate">
        <div class="card-title">个人档案</div>
        <div class="info-rows">
          <div class="info-row">
            <span class="row-label">身份</span>
            <span class="row-value badge">
              <span class="chip chip-primary">
                {{ profile.jobType === 1 ? '企业职工' : 
                   profile.jobType === 2 ? '灵活就业' : 
                   profile.jobType === 3 ? '公务员' : '事业单位' }}
              </span>
            </span>
          </div>
          <div class="info-row">
            <span class="row-label">性别</span>
            <span class="row-value">{{ profile.gender === 1 ? '男' : '女' }}</span>
          </div>
          <div class="info-row">
            <span class="row-label">参保地</span>
            <span class="row-value">{{ getLocationName(profile.locationCode) }}</span>
          </div>
        </div>
        <button class="btn-ghost" @click="$router.push('/profile')">编辑档案</button>
      </div>

      <!-- 温馨提示 -->
      <div class="tips-card glass-card">
        <div class="card-title">💡 温馨提示</div>
        <ul class="tips-list">
          <li>退休年龄可能因政策调整而变化，请关注最新政策</li>
          <li>实际退休时间以社保部门核定为准</li>
          <li>建议提前规划，合理安排退休生活</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.countdown-page {
  min-height: 100vh;
  position: relative;
  z-index: 1;
  padding-bottom: 100px;
}

.page-container {
  padding: 56px 20px 0;
}

/* Header */
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--fg);
  margin-bottom: 8px;
}

.emotion {
  font-size: 14px;
  color: var(--fg-muted);
  font-style: italic;
}

/* Countdown Card */
.countdown-card {
  padding: 32px 20px;
  margin-bottom: 24px;
  text-align: center;
}

.countdown-display {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.time-box {
  text-align: center;
  min-width: 50px;
}

.time-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--fg);
  line-height: 1;
}

.time-value.countdown-text {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.time-unit {
  font-size: 11px;
  color: var(--fg-muted);
  margin-top: 4px;
}

.time-separator {
  font-size: 20px;
  color: var(--accent-primary);
  font-weight: 600;
  display: flex;
  align-items: center;
}

/* Retired Card */
.retired-card {
  padding: 50px 20px;
  text-align: center;
  margin-bottom: 24px;
}

.retired-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.retired-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--accent-primary);
  margin-bottom: 8px;
}

.retired-desc {
  font-size: 14px;
  color: var(--fg-muted);
}

/* Tip Card */
.tip-card {
  padding: 24px;
  text-align: center;
  margin-bottom: 24px;
}

.tip-icon {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.tip-content {
  margin-bottom: 20px;
}

.tip-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
  margin-bottom: 4px;
}

.tip-text {
  font-size: 14px;
  color: var(--fg-muted);
}

/* Info Card */
.info-card {
  padding: 20px;
  margin-bottom: 24px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.info-rows {
  padding-bottom: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(240, 246, 252, 0.05);
}

.info-row:last-child {
  border-bottom: none;
}

.row-label {
  font-size: 14px;
  color: var(--fg-muted);
}

.row-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--fg);
}

.row-value.highlight {
  color: var(--accent-primary);
}

.row-value.badge {
  flex: 1;
  text-align: right;
}

/* Profile Card */
.profile-card {
  padding: 20px;
  margin-bottom: 24px;
}

.profile-card .info-rows {
  margin-bottom: 16px;
}

/* Tips Card */
.tips-card {
  padding: 20px;
}

.tips-list {
  list-style: none;
  padding: 0;
}

.tips-list li {
  font-size: 13px;
  color: var(--fg-muted);
  line-height: 1.8;
  padding-left: 20px;
  position: relative;
}

.tips-list li::before {
  content: '•';
  position: absolute;
  left: 8px;
  color: var(--accent-primary);
}
</style>
