<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog, showDialog } from 'vant'
import { authAPI } from '@/api'

const router = useRouter()

// 用户信息
const isLoggedIn = ref(false)
const user = ref(null)

// 页面状态
const loading = ref(true)
const versions = ref([])
const showAddModal = ref(false)

// 新版本表单
const newVersion = ref({
    version: '',
    versionCode: '',
    platform: 'android',
    updateType: 'optional',
    updateUrl: '',
    updateContent: ''
})

// 退出登录
const handleLogout = () => {
    showConfirmDialog({
        title: '退出登录',
        message: '确定要退出登录吗？',
    }).then(() => {
        sessionStorage.removeItem('adminToken')
        sessionStorage.removeItem('adminUser')
        router.push('/admin.html')
        showToast('已退出登录')
    }).catch(() => {})
}

// 获取版本列表
const fetchVersions = async () => {
    try {
        loading.value = true
        const token = sessionStorage.getItem('adminToken')
        const res = await fetch('https://api.19780918.xyz/api/admin/versions', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const data = await res.json()
        versions.value = data
    } catch (err) {
        showToast('获取版本列表失败')
    } finally {
        loading.value = false
    }
}

// 发布新版本
const handlePublish = async () => {
    if (!newVersion.value.version || !newVersion.value.versionCode) {
        return showToast('请填写版本号和版本代码')
    }
    
    try {
        const token = sessionStorage.getItem('adminToken')
        const res = await fetch('https://api.19780918.xyz/api/admin/versions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newVersion.value)
        })
        const data = await res.json()
        
        if (data.message) {
            showToast('发布成功')
            showAddModal.value = false
            newVersion.value = {
                version: '',
                versionCode: '',
                platform: 'android',
                updateType: 'optional',
                updateUrl: '',
                updateContent: ''
            }
            fetchVersions()
        } else {
            showToast(data.error || '发布失败')
        }
    } catch (err) {
        showToast('发布失败')
    }
}

// 删除版本
const handleDelete = async (id) => {
    try {
        showConfirmDialog({
            title: '删除版本',
            message: '确定要删除此版本吗？',
        }).then(async () => {
            // 这里可以添加删除API
            showToast('删除成功')
            fetchVersions()
        }).catch(() => {})
    } catch (err) {
        showToast('删除失败')
    }
}

// 检查登录状态
onMounted(() => {
    const token = sessionStorage.getItem('adminToken')
    const adminUser = sessionStorage.getItem('adminUser')
    
    if (!token) {
        router.push('/admin.html')
        return
    }
    
    isLoggedIn.value = true
    user.value = adminUser ? JSON.parse(adminUser) : { username: 'admin' }
    fetchVersions()
})
</script>

<template>
    <div class="version-page">
        <!-- 头部 -->
        <div class="header">
            <div class="header-left">
                <h1>版本管理</h1>
            </div>
            <button class="logout-btn" @click="handleLogout">退出登录</button>
        </div>
        
        <!-- 内容区 -->
        <div class="content">
            <!-- 发布按钮 -->
            <div class="action-bar">
                <button class="publish-btn" @click="showAddModal = true">
                    发布新版本
                </button>
            </div>
            
            <!-- 版本列表 -->
            <div class="version-list">
                <div v-if="loading" class="loading">加载中...</div>
                
                <div v-else-if="versions.length === 0" class="empty">
                    暂无版本记录
                </div>
                
                <div v-else class="version-item" v-for="item in versions" :key="item.id">
                    <div class="version-header">
                        <span class="version-name">V{{ item.version }}</span>
                        <span class="version-code">({{ item.version_code }})</span>
                        <span v-if="item.is_latest" class="latest-badge">最新</span>
                        <span :class="['type-badge', item.update_type]">
                            {{ item.update_type === 'force' ? '强制更新' : '可选更新' }}
                        </span>
                    </div>
                    <div class="version-content" v-if="item.update_content">
                        {{ item.update_content }}
                    </div>
                    <div class="version-footer">
                        <span class="platform">{{ item.platform }}</span>
                        <span class="time">{{ item.created_at }}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 发布弹窗 -->
        <van-popup v-model:show="showAddModal" position="bottom" round :style="{ minHeight: '60%' }">
            <div class="modal">
                <div class="modal-header">
                    <h3>发布新版本</h3>
                    <van-icon name="cross" @click="showAddModal = false" />
                </div>
                
                <div class="modal-body">
                    <van-field v-model="newVersion.version" label="版本号" placeholder="如: 1.0.3" />
                    <van-field v-model="newVersion.versionCode" type="number" label="版本代码" placeholder="如: 10003" />
                    <van-field label="平台">
                        <template #input>
                            <van-radio-group v-model="newVersion.platform" direction="horizontal">
                                <van-radio name="android">Android</van-radio>
                                <van-radio name="ios">iOS</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>
                    <van-field label="更新类型">
                        <template #input>
                            <van-radio-group v-model="newVersion.updateType" direction="horizontal">
                                <van-radio name="optional">可选</van-radio>
                                <van-radio name="force">强制</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>
                    <van-field v-model="newVersion.updateUrl" label="下载地址" placeholder="APK下载地址" />
                    <van-field v-model="newVersion.updateContent" type="textarea" rows="4" label="更新内容" placeholder="每行一条更新内容" />
                </div>
                
                <div class="modal-footer">
                    <button class="cancel-btn" @click="showAddModal = false">取消</button>
                    <button class="confirm-btn" @click="handlePublish">发布</button>
                </div>
            </div>
        </van-popup>
    </div>
</template>

<style scoped>
.version-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: #fff;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: rgba(255,255,255,0.05);
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.header h1 {
    font-size: 18px;
    font-weight: 500;
}

.logout-btn {
    padding: 8px 16px;
    background: rgba(255,255,255,0.1);
    border: none;
    border-radius: 6px;
    color: #fff;
    cursor: pointer;
}

.content {
    padding: 16px;
}

.action-bar {
    margin-bottom: 16px;
}

.publish-btn {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
}

.version-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.loading, .empty {
    text-align: center;
    padding: 40px;
    color: rgba(255,255,255,0.5);
}

.version-item {
    background: rgba(255,255,255,0.05);
    border-radius: 12px;
    padding: 16px;
}

.version-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.version-name {
    font-size: 18px;
    font-weight: 600;
}

.version-code {
    color: rgba(255,255,255,0.5);
    font-size: 14px;
}

.latest-badge {
    padding: 2px 8px;
    background: #10b981;
    border-radius: 4px;
    font-size: 12px;
}

.type-badge {
    margin-left: auto;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.type-badge.optional {
    background: rgba(59, 130, 246, 0.2);
    color: #3b82f6;
}

.type-badge.force {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
}

.version-content {
    padding: 8px 0;
    color: rgba(255,255,255,0.7);
    font-size: 14px;
    white-space: pre-line;
}

.version-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.1);
    font-size: 12px;
    color: rgba(255,255,255,0.5);
}

/* 弹窗 */
.modal {
    padding: 20px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.modal-header h3 {
    font-size: 18px;
    color: #333;
}

.modal-body :deep(.van-cell) {
    margin-bottom: 8px;
}

.modal-footer {
    display: flex;
    gap: 12px;
    margin-top: 20px;
}

.cancel-btn, .confirm-btn {
    flex: 1;
    padding: 12px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
}

.cancel-btn {
    background: #f5f5f5;
    border: none;
    color: #666;
}

.confirm-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: #fff;
}
</style>
