import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { articleApi } from '../services/api';
import { Article } from '../types';
import { Card, Spinner, ParallaxFloat, ParallaxImage } from '../components/ui';
import { ArrowRight, Circle, Clock } from 'lucide-react';

export const Timeline = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all articles
        articleApi.getList({ limit: 20 }).then(res => {
            setArticles(res.items);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="flex justify-center h-[50vh] items-center"><Spinner /></div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 mb-20 overflow-hidden">
            <div className="text-center mb-16 md:mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
                <ParallaxFloat speed={-0.2} lag={0.5}>
                    <h1 className="text-4xl md:text-6xl font-black text-apple-text dark:text-apple-dark-text tracking-tighter mb-4">
                        时空回廊
                    </h1>
                </ParallaxFloat>
                <ParallaxFloat speed={0.1} lag={0.8}>
                    <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                        滚动探索思维的轨迹。GSAP 驱动的物理惯性视差。
                    </p>
                </ParallaxFloat>
                
                {/* 装饰性背景文字 */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[80px] md:text-[200px] font-bold text-gray-100 dark:text-gray-800/20 -z-10 select-none whitespace-nowrap opacity-50">
                    TIMELINE
                </div>
            </div>

            <div className="relative">
                {/* 中间线 (桌面端) / 左侧线 (移动端) */}
                <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-700 to-transparent -translate-x-1/2 md:translate-x-0 z-0"></div>

                <div className="space-y-16 md:space-y-32">
                    {articles.map((article, index) => {
                        // Desktop alternating logic
                        const isEven = index % 2 === 0;
                        return (
                            <div 
                                key={article.id} 
                                className={`relative flex flex-col md:flex-row items-start md:items-center md:justify-between ${isEven ? 'md:flex-row-reverse' : ''}`}
                            >
                                {/* 时间点标记 */}
                                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10 flex items-center justify-center top-0 md:top-auto">
                                    <div className="w-3 h-3 bg-apple-blue rounded-full ring-4 ring-white dark:ring-gray-900 shadow-lg"></div>
                                </div>

                                {/* 占位空间 (桌面端) */}
                                <div className="hidden md:block w-5/12"></div>

                                {/* 内容卡片 (应用整体浮动视差) */}
                                <div className={`w-full pl-12 md:pl-0 md:w-5/12`}>
                                    <ParallaxFloat 
                                        speed={isEven ? 0.3 : 0.5} // 不同的速度创造错落感
                                        lag={1.2} // 强惯性
                                    >
                                        <div 
                                            className="group cursor-pointer relative perspective-1000"
                                            onClick={() => navigate(`/article/${article.id}`)}
                                        >
                                            {/* 连接线 */}
                                            {/* Mobile: Always left */}
                                            <div className="absolute top-1.5 left-[-24px] w-6 border-t border-dashed border-gray-300 dark:border-gray-700 md:hidden opacity-50"></div>
                                            
                                            {/* Desktop: Alternating */}
                                            <div className={`hidden md:block absolute top-10 border-t border-dashed border-gray-300 dark:border-gray-700 w-8 md:w-16 opacity-50
                                                ${isEven ? 'right-[-64px]' : 'left-[-64px]'}
                                            `}></div>

                                            {/* 日期浮标 - Mobile: Above card, Desktop: Above card with conditional alignment */}
                                            <div className={`absolute -top-6 left-0 text-xs md:text-sm font-mono text-gray-400 flex items-center ${isEven ? 'md:right-0 md:left-auto' : 'md:left-0'}`}>
                                                <Clock size={12} className="mr-1" /> {article.date}
                                            </div>

                                            <Card className="overflow-hidden hover:shadow-2xl transition-shadow duration-500 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-0 rounded-2xl group/card mt-2 md:mt-0">
                                                {/* 视差图片容器 */}
                                                <div className="relative h-40 md:h-48 overflow-hidden">
                                                    <ParallaxImage 
                                                        src={article.cover} 
                                                        alt={article.title} 
                                                        className="group-hover/card:scale-110 transition-transform duration-700"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                                                    <div className="absolute bottom-3 left-4 right-4 text-white">
                                                        <span className="text-xs font-bold px-2 py-1 bg-white/20 backdrop-blur-md rounded-md border border-white/10">
                                                            {article.category}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-4 md:p-6">
                                                    <h3 className="text-lg md:text-xl font-bold text-apple-text dark:text-apple-dark-text mb-2 md:mb-3 leading-tight group-hover:text-apple-blue transition-colors">
                                                        {article.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 md:mb-4 leading-relaxed">
                                                        {article.summary}
                                                    </p>
                                                    <div className="flex items-center text-apple-blue text-sm font-medium group/btn">
                                                        阅读全文 <ArrowRight size={14} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    </ParallaxFloat>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="text-center mt-32 text-gray-400 text-sm flex flex-col items-center">
                <Circle size={8} className="fill-gray-300 text-gray-300 mb-2 animate-pulse" />
                <span>End of Timeline</span>
            </div>
        </div>
    );
};