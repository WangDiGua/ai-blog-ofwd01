import React, { useState, useEffect, useRef } from 'react';
import { Button, ImageViewer } from '../components/ui';
import { Download, Heart, Maximize2 } from 'lucide-react';
import { useStore } from '../context/store';

// --- 类型定义 ---
interface Photo {
    id: string;
    url: string;
    width: number;
    height: number;
    author: string;
    likes: number;
}

// --- 懒加载图片组件 ---
const LazyImage = ({ src, alt, className, onClick }: { src: string; alt: string; className?: string; onClick?: () => void }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (imgRef.current?.complete) {
            setIsLoaded(true);
        }
    }, []);

    return (
        <div className={`relative overflow-hidden bg-gray-200 dark:bg-gray-800 ${className}`} onClick={onClick}>
            {/* 占位骨架 */}
            <div className={`absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-700 transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`} />
            
            <img 
                ref={imgRef}
                src={src} 
                alt={alt}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            />
        </div>
    );
};

export const Album = () => {
    const { showToast } = useStore();
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

    // 模拟获取图片数据 (使用 Picsum Photos)
    const fetchPhotos = async (pageNum: number) => {
        setLoading(true);
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const newPhotos: Photo[] = Array.from({ length: 12 }).map((_, i) => {
            const id = (pageNum - 1) * 12 + i;
            // 随机长宽比 (模拟瀑布流数据)
            const height = Math.floor(Math.random() * (600 - 300 + 1)) + 300; 
            return {
                id: `photo-${id}`,
                url: `https://picsum.photos/seed/${id + 100}/400/${height}`, // 使用随机高度
                width: 400,
                height: height,
                author: `Artist ${id}`,
                likes: Math.floor(Math.random() * 1000)
            };
        });

        setPhotos(prev => pageNum === 1 ? newPhotos : [...prev, ...newPhotos]);
        setLoading(false);
    };

    useEffect(() => {
        fetchPhotos(page);
    }, [page]);

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 mb-20">
            <div className="text-center mb-10 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-3xl md:text-5xl font-bold text-apple-text dark:text-apple-dark-text tracking-tight">
                    光影画廊
                </h1>
                <p className="text-gray-500 dark:text-gray-400">记录生活中的美好瞬间</p>
            </div>

            {/* 瀑布流布局: 使用 CSS columns 实现 */}
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {photos.map((photo, index) => (
                    <div 
                        key={photo.id} 
                        className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-zoom-in"
                        onClick={() => setPreviewPhoto(photo.url)}
                        style={{ animationDelay: `${(index % 12) * 50}ms` }} // 简单的交错动画
                    >
                        {/* 图片容器 */}
                        <LazyImage 
                            src={photo.url} 
                            alt={`Photo by ${photo.author}`} 
                            className="w-full h-auto"
                        />

                        {/* 悬停浮层 */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <p className="text-white font-medium text-sm">{photo.author}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center space-x-1 text-white/90 text-xs">
                                        <Heart size={14} className="fill-current"/>
                                        <span>{photo.likes}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button 
                                            className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                showToast('开始下载...', 'info');
                                            }}
                                        >
                                            <Download size={16} />
                                        </button>
                                        <button className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors">
                                            <Maximize2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 加载更多 / 底部状态 */}
            <div className="mt-12 text-center">
                {loading ? (
                    <div className="flex items-center justify-center space-x-2 text-gray-500">
                        <span className="w-2 h-2 bg-apple-blue rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-apple-blue rounded-full animate-bounce delay-100" />
                        <span className="w-2 h-2 bg-apple-blue rounded-full animate-bounce delay-200" />
                    </div>
                ) : (
                    <Button variant="secondary" onClick={handleLoadMore} className="px-8 py-3 rounded-full text-base">
                        加载更多
                    </Button>
                )}
            </div>

            {/* 大图查看器 */}
            <ImageViewer src={previewPhoto} onClose={() => setPreviewPhoto(null)} />
        </div>
    );
};