import { request } from '../client';
import { Article } from '../../types';

export const articleApi = {
    getList: (params: { page?: number; limit?: number; q?: string; category?: string; tag?: string; userId?: string; favorites?: boolean }) => 
        request.get<{items: Article[], totalPages: number, total: number}>('/articles', params),
    
    getDetail: (id: string) => 
        request.get<Article>(`/articles/${id}`),
    
    create: (data: { title: string; content: string }) => 
        request.post<Article>('/articles/create', data),

    getTags: () => request.get<string[]>('/tags'),

    getCategories: () => request.get<{id: string, name: string, desc: string, color: string, img: string}[]>('/categories'),
};