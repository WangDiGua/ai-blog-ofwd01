import { request } from './client';
import { Article, CommunityPost, Song, User, Announcement } from '../types';

// 文章相关接口
export const articleApi = {
    getList: (params: { page?: number; limit?: number; q?: string; category?: string; tag?: string; userId?: string; favorites?: boolean }) => 
        request.get<{items: Article[], totalPages: number, total: number}>('/articles', params),
    
    getDetail: (id: string) => 
        request.get<Article>(`/articles/${id}`),
    
    create: (data: { title: string; content: string }) => 
        request.post<Article>('/articles/create', data),
};

// 用户/认证相关接口
export const userApi = {
    login: (username: string) => 
        request.post<User>('/login', { username }),
    
    getProfile: (id: string) => 
        request.get<User>(`/users/${id}`),
    
    updateProfile: (data: Partial<User>) => 
        request.post<User>('/user/update', data),
    
    checkIn: () => 
        request.post<{points: number, total: number}>('/user/checkin'),
    
    follow: (data: { userId: string; isFollowing: boolean }) => 
        request.post<{ success: true; isFollowing: boolean }>('/user/follow', data),
    
    getFollowers: () => 
        request.get<any[]>('/user/followers'),
    
    getFollowing: () => 
        request.get<any[]>('/user/following'),
        
    submitFeedback: (data: { userId?: string, content: string, type: 'bug' | 'suggestion' }) =>
        request.post('/user/feedback', data),
};

// 社区相关接口
export const communityApi = {
    getPosts: () => 
        request.get<CommunityPost[]>('/community'),
};

// 音乐相关接口
export const musicApi = {
    getList: () => 
        request.get<Song[]>('/music'),
};

// 系统/工具相关接口
export const systemApi = {
    getAnnouncements: () => 
        request.get<Announcement[]>('/announcements'),
    
    getHotSearches: () => 
        request.get<string[]>('/search/hot'),
};

// AI 相关接口
export const aiApi = {
    getHistory: () => 
        request.get<{id: string, title: string, date: string}[]>('/ai/history'),
    
    updateUsage: (userId: string) => 
        request.post<{usage: number}>('/ai/usage', { userId }),
};