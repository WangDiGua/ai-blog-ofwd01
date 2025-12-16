# 项目目录结构说明

iBlog 采用了基于功能模块的组件化架构，旨在实现高内聚低耦合。以下是项目的完整目录树及说明。

```
iblog/
├── src/
│   ├── components/        # 组件层
│   │   ├── layout.tsx     # 布局组件 (Navbar, Footer, MiniPlayer)
│   │   ├── ui.tsx         # UI 组件统一导出入口
│   │   ├── HomeWidgets.tsx # 首页专用小组件 (Weather, FlipCard, Announcements)
│   │   ├── layout/        # 布局具体实现
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MiniPlayer.tsx
│   │   └── ui/            # UI 原子组件与功能组件
│   │       ├── atoms.tsx        # 基础组件 (Button, Avatar, Card, Spinner, Markdown)
│   │       ├── interactions.tsx # 交互组件 (ThemeToggle, Pagination, Toast, FloatingMenu)
│   │       ├── modals.tsx       # 模态框组件 (Search, Admin, Feedback, Report)
│   │       ├── player.tsx       # 全屏音乐播放器组件
│   │       ├── festive.tsx      # 节日装饰挂件 (粒子系统)
│   │       ├── Carousels.tsx    # 轮播组件 (Tags, Categories)
│   │       ├── LiquidLogo.tsx   # Three.js 液态 Logo
│   │       ├── BlackHoleBackground.tsx # Three.js 黑洞背景
│   │       ├── LionFooter.tsx   # Three.js 3D 互动狮子页脚
│   │       ├── Parallax.tsx     # GSAP 视差滚动容器
│   │       └── PageLoader.tsx   # 页面加载动画
│   │
│   ├── context/           # 状态管理层
│   │   └── store.tsx      # React Context 全局状态 (User, Player, Theme)
│   │
│   ├── pages/             # 路由页面层
│   │   ├── home.tsx           # 首页 (Article List, Interactive Hero)
│   │   ├── start-page.tsx     # 浏览器起始页 (Dashboard)
│   │   ├── article-detail.tsx # 文章详情页
│   │   ├── profile.tsx        # 用户个人主页
│   │   ├── community.tsx      # 社区页面 (Posts)
│   │   ├── message-board.tsx  # 留言板 (弹幕交互)
│   │   ├── timeline.tsx       # 时间轴页面
│   │   ├── album.tsx          # 摄影相册
│   │   ├── categories.tsx     # 分类索引
│   │   ├── friend-links.tsx   # 友情链接
│   │   ├── music.tsx          # 音乐页面
│   │   ├── tools.tsx          # 开发者工具页
│   │   ├── ai.tsx             # AI 助手页面 (Gemini Integration)
│   │   ├── about.tsx          # 关于页面
│   │   ├── contact.tsx        # 联系/聊天页面
│   │   └── views.tsx          # 页面导出汇总
│   │
│   ├── services/          # 数据服务层
│   │   ├── api.ts         # 统一 API 接口定义
│   │   ├── client.ts      # Axios/Fetch 封装与 Mock 拦截器
│   │   ├── mockData.ts    # 静态模拟数据源
│   │   └── api/           # 模块化 API 定义
│   │       ├── article.ts
│   │       ├── user.ts
│   │       ├── community.ts
│   │       ├── music.ts
│   │       ├── system.ts
│   │       ├── ai.ts
│   │       └── auth.ts
│   │
│   ├── utils/             # 工具函数
│   │   └── lib.ts         # 防抖、节流、时间计算等通用函数
│   │
│   ├── docs/              # 文档
│   │   ├── API.md              # 接口文档
│   │   ├── DATABASE_SCHEMA.md  # 数据库设计文档
│   │   ├── DEPENDENCIES.md     # 依赖与迁移指南
│   │   └── PROJECT_STRUCTURE.md# 项目结构说明 (本文档)
│   │
│   ├── types.ts           # TypeScript 类型定义
│   ├── App.tsx            # 应用根组件与路由配置
│   ├── index.tsx          # 入口文件
│   └── index.css          # Tailwind 样式入口
│
├── public/                # 静态资源
├── index.html             # HTML 模板
├── package.json           # 项目依赖配置
├── vite.config.ts         # Vite 构建配置
├── tsconfig.json          # TypeScript 配置
└── tailwind.config.js     # Tailwind 样式配置 (如果已弹出配置)
```

## 关键架构更新

1.  **3D & 动画集成**: 引入了 `three.js` 和 `gsap`，在 `components/ui/` 下新增了多个视觉组件（如 `LiquidLogo`, `BlackHoleBackground`, `Parallax`），提升了视觉表现力。
2.  **Mock 数据分离**: 为了应对日益复杂的演示数据，所有静态数据已抽离至 `services/mockData.ts`，`client.ts` 专注于请求拦截和路由分发。
3.  **响应式布局**: 核心页面（如 `home.tsx`, `Navbar.tsx`）已针对 iPad 和移动端进行了深度适配，采用了特定断点的布局策略。
4.  **UI 库**: 继续扩展自建 UI 组件库，新增了 `Carousels`、`PageLoader` 等，保持苹果风格的统一性。