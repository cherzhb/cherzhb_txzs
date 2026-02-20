<script setup>
import { ref, computed, onMounted, onActivated, nextTick, watch } from 'vue'
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

// 用户信息
const gender = ref(1)
const birthDate = ref('')
const salary = ref(10000)
const accountBalance = ref(0)
const contributionYears = ref(15)
const contributionIndex = ref(1.0)
const locationCode = ref('110000')
const jobType = ref(1)

// 弹窗控制
const showGenderPicker = ref(false)
const showDatePicker = ref(false)
const showSalaryPicker = ref(false)
const showBalancePicker = ref(false)
const showYearsPicker = ref(false)
const showIndexPicker = ref(false)
const showLocationPicker = ref(false)

const birthDateValue = ref(['1990', '01', '01'])

// 退休年龄选项
const yearsOptions = Array.from({ length: 46 }, (_, i) => ({
  text: i + '年',
  value: i
}))

// 缴费指数选项
const indexOptions = Array.from({ length: 20 }, (_, i) => ({
  text: (0.6 + i * 0.1).toFixed(1),
  value: 0.6 + i * 0.1
}))

// 地区选项
const locationOptions = Object.entries(locationSalaries).map(([code, info]) => ({
  text: info.name,
  value: code
}))

// 计算年龄
const age = computed(() => {
  if (!birthDate.value) return 30
  return dayjs().diff(dayjs(birthDate.value), 'year')
})

// 计算退休年龄和月份
const retirementInfo = computed(() => {
  if (gender.value === 1) {
    return { age: 60, months: 139, text: '60岁' }
  }
  if (gender.value === 2) {
    if (jobType.value === 3 || jobType.value === 4) {
      return { age: 55, months: 170, text: '55岁' }
    }
    return { age: 50, months: 195, text: '50岁' }
  }
  return { age: 60, months: 139, text: '60岁' }
})

const yearsToRetire = computed(() => {
  return Math.max(0, retirementInfo.value.age - age.value)
})

const locationInfo = computed(() => {
  return locationSalaries[locationCode.value] || locationSalaries['110000']
})

// ========== 实时计算养老金 ==========
const pensionResult = computed(() => {
  const yearsToRetireVal = yearsToRetire.value
  const currentAvgSalary = locationInfo.value.salary
  const salaryGrowthRate = 0.03
  const futureAvgSalary = currentAvgSalary * Math.pow(1 + salaryGrowthRate, yearsToRetireVal)
  
  const totalContributionYears = contributionYears.value + yearsToRetireVal
  const index = contributionIndex.value
  
  const monthlyDeposit = salary.value * 0.08
  const monthsRemaining = yearsToRetireVal * 12
  const futureAccountBalance = accountBalance.value + monthlyDeposit * monthsRemaining * (1 + 0.03 / 12 * monthsRemaining / 2)

  const months = retirementInfo.value.months
  const basicPension = futureAvgSalary * (1 + index) / 2 * totalContributionYears * 0.01
  const personalPension = futureAccountBalance / months
  const totalPension = basicPension + personalPension

  return {
    basicPension: Math.round(basicPension),
    personalPension: Math.round(personalPension),
    totalPension: Math.round(totalPension),
    basicPensionPercent: totalPension > 0 ? Math.round((basicPension / totalPension) * 100) : 0
  }
})

// 加载用户档案
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
      salary.value = data.salary || 10000
      accountBalance.value = data.account_balance || 0
      contributionYears.value = data.contribution_years || 15
      contributionIndex.value = data.contribution_index || 1.0
      locationCode.value = data.location_code || '110000'
      jobType.value = data.job_type || 1
    }
  } catch (err) {
    console.error('加载档案失败:', err)
  }
}

onMounted(() => {
  loadUserProfile()
  nextTick(() => {
    const items = document.querySelectorAll('.stagger')
    items.forEach((item, i) => {
      setTimeout(() => {
        item.classList.add('animate')
      }, i * 80)
    })
  })
})

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

const onConfirmYears = ({ selectedValues }) => {
  contributionYears.value = selectedValues[0]
  showYearsPicker.value = false
}

const onConfirmIndex = ({ selectedValues }) => {
  contributionIndex.value = selectedValues[0]
  showIndexPicker.value = false
}

const onConfirmLocation = ({ selectedValues }) => {
  locationCode.value = selectedValues[0]
  showLocationPicker.value = false
}

// 工资输入
const salaryInput = ref(String(salary.value))
const onConfirmSalary = () => {
  const val = parseInt(salaryInput.value) || 0
  salary.value = Math.max(0, val)
  showSalaryPicker.value = false
}

// 账户余额输入
const balanceInput = ref(String(accountBalance.value))
const onConfirmBalance = () => {
  const val = parseInt(balanceInput.value) || 0
  accountBalance.value = Math.max(0, val)
  showBalancePicker.value = false
}

const formatMoney = (num) => {
  return new Intl.NumberFormat('zh-CN').format(Math.round(num))
}

const genderText = computed(() => gender.value === 1 ? '男' : '女')
</script>

<template>
  <div class="calculator-page">
    <div class="page-container">
      <!-- Header -->
      <div class="header-section stagger">
        <h1 class="page-title">养老金测算 <span class="page-subtitle-inline">根据您的情况预估退休金</span></h1>
      </div>

      <!-- 未登录提示 -->
      <div v-if="!userStore.isLoggedIn" class="not-logged stagger">
        <div class="glass-card login-card">
          <div class="login-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--fg-muted);">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <p class="login-text">请先登录查看您的退休工资预测</p>
          <button class="btn-primary" @click="$router.push('/login')">去登录</button>
        </div>
      </div>

      <!-- 已登录：直接显示结果 -->
      <template v-else>
        <!-- Result Card - 预计每月可领取 -->
        <div class="result-section stagger">
          <div class="glass-card result-card glow">
            <div class="result-header">
              <p class="result-label">预计每月可领取</p>
              <div class="result-amount">
                <span class="currency">¥</span>
                <span class="number">{{ formatMoney(pensionResult.totalPension) }}</span>
              </div>
            </div>
            
            <!-- 养老金构成 -->
            <div class="pension-breakdown">
              <div class="breakdown-boxes">
                <div class="breakdown-box basic">
                  <span class="box-label">基础养老金</span>
                  <span class="box-value">¥{{ formatMoney(pensionResult.basicPension) }}</span>
                </div>
                <div class="breakdown-box personal">
                  <span class="box-label">个人账户养老金</span>
                  <span class="box-value">¥{{ formatMoney(pensionResult.personalPension) }}</span>
                </div>
              </div>
              <div class="progress-bar-wrap">
                <div class="progress-bar">
                  <div class="progress-basic" :style="{ width: pensionResult.basicPensionPercent + '%' }"></div>
                  <div class="progress-personal" :style="{ width: (100 - pensionResult.basicPensionPercent) + '%' }"></div>
                </div>
                <div class="progress-labels">
                  <span class="progress-label"><span class="dot basic"></span>基础养老金 {{ pensionResult.basicPensionPercent }}%</span>
                  <span class="progress-label"><span class="dot personal"></span>个人账户 {{ 100 - pensionResult.basicPensionPercent }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Parameters 测算参数（可修改） -->
        <div class="params-section stagger">
          <div class="glass-card">
            <h3 class="section-title">测算参数</h3>
            <div class="params-grid">
              <div class="param-item" @click="showGenderPicker = true">
                <span class="param-label">性别</span>
                <div class="param-value-wrap">
                  <span class="param-value">{{ genderText }}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B949E" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
              <div class="param-item" @click="showDatePicker = true">
                <span class="param-label">出生日期</span>
                <div class="param-value-wrap">
                  <span class="param-value">{{ birthDate || '请选择' }}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B949E" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
              <div class="param-item" @click="showLocationPicker = true">
                <span class="param-label">参保地</span>
                <div class="param-value-wrap">
                  <span class="param-value">{{ locationInfo.name }}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B949E" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
              <div class="param-item" @click="showYearsPicker = true">
                <span class="param-label">缴费年限</span>
                <div class="param-value-wrap">
                  <span class="param-value">{{ contributionYears }}年</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B949E" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
              <div class="param-item" @click="showSalaryPicker = true">
                <span class="param-label">月工资</span>
                <div class="param-value-wrap">
                  <span class="param-value">¥{{ formatMoney(salary) }}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B949E" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
              <div class="param-item" @click="showBalancePicker = true">
                <span class="param-label">账户余额</span>
                <div class="param-value-wrap">
                  <span class="param-value">¥{{ formatMoney(accountBalance) }}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B949E" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
              <div class="param-item" @click="showIndexPicker = true">
                <span class="param-label">缴费指数</span>
                <div class="param-value-wrap">
                  <span class="param-value">{{ contributionIndex.toFixed(1) }}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B949E" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Assumptions Note 测算假设 -->
        <div class="assumptions stagger">
          <div class="glass-card">
            <div class="assumption-title">💡 测算假设</div>
            <div class="assumption-notes">
              * 假设工资年增长率3%，个人账户年利率3%<br>
              * 基础养老金 = 月社平工资 × (1 + 缴费指数) / 2 × 缴费年限 × 1%<br>
              * 个人账户养老金 = 账户余额 ÷ 计发月数（{{ retirementInfo.months }}个月）
            </div>
          </div>
        </div>
      </template>

      <!-- Disclaimer -->
      <div class="disclaimer stagger">
        <div class="glass-card disclaimer-card">
          <div class="disclaimer-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #F78166;">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div class="disclaimer-text">
            本计算结果基于当前政策和假设条件推算，仅供参考。实际养老金待遇以社保部门核定为准。
          </div>
        </div>
      </div>
    </div>

    <!-- 选择器弹窗 -->
    <van-popup v-model:show="showGenderPicker" position="bottom" round>
      <van-picker title="选择性别" :columns="[{ text: '男', value: 1 }, { text: '女', value: 2 }]" @confirm="onConfirmGender" @cancel="showGenderPicker = false" />
    </van-popup>
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker v-model="birthDateValue" title="选择出生日期" :min-date="new Date(1940, 0, 1)" :max-date="new Date(2010, 11, 31)" @confirm="onConfirmDate" @cancel="showDatePicker = false" />
    </van-popup>
    <van-popup v-model:show="showLocationPicker" position="bottom" round>
      <van-picker title="选择参保地" :columns="locationOptions" @confirm="onConfirmLocation" @cancel="showLocationPicker = false" />
    </van-popup>
    <van-popup v-model:show="showYearsPicker" position="bottom" round>
      <van-picker title="选择缴费年限" :columns="yearsOptions" @confirm="onConfirmYears" @cancel="showYearsPicker = false" />
    </van-popup>
    <van-popup v-model:show="showIndexPicker" position="bottom" round>
      <van-picker title="选择缴费指数" :columns="indexOptions" @confirm="onConfirmIndex" @cancel="showIndexPicker = false" />
    </van-popup>
    <!-- 工资输入弹窗 -->
    <van-popup v-model:show="showSalaryPicker" position="bottom" round>
      <div class="input-popup">
        <div class="popup-header">
          <span class="popup-cancel" @click="showSalaryPicker = false">取消</span>
          <span class="popup-title">输入月工资</span>
          <span class="popup-confirm" @click="onConfirmSalary">确定</span>
        </div>
        <div class="popup-content">
          <van-field v-model="salaryInput" type="number" placeholder="请输入月工资金额" />
        </div>
      </div>
    </van-popup>
    <!-- 账户余额输入弹窗 -->
    <van-popup v-model:show="showBalancePicker" position="bottom" round>
      <div class="input-popup">
        <div class="popup-header">
          <span class="popup-cancel" @click="showBalancePicker = false">取消</span>
          <span class="popup-title">输入账户余额</span>
          <span class="popup-confirm" @click="onConfirmBalance">确定</span>
        </div>
        <div class="popup-content">
          <van-field v-model="balanceInput" type="number" placeholder="请输入个人账户余额" />
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.calculator-page {
  min-height: 100vh;
  padding-bottom: 100px;
}

.page-container {
  padding: 56px 24px 0;
}

/* Header */
.header-section {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--fg);
}

.page-subtitle-inline {
  font-size: 14px;
  font-weight: 400;
  color: var(--fg-muted);
  margin-left: 8px;
}

/* Not Logged */
.not-logged {
  margin-bottom: 24px;
}

.login-card {
  padding: 32px 24px;
  text-align: center;
}

.login-icon {
  margin-bottom: 16px;
}

.login-text {
  color: var(--fg-muted);
  margin-bottom: 24px;
  font-size: 14px;
}

/* Result Section */
.result-section {
  margin-bottom: 24px;
}

.result-card {
  padding: 20px;
}

.result-header {
  margin-bottom: 20px;
}

.result-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--fg-muted);
  margin-bottom: 8px;
}

.result-amount {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.result-amount .currency {
  font-size: 20px;
  font-weight: 600;
  color: var(--fg);
}

.result-amount .number {
  font-size: 40px;
  font-weight: 700;
  color: var(--fg);
  font-family: 'Space Grotesk', 'Helvetica Neue', sans-serif;
}

/* Pension Breakdown */
.pension-breakdown {
  border-top: 1px solid rgba(240, 246, 252, 0.1);
  padding-top: 16px;
}

.breakdown-boxes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.breakdown-box {
  padding: 14px;
  border-radius: 12px;
  text-align: center;
}

.breakdown-box.basic {
  background: rgba(88, 166, 255, 0.1);
  border: 1px solid rgba(88, 166, 255, 0.2);
}

.breakdown-box.personal {
  background: rgba(247, 129, 102, 0.1);
  border: 1px solid rgba(247, 129, 102, 0.2);
}

.box-label {
  display: block;
  font-size: 13px;
  color: var(--fg-muted);
  margin-bottom: 8px;
}

.box-value {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: var(--fg);
}

.progress-bar-wrap {
  margin-top: 12px;
}

.progress-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(240, 246, 252, 0.1);
}

.progress-basic {
  background: #58A6FF;
  transition: width 0.3s ease;
}

.progress-personal {
  background: #F78166;
  transition: width 0.3s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.progress-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--fg-muted);
}

.progress-label .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.progress-label .dot.basic {
  background: #58A6FF;
}

.progress-label .dot.personal {
  background: #F78166;
}

/* Params Section */
.params-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--fg);
  margin-bottom: 16px;
  padding: 20px 20px 0;
}

.params-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 20px 20px;
}

.param-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: rgba(30, 37, 46, 0.9);
  border: 1px solid rgba(240, 246, 252, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.param-item:hover {
  background: rgba(40, 47, 56, 0.9);
  border-color: rgba(88, 166, 255, 0.3);
}

.param-label {
  font-size: 15px;
  color: #8B949E;
}

.param-value-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.param-value {
  font-size: 15px;
  color: #F0F6FC;
  font-weight: 500;
}

/* Assumptions */
.assumptions {
  margin-bottom: 24px;
}

.assumption-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--fg);
  margin-bottom: 12px;
  padding: 20px 20px 0;
}

.assumption-notes {
  padding: 0 20px 20px;
  font-size: 12px;
  color: var(--fg-muted);
  line-height: 1.8;
}

/* Disclaimer */
.disclaimer {
  margin-bottom: 24px;
}

.disclaimer-card {
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.disclaimer-icon {
  flex-shrink: 0;
  padding-top: 2px;
}

.disclaimer-text {
  font-size: 12px;
  color: var(--fg-muted);
  line-height: 1.6;
}

/* Input Popup */
.input-popup {
  background: var(--bg-primary);
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(240, 246, 252, 0.1);
}

.popup-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
}

.popup-cancel {
  font-size: 14px;
  color: var(--fg-muted);
  cursor: pointer;
}

.popup-confirm {
  font-size: 14px;
  color: #58A6FF;
  font-weight: 500;
  cursor: pointer;
}

.popup-content {
  padding: 20px;
}

.popup-content :deep(.van-field) {
  background: rgba(30, 37, 46, 0.9);
  border: 1px solid rgba(240, 246, 252, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
}

.popup-content :deep(.van-field__control) {
  color: var(--fg);
  font-size: 18px;
}
</style>
