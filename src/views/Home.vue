<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn)

const features = [
  { icon: '📊', name: '退休倒计时', desc: '准确计算退休时间', route: 'countdown', needAuth: true },
  { icon: '💰', name: '养老金计算', desc: '科学预估退休待遇', route: 'calculator', needAuth: true },
  { icon: '📰', name: '退休资讯', desc: '了解最新政策动态', route: 'info', needAuth: false },
  { icon: '👤', name: '个人档案', desc: '完善个人信息', route: 'profile', needAuth: true }
]

const handleFeatureClick = (feature) => {
  if (feature.needAuth && !isLoggedIn.value) {
    router.push({ name: 'Login', query: { redirect: feature.route } })
  } else {
    router.push({ name: feature.route })
  }
}

const quickCountdown = () => {
  if (!isLoggedIn.value) {
    router.push({ name: 'Login', query: { redirect: 'Countdown' } })
  } else {
    router.push({ name: 'Countdown' })
  }
}
</script>

<template>
  <div class="home-page">
    <!-- 头部 -->
    <div class="header">
      <h1 class="title">退休规划助手</h1>
      <p class="subtitle">科学规划 · 快乐退休</p>
    </div>

    <!-- 快速入口 -->
    <div class="quick-action" @click="quickCountdown">
      <div class="action-content">
        <div class="icon">⏰</div>
        <div class="text">
          <div class="action-title">查看退休倒计时</div>
          <div class="action-desc">一键了解您的退休时间</div>
        </div>
        <div class="arrow">›</div>
      </div>
    </div>

    <!-- 功能入口 -->
    <div class="features">
      <div class="section-title">核心功能</div>
      <div class="feature-grid">
        <div 
          v-for="feature in features" 
          :key="feature.route"
          class="feature-item"
          @click="handleFeatureClick(feature)"
        >
          <div class="feature-icon">{{ feature.icon }}</div>
          <div class="feature-name">{{ feature.name }}</div>
          <div class="feature-desc">{{ feature.desc }}</div>
        </div>
      </div>
    </div>

    <!-- 用户信息 -->
    <div class="user-card" v-if="isLoggedIn">
      <div class="user-info">
        <div class="avatar">
          {{ userStore.user?.username?.substring(0, 1) || 'U' }}
        </div>
        <div class="user-detail">
          <div class="user-name">{{ userStore.user?.username || '用户' }}</div>
          <div class="user-desc">
            {{ userStore.profile.jobType === 1 ? '企业职工' : 
               userStore.profile.jobType === 2 ? '灵活就业' : 
               userStore.profile.jobType === 3 ? '公务员' : '事业单位' }}
          </div>
        </div>
      </div>
      <div class="user-action" @click="router.push('/profile')">
        编辑档案
      </div>
    </div>

    <!-- 免责声明 -->
    <div class="disclaimer">
      <div class="disclaimer-title">⚠️ 免责声明</div>
      <div class="disclaimer-text">
        本应用提供的计算结果仅供参考，不作任何法律依据。实际退休待遇以当地社保部门核定为准。
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  padding: 16px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  text-align: center;
  color: white;
  padding: 40px 0 30px;
}

.title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  opacity: 0.9;
}

.quick-action {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  cursor: pointer;
  transition: transform 0.2s;
}

.quick-action:active {
  transform: scale(0.98);
}

.action-content {
  display: flex;
  align-items: center;
}

.icon {
  font-size: 40px;
  margin-right: 16px;
}

.text {
  flex: 1;
}

.action-title {
  font-size: 18px;
  font-weight: bold;
  color: #1989fa;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 14px;
  color: #969799;
}

.arrow {
  font-size: 32px;
  color: #1989fa;
  font-weight: bold;
}

.features {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #323233;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.feature-item {
  text-align: center;
  padding: 20px;
  border-radius: 12px;
  background: #f7f8fa;
  cursor: pointer;
  transition: all 0.2s;
}

.feature-item:active {
  background: #e8f3ff;
  transform: scale(0.98);
}

.feature-icon {
  font-size: 36px;
  margin-bottom: 10px;
}

.feature-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 6px;
  color: #323233;
}

.feature-desc {
  font-size: 13px;
  color: #969799;
}

.user-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  margin-right: 12px;
}

.user-name {
  font-size: 18px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 4px;
}

.user-desc {
  font-size: 14px;
  color: #969799;
}

.user-action {
  color: #1989fa;
  font-size: 14px;
  cursor: pointer;
}

.disclaimer {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 16px;
}

.disclaimer-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #f56c6c;
}

.disclaimer-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}
</style>
