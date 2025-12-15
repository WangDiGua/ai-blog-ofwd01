import { Article, CommunityPost, Song, Announcement, User, Comment, Album } from '../types';

// --- 模拟用户数据 ---
export const MOCK_USERS: User[] = [
    {
        id: 'u-admin',
        username: 'admin',
        name: '王地瓜',
        avatar: 'https://ui-avatars.com/api/?name=Wang+Digua&background=0071e3&color=fff',
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

// --- 模拟标签数据 ---
export const MOCK_TAGS = ['#React19', '#TailwindCSS', '#UXDesign', '#AppleEvent', '#CodingLife', '#WebAssembly', '#NextJS', '#Figma', '#Minimalism', '#Darkmode', '#AI', '#ThreeJS', '#Rust', '#Cyberpunk'];

// --- 模拟分类数据 ---
export const MOCK_CATEGORIES = [
    { id: 'Tech', name: '前沿科技', desc: '探索代码与未来的边界', color: 'from-blue-500 to-cyan-400', img: 'https://picsum.photos/seed/tech/600/400' },
    { id: 'Design', name: '设计美学', desc: '像素间的艺术哲学', color: 'from-purple-500 to-pink-400', img: 'https://picsum.photos/seed/design/600/400' },
    { id: 'Life', name: '生活随笔', desc: '记录时光的温柔', color: 'from-green-500 to-emerald-400', img: 'https://picsum.photos/seed/life/600/400' },
    { id: 'AI', name: '人工智能', desc: '智慧的奇点', color: 'from-orange-500 to-amber-400', img: 'https://picsum.photos/seed/ai/600/400' },
    { id: 'Mobile', name: '移动开发', desc: '掌心里的世界', color: 'from-indigo-500 to-blue-400', img: 'https://picsum.photos/seed/mobile/600/400' },
    { id: 'Game', name: '游戏开发', desc: '构建虚拟梦想', color: 'from-red-500 to-rose-400', img: 'https://picsum.photos/seed/game/600/400' },
    { id: 'Cloud', name: '云计算', desc: '云端架构', color: 'from-sky-500 to-blue-600', img: 'https://picsum.photos/seed/cloud/600/400' }
];

// --- 模拟友情链接数据 ---
export const MOCK_FRIEND_LINKS = [
    { name: 'React 官方', url: 'https://react.dev', avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png', desc: '用于构建 Web 和原生交互界面的库' },
    { name: 'Tailwind CSS', url: 'https://tailwindcss.com', avatar: 'https://pic1.zhimg.com/v2-8e6df6459345c22530c34e00b86a3471_720w.jpg?source=172ae18b', desc: '只需 HTML 即可快速构建现代网站' },
    { name: 'Vite', url: 'https://vitejs.dev', avatar: 'https://vitejs.dev/logo.svg', desc: '下一代前端开发与构建工具' },
];

// --- 模拟弹幕数据 ---
export const MOCK_DANMAKU = [
    "网站做得真棒！", "前排围观", "博主更新好快", "这是什么神仙特效", "Hello World!", 
    "React 19 太强了", "求源码！", "UI 设计很有品味", "打卡滴滴滴", "期待更多内容"
];

// --- 演示用的富文本内容 ---
const RICH_CONTENT_TEMPLATE = `
> "设计不仅仅是外观和感觉。设计就是它是如何工作的。" — Steve Jobs

在当今的数字环境中，**用户体验 (UX)** 和 **用户界面 (UI)** 设计至关重要。Apple 的设计语言以其极简主义、清晰度和深度而闻名。本文将带您领略如何使用现代技术栈复刻这种体验，并展示我们编辑器的强大渲染能力。

## 1. 核心原则

Apple 的设计哲学主要围绕以下几点：

*   **清晰度 (Clarity)**：文本清晰易读，图标精确清晰，修饰微妙且恰到好处。
*   **遵从 (Deference)**：流畅的动画和清晰的界面有助于用户理解并与内容互动，而不会抢了内容的风头。
*   **深度 (Depth)**：清晰的分层和逼真的动作传达了层次结构并赋予了活力。

![Apple Design Concept](https://picsum.photos/seed/apple_design/800/400)

## 2. 代码美学展示

我们不仅关注视觉，更关注代码的优雅。请看以下代码块的高亮效果：

### TypeScript 组件示例

这是一个使用 \`React\` 和 \`Tailwind CSS\` 实现"毛玻璃"效果（Glassmorphism）的组件：

\`\`\`tsx
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard = ({ children, className = '' }: GlassCardProps) => {
  return (
    <div className={\`
      bg-white/70 dark:bg-black/70 
      backdrop-blur-xl 
      border border-white/20 
      shadow-xl 
      rounded-2xl 
      p-6 
      transition-all duration-300 hover:scale-[1.02]
      \${className}
    \`}>
      {children}
    </div>
  );
};
\`\`\`

### CSS 变量定义

\`\`\`css
:root {
  --apple-bg: #f5f5f7;
  --apple-card: #ffffff;
  --apple-blue: #0071e3;
  --apple-text: #1d1d1f;
}

.dark {
  --apple-bg: #000000;
  --apple-card: #1c1c1e;
  --apple-text: #f5f5f7;
}
\`\`\`

## 3. 视觉层次与排版

良好的排版不仅是选择字体，更是关于**留白**和**节奏**。

| 元素 | 字体大小 (px) | 字重 | 颜色 (Light) | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **H1** | 48 | 700 | #1d1d1f | 页面主标题 |
| **H2** | 32 | 600 | #1d1d1f | 章节标题 |
| **Body** | 16 | 400 | #333336 | 正文内容 |
| **Caption** | 12 | 500 | #86868b | 辅助说明 |

## 4. 交互式元素

我们支持多种 Markdown 语法扩展：

1.  **有序列表**：用于步骤说明。
2.  **无序列表**：用于特性清单。
    *   支持嵌套层级
    *   支持 *斜体* 和 **粗体** 混合
3.  **任务列表**：
    - [x] 完成设计稿
    - [x] 编写前端代码
    - [ ] 部署上线

## 5. 总结

创造一个令人愉悦的应用不仅仅是编写代码，更是一门艺术。希望这篇文章能为您提供灵感。

---
*本文由 iBlog 编辑器生成，旨在展示 Markdown 渲染能力。*
`;

const STANDARD_CONTENT_TEMPLATE = `
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

// --- 模拟文章数据 ---
export const MOCK_ARTICLES: Article[] = [
    // 插入演示用的富文本文章作为第一篇
    {
        id: 'art-rich-demo',
        title: "探索 Apple 设计美学：代码与视觉的交响",
        summary: "本文展示了 iBlog 强大的 Markdown 渲染能力，包括代码高亮、图片展示、表格排版以及 Apple 风格的视觉呈现。",
        content: RICH_CONTENT_TEMPLATE,
        cover: "https://picsum.photos/seed/rich_demo/800/600",
        views: 12580,
        likes: 3420,
        category: "Design",
        tags: ["#DesignSystem", "#Typography", "#Showcase"],
        date: new Date().toLocaleDateString(),
        updatedAt: new Date().toLocaleDateString(),
        comments: [],
        authorId: MOCK_USERS[0].id,
        authorName: MOCK_USERS[0].name,
        authorAvatar: MOCK_USERS[0].avatar,
        authorLevel: MOCK_USERS[0].level
    },
    ...Array.from({ length: 9 }).map((_, i) => ({
        id: `art-${i + 1}`,
        title: [
            "深入理解 React Server Components",
            "为什么 TypeScript 是必学的",
            "构建高性能 Web 应用的 10 个技巧",
            "Tailwind CSS 最佳实践",
            "WebAssembly：浏览器的下一件大事",
            "微前端架构实战指南",
            "Node.js 22 新特性解析",
            "CSS Grid 与 Flexbox 深度对比",
            "如何成为一名优秀的 Tech Lead",
            "2025年 UI 设计的未来趋势"
        ][i],
        summary: "本文深入探讨了现代 Web 开发中的关键技术和设计理念，适合所有级别的前端开发者阅读。",
        content: STANDARD_CONTENT_TEMPLATE,
        cover: `https://picsum.photos/seed/article${i}/800/600`,
        views: Math.floor(Math.random() * 10000) + 500,
        likes: Math.floor(Math.random() * 1000) + 50,
        category: i % 3 === 0 ? 'Tech' : i % 3 === 1 ? 'Design' : 'Life',
        tags: MOCK_TAGS.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 2),
        date: new Date(Date.now() - i * 86400000 * 5).toLocaleDateString(),
        updatedAt: new Date(Date.now() - i * 86400000).toLocaleDateString(),
        comments: [],
        authorId: MOCK_USERS[i % MOCK_USERS.length].id,
        authorName: MOCK_USERS[i % MOCK_USERS.length].name,
        authorAvatar: MOCK_USERS[i % MOCK_USERS.length].avatar,
        authorLevel: MOCK_USERS[i % MOCK_USERS.length].level
    }))
];

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

// --- 模拟相册数据 ---
export const MOCK_ALBUMS: Album[] = [
    {
        id: 'album-1',
        title: '京都之秋',
        description: '漫步在京都的古老街道，感受红叶与寺庙的静谧之美。这是一次关于色彩与禅意的探索之旅。',
        cover: 'https://picsum.photos/seed/kyoto/800/600',
        author: MOCK_USERS[0],
        date: '2023-11-20',
        likes: 342,
        views: 1205,
        comments: MOCK_COMMENTS,
        photos: [
            { id: 'p-1', url: 'https://picsum.photos/seed/kyoto1/800/600', title: '清水寺的黄昏', caption: '夕阳西下，古老的木结构在金色的光线中显得格外庄重。' },
            { id: 'p-2', url: 'https://picsum.photos/seed/kyoto2/800/1000', title: '岚山竹林', caption: '微风拂过，竹叶沙沙作响，仿佛在低语。' },
            { id: 'p-3', url: 'https://picsum.photos/seed/kyoto3/800/600', title: '伏见稻荷大社', caption: '千本鸟居，通往神域的红色隧道。' },
            { id: 'p-4', url: 'https://picsum.photos/seed/kyoto4/800/800', title: '街角的咖啡店', caption: '在繁忙的旅途中，寻找片刻的宁静。' }
        ]
    },
    {
        id: 'album-2',
        title: '赛博朋克 2077 摄影集',
        description: '夜之城的霓虹灯光下，隐藏着无数的故事。游戏摄影捕捉到的虚拟世界之美。',
        cover: 'https://picsum.photos/seed/cyber/800/600',
        author: MOCK_USERS[1],
        date: '2024-01-15',
        likes: 890,
        views: 5600,
        comments: [],
        photos: [
            { id: 'p-5', url: 'https://picsum.photos/seed/cyber1/800/500', title: 'V 的公寓', caption: '故事开始的地方。' },
            { id: 'p-6', url: 'https://picsum.photos/seed/cyber2/800/1200', title: '荒坂塔', caption: '权力的象征，高耸入云。' },
            { id: 'p-7', url: 'https://picsum.photos/seed/cyber3/800/600', title: '雨夜', caption: '在雨中，城市的倒影更加迷人。' }
        ]
    },
    {
        id: 'album-3',
        title: '极简主义办公桌',
        description: 'Setup Wars 投稿。展示我的高效工作环境，Less is More。',
        cover: 'https://picsum.photos/seed/desk/800/600',
        author: MOCK_USERS[0],
        date: '2024-03-10',
        likes: 120,
        views: 450,
        comments: MOCK_COMMENTS,
        photos: [
            { id: 'p-8', url: 'https://picsum.photos/seed/desk1/800/600', title: '整体视图', caption: '双屏显示器，无线外设，没有任何多余的线缆。' },
            { id: 'p-9', url: 'https://picsum.photos/seed/desk2/800/600', title: '机械键盘', caption: 'Keychron Q1 Pro，手感极佳。' },
            { id: 'p-10', url: 'https://picsum.photos/seed/desk3/800/600', title: '氛围灯', caption: 'ScreenBar 提供专注的光源。' }
        ]
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