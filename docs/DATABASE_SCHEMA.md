# iBlog 数据库设计方案

本文档为 iBlog 前端项目对应的后端数据库设计方案。设计采用关系型数据库（如 MySQL/PostgreSQL）模型，旨在支持现有的博客、社区、AI助手、音乐播放及社交互动功能。

## 1. 用户中心 (User Center)

### 1.1 用户表 (`users`)
存储用户的基本信息、权限角色及统计数据。

| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PK | 用户唯一标识 (UUID) |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | 登录用户名 |
| `email` | VARCHAR(100) | UNIQUE, NULL | 邮箱地址 (可选) |
| `password_hash` | VARCHAR(255) | NOT NULL | 加密后的密码 |
| `name` | VARCHAR(50) | NOT NULL | 显示昵称 |
| `avatar_url` | VARCHAR(255) | | 头像链接 |
| `bio` | TEXT | | 个人简介 |
| `cover_image` | VARCHAR(255) | | 个人主页背景图 |
| `role` | ENUM | DEFAULT 'user' | 角色: 'user'(普通), 'vip'(会员), 'admin'(管理) |
| `points` | INT | DEFAULT 0 | 积分 (用于签到等) |
| `ai_usage_limit` | INT | DEFAULT 10 | AI 使用次数限制 |
| `ai_usage_current` | INT | DEFAULT 0 | 当日已使用 AI 次数 |
| `last_checkin_at` | TIMESTAMP | | 上次签到时间 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 注册时间 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 更新时间 |

### 1.2 关注关系表 (`user_follows`)
实现用户之间的关注与被关注逻辑。

| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, AUTO_INCREMENT | 主键 |
| `follower_id` | VARCHAR(36) | FK -> users.id | 关注者 ID |
| `following_id` | VARCHAR(36) | FK -> users.id | 被关注者 ID |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 关注时间 |

> **关联逻辑**: 
> * 查询某人的粉丝: `SELECT * FROM user_follows WHERE following_id = ?`
> * 查询某人的关注: `SELECT * FROM user_follows WHERE follower_id = ?`

---

## 2. 博客内容 (Blog Content)

### 2.1 文章表 (`articles`)
存储长篇博客内容。

| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PK | 文章 ID |
| `author_id` | VARCHAR(36) | FK -> users.id | 作者 ID |
| `title` | VARCHAR(200) | NOT NULL | 标题 |
| `summary` | VARCHAR(500) | | 摘要 |
| `content` | LONGTEXT | NOT NULL | 文章内容 (Markdown 格式) |
| `cover_url` | VARCHAR(255) | | 封面图片 |
| `category` | VARCHAR(50) | | 分类 (如 Tech, Design) |
| `views` | INT | DEFAULT 0 | 阅读量 |
| `is_published` | BOOLEAN | DEFAULT TRUE | 是否发布 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 更新时间 |

### 2.2 标签表 (`tags`) & 文章标签关联 (`article_tags`)
实现文章的多标签分类。

**表: `tags`**
| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK | 标签 ID |
| `name` | VARCHAR(50) | UNIQUE | 标签名 (如 React, AI) |

**表: `article_tags`**
| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `article_id` | VARCHAR(36) | FK -> articles.id | 文章 ID |
| `tag_id` | INT | FK -> tags.id | 标签 ID |

### 2.3 收藏表 (`bookmarks`)
用户收藏文章。

| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `user_id` | VARCHAR(36) | FK -> users.id | 用户 ID |
| `article_id` | VARCHAR(36) | FK -> articles.id | 文章 ID |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 收藏时间 |

---

## 3. 社区互动 (Community & Interactions)

### 3.1 社区动态表 (`community_posts`)
存储短内容的社区帖子。

| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PK | 帖子 ID |
| `author_id` | VARCHAR(36) | FK -> users.id | 发布者 ID |
| `content` | TEXT | NOT NULL | 帖子内容 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 发布时间 |

### 3.2 通用评论表 (`comments`)
支持文章和社区帖子的评论，支持嵌套回复。

| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PK | 评论 ID |
| `user_id` | VARCHAR(36) | FK -> users.id | 评论者 ID |
| `target_type` | ENUM | 'article', 'post' | 评论对象类型 |
| `target_id` | VARCHAR(36) | INDEX | 文章ID 或 帖子ID |
| `parent_id` | VARCHAR(36) | FK -> comments.id, NULL | 父评论 ID (用于回复) |
| `content` | TEXT | NOT NULL | 评论内容 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 评论时间 |

### 3.3 通用点赞表 (`likes`)
统一管理文章、帖子、评论的点赞。

| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | 主键 |
| `user_id` | VARCHAR(36) | FK -> users.id | 点赞用户 |
| `target_type` | ENUM | 'article', 'post', 'comment' | 点赞对象类型 |
| `target_id` | VARCHAR(36) | INDEX | 对象 ID |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 点赞时间 |

---

## 4. AI 助手 (AI Assistant)

### 4.1 AI 会话记录表 (`ai_sessions`)
保存用户与 AI 的对话列表。

| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PK | 会话 ID |
| `user_id` | VARCHAR(36) | FK -> users.id | 用户 ID |
| `title` | VARCHAR(100) | | 会话标题 (自动生成或手动) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 创建时间 |

### 4.2 AI 消息表 (`ai_messages`)
保存会话中的具体消息内容。

| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | 消息 ID |
| `session_id` | VARCHAR(36) | FK -> ai_sessions.id | 所属会话 |
| `role` | ENUM | 'user', 'model' | 发送者角色 |
| `content` | TEXT | NOT NULL | 消息内容 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 发送时间 |

---

## 5. 媒体与系统 (Media & System)

### 5.1 音乐表 (`songs`)
存储音乐播放器的播放列表数据。

| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PK | 歌曲 ID |
| `title` | VARCHAR(100) | NOT NULL | 歌名 |
| `artist` | VARCHAR(100) | | 歌手 |
| `cover_url` | VARCHAR(255) | | 封面图 |
| `file_url` | VARCHAR(255) | NOT NULL | 音频文件链接 |
| `duration` | INT | | 时长 (秒) |
| `lyrics` | TEXT | | 歌词 (JSON 或 纯文本) |

### 5.2 系统公告表 (`announcements`)
用于发布系统通知、维护信息等。

| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK | ID |
| `title` | VARCHAR(100) | NOT NULL | 标题 |
| `content` | TEXT | | 内容 (支持 Markdown) |
| `type` | ENUM | 'info', 'warning', 'success' | 类型 |
| `publisher` | VARCHAR(50) | | 发布人名称 |
| `published_at` | DATE | | 发布日期 |

### 5.3 用户反馈表 (`feedbacks`)
收集用户提交的 Bug 和建议。

| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | ID |
| `user_id` | VARCHAR(36) | FK -> users.id, NULL | 提交用户 (可匿名) |
| `type` | ENUM | 'bug', 'suggestion' | 反馈类型 |
| `content` | TEXT | NOT NULL | 反馈内容 |
| `status` | ENUM | 'pending', 'resolved' | 处理状态 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 提交时间 |

---

## 数据库ER关系图概览 (文字版)

*   **Users** (1) <---> (N) **Articles**
*   **Users** (1) <---> (N) **CommunityPosts**
*   **Users** (1) <---> (N) **Comments**
*   **Users** (1) <---> (N) **Bookmarks** (Articles)
*   **Users** (1) <---> (N) **Likes** (Articles/Posts/Comments)
*   **Users** (1) <---> (N) **UserFollows** (作为粉丝)
*   **Users** (1) <---> (N) **UserFollows** (作为被关注者)
*   **Users** (1) <---> (N) **AISessions**
*   **AISessions** (1) <---> (N) **AIMessages**
