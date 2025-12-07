import { Article, CommunityPost, Song, User, Announcement } from '../types';

/**
 * 通用防抖函数
 */
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * 通用节流函数
 */
export function throttle<T extends (...args: any[]) => void>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 模拟请求模块 (Mocking Axios)
 */
class MockRequest {
  private latency = 400; // 毫秒
  // 模拟会话的数据库状态
  private aiUsageStore: Record<string, number> = {}; 

  private async interceptor() {
    await new Promise(resolve => setTimeout(resolve, 200)); 
    return true;
  }

  async get<T>(endpoint: string, params: any = {}): Promise<T> {
    await this.interceptor();
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 模拟路由
        if (endpoint === '/articles') {
          let data = [...MOCK_ARTICLES];
          
          // 搜索过滤器
          if (params.q) {
            const lowerQ = params.q.toLowerCase();
            data = data.filter(a => 
              a.title.toLowerCase().includes(lowerQ) || 
              a.summary.toLowerCase().includes(lowerQ) ||
              a.tags?.some(t => t.toLowerCase().includes(lowerQ))
            );
          }

          // 分类过滤器
          if (params.category && params.category !== 'All') {
            data = data.filter(a => a.category === params.category);
          }

          // 标签过滤器
          if (params.tag) {
             data = data.filter(a => a.tags?.includes(params.tag) || a.tags?.includes(`#${params.tag}`));
          }
          
          if (params.userId) {
             data = data.slice(0, 3);
          }
          
          if (params.favorites) {
             data = data.slice(2, 5);
          }

          // 分页
          const page = params.page || 1;
          const limit = params.limit || 1000;
          const total = data.length;
          const start = (page - 1) * limit;
          const end = start + limit;
          
          const result = {
            items: data.slice(start, end),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          };

          resolve(result as unknown as T);

        } else if (endpoint.startsWith('/articles/')) {
          const id = endpoint.split('/')[2];
          const article = MOCK_ARTICLES.find(a => a.id === id);
          if (article) resolve(article as unknown as T);
          else reject({ status: 404, message: '文章未找到' });

        } else if (endpoint === '/community') {
          resolve(MOCK_POSTS as unknown as T);
        } else if (endpoint === '/music') {
          resolve(MOCK_SONGS as unknown as T);
        } else if (endpoint === '/search/hot') {
            resolve(['React 19', 'Tailwind CSS', '苹果设计', 'TypeScript', 'WebAssembly'] as unknown as T);
        } else if (endpoint === '/announcements') {
            resolve(MOCK_ANNOUNCEMENTS as unknown as T);
        } else if (endpoint.startsWith('/ai/history')) {
            resolve([
              { id: '1', title: '代码重构帮助', date: '今天' },
              { id: '2', title: '解释量子物理', date: '昨天' },
              { id: '3', title: 'CSS Grid 布局', date: '上周' }
            ] as unknown as T);
        } else {
          console.error(`[Mock 404] ${endpoint} not found`);
          reject({ status: 404, message: '未找到' });
        }
      }, this.latency);
    });
  }

  // 模拟 POST 请求 (如登录)
  async post<T>(endpoint: string, body: any = {}): Promise<T> {
    await this.interceptor();
    return new Promise((resolve, reject) => {
       setTimeout(() => {
          if (endpoint === '/login') {
             if (body.username) {
               // 演示角色逻辑
               let role = 'user';
               if (body.username.toLowerCase().includes('vip')) role = 'vip';
               if (body.username.toLowerCase().includes('admin')) role = 'admin';
               
               resolve({
                  id: 'u-123',
                  name: body.username,
                  avatar: `https://ui-avatars.com/api/?name=${body.username}&background=0071e3&color=fff`,
                  email: `${body.username}@example.com`,
                  bio: '前端爱好者和像素完美主义者。',
                  points: 100,
                  coverImage: 'https://picsum.photos/seed/cover/1200/400',
                  role: role,
                  aiUsage: this.aiUsageStore['u-123'] || 0
               } as unknown as T);
             } else {
               reject({message: '凭证无效'});
             }
          } else if (endpoint === '/user/checkin') {
             resolve({ points: 10, total: 110 } as unknown as T);
          } else if (endpoint === '/user/update') {
              resolve(body as unknown as T);
          } else if (endpoint === '/user/feedback') {
              resolve({ success: true } as unknown as T);
          } else if (endpoint === '/ai/usage') {
             const userId = body.userId;
             const current = this.aiUsageStore[userId] || 0;
             this.aiUsageStore[userId] = current + 1;
             resolve({ usage: this.aiUsageStore[userId] } as unknown as T);
          } else if (endpoint === '/articles/create') {
              const newArticle: Article = {
                  id: `new-${Date.now()}`,
                  title: body.title,
                  content: body.content,
                  summary: body.content.substring(0, 100) + '...',
                  date: new Date().toLocaleDateString(),
                  cover: 'https://picsum.photos/seed/new/800/600',
                  views: 0,
                  likes: 0,
                  category: 'Personal',
                  tags: ['#New'],
                  comments: []
              };
              MOCK_ARTICLES.unshift(newArticle);
              resolve(newArticle as unknown as T);
          } else {
             resolve({ success: true } as unknown as T);
          }
       }, 500);
    });
  }
}

export const request = new MockRequest();

// --- 模拟数据 ---

const LONG_CONTENT = `
## 简介
数字景观正在不断演变。作为开发者和设计师，我们必须走在潮流的前沿。本文探讨了我们所看到的用户界面设计中的根本性转变。

## 毛玻璃拟态趋势
毛玻璃拟态 (Glassmorphism) 不仅仅是一个流行词。它代表了向深度和层次感的转变，同时没有杂乱感。
*   **半透明**: 使用 backdrop-filter 创造空间感。
*   **活力**: 使用微妙的渐变让内容突显。
*   **边框**: 细微的半透明边框来定义边缘。

## 组件架构
构建可扩展的 Web 应用程序需要坚实的基础。
1.  **原子设计**: 将界面分解为最小的部分。
2.  **复合组件**: 管理复杂 UI 元素内的状态。
3.  **Hooks 模式**: 在应用程序中重用逻辑。
`;

const TITLES = [
    "2025年 UI 设计的未来",
    "理解 React 19 服务器组件",
    "为什么极简主义永不过时",
    "苹果设计哲学指南",
    "精通 TypeScript 泛型",
    "前端开发中 AI 的崛起",
    "构建无障碍 Web 应用",
    "CSS Grid 与 Flexbox：终极指南",
    "优化 Web 性能",
    "开发者的数字排毒"
];

const MOCK_ARTICLES: Article[] = TITLES.map((title, i) => ({
  id: `art-${i}`,
  title: title,
  summary: "这是一段关于文章内容的简短摘要，旨在吸引读者点击阅读更多内容。",
  content: LONG_CONTENT,
  cover: `https://picsum.photos/seed/art${i}/800/600`,
  views: Math.floor(Math.random() * 5000) + 100,
  likes: Math.floor(Math.random() * 500),
  category: ["Tech", "Design", "Life"][Math.floor(Math.random() * 3)],
  tags: ["#React19", "#Design", "#WebDev", "#Apple"].sort(() => 0.5 - Math.random()).slice(0, 2),
  date: "2024年10月24日",
  comments: []
}));

const MOCK_POSTS: CommunityPost[] = Array.from({ length: 5 }).map((_, i) => ({
  id: `post-${i}`,
  author: {
    id: `u-${i}`,
    name: ["张三", "李四", "王五"][i%3],
    avatar: `https://picsum.photos/seed/user${i}/100/100`,
    role: 'user',
    aiUsage: 0
  },
  content: "刚刚看了这个新的博客设计，毛玻璃效果真的很流畅！非常喜欢这种苹果风格的UI。",
  likes: Math.floor(Math.random() * 50),
  comments: Math.floor(Math.random() * 10),
  timeAgo: `${i + 1}小时前`
}));

const MOCK_SONGS: Song[] = [
  { id: '1', title: 'Midnight City', artist: 'M83', cover: 'https://picsum.photos/seed/m83/300/300', duration: 243, lyrics: [] },
  { id: '2', title: 'Instant Crush', artist: 'Daft Punk', cover: 'https://picsum.photos/seed/daft/300/300', duration: 337, lyrics: [] },
  { id: '3', title: 'The Less I Know', artist: 'Tame Impala', cover: 'https://picsum.photos/seed/tame/300/300', duration: 216, lyrics: [] },
];

const MOCK_ANNOUNCEMENTS: Announcement[] = [
    { 
        id: 1, 
        title: "iBlog V2.0 已发布", 
        summary: "iBlog V2.0 正式发布，带来全新的用户界面！",
        content: `
# iBlog V2.0 来了！

我们很高兴地宣布 iBlog V2.0 即刻可用。这次更新带来了用户界面的彻底检修，采用了 **毛玻璃拟态 (Glassmorphism)** 设计语言。

### 有什么新功能？
*   **新设计**: 清新、现代、受苹果启发的外观。
*   **AI 助手**: 由 Gemini 驱动，实现更智能的交互。
*   **音乐播放器**: 集成的音乐体验。
*   **深色模式**: 优美护眼的深色模式。

享受新体验吧！
        `,
        type: "info",
        date: "2024-10-27",
        publisher: "系统管理员"
    },
    { 
        id: 2, 
        title: "计划维护", 
        summary: "系统维护计划于周日凌晨 2 点进行。",
        content: `
# 维护通知

我们将于 **周日凌晨 2:00 UTC** 进行计划内的服务器维护。

预计停机时间约为 **30 分钟**。在此期间，以下服务可能不可用：
*   登录/注册
*   评论
*   AI 助手

对于由此造成的不便，我们深表歉意。
        `,
        type: "warning", 
        date: "2024-10-28",
        publisher: "运维团队"
    },
    { 
        id: 3, 
        title: "VIP AI 访问权限", 
        summary: "新的 AI 助手现已向 VIP 会员开放。",
        content: `
# VIP 专属 AI 助手

我们正在向所有 **VIP 会员** 推出新的 AI 助手功能。

解锁 AI 的力量来：
*   总结文章
*   生成代码片段
*   翻译内容

立即升级以获取访问权限！
        `,
        type: "success",
        date: "2024-10-29",
        publisher: "产品团队"
    }
];