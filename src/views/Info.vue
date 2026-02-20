<script setup>
import { ref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { articleAPI } from '@/api'

const router = useRouter()

// 资讯分类
const categories = [
  { id: '', name: '全部' },
  { id: 'policy', name: '政策' },
  { id: 'health', name: '健康' },
  { id: 'finance', name: '理财' },
  { id: 'life', name: '生活' },
  { id: 'news', name: '新闻' }
]

const activeCategory = ref('')

// 资讯列表
const articles = ref([])
const loading = ref(false)
const refreshing = ref(false)

// 分类名称映射
const categoryNames = {
  policy: '政策',
  health: '健康',
  finance: '理财',
  life: '生活',
  news: '新闻'
}

// 加载文章列表
const loadArticles = async () => {
  loading.value = true
  try {
    const data = await articleAPI.getList({ 
      category: activeCategory.value,
      limit: 50 
    })
    articles.value = data.map(a => ({
      id: a.id,
      title: a.title,
      summary: a.summary,
      category: a.category,
      categoryLabel: categoryNames[a.category] || a.category,
      viewCount: a.view_count || 0,
      publishTime: a.created_at?.split('T')[0] || a.created_at?.split(' ')[0] || ''
    }))
  } catch (err) {
    console.error('加载文章失败:', err)
    showToast('加载失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  loadArticles()
}

// 分类筛选
const onCategoryChange = () => {
  loadArticles()
}

// 查看文章详情
const goToDetail = (id) => {
  router.push(`/info/${id}`)
}

// 页面加载
onMounted(loadArticles)
onActivated(loadArticles)
</script>

<template>
  <div class="info-page">
    <div class="page-container">
      <!-- Header -->
      <div class="header">
        <h1 class="page-title">养老资讯</h1>
        <p class="page-subtitle">获取最新政策与健康信息</p>
      </div>

      <!-- 分类标签 -->
      <div class="categories">
        <van-tabs v-model:active="activeCategory" @change="onCategoryChange">
          <van-tab v-for="cat in categories" :key="cat.id" :title="cat.name" :name="cat.id" />
        </van-tabs>
      </div>

      <!-- 文章列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div v-if="loading && !refreshing" class="loading-center">
          <van-loading size="24px" />
        </div>
        
        <div v-else class="articles-list">
          <div
            v-for="article in articles"
            :key="article.id"
            class="article-card"
            @click="goToDetail(article.id)"
          >
            <div class="article-category">{{ article.categoryLabel }}</div>
            <div class="article-title">{{ article.title }}</div>
            <div class="article-summary">{{ article.summary }}</div>
            <div class="article-meta">
              <span class="view-count">👁 {{ article.viewCount }}</span>
              <span class="publish-time">📅 {{ article.publishTime }}</span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="articles.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">📰</div>
          <div class="empty-text">暂无文章</div>
        </div>
      </van-pull-refresh>
    </div>
  </div>
</template>

<style scoped>
.info-page {
  min-height: 100vh;
  position: relative;
  z-index: 1;
  padding-bottom: 100px;
}

.page-container {
  padding: 56px 20px 0;
}

/* Header */
.header {
  padding: 0 4px 24px;
  margin-bottom: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--fg);
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--fg-muted);
}

/* Categories */
.categories {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 4px;
  margin-bottom: 20px;
}

:deep(.van-tabs__wrap) {
  padding: 4px;
}

:deep(.van-tabs__nav) {
  background: transparent;
}

:deep(.van-tab) {
  color: var(--fg-muted);
  font-size: 14px;
}

:deep(.van-tab--active) {
  color: var(--fg);
  font-weight: 600;
}

:deep(.van-tabs__line) {
  background: var(--accent-primary);
}

/* Loading */
.loading-center {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.loading-center :deep(.van-loading__spinner) {
  color: var(--accent-primary);
}

/* Articles List */
.articles-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.article-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.article-card:active {
  transform: scale(0.98);
}

.article-card:hover {
  border-color: rgba(88, 166, 255, 0.3);
}

.article-category {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  margin-bottom: 12px;
}

.article-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
  margin-bottom: 8px;
  line-height: 1.5;
}

.article-summary {
  font-size: 13px;
  color: var(--fg-muted);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--fg-muted);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 15px;
  color: var(--fg-muted);
}
</style>
