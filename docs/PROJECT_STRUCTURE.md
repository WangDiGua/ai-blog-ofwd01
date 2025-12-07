# 项目目录结构说明

iBlog 采用了基于功能模块的组件化架构，旨在实现高内聚低耦合。以下是项目的完整目录树及说明。

```
iblog/
├── src/
│   ├── components/        # 组件层
│   │   ├── layout.tsx     # 布局组件 (Navbar, Footer, AuthForm)
│   │   ├── ui.tsx         # UI 组件统一导出入口
│   │   └── ui/            # UI 原子组件与功能组件
│   │       ├── atoms.tsx        # 基础组件 (Button, Avatar, Card, Spinner)
│   │       ├── interactions.tsx # 交互组件 (ThemeToggle, Pagination, Toast)
│   │       ├── modals.tsx       # 模态框组件 (Search, Admin, Feedback)
│   │       ├── player.tsx       # 音乐播放器组件
│   │       └── festive.tsx      # 节日装饰挂件
│   │
│   ├── context/           # 状态管理层
│   │   └── store.tsx      # React Context 全局状态 (User, Player, Theme)
│   │
│   ├── pages/             # 路由页面层
│   │   ├── home.tsx           # 首页 (Article List, Hero)
│   │   ├── article-detail.tsx # 文章详情页
│   │   ├── profile.tsx        # 用户个人主页
│   │   ├── community.tsx      # 社区页面
│   │   ├── music.tsx          # 音乐页面
│   │   ├── tools.tsx          # 开发者工具页
│   │   ├── ai.tsx             # AI 助手页面 (Gemini Integration)
│   │   ├── about.tsx          # 关于页面
│   │   └── contact.tsx        # 联系/聊天页面
│   │
│   ├── services/          # 数据服务层
│   │   ├── api.ts         # 统一 API 接口定义
│   │   └── client.ts      # Axios 模拟客户端与 Mock 数据
│   │
│   ├── utils/             # 工具函数
│   │   └── lib.ts         # 防抖、节流等通用函数
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

## 关键架构决策

1.  **Context API vs Redux**: 考虑到应用规模，使用 React Context (`store.tsx`) 处理全局状态（用户信息、播放器、主题）已足够，避免了 Redux 的样板代码。
2.  **Service Layer**: 所有数据请求逻辑封装在 `services/api.ts` 中，页面组件不直接调用 `client`，实现了 UI 与数据获取的解耦。
3.  **UI 库**: 采用自建 UI 组件 (`components/ui/`) 结合 Tailwind CSS，而非引入庞大的组件库 (如 AntD)，以保持“苹果风格”的视觉一致性和轻量化。
4.  **Mock 数据**: 数据层目前使用 `services/client.ts` 中的 `MockRequest` 类模拟后端延迟和响应，方便在无后端环境下开发。