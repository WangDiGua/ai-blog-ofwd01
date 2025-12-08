
// Global Type Definitions

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
  tags?: string[];
  comments?: Comment[];
  authorId?: string;
  authorName?: string; // 方便显示
  authorAvatar?: string;
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
