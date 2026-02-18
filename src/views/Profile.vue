<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useUserStore } from '@/stores/user'
import { authAPI } from '@/api'

const router = useRouter()
const userStore = useUserStore()

// 表单数据 - 使用 null 表示未加载
const gender = ref(1)
const birthDate = ref('')
const jobType = ref(1)
const locationCode = ref('110000')
const salary = ref('')
const accountBalance = ref('')
const contributionYears = ref('')
const contributionIndex = ref('')

// 弹窗控制
const showGenderPicker = ref(false)
const showDatePicker = ref(false)
const showJobTypePicker = ref(false)
const showLocationPicker = ref(false)
const birthDateValue = ref(['1990', '01', '01'])
const loading = ref(false)

// 选项
const jobTypeOptions = [
  { text: '企业职工', value: 1 },
  { text: '灵活就业人员', value: 2 },
  { text: '公务员', value: 3 },
  { text: '事业单位人员', value: 4 }
]

const locationOptions = [
  { text: '北京市', value: '110000' },
  { text: '上海市', value: '310000' },
  { text: '深圳市', value: '440300' },
  { text: '广州市', value: '440100' },
  { text: '南京市', value: '320100' },
  { text: '苏州市', value: '320500' },
  { text: '杭州市', value: '330100' },
  { text: '郑州市', value: '410100' },
  { text: '长沙市', value: '430100' },
  { text: '武汉市', value: '420100' }
]

const genderText = computed(() => gender.value === 1 ? '男' : '女')
const jobTypeText = computed(() => jobTypeOptions.find(o => o.value === jobType.value)?.text || '请选择')
const locationText = computed(() => locationOptions.find(o => o.value === locationCode.value)?.text || '请选择')
const isLoggedIn = computed(() => userStore.isLoggedIn)
const username = computed(() => userStore.user?.username || '未登录')

// 加载用户档案
onMounted(async () => {
  if (!isLoggedIn.value) return
  try {
    const data = await authAPI.getMe()
    if (data) {
      gender.value = data.gender ?? 1
      birthDate.value = data.birth_date || ''
      jobType.value = data.job_type ?? 1
      locationCode.value = data.location_code || '110000'
      
      // 正确处理 0 值 - 使用 ?? 而不是 ||
      salary.value = data.salary != null ? String(data.salary) : ''
      accountBalance.value = data.account_balance != null ? String(data.account_balance) : ''
      contributionYears.value = data.contribution_years != null ? String(data.contribution_years) : ''
      contributionIndex.value = data.contribution_index != null ? String(data.contribution_index) : ''
      
      if (birthDate.value) {
        birthDateValue.value = birthDate.value.split('-')
      }
      
      console.log('加载的档案数据:', data)
    }
  } catch (err) {
    console.error('加载档案失败:', err)
  }
})

// 保存档案
const saveProfile = async () => {
  if (!birthDate.value) {
    showToast('请选择出生日期')
    return
  }
  
  loading.value = true
  
  // 准备保存的数据
  const saveData = {
    gender: gender.value,
    birth_date: birthDate.value,
    job_type: jobType.value,
    location_code: locationCode.value,
    salary: parseFloat(salary.value) || 0,
    account_balance: parseFloat(accountBalance.value) || 0,
    contribution_years: parseInt(contributionYears.value) || 0,
    contribution_index: parseFloat(contributionIndex.value) || 1.0
  }
  
  console.log('保存档案数据:', saveData)
  
  try {
    const result = await authAPI.updateProfile(saveData)
    console.log('保存结果:', result)
    showToast('保存成功')
  } catch (err) {
    console.error('保存失败:', err)
    showToast(err.error || '保存失败')
  } finally {
    loading.value = false
  }
}

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

const onConfirmJobType = ({ selectedValues }) => {
  jobType.value = selectedValues[0]
  showJobTypePicker.value = false
}

const onConfirmLocation = ({ selectedValues }) => {
  locationCode.value = selectedValues[0]
  showLocationPicker.value = false
}

// 退出登录
const handleLogout = () => {
  showConfirmDialog({
    title: '确认退出',
    message: '确定要退出登录吗？',
  }).then(() => {
    userStore.logout()
    localStorage.removeItem('token')
    showToast('已退出登录')
  }).catch(() => {})
}

// 注销账号
const handleDeleteAccount = () => {
  showConfirmDialog({
    title: '注销账号',
    message: '注销后将删除所有数据，此操作不可恢复',
    confirmButtonColor: '#f56c6c'
  }).then(async () => {
    try {
      await authAPI.deleteAccount()
      userStore.logout()
      localStorage.removeItem('token')
      showToast('账号已注销')
    } catch (err) {
      showToast('注销失败')
    }
  }).catch(() => {})
}
</script>

<template>
  <div class="profile-page">
    <!-- 用户信息卡片 -->
    <div class="user-header">
      <div class="avatar">
        {{ username.substring(0, 1).toUpperCase() }}
      </div>
      <div class="user-info">
        <div class="username">{{ username }}</div>
        <div class="user-status">
          <van-tag v-if="isLoggedIn" type="primary">已登录</van-tag>
          <van-tag v-else type="default">未登录</van-tag>
        </div>
      </div>
    </div>
    
    <!-- 未登录提示 -->
    <div v-if="!isLoggedIn" class="login-tip-card">
      <p>登录后可使用完整功能</p>
      <van-button type="primary" block @click="router.push('/login')">去登录</van-button>
    </div>
    
    <!-- 已登录显示档案 -->
    <template v-else>
      <!-- 基本信息 -->
      <van-cell-group inset title="基本信息">
        <van-cell title="性别" :value="genderText" is-link @click="showGenderPicker = true" />
        <van-cell title="出生日期" :value="birthDate || '请选择'" is-link @click="showDatePicker = true" />
        <van-cell title="人员身份" :value="jobTypeText" is-link @click="showJobTypePicker = true" />
        <van-cell title="参保地" :value="locationText" is-link @click="showLocationPicker = true" />
      </van-cell-group>
      
      <!-- 附加信息 -->
      <van-cell-group inset title="附加信息">
        <van-field v-model="salary" type="number" label="当前工资" placeholder="税前工资" suffix="元/月" />
        <van-field v-model="accountBalance" type="number" label="账户余额" placeholder="个人账户余额" suffix="元" />
        <van-field v-model="contributionYears" type="number" label="缴费年限" placeholder="已缴费年限" suffix="年" />
        <van-field v-model="contributionIndex" type="number" label="缴费指数" placeholder="0.6-3.0" />
      </van-cell-group>
      
      <!-- 保存按钮 -->
      <div class="save-btn">
        <van-button type="primary" block :loading="loading" @click="saveProfile">保存档案</van-button>
      </div>
    </template>
    
    <!-- 账号操作 -->
    <van-cell-group inset title="账号操作" v-if="isLoggedIn">
      <van-cell title="退出登录" is-link @click="handleLogout" />
      <van-cell title="注销账号" is-link title-style="color: #f56c6c;" @click="handleDeleteAccount" />
    </van-cell-group>
    
    <!-- 选择器弹窗 -->
    <van-popup v-model:show="showGenderPicker" position="bottom" round>
      <van-picker title="选择性别" :columns="[{ text: '男', value: 1 }, { text: '女', value: 2 }]" @confirm="onConfirmGender" @cancel="showGenderPicker = false" />
    </van-popup>
    
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker v-model="birthDateValue" title="选择出生日期" :min-date="new Date(1940, 0, 1)" :max-date="new Date(2010, 11, 31)" @confirm="onConfirmDate" @cancel="showDatePicker = false" />
    </van-popup>
    
    <van-popup v-model:show="showJobTypePicker" position="bottom" round>
      <van-picker title="选择人员身份" :columns="jobTypeOptions" @confirm="onConfirmJobType" @cancel="showJobTypePicker = false" />
    </van-popup>
    
    <van-popup v-model:show="showLocationPicker" position="bottom" round>
      <van-picker title="选择参保地" :columns="locationOptions" @confirm="onConfirmLocation" @cancel="showLocationPicker = false" />
    </van-popup>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 16px;
  padding-bottom: 80px;
  min-height: 100vh;
  background: #f7f8fa;
}

.user-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  color: white;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  margin-right: 16px;
}

.username {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 4px;
}

.login-tip-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 16px;
}

.login-tip-card p {
  color: #969799;
  margin-bottom: 16px;
}

.save-btn {
  padding: 16px;
}

:deep(.van-cell-group--inset) {
  margin: 0 0 16px;
}
</style>
