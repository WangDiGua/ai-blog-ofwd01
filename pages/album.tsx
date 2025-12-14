import React, { useState, useEffect, useRef } from 'react';
import { Button, ImageViewer, DEFAULT_IMAGE, Avatar, MarkdownRenderer, ReportModal, Pagination } from '../components/ui';
import { Download, Heart, Maximize2, ArrowLeft, Image as ImageIcon, MessageCircle, Clock, Eye, Flag, ThumbsUp, Lock } from 'lucide-react';
import { useStore } from '../context/store';
import { communityApi } from '../services/api';
import { Album as AlbumType, AlbumPhoto, Comment, CULTIVATION_LEVELS } from '../types';

// --- 图片组件 (懒加载 + 错误处理) ---
const LazyImage = ({ src, alt, className, onClick }: { src: string; alt: string; className?: string; onClick?: () => void }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [imgSrc, setImgSrc] = useState(src);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        setImgSrc(src);
        setHasError(false);
        setIsLoaded(false);
    }, [src]);

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
                src={imgSrc} 
                alt={alt}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                onError={() => {
                    if (!hasError) {
                        setImgSrc(DEFAULT_IMAGE);
                        setHasError(true);
                        setIsLoaded(true);
                    }
                }}
                className={`w-full h-full ${hasError ? 'object-contain p-4' : 'object-cover'} transition-all duration-700 ease-in-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            />
        </div>
    );
};

// --- 相册卡片组件 (堆叠效果) ---
const AlbumCard = ({ album, onClick }: { album: AlbumType, onClick: () => void }) => {
    return (
        <div 
            onClick={onClick}
            className="group cursor-pointer perspective-1000"
        >
            <div className="relative">
                {/* 堆叠背景层 */}
                <div className="absolute top-2 left-2 w-full h-full bg-gray-200 dark:bg-gray-700 rounded-xl shadow-sm -z-10 rotate-2 transition-transform group-hover:rotate-4"></div>
                <div className="absolute top-1 left-1 w-full h-full bg-gray-300 dark:bg-gray-600 rounded-xl shadow-sm -z-10 rotate-1 transition-transform group-hover:rotate-2"></div>
                
                {/* 主卡片 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                    <div className="relative h-48 sm:h-56 overflow-hidden">
                        <LazyImage src={album.cover} alt={album.title} className="w-full h-full" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-md text-xs font-medium flex items-center">
                            <ImageIcon size={12} className="mr-1" /> {album.photos.length}
                        </div>
                    </div>
                    <div className="p-4">
                        <h3 className="font-bold text-lg text-apple-text dark:text-apple-dark-text line-clamp-1 group-hover:text-apple-blue transition-colors">
                            {album.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {album.description}
                        </p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center space-x-2">
                                <Avatar src={album.author.avatar} alt={album.author.name} size="sm" />
                                <span className="text-xs text-gray-600 dark:text-gray-300 font-medium truncate max-w-[80px]">
                                    {album.author.name}
                                </span>
                            </div>
                            <div className="flex items-center text-xs text-gray-400 space-x-3">
                                <span className="flex items-center"><Eye size={12} className="mr-1"/>{album.views}</span>
                                <span className="flex items-center"><Heart size={12} className="mr-1"/>{album.likes}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 评论组件 (复用版) ---
const CommentItem = ({ comment, onReport }: { comment: Comment, onReport: (id: string) => void, key?: any }) => {
    return (
        <div className="flex space-x-3 group">
            <div className="flex-shrink-0">
                <Avatar src={comment.user.avatar} alt={comment.user.name} size="sm" />
            </div>
            <div className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl rounded-tl-none">
                <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-apple-text dark:text-apple-dark-text">{comment.user.name}</span>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">{comment.date}</span>
                        <button onClick={() => onReport(comment.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                            <Flag size={10} />
                        </button>
                    </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    <MarkdownRenderer content={comment.content} />
                </div>
                <div className="flex items-center mt-2 space-x-3">
                    <button className="flex items-center text-xs text-gray-400 hover:text-apple-blue transition-colors">
                        <ThumbsUp size={12} className="mr-1"/> 赞
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Album = () => {
    const { showToast, user, requireAuth } = useStore();
    const [albums, setAlbums] = useState<AlbumType[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination State
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 6;
    
    // View State
    const [selectedAlbum, setSelectedAlbum] = useState<AlbumType | null>(null);
    const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const [reportTarget, setReportTarget] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        communityApi.getAlbums().then(data => {
            setAlbums(data);
            setLoading(false);
        });
    }, []);

    // 滚动回顶部当进入详情页
    useEffect(() => {
        if (selectedAlbum) {
            window.scrollTo(0, 0);
        }
    }, [selectedAlbum]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 权限检查
    const canComment = () => {
        if (!user) return false;
        // 等级索引 >= 1 (筑基期) 才能评论
        const userLevelIndex = CULTIVATION_LEVELS.indexOf(user.level);
        return userLevelIndex >= 1;
    };

    const handleCommentSubmit = () => {
        requireAuth(() => {
            if (!canComment()) {
                showToast('境界不足！需达到【筑基期】方可参与评论', 'error');
                return;
            }
            if (!commentText.trim()) {
                showToast('请输入评论内容', 'error');
                return;
            }
            // 模拟提交
            const newComment: Comment = {
                id: Date.now().toString(),
                user: user!,
                content: commentText,
                date: '刚刚',
                likes: 0
            };
            
            // 更新本地状态
            if (selectedAlbum) {
                const updatedAlbum = {
                    ...selectedAlbum,
                    comments: [newComment, ...(selectedAlbum.comments || [])]
                };
                setSelectedAlbum(updatedAlbum);
                
                // 更新列表中的状态
                setAlbums(prev => prev.map(a => a.id === updatedAlbum.id ? updatedAlbum : a));
            }
            
            setCommentText('');
            showToast('评论发表成功', 'success');
        });
    };

    const handleReport = (id: string) => {
        requireAuth(() => {
            setReportTarget(id);
        });
    };

    if (loading) return <div className="flex justify-center h-[50vh] items-center"><div className="animate-spin w-8 h-8 border-4 border-apple-blue border-t-transparent rounded-full"/></div>;

    // --- 详情视图 ---
    if (selectedAlbum) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 mb-20 animate-in fade-in slide-in-from-right-4 duration-500">
                <ReportModal isOpen={!!reportTarget} onClose={() => setReportTarget(null)} targetId={reportTarget || ''} targetType="comment" />
                <ImageViewer src={previewPhoto} onClose={() => setPreviewPhoto(null)} />

                {/* 顶部导航与信息 */}
                <div className="mb-8">
                    <button 
                        onClick={() => setSelectedAlbum(null)}
                        className="flex items-center text-gray-500 hover:text-apple-text dark:text-gray-400 dark:hover:text-white transition-colors mb-4 group"
                    >
                        <ArrowLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform"/> 返回相册列表
                    </button>
                    
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold text-apple-text dark:text-apple-dark-text mb-3">
                                {selectedAlbum.title}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                                {selectedAlbum.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <Avatar src={selectedAlbum.author.avatar} alt={selectedAlbum.author.name} size="sm" className="mr-2"/>
                                    <span>{selectedAlbum.author.name}</span>
                                </div>
                                <span className="flex items-center"><Clock size={14} className="mr-1"/> {selectedAlbum.date}</span>
                                <span className="flex items-center"><ImageIcon size={14} className="mr-1"/> {selectedAlbum.photos.length} 张照片</span>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <Button variant="secondary" className="flex items-center" onClick={() => showToast('已收藏', 'success')}>
                                <Heart size={18} className="mr-2"/> 收藏
                            </Button>
                            <Button className="flex items-center" onClick={() => showToast('下载请求已提交', 'success')}>
                                <Download size={18} className="mr-2"/> 打包下载
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 图片拼接展示区 (垂直流) */}
                <div className="space-y-2 md:space-y-4 mb-16">
                    {selectedAlbum.photos.map((photo, index) => (
                        <div key={photo.id} className="relative group bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm">
                            <LazyImage 
                                src={photo.url} 
                                alt={photo.title || 'Photo'} 
                                className="w-full h-auto cursor-zoom-in max-h-[80vh] object-contain mx-auto"
                                onClick={() => setPreviewPhoto(photo.url)}
                            />
                            
                            {/* 图片信息浮层 (仅当有标题或描述时显示) */}
                            {(photo.title || photo.caption) && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {photo.title && <h4 className="text-white font-bold text-lg mb-1">{photo.title}</h4>}
                                    {photo.caption && <p className="text-white/90 text-sm">{photo.caption}</p>}
                                </div>
                            )}
                            
                            <button 
                                onClick={() => setPreviewPhoto(photo.url)}
                                className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                            >
                                <Maximize2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* 评论区 */}
                <div className="max-w-3xl mx-auto">
                    <h3 className="text-xl font-bold mb-6 flex items-center text-apple-text dark:text-apple-dark-text">
                        <MessageCircle size={20} className="mr-2"/> 评论 ({selectedAlbum.comments?.length || 0})
                    </h3>
                    
                    {/* 输入框 */}
                    <div className="flex space-x-3 mb-8">
                        <Avatar src={user?.avatar || 'https://ui-avatars.com/api/?name=Guest'} alt="Me" />
                        <div className="flex-1 relative">
                            {/* 评论输入区域容器 */}
                            <div onClick={() => !user && requireAuth(()=>{})}>
                                {/* 如果已登录但等级不足，显示遮罩 */}
                                {user && !canComment() && (
                                    <div className="absolute inset-0 z-10 bg-white/60 dark:bg-black/60 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center text-center cursor-not-allowed border border-gray-200 dark:border-gray-700">
                                        <Lock className="text-gray-500 mb-2" size={20} />
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">境界不足</p>
                                        <p className="text-[10px] text-gray-500 mt-1">需筑基期方可评论</p>
                                    </div>
                                )}

                                <textarea
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-apple-blue outline-none resize-none text-sm transition-all text-apple-text dark:text-apple-dark-text shadow-sm placeholder-gray-400"
                                    rows={3}
                                    placeholder={user ? (canComment() ? "写下你的看法..." : "修炼中...") : "登录后参与讨论..."}
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    // 只有在用户已登录且等级不足时禁用，未登录时不禁用以便触发onClick
                                    disabled={user && !canComment()} 
                                />
                            </div>
                            <div className="flex justify-end mt-2">
                                <Button size="sm" onClick={handleCommentSubmit} disabled={!commentText.trim() || (user && !canComment())}>发表评论</Button>
                            </div>
                        </div>
                    </div>

                    {/* 评论列表 */}
                    <div className="space-y-6">
                        {selectedAlbum.comments && selectedAlbum.comments.length > 0 ? (
                            selectedAlbum.comments.map(comment => (
                                <CommentItem key={comment.id} comment={comment} onReport={handleReport} />
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                还没有评论，快来抢沙发吧！
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Pagination Logic
    const totalPages = Math.ceil(albums.length / ITEMS_PER_PAGE);
    const currentAlbums = albums.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    // --- 列表视图 ---
    return (
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 mb-20">
            <div className="text-center mb-12 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-3xl md:text-5xl font-bold text-apple-text dark:text-apple-dark-text tracking-tight">
                    光影画廊
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                    定格美好瞬间，分享生活故事。
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2 md:px-0">
                {currentAlbums.map((album, index) => (
                    <div 
                        key={album.id} 
                        className="animate-in fade-in slide-in-from-bottom-8 duration-700"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <AlbumCard 
                            album={album} 
                            onClick={() => setSelectedAlbum(album)} 
                        />
                    </div>
                ))}
            </div>
            
            {albums.length === 0 && !loading && (
                <div className="text-center py-20 text-gray-400">暂无相册</div>
            )}

            {/* 分页器 */}
            {albums.length > ITEMS_PER_PAGE && (
                <Pagination 
                    page={page} 
                    totalPages={totalPages} 
                    totalItems={albums.length} 
                    onPageChange={handlePageChange} 
                />
            )}
        </div>
    );
};