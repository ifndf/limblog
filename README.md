# LimBlog

**Less is More.**

LimBlog 是一个模仿 [Bear Blog](https://bearblog.dev/) 风格的极简博客系统。因为喜欢 Bear Blog 那种纯粹、克制的设计哲学，所以做了这个可以自托管的开源版本。

## 理念

- 只关注文字，不关注样式
- 没有广告、弹窗、跟踪代码
- 访客看到的页面干净到只有标题、日期和正文
- 管理后台够用就好，不做多余的事

---

## 部署

基于 **Next.js 15** + **Prisma (SQLite)** + **Tailwind CSS** 构建。

### Docker Compose（推荐）

适用于 VPS、威联通 / 群晖 NAS 等环境。

```bash
git clone https://github.com/ifndf/limblog.git
cd limblog
docker-compose up -d --build
```

启动后访问 `http://你的IP:3456` 即可。

`docker-compose.yml` 默认配置：

```yaml
ports:
  - "3456:3000"       # 宿主机端口:容器端口，左侧可自行修改
environment:
  - DATABASE_URL=file:/app/data/limblog.db
volumes:
  - ./data:/app/data  # 数据持久化，容器删除后数据不丢失
```

**NAS 用户（Container Station 等图形界面）要点：**
1. 端口映射：宿主机任意端口 → 容器 `3000`
2. 存储挂载：NAS 本地文件夹 → 容器 `/app/data`
3. 环境变量：`DATABASE_URL` = `file:/app/data/limblog.db`

### 本地运行（Windows / Linux / macOS）

需要 [Node.js](https://nodejs.org/) >= 18。

```bash
git clone https://github.com/ifndf/limblog.git
cd limblog
npm install
npx prisma db push
npm run dev           # 开发环境，访问 http://localhost:3000
# npm run build && npm start   # 生产环境
```

> 开发模式下左下角会出现 Next.js 的调试浮层（Route / Bundler 等），这是框架自带的开发工具，生产环境不会出现。

---

## 管理后台

为了保持页面极简，前台不显示任何登录入口。

- 登录地址：`http://你的域名/login`
- 首次登录后请立即修改默认账号密码（设置 → 账户设置）
- 博客名称、底部仓库链接、主页内容、联系方式均可在后台「站点配置」中修改

**Powered by Lim**
