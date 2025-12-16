import React, { useEffect, useState } from 'react';
import { communityApi } from '../services/api';
import { TrendingPlatform } from '../types';
import { Card, Spinner } from '../components/ui';
import { RotateCw, TrendingUp, ExternalLink } from 'lucide-react';

// --- SVG Logos ---

const DouyinLogo = () => (
    <svg viewBox="0 0 48 48" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
        <path d="M39 12.87V7.5C39 5.84 37.66 4.5 36 4.5H12C10.34 4.5 9 5.84 9 7.5V40.5C9 42.16 10.34 43.5 12 43.5H36C37.66 43.5 39 42.16 39 40.5V28.24C39 28.24 35.82 28.53 34.24 27.53C32.66 26.53 32.08 24.53 32.08 24.53V15.53C32.08 15.53 34.08 16.53 36.08 16.53C38.08 16.53 39 15.53 39 15.53V12.87Z" fill="white" fillOpacity="0.01"/>
        <path d="M19 19.5V31.5C19 33.1569 17.6569 34.5 16 34.5C14.3431 34.5 13 33.1569 13 31.5C13 29.8431 14.3431 28.5 16 28.5V25.5C12.6863 25.5 10 28.1863 10 31.5C10 34.8137 12.6863 37.5 16 37.5C19.3137 37.5 22 34.8137 22 31.5V19.5H19Z" fill="currentColor"/>
        <path d="M22 19.5V23.3378C23.6336 22.8229 25.3621 22.5186 27.1355 22.5024C27.0906 21.5039 27.4276 20.5181 28.0827 19.742C28.8953 18.7792 30.129 18.2576 31.3917 18.2981L31.3976 18.2983V15.2983C31.3283 15.2974 31.259 15.2974 31.1897 15.2983C29.6231 15.3187 28.1328 15.9869 27.0645 17.1481C26.1957 18.0927 25.617 19.263 25.3976 20.5173C24.321 20.6554 23.2721 20.9229 22.269 21.3093L22 21.4129V19.5H22Z" fill="currentColor"/>
    </svg>
);

const BilibiliLogo = () => (
    <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 10L19.0909 14.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M33 10L28.9091 14.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="8" y="15" width="32" height="22" rx="2" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
        <circle cx="17" cy="24" r="2.5" fill="currentColor"/>
        <circle cx="31" cy="24" r="2.5" fill="currentColor"/>
        <path d="M20 31C20 31 22 33 24 33C26 33 28 31 28 31" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const BaiduLogo = () => (
    <svg viewBox="0 0 48 48" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.9999 4.5L42.5 14.5V36.5L23.9999 44.5L5.5 36.5V14.5L23.9999 4.5Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
        <path d="M24 18V28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 23.0083L24 18.0083L32 23.0083" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 23.0083V33.0083L24 38.0083L32 33.0083V23.0083" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
    </svg>
);

const ToutiaoLogo = () => (
    <svg viewBox="0 0 48 48" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="36" height="36" rx="3" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
        <path d="M14 16H34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 24H34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 32H26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const getPlatformIcon = (id: string) => {
    switch(id) {
        case 'douyin': return <DouyinLogo />;
        case 'bilibili': return <BilibiliLogo />;
        case 'baidu': return <BaiduLogo />;
        case 'toutiao': return <ToutiaoLogo />;
        default: return <TrendingUp size={24} />;
    }
};

export const TodayTopic = () => {
    const [platforms, setPlatforms] = useState<TrendingPlatform[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await communityApi.getTrendingTopics();
            setPlatforms(data);
        } catch (e) {
            console.error("Failed to fetch topics", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    if (loading && platforms.length === 0) return <div className="flex justify-center h-[50vh] items-center"><Spinner /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 mb-20">
            <div className="flex items-center justify-between mb-8 animate-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mr-4 shadow-sm border border-red-200 dark:border-red-800">
                        <TrendingUp size={24} className="text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-apple-text dark:text-apple-dark-text">全网热榜</h1>
                        <p className="text-gray-500 text-sm mt-1">实时聚合各大平台热门话题</p>
                    </div>
                </div>
                <button 
                    onClick={handleRefresh}
                    className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 ${refreshing ? 'animate-spin' : ''}`}
                    title="刷新"
                >
                    <RotateCw size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {platforms.map((platform, idx) => (
                    <Card 
                        key={platform.id} 
                        className="flex flex-col h-[600px] overflow-hidden border-0 shadow-lg animate-in fade-in zoom-in-95 duration-500"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        {/* Header */}
                        <div className={`p-4 ${platform.color} flex items-center justify-between shadow-md z-10`}>
                            <div className="flex items-center space-x-3 font-bold text-lg">
                                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm shadow-inner">
                                    {getPlatformIcon(platform.id)}
                                </div>
                                <span className="tracking-wide text-base">{platform.name}</span>
                            </div>
                            <span className="text-[10px] font-mono opacity-90 bg-black/20 px-2 py-1 rounded text-white backdrop-blur-md">
                                {new Date().getHours()}:00
                            </span>
                        </div>

                        {/* List */}
                        <div className="flex-1 bg-white dark:bg-gray-900 p-0 overflow-y-auto scrollbar-thin">
                            {platform.list.map((item, index) => (
                                <a 
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    key={index} 
                                    className="group flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border-b border-gray-100 dark:border-gray-800 last:border-0 relative"
                                >
                                    <span className={`
                                        flex-shrink-0 w-6 text-center font-bold text-sm mt-0.5 mr-3 font-mono
                                        ${index === 0 ? 'text-red-500 text-xl' : index === 1 ? 'text-orange-500 text-lg' : index === 2 ? 'text-yellow-500 text-base' : 'text-gray-400'}
                                    `}>
                                        {item.rank}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 line-clamp-2 group-hover:text-apple-blue transition-colors leading-relaxed">
                                            {item.title}
                                        </h4>
                                        <div className="mt-1.5 flex items-center justify-between text-xs text-gray-400">
                                            <span className="flex items-center">
                                                {index < 3 && <span className="text-[10px] mr-1">🔥</span>}
                                                {item.hot}
                                            </span>
                                            <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                    {/* Hover Indicator */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-apple-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            ))}
                            {platform.list.length === 0 && (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    暂无数据
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};