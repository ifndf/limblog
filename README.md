# LimBlog - 个人轻量级动态博客 Demo

这是一个基于 **Next.js (React) + Tailwind CSS + Prisma (SQLite)** 全栈技术栈构建的轻量级博客平台 Demo，专门为部署在 VPS 或 NAS 上设计，主打“我的数据我做主”。

此项目直接受到 Bear Blog 极简理念的启发，核心特点包括：
- 🚀 **极速无缝体验**：不需要任何本地环境构建或 `hexo deploy` 命令行，直接在前端网页端编写、发布博客。
- 📱 **极致简单部署**：所有的后端 API API 与前端 UI 聚合在一个 Next.js 服务中，配合本地 SQLite，部署方便。
- 🎨 **极简排版**：结合 Tailwind CSS 和 Typography 插件，打造原生原味、专注于阅读的界面（支持深色模式等拓展）。

## 💡 为什么选择这套技术栈？

1. **Next.js (App Router)**：全功能的支持 React Server Components, Server Actions 与 API Routes，能够将前端展示页面和保存入库的后端操作一网打尽，无需分离前后端。
2. **Tailwind CSS**：利用 Utility-first 理念极速美化页面开发，非常符合轻量化理念。
3. **Prisma + SQLite**：SQLite 做单文件个人博客数据库体验极佳。在 VPS 或 NAS 个人服务器环境下，不用去开启 MySQL，一切随项目打包运行。Prisma 极大提升了操作数据库的安全性和 TypeScript 开发体验。

## 🛠 本地开发指南

### 1. 安装依赖项
```bash
npm install
```

### 2. 初始化数据库 (Prisma & SQLite)
运行以下命令来创建 SQLite `dev.db` 并迁移初始化表结构：
```bash
npx prisma migrate dev --name init
```

### 3. 可以开始本地测试啦
```bash
npm run dev
```
启动后访问 `http://localhost:3000`。
- 首页会展示文章列表
- 如果你想发文章，目前可以通过 `/new` 前端页面直接尝试（实际生产环境中你需要加上身份验证，仅限自己编写）。

## 🌐 推荐の自托管部署 (VPS/NAS)

既然数据掌控在自己手里，你可以在自己的服务器或 NAS 上轻松运行。

### 使用 Node / PM2 部署 (推荐)
1. 将项目拖入服务器环境
2. `npm install`
3. 初始化并同步数据库结构：`npx prisma db push` 或 `npx prisma migrate deploy`
4. 编译应用：`npm run build`
5. 用 PM2 启动应用：`pm2 start npm --name "limblog" -- run start`

这样你的服务器就会在 `3000` 端口长期运行这个超酷的极简博客平台。你直接就可以在任意终端登录自己建立的发布器随时开始创作了。

_(这里是作为技术栈展示 Demo 使用的，为了让代码保持最简短易读，省略了复杂的用户权限认证系统。如果要上线商用，推荐集成 NextAuth.js 进行管理员权限管控。)_
