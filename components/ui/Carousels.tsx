import React, { useState, useEffect } from 'react';

// --- 标签轮播组件 (带指示器) ---
export const TagCarousel = ({ tags }: { tags?: string[] }) => {
    const [page, setPage] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const VISIBLE_COUNT = 3;
    
    if (!tags || tags.length === 0) return null;

    const totalPages = Math.ceil(tags.length / VISIBLE_COUNT);

    useEffect(() => {
        if (totalPages <= 1 || isPaused) return;
        const timer = setInterval(() => {
            setPage(prev => (prev + 1) % totalPages);
        }, 5000); // 5秒轮播
        return () => clearInterval(timer);
    }, [totalPages, isPaused]);

    // 只有一页时直接展示
    if (totalPages <= 1) {
        return (
            <div className="flex space-x-2">
                {tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500 whitespace-nowrap">
                        {tag}
                    </span>
                ))}
            </div>
        );
    }

    const currentTags = tags.slice(page * VISIBLE_COUNT, (page + 1) * VISIBLE_COUNT);

    return (
        <div 
            className="flex flex-col gap-1.5"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="flex space-x-2 overflow-hidden h-6 items-center">
                {currentTags.map((tag, idx) => (
                    <span 
                        key={`${tag}-${page}-${idx}`}
                        className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500 whitespace-nowrap animate-in slide-in-from-right-4 fade-in duration-500"
                    >
                        {tag}
                    </span>
                ))}
            </div>
            {/* 指示器 */}
            <div className="flex space-x-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                    <button 
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setPage(i); }}
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i === page ? 'bg-apple-blue scale-110' : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400'}`}
                        aria-label={`Go to page ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

// --- 分类轮播组件 (带指示器) ---
export const CategoryCarousel = ({ 
    categories, 
    current, 
    onClick 
}: { 
    categories: string[], 
    current: string, 
    onClick: (c: string) => void 
}) => {
    const [page, setPage] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const VISIBLE_COUNT = 3;

    // 分类名称映射
    const getLabel = (cat: string) => {
        const map: Record<string, string> = {
            'Tech': '科技',
            'Design': '设计',
            'Life': '生活',
            'AI': '人工智能',
            'Mobile': '移动端',
            'Game': '游戏',
            'Cloud': '云计算'
        };
        return map[cat] || cat;
    };

    const totalPages = Math.ceil(categories.length / VISIBLE_COUNT);

    useEffect(() => {
        if (totalPages <= 1 || isPaused) return;
        const timer = setInterval(() => {
            setPage(prev => (prev + 1) % totalPages);
        }, 6000); // 6秒轮播，比标签更慢
        return () => clearInterval(timer);
    }, [totalPages, isPaused]);

    // 只有一页时直接展示
    if (totalPages <= 1) {
        return (
            <div className="flex gap-2">
                {categories.map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => onClick(cat)}
                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors whitespace-nowrap ${current === cat ? 'bg-apple-blue text-white border-apple-blue' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-apple-blue'}`}
                    >
                        {getLabel(cat)}
                    </button>
                ))}
            </div>
        );
    }

    const currentCats = categories.slice(page * VISIBLE_COUNT, (page + 1) * VISIBLE_COUNT);

    return (
        <div 
            className="flex flex-col"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="flex gap-2 overflow-hidden items-center h-[26px]">
                {currentCats.map((cat, idx) => (
                    <button 
                        key={`${cat}-${page}-${idx}`}
                        onClick={() => onClick(cat)}
                        className={`
                            px-3 py-1 text-xs font-medium rounded-full border transition-colors whitespace-nowrap animate-in slide-in-from-right-4 fade-in duration-500
                            ${current === cat 
                                ? 'bg-apple-blue text-white border-apple-blue' 
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-apple-blue'}
                        `}
                    >
                        {getLabel(cat)}
                    </button>
                ))}
            </div>
            {/* 指示器 */}
            <div className="flex justify-center space-x-1 mt-1.5 h-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                    <button 
                        key={i}
                        onClick={() => setPage(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i === page ? 'bg-apple-blue scale-110' : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400'}`}
                    />
                ))}
            </div>
        </div>
    );
};