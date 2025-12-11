import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { articleApi } from '../services/api';
import { Article } from '../types';
import { Card, Img, Spinner } from '../components/ui';
import { ArrowLeft, BookOpen, Layers } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    desc: string;
    color: string;
    img: string;
}

export const CategoryPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        articleApi.getCategories().then(data => {
            setCategories(data);
            setPageLoading(false);
        });
    }, []);

    // Fetch articles when a category is selected
    useEffect(() => {
        if (selectedCategory) {
            // Scroll to top when entering a category - defer slightly to ensure layout paint
            setTimeout(() => window.scrollTo(0, 0), 0);
            
            setLoading(true);
            articleApi.getList({ category: selectedCategory, limit: 20 }).then(res => {
                setArticles(res.items);
                setLoading(false);
            });
        }
    }, [selectedCategory]);

    // 3D Tilt Effect Helper
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg rotation
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    };

    if (pageLoading) return <div className="flex justify-center h-screen items-center"><Spinner /></div>;

    if (selectedCategory) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-10 min-h-screen">
                <div className="flex items-center mb-8 animate-in slide-in-from-left-4 duration-500">
                    <button 
                        onClick={() => setSelectedCategory(null)}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mr-4"
                    >
                        <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-apple-text dark:text-apple-dark-text">{categories.find(c => c.id === selectedCategory)?.name}</h1>
                        <p className="text-sm text-gray-500">共 {articles.length} 篇文章</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center h-64 items-center"><Spinner /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article, idx) => (
                            <Card 
                                key={article.id} 
                                hover 
                                onClick={() => navigate(`/article/${article.id}`)}
                                className="group cursor-pointer h-full flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <Img src={article.cover} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{article.date}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-apple-text dark:text-apple-dark-text mb-2 line-clamp-2 group-hover:text-apple-blue transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                                        {article.summary}
                                    </p>
                                    <div className="flex items-center text-apple-blue text-sm font-medium">
                                        阅读全文 <BookOpen size={14} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-5px] group-hover:translate-x-0" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                        {articles.length === 0 && !loading && (
                            <div className="col-span-full text-center py-20 text-gray-400">
                                此分类下暂无文章
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 mb-20">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl md:text-6xl font-bold text-apple-text dark:text-apple-dark-text tracking-tight mb-4">
                    知识图谱
                </h1>
                <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                    在有序的分类中探索无尽的创意与技术
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                {categories.map((cat, idx) => (
                    <div
                        key={cat.id}
                        className="relative h-64 rounded-3xl cursor-pointer transition-all duration-300 select-none shadow-xl"
                        onClick={() => setSelectedCategory(cat.id)}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="absolute inset-0 rounded-3xl overflow-hidden bg-white dark:bg-gray-800">
                            {/* Background Image with Blur */}
                            <div className="absolute inset-0">
                                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover opacity-60 dark:opacity-40 transition-transform duration-700 hover:scale-110" />
                                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} mix-blend-overlay opacity-80`} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>
                            
                            {/* Content */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-10">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30">
                                    <Layers size={24} className="text-white" />
                                </div>
                                <h3 className="text-3xl font-bold mb-2 translate-y-2 group-hover:translate-y-0 transition-transform">{cat.name}</h3>
                                <p className="text-white/80 font-medium translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">
                                    {cat.desc}
                                </p>
                            </div>
                            
                            {/* Glass Shine Effect */}
                            <div className="absolute -inset-full top-0 block bg-gradient-to-r from-transparent to-white opacity-20 transform -skew-x-12 animate-shine" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};