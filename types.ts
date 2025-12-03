// Global Type Definitions

export interface User {
  id: string;
  name: string;
  avatar: string;
  email?: string;
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
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  date: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number; // in seconds
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