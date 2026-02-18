<script setup>
import { ref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast } from 'vant'
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
    <!-- 分类标签 -->
    <div class="categories">
      <van-tabs v-model:active="activeCategory" @change="onCategoryChange">
        <van-tab v-for="cat in categories" :key="cat.id" :title="cat.name" :name="cat.id" />
      </van-tabs>
    </div>

    <!-- 文章列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-loading v-if="loading && !refreshing" class="loading-center" />
      
      <div v-else>
        <div v-for="article in articles" :key="article.id" class="article-item" @click="goToDetail(article.id)">
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
</template>

<style scoped>
.info-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 80px;
}

.categories {
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.article-item {
  background: white;
  padding: 16px;
  margin: 12px;
  border-radius: 12px;
  cursor: pointer;
}

.article-item:active {
  transform: scale(0.98);
  transition: transform 0.2s;
}

.article-category {
  display: inline-block;
  padding: 2px 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 4px;
  font-size: 11px;
  margin-bottom: 8px;
}

.article-title {
  font-size: 17px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 8px;
  line-height: 1.4;
}

.article-summary {
  font-size: 14px;
  color: #646566;
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
  color: #969799;
}

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
}

.empty-text {
  font-size: 16px;
  color: #969799;
}
</style>
