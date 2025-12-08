import { request } from '../client';

export const aiApi = {
    getHistory: () => 
        request.get<{id: string, title: string, date: string}[]>('/ai/history'),
    
    updateUsage: (userId: string) => 
        request.post<{usage: number}>('/ai/usage', { userId }),
};
