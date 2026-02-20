<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const lastUpdated = '2026年2月19日'
</script>

<template>
    <div class="privacy-page">
        <div class="page-container">
            <!-- Header -->
            <div class="header">
                <van-icon name="arrow-left" @click="router.back()" />
                <h1>隐私政策</h1>
            </div>

            <!-- Content -->
            <div class="content">
                <p class="update-time">最后更新时间：{{ lastUpdated }}</p>

                <section>
                    <h2>引言</h2>
                    <p>退休规划助手（以下简称"我们"）深知个人信息对您的重要性，并会尽全力保护您的个人信息安全可靠。我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。同时，我们承诺，我们将按业界成熟的安全标准，采取相应的安全保护措施来保护您的个人信息。</p>
                </section>

                <section>
                    <h2>1. 我们如何收集和使用您的个人信息</h2>
                    <p>我们会遵循正当、合法、必要的原则，仅为实现产品功能，向您提供服务之目的，收集和使用您的个人信息。</p>
                    <h3>1.1 账号注册</h3>
                    <p>当您注册账号时，我们会收集您的用户名、邮箱地址、手机号码、密码信息。这些信息用于创建账号、验证身份、发送通知。</p>
                    <h3>1.2 档案管理</h3>
                    <p>当您使用档案管理功能时，我们会收集您的个人信息，包括性别、出生日期、人员身份、参保地、工资、账户余额、缴费年限、缴费指数等。这些信息用于养老金测算和个性化服务。</p>
                    <h3>1.3 服务日志</h3>
                    <p>当您使用我们的服务时，我们会自动收集您的设备信息、网络信息、操作日志等，用于改善服务质量和安全性。</p>
                </section>

                <section>
                    <h2>2. 我们如何使用Cookie和同类技术</h2>
                    <p>为确保应用正常运转，我们会在您的设备上存储小型数据文件，这些文件被称为Cookie。Cookie通常包含标识符、站点名称以及一些号码和字符。借助于Cookie，网站能够存储您的偏好等数据。</p>
                </section>

                <section>
                    <h2>3. 我们如何共享、转让、公开披露您的个人信息</h2>
                    <h3>3.1 共享</h3>
                    <p>我们不会向任何第三方共享您的个人信息，除非获得您的明确同意。我们可能会根据法律法规规定，或按政府主管部门的强制性要求，对外共享您的个人信息。</p>
                    <h3>3.2 转让</h3>
                    <p>我们不会将您的个人信息转让给任何公司、组织和个人，但以下情况除外：在获取明确同意的情况下转让；根据适用的法律法规、法律程序的要求等进行转让。</p>
                    <h3>3.3 公开披露</h3>
                    <p>我们仅会在以下情况下，公开披露您的个人信息：获得您明确同意；基于法律法规的披露；在涉及合并、收购或破产清算时，如涉及个人信息转让，我们会要求新的持有您个人信息的公司继续受本隐私政策的约束。</p>
                </section>

                <section>
                    <h2>4. 我们如何保护您的个人信息</h2>
                    <p>4.1 我们已使用符合业界标准的安全保护措施保护您提供的个人信息，防止数据遭到未经授权的访问、公开披露、使用、修改、损坏或丢失。</p>
                    <p>4.2 我们会对员工进行数据安全意识培训，以确保他们在处理您的个人信息时符合本隐私政策的要求。</p>
                    <p>4.3 我们在传输和存储您的个人信息时，会使用加密技术来保护您的个人信息安全。</p>
                </section>

                <section>
                    <h2>5. 您的权利</h2>
                    <p>在您使用我们的服务期间，我们尽可能为您提供访问、更正、删除、注销账号的权利。</p>
                    <h3>5.1 访问和更正个人信息</h3>
                    <p>您可以通过访问您的个人档案，查看并更正您的个人信息。</p>
                    <h3>5.2 删除个人信息</h3>
                    <p>您可以通过注销账号的方式删除您的个人信息。在注销账号后，我们将停止使用并删除您的个人信息。</p>
                    <h3>5.3 注销账号</h3>
                    <p>您可以通过应用内的"注销账号"功能注销您的账号。注销后，您的个人信息将被删除，不可恢复。</p>
                </section>

                <section>
                    <h2>6. 本政策的更新</h2>
                    <p>我们可能适时修订本隐私政策的条款，该等修订构成本隐私政策的一部分。如该等修订造成您在本隐私政策下权利的实质减少，我们将在修订生效前通过在主页上显著位置提示或向您发送电子邮件等方式通知您。</p>
                </section>

                <section>
                    <h2>7. 如何联系我们</h2>
                    <p>如果您对本隐私政策有任何疑问、意见或建议，请通过以下方式与我们联系：</p>
                    <p>电子邮箱：support@txghzs.com</p>
                    <p>我们将在十五个工作日内回复您的请求。</p>
                </section>
            </div>
        </div>
    </div>
</template>

<style scoped>
.privacy-page {
    min-height: 100vh;
    background: #0D1117;
    padding-bottom: 40px;
}

.page-container {
    padding-top: 56px;
}

/* Header */
.header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: rgba(13, 17, 23, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(240, 246, 252, 0.1);
    z-index: 100;
}

.header .van-icon {
    font-size: 24px;
    color: #F0F6FC;
    cursor: pointer;
}

.header h1 {
    font-size: 18px;
    font-weight: 600;
    color: #F0F6FC;
}

/* Content */
.content {
    padding: 24px 20px;
    max-width: 800px;
    margin: 0 auto;
}

.update-time {
    color: #8B949E;
    font-size: 14px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(240, 246, 252, 0.1);
}

section {
    margin-bottom: 32px;
}

section h2 {
    font-size: 18px;
    font-weight: 600;
    color: #F0F6FC;
    margin-bottom: 12px;
}

section h3 {
    font-size: 16px;
    font-weight: 500;
    color: #F0F6FC;
    margin-top: 16px;
    margin-bottom: 8px;
}

section p {
    color: #8B949E;
    font-size: 14px;
    line-height: 1.8;
    margin-bottom: 12px;
}
</style>
