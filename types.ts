
// Global Type Definitions

export type CultivationLevel = '炼气期' | '筑基期' | '结丹期' | '元婴期' | '化神期' | '炼虚期' | '合体期' | '大乘期' | '真仙/渡劫期';

export const CULTIVATION_LEVELS: CultivationLevel[] = [
    '炼气期', '筑基期', '结丹期', '元婴期', '化神期', '炼虚期', '合体期', '大乘期', '真仙/渡劫期'
];

export interface SignInRecord {
    date: string;
    points: number;
}

export interface User {
  id: string;
  name: string;
  username?: string;
  avatar: string;
  email?: string;
  bio?: string;
  points?: number;
  coverImage?: string;
  role: 'user' | 'vip' | 'admin';
  vipType?: 'none' | 'monthly' | 'permanent'; // VIP 类型
  level: CultivationLevel; // 修仙等级
  signInHistory?: SignInRecord[]; // 签到历史
  aiUsage: number;
  // 新增统计字段
  followersCount?: number;
  followingCount?: number;
  totalLikes?: number;
  isFollowing?: boolean; // 当前登录用户是否关注了该用户
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string; // Full markdown/html content
  cover: string;
  views: number;
  likes: number;
  category: string;
  date: string;
  updatedAt?: string; // 新增更新时间
  tags?: string[];
  comments?: Comment[];
  authorId?: string;
  authorName?: string; // 方便显示
  authorAvatar?: string;
  authorLevel?: CultivationLevel; // 作者等级
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  date: string;
  replies?: Comment[];
  likes?: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number; // in seconds
  lyrics?: string[];
}

// 新增播放模式类型
export type PlayMode = 'order' | 'loop' | 'random';

export interface CommunityPost {
  id: string;
  author: User;
  content: string;
  likes: number;
  comments: number;
  timeAgo: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean; // For thinking process display
}

export interface Announcement {
    id: number;
    title: string;
    summary: string;
    content: string; // Markdown
    type: 'info' | 'warning' | 'success';
    date: string;
    publisher: string;
}

export interface Feedback {
    userId: string;
    content: string;
    type: 'bug' | 'suggestion';
}