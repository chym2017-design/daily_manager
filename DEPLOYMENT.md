# 部署指南

## 方案一：Vercel 部署（推荐，免费）

### 成本
- **完全免费**
- 可选：自定义域名 ¥30-80/年

### 步骤

#### 1. 准备 Git 仓库
```bash
# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"
```

#### 2. 推送到 GitHub
```bash
# 在 GitHub 创建新仓库后
git remote add origin https://github.com/你的用户名/daily-manager.git
git branch -M main
git push -u origin main
```

#### 3. 部署到 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择你的 daily-manager 仓库
5. 点击 "Deploy"

#### 4. 完成
- Vercel 会自动构建并部署
- 获得免费域名：`your-project.vercel.app`
- 每次推送代码会自动重新部署

---

## 方案二：Netlify 部署（免费）

### 步骤
1. 访问 [netlify.com](https://netlify.com)
2. 使用 GitHub 登录
3. 点击 "Add new site" → "Import an existing project"
4. 选择 GitHub 仓库
5. 构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
6. 点击 "Deploy"

---

## 方案三：GitHub Pages（免费）

### 步骤

#### 1. 修改 vite.config.ts
添加 base 配置：
```typescript
export default defineConfig({
  base: '/daily-manager/', // 你的仓库名
  plugins: [vue()],
})
```

#### 2. 构建并部署
```bash
# 构建
npm run build

# 进入构建目录
cd dist

# 初始化 git
git init
git add -A
git commit -m 'deploy'

# 推送到 gh-pages 分支
git push -f git@github.com:你的用户名/daily-manager.git main:gh-pages

cd ..
```

#### 3. 启用 GitHub Pages
1. 进入仓库 Settings
2. 找到 Pages 选项
3. Source 选择 gh-pages 分支
4. 保存

---

## 成本对比

| 方案 | 月成本 | 年成本 | 带宽 | 特点 |
|------|--------|--------|------|------|
| Vercel | ¥0 | ¥0 | 100GB/月 | 自动部署，推荐 |
| Netlify | ¥0 | ¥0 | 100GB/月 | 自动部署 |
| GitHub Pages | ¥0 | ¥0 | 100GB/月 | 简单直接 |
| Cloudflare Pages | ¥0 | ¥0 | 无限 | 无限带宽 |
| 自定义域名 | - | ¥30-80 | - | 可选，更专业 |

---

## 推荐配置

**最佳方案：Vercel（免费）**
- ✅ 零成本
- ✅ 自动部署
- ✅ 全球CDN
- ✅ 免费HTTPS
- ✅ 简单易用

**升级方案：Vercel + 自定义域名**
- 成本：¥30-80/年
- 获得专业域名（如 daily-manager.com）

---

## 注意事项

1. **数据存储**：应用使用 localStorage 存储数据，数据保存在用户浏览器中
2. **隐私安全**：所有数据都在本地，不会上传到服务器
3. **跨设备同步**：目前不支持，每个设备独立存储数据
4. **备份建议**：使用应用内的导出功能定期备份数据
