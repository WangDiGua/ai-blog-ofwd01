import { request } from '../client';
import { CommunityPost, Album, TrendingPlatform, Product, ProductFilter, TrendingItem } from '../../types';
import { MOCK_TRENDING_TOPICS } from '../mockData';

// Helper to normalize external API data
const fetchExternalHotList = async (id: string, url: string): Promise<TrendingItem[]> => {
    try {
        const response = await fetch(url);
        const json = await response.json();
        
        if (!json.success || !Array.isArray(json.data)) {
            throw new Error(`Invalid response from ${id}`);
        }

        // Normalize data to strictly top 2 items
        return json.data.slice(0, 2).map((item: any, index: number) => ({
            rank: index + 1,
            title: item.title || '无标题',
            hot: item.hot || item.view || '热度上升',
            url: item.url || item.link || '#'
        }));
    } catch (error) {
        console.warn(`Failed to fetch hotlist for ${id}, using mock data.`, error);
        // Fallback to mock data for this specific platform (already limited to 2 in mockData)
        const mockPlatform = MOCK_TRENDING_TOPICS.find(p => p.id === id);
        return mockPlatform ? mockPlatform.list : [];
    }
};

export const communityApi = {
    getPosts: () => 
        request.get<CommunityPost[]>('/community'),
    
    createPost: (data: { content: string; images?: string[] }) =>
        request.post<CommunityPost>('/community/posts/create', data),
    
    getDanmaku: () =>
        request.get<string[]>('/danmaku'),

    getAlbums: () =>
        request.get<Album[]>('/albums'),

    // Updated to fetch real data
    getTrendingTopics: async (): Promise<TrendingPlatform[]> => {
        // Parallel fetch for better performance
        const [douyin, bilibili, toutiao, baidu] = await Promise.all([
            fetchExternalHotList('douyin', 'https://api.vvhan.com/api/hotlist/douyin'),
            fetchExternalHotList('bilibili', 'https://api.vvhan.com/api/hotlist/bili'),
            fetchExternalHotList('toutiao', 'https://api.vvhan.com/api/hotlist/toutiao'),
            fetchExternalHotList('baidu', 'https://api.vvhan.com/api/hotlist/baiduRD')
        ]);

        return [
            {
                id: 'douyin',
                name: '抖音热榜',
                icon: '', // Handled by UI component
                color: 'bg-black text-white border-gray-800',
                list: douyin
            },
            {
                id: 'bilibili',
                name: '哔哩哔哩',
                icon: '',
                color: 'bg-[#fb7299] text-white border-pink-400',
                list: bilibili
            },
            {
                id: 'toutiao',
                name: '今日头条',
                icon: '',
                color: 'bg-[#f85959] text-white border-red-500',
                list: toutiao
            },
            {
                id: 'baidu',
                name: '百度热搜',
                icon: '',
                color: 'bg-[#4e6ef2] text-white border-blue-500',
                list: baidu
            }
        ];
    },

    // 更新 API 调用签名
    getProducts: (params: ProductFilter) =>
        request.get<{items: Product[], total: number, totalPages: number}>('/community/store', params),
};