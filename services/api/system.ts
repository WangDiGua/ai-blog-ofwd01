import { request } from '../client';
import { Announcement } from '../../types';

export const systemApi = {
    getAnnouncements: () => 
        request.get<Announcement[]>('/announcements'),
    
    getHotSearches: () => 
        request.get<string[]>('/search/hot'),
    
    getFriendLinks: () =>
        request.get<{name: string, url: string, avatar: string, desc: string}[]>('/friend-links'),

    // 友链申请
    applyFriendLink: (data: { name: string; url: string; avatar: string; desc: string }) => 
        new Promise<{success: boolean}>(resolve => setTimeout(() => resolve({ success: true }), 1000))
};