# BenBenHome CORS 代理部署指南

这个代理让笨笨家园能静默备份到坚果云（或其他不支持 CORS 的 WebDAV 服务）。

## 部署到 Render（免费）

### 1. 创建 GitHub 仓库
- 在 GitHub 新建一个仓库（比如叫 `benben-proxy`）
- 把 `server.js` 和 `package.json` 上传到仓库

### 2. 在 Render 创建服务
- 打开 https://render.com ，用 GitHub 登录
- 点 **New** → **Web Service**
- 选择刚才创建的仓库
- 设置：
  - **Name**: `benben-proxy`（随便起）
  - **Region**: Singapore（离你最近）
  - **Runtime**: Node
  - **Build Command**: `npm install`
  - **Start Command**: `npm start`
  - **Instance Type**: **Free**
- 点 **Deploy Web Service**

### 3. 获取代理地址
- 部署完成后，Render 会给你一个地址，类似：
  `https://benben-proxy.onrender.com`
- 复制这个地址

### 4. 在笨笨家园配置
- 打开笨笨家园 → 设置 → 备份
- **WebDAV 服务器地址**: `https://dav.jianguoyun.com/dav`
- **用户名**: 你的坚果云邮箱
- **密码**: 坚果云的**应用密码**（不是登录密码，在坚果云设置 → 安全选项 → 第三方应用管理 里生成）
- **CORS 代理地址**: 粘贴 Render 给的地址
- **备份路径**: `/BenBenHome/`（默认就好）
- 点"保存配置" → "测试连接"
- 看到"连接成功 [经代理]"就OK了

### 5. 启用自动备份
- 勾选"启用自动备份"
- 设置间隔（比如 50 条消息）
- 以后每 50 条消息会静默备份到坚果云，云端滚动保留最近 5 份
