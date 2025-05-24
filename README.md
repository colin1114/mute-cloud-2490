# 图片上传服务

基于 Cloudflare Pages 和 R2 存储的图片上传服务。支持拖放上传、点击上传和粘贴上传，并提供即时的图片预览和 URL 分享功能。

## 功能特点

- 📤 多种上传方式
  - 拖放上传
  - 点击选择文件
  - Ctrl+V 粘贴上传
- 🖼️ 即时图片预览
- 📋 便捷的 URL 复制
  - 支持普通 URL 复制
  - 支持 Markdown 格式 URL 复制
- 🔒 安全的文件存储
  - 使用 Cloudflare R2 存储
  - 自动生成唯一文件名
- 💫 现代化 UI 设计
  - 响应式布局
  - 优雅的动画效果
  - 清晰的操作反馈

## 技术栈

- 前端
  - React
  - TypeScript
  - TailwindCSS
  - Vite
- 后端
  - Cloudflare Pages Functions
  - Cloudflare R2 存储

## 部署指南

### 前提条件

- Cloudflare 账号
- Node.js 16+ 和 npm

### 步骤 1: 配置 R2 存储

1. 登录 Cloudflare 控制台
2. 创建 R2 存储桶
   - 进入 R2 部分
   - 创建新的存储桶（例如：`image-uploads`）
   - 启用公共访问
   - 记录生成的公共域名

### 步骤 2: 配置 Pages 项目

1. Fork 或克隆本仓库
2. 在 Cloudflare Pages 中创建新项目
3. 连接到您的代码仓库
4. 配置构建设置：
   - 构建命令：`npm run build`
   - 输出目录：`dist`
5. 配置环境变量：
   - `R2_PUBLIC_DOMAIN`: R2 存储桶的公共域名

### 步骤 3: 绑定 R2 存储桶

1. 在 Pages 项目设置中
2. 找到 "Functions" 部分
3. 添加 R2 存储桶绑定：
   - 绑定名称：`BUCKET`
   - 选择之前创建的存储桶

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 部署到 Cloudflare Pages
npx wrangler pages deploy dist
```

## 生产环境建议

1. 配置自定义域名
2. 启用 Cloudflare Access 控制访问权限
3. 配置 Cloudflare 缓存规则
4. 设置上传文件大小限制
5. 实施更严格的文件类型验证

## 许可证

MIT

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建您的特性分支
3. 提交您的改动
4. 推送到您的分支
5. 创建 Pull Request

## 联系方式

如有问题或建议，请提交 Issue。 