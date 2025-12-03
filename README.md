# React + TypeScript + Vite
# 图片提示词收藏与分享网站
## 项目概述

一个专业的图片提示词收藏与分享网站，支持图片展示、高清详情、提示词管理与版本控制、ImgBB 图床上传、多级分类与统计、JWT 用户认证，以及“公开/私有”可见性控制。

## 核心功能

- 图片展示：响应式网格缩略图，按分类与可见性筛选
- 图片详情：高清展示、放大查看、完整提示词与元数据
- 图床集成：ImgBB 上传，保存返回 URL 与删除链接，支持批量与进度显示
- 提示词管理：一键复制、关键词高亮、编辑与版本控制
- 分类系统：至少二级分类、标签云、按分类统计图片数量
- 可见性控制：支持 `public/private`，公开对所有访客可见，私有仅作者可见
- 用户与安全：JWT 登录/注册，按用户与可见性进行访问控制

## 技术栈

- 前端：React + TypeScript + Vite
- 后端：Node.js（REST API）
- 数据库：存储图片元数据、分类与提示词版本
- 图床：ImgBB API
- 认证：JWT

## 快速开始

1. 安装依赖：`pnpm install`
2. 创建并填写环境变量文件：`cp .env.example .env`
3. 开发运行：`pnpm dev`

## 环境变量

- `VITE_IMGBB_API_KEY`：ImgBB API Key（前端上传用）
- `VITE_API_BASE_URL`：后端 API 基址，例如 `http://localhost:3000`
- 后端环境（示例）：`JWT_SECRET`、数据库连接字符串

## 前端主要页面

- `首页`：响应式网格展示、分类筛选、可见性筛选、复制提示词
- `图片详情`：高清图、放大查看、提示词与元数据、可见性徽章
- `上传页`：选择图片、填写提示词与分类、切换可见性、批量上传与进度
- `登录/注册`：JWT 认证入口
- `分类页`：标签云与分类统计
- `搜索页`：按关键词检索与高亮

## 可见性控制

- 字段：`visibility`，取值 `public` 或 `private`
- 列表与详情过滤：
  - 访客：仅能浏览 `public`
  - 登录用户：可浏览自己的 `private` 与所有 `public`
- 上传与编辑：支持切换可见性并持久化

## 后端 API 约定（示例）

- `POST /api/auth/login`、`POST /api/auth/register`：返回 JWT
- `GET /api/images?visibility=public|private&category=...`：按条件分页查询
- `GET /api/images/:id`：图片详情（按权限控制）
- `POST /api/images`：创建图片（含 ImgBB 返回的 `url` 与 `delete_url`）
- `PATCH /api/images/:id`：更新提示词、分类、可见性、版本号等

## 数据模型（示例）

- Image：`id`、`url`、`deleteUrl`、`prompt`、`authorId`、`visibility`、`categories`、`createdAt`、`updatedAt`、`version`
- PromptVersion：`id`、`imageId`、`content`、`createdAt`、`authorId`
- Category：`id`、`name`、`parentId`
- User：`id`、`email`、`passwordHash`、`createdAt`

## ImgBB 上传流程

- 前端将文件以 `FormData` 调用 `https://api.imgbb.com/1/upload?key=${VITE_IMGBB_API_KEY}`
- 成功后保存响应中的图片 `url` 与 `delete_url`
- 批量上传：队列并行 + 进度条，失败重试与错误提示

## 提示词管理

- 一键复制：`navigator.clipboard.writeText(prompt)`
- 关键词高亮：输入关键字后在列表与详情中高亮匹配词
- 编辑与版本控制：保存历史版本，支持回滚查看

## 分类系统

- 二级分类：`Category.parentId` 支持树状层级
- 标签云：按图片数量统计权重展示
- 统计：页面顶部展示每个分类下的图片计数

## 测试指南

- 响应式：手机、平板、桌面断点覆盖
- 图床稳定性：模拟多文件上传、失败重试、超时与网络波动
- 复制兼容性：Chrome、Firefox、Safari、Edge 验证

## 部署指南

本专案支持多种部署方式，推荐使用 Vercel 进行一键全栈部署。

### 方案一：Vercel 部署（推荐）

本项目已配置 `vercel.json`，支持前端静态资源与后端 Serverless API 的一键部署。

1. **准备工作**
   - 将代码提交到 GitHub/GitLab/Bitbucket 仓库。
   - 注册并登录 [Vercel](https://vercel.com)。

2. **导入项目**
   - 在 Vercel Dashboard 点击 "Add New..." -> "Project"。
   - 选择你的 Git 仓库。

3. **配置项目**
   - **Framework Preset**: 选择 `Vite`。
   - **Root Directory**: 保持默认 (`./`)。
   - **Environment Variables**: 填入生产环境配置：
     - `VITE_IMGBB_API_KEY`: 你的 ImgBB API Key
     - `VITE_API_BASE_URL`: `/api` (因为 Vercel 会将后端部署在同域名的 /api 路径下)
     - `SUPABASE_URL`: 你的 Supabase 项目 URL
     - `SUPABASE_KEY`: 你的 Supabase Anon Key (或者 Service Role Key，视后端需求而定)
     - `JWT_SECRET`: 用于签发 Token 的密钥

4. **部署**
   - 点击 "Deploy"。Vercel 会自动构建前端并部署后端 API。

### 方案二：Docker 容器化部署

如果你希望将前后端打包在一个容器中运行，可以使用以下 `Dockerfile`。

1. **创建 Dockerfile**
   在项目根目录创建名为 `Dockerfile` 的文件：

   ```dockerfile
   # Build Stage
   FROM node:18-alpine as builder
   WORKDIR /app
   COPY package.json pnpm-lock.yaml ./
   RUN npm install -g pnpm && pnpm install
   COPY . .
   RUN pnpm build

   # Production Stage
   FROM node:18-alpine
   WORKDIR /app
   
   # 安装生产依赖（包含后端所需的 express 等）
   COPY package.json pnpm-lock.yaml ./
   RUN npm install -g pnpm && pnpm install --prod

   # 复制构建产物
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/api ./api
   
   # 暴露端口
   EXPOSE 3000
   
   # 启动命令（需确保 api/server.ts 被编译或使用 tsx 运行，这里演示使用 tsx）
   RUN npm install -g tsx
   CMD ["tsx", "api/server.ts"]
   ```

   *注意：生产环境建议先将 TS 编译为 JS 再运行，上述 Dockerfile 为简化版。*

2. **构建与运行**
   ```bash
   docker build -t picprompt .
   docker run -p 3000:3000 --env-file .env picprompt
   ```

### 方案三：传统 Node.js 服务器部署

适用于 VPS 或云服务器（如 Ubuntu/CentOS）。

1. **环境准备**
   - 安装 Node.js 18+
   - 安装 PM2: `npm install -g pm2`

2. **构建项目**
   ```bash
   # 安装依赖
   pnpm install
   
   # 构建前端
   pnpm build
   ```

3. **配置后端**
   确保后端 `api/server.ts` 可以提供静态文件服务（需要修改代码以指向 `dist` 目录），或者使用 Nginx 反向代理。

   **推荐 Nginx 方案：**
   - Nginx 监听 80/443
   - `/api` 转发给 `localhost:3000` (Node 后端)
   - `/` 指向 `dist` 目录 (前端静态文件)

4. **启动后端**
   ```bash
   pm2 start "tsx api/server.ts" --name picprompt-api
   ```

## 数据库迁移

无论使用哪种部署方式，都需要确保 Supabase 数据库架构已更新。

1. 在本地运行迁移（如果已安装 Supabase CLI）：
   ```bash
   supabase db push
   ```
2. 或者手动在 Supabase Dashboard 的 SQL Editor 中执行 `supabase/migrations` 目录下的 SQL 文件内容。

## 性能优化方向

- 缩略图与懒加载、分页与服务端过滤
- 关键交互防抖与节流、列表虚拟化
- CDN 与缓存策略、合并请求与并发控制

## 交付标准

- 完整源代码与文档（本 README + 接口说明）
- 部署指南与运维手册（日志、备份、故障恢复）
- 性能优化报告（指标、瓶颈与改进方案）
