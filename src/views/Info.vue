<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast } from 'vant'

const router = useRouter()

// 资讯分类
const categories = [
  { id: '', name: '全部' },
  { id: 'policy', name: '政策' },
  { id: 'health', name: '健康' },
  { id: 'finance', name: '理财' }
]

const activeCategory = ref('')

// 资讯列表
const articles = ref([])
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)

// 收藏的文章
const favorites = ref(JSON.parse(localStorage.getItem('favorites') || '[]'))

// 模拟资讯数据
const mockArticles = [
  {
    id: 1,
    title: '2025年退休政策最新解读',
    summary: '详细解析新退休政策实施细则，看看哪些变化会影响你',
    category: 'policy',
    categoryLabel: '政策',
    viewCount: 12580,
    publishTime: '2025-02-15',
    isFavorite: false,
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
  {
    id: 2,
    title: '退休后如何保持健康的生活方式',
    summary: '专家建议：保持适度运动、合理饮食、积极社交是退休健康的关键',
    category: 'health',
    categoryLabel: '健康',
    viewCount: 9832,
    publishTime: '2025-02-10',
    isFavorite: false,
    content: `
      <h2>退休后的健康生活方式</h2>
      <p>退休后保持健康的生活方式对延长寿命和提高生活质量至关重要。</p>
      
      <h3>1. 适度运动</h3>
      <p>建议每周进行3-5次有氧运动，每次30分钟以上。可选择散步、游泳、太极等低强度运动。</p>
      
      <h3>2. 合理饮食</h3>
      <p>保持均衡饮食，多吃蔬菜水果，控制糖分和油脂摄入，做到三餐规律。</p>
      
      <h3>3. 保持社交</h3>
      <p>积极参与社区活动，保持与朋友家人的联系，避免孤独感。</p>
    `
  },
  {
    id: 3,
    title: '退休理财规划全攻略',
    summary: '从风险控制到收益最大化，教你如何科学规划退休资金',
    category: 'finance',
    categoryLabel: '理财',
    viewCount: 8765,
    publishTime: '2025-02-05',
    isFavorite: false,
    content: `
      <h2>退休理财规划全攻略</h2>
      <p>退休生活需要充足的资金支持，合理的理财规划可以帮助您实现财务自由。</p>
      
      <h3>1. 风险评估</h3>
      <p>首先要清楚自己的风险承受能力，选择合适的投资工具。</p>
      
      <h3>2. 资产配置</h3>
      <p>建议采用"核心+卫星"策略：</p>
      <ul>
        <li>核心资产：国债、定期存款等低风险产品，占比60%</li>
        <li>卫星资产：基金、股票等中高风险产品，占比40%</li>
      </ul>
      
      <h3>3. 定期调整</h3>
      <p>随着年龄增长，逐步降低高风险资产比例，确保资金安全。</p>
    `
  },
  {
    id: 4,
    title: '老年常见疾病预防指南',
    summary: '高血压、糖尿病等老年病的早期预防措施和注意事项',
    category: 'health',
    categoryLabel: '健康',
    viewCount: 7568,
    publishTime: '2025-01-28',
    isFavorite: false,
    content: `
      <h2>老年常见疾病预防指南</h2>
      <p>预防胜于治疗，提早了解老年常见疾病的预防措施非常重要。</p>
      
      <h3>1. 高血压</h3>
      <p>控制盐分摄入，保持健康体重，定期监测血压。</p>
      
      <h3>2. 糖尿病</h3>
      <p>控制糖分摄入，保持适量运动，定期检查血糖。</p>
    `
  },
  {
    id: 5,
    title: '退休后的精神文化生活',
    summary: '培养兴趣爱好，充实精神世界，让退休生活更加精彩',
    category: 'health',
    categoryLabel: '健康',
    viewCount: 6325,
    publishTime: '2025-01-20',
    isFavorite: false,
    content: `
      <h2>退休后的精神文化生活</h2>
      <p>退休后有了更多自由时间，可以投入自己喜欢的事情。</p>
      
      <h3>1. 培养兴趣爱好</h3>
      <p>可以学习书法、绘画、音乐、摄影等，丰富精神生活。</p>
      
      <h3>2. 参加社区活动</h3>
      <p>加入兴趣小组，结交志同道合的朋友。</p>
      
      <h3>3. 继续学习</h3>
      <p>保持学习的热情，活到老学到老。</p>
    `
  },
  {
    id: 6,
    title: '社保退休年龄最新规定',
    summary: '2025年社保退休年龄规定一览表，快速查询您的退休年龄',
    category: 'policy',
    categoryLabel: '政策',
    viewCount: 15230,
    publishTime: '2025-01-15',
    isFavorite: false,
    content: `
      <h2>社保退休年龄最新规定</h2>
      <p>2025年社保退休年龄规定如下：</p>
      
      <table>
        <tr><th>人员类型</th><th>性别</th><th>退休年龄</th></tr>
        <tr><td>企业职工</td><td>男</td><td>60周岁</td></tr>
        <tr><td>企业职工</td><td>干部</td><td>55周岁</td></tr>
        <tr><td>企业职工</td><td>工人</td><td>50周岁</td></tr>
        <tr><td>公务员</td><td>男</td><td>60周岁</td></tr>
      </table>
      
      <p>具体退休年龄可能会因延迟政策有所调整，请及时关注最新消息。</p>
    `
  }
]

// 加载文章列表
const loadArticles = () => {
  loading.value = true
  
  setTimeout(() => {
    // 根据分类筛选
    let filtered = mockArticles
    
    if (activeCategory.value) {
      filtered = mockArticles.filter(a => a.category === activeCategory.value)
    }
    
    // 检查收藏状态
    filtered = filtered.map(a => ({
      ...a,
      isFavorite: favorites.value.some(f => f.id === a.id)
    }))
    
    articles.value = filtered
    loading.value = false
    finished.value = true
  }, 500)
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  loadArticles()
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

// 分类筛选
const onCategoryChange = (name) => {
  activeCategory.value = name === '全部' ? '' : name
  loadArticles()
}

// 查看文章详情
const goToDetail = (id) => {
  router.push({ name: 'InfoDetail', params: { id } })
}

// 收藏/取消收藏
const toggleFavorite = (article) => {
  article.isFavorite = !article.isFavorite
  
  let favs = JSON.parse(localStorage.getItem('favorites') || '[]')
  
  if (article.isFavorite) {
    favs.push({ id: article.id, title: article.title })
    showToast('已收藏')
  } else {
    favs = favs.filter(f => f.id !== article.id)
    showToast('已取消收藏')
  }
  
  localStorage.setItem('favorites', JSON.stringify(favs))
}

// 分享文章
const shareArticle = (article) => {
  // 这里可以集成微信等分享功能
  showToast('分享功能开发中')
}

onMounted(() => {
  loadArticles()
})
</script>

<template>
  <div class="info-page">
    <!-- 分类标签 -->
    <div class="categories">
      <van-tabs v-model:active="activeCategory" @change="onCategoryChange">
        <van-tab title="全部" name=""></van-tab>
        <van-tab title="政策" name="policy"></van-tab>
        <van-tab title="健康" name="health"></van-tab>
        <van-tab title="理财" name="finance"></van-tab>
      </van-tabs>
    </div>

    <!-- 文章列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadArticles"
      >
        <div 
          v-for="article in articles" 
          :key="article.id" 
          class="article-item"
          @click="goToDetail(article.id)"
        >
          <div class="article-category">{{ article.categoryLabel }}</div>
          <div class="article-title">{{ article.title }}</div>
          <div class="article-summary">{{ article.summary }}</div>
          <div class="article-meta">
            <span class="view-count">👁 {{ article.viewCount }}</span>
            <span class="publish-time">📅 {{ article.publishTime }}</span>
          </div>
          <div class="article-actions" @click.stop>
            <van-button 
              :icon="article.isFavorite ? 'star' : 'star-o'" 
              type="primary" 
              plain 
              size="small"
              @click="toggleFavorite(article)"
            >
              {{ article.isFavorite ? '已收藏' : '收藏' }}
            </van-button>
            <van-button icon="share" type="primary" plain size="small" @click="shareArticle(article)">
              分享
            </van-button>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 空状态 -->
    <div v-if="articles.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">📰</div>
      <div class="empty-text">暂无文章</div>
    </div>
  </div>
</template>

<style scoped>
.info-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.categories {
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
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
  margin-bottom: 12px;
}

.article-actions {
  display: flex;
  gap: 8px;
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
