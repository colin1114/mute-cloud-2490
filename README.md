# 图片上传应用

这是一个基于 Cloudflare Workers 和 R2 存储的图片上传应用。支持拖放上传、点击选择和剪贴板粘贴上传功能。

## 功能特点

- 支持多种上传方式：
  - 点击上传按钮选择文件
  - 拖放文件上传
  - 剪贴板粘贴上传（Ctrl+V）
- 实时预览上传的图片
- 使用 Cloudflare R2 存储图片
- 美观的用户界面

## 部署步骤

### 1. 准备工作

1. 安装 Node.js（建议 16.x 或更高版本）
2. 安装 Wrangler CLI：
   ```bash
   npm install -g wrangler
   ```
3. 登录到 Cloudflare：
   ```bash
   wrangler login
   ```

### 2. 创建 R2 存储桶

1. 在 Cloudflare 控制台创建 R2 存储桶：
   - 进入 Cloudflare 控制台
   - 选择 "R2" 
   - 点击 "Create bucket"
   - 创建名为 "image-uploads" 的存储桶
   - 如果需要测试环境，创建名为 "image-uploads-preview" 的存储桶

### 3. 配置项目

1. 克隆项目并安装依赖：
   ```bash
   git clone <项目地址>
   cd image-uploader
   npm install
   ```

2. 检查 `wrangler.toml` 配置：
   - 确保 `bucket_name` 和 `preview_bucket_name` 与你创建的 R2 存储桶名称一致

### 4. 部署

1. 构建并部署项目：
   ```bash
   npm run build
   wrangler deploy
   ```

2. 部署完成后，Wrangler 会输出应用的 URL，类似：
   ```
   https://image-uploader.<your-subdomain>.workers.dev
   ```

### 5. 使用自定义域名（可选）

1. 在 Cloudflare 控制台中：
   - 进入 "Workers & Pages"
   - 选择你的 Worker
   - 点击 "Triggers" 标签
   - 在 "Custom Domains" 部分添加你的域名

## 本地开发

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 访问 `http://localhost:8787` 进行测试

## 注意事项

- 确保你的 Cloudflare 账户已启用 R2 存储服务
- R2 存储服务是付费服务，请查看 Cloudflare 的定价页面了解详情
- 建议设置适当的 CORS 策略和访问控制
- 考虑添加文件大小限制和文件类型验证

## 技术栈

- Frontend: React + TailwindCSS
- Backend: Cloudflare Workers
- Storage: Cloudflare R2
- Build Tool: Vite

## 许可证

MIT 