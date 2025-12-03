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

## 部署指南（概览）

- 前端：构建 `pnpm build`，部署至静态托管或 CDN
- 后端：Node 服务部署（PM2/Docker），配置环境变量与持久化存储
- 域名与 HTTPS：启用 HTTPS，配置跨域策略

## 性能优化方向

- 缩略图与懒加载、分页与服务端过滤
- 关键交互防抖与节流、列表虚拟化
- CDN 与缓存策略、合并请求与并发控制

## 交付标准

- 完整源代码与文档（本 README + 接口说明）
- 部署指南与运维手册（日志、备份、故障恢复）
- 性能优化报告（指标、瓶颈与改进方案）
