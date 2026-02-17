<script setup>
import { ref, computed } from 'vue'
import { showNotify } from 'vant'
import { useUserStore } from '@/stores/user'
import dayjs from 'dayjs'

const userStore = useUserStore()

// 获取参保地名称
const getLocationName = (code) => {
  const locationMap = {
    '110000': '北京',
    '310000': '上海',
    '440300': '深圳',
    '440100': '广州',
    '320100': '南京',
    '410100': '郑州',
    '430100': '长沙',
    '420100': '武汉',
    '330100': '杭州',
    '320500': '苏州'
  }
  return locationMap[code] || '北京'
}

// 社平工资数据（示例）
const averageSalaries = {
  '110000': 11000, // 北京
  '310000': 12000, // 上海
  '440300': 13000, // 深圳
  '440100': 11500, // 广州
  '320100': 11000, // 南京
  '410100': 9500,  // 郑州
  '430100': 10000, // 长沙
  '420100': 9800,  // 武汉
  '330100': 11000, // 杭州
  '320500': 10500  // 苏州
}

// 表单数据
const formData = ref({
  averageSalary: userStore.profile.locationCode ? averageSalaries[userStore.profile.locationCode] : 11000,
  contributionYears: userStore.profile.contributionYears || 30,
  contributionIndex: userStore.profile.contributionIndex || 1.0,
  accountBalance: userStore.profile.accountBalance || 100000
})

// 计算结果
const result = ref(null)
const showResult = ref(false)
const savingPlanName = ref('')

// 退休月份：60岁为139个月，50岁为195个月
const getRetirementMonths = () => {
  const age = userStore.profile.birthDate 
    ? dayjs().diff(userStore.profile.birthDate, 'year') 
    : 60
  
  // 简化的退休月份判断
  if (userStore.profile.gender === 2) {
    // 女
    return userStore.profile.jobType === 1 || userStore.profile.jobType === 3 ? 139 : 195
  }
  return 139 // 男
}

// 计算养老金
const calculate = () => {
  const A = formData.value.averageSalary // 社平工资
  const N = formData.value.contributionYears // 缴费年限
  const I = formData.value.contributionIndex // 缴费指数
  const K = formData.value.accountBalance // 个人账户储存额
  const M = getRetirementMonths() // 计发月数
  
  // 基础养老金 = 社平工资 × (1 + 缴费指数) / 2 × 缴费年限 × 1%
  const basicPension = A * (1 + I) / 2 * N * 0.01
  
  // 个人账户养老金 = 个人账户储存额 / 计发月数
  const personalPension = K / M
  
  // 总养老金
  const totalPension = basicPension + personalPension
  
  result.value = {
    basicPension: Math.round(basicPension),
    personalPension: Math.round(personalPension),
    totalPension: Math.round(totalPension)
  }
  
  showResult.value = true
}

// 格式化金额
const formatMoney = (num) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

// 保存方案
const savePlan = () => {
  if (!savingPlanName.value) {
    showNotify({ type: 'warning', message: '请输入方案名称' })
    return
  }
  
  const plans = JSON.parse(localStorage.getItem('pensionPlans') || '[]')
  plans.push({
    id: Date.now(),
    name: savingPlanName.value,
    params: { ...formData.value },
    result: { ...result.value },
    createdAt: new Date().toISOString()
  })
  
  localStorage.setItem('pensionPlans', JSON.stringify(plans))
  showNotify({ type: 'success', message: '方案已保存' })
  savingPlanName.value = ''
}

// 已保存的方案
const savedPlans = ref([])
const showSavedPlans = ref(false)

const loadSavedPlans = () => {
  savedPlans.value = JSON.parse(localStorage.getItem('pensionPlans') || '[]')
  showSavedPlans.value = true
}

const applyPlan = (plan) => {
  formData.value = { ...plan.params }
  result.value = { ...plan.result }
  showResult.value = true
  showSavedPlans.value = false
  showNotify({ type: 'success', message: '方案已应用' })
}

const deletePlan = (id) => {
  const plans = JSON.parse(localStorage.getItem('pensionPlans') || '[]')
  const updated = plans.filter(p => p.id !== id)
  localStorage.setItem('pensionPlans', JSON.stringify(updated))
  loadSavedPlans()
  showNotify({ type: 'success', message: '方案已删除' })
}
</script>

<template>
  <div class="calculator-page">
    <div class="page-header">
      <h1 class="title">养老金计算器</h1>
      <p class="desc">科学估算您的退休待遇</p>
    </div>

    <!-- 输入表单 -->
    <div class="form-card">
      <h2 class="card-title">参数设置</h2>
      
      <div class="form-section">
        <div class="form-item">
          <div class="label">社平工资（{{ userStore.profile.locationCode ? getLocationName(userStore.profile.locationCode) : '北京' }}）</div>
          <van-slider 
            v-model="formData.averageSalary"
            :min="5000" 
            :max="20000" 
            :step="500"
            active-color="#1989fa"
          />
          <div class="value-display">{{ formatMoney(formData.averageSalary) }} 元</div>
        </div>

        <div class="form-item">
          <div class="label">预计缴费年限</div>
          <van-slider 
            v-model="formData.contributionYears"
            :min="15" 
            :max="45" 
            :step="1"
            active-color="#1989fa"
          />
          <div class="value-display">{{ formData.contributionYears }} 年</div>
        </div>

        <div class="form-item">
          <div class="label">缴费指数</div>
          <van-slider 
            v-model="formData.contributionIndex"
            :min="0.6" 
            :max="3" 
            :step="0.1"
            active-color="#1989fa"
          />
          <div class="value-display">{{ formData.contributionIndex.toFixed(1) }}</div>
        </div>

        <div class="form-item">
          <div class="label">个人账户储存额</div>
          <van-slider 
            v-model="formData.accountBalance"
            :min="0" 
            :max="500000" 
            :step="10000"
            active-color="#1989fa"
          />
          <div class="value-display">{{ formatMoney(formData.accountBalance) }} 元</div>
        </div>
      </div>

      <div class="actions">
        <van-button type="primary" block size="large" @click="calculate">
          开始计算
        </van-button>
        <van-button block @click="loadSavedPlans">
          查看已保存方案
        </van-button>
      </div>
    </div>

    <!-- 计算结果 -->
    <div v-if="showResult" class="result-card">
      <h2 class="card-title">计算结果</h2>
      
      <div class="pension-total">
        <div class="label">预估月领养老金</div>
        <div class="amount">¥{{ formatMoney(result.totalPension) }}</div>
        <div class="unit">元/月</div>
      </div>

      <div class="pension-breakdown">
        <div class="breakdown-item">
          <div class="breakdown-label">基础养老金</div>
          <div class="breakdown-value">¥{{ formatMoney(result.basicPension) }}</div>
          <div class="breakdown-bar">
            <div 
              class="bar-fill" 
              :style="{ width: (result.basicPension / result.totalPension * 100) + '%' }"
            ></div>
          </div>
        </div>
        
        <div class="breakdown-item">
          <div class="breakdown-label">个人账户养老金</div>
          <div class="breakdown-value">¥{{ formatMoney(result.personalPension) }}</div>
          <div class="breakdown-bar">
            <div 
              class="bar-fill personal"
              :style="{ width: (result.personalPension / result.totalPension * 100) + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 保存方案 -->
      <div class="save-plan">
        <van-field
          v-model="savingPlanName"
          label="方案名称"
          placeholder="例如：理想方案"
        />
        <van-button type="primary" block @click="savePlan">
          保存方案
        </van-button>
      </div>
    </div>

    <!-- 调整建议 -->
    <div v-if="showResult" class="tips-card">
      <div class="tips-title">💡 提升建议</div>
      <div class="tip-item">
        <span class="tip-icon">📈</span>
        <div class="tip-content">
          <div class="tip-title">适当提高缴费指数</div>
          <div class="tip-desc">缴费指数每提高0.1，养老金可增加约{{ formatMoney(Math.round(result.totalPension * 0.1)) }}元/月</div>
        </div>
      </div>
      <div class="tip-item">
        <span class="tip-icon">⏰</span>
        <div class="tip-content">
          <div class="tip-title">延长缴费年限</div>
          <div class="tip-desc">每多缴1年，基础养老金可增加约{{ formatMoney(Math.round(result.totalPension / formData.contributionYears)) }}元/月</div>
        </div>
      </div>
    </div>

    <!-- 免责声明 -->
    <div class="disclaimer">
      ⚠️ 本计算结果仅供参考，实际养老金待遇以社保部门核定为准。不同地区政策可能存在差异。
    </div>

    <!-- 已保存方案弹窗 -->
    <van-popup v-model:show="showSavedPlans" position="bottom" :style="{ height: '70%' }">
      <div class="saved-plans-popup">
        <div class="popup-header">
          <h3>已保存方案</h3>
          <van-icon name="cross" @click="showSavedPlans = false" />
        </div>
        <div class="plan-list">
          <div v-for="plan in savedPlans" :key="plan.id" class="plan-item">
            <div class="plan-name">{{ plan.name }}</div>
            <div class="plan-result">
              <span>¥{{ formatMoney(plan.result.totalPension) }}</span>
              <span class="plan-date">{{ dayjs(plan.createdAt).format('MM-DD') }}</span>
            </div>
            <div class="plan-actions">
              <van-button size="small" type="primary" @click="applyPlan(plan)">应用</van-button>
              <van-button size="small" @click="deletePlan(plan.id)">删除</van-button>
            </div>
          </div>
        </div>
        <div v-if="savedPlans.length === 0" class="empty-tip">
          暂无保存的方案
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.calculator-page {
  padding: 16px;
  min-height: 100vh;
  background: #f7f8fa;
}

.page-header {
  text-align: center;
  padding: 20px 0;
}

.title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.desc {
  font-size: 14px;
  color: #969799;
}

.form-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #323233;
}

.form-section {
  margin-bottom: 24px;
}

.form-item {
  margin-bottom: 24px;
}

.label {
  font-size: 15px;
  color: #323233;
  margin-bottom: 12px;
  font-weight: 500;
}

.value-display {
  text-align: right;
  font-size: 20px;
  color: #1989fa;
  font-weight: bold;
  margin-top: 8px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.pension-total {
  text-align: center;
  padding: 30px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 24px;
}

.pension-total .label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.amount {
  font-size: 36px;
  font-weight: bold;
  color: white;
  margin: 10px 0;
}

.unit {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.pension-breakdown {
  margin-bottom: 24px;
}

.breakdown-item {
  margin-bottom: 20px;
}

.breakdown-label {
  font-size: 14px;
  color: #646566;
  margin-bottom: 8px;
}

.breakdown-value {
  font-size: 20px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 8px;
}

.breakdown-bar {
  height: 8px;
  background: #f7f8fa;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #1989fa;
  border-radius: 4px;
  transition: width 0.3s;
}

.bar-fill.personal {
  background: #ff976a;
}

.save-plan {
  padding: 16px;
  background: #f7f8fa;
  border-radius: 8px;
}

.tips-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.tips-title {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #323233;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.tip-item:last-child {
  border-bottom: none;
}

.tip-icon {
  font-size: 24px;
}

.tip-title {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 4px;
}

.tip-desc {
  font-size: 13px;
  color: #969799;
  line-height: 1.5;
}

.disclaimer {
  font-size: 12px;
  color: #969799;
  text-align: center;
  line-height: 1.6;
  padding: 16px;
}

.saved-plans-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.popup-header h3 {
  font-size: 18px;
  font-weight: bold;
}

.plan-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.plan-item {
  background: white;
  border: 1px solid #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.plan-name {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 8px;
}

.plan-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 18px;
  color: #1989fa;
  font-weight: bold;
}

.plan-date {
  font-size: 12px;
  color: #969799;
}

.plan-actions {
  display: flex;
  gap: 8px;
}

.empty-tip {
  text-align: center;
  color: #969799;
  padding: 40px 0;
  font-size: 14px;
}
</style>
