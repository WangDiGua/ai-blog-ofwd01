import { 
    MOCK_ARTICLES, 
    MOCK_USERS, 
    MOCK_POSTS, 
    MOCK_SONGS, 
    MOCK_ANNOUNCEMENTS, 
    MOCK_HOT_SEARCHES,
    MOCK_AI_HISTORY,
    MOCK_TAGS,
    MOCK_CATEGORIES,
    MOCK_FRIEND_LINKS,
    MOCK_DANMAKU,
    MOCK_ALBUMS,
    MOCK_TRENDING_TOPICS,
    MOCK_PRODUCTS
} from './mockData';
import { User, Product, CommunityPost } from '../types';

// ... (Previous Helper Classes like HttpClient remain unchanged) ...

// 标准后端响应结构
interface ApiResponse<T> {
    code: number;
    data: T;
    message: string;
}

// 基础 URL (通过 Vite 代理转发)
const BASE_URL = '/api';

/**
 * 真实 HTTP 客户端
 */
class HttpClient {
    // ... (Existing implementation of getCsrfToken, getHeaders, handleResponse) ...
    private getCsrfToken(): string | null {
        return 'mock-csrf-token-secure';
    }

    private getHeaders(customHeaders: Record<string, string> = {}) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest', 
            ...customHeaders
        };
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const csrfToken = this.getCsrfToken();
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        }
        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            if (response.status === 401) {
                console.warn('Unauthorized access. Redirecting to login.');
                localStorage.removeItem('token');
                window.dispatchEvent(new Event('auth-error')); 
            }
            if (response.status === 403) {
                 throw new Error('您没有权限执行此操作');
            }
            if (response.status === 429) {
                 throw new Error('请求过于频繁，请稍后再试');
            }
            throw new Error(`HTTP Error: ${response.status}`);
        }
        const resData: ApiResponse<T> = await response.json();
        if (resData.code !== 200) {
            throw new Error(resData.message || '请求失败');
        }
        return resData.data;
    }

    async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
        return this.mockRouter('GET', endpoint, params);
    }

    async post<T>(endpoint: string, body: any = {}): Promise<T> {
        return this.mockRouter('POST', endpoint, body);
    }

    async upload<T>(endpoint: string, formData: FormData): Promise<T> {
       return new Promise(resolve => setTimeout(() => resolve({ url: 'https://images.unsplash.com/photo-1621609764180-2ca554a9d6f2?auto=format&fit=crop&w=400&q=80' } as any), 1000));
    }

    // ---------------------------------------------------------------------------
    // MOCK DATA ROUTER (模拟后端逻辑)
    // ---------------------------------------------------------------------------
    private async mockRouter(method: 'GET' | 'POST', endpoint: string, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // --- GET 请求 ---
                if (method === 'GET') {
                    if (endpoint === '/articles') {
                        let items = [...MOCK_ARTICLES];
                        // 简单的搜索逻辑
                        if (data.q) {
                            const q = data.q.toLowerCase();
                            items = items.filter(i => i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q));
                        }
                        if (data.category && data.category !== 'All') {
                            items = items.filter(i => i.category === data.category);
                        }
                        // 分页逻辑 (即使只有2条数据，也要处理)
                        const page = Number(data.page) || 1;
                        const limit = Number(data.limit) || 10;
                        const start = (page - 1) * limit;
                        const pagedItems = items.slice(start, start + limit);

                        resolve({
                            items: pagedItems,
                            totalPages: Math.ceil(items.length / limit),
                            total: items.length
                        });
                        return;
                    }

                    if (endpoint.startsWith('/articles/')) {
                        const id = endpoint.split('/')[2];
                        const article = MOCK_ARTICLES.find(a => a.id === id) || MOCK_ARTICLES[0]; // Fallback to first for smoother mock UX
                        if (!article) {
                            resolve(null);
                        } else {
                            resolve(article);
                        }
                        return;
                    }
                    
                    if (endpoint.startsWith('/users/')) {
                        const id = endpoint.split('/')[2];
                        const user = MOCK_USERS.find(u => u.id === id) || MOCK_USERS[0];
                        resolve(user);
                        return;
                    }
                    
                    if (endpoint === '/user/followers' || endpoint === '/user/following') {
                        resolve(MOCK_USERS);
                        return;
                    }

                    if (endpoint === '/auth/captcha') {
                        resolve({
                            key: 'mock-captcha-uuid',
                            image: 'https://dummyimage.com/100x40/e0e0e0/000000.png&text=1234'
                        });
                        return;
                    }

                    // --- Store Logic ---
                    if (endpoint === '/community/store') {
                        let items = MOCK_PRODUCTS.filter(p => p.type === data.type);
                        
                        // Filters for guidance
                        if (data.type === 'guidance') {
                            if (data.name) {
                                items = items.filter(p => p.title.toLowerCase().includes(data.name.toLowerCase()));
                            }
                            if (data.category && data.category !== 'all') {
                                items = items.filter(p => p.serviceCategory === data.category);
                            }
                            if (data.minPrice) {
                                items = items.filter(p => p.price >= Number(data.minPrice));
                            }
                            if (data.maxPrice) {
                                items = items.filter(p => p.price <= Number(data.maxPrice));
                            }
                        }

                        const page = Number(data.page) || 1;
                        const limit = Number(data.limit) || 8;
                        const start = (page - 1) * limit;
                        const pagedItems = items.slice(start, start + limit);

                        resolve({
                            items: pagedItems,
                            totalPages: Math.ceil(items.length / limit),
                            total: items.length
                        });
                        return;
                    }

                    switch (endpoint) {
                        case '/community': resolve(MOCK_POSTS); break;
                        case '/music': resolve(MOCK_SONGS); break;
                        case '/announcements': resolve(MOCK_ANNOUNCEMENTS); break;
                        case '/search/hot': resolve(MOCK_HOT_SEARCHES); break;
                        case '/ai/history': resolve(MOCK_AI_HISTORY); break;
                        case '/tags': resolve(MOCK_TAGS); break;
                        case '/categories': resolve(MOCK_CATEGORIES); break;
                        case '/friend-links': resolve(MOCK_FRIEND_LINKS); break;
                        case '/danmaku': resolve(MOCK_DANMAKU); break;
                        case '/albums': resolve(MOCK_ALBUMS); break;
                        case '/community/trending': resolve(MOCK_TRENDING_TOPICS); break;
                        default: resolve({});
                    }
                    return;
                }

                // --- POST 请求 ---
                if (method === 'POST') {
                    if (endpoint === '/auth/login' || endpoint === '/login') {
                        // 使用第一个模拟用户登录
                        const user = MOCK_USERS[0];
                        resolve({ ...user, token: 'mock-jwt-token-123456' });
                        return;
                    }
                    // Create Post
                    if (endpoint === '/community/posts/create') {
                        // 构建完整内容（文本 + 图片）
                        let fullContent = data.content;
                        if (data.images && data.images.length > 0) {
                            fullContent += '\n\n';
                            data.images.forEach((img: string) => {
                                fullContent += `![image](${img})\n`;
                            });
                        }

                        const newPost: CommunityPost = {
                            id: `p-${Date.now()}`,
                            author: MOCK_USERS[0],
                            content: fullContent,
                            likes: 0,
                            comments: 0,
                            timeAgo: '刚刚'
                        };
                        resolve(newPost);
                        return;
                    }

                    // ... other existing post handlers ...
                    if (endpoint === '/auth/register') {
                         const newUser = { 
                             id: `u-${Date.now()}`, 
                             name: data.username,
                             username: data.username,
                             role: 'user',
                             level: '炼气期',
                             aiUsage: 0,
                             points: 0,
                             avatar: 'https://ui-avatars.com/api/?name=' + data.username
                         };
                         resolve(newUser);
                         return;
                    }
                    if (endpoint === '/auth/send-code') { resolve({ success: true }); return; }
                    if (endpoint === '/user/checkin') { resolve({ points: 10, total: 8898 }); return; }
                    if (endpoint === '/user/follow') { resolve({ success: true, isFollowing: data.isFollowing }); return; }
                    if (endpoint === '/ai/usage') { resolve({ usage: 1 }); return; }
                    if (endpoint === '/articles/create') { resolve({ id: `art-${Date.now()}`, ...data }); return; }
                    if (endpoint === '/user/donation') { resolve({ success: true }); return; }
                    if (endpoint === '/user/report') { resolve({ success: true }); return; }
                    
                    resolve({ success: true });
                }
            }, 600); // 模拟 600ms 延迟
        });
    }
}

export const request = new HttpClient();