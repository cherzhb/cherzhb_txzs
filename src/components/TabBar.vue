<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const tabs = [
  { name: 'home', title: '首页', icon: 'wap-home-o', activeIcon: 'wap-home', path: '/' },
  { name: 'calculator', title: '计算', icon: 'calculator-o', activeIcon: 'calculator', path: '/calculator' },
  { name: 'info', title: '资讯', icon: 'newspaper-o', activeIcon: 'newspaper', path: '/info' },
  { name: 'profile', title: '我的', icon: 'user-o', activeIcon: 'user', path: '/profile' }
]

const activeTab = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path.startsWith('/calculator')) return 'calculator'
  if (path.startsWith('/info')) return 'info'
  if (path.startsWith('/profile') || path.startsWith('/login')) return 'profile'
  return 'home'
})

const onTabChange = (name) => {
  const tab = tabs.find(t => t.name === name)
  if (tab) {
    router.push(tab.path)
  }
}
</script>

<template>
  <van-tabbar 
    v-model="activeTab" 
    @change="onTabChange"
    active-color="#1989fa"
    inactive-color="#646566"
    placeholder
    safe-area-inset-bottom
  >
    <van-tabbar-item 
      v-for="tab in tabs" 
      :key="tab.name"
      :name="tab.name"
      :icon="activeTab === tab.name ? tab.activeIcon : tab.icon"
    >
      {{ tab.title }}
    </van-tabbar-item>
  </van-tabbar>
</template>

<style scoped>
.van-tabbar {
  border-top: 1px solid #f5f5f5;
}
</style>
