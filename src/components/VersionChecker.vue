<script setup>
import { ref, onMounted } from 'vue'
import { showDialog, showConfirmDialog } from 'vant'

const props = defineProps({
    // 当前版本号
    currentVersion: {
        type: String,
        default: '1.0.2'
    },
    // 当前版本代码
    currentVersionCode: {
        type: Number,
        default: 10002
    }
})

const emit = defineEmits(['update-available'])

// 检查版本更新
const checkUpdate = async (showNoUpdate = false) => {
    try {
        const res = await fetch(
            `https://api.19780918.xyz/api/app/version?platform=android&versionCode=${props.currentVersionCode}`
        )
        const data = await res.json()
        
        if (data.hasUpdate) {
            emit('update-available', data)
            
            // 显示更新对话框
            if (data.forceUpdate) {
                // 强制更新
                showDialog({
                    title: '发现新版本',
                    message: `V${data.latestVersion}\n\n${data.updateContent}`,
                    confirmButtonText: '立即更新',
                    showCancelButton: false,
                    closeOnClickOverlay: false
                }).then(() => {
                    // 跳转到下载页面
                    window.open(data.updateUrl, '_blank')
                })
            } else {
                // 可选更新
                showConfirmDialog({
                    title: '发现新版本',
                    message: `V${data.latestVersion}\n\n${data.updateContent}`,
                    confirmButtonText: '立即更新',
                    cancelButtonText: '稍后再说'
                }).then(() => {
                    window.open(data.updateUrl, '_blank')
                }).catch(() => {})
            }
        } else if (showNoUpdate) {
            showDialog({
                title: '检查更新',
                message: '当前已是最新版本',
                confirmButtonText: '确定'
            })
        }
        
        return data
    } catch (err) {
        console.error('检查更新失败:', err)
        return null
    }
}

// 暴露方法给父组件调用
defineExpose({
    checkUpdate
})

// 组件挂载时自动检查（可选，默认不自动检查）
onMounted(() => {
    // 可以在这里设置自动检查
    // checkUpdate()
})
</script>

<template>
    <div class="version-checker"></div>
</template>

<style scoped>
.version-checker {
    display: none;
}
</style>
