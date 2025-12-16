# API 接口文档

本文档描述了 iBlog 应用程序使用的前端接口。所有接口目前均由 `services/client.ts` 中的 MockRequest 模拟。

## 基础配置

所有请求均通过 `services/api.ts` 中导出的服务模块进行调用。

## 模块列表

### 1. 文章 (Article)

#### 获取文章列表
- **方法**: `GET`
- **路径**: `/articles`
- **参数**:
  - `page` (number): 页码
  - `limit` (number): 每页条数
  - `q` (string): 搜索关键词
  - `category` (string): 分类
  - `tag` (string): 标签
- **返回**: `{ items: Article[], totalPages: number, total: number }`

#### 获取文章详情
- **方法**: `GET`
- **路径**: `/articles/:id`
- **返回**: `Article` 对象

#### 创建文章
- **方法**: `POST`
- **路径**: `/articles/create`
- **参数**: `{ title: string, content: string }`
- **返回**: 新创建的 `Article`

#### 获取标签列表
- **方法**: `GET`
- **路径**: `/tags`
- **返回**: `string[]`

#### 获取分类列表
- **方法**: `GET`
- **路径**: `/categories`
- **返回**: `Category[]`

### 2. 用户 (User)

#### 登录
- **方法**: `POST`
- **路径**: `/login` (或 `/auth/login`)
- **参数**: `{ username: string, password: string, captchaCode: string }`
- **返回**: `User` 对象

#### 注册
- **方法**: `POST`
- **路径**: `/auth/register`
- **参数**: `{ username: string, email: string, password: string, code: string }`
- **返回**: `User` 对象

#### 获取个人资料
- **方法**: `GET`
- **路径**: `/users/:id`
- **返回**: `User` 对象

#### 更新个人资料
- **方法**: `POST`
- **路径**: `/user/update`
- **参数**: `Partial<User>`
- **返回**: 更新后的 `User` 对象

#### 签到
- **方法**: `POST`
- **路径**: `/user/checkin`
- **返回**: `{ points: number, total: number }`

#### 关注/取消关注
- **方法**: `POST`
- **路径**: `/user/follow`
- **参数**: `{ userId: string, isFollowing: boolean }`
- **返回**: `{ success: boolean, isFollowing: boolean }`

#### 提交打赏
- **方法**: `POST`
- **路径**: `/user/donation`
- **参数**: `{ userId?: string, nickname?: string, avatar?: string, screenshot: string }`
- **返回**: `{ success: boolean }`

#### 举报内容
- **方法**: `POST`
- **路径**: `/user/report`
- **参数**: `{ targetId: string, type: string, reason: string, description: string }`
- **返回**: `{ success: boolean }`

### 3. 社区 (Community)

#### 获取帖子列表
- **方法**: `GET`
- **路径**: `/community`
- **返回**: `CommunityPost[]`

#### 获取弹幕
- **方法**: `GET`
- **路径**: `/danmaku`
- **返回**: `string[]`

#### 获取相册列表
- **方法**: `GET`
- **路径**: `/albums`
- **返回**: `Album[]`

### 4. 音乐 (Music)

#### 获取歌曲列表
- **方法**: `GET`
- **路径**: `/music`
- **返回**: `Song[]`

### 5. 系统 (System)

#### 获取公告
- **方法**: `GET`
- **路径**: `/announcements`
- **返回**: `Announcement[]`

#### 获取热搜
- **方法**: `GET`
- **路径**: `/search/hot`
- **返回**: `string[]`

#### 获取友情链接
- **方法**: `GET`
- **路径**: `/friend-links`
- **返回**: `FriendLink[]`

#### 申请友链
- **方法**: `POST`
- **路径**: `/friend-links/apply`
- **参数**: `{ name: string, url: string, avatar: string, desc: string }`
- **返回**: `{ success: boolean }`

### 6. AI 助手

#### 获取历史记录
- **方法**: `GET`
- **路径**: `/ai/history`
- **返回**: 对话历史列表

#### 更新使用量
- **方法**: `POST`
- **路径**: `/ai/usage`
- **参数**: `{ userId: string }`
- **返回**: `{ usage: number }`