import { Article, CommunityPost, Song, Announcement, User, Comment } from '../types';

// --- 模拟用户数据 ---
export const MOCK_USERS: User[] = [
    {
        id: 'u-admin',
        username: 'admin',
        name: 'John Developer',
        avatar: 'https://ui-avatars.com/api/?name=John+Dev&background=0071e3&color=fff',
        bio: '全栈开发者，热爱极简设计与高性能代码。',
        role: 'admin',
        vipType: 'permanent',
        level: '真仙/渡劫期',
        aiUsage: 45,
        points: 8888,
        signInHistory: Array.from({length: 10}).map((_,i) => ({date: new Date(Date.now() - i * 86400000).toLocaleDateString(), points: 10})),
        coverImage: 'https://picsum.photos/seed/cover1/1200/400',
        followersCount: 1024,
        followingCount: 128,
        totalLikes: 5600
    },
    {
        id: 'u-1',
        username: 'alice',
        name: 'Alice Designer',
        avatar: 'https://ui-avatars.com/api/?name=Alice+D&background=FF5733&color=fff',
        bio: 'UI/UX 设计师，专注于用户体验。',
        role: 'vip',
        vipType: 'monthly',
        level: '元婴期',
        aiUsage: 12,
        points: 500,
        signInHistory: [{date: new Date().toLocaleDateString(), points: 10}],
        followersCount: 850,
        followingCount: 50,
        totalLikes: 2300
    },
    {
        id: 'u-2',
        username: 'bob',
        name: 'Bob Engineer',
        avatar: 'https://ui-avatars.com/api/?name=Bob+E&background=33FF57&color=fff',
        bio: '后端架构师，Rust 爱好者。',
        role: 'user',
        vipType: 'none',
        level: '炼气期',
        aiUsage: 5,
        points: 100,
        signInHistory: [],
        followersCount: 120,
        followingCount: 200,
        totalLikes: 450
    }
];

// --- 模拟文章数据 ---
const CONTENT_TEMPLATE = `
## 现代前端开发的未来

在过去的几年里，前端开发经历了爆炸式的增长。从 jQuery 到 React，再到现在的 Server Components，技术栈的演进从未停止。

### 核心趋势
1. **性能优先**：Core Web Vitals 成为 SEO 的关键指标。
2. **边缘计算**：将逻辑推向离用户更近的地方。
3. **AI 辅助编码**：Copilot 和 ChatGPT 改变了我们的工作流。

> "好的设计是尽可能少的设计。" - Dieter Rams

### 代码示例
\`\`\`javascript
const greeting = "Hello, Future!";
console.log(greeting);
\`\`\`

![示例图片](https://picsum.photos/seed/tech/800/400)

我们正处于一个激动人心的时代。
`;

export const MOCK_ARTICLES: Article[] = Array.from({ length: 10 }).map((_, i) => ({
    id: `art-${i + 1}`,
    title: [
        "2025年 UI 设计的未来趋势",
        "深入理解 React Server Components",
        "为什么 TypeScript 是必学的",
        "构建高性能 Web 应用的 10 个技巧",
        "Tailwind CSS 最佳实践",
        "WebAssembly：浏览器的下一件大事",
        "微前端架构实战指南",
        "Node.js 22 新特性解析",
        "CSS Grid 与 Flexbox 深度对比",
        "如何成为一名优秀的 Tech Lead"
    ][i],
    summary: "本文深入探讨了现代 Web 开发中的关键技术和设计理念，适合所有级别的前端开发者阅读。",
    content: CONTENT_TEMPLATE,
    cover: `https://picsum.photos/seed/article${i}/800/600`,
    views: Math.floor(Math.random() * 10000) + 500,
    likes: Math.floor(Math.random() * 1000) + 50,
    category: i % 3 === 0 ? 'Tech' : i % 3 === 1 ? 'Design' : 'Life',
    tags: ['Frontend', 'React', 'Design', 'Performance'].sort(() => 0.5 - Math.random()).slice(0, 2),
    date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
    comments: [], // 评论单独模拟
    authorId: MOCK_USERS[i % MOCK_USERS.length].id,
    authorName: MOCK_USERS[i % MOCK_USERS.length].name,
    authorAvatar: MOCK_USERS[i % MOCK_USERS.length].avatar,
    authorLevel: MOCK_USERS[i % MOCK_USERS.length].level
}));

// --- 模拟评论数据 ---
export const MOCK_COMMENTS: Comment[] = [
    {
        id: 'c-1',
        user: MOCK_USERS[1],
        content: '写得太好了！非常有启发性。',
        date: '2小时前',
        likes: 5,
        replies: [
            {
                id: 'c-1-1',
                user: MOCK_USERS[0],
                content: '谢谢支持！',
                date: '1小时前',
                likes: 1
            }
        ]
    },
    {
        id: 'c-2',
        user: MOCK_USERS[2],
        content: '这个观点很有趣，但我认为 Server Components 还有很长的路要走。',
        date: '5小时前',
        likes: 12
    }
];

// --- 模拟社区帖子 ---
export const MOCK_POSTS: CommunityPost[] = Array.from({ length: 8 }).map((_, i) => ({
    id: `post-${i + 1}`,
    author: MOCK_USERS[i % MOCK_USERS.length],
    content: [
        "刚刚发布了新版本的博客，大家来看看！ #Showcase",
        "有人在生产环境用过 Deno 吗？体验如何？ #TechTalk",
        "今天的天气真不错，适合写代码。☕️",
        "求推荐好用的 VS Code 主题！",
        "设计系统维护起来真头大... #DesignerLife",
        "终于搞定了这个 Bug，心情舒畅！",
        "React 文档更新了，推荐阅读。",
        "周末准备去爬山，放松一下。"
    ][i],
    likes: Math.floor(Math.random() * 50),
    comments: Math.floor(Math.random() * 10),
    timeAgo: `${i * 2 + 1}小时前`
}));

// --- 模拟音乐数据 ---
export const MOCK_SONGS: Song[] = [
    { id: '1', title: 'Midnight City', artist: 'M83', cover: 'https://picsum.photos/seed/m83/300/300', duration: 243, lyrics: ["[00:10.00]Waiting in a car", "[00:15.00]Waiting for a ride in the dark"] },
    { id: '2', title: 'Instant Crush', artist: 'Daft Punk', cover: 'https://picsum.photos/seed/daft/300/300', duration: 337, lyrics: ["[00:20.00]I didn't want to be the one to forget"] },
    { id: '3', title: 'The Less I Know', artist: 'Tame Impala', cover: 'https://picsum.photos/seed/tame/300/300', duration: 216, lyrics: ["[00:05.00]Someone said they left together"] },
    { id: '4', title: 'Blinding Lights', artist: 'The Weeknd', cover: 'https://picsum.photos/seed/weeknd/300/300', duration: 200, lyrics: ["[00:10.00]I've been tryna call"] },
    { id: '5', title: 'Levitating', artist: 'Dua Lipa', cover: 'https://picsum.photos/seed/dua/300/300', duration: 203, lyrics: ["[00:08.00]If you wanna run away with me"] }
];

// --- 模拟公告数据 ---
export const MOCK_ANNOUNCEMENTS: Announcement[] = [
    {
        id: 1,
        title: "iBlog V2.0 正式发布",
        summary: "全新的 UI 设计，更快的加载速度，以及 AI 助手功能上线！",
        content: "# iBlog V2.0\n\n我们非常高兴地宣布 iBlog 2.0 版本正式上线...\n\n### 新特性\n- 毛玻璃 UI\n- AI 助手\n- 音乐播放器",
        type: "info",
        date: "2025-01-01",
        publisher: "系统管理员"
    },
    {
        id: 2,
        title: "服务器维护通知",
        summary: "将于本周日凌晨进行例行维护，预计耗时 2 小时。",
        content: "为了提供更稳定的服务，我们将进行服务器升级...",
        type: "warning",
        date: "2025-01-15",
        publisher: "运维团队"
    },
    {
        id: 3,
        title: "社区规范更新",
        summary: "请大家阅读最新的社区行为准则。",
        content: "为了维护良好的社区氛围，我们更新了版规...",
        type: "success",
        date: "2025-01-20",
        publisher: "社区管理"
    }
];

// --- 模拟 AI 历史 ---
export const MOCK_AI_HISTORY = [
    { id: 'h-1', title: '解释量子计算', date: '今天 10:30' },
    { id: 'h-2', title: 'React useEffect 最佳实践', date: '昨天 15:45' },
    { id: 'h-3', title: '生成 Python 爬虫代码', date: '2025-01-20' },
    { id: 'h-4', title: '翻译科技文章', date: '2025-01-18' }
];

// --- 模拟热搜 ---
export const MOCK_HOT_SEARCHES = ['React 19', 'Tailwind CSS', '苹果设计', 'TypeScript', 'WebAssembly', 'AI 编程', 'Next.js'];