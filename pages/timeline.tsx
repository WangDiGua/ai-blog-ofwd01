import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { articleApi } from '../services/api';
import { Article } from '../types';
import { Card, Spinner } from '../components/ui';
import { Calendar, ArrowRight, Circle } from 'lucide-react';

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
        <div className="max-w-4xl mx-auto px-4 py-10 mb-20">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-3xl md:text-5xl font-bold text-apple-text dark:text-apple-dark-text tracking-tight mb-2">
                    时光轴
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    记录思维的轨迹与成长的点滴
                </p>
            </div>

            <div className="relative">
                {/* 中间线 (桌面端) / 左侧线 (移动端) */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 -translate-x-1/2 md:translate-x-0"></div>

                <div className="space-y-12">
                    {articles.map((article, index) => {
                        const isEven = index % 2 === 0;
                        return (
                            <div 
                                key={article.id} 
                                className={`relative flex items-center md:justify-between ${isEven ? 'md:flex-row-reverse' : ''}`}
                            >
                                {/* 时间点标记 */}
                                <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-white dark:bg-black border-4 border-apple-blue rounded-full -translate-x-1/2 z-10 shadow-sm"></div>

                                {/* 占位空间 (桌面端) */}
                                <div className="hidden md:block w-5/12"></div>

                                {/* 内容卡片 */}
                                <div 
                                    className={`w-full md:w-5/12 pl-12 md:pl-0 animate-in slide-in-from-bottom-8 duration-700 fade-in`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div 
                                        className="group cursor-pointer relative"
                                        onClick={() => navigate(`/article/${article.id}`)}
                                    >
                                        {/* 连接线 */}
                                        <div className={`absolute top-6 border-t-2 border-dashed border-gray-200 dark:border-gray-800 w-8 md:w-16 
                                            ${isEven ? 'left-[-32px] md:left-auto md:right-[-64px]' : 'left-[-32px] md:left-[-64px]'}
                                        `}></div>

                                        <Card className="overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                            <div className="relative h-32 overflow-hidden">
                                                <img 
                                                    src={article.cover} 
                                                    alt={article.title} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                                    <span className="text-white text-xs font-bold px-2 py-1 bg-apple-blue rounded-md backdrop-blur-md bg-opacity-80">
                                                        {article.date}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <h3 className="text-lg font-bold text-apple-text dark:text-apple-dark-text mb-2 line-clamp-1 group-hover:text-apple-blue transition-colors">
                                                    {article.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                                                    {article.summary}
                                                </p>
                                                <div className="flex items-center text-apple-blue text-sm font-medium group/btn">
                                                    阅读全文 <ArrowRight size={14} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="text-center mt-16 text-gray-400 text-sm flex flex-col items-center">
                <Circle size={8} className="fill-gray-300 text-gray-300 mb-2" />
                <span>没有更多了</span>
            </div>
        </div>
    );
};