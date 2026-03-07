# Vercel 部署指南

## 环境变量配置

本项目使用 Vite 构建，需要使用 `VITE_` 前缀的环境变量才能在客户端访问。在 Vercel 部署前，请确保配置以下环境变量：

### 必需的环境变量

| 变量名 | 说明 | 获取方式 |
|--------|------|---------|
| `VITE_ARK_API_KEY` | 火山引擎豆包大模型 API Key | https://console.volcengine.com/ark |

### 可选的环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `VITE_IMGBB_API_KEY` | `bee27e6d4b59730243e9707abbd52d49` | ImgBB 图床 API Key |

---

## 部署步骤

### 1. 推送到 GitHub

```bash
cd C:\Users\13329\PycharmProjects\ops-refiner

# 初始化 git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 添加远程仓库（替换为你的 GitHub 仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/ops-refiner.git

# 推送
git push -u origin main
```

### 2. 在 Vercel 上导入项目

1. 访问 [Vercel 官网](https://vercel.com)
2. 点击 "Add New Project"
3. 选择 "Import Git Repository"
4. 选择你的 `ops-refiner` 仓库
5. 点击 "Import"

### 3. 配置环境变量

在 Vercel 项目设置中：

1. 进入 **Settings** → **Environment Variables**
2. 添加以下环境变量：
   - `VITE_ARK_API_KEY`: 你的火山引擎 API Key（必须使用 VITE_ 前缀）
   - `VITE_IMGBB_API_KEY`: （可选）你的 ImgBB API Key（必须使用 VITE_ 前缀）
3. 点击 "Save"

### 4. 部署

- Vercel 会自动构建并部署你的项目
- 部署完成后，你会获得一个 `https://ops-refiner.vercel.app` 的域名
- 也可以绑定自定义域名

---

## 本地开发

### 安装依赖

```bash
npm install
```

### 配置本地环境变量

1. 复制 `.env.example` 为 `.env.local`：
   ```bash
   cp .env.example .env.local
   ```

2. 编辑 `.env.local`，填入你的 API Key：
   ```
   VITE_ARK_API_KEY=your_ark_api_key_here
   VITE_IMGBB_API_KEY=bee27e6d4b59730243e9707abbd52d49
   ```

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 预览效果。

---

## 注意事项

### 前端调用 API 的安全性

⚠️ **重要提示**：当前项目是纯前端实现，API Key 会暴露在前端代码中。

**适用于：**
- 内部工具
- 受信任的用户群体
- 快速原型验证

**生产环境建议：**
1. 使用后端代理转发 API 请求
2. 使用 Vercel Serverless Functions 封装 API 调用
3. 添加访问权限控制

### API Key 安全最佳实践

1. **永远不要将 `.env.local` 提交到 git** - 已在 `.gitignore` 中配置
2. **定期轮换 API Key** - 建议每 3-6 个月更换一次
3. **限制 API Key 权限** - 在火山引擎控制台设置最小权限
4. **监控 API 使用量** - 设置用量告警，防止滥用

---

## 故障排查

### 构建失败

检查 `package.json` 中的依赖是否正确：
```bash
npm install
npm run build
```

### API 调用失败

1. 确认环境变量已正确配置
2. 检查 API Key 是否有效
3. 查看浏览器控制台错误信息
4. 确认图片 URL 可公网访问

### 图片上传失败

1. 检查图片格式（支持 JPG/PNG/WebP/BMP/GIF）
2. 确认图片大小不超过 10MB
3. 验证 ImgBB API Key 是否有效

---

## 技术支持

如有问题，请联系：
- 余凯航 (yukaihang1)
- 林至立 (linzhili.5)