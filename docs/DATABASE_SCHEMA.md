# iBlog 数据库设计方案

本文档为 iBlog 前端项目对应的后端数据库设计方案。设计采用关系型数据库（如 MySQL/PostgreSQL）模型。

## 1. 用户中心 (User Center)

| 表名 | 描述 |
| :--- | :--- |
| `users` | 用户基本信息、积分、等级、VIP状态 |
| `user_follows` | 关注关系 |
| `user_checkins` | 签到记录 |
| `user_donations` | **新增**: 用户打赏记录 (含截图凭证) |

## 2. 博客内容 (Blog Content)

| 表名 | 描述 |
| :--- | :--- |
| `articles` | 文章内容 |
| `tags` | 标签定义 |
| `categories` | **新增**: 分类定义 (名称, 描述, 封面, 颜色) |
| `article_tags` | 文章标签关联 |
| `bookmarks` | 收藏记录 |

## 3. 社区互动 (Community & Interactions)

| 表名 | 描述 |
| :--- | :--- |
| `community_posts` | 社区帖子 |
| `comments` | 评论 (文章/帖子) |
| `likes` | 点赞记录 |
| `danmaku` | **新增**: 留言板弹幕记录 |

## 4. AI 助手 (AI Assistant)

| 表名 | 描述 |
| :--- | :--- |
| `ai_sessions` | 会话记录 |
| `ai_messages` | 消息内容 |

## 5. 媒体与系统 (Media & System)

| 表名 | 描述 |
| :--- | :--- |
| `songs` | 音乐库 |
| `announcements` | 系统公告 |
| `feedbacks` | 用户反馈 |
| `friend_links` | **新增**: 友情链接 (含审核状态) |

---

## 新增表结构详情

### Categories (分类)
| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | VARCHAR | 分类ID (如 'Tech') |
| `name` | VARCHAR | 显示名称 |
| `desc` | VARCHAR | 描述 |
| `cover_img` | VARCHAR | 封面图片URL |
| `theme_color` | VARCHAR | 主题色 (CSS Gradient) |

### Friend Links (友链)
| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | INT | PK |
| `name` | VARCHAR | 网站名称 |
| `url` | VARCHAR | 链接地址 |
| `avatar` | VARCHAR | 站长头像 |
| `desc` | VARCHAR | 简介 |
| `status` | ENUM | 'pending', 'approved', 'rejected' |

### User Donations (打赏)
| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | BIGINT | PK |
| `user_id` | VARCHAR | FK (可选，匿名为空) |
| `nickname` | VARCHAR | 打赏人昵称 |
| `avatar` | VARCHAR | 打赏人头像 |
| `screenshot_url` | VARCHAR | 凭证图片 |
| `status` | ENUM | 'pending', 'confirmed' |
| `created_at` | TIMESTAMP | |