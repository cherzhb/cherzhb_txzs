<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { articleAPI } from '@/api'
import DOMPurify from 'dompurify'

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

// 分类名称映射
const categoryNames = {
  policy: '政策',
  health: '健康',
  finance: '理财',
  life: '生活',
  news: '新闻'
}

onMounted(async () => {
  loading.value = true
  try {
    // 从后端API获取文章详情
    const data = await articleAPI.getDetail(route.params.id)
    article.value = {
      id: data.id,
      title: data.title,
      summary: data.summary,
      category: data.category,
      categoryLabel: categoryNames[data.category] || data.category,
      viewCount: data.view_count || 0,
      publishTime: data.created_at?.split('T')[0] || data.created_at?.split(' ')[0] || '',
      content: data.content
    }
    
    // 检查收藏状态
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    isFavorite.value = favorites.some(f => f.id === article.value?.id)
  } catch (err) {
    console.error('加载文章失败:', err)
    showToast('文章加载失败')
  } finally {
    loading.value = false
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
  {
    name: '调大字体',
    callback: () => {
      fontSize.value = Math.min(24, fontSize.value + 2)
    }
  },
  {
    name: '调小字体',
    callback: () => {
      fontSize.value = Math.max(14, fontSize.value - 2)
    }
  },
  {
    name: '复制链接',
    callback: () => {
      showToast('链接已复制')
    }
  }
]
</script>

<template>
  <div class="detail-page">
    <div class="page-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <van-loading size="24">加载中...</van-loading>
      </div>

      <!-- 文章内容 -->
      <div v-else-if="article" class="article-container">
        <!-- Header -->
        <div class="header">
          <van-icon name="arrow-left" @click="goBack" />
          <span class="header-title">文章详情</span>
          <van-icon name="ellipsis" @click="showToolbar = !showToolbar" />
        </div>

        <!-- 文章信息 -->
        <div class="article-meta">
          <span class="category">{{ article.categoryLabel }}</span>
          <div class="meta-right">
            <span class="publish-time">{{ article.publishTime }}</span>
            <span class="view-count">👁 {{ article.viewCount }}</span>
          </div>
        </div>

        <!-- 文章标题 -->
        <h1 class="article-title">{{ article.title }}</h1>

        <!-- 文章正文 -->
        <div class="article-content" :style="contentStyle" v-html="DOMPurify.sanitize(article.content)"></div>

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
      </div>

      <!-- 文章不存在 -->
      <div v-else class="empty-state">
        <div class="empty-icon">📄</div>
        <div class="empty-text">文章不存在</div>
        <button class="btn-primary" @click="goBack">返回列表</button>
      </div>
    </div>

    <!-- 更多操作弹窗 -->
    <van-action-sheet v-model:show="showToolbar" :actions="toolbarActions" cancel-text="取消" />
  </div>
</template>

<style scoped>
.detail-page {
  min-height: 100vh;
  position: relative;
  z-index: 1;
  padding-bottom: 100px;
}

.page-container {
  padding: 56px 20px 0;
}

/* Loading */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 56px);
}

.loading-state :deep(.van-loading__spinner) {
  color: var(--accent-primary);
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px 16px;
  margin-bottom: 20px;
}

.header .van-icon {
  font-size: 20px;
  color: var(--fg);
  cursor: pointer;
  padding: 8px;
}

.header-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
  text-align: center;
}

/* Article Meta */
.article-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 0 4px;
}

.category {
  padding: 4px 12px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.meta-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  font-size: 12px;
  color: var(--fg-muted);
}

/* Article Title */
.article-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--fg);
  margin-bottom: 24px;
  line-height: 1.4;
  padding: 0 4px;
}

/* Article Content */
.article-content {
  line-height: 1.8;
  color: var(--fg);
  padding: 0 4px;
}

:deep(.article-content h2) {
  font-size: 1.3em;
  margin: 1.5em 0 0.8em;
  color: var(--fg);
  line-height: 1.4;
  font-weight: 600;
}

:deep(.article-content h3) {
  font-size: 1.15em;
  margin: 1.3em 0 0.6em;
  color: var(--fg);
  line-height: 1.4;
  font-weight: 600;
}

:deep(.article-content p) {
  margin-bottom: 1em;
  text-align: justify;
  color: var(--fg-muted);
}

:deep(.article-content ul),
:deep(.article-content ol) {
  margin: 1em 0;
  padding-left: 2em;
}

:deep(.article-content li) {
  margin-bottom: 0.5em;
  line-height: 1.8;
  color: var(--fg-muted);
}

/* Footer Actions */
.footer-actions {
  display: flex;
  justify-content: space-around;
  padding: 20px 20px 24px;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: 20px;
  margin-top: 32px;
  position: sticky;
  bottom: 20px;
  z-index: 10;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--fg-muted);
  cursor: pointer;
}

.action-btn .van-icon {
  font-size: 22px;
  color: var(--fg);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 56px);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-text {
  font-size: 15px;
  color: var(--fg-muted);
  margin-bottom: 20px;
}
</style>
