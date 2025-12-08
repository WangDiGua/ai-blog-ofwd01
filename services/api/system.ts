import { request } from '../client';
import { Announcement } from '../../types';

export const systemApi = {
    getAnnouncements: () => 
        request.get<Announcement[]>('/announcements'),
    
    getHotSearches: () => 
        request.get<string[]>('/search/hot'),
};
