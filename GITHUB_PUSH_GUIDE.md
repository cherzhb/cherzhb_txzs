# GitHub 推送指南

## 方式1: 使用 GitHub Personal Access Token

### 步骤:

1. **创建 Personal Access Token**
   - 访问: https://github.com/settings/tokens
   - 点击 "Generate new token" → "Generate new token (classic)"
   - 设置 Token 名称: `zhbcher_txghzs-deploy`
   - 选择权限: 勾选 `repo` (full control of private repositories)
   - 点击 "Generate token"
   - **重要:** 复制生成的 token (只显示一次!)

2. **推送代码**
   ```bash
   cd /root/.openclaw/zhbcher_txghzs
   
   # 使用 token 推送 (格式: https://TOKEN@github.com/user/repo.git)
   git push https://<YOUR_TOKEN>@github.com/zhbcher/zhbcher_txghzs.git main
   ```

## 方式2: 使用 Git Credential Helper

### 配置并推送:

```bash
cd /root/.openclaw/zhbcher_txghzs

# 配置凭证存储
git config credential.helper store

# 推送 (会提示输入用户名和密码/token)
git push -u origin main
```

输入:
- Username: `zhbcher`
- Password: `<YOUR_GITHUB_TOKEN>` 或 `<YOUR_GITHUB_PASSWORD>`

## 方式3: 使用 SSH (如果已配置 SSH 密钥)

```bash
cd /root/.openclaw/zhbcher_txghzs

# 修改远程地址为 SSH
git remote set-url origin git@github.com:zhbcher/zhbcher_txghzs.git

# 推送
git push -u origin main
```

## 备用方案: 使用 Git Bundle

如果自动推送失败，可以使用 bundle 文件手动上传:

1. Bundle 文件位于: `/root/.openclaw/zhbcher_txghzs/zhbcher_txghzs.bundle`
2. 从 GitHub 下载或克隆项目
3. 从 bundle 克隆:
   ```bash
   git clone zhbcher_txghzs.bundle zhbcher_txghzs
   cd zhbcher_txghzs
   git push https://github.com/zhbcher/zhbcher_txghzs.git main
   ```

## 验证推送

推送成功后，访问: https://github.com/zhbcher/zhbcher_txghzs

## 常见问题

### Q: 推送失败，提示 "Authentication failed"
A: Token 可能已过期或权限不足，请重新生成新 token

### Q: 提示 "remote contains work"
A: 仓库已有内容，强制推送:
```bash
git push -f https://<TOKEN>@github.com/zhbcher/zhbcher_txghzs.git main
```

### Q: 如何删除旧 token?
- 访问: https://github.com/settings/tokens
- 找到旧 token 点击 "Delete"

## 项目信息

- **仓库地址:** https://github.com/zhbcher/zhbcher_txghzs
- **本地路径:** /root/.openclaw/zhbcher_txghzs
- **分支:** main
- **提交数:** 2

## 联系支持

如有问题，请通过以下方式联系:
- Slack DM: @zhbcher
- GitHub Issues: https://github.com/zhbcher/zhbcher_txghzs/issues
