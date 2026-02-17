<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import dayjs from 'dayjs'

const userStore = useUserStore()
const years = ref(0)
const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
const retirementDate = ref(null)
const isRetired = ref(false)

// 退休年龄规则
const retirementRules = {
  1: 60,  // 企业职工(男)
  2: 55,  // 企业职工(女-干部)
  3: 55,  // 灵活就业(男) - 假设与职工相同
  4: 50   // 灵活就业(女)
}

// 计算退休日期
const calculateRetirementDate = () => {
  const profile = userStore.profile
  const birth = dayjs(profile.birthDate)
  
  // 根据性别和身份确定退休年龄
  let retirementAge = 60
  if (profile.gender === 2) {
    // 女
    retirementAge = [1, 3].includes(profile.jobType) ? 55 : 50
  }
  
  const retireDate = birth.add(retirementAge, 'year')
  retirementDate.value = retireDate.format('YYYY-MM-DD')
  
  // 检查是否已退休
  const now = dayjs()
  isRetired.value.value = now.isAfter(retireDate)
}

// 更新倒计时
const updateCountdown = () => {
  if (!retirementDate.value) return
  
  const now = dayjs()
  const retire = dayjs(retirementDate.value)
  
  if (now.isAfter(retire)) {
    isRetired.value = true
    const retiredDuration = retire.diff(now, 'day')
    return
  }
  
  const diff = retire.diff(now, 'second')
  
  years.value = Math.floor(diff / (365 * 24 * 60 * 60))
  days.value = Math.floor((diff % (365 * 24 * 60 * 60)) / (24 * 60 * 60))
  hours.value = Math.floor((diff % (24 * 60 * 60)) / (60 * 60))
  minutes.value = Math.floor((diff % (60 * 60)) / 60)
  seconds.value = diff % 60
}

// 时间单位中文
const timeUnits = {
  year: '年',
  day: '天',
  hour: '小时',
  minute: '分钟',
  second: '秒'
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

onMounted(() => {
  calculateRetirementDate()
  updateCountdown()
  
  // 每秒更新
  setInterval(updateCountdown, 1000)
})
</script>

<template>
  <div class="countdown-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">退休倒计时</h1>
      <p class="emotion">{{ emotionalText }}</p>
    </div>

    <!-- 倒计时显示 -->
    <div class="countdown-container" v-if="!isRetired">
      <div class="time-box">
        <div class="time-value">{{ years }}</div>
        <div class="time-unit">年</div>
      </div>
      <div class="time-separator">:</div>
      <div class="time-box">
        <div class="time-value">{{ days }}</div>
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

    <!-- 已退休显示 -->
    <div class="retired-container" v-else>
      <div class="retired-icon">🎉</div>
      <div class="retired-title">已退休</div>
      <div class="retired-desc">享受您的退休生活吧</div>
    </div>

    <!-- 退休信息卡片 -->
    <div class="info-card">
      <div class="info-item">
        <div class="label">出生日期</div>
        <div class="value">{{ formatDate(userStore.profile.birthDate) }}</div>
      </div>
      <div class="info-item">
        <div class="label">退休年龄</div>
        <div class="value">
          {{
            userStore.profile.gender === 2 
              ? (userStore.profile.jobType === 1 || userStore.profile.jobType === 3 ? '55周岁' : '50周岁')
              : '60周岁'
          }}
        </div>
      </div>
      <div class="info-item">
        <div class="label">退休日期</div>
        <div class="value highlight">{{ formatDate(retirementDate) }}</div>
      </div>
      <div class="info-item" v-if="!isRetired">
        <div class="label">当前年龄</div>
        <div class="value">{{ userStore.profile.birthDate ? dayjs().diff(userStore.profile.birthDate, 'year') : '-' }}周岁</div>
      </div>
    </div>

    <!-- 个人档案状态 -->
    <div class="profile-status">
      <div class="status-title">个人档案</div>
      <div class="status-item">
        <span class="label">身份</span>
        <span class="value">
          {{ userStore.profile.jobType === 1 ? '企业职工' : 
             userStore.profile.jobType === 2 ? '灵活就业' : 
             userStore.profile.jobType === 3 ? '公务员' : '事业单位' }}
        </span>
      </div>
      <div class="status-item">
        <span class="label">性别</span>
        <span class="value">{{ userStore.profile.gender === 1 ? '男' : '女' }}</span>
      </div>
      <div class="status-item">
        <span class="label">参保地</span>
        <span class="value">{{ getLocationName(userStore.profile.locationCode) }}</span>
      </div>
      <div class="edit-btn" @click="$router.push('/profile')">
        编辑档案
      </div>
    </div>

    <!-- 温馨提示 -->
    <div class="tips-card">
      <div class="tips-title">💡 温馨提示</div>
      <ul class="tips-list">
        <li>退休年龄可能因政策调整而变化，请关注最新政策</li>
        <li>实际退休时间以社保部门核定为准</li>
        <li>建议提前规划，合理安排退休生活</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.countdown-page {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.page-header {
  text-align: center;
  color: white;
  padding: 30px 20px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 12px;
}

.emotion {
  font-size: 16px;
  opacity: 0.95;
  font-style: italic;
}

.countdown-container {
  background: white;
  border-radius: 20px;
  padding: 30px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.time-box {
  text-align: center;
  margin: 8px;
}

.time-value {
  font-size: 32px;
  font-weight: bold;
  color: #1989fa;
  line-height: 1;
  min-width: 60px;
}

.time-unit {
  font-size: 14px;
  color: #969799;
  margin-top: 4px;
}

.time-separator {
  font-size: 24px;
  color: #1989fa;
  font-weight: bold;
  margin: 0 4px;
}

.retired-container {
  background: white;
  border-radius: 20px;
  padding: 50px 20px;
  text-align: center;
  margin-bottom: 16px;
}

.retired-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.retired-title {
  font-size: 28px;
  font-weight: bold;
  color: #1989fa;
  margin-bottom: 12px;
}

.retired-desc {
  font-size: 16px;
  color: #969799;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 15px;
  color: #646566;
}

.value {
  font-size: 15px;
  color: #323233;
  font-weight: 500;
}

.value.highlight {
  color: #1989fa;
  font-weight: bold;
}

.profile-status {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.status-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #323233;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 14px;
}

.status-item .label {
  color: #969799;
}

.status-item .value {
  color: #323233;
}

.edit-btn {
  margin-top: 16px;
  text-align: center;
  color: #1989fa;
  font-size: 14px;
  cursor: pointer;
}

.tips-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
}

.tips-title {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #323233;
}

.tips-list {
  list-style: none;
  padding: 0;
}

.tips-list li {
  font-size: 13px;
  color: #646566;
  line-height: 1.8;
  padding-left: 20px;
  position: relative;
}

.tips-list li::before {
  content: '•';
  position: absolute;
  left: 8px;
  color: #1989fa;
}
</style>
