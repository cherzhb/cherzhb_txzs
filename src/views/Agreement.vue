<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const lastUpdated = '2026年2月19日'
</script>

<template>
    <div class="agreement-page">
        <div class="page-container">
            <!-- Header -->
            <div class="header">
                <van-icon name="arrow-left" @click="router.back()" />
                <h1>用户协议</h1>
            </div>

            <!-- Content -->
            <div class="content">
                <p class="update-time">最后更新时间：{{ lastUpdated }}</p>

                <section>
                    <h2>1. 协议的接受</h2>
                    <p>欢迎使用退休规划助手（以下简称"本应用"）。通过访问、注册或使用本应用，您表示已阅读、理解并同意本《用户协议》（以下简称"本协议"）的条款。如果您不同意本协议的任何条款，请立即停止使用本应用。</p>
                </section>

                <section>
                    <h2>2. 服务内容</h2>
                    <p>本应用提供退休规划相关的计算、资讯、档案管理等服务。我们有权随时修改、暂停或终止部分或全部服务，恕不另行通知。</p>
                </section>

                <section>
                    <h2>3. 用户注册</h2>
                    <p>3.1 用户注册时必须提供真实、准确、完整的个人信息，并承诺及时更新个人资料。</p>
                    <p>3.2 用户注册成功后，将获得一个账号和密码。用户对账号和密码的安全性负全部责任。</p>
                    <p>3.3 用户不得将账号密码泄露、转让或借给他人使用。因用户保管不当导致的损失，本应用不承担责任。</p>
                </section>

                <section>
                    <h2>4. 用户行为规范</h2>
                    <p>4.1 用户在使用本应用时不得违反法律法规，不得从事以下行为：</p>
                    <ul>
                        <li>发布、传播违法、不良、虚假信息</li>
                        <li>侵犯他人知识产权、隐私权等合法权益</li>
                        <li>利用本应用进行诈骗、欺诈等违法行为</li>
                        <li>攻击、干扰本服务的正常运行</li>
                        <li>其他违反法律法规或公序良俗的行为</li>
                    </ul>
                    <p>4.2 用户如违反本协议，本应用有权暂停或终止其服务，并追究其法律责任。</p>
                </section>

                <section>
                    <h2>5. 服务条款的修改</h2>
                    <p>本应用有权根据需要修改本协议条款。修改后的协议将在应用内公布，用户继续使用本服务即视为同意修改后的协议。</p>
                </section>

                <section>
                    <h2>6. 免责声明</h2>
                    <p>6.1 本应用提供的养老金测算结果仅供参考，不构成任何投资、理财建议。</p>
                    <p>6.2 本应用对信息的准确性、完整性、及时性不作保证，不承担因信息错误或遗漏导致的任何责任。</p>
                    <p>6.3 因不可抗力、网络故障、系统维护等原因导致的服务中断或延误，本应用不承担责任。</p>
                </section>

                <section>
                    <h2>7. 隐私保护</h2>
                    <p>本应用重视用户隐私保护，具体的隐私政策请参阅《隐私政策》。</p>
                </section>

                <section>
                    <h2>8. 知识产权</h2>
                    <p>本应用的所有内容，包括但不限于文字、图片、音频、视频、软件、程序、版面设计等，均受知识产权法保护。未经本应用书面许可，用户不得擅自复制、传播、修改、展示。</p>
                </section>

                <section>
                    <h2>9. 协议终止</h2>
                    <p>9.1 用户可以随时通过注销账号的方式终止本协议。</p>
                    <p>9.2 本应用有权在用户违反本协议时暂停或终止向用户提供服务。</p>
                    <p>9.3 协议终止后，用户使用本服务的权利立即终止，本应用无需对用户承担任何责任。</p>
                </section>

                <section>
                    <h2>10. 争议解决</h2>
                    <p>本协议的订立、执行、解释及争议解决均适用中华人民共和国法律。如发生争议，双方应友好协商解决；协商不成的，可向本应用所在地人民法院提起诉讼。</p>
                </section>

                <section>
                    <h2>11. 联系方式</h2>
                    <p>如您对本协议有任何疑问，请通过本应用提供的联系方式与我们联系。</p>
                </section>
            </div>
        </div>
    </div>
</template>

<style scoped>
.agreement-page {
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

section p {
    color: #8B949E;
    font-size: 14px;
    line-height: 1.8;
    margin-bottom: 12px;
}

section ul {
    margin-left: 20px;
    margin-bottom: 12px;
}

section ul li {
    color: #8B949E;
    font-size: 14px;
    line-height: 1.8;
    margin-bottom: 8px;
}
</style>
