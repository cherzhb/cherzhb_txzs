<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  // 设置网页主题色
  document.documentElement.style.setProperty('--van-primary-color', '#1989fa')
  
  // 恢复用户数据
  userStore.restoreFromStorage()
})
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* 适老化设计：最小字体 */
  min-width: 320px;
  max-width: 750px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f7f8fa;
}

/* 适老化：关怀模式字体放大 */
@media (prefers-color-scheme: dark) {
  body {
    background: #1a1a1a;
  }
}

/* 适老化：高对比度支持 */
@media (prefers-contrast: high) {
  #app {
    background: #ffffff;
  }
}

.page {
  min-height: 100vh;
  padding-bottom: 60px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 适老化：点击区域 */
button, .van-button {
  min-height: 44px;
}
</style>
