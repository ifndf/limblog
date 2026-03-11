# LimBlog

**Lim (Less is More)** 

LimBlog 是一个受 [Bear Blog](https://bearblog.dev/) 启发的极简主义动态博客系统。

## 🎯 核心理念 (Core Philosophy)

当今由于五花八门的页面效果、弹窗、动画以及冗杂的交互功能，互联网正变得越来越臃肿，我们的注意力也因此不断被分散。

LimBlog 诞生的唯一目的，就是为了**“回归文字本身”**。

- 摒弃了花哨的过渡动画与复杂的分类流，带来最极致的加载与阅读体验。
- 没有恼人的广告、订阅弹窗和无处不在的跟踪代码。
- 采用最干练且低调的纯粹排版，所有的导航甚至搜索框都被极简化或对访客隐藏，将最大的关注度交还给文字和信息的传递。
- 极简化但不简陋的管理后台，让你随时专注于思考和写作。

在这里，只传达纯粹的心得、思想，而不是为了展示眼花缭乱的网页设计。

---

## 🚀 部署方法 (Deployment)

LimBlog 基于最新的 **Next.js 15 (App Router)**、**Tailwind CSS** 和 **Prisma (SQLite)** 构建，非常适合个人使用和独立部署。

### 1. Docker Compose 一键部署 (推荐服务器 & NAS 用户)

对于绝大多数拥有服务器 (VPS)、或者**威联通 (QNAP) / 群晖等 NAS** 的用户来说，非常建议直接使用 Docker 容器化配置，一键跑起来并与宿主机系统完全隔离。

本项目已经内置了处理好一切环境依赖与构建步骤的 `Dockerfile` 和 `docker-compose.yml` 文件。

**部署步骤：**

1. 首先把代码拉取到你的服务器或 NAS 本地：
```bash
git clone https://github.com/ifndf/limblog.git
cd limblog
```

2. 打开目录下的 `docker-compose.yml` 可以发现以下配置（**你不需要修改它，直接用即可**）：
```yaml
version: '3.8'

services:
  limblog:
    build: . # 这里的 '.' 代表它会自动寻找当前仓库目录下的 Dockerfile 进行依赖环境安装和编译构建
    container_name: limblog
    restart: always
    ports:
      - "3000:3000"
    environment:
      # 指定 Prisma 数据库路径为容器内部的挂载路径
      - DATABASE_URL=file:/app/data/limblog.db
    volumes:
      # 【核心说明 - 数据持久卷】
      # 冒号左侧: 这是宿主机/NAS 上真实存在的路径（自动在当前目录下生成 data 文件夹）
      # 冒号右侧: 是容器内应用读取数据库使用的静态路径，请保持为 /app/data 不要变动
      - ./data:/app/data
```

3. 在该目录终端直接执行一键编译与启动（它会自动安装 Node 环境、Prisma 依赖并打包好项目）：
```bash
docker-compose up -d --build
```

**针对威联通 / 群晖 NAS 的图形化界面用户的补充说明：**
如果你由于各种原因无法使用命令行 `docker-compose`，而必须要在 NAS 系统里使用图形化的 Container Station：
1. 请确保你在图形界面创建应用时，选取我们这份仓库通过构建而来的镜像（或者使用我们在后续推送到 Docker Hub 的对应预编译镜像）。
2. **端口映射**：确保主机的外网端口映射到了容器内部的 `3000` 端口。
3. **存储挂载**：一定要在 NAS 上建立一个本地实体文件夹，把它**挂载**给容器中的 `/app/data` 目录，并确保映射无误。这是至关重要的！这样即使容器日后重启、更新或意外删除，你用心攥写的全部博客数据依然完好如初。
4. **环境变量**：添加一条 `DATABASE_URL` 的值为 `file:/app/data/limblog.db`。

---

### 2. Windows / Linux 本机原生体验与开发

如果你只是想在本地自己跑一跑，请确保系统已经安装了 [Node.js](https://nodejs.org/) (官方建议 >= 18) 和 npm 管理器。

```bash
# 1. 克隆这套代码仓库
git clone https://github.com/ifndf/limblog.git
cd limblog

# 2. 安装全部依赖
npm install

# 3. 初始化并同步本地 SQLite 数据库格式
npx prisma db push

# 4. (开发环境测试) 启动项目，可访问 http://localhost:3000 查看效果
npm run dev

# 5. (生产环境运行) 编译出正式版本的应用并启动
npm run build
npm start
```

---

## 💡 疑问解答（FAQ）

**Q: 我在本地 npm run dev 运行时，网页左下角会看到一个灰白底边框的标志（比如写着 Route / Bundler / Preferences 等属性），假如我准备对外发布了，需要想办法在代码里移除或隐藏它吗？**

**不需要！完全不用管它。** 那个悬浮框是 Next.js 开发服务引擎自带的 **“开发指示器 (Dev Overlay)”**，它是故意放置在那里只为了协助你在本地看报错或编译状态的。
只要你不是使用 `dev` 指令而是**编译正式发布**（即通过 Docker 部署，或者通过 `npm run build && npm start` 在生产环境下开启端口），这个组件都会由底层框架自动销毁，永远也**绝对不会**在访客浏览器端显示出来。

---

## 👑 关于管理员与全透明后端

为了保持绝美的极简设计，“后台登录”这种无关紧要的选项已经被直接被从主页面和访客的视线中**完全剔除**。

作为网站的博主和主人：
1. 你的默认后台登录入口是在博客的根后缀加上 `/login`。例如：`http://localhost:3000/login`。
2. 内部由完善的会话拦截和极简现代的后台管理区组成，包含基础账号变更、MD/ZIP 格式的数据导入/整体导出机制。
3. 请切记：网站部署完毕并使用系统默认管理账户第一次访问后台管理后，**立刻**前往 “站点配置 -> 账户设置” 更改独属于你自己的账号密码。
4. 顶部标题和底部极简署名（GitHub 等仓库定向外链），均可通过纯 Web 控制面板（后台“站点配置”）自主随意切换完成。

**Powered by Lim** | 一切归于文本
