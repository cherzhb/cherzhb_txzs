import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const user = ref(null)
  const isLoggedIn = computed(() => !!user.value)

  // 个人档案
  const profile = ref({
    gender: 1, // 1男 2女
    birthDate: '',
    jobType: 1, // 1企业职工 2灵活就业 3公务员 4事业单位
    locationCode: '110000', // 参保地行政区划
    salary: 0, // 当前工资
    accountBalance: 0, // 个人账户储存额
    contributionYears: 0, // 预计缴费年限
    contributionIndex: 1.0, // 缴费指数
    isVerified: false
  })

  // 登录
  function login(userData) {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  // 登出
  function logout() {
    user.value = null
    localStorage.removeItem('user')
    profile.value = {
      gender: 1,
      birthDate: '',
      jobType: 1,
      locationCode: '110000',
      salary: 0,
      accountBalance: 0,
      contributionYears: 0,
      contributionIndex: 1.0,
      isVerified: false
    }
  }

  // 更新档案
  function updateProfile(data) {
    profile.value = { ...profile.value, ...data }
    localStorage.setItem('profile', JSON.stringify(profile.value))
  }

  // 从本地存储恢复
  function restoreFromStorage() {
    const savedUser = localStorage.getItem('user')
    const savedProfile = localStorage.getItem('profile')
    
    if (savedUser) {
      user.value = JSON.parse(savedUser)
    }
    if (savedProfile) {
      profile.value = { ...profile.value, ...JSON.parse(savedProfile) }
    }
  }

  return {
    user,
    isLoggedIn,
    profile,
    login,
    logout,
    updateProfile,
    restoreFromStorage
  }
})
