<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import TabBar from '@/components/TabBar.vue'

const userStore = useUserStore()

onMounted(() => {
  // 设置网页主题色
  document.documentElement.style.setProperty('--van-primary-color', '#58A6FF')
  // 恢复用户数据
  userStore.restoreFromStorage()
})
</script>

<template>
  <div id="app">
    <!-- 动画背景 -->
    <div class="bg-mesh">
      <div class="mesh-gradient mesh-1"></div>
      <div class="mesh-gradient mesh-2"></div>
      <div class="mesh-gradient mesh-3"></div>
    </div>
    
    <!-- 页面内容 -->
    <router-view v-slot="{ Component, route }">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
    
    <!-- 底部Tab栏 -->
    <TabBar />
  </div>
</template>

<style>
/* 字体引入 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: var(--font-family-zh), -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
  z-index: 1;
}

/* 适老化：最小字体 */
body {
  font-size: 16px;
}

/* 适老化：点击区域 */
button, .van-button {
  min-height: 44px;
}
</style>
