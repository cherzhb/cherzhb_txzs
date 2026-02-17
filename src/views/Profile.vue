<script setup>
import { ref, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()

const profile = ref({ ...userStore.profile })

// 性别选择
const showGenderPicker = ref(false)

// 出生日期选择
const showDatePicker = ref(false)
const birthDateValue = ref([])

// 人员身份选择
const showJobTypePicker = ref(false)

// 参保地选择
const showLocationPicker = ref(false)
const locationValue = ref('')

// 人员身份选项
const jobTypeOptions = [
  { text: '企业职工', value: 1 },
  { text: '灵活就业人员', value: 2 },
  { text: '公务员', value: 3 },
  { text: '事业单位人员', value: 4 }
]

// 参保地选项
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

const jobTypeText = ref('')
const locationText = ref('')

onMounted(() => {
  // 初始化表单
  profile.value = { ...userStore.profile }
  birthDateValue.value = profile.value.birthDate ? profile.value.birthDate.split('-').map(Number) : []
  locationValue.value = profile.value.locationCode || ''
  
  // 设置显示值
  const jobType = jobTypeOptions.find(o => o.value === profile.value.jobType)
  jobTypeText.value = jobType ? jobType.text : '请选择'
  
  const location = locationOptions.find(o => o.value === profile.value.locationCode)
  locationText.value = location ? location.text : '请选择'
})

// 保存档案
const saveProfile = async () => {
  if (!profile.value.birthDate) {
    showToast('请选择出生日期')
    return
  }
  
  // 更新用户档案
  userStore.updateProfile({
    ...profile.value,
    isVerified: true
  })
  
  showToast('档案已更新')
  
  setTimeout(() => {
    router.back()
  }, 1000)
}

// 确认性别
const onConfirmGender = ({ selectedOptions }) => {
  profile.value.gender = selectedOptions[0].value
  showGenderPicker.value = false
}

// 确认出生日期
const onConfirmDate = (value) => {
  birthDateValue.value = value
  profile.value.birthDate = value.join('-')
  showDatePicker.value = false
}

// 确认人员身份
const onConfirmJobType = ({ selectedOptions }) => {
  profile.value.jobType = selectedOptions[0].value
  jobTypeText.value = selectedOptions[0].text
  showJobTypePicker.value = false
}

// 确认参保地
const onConfirmLocation = ({ selectedOptions }) => {
  profile.value.locationCode = selectedOptions[0].value
  locationText.value = selectedOptions[0].text
  showLocationPicker.value = false
}

// 退出登录
const handleLogout = () => {
  showConfirmDialog({
    title: '确认退出',
    message: '退出登录后将无法使用计算功能',
    confirmButtonText: '退出',
    confirmButtonColor: '#f56c6c'
  }).then(() => {
    userStore.logout()
    showToast('已退出登录')
    router.push('/')
  }).catch(() => {
    // 取消退出
  })
}

// 注销账号
const handleDeleteAccount = () => {
  showConfirmDialog({
    title: '注销账号',
    message: '注销后将删除所有数据，此操作不可恢复',
    confirmButtonText: '确认注销',
    confirmButtonColor: '#f56c6c'
  }).then(() => {
    userStore.logout()
    localStorage.clear()
    showToast('账号已注销')
    router.push('/')
  }).catch(() => {
    // 取消注销
  })
}
</script>

<template>
  <div class="profile-page">
    <div class="page-header">
      <h1 class="title">个人档案</h1>
      <p class="desc">完善档案以便准确计算</p>
    </div>

    <!-- 基本信息 -->
    <div class="form-section">
      <h2 class="section-title">基本信息</h2>
      
      <van-field
        label="性别"
        :value="profile.gender === 1 ? '男' : '女'"
        is-link
        readonly
        @click="showGenderPicker = true"
      />
      <van-popup v-model:show="showGenderPicker" position="bottom">
        <van-picker
          :columns="[{text: '男', value: 1}, {text: '女', value: 2}]"
          title="选择性别"
          @confirm="onConfirmGender"
          @cancel="showGenderPicker = false"
        />
      </van-popup>

      <van-field
        label="出生日期"
        :value="profile.birthDate || '请选择'"
        is-link
        readonly
        @click="showDatePicker = true"
      />
      <van-popup v-model:show="showDatePicker" position="bottom">
        <van-date-picker
          v-model="birthDateValue"
          title="选择出生日期"
          :min-date="new Date(1940, 0, 1)"
          :max-date="new Date(2010, 11, 31)"
          @confirm="(value) => { birthDateValue = value; profile.birthDate = value.join('-'); showDatePicker = false }"
          @cancel="showDatePicker = false"
        />
      </van-popup>

      <van-field
        label="人员身份"
        :value="jobTypeText"
        is-link
        readonly
        @click="showJobTypePicker = true"
      />
      <van-popup v-model:show="showJobTypePicker" position="bottom">
        <van-picker
          :columns="jobTypeOptions"
          title="选择人员身份"
          @confirm="onConfirmJobType"
          @cancel="showJobTypePicker = false"
        />
      </van-popup>

      <van-field
        label="参保地"
        :value="locationText"
        is-link
        readonly
        @click="showLocationPicker = true"
      />
      <van-popup v-model:show="showLocationPicker" position="bottom">
        <van-picker
          :columns="locationOptions"
          title="选择参保地"
          @confirm="onConfirmLocation"
          @cancel="showLocationPicker = false"
        />
      </van-popup>
    </div>

    <!-- 附加信息 -->
    <div class="form-section">
      <h2 class="section-title">附加信息</h2>
      
      <van-field
        v-model="profile.salary"
        type="number"
        label="当前工资"
        placeholder="请输入当前税前工资"
        suffix="元/月"
      />

      <van-field
        v-model="profile.accountBalance"
        type="number"
        label="个人账户余额"
        placeholder="请输入个人账户余额"
        suffix="元"
      />

      <van-field
        v-model="profile.contributionYears"
        type="number"
        label="已缴费年限"
        placeholder="请输入已缴费年限"
        suffix="年"
      />

      <van-field
        v-model="profile.contributionIndex"
        type="number"
        label="缴费指数"
        placeholder="通常为0.6-3.0"
      />
    </div>

    <!-- 隐私设置 -->
    <div class="form-section">
      <h2 class="section-title">隐私设置</h2>
      
      <van-field name="switch" label="匿名展示数据">
        <template #input>
          <van-switch v-model="profile.isAnonymous" size="20" />
        </template>
      </van-field>
      <div class="tip">开启后将匿名展示计算数据</div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <van-button type="primary" block size="large" @click="saveProfile">
        保存档案
      </van-button>
    </div>

    <!-- 账号操作 -->
    <div class="account-actions">
      <div class="action-item" @click="handleLogout">
        <van-icon name="sign-out" />
        <span>退出登录</span>
      </div>
      <div class="action-item danger" @click="handleDeleteAccount">
        <van-icon name="delete-o" />
        <span>注销账号</span>
      </div>
    </div>

    <!-- 免责说明 -->
    <div class="disclaimer">
      <div class="disclaimer-title">📝 重要说明</div>
      <ul>
        <li>出生日期直接用于计算退休年龄，请确保准确</li>
        <li>个人信息将严格保密，仅用于计算</li>
        <li>计算结果仅供参考，实际以社保部门核定为准</li>
        <li>您可随时修改或删除个人档案</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 16px;
  min-height: 100vh;
  background: #f7f8fa;
}

.page-header {
  text-align: center;
  padding: 20px 0 30px;
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

.form-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #323233;
}

.tip {
  font-size: 12px;
  color: #969799;
  margin-top: -12px;
  padding: 12px 16px 0;
}

.actions {
  margin: 24px 0;
}

.account-actions {
  background: white;
  border-radius: 12px;
  padding: 8px 0;
  margin-bottom: 16px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  font-size: 15px;
  cursor: pointer;
}

.action-item:active {
  background: #f7f8fa;
}

.action-item .van-icon {
  font-size: 20px;
}

.action-item.danger {
  color: #f56c6c;
}

.disclaimer {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
}

.disclaimer-title {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #323233;
}

.disclaimer ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.disclaimer li {
  font-size: 13px;
  color: #646566;
  line-height: 1.8;
  padding-left: 20px;
  position: relative;
}

.disclaimer li::before {
  content: '•';
  position: absolute;
  left: 8px;
  color: #1989fa;
}
</style>
