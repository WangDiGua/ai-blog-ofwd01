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
    MOCK_DANMAKU
} from './mockData';
import { User } from '../types';

// --- 类型定义 ---

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
    // 模拟获取 CSRF Token (真实场景中应从 document.cookie 读取 XSRF-TOKEN)
    private getCsrfToken(): string | null {
        // Example: return document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || null;
        return 'mock-csrf-token-secure';
    }

    /**
     * 获取认证头
     */
    private getHeaders(customHeaders: Record<string, string> = {}) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            // 安全头部
            'X-Requested-With': 'XMLHttpRequest', // 防止 CSRF
            ...customHeaders
        };
        
        // 从 localStorage 获取 Token
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // 添加 CSRF Token
        const csrfToken = this.getCsrfToken();
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        }
        
        return headers;
    }

    /**
     * 统一响应处理
     */
    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            // 安全：统一拦截 401/403
            if (response.status === 401) {
                console.warn('Unauthorized access. Redirecting to login.');
                localStorage.removeItem('token');
                window.dispatchEvent(new Event('auth-error')); // 触发全局事件
                // window.location.href = '/login'; // 实际项目中通常重定向
            }
            if (response.status === 403) {
                 console.error('Forbidden resource access.');
                 throw new Error('您没有权限执行此操作');
            }
            if (response.status === 429) {
                 throw new Error('请求过于频繁，请稍后再试');
            }
            
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const resData: ApiResponse<T> = await response.json();

        // 处理业务错误 (根据后端约定的 code，假设 200 为成功)
        if (resData.code !== 200) {
            throw new Error(resData.message || '请求失败');
        }

        return resData.data;
    }

    /**
     * GET 请求
     */
    async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
        // ----------------------------------------------------------------
        // REAL API CODE (COMMENTED OUT FOR MOCK MODE)
        // ----------------------------------------------------------------
        /*
        // 构建查询参数字符串
        const url = new URL(endpoint, window.location.origin + BASE_URL);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                // 安全：编码 URI 组件
                url.searchParams.append(key, String(params[key]));
            }
        });

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: this.getHeaders(),
        });

        return this.handleResponse<T>(response);
        */
        // ----------------------------------------------------------------

        // MOCK MODE
        // console.log(`[Mock GET] ${endpoint}`, params);
        return this.mockRouter('GET', endpoint, params);
    }

    /**
     * POST 请求
     */
    async post<T>(endpoint: string, body: any = {}): Promise<T> {
        // ----------------------------------------------------------------
        // REAL API CODE (COMMENTED OUT FOR MOCK MODE)
        // ----------------------------------------------------------------
        /*
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });

        return this.handleResponse<T>(response);
        */
        // ----------------------------------------------------------------

        // MOCK MODE
        // console.log(`[Mock POST] ${endpoint}`, body);
        return this.mockRouter('POST', endpoint, body);
    }

    /**
     * 文件上传 (FormData)
     */
    async upload<T>(endpoint: string, formData: FormData): Promise<T> {
        // ----------------------------------------------------------------
        // REAL API CODE (COMMENTED OUT FOR MOCK MODE)
        // ----------------------------------------------------------------
        /*
        // 上传时不手动设置 Content-Type，浏览器会自动识别为 multipart/form-data
        const headers = this.getHeaders();
        delete headers['Content-Type']; // 关键：让浏览器自动设置 boundary

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: headers,
            body: formData,
        });

        return this.handleResponse<T>(response);
        */
       // ----------------------------------------------------------------
       
       return new Promise(resolve => setTimeout(() => resolve({ url: 'https://picsum.photos/200' } as any), 1000));
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
                        // 简单过滤
                        if (data.q) {
                            const q = data.q.toLowerCase();
                            items = items.filter(i => i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q));
                        }
                        if (data.category && data.category !== 'All') {
                            items = items.filter(i => i.category === data.category);
                        }
                        // 分页
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
                        const article = MOCK_ARTICLES.find(a => a.id === id) || MOCK_ARTICLES[0];
                        resolve(article);
                        return;
                    }
                    
                    if (endpoint.startsWith('/users/')) {
                        const id = endpoint.split('/')[2];
                        // 模拟获取特定用户，如果没找到返回默认第一个
                        const user = MOCK_USERS.find(u => u.id === id) || MOCK_USERS[0];
                        resolve(user);
                        return;
                    }
                    
                    if (endpoint === '/user/followers' || endpoint === '/user/following') {
                        // 返回简化的用户列表
                        resolve(MOCK_USERS.map(u => ({...u, isFollowing: Math.random() > 0.5})));
                        return;
                    }

                    if (endpoint === '/auth/captcha') {
                        // 返回模拟验证码
                        resolve({
                            key: 'mock-captcha-uuid',
                            image: 'https://dummyimage.com/100x40/e0e0e0/000000.png&text=1234'
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
                        default: resolve({});
                    }
                    return;
                }

                // --- POST 请求 ---
                if (method === 'POST') {
                    if (endpoint === '/auth/login' || endpoint === '/login') {
                        // 模拟登录成功，返回第一个模拟用户
                        const user = MOCK_USERS[0];
                        resolve({ ...user, token: 'mock-jwt-token-123456' });
                        return;
                    }

                    if (endpoint === '/auth/register') {
                         const newUser = { ...MOCK_USERS[0], id: `u-${Date.now()}`, name: data.username };
                         resolve(newUser);
                         return;
                    }

                    if (endpoint === '/auth/send-code') {
                        resolve({ success: true });
                        return;
                    }
                    
                    if (endpoint === '/user/checkin') {
                        resolve({ points: 10, total: 1210 });
                        return;
                    }
                    
                    if (endpoint === '/user/follow') {
                        resolve({ success: true, isFollowing: data.isFollowing });
                        return;
                    }

                    if (endpoint === '/ai/usage') {
                         resolve({ usage: (MOCK_USERS[0].aiUsage || 0) + 1 });
                         return;
                    }

                    if (endpoint === '/articles/create') {
                        resolve({ id: `art-${Date.now()}`, ...data });
                        return;
                    }

                    if (endpoint === '/user/donation') {
                        resolve({ success: true });
                        return;
                    }
                    
                    // 默认成功
                    resolve({ success: true });
                }
            }, 600); // 模拟 600ms 延迟
        });
    }
}

// 导出单例
export const request = new HttpClient();