<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const tabs = [
  { 
    name: 'home', 
    title: '首页', 
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>', 
    path: '/' 
  },
  { 
    name: 'calculator', 
    title: '测算', 
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="8" y1="10" x2="16" y2="10"></line><line x1="8" y1="14" x2="12" y2="14"></line><line x1="8" y1="18" x2="12" y2="18"></line></svg>', 
    path: '/calculator' 
  },
  { 
    name: 'info', 
    title: '资讯', 
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path></svg>', 
    path: '/info' 
  },
  { 
    name: 'profile', 
    title: '我的', 
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>', 
    path: '/profile' 
  }
]

// 根据 route meta 决定是否显示 TabBar
const showTabBar = computed(() => {
  return route.meta.showTabbar !== false
})

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
  <nav class="tab-bar" v-if="showTabBar">
    <div class="tab-bar-inner">
      <div 
        v-for="tab in tabs" 
        :key="tab.name"
        :class="['tab-item', { active: activeTab === tab.name }]"
        @click="onTabChange(tab.name)"
        role="button"
        tabindex="0"
        :aria-label="tab.title"
        @keydown.enter="onTabChange(tab.name)"
        @keydown.space.prevent="onTabChange(tab.name)"
      >
        <div v-html="tab.svg" class="tab-icon"></div>
        <span>{{ tab.title }}</span>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.tab-bar {
  /* 样式在全局CSS中定义 */
}

.tab-icon {
  width: 22px;
  height: 22px;
  transition: transform 0.3s ease;
}

.tab-icon :deep(svg) {
  width: 100%;
  height: 100%;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
}

.tab-item.active .tab-icon {
  transform: scale(1.1);
}
</style>
