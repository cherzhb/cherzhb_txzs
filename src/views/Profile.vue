<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog, showDialog, showLoadingToast, closeToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { authAPI } from '@/api'

const router = useRouter()
const userStore = useUserStore()

// APP版本
const APP_VERSION = '1.0.2'
const APP_VERSION_CODE = 10002

// 检查更新
const checkForUpdate = async () => {
    try {
        showLoadingToast({
            message: '检查中...',
            forbidClick: true,
            duration: 0
        })
        
        const res = await fetch(
            `https://api.19780918.xyz/api/app/version?platform=android&versionCode=${APP_VERSION_CODE}`
        )
        const data = await res.json()
        
        closeToast()
        
        if (data.hasUpdate) {
            if (data.forceUpdate) {
                showDialog({
                    title: '发现新版本',
                    message: `V${data.latestVersion}\n\n${data.updateContent || '有新版本可用'}`,
                    confirmButtonText: '立即更新',
                    showCancelButton: false,
                    closeOnClickOverlay: false
                }).then(() => {
                    window.open(data.updateUrl, '_blank')
                })
            } else {
                showConfirmDialog({
                    title: '发现新版本',
                    message: `V${data.latestVersion}\n\n${data.updateContent || '有新版本可用'}`,
                    confirmButtonText: '立即更新',
                    cancelButtonText: '稍后再说'
                }).then(() => {
                    window.open(data.updateUrl, '_blank')
                }).catch(() => {})
            }
        } else {
            showDialog({
                title: '检查更新',
                message: '当前已是最新版本',
                confirmButtonText: '确定'
            })
        }
    } catch (err) {
        closeToast()
        showToast('检查更新失败，请稍后再试')
    }
}

// 编辑模式
const isEditing = ref(false)

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
const userInitial = computed(() => username.value.charAt(0).toUpperCase() || 'U')

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
            salary.value = data.salary != null ? String(data.salary) : ''
            accountBalance.value = data.account_balance != null ? String(data.account_balance) : ''
            contributionYears.value = data.contribution_years != null ? String(data.contribution_years) : ''
            contributionIndex.value = data.contribution_index != null ? String(data.contribution_index) : ''

            if (birthDate.value) {
                birthDateValue.value = birthDate.value.split('-')
            }
        }
    } catch (err) {
        console.error('加载档案失败:', err)
    }
})

// 进入编辑模式
const enterEditMode = () => {
    isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
    isEditing.value = false
    // 重新加载数据恢复原值
    loadProfile()
}

// 重新加载档案
const loadProfile = async () => {
    try {
        const data = await authAPI.getMe()
        if (data) {
            gender.value = data.gender ?? 1
            birthDate.value = data.birth_date || ''
            jobType.value = data.job_type ?? 1
            locationCode.value = data.location_code || '110000'
            salary.value = data.salary != null ? String(data.salary) : ''
            accountBalance.value = data.account_balance != null ? String(data.account_balance) : ''
            contributionYears.value = data.contribution_years != null ? String(data.contribution_years) : ''
            contributionIndex.value = data.contribution_index != null ? String(data.contribution_index) : ''

            if (birthDate.value) {
                birthDateValue.value = birthDate.value.split('-')
            }
        }
    } catch (err) {
        console.error('加载档案失败:', err)
    }
}

// 保存档案
const saveProfile = async () => {
    if (!birthDate.value) {
        showToast('请选择出生日期')
        return
    }

    loading.value = true

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

    try {
        await authAPI.updateProfile(saveData)
        showToast('保存成功')
        isEditing.value = false
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

// 密码修改
const showPasswordModal = ref(false)
const passwordForm = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})
const passwordLoading = ref(false)
const passwordError = ref('')

const openPasswordModal = () => {
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
    passwordError.value = ''
    showPasswordModal.value = true
}

const handleChangePassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordForm.value
    
    if (!oldPassword) {
        passwordError.value = '请输入原密码'
        return
    }
    if (!newPassword || newPassword.length < 6) {
        passwordError.value = '新密码至少6位'
        return
    }
    if (newPassword !== confirmPassword) {
        passwordError.value = '两次密码不一致'
        return
    }
    
    passwordLoading.value = true
    passwordError.value = ''
    
    try {
        await authAPI.changePassword({ oldPassword, newPassword })
        showToast('密码修改成功')
        showPasswordModal.value = false
    } catch (err) {
        passwordError.value = err.error || '修改失败'
    } finally {
        passwordLoading.value = false
    }
}
</script>

<template>
    <div class="profile-page">
        <div class="page-container">
            <!-- Header -->
            <div class="header-section">
                <h1 class="page-title">个人档案</h1>
            </div>

            <!-- 用户信息卡片 -->
            <div class="user-card glass-card">
                <div class="user-avatar">
                    <span class="avatar-text">{{ userInitial }}</span>
                    <div class="avatar-status"></div>
                </div>
                <div class="user-info">
                    <div class="username">{{ username }}</div>
                    <span class="chip chip-primary">{{ isLoggedIn ? '已登录' : '未登录' }}</span>
                </div>
            </div>

            <!-- 未登录提示 -->
            <div v-if="!isLoggedIn" class="login-tip-card glass-card">
                <p class="tip-text">登录后可使用完整功能</p>
                <button class="btn-primary" @click="router.push('/login')">去登录</button>
            </div>

            <!-- 已登录显示档案 -->
            <template v-else>
                <!-- 基本信息 -->
                <div class="section-title">
                    基本信息
                    <button v-if="!isEditing" class="edit-btn" @click="enterEditMode">修改</button>
                </div>

                <!-- 只读模式 -->
                <div v-if="!isEditing" class="glass-card">
                    <div class="info-rows">
                        <div class="info-row">
                            <span class="row-label">性别</span>
                            <span class="row-value">{{ genderText }}</span>
                        </div>
                        <div class="info-row">
                            <span class="row-label">出生日期</span>
                            <span class="row-value">{{ birthDate || '-' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="row-label">人员身份</span>
                            <span class="row-value">{{ jobTypeText }}</span>
                        </div>
                        <div class="info-row">
                            <span class="row-label">参保地</span>
                            <span class="row-value">{{ locationText }}</span>
                        </div>
                    </div>
                </div>

                <!-- 编辑模式 -->
                <div v-else class="glass-card">
                    <div class="info-rows">
                        <div class="info-row editable" @click="showGenderPicker = true">
                            <span class="row-label">性别</span>
                            <span class="row-value">{{ genderText }} ›</span>
                        </div>
                        <div class="info-row editable" @click="showDatePicker = true">
                            <span class="row-label">出生日期</span>
                            <span class="row-value">{{ birthDate || '请选择' }} ›</span>
                        </div>
                        <div class="info-row editable" @click="showJobTypePicker = true">
                            <span class="row-label">人员身份</span>
                            <span class="row-value">{{ jobTypeText }} ›</span>
                        </div>
                        <div class="info-row editable" @click="showLocationPicker = true">
                            <span class="row-label">参保地</span>
                            <span class="row-value">{{ locationText }} ›</span>
                        </div>
                    </div>
                </div>

                <!-- 附加信息 -->
                <div class="section-title">附加信息</div>
                <div class="glass-card">
                    <!-- 只读模式 -->
                    <div v-if="!isEditing" class="info-rows">
                        <div class="info-row">
                            <span class="row-label">当前工资</span>
                            <span class="row-value">{{ salary ? salary + ' 元/月' : '-' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="row-label">账户余额</span>
                            <span class="row-value">{{ accountBalance ? accountBalance + ' 元' : '-' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="row-label">缴费年限</span>
                            <span class="row-value">{{ contributionYears ? contributionYears + ' 年' : '-' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="row-label">缴费指数</span>
                            <span class="row-value">{{ contributionIndex || '-' }}</span>
                        </div>
                    </div>
                    <!-- 编辑模式 -->
                    <div v-else>
                        <van-field v-model="salary" type="number" label="当前工资" placeholder="税前工资" suffix="元/月" />
                        <van-field v-model="accountBalance" type="number" label="账户余额" placeholder="个人账户余额" suffix="元" />
                        <van-field v-model="contributionYears" type="number" label="缴费年限" placeholder="已缴费年限" suffix="年" />
                        <van-field v-model="contributionIndex" type="number" label="缴费指数" placeholder="0.6-3.0" />
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div v-if="isEditing" class="action-buttons">
                    <button class="btn-secondary" @click="cancelEdit">取消</button>
                    <button class="btn-primary" :loading="loading" @click="saveProfile">保存档案</button>
                </div>
            </template>

            <!-- 账号操作 -->
            <div v-if="isLoggedIn && !isEditing" class="section-title">账号操作</div>
            <div v-if="isLoggedIn && !isEditing" class="glass-card action-card">
                <div class="action-item clickable" @click="openPasswordModal">
                    <div class="action-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <span class="action-label">修改密码</span>
                </div>
                <div class="divider-line"></div>
                <div class="action-item clickable" @click="handleLogout">
                    <div class="action-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    </div>
                    <span class="action-label">退出登录</span>
                </div>
                <div class="divider-line"></div>
                <div class="action-item clickable" @click="handleDeleteAccount">
                    <div class="action-icon danger">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </div>
                    <span class="action-label danger">注销账号</span>
                </div>
            </div>

            <!-- 法律信息 -->
            <div v-if="isLoggedIn && !isEditing" class="legal-links">
                <a @click="$router.push('/agreement')">《用户协议》</a>
                <span>|</span>
                <a @click="$router.push('/privacy')">《隐私政策》</a>
            </div>

            <!-- 版本信息 -->
            <div class="version-info">
                <p>退休规划助手</p>
                <p class="version">V1.0.2</p>
                <p class="check-update" @click="checkForUpdate">检查更新</p>
            </div>

            <!-- 密码修改弹窗 -->
            <van-popup v-model:show="showPasswordModal" position="bottom" round teleport="body" :style="{ zIndex: 3000 }">
                <div class="password-modal">
                    <div class="modal-header">
                        <h3>修改密码</h3>
                        <van-icon name="cross" @click="showPasswordModal = false" />
                    </div>
                    <div class="modal-body">
                        <van-field v-model="passwordForm.oldPassword" type="password" label="原密码" placeholder="请输入原密码" />
                        <van-field v-model="passwordForm.newPassword" type="password" label="新密码" placeholder="请输入新密码(至少6位)" />
                        <van-field v-model="passwordForm.confirmPassword" type="password" label="确认密码" placeholder="请再次输入新密码" />
                        <p v-if="passwordError" class="password-error">{{ passwordError }}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" @click="showPasswordModal = false">取消</button>
                        <button class="btn-primary" :loading="passwordLoading" @click="handleChangePassword">确认修改</button>
                    </div>
                </div>
            </van-popup>

            <!-- 选择器弹窗 -->
            <van-popup v-model:show="showGenderPicker" position="bottom" round teleport="body" :style="{ zIndex: 3000 }">
                <van-picker title="选择性别" :columns="[{ text: '男', value: 1 }, { text: '女', value: 2 }]" @confirm="onConfirmGender" @cancel="showGenderPicker = false" />
            </van-popup>
            <van-popup v-model:show="showDatePicker" position="bottom" round teleport="body" :style="{ zIndex: 3000 }">
                <van-date-picker v-model="birthDateValue" title="选择出生日期" :min-date="new Date(1940, 0, 1)" :max-date="new Date(2010, 11, 31)" @confirm="onConfirmDate" @cancel="showDatePicker = false" />
            </van-popup>
            <van-popup v-model:show="showJobTypePicker" position="bottom" round teleport="body" :style="{ zIndex: 3000 }">
                <van-picker title="选择人员身份" :columns="jobTypeOptions" @confirm="onConfirmJobType" @cancel="showJobTypePicker = false" />
            </van-popup>
            <van-popup v-model:show="showLocationPicker" position="bottom" round teleport="body" :style="{ zIndex: 3000 }">
                <van-picker title="选择参保地" :columns="locationOptions" @confirm="onConfirmLocation" @cancel="showLocationPicker = false" />
            </van-popup>
        </div>
    </div>
</template>

<style scoped>
.profile-page {
    min-height: 100vh;
    padding-bottom: 100px;
    position: relative;
    z-index: 1;
}

.page-container {
    padding: 56px 20px 0;
}

/* Header */
.header-section {
    margin-bottom: 24px;
    padding: 0 4px;
}

.page-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--fg);
}

/* User Card */
.user-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    margin-bottom: 24px;
}

.user-avatar {
    position: relative;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
}

.avatar-text {
    color: white;
    font-weight: 600;
    font-size: 20px;
}

.avatar-status {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--success);
    border: 2px solid var(--bg-secondary);
}

.user-info {
    flex: 1;
}

.username {
    font-size: 20px;
    font-weight: 600;
    color: var(--fg);
    margin-bottom: 8px;
}

/* Login Tip Card */
.login-tip-card {
    padding: 32px 24px;
    text-align: center;
    margin-bottom: 24px;
}

.tip-text {
    color: var(--fg-muted);
    margin-bottom: 24px;
    font-size: 14px;
}

/* Section Title */
.section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--fg);
    margin-bottom: 12px;
    padding: 0 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.edit-btn {
    font-size: 14px;
    font-weight: 500;
    color: var(--accent-primary);
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
}

/* Info Rows */
.info-rows {
    padding: 0 20px;
}

.info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 0;
    border-bottom: 1px solid var(--border);
}

.info-row:last-child {
    border-bottom: none;
}

.info-row.editable {
    cursor: pointer;
}

.info-row.editable:hover {
    background: rgba(240, 246, 252, 0.02);
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

/* Van Field */
:deep(.van-cell) {
    padding: 14px 20px;
    background: transparent;
    color: var(--fg);
}

:deep(.van-cell__value) {
    color: var(--fg);
}

:deep(.van-field__control) {
    color: var(--fg);
}

/* Action Buttons */
.action-buttons {
    display: flex;
    gap: 12px;
    padding: 24px 4px;
}

.action-buttons .btn-primary {
    flex: 1;
}

.action-buttons .btn-secondary {
    flex: 1;
    background: rgba(240, 246, 252, 0.05);
    color: var(--fg-muted);
    border: 1px solid var(--border);
}

/* Action Card */
.action-card {
    margin-bottom: 24px;
}

.action-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    cursor: pointer;
    transition: background 0.3s;
}

.action-item:first-child {
    border-bottom: none;
}

.divider-line {
    height: 1px;
    background: var(--border);
    margin: 0 20px;
}

.action-item:hover {
    background: rgba(240, 246, 252, 0.02);
}

.action-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(240, 246, 252, 0.05);
    color: var(--fg-muted);
}

.action-icon.danger {
    background: rgba(247, 129, 102, 0.1);
    color: var(--highlight);
}

.action-label {
    flex: 1;
    font-size: 15px;
    color: var(--fg);
}

.action-label.danger {
    color: var(--highlight);
}

/* Legal Links */
.legal-links {
    text-align: center;
    font-size: 13px;
    color: #8B949E;
    padding: 20px 0;
}

.legal-links a {
    color: #58A6FF;
    cursor: pointer;
    text-decoration: none;
}

.legal-links span {
    margin: 0 8px;
    color: rgba(240, 246, 252, 0.2);
}

/* Version Info */
.version-info {
    text-align: center;
    padding: 30px 0 20px;
}

.version-info p {
    color: #8B949E;
    font-size: 13px;
    margin-bottom: 4px;
}

.version-info .version {
    color: rgba(240, 246, 252, 0.3);
    font-size: 12px;
}

.check-update {
    margin-top: 8px;
    color: #58A6FF;
    font-size: 13px;
    cursor: pointer;
    text-decoration: underline;
}

/* Password Modal */
.password-modal {
    padding: 20px;
}

.password-modal .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.password-modal .modal-header h3 {
    font-size: 18px;
    color: var(--fg);
}

.password-modal .modal-header .van-icon {
    font-size: 24px;
    color: var(--fg-muted);
    cursor: pointer;
}

.password-modal .modal-body {
    margin-bottom: 20px;
}

.password-modal .modal-body :deep(.van-cell) {
    padding: 12px 0;
    background: transparent;
}

.password-error {
    color: var(--highlight);
    font-size: 14px;
    text-align: center;
    margin-top: 10px;
}

.password-modal .modal-footer {
    display: flex;
    gap: 12px;
}

.password-modal .modal-footer .btn-primary,
.password-modal .modal-footer .btn-secondary {
    flex: 1;
}
</style>
