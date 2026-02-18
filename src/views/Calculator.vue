<script setup>
import { ref, computed, onMounted, onActivated } from 'vue'
import { showNotify, showSuccessToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { authAPI } from '@/api'
import dayjs from 'dayjs'

const userStore = useUserStore()

// 地区平均工资数据
const locationSalaries = {
  '110000': { name: '北京', salary: 11500 },
  '310000': { name: '上海', salary: 12100 },
  '440300': { name: '深圳', salary: 12800 },
  '440100': { name: '广州', salary: 11300 },
  '320100': { name: '南京', salary: 10800 },
  '330100': { name: '杭州', salary: 11000 },
  '420100': { name: '武汉', salary: 9500 },
  '430100': { name: '长沙', salary: 9200 },
  '410100': { name: '郑州', salary: 8800 },
  '320500': { name: '苏州', salary: 10500 }
}

// 用户信息（从后端获取）
const userInfo = ref({
  gender: 1,
  birthDate: '',
  salary: 0,
  accountBalance: 0,
  contributionYears: 0,
  contributionIndex: 1.0,
  locationCode: '110000',
  jobType: 1
})

// 计算结果
const showResult = ref(false)
const result = ref(null)

// 计算年龄
const age = computed(() => {
  if (!userInfo.value.birthDate) return null
  return dayjs().diff(dayjs(userInfo.value.birthDate), 'year')
})

// 计算退休年龄和月份（根据性别和工作类型自动判断）
const retirementInfo = computed(() => {
  const gender = userInfo.value.gender
  const jobType = userInfo.value.jobType
  
  // 男性：60岁
  if (gender === 1) {
    return { age: 60, months: 139, text: '60岁（男职工）' }
  }
  
  // 女性
  if (gender === 2) {
    // 女干部/公务员/事业单位：55岁
    if (jobType === 3 || jobType === 4) {
      return { age: 55, months: 170, text: '55岁（女干部）' }
    }
    // 女工人/灵活就业：50岁
    return { age: 50, months: 195, text: '50岁（女工人）' }
  }
  
  return { age: 60, months: 139, text: '60岁' }
})

// 距离退休年数
const yearsToRetire = computed(() => {
  if (!age.value) return null
  return Math.max(0, retirementInfo.value.age - age.value)
})

// 预计退休日期
const retirementDate = computed(() => {
  if (!userInfo.value.birthDate) return ''
  return dayjs(userInfo.value.birthDate).add(retirementInfo.value.age, 'year').format('YYYY年MM月')
})

// 参保地名称和平均工资
const locationInfo = computed(() => {
  return locationSalaries[userInfo.value.locationCode] || locationSalaries['110000']
})

// 从后端加载用户档案
const loadUserProfile = async () => {
  if (!userStore.isLoggedIn) {
    showNotify({ type: 'warning', message: '请先登录' })
    return
  }
  
  try {
    const data = await authAPI.getMe()
    if (data) {
      userInfo.value = {
        gender: data.gender || 1,
        birthDate: data.birth_date || '',
        salary: data.salary || 0,
        accountBalance: data.account_balance || 0,
        contributionYears: data.contribution_years || 0,
        contributionIndex: data.contribution_index || 1.0,
        locationCode: data.location_code || '110000',
        jobType: data.job_type || 1
      }
    }
  } catch (err) {
    console.error('加载档案失败:', err)
  }
}

// 页面加载和重新激活时获取用户信息
onMounted(loadUserProfile)
onActivated(loadUserProfile)

// 计算退休工资
const calculate = () => {
  // 验证必要信息
  if (!userInfo.value.birthDate) {
    showNotify({ type: 'warning', message: '请先在个人档案中填写出生日期' })
    return
  }
  if (userInfo.value.contributionYears < 15) {
    showNotify({ type: 'warning', message: '缴费年限不足15年' })
    return
  }
  if (!userInfo.value.salary || userInfo.value.salary <= 0) {
    showNotify({ type: 'warning', message: '请先在个人档案中填写当前工资' })
    return
  }
  
  const yearsToRetireVal = yearsToRetire.value
  
  // 当前社平工资
  const currentAvgSalary = locationInfo.value.salary
  
  // 假设工资增长率3%
  const salaryGrowthRate = 0.03
  // 预计退休时的社平工资
  const futureAvgSalary = currentAvgSalary * Math.pow(1 + salaryGrowthRate, yearsToRetireVal)
  
  // 总缴费年限 = 已缴费年限 + 距退休年数
  const totalContributionYears = userInfo.value.contributionYears + yearsToRetireVal
  
  // 缴费指数
  const index = userInfo.value.contributionIndex
  
  // 个人账户余额按当前工资8%继续缴纳，假设年利率3%
  const monthlyDeposit = userInfo.value.salary * 0.08
  const monthsRemaining = yearsToRetireVal * 12
  const futureAccountBalance = userInfo.value.accountBalance + 
    monthlyDeposit * monthsRemaining * (1 + 0.03 / 12 * monthsRemaining / 2)
  
  // 计发月数
  const months = retirementInfo.value.months
  
  // 基础养老金 = 退休时社平工资 × (1 + 缴费指数) / 2 × 缴费年限 × 1%
  const basicPension = futureAvgSalary * (1 + index) / 2 * totalContributionYears * 0.01
  
  // 个人账户养老金 = 个人账户余额 / 计发月数
  const personalPension = futureAccountBalance / months
  
  // 总养老金
  const totalPension = basicPension + personalPension
  
  result.value = {
    basicPension: Math.round(basicPension),
    personalPension: Math.round(personalPension),
    totalPension: Math.round(totalPension),
    totalContributionYears: Math.round(totalContributionYears),
    futureAccountBalance: Math.round(futureAccountBalance),
    futureAvgSalary: Math.round(futureAvgSalary),
    retirementAge: retirementInfo.value.text,
    retirementDate: retirementDate.value,
    yearsToRetire: yearsToRetireVal
  }
  
  showResult.value = true
  showSuccessToast('计算完成')
}

// 格式化金额
const formatMoney = (num) => {
  return new Intl.NumberFormat('zh-CN').format(Math.round(num))
}

// 性别显示
const genderText = computed(() => {
  return userInfo.value.gender === 1 ? '男' : '女'
})

// 工作类型显示
const jobTypeText = computed(() => {
  const types = ['', '企业职工', '灵活就业', '公务员', '事业单位']
  return types[userInfo.value.jobType] || '企业职工'
})
</script>

<template>
  <div class="calculator-page">
    <!-- 标题 -->
    <div class="page-header">
      <h1 class="title">退休工资计算器</h1>
      <p class="desc">基于您的个人档案智能推算</p>
    </div>
    
    <!-- 未登录提示 -->
    <div v-if="!userStore.isLoggedIn" class="not-logged">
      <van-icon name="user-o" size="48" color="#969799" />
      <p>请先登录查看您的退休工资预测</p>
      <van-button type="primary" @click="$router.push('/login')">去登录</van-button>
    </div>
    
    <!-- 已登录：显示用户信息 -->
    <template v-else>
      <!-- 用户信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <h3>👤 个人信息</h3>
          <van-button size="small" type="primary" plain to="/profile">
            修改档案
          </van-button>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">性别</span>
            <span class="info-value">{{ genderText }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">出生日期</span>
            <span class="info-value">{{ userInfo.birthDate || '未填写' }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">当前月工资</span>
            <span class="info-value">{{ formatMoney(userInfo.salary) }} 元</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">个人账户余额</span>
            <span class="info-value">{{ formatMoney(userInfo.accountBalance) }} 元</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">已缴费年限</span>
            <span class="info-value">{{ userInfo.contributionYears }} 年</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">缴费工资系数</span>
            <span class="info-value">{{ userInfo.contributionIndex.toFixed(1) }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">工作类型</span>
            <span class="info-value">{{ jobTypeText }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">参保地</span>
            <span class="info-value">{{ locationInfo.name }}</span>
          </div>
        </div>
      </div>
      
      <!-- 退休信息预览 -->
      <div class="preview-card">
        <div class="preview-title">📊 退休信息预览</div>
        <div class="preview-grid">
          <div class="preview-item">
            <span class="preview-label">当前年龄</span>
            <span class="preview-value">{{ age ?? '-' }} 岁</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">退休年龄</span>
            <span class="preview-value highlight">{{ retirementInfo.text }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">距退休</span>
            <span class="preview-value highlight">{{ yearsToRetire ?? '-' }} 年</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">预计退休日期</span>
            <span class="preview-value">{{ retirementDate || '请填写出生日期' }}</span>
          </div>
        </div>
      </div>
      
      <!-- 计算按钮 -->
      <div class="calc-button">
        <van-button type="primary" block size="large" @click="calculate">
          开始计算退休工资
        </van-button>
      </div>
      
      <!-- 计算结果 -->
      <div v-if="showResult && result" class="result-card">
        <div class="result-header">
          <h3>计算结果</h3>
          <span class="retire-tag">{{ result.retirementAge }}</span>
        </div>
        
        <div class="result-total">
          <div class="total-label">预估月领养老金</div>
          <div class="total-amount">
            <span class="currency">¥</span>
            <span class="number">{{ formatMoney(result.totalPension) }}</span>
            <span class="unit">元/月</span>
          </div>
          <div class="total-date">预计 {{ result.retirementDate }} 退休</div>
        </div>
        
        <div class="result-detail">
          <div class="detail-item">
            <div class="detail-label">基础养老金</div>
            <div class="detail-value">¥{{ formatMoney(result.basicPension) }}</div>
            <div class="detail-formula">
              社平工资 × (1 + 缴费指数) / 2 × {{ result.totalContributionYears }}年 × 1%
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">个人账户养老金</div>
            <div class="detail-value">¥{{ formatMoney(result.personalPension) }}</div>
            <div class="detail-formula">
              {{ formatMoney(result.futureAccountBalance) }}元 ÷ {{ retirementInfo.months }}个月
            </div>
          </div>
        </div>
        
        <div class="result-chart">
          <div class="chart-bar">
            <div class="bar basic" :style="{ width: (result.basicPension / result.totalPension * 100) + '%' }">
              <span v-if="result.basicPension / result.totalPension > 0.2">基础</span>
            </div>
            <div class="bar personal" :style="{ width: (result.personalPension / result.totalPension * 100) + '%' }">
              <span v-if="result.personalPension / result.totalPension > 0.2">个人</span>
            </div>
          </div>
          <div class="chart-legend">
            <span class="legend-item">
              <i class="dot basic"></i>
              基础养老金 {{ Math.round(result.basicPension / result.totalPension * 100) }}%
            </span>
            <span class="legend-item">
              <i class="dot personal"></i>
              个人账户 {{ Math.round(result.personalPension / result.totalPension * 100) }}%
            </span>
          </div>
        </div>
        
        <div class="result-assumptions">
          <div class="assumptions-title">📈 计算假设</div>
          <div class="assumptions-list">
            <div class="assumption-item">
              <span class="assumption-label">预计退休时社平工资</span>
              <span class="assumption-value">{{ formatMoney(result.futureAvgSalary) }} 元</span>
            </div>
            <div class="assumption-item">
              <span class="assumption-label">预计个人账户余额</span>
              <span class="assumption-value">{{ formatMoney(result.futureAccountBalance) }} 元</span>
            </div>
            <div class="assumption-item">
              <span class="assumption-label">总缴费年限</span>
              <span class="assumption-value">{{ result.totalContributionYears }} 年</span>
            </div>
          </div>
          <div class="assumptions-note">
            * 假设工资年增长率3%，个人账户年利率3%
          </div>
        </div>
      </div>
    </template>
    
    <!-- 免责声明 -->
    <div class="disclaimer">
      <van-icon name="warning-o" />
      <span>本计算结果基于当前政策和假设条件推算，仅供参考。实际养老金待遇以社保部门核定为准。</span>
    </div>
  </div>
</template>

<style scoped>
.calculator-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 80px;
}

.page-header {
  background: linear-gradient(135deg, #1989fa 0%, #4a9ff5 100%);
  padding: 24px 16px;
  color: white;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.desc {
  font-size: 14px;
  opacity: 0.9;
}

.not-logged {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  margin: 16px;
  border-radius: 12px;
}

.not-logged p {
  color: #969799;
  margin: 16px 0;
}

.info-card {
  background: white;
  margin: -16px 16px 16px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.card-header h3 {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}

.info-label {
  font-size: 12px;
  color: #969799;
}

.info-value {
  font-size: 15px;
  color: #323233;
  font-weight: 500;
}

.preview-card {
  background: white;
  margin: 0 16px 16px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.preview-title {
  font-size: 15px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 12px;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.preview-label {
  font-size: 13px;
  color: #969799;
}

.preview-value {
  font-size: 14px;
  color: #323233;
  font-weight: 500;
}

.preview-value.highlight {
  color: #1989fa;
  font-weight: bold;
}

.calc-button {
  padding: 0 16px 16px;
}

.result-card {
  background: white;
  margin: 0 16px 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.result-header h3 {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
}

.retire-tag {
  font-size: 12px;
  color: #1989fa;
  background: #e8f4fd;
  padding: 4px 8px;
  border-radius: 4px;
}

.result-total {
  background: linear-gradient(135deg, #1989fa 0%, #4a9ff5 100%);
  padding: 24px;
  text-align: center;
  color: white;
}

.total-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.total-amount {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.total-amount .currency {
  font-size: 20px;
}

.total-amount .number {
  font-size: 36px;
  font-weight: bold;
}

.total-amount .unit {
  font-size: 14px;
  opacity: 0.9;
}

.total-date {
  font-size: 13px;
  opacity: 0.8;
  margin-top: 8px;
}

.result-detail {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.detail-item {
  background: #f7f8fa;
  padding: 12px;
  border-radius: 8px;
}

.detail-label {
  font-size: 12px;
  color: #969799;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 18px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 4px;
}

.detail-formula {
  font-size: 11px;
  color: #969799;
  line-height: 1.4;
}

.result-chart {
  padding: 0 16px 16px;
}

.chart-bar {
  display: flex;
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;
}

.chart-bar .bar {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  min-width: 40px;
  transition: width 0.3s;
}

.chart-bar .bar.basic {
  background: #1989fa;
}

.chart-bar .bar.personal {
  background: #ff976a;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #646566;
}

.legend-item .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-item .dot.basic {
  background: #1989fa;
}

.legend-item .dot.personal {
  background: #ff976a;
}

.result-assumptions {
  margin: 0 16px 16px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 8px;
}

.assumptions-title {
  font-size: 14px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 12px;
}

.assumptions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.assumption-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.assumption-label {
  color: #969799;
}

.assumption-value {
  color: #323233;
  font-weight: 500;
}

.assumptions-note {
  font-size: 11px;
  color: #969799;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px dashed #ddd;
}

.disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 16px;
  font-size: 12px;
  color: #969799;
  line-height: 1.5;
}
</style>
