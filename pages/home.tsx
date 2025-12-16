import React, { useEffect, useState, useTransition, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Pagination, Img } from '../components/ui';
import { articleApi } from '../services/api';
import { Article } from '../types';
import { Eye, Clock, Hash, RotateCw, PenTool, Quote, Inbox } from 'lucide-react';
import { calculateReadingTime } from '../utils/lib';
import { CategoryCarousel, TagCarousel } from '../components/ui/Carousels';
import { ArticleSkeleton, FlipAboutCard, Announcements, RecommendedAuthors } from '../components/HomeWidgets';

// --- 全局视差背景组件 (Portal 渲染) ---
const HeroParallaxBackground = () => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setOffset(window.scrollY);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // 使用 Portal 渲染到 body
    // z-[0] 确保背景位于 body 基础背景色之上，但被 App 内容(z-10)覆盖
    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[0] overflow-hidden pointer-events-none select-none h-screen w-screen">
            {/* 1. 基础渐变底色 (极简纯净) */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/10 to-white/0 dark:from-black dark:via-gray-900/10 transition-colors duration-500" />

            {/* 2. 巨大的背景字 - 层级感核心 */}
            {/* 
                - opacity: 提升至 0.07 确保可见但不过分抢眼
                - blur-[2px]: 模拟景深，将其推向"远处"
                - parallax: 慢速滚动 (offset * 0.1)
            */}
            <div 
                className="absolute top-1/2 left-1/2 font-black text-gray-900/[0.07] dark:text-white/[0.07] whitespace-nowrap will-change-transform blur-[2px]"
                style={{
                    fontSize: '20vw',
                    transform: `translate(-50%, calc(-50% - ${offset * 0.1}px)) scale(${1 + offset * 0.0002})`,
                    opacity: Math.max(0, 1 - offset / 500)
                }}
            >
                CREATIVE
            </div>

            {/* 3. 动态光斑 - 极致淡雅 (15% 透明度 + 极浅色系 + 模糊) */}
            <div 
                className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-purple-100/30 dark:bg-purple-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen will-change-transform transition-transform duration-75"
                style={{ transform: `translate3d(0, ${offset * 0.05}px, 0)` }}
            />
            <div 
                className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-50/40 dark:bg-blue-900/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen will-change-transform transition-transform duration-75"
                style={{ transform: `translate3d(0, ${offset * -0.02}px, 0)` }}
            />
            
            {/* 4. 噪点纹理 - 极低透明度增加纸质感 */}
            <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay"></div>
        </div>,
        document.body
    );
};

// --- Hero 内容组件 (前景) ---
const InteractiveHero = () => {
    const [typedText, setTypedText] = useState('');
    const fullText = "在这里，代码不仅是逻辑的堆砌，更是思维的艺术。探索极简主义与前沿技术的数字交汇点。";
    const typingIndex = useRef(0);

    useEffect(() => {
        const typeLoop = () => {
            if (typingIndex.current < fullText.length) {
                setTypedText((prev) => prev + fullText.charAt(typingIndex.current));
                typingIndex.current++;
                setTimeout(typeLoop, 50);
            }
        };
        const timeout = setTimeout(typeLoop, 500);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="relative w-full min-h-[60vh] md:min-h-[70vh] flex flex-col items-center justify-center py-20 overflow-hidden select-none z-10">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
                .font-handwriting { font-family: 'Great Vibes', cursive; }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                .cursor-blink { animation: blink 1s step-end infinite; }
            `}</style>

            {/* 内容展示层 - 添加 drop-shadow 以与背景分离 */}
            <div className="flex flex-col items-center text-center max-w-4xl px-6 animate-in slide-in-from-bottom-8 duration-1000">
                
                {/* 顶部装饰标签 */}
                <div className="mb-8 flex items-center space-x-2 px-4 py-1.5 bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-full border border-white/20 dark:border-white/10 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">Online Status</span>
                </div>

                {/* 主标题 - 增强投影，提升层级感 */}
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-apple-text dark:text-white leading-[1.1] mb-8 drop-shadow-xl relative z-10">
                    Think <br className="md:hidden" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-apple-blue via-purple-500 to-pink-500">
                        Different.
                    </span>
                </h1>

                {/* 描述文案 - 打字机 */}
                <div className="h-24 md:h-20 flex items-start justify-center relative z-10">
                    <p className="text-lg md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed font-light tracking-wide drop-shadow-sm">
                        {typedText}
                        <span className="cursor-blink inline-block w-0.5 h-5 md:h-7 bg-apple-blue ml-1 align-middle"></span>
                    </p>
                </div>
                
                {/* 署名 - 手写体 */}
                <div className="mt-12 opacity-80 hover:opacity-100 transition-opacity duration-500 flex flex-col items-center gap-4 group cursor-default">
                     <div className="w-px h-12 bg-gradient-to-b from-gray-400 dark:from-gray-600 to-transparent group-hover:h-16 transition-all duration-500"></div>
                     <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                        <PenTool size={14} />
                        <span className="text-xs font-bold uppercase tracking-widest">Designed by</span>
                        <span className="text-2xl md:text-3xl text-apple-text dark:text-white font-handwriting transform -rotate-6 group-hover:rotate-0 transition-transform duration-500 text-apple-blue drop-shadow-md">
                            WangdiGua
                        </span>
                     </div>
                </div>
            </div>
        </div>
    );
};

export const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  
  const [isPending, startTransition] = useTransition();
  
  const searchParams = new URLSearchParams(location.search);
  const LIMIT = 5;

  const currentCategory = searchParams.get('category') || 'All';
  const currentTag = searchParams.get('tag');

  useEffect(() => {
      articleApi.getTags().then(tags => {
          setAllTags(tags);
          setTrendingTags(tags.slice(0, 5));
      });
      articleApi.getCategories().then(cats => {
          setAllCategories(cats.map(c => c.id));
      });
  }, []);

  useEffect(() => {
    if (allTags.length === 0) return;
    const interval = setInterval(() => {
        const shuffled = [...allTags].sort(() => 0.5 - Math.random());
        setTrendingTags(shuffled.slice(0, 5));
    }, 5000);
    return () => clearInterval(interval);
  }, [allTags]);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const data = await articleApi.getList({ 
            page, 
            limit: LIMIT,
            category: currentCategory,
            tag: currentTag || undefined
        });
        setArticles(data.items);
        setTotalPages(data.totalPages);
        setTotalItems(data.total);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [page, currentCategory, currentTag]);

  const scrollToArticleList = () => {
      document.getElementById('content-start')?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateParams = (key: string, value: string | null) => {
      const newParams = new URLSearchParams(location.search);
      if (value) {
          newParams.set(key, value);
      } else {
          newParams.delete(key);
      }
      navigate({ search: newParams.toString() });
  };

  const handleCategoryClick = (cat: string) => {
      startTransition(() => {
          updateParams('category', cat);
          setPage(1);
          scrollToArticleList();
      });
  };

  const handleTagClick = (tag: string) => {
      startTransition(() => {
          updateParams('tag', tag);
          setPage(1);
          scrollToArticleList();
      });
  };

  const clearFilters = () => {
      startTransition(() => {
          navigate({ search: '' });
          setPage(1);
          scrollToArticleList();
      });
  };

  return (
    <div className="relative">
      {/* 全局视差背景 (Portal + z-index:0) */}
      <HeroParallaxBackground />

      {/* 主容器 - 确保内容在背景之上 (z-10) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 relative z-10">
        
        {/* Hero 前景内容 */}
        <InteractiveHero />

        {/* 文章列表区域 */}
        <div id="content-start" className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 scroll-mt-24">
            
            {/* 左侧文章栏 */}
            <div className={`lg:col-span-8 space-y-6 md:space-y-8 transition-opacity duration-300 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0 border-b border-gray-200/50 dark:border-gray-700/50 pb-4 backdrop-blur-sm rounded-xl p-2">
                    <h2 className="text-xl md:text-2xl font-bold text-apple-text dark:text-apple-dark-text pl-2">
                        {currentTag ? `标签: ${currentTag}` : '最新文章'}
                    </h2>
                    <div className="flex items-start gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 w-full sm:w-auto">
                    <button 
                        onClick={() => handleCategoryClick('All')}
                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors whitespace-nowrap h-[26px] ${currentCategory === 'All' ? 'bg-apple-blue text-white border-apple-blue' : 'bg-white/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-apple-blue backdrop-blur-md'}`}
                    >
                        全部
                    </button>
                    
                    <CategoryCarousel 
                        categories={allCategories} 
                        current={currentCategory} 
                        onClick={handleCategoryClick} 
                    />

                    {(currentTag || currentCategory !== 'All') && (
                        <button onClick={clearFilters} className="px-3 py-1 text-xs font-medium text-red-500 hover:underline whitespace-nowrap h-[26px]">清除</button>
                    )}
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3, 4, 5].map(i => <ArticleSkeleton key={i} />)}
                    </div>
                ) : (
                    <>
                        {articles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-gray-500 bg-white/40 dark:bg-gray-800/40 rounded-3xl backdrop-blur-md border border-dashed border-gray-200 dark:border-gray-700">
                                <Inbox size={48} className="mb-4 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
                                <p className="text-lg font-medium text-gray-600 dark:text-gray-400">暂无相关文章</p>
                                <p className="text-sm mt-2 text-gray-400">当前分类或标签下没有内容</p>
                                <button onClick={clearFilters} className="mt-6 px-6 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                    查看全部
                                </button>
                            </div>
                        ) : (
                            articles.map((article) => (
                            <Card key={article.id} hover className="flex flex-col md:flex-row group cursor-pointer h-auto md:h-64 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/40 dark:border-gray-700/40 shadow-sm hover:shadow-lg transition-all" onClick={() => navigate(`/article/${article.id}`)}>
                                <div className="w-full md:w-2/5 h-48 md:h-full overflow-hidden">
                                <Img 
                                    src={article.cover} 
                                    alt={article.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                </div>
                                <div className="p-4 md:p-6 md:w-3/5 flex flex-col justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                                        <span 
                                            onClick={(e) => { e.stopPropagation(); handleCategoryClick(article.category); }}
                                            className="font-semibold text-apple-blue uppercase tracking-wider hover:underline cursor-pointer"
                                        >
                                            {article.category}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-gray-500">{article.date}</span>
                                        {article.updatedAt && (
                                            <>
                                                <span className="text-gray-400 hidden sm:inline">•</span>
                                                <span className="text-gray-400 flex items-center hidden sm:flex" title={`更新于 ${article.updatedAt}`}>
                                                    <RotateCw size={10} className="mr-1" />
                                                    {article.updatedAt}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <h3 className="text-lg md:text-2xl font-bold text-apple-text dark:text-apple-dark-text mb-2 leading-tight group-hover:text-apple-blue transition-colors">
                                    {article.title}
                                    </h3>
                                    <p className="text-apple-subtext dark:text-apple-dark-subtext line-clamp-2 text-sm leading-relaxed overflow-hidden">
                                    {article.summary}
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center text-xs text-gray-400 space-x-4">
                                        <span className="flex items-center"><Eye size={14} className="mr-1"/> {article.views}</span>
                                        <span className="flex items-center"><Clock size={14} className="mr-1"/> {calculateReadingTime(article.content)}</span>
                                    </div>
                                    <TagCarousel tags={article.tags} />
                                </div>
                                </div>
                            </Card>
                            ))
                        )}
                        
                        {articles.length > 0 && (
                            <Pagination 
                                page={page} 
                                totalPages={totalPages} 
                                totalItems={totalItems} 
                                onPageChange={(p) => {
                                    setPage(p);
                                    scrollToArticleList();
                                }} 
                            />
                        )}
                    </>
                )}
            </div>

            {/* 右侧侧边栏 */}
            <div className="lg:col-span-4 space-y-6 md:space-y-8 flex flex-col order-last">
                {/* Flip Card */}
                <div className="w-full">
                        <FlipAboutCard />
                </div>

                <div className="space-y-6 md:space-y-8 lg:sticky lg:top-24">
                    {/* Trending Tags - More transparent */}
                    <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-4 rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">热门话题</h3>
                        {trendingTags.length > 0 ? (
                            <div className="space-y-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-x-4 lg:gap-0 lg:space-y-2" key={trendingTags.join(',')}>
                                {trendingTags.map((tag, i) => (
                                <button 
                                    key={tag} 
                                    onClick={() => handleTagClick(tag)}
                                    className="w-full flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-100/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-700 transition-colors animate-slide-up-fade text-left shadow-sm"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tag}</span>
                                    <Hash size={14} className="text-gray-400"/>
                                </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-xs text-gray-400">暂无热门话题</div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                        <Announcements />
                        <RecommendedAuthors />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};