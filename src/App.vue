<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import TabBar from '@/components/TabBar.vue'

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
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <TabBar />
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
  min-width: 320px;
  max-width: 750px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f7f8fa;
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
