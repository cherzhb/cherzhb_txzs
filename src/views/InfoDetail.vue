<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast } from 'vant'

const router = useRouter()
const route = useRoute()

const article = ref(null)
const loading = ref(true)

// 收藏状态
const isFavorite = ref(false)

// 字体大小（适老化）
const fontSize = ref(18)

// 工具栏显示状态
const showToolbar = ref(false)

// 模拟文章数据
const mockArticles = {
  1: {
    id: 1,
    title: '2025年退休政策最新解读',
    summary: '详细解析新退休政策实施细则，看看哪些变化会影响你',
    category: 'policy',
    categoryLabel: '政策',
    viewCount: 12580,
    publishTime: '2025-02-15',
    content: `
      <h2>2025年退休政策最新解读</h2>
      <p>随着人口老龄化加剧，国家陆续出台了一系列退休相关政策。本文将为您详细解读最新的政策变化。</p>
      
      <h3>1. 延迟退休方案</h3>
      <p>根据最新政策，延迟退休将采取渐进式实施。具体方案如下：</p>
      <ul>
        <li>男职工逐步延迟到65周岁退休</li>
        <li>女干部逐步延迟到60周岁退休</li>
        <li>女职工逐步延迟到55周岁退休</li>
      </ul>
      
      <h3>2. 养老金计算方式调整</h3>
      <p>新的养老金计算方式更加注重缴费年限和缴费指数的权重，鼓励长期缴费。</p>
      
      <p>建议您尽早规划，合理配置资产，为退休生活做好准备。</p>
    `
  },
  // ... 其他文章
}

onMounted(async () => {
  // 获取文章数据
  loading.value = true
  
  // 模拟从后端获取
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
  article.value = mockArticles[route.params.id] || mockArticles[1]
  isFavorite.value = favorites.some(f => f.id === article.value?.id)
  
  loading.value = false
  
  // 更新阅读量（模拟）
  if (article.value) {
    article.value.viewCount += 1
  }
})

// 切换字体大小
const changeFontSize = () => {
  if (fontSize.value >= 24) {
    fontSize.value = 18
  } else {
    fontSize.value += 2
  }
}

// 分享文章
const shareArticle = () => {
  if (navigator.share && navigator.canShare) {
    navigator.share({
      title: article.value?.title,
      text: article.value?.summary,
      url: window.location.href
    }).catch(console.error)
  } else {
    showToast('分享功能开发中')
  }
}

// 收藏/取消收藏
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  
  let favs = JSON.parse(localStorage.getItem('favorites') || '[]')
  
  if (isFavorite.value) {
    favs.push({ id: article.value.id, title: article.value.title })
    showToast('已收藏')
  } else {
    favs = favs.filter(f => f.id !== article.value.id)
    showToast('已取消收藏')
  }
  
  localStorage.setItem('favorites', JSON.stringify(favs))
}

// 返回列表
const goBack = () => {
  router.back()
}

// 适老化大字模式
const contentStyle = computed(() => ({
  fontSize: fontSize.value + 'px',
  lineHeight: '1.8'
}))

// 工具栏操作
const toolbarActions = [
  { name: '调大字体', callback: () => { fontSize.value = Math.min(24, fontSize.value + 2) } },
  { name: '调小字体', callback: () => { fontSize.value = Math.max(14, fontSize.value - 2) } },
  { name: '复制链接', callback: () => { showToast('链接已复制') } }
]
</script>

<template>
  <div class="detail-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <van-loading size="24">加载中...</van-loading>
    </div>

    <!-- 文章内容 -->
    <div v-else-if="article" class="article-container">
      <!-- 头部工具栏 -->
      <div class="header-bar">
        <van-icon name="arrow-left" @click="goBack" />
        <div class="title">{{ article.title }}</div>
        <van-icon name="ellipsis" @click="showToolbar = !showToolbar" />
      </div>

      <!-- 文章信息 -->
      <div class="article-info">
        <span class="category">{{ article.categoryLabel }}</span>
        <span class="publish-time">{{ article.publishTime }}</span>
        <span class="view-count">{{ article.viewCount }} 阅读</span>
      </div>

      <!-- 文章正文 -->
      <div class="article-content" :style="contentStyle" v-html="article.content"></div>

      <!-- 底部操作栏 -->
      <div class="footer-actions">
        <div class="action-btn" @click="changeFontSize">
          <van-icon name="description" />
          <span>{{ fontSize }}号</span>
        </div>
        <div class="action-btn" @click="toggleFavorite">
          <van-icon :name="isFavorite ? 'star' : 'star-o'" />
          <span>{{ isFavorite ? '已收藏' : '收藏' }}</span>
        </div>
        <div class="action-btn" @click="shareArticle">
          <van-icon name="share-o" />
          <span>分享</span>
        </div>
      </div>

      <!-- 更多操作弹窗 -->
      <van-action-sheet v-model:show="showToolbar" :actions="toolbarActions" cancel-text="取消" />
    </div>

    <!-- 文章不存在 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📄</div>
      <div class="empty-text">文章不存在</div>
      <van-button type="primary" @click="goBack">返回列表</van-button>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: white;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.header-bar .van-icon {
  font-size: 20px;
  color: #323233;
  cursor: pointer;
}

.title {
  flex: 1;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  margin: 0 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-info {
  padding: 16px 20px;
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #969799;
  border-bottom: 1px solid #f5f5f5;
}

.category {
  padding: 2px 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 4px;
  font-size: 11px;
}

.article-content {
  padding: 24px 20px;
  line-height: 1.8;
  color: #323233;
}

:deep(.article-content h2) {
  font-size: 1.3em;
  margin: 1.5em 0 0.8em;
  color: #323233;
  line-height: 1.4;
}

:deep(.article-content h3) {
  font-size: 1.15em;
  margin: 1.3em 0 0.6em;
  color: #323233;
  line-height: 1.4;
}

:deep(.article-content p) {
  margin-bottom: 1em;
  text-align: justify;
}

:deep(.article-content ul),
:deep(.article-content ol) {
  margin: 1em 0;
  padding-left: 2em;
}

:deep(.article-content li) {
  margin-bottom: 0.5em;
  line-height: 1.8;
}

.footer-actions {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  border-top: 1px solid #f5f5f5;
  position: sticky;
  bottom: 0;
  background: white;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #323233;
  cursor: pointer;
}

.action-btn .van-icon {
  font-size: 24px;
}

empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 16px;
  color: #969799;
  margin-bottom: 20px;
}
</style>
