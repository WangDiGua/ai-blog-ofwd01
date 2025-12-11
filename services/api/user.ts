import { request } from '../client';
import { User } from '../../types';

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

    submitDonation: (data: { userId?: string; nickname?: string; avatar?: string; screenshot: string }) =>
        request.post<{ success: boolean }>('/user/donation', data),

    reportContent: (data: { targetId: string; type: string; reason: string; description?: string }) =>
        request.post<{ success: boolean }>('/user/report', data),
};