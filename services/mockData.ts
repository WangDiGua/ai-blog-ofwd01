import { Article, CommunityPost, Song, Announcement, User, Comment, Album, TrendingPlatform, Product } from '../types';

// --- 1. 用户数据 (2条：1个VIP/管理员，1个普通用户) ---
export const MOCK_USERS: User[] = [
    {
        id: 'u-1',
        name: '王地瓜',
        username: 'wangdigua',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        bio: '全栈开发者 | 致力于构建极致的用户体验。擅长 React, Node.js 和 UI 设计。',
        role: 'admin',
        vipType: 'permanent',
        level: '大乘期',
        aiUsage: 12,
        points: 8888,
        signInHistory: [{ date: '2023-10-01', points: 10 }, { date: '2023-10-02', points: 20 }],
        followersCount: 1024,
        followingCount: 42,
        totalLikes: 5200,
        isFollowing: false
    },
    {
        id: 'u-2',
        name: '李小猫',
        username: 'catlover',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
        bio: '热爱生活，喜欢摄影和吸猫。',
        role: 'user',
        vipType: 'none',
        level: '筑基期',
        aiUsage: 2,
        points: 150,
        signInHistory: [],
        followersCount: 12,
        followingCount: 5,
        totalLikes: 30,
        isFollowing: true
    }
];

// --- 2. 标签与分类 ---
export const MOCK_TAGS: string[] = ['React', 'TypeScript', 'Tailwind', 'Design', 'Life'];
export const MOCK_CATEGORIES: any[] = [
    { id: 'Tech', name: '技术', desc: '前沿技术探索', color: 'from-blue-400 to-cyan-300', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80' },
    { id: 'Life', name: '生活', desc: '记录美好瞬间', color: 'from-green-400 to-emerald-300', img: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80' }
];

// --- 3. 文章数据 (2条：1条技术长文含代码，1条生活文含引用) ---
export const MOCK_ARTICLES: Article[] = [
    {
        id: 'a-1',
        title: '深入理解 React 19：Server Components 与 Actions 的未来',
        summary: 'React 19 带来了革命性的变化。本文将深入探讨 Server Components 的工作原理，以及 Actions 如何简化数据突变流程。包含代码示例与性能分析。',
        content: `
# React 19 新特性解析

React 19 标志着前端开发的新纪元。我们不再仅仅关注客户端渲染，而是转向全栈组件化。

## Server Components

服务器组件允许我们在服务器上渲染组件，直接访问数据库。

\`\`\`tsx
// server-component.tsx
import db from './db';

async function NoteList() {
  const notes = await db.posts.find();
  return (
    <ul>
      {notes.map(note => (
        <li key={note.id}>{note.title}</li>
      ))}
    </ul>
  );
}
\`\`\`

> "Server Components 不仅仅是性能优化，它们是 React 数据获取故事的缺失一环。" —— React Team

## 总结

通过结合 **Client Components** 的交互性与 **Server Components** 的数据能力，我们可以构建更快、更精简的应用。
        `,
        cover: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80',
        views: 3420,
        likes: 128,
        category: 'Tech',
        date: '2023-10-24',
        updatedAt: '2023-10-25',
        tags: ['React', 'Frontend'],
        authorId: 'u-1',
        authorName: '王地瓜',
        authorAvatar: MOCK_USERS[0].avatar,
        authorLevel: '大乘期',
        comments: []
    },
    {
        id: 'a-2',
        title: '极简主义生活指南：如何清理你的数字空间',
        summary: '在这个信息过载的时代，数字极简主义比以往任何时候都重要。本文分享5个实用的清理技巧，帮助你找回内心的平静。',
        content: `
# 数字断舍离

我们每天花费大量时间在屏幕上，却很少思考这些输入对大脑的影响。

## 核心原则

1.  **主动选择**：只保留那些真正能增加价值的应用。
2.  **优化通知**：关闭非必要的推送。
3.  **定期清理**：像打扫房间一样打扫你的桌面。

### 推荐工具

*   Notion (知识管理)
*   Linear (任务管理)
*   **Focus** (专注力工具)

![极简桌面](https://images.unsplash.com/photo-1499750310159-52f0f837ce62?auto=format&fit=crop&w=1200&q=80)

保持简单，保持专注。
        `,
        cover: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80',
        views: 890,
        likes: 256,
        category: 'Life',
        date: '2023-10-20',
        tags: ['Minimalism', 'Lifestyle'],
        authorId: 'u-2',
        authorName: '李小猫',
        authorAvatar: MOCK_USERS[1].avatar,
        authorLevel: '筑基期',
        comments: []
    }
];

// --- 4. 评论数据 (2条：展示嵌套与Markdown) ---
MOCK_ARTICLES[0].comments = [
    {
        id: 'c-1',
        user: MOCK_USERS[1],
        content: '写得太棒了！**Server Components** 确实解决了瀑布流请求的问题。',
        date: '2小时前',
        likes: 5,
        replies: [
            {
                id: 'c-1-1',
                user: MOCK_USERS[0],
                content: '谢谢支持！期待大家在生产环境中的反馈。',
                date: '1小时前',
                likes: 2
            }
        ]
    },
    {
        id: 'c-2',
        user: { ...MOCK_USERS[1], name: '路人甲', id: 'u-guest' },
        content: '请问这个新特性兼容 Next.js 13 吗？',
        date: '30分钟前',
        likes: 0
    }
];

// --- 5. 社区帖子 (2条：1条带图，1条纯文本) ---
export const MOCK_POSTS: CommunityPost[] = [
    {
        id: 'p-1',
        author: MOCK_USERS[0],
        content: '刚刚拍的夕阳，太美了！大家周末都在做什么呢？\n\n![Sunset](https://images.unsplash.com/photo-1616036740257-9449ea1f6605?auto=format&fit=crop&w=600&q=80)',
        likes: 45,
        comments: 12,
        timeAgo: '10分钟前'
    },
    {
        id: 'p-2',
        author: MOCK_USERS[1],
        content: '求助：CSS Grid 布局中，如何实现不定高卡片的瀑布流布局？有没有现成的库推荐？#前端开发 #CSS',
        likes: 8,
        comments: 3,
        timeAgo: '1小时前'
    }
];

// --- 6. 商城商品 (2条：1条指导服务，1条虚拟道具) ---
export const MOCK_PRODUCTS: Product[] = [
    {
        id: 'p-1',
        title: 'React 源码深度解析 (1v1指导)',
        desc: '包含 Fiber 架构、Diff 算法、Hooks 原理的深度讲解。适合希望进阶的高级前端工程师。提供 1 小时语音通话 + 源码注释文档。',
        price: 299,
        currency: 'cny',
        cover: 'https://images.unsplash.com/photo-1633356122102-3fe601e15fae?auto=format&fit=crop&w=400&q=80',
        type: 'guidance',
        sales: 42,
        tags: ['React', '源码', '进阶'],
        serviceCategory: 'React'
    },
    {
        id: 'p-2',
        title: '赛博朋克霓虹头像框',
        desc: '专属动态头像框，拥有流光溢彩的霓虹特效。装备后在评论区和个人主页显示。',
        price: 888,
        currency: 'points',
        cover: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=400&q=80',
        type: 'frame',
        sales: 1024,
        tags: ['头像框', '特效']
    }
];

// --- 7. 相册 (2条) ---
export const MOCK_ALBUMS: Album[] = [
    {
        id: 'alb-1',
        title: '城市微光',
        description: '记录深夜依然亮着的便利店和路灯。',
        cover: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80',
        author: MOCK_USERS[0],
        date: '2023-11-01',
        views: 120,
        likes: 45,
        comments: [],
        photos: [
            { id: 'ph-1', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80', title: 'Midnight' },
            { id: 'ph-2', url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80', title: 'Street' }
        ]
    },
    {
        id: 'alb-2',
        title: '自然之息',
        description: '逃离城市，拥抱森林。',
        cover: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
        author: MOCK_USERS[1],
        date: '2023-10-28',
        views: 89,
        likes: 30,
        comments: [],
        photos: [
            { id: 'ph-3', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80' }
        ]
    }
];

// --- 8. 其他辅助数据 (保留少量) ---
export const MOCK_FRIEND_LINKS = [
    { name: 'Google', url: 'https://google.com', avatar: 'https://www.google.com/favicon.ico', desc: '全球最大的搜索引擎' },
    { name: 'React', url: 'https://react.dev', avatar: 'https://react.dev/favicon.ico', desc: '用于构建 Web 和原生用户界面的库' }
];

export const MOCK_DANMAKU = ['网站设计太好看了！', '求博主更新 React 教程', '打卡滴滴滴', '这里是哪里？', '前排围观大佬'];

export const MOCK_SONGS: Song[] = [
    { id: 's-1', title: 'Lofi Study', artist: 'Lofi Girl', cover: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&w=200&q=80', duration: 180 },
    { id: 's-2', title: 'Piano Chill', artist: 'Relaxing Records', cover: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=200&q=80', duration: 240 }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
    { id: 1, title: 'v2.0 版本发布公告', summary: '全新的 UI 设计，更流畅的体验。', content: '我们很高兴地宣布...', type: 'success', date: '2023-11-05', publisher: 'Admin' },
    { id: 2, title: '服务器维护通知', summary: '将于周六凌晨进行停机维护。', content: '预计耗时2小时...', type: 'warning', date: '2023-11-03', publisher: 'System' }
];

export const MOCK_HOT_SEARCHES = ['React 19', 'AI 助手', '摄影技巧', '生活感悟'];

export const MOCK_AI_HISTORY = [
    { id: 'h-1', title: '如何学习 Rust?', date: '昨天' },
    { id: 'h-2', title: '解释量子纠缠', date: '2天前' }
];

export const MOCK_TRENDING_TOPICS: TrendingPlatform[] = [
    {
        id: 'douyin',
        name: '抖音热榜',
        icon: '',
        color: 'bg-black text-white border-gray-800',
        list: [
            { rank: 1, title: '熊猫花花吃饭直播', hot: '1200w', url: '#' },
            { rank: 2, title: '杭州亚运会倒计时', hot: '800w', url: '#' }
        ]
    },
    {
        id: 'bilibili',
        name: 'B站热搜',
        icon: '',
        color: 'bg-pink-500 text-white border-pink-400',
        list: [
            { rank: 1, title: '原神4.2版本前瞻', hot: '999w', url: '#' }, 
            { rank: 2, title: '手工耿新发明', hot: '500w', url: '#' }
        ]
    },
    {
        id: 'toutiao',
        name: '今日头条',
        icon: '',
        color: 'bg-red-500 text-white border-red-400',
        list: [
            { rank: 1, title: '2024年放假安排公布', hot: '5000w', url: '#' }, 
            { rank: 2, title: '科技创新大会召开', hot: '3000w', url: '#' }
        ]
    },
    {
        id: 'baidu',
        name: '百度热搜',
        icon: '',
        color: 'bg-blue-500 text-white border-blue-400',
        list: [
            { rank: 1, title: '如何评价 React 19', hot: '480w', url: '#' }, 
            { rank: 2, title: 'DeepSeek 模型开源', hot: '320w', url: '#' }
        ]
    }
];