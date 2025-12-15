import React, { useEffect, useState, useTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Pagination, Img } from '../components/ui';
import { articleApi } from '../services/api';
import { Article } from '../types';
import { Eye, Clock, Hash, RotateCw, Sparkles, PenTool, MousePointer2, Quote, ChevronDown } from 'lucide-react';
import { calculateReadingTime } from '../utils/lib';
import { CategoryCarousel, TagCarousel } from '../components/ui/Carousels';
import { ArticleSkeleton, FlipAboutCard, Announcements, RecommendedAuthors } from '../components/HomeWidgets';

// --- 签名动画组件 (Font-based SVG Animation) ---
const SignatureAnimation = ({ onClick }: { onClick: () => void }) => {
    return (
        <div 
            onClick={onClick}
            className="relative cursor-pointer group w-full max-w-md mx-auto lg:mx-0 select-none"
        >
            {/* 引入艺术字体 */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
                
                .signature-text {
                    font-family: 'Great Vibes', cursive;
                    font-size: 80px;
                    fill: transparent;
                    stroke-width: 1.5px;
                    stroke-dasharray: 600;
                    stroke-dashoffset: 600;
                    animation: drawText 6s ease-in-out infinite alternate;
                }
                
                @keyframes drawText {
                    0% { stroke-dashoffset: 600; fill: transparent; }
                    60% { stroke-dashoffset: 0; fill: transparent; }
                    80% { fill: currentColor; opacity: 1; }
                    100% { fill: currentColor; opacity: 1; }
                }

                .pen-float {
                    animation: floatPen 6s ease-in-out infinite alternate;
                }

                @keyframes floatPen {
                    0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    60% { transform: translate(240px, 20px) rotate(15deg); opacity: 1; }
                    80% { transform: translate(260px, 30px) rotate(45deg); opacity: 0; }
                    100% { opacity: 0; }
                }
            `}</style>

            {/* 背景装饰光晕 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-apple-blue/10 rounded-full blur-[80px] group-hover:bg-apple-blue/20 transition-colors duration-700" />

            <div className="relative w-full aspect-[3/1] flex items-center justify-center">
                <svg 
                    viewBox="0 0 400 120" 
                    className="w-full h-full overflow-visible drop-shadow-sm"
                >
                    <defs>
                        <linearGradient id="signatureGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" className="text-gray-600 dark:text-gray-400" stopColor="currentColor" />
                            <stop offset="50%" className="text-apple-blue" stopColor="currentColor" />
                            <stop offset="100%" className="text-purple-500" stopColor="currentColor" />
                        </linearGradient>
                    </defs>

                    {/* 使用文本作为路径，保证可读性和艺术感 */}
                    <text 
                        x="50%" 
                        y="65%" 
                        textAnchor="middle" 
                        stroke="url(#signatureGradient)" 
                        className="signature-text text-apple-text dark:text-white"
                    >
                        WangdiGua
                    </text>
                </svg>

                {/* 装饰性笔图标 (跟随动画大概轨迹) */}
                <div className="absolute left-[10%] top-[20%] text-apple-blue pen-float pointer-events-none">
                    <PenTool size={24} className="fill-apple-blue/20" />
                </div>
            </div>

            <div className="flex items-center justify-center lg:justify-start space-x-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0 pl-4">
                <span className="text-xs font-medium text-gray-400 tracking-widest uppercase">Click to Explore</span>
                <MousePointer2 size={12} className="text-apple-blue animate-bounce" />
            </div>
        </div>
    );
};

// --- 重新排版的 Hero 组件 (自动视差 + 丰富文本 + 鼠标指示器) ---
const InteractiveHero = () => {
    const [showScrollIndicator, setShowScrollIndicator] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            // 当滚动超过 50px 时隐藏指示器
            if (window.scrollY > 50) {
                setShowScrollIndicator(false);
            } else {
                setShowScrollIndicator(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToContent = () => {
        document.getElementById('content-start')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        // 调整 padding：大幅减小顶部间距 (pt-2/md:pt-4/lg:pt-8) 让内容更贴近导航栏
        <div className="relative w-full pt-2 pb-16 md:pt-4 md:pb-28 lg:pt-8 lg:pb-32 overflow-hidden">
            
            {/* CSS 自动视差动画定义 */}
            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes float-medium {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes float-fast {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-5px); }
                }
                @keyframes float-horizontal {
                    0%, 100% { transform: translateX(0px); }
                    50% { transform: translateX(10px); }
                }
                @keyframes scroll-wheel {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(10px); opacity: 0; }
                }
                .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
                .animate-float-medium { animation: float-medium 8s ease-in-out infinite; }
                .animate-float-fast { animation: float-fast 6s ease-in-out infinite; }
                .animate-float-horizontal { animation: float-horizontal 20s ease-in-out infinite; }
                .animate-scroll-wheel { animation: scroll-wheel 1.5s ease-out infinite; }
            `}</style>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
                
                {/* 左侧：文字内容 (自动视差) */}
                <div className="flex flex-col items-start text-left space-y-5 md:space-y-8 z-10 px-2 lg:px-0">
                    
                    {/* Layer 0: 背景装饰大字 (最慢，营造深度，反向浮动) */}
                    <div className="absolute -top-20 -left-20 text-[8rem] md:text-[10rem] font-bold text-gray-100 dark:text-gray-800/30 opacity-50 select-none pointer-events-none whitespace-nowrap hidden md:block animate-float-horizontal">
                        THINK
                    </div>

                    {/* Layer 1: 英文顶栏 (中速浮动) */}
                    <div className="flex items-center space-x-3 animate-float-medium">
                        <div className="h-px w-8 bg-apple-blue"></div>
                        <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-gray-400 uppercase">
                            Redefining Reality // Since 2025
                        </span>
                    </div>

                    {/* Layer 2: 主标题 (较快浮动，强调主体) - 移动端缩小字号，增加行间距 */}
                    <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-apple-text dark:text-white leading-tight relative animate-float-fast">
                        <span className="block mb-3 md:mb-6">非同</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-br from-apple-blue via-purple-500 to-pink-500 pb-2">
                            凡想.
                        </span>
                        {/* 装饰性圆点 */}
                        <div className="absolute -right-2 top-0 w-2 h-2 md:-right-4 md:w-3 md:h-3 bg-red-500 rounded-full animate-pulse hidden md:block"></div>
                    </h1>

                    {/* Layer 3: 描述文本 (慢速浮动，与标题错开) - 移动端调整间距和字号 */}
                    <div className="max-w-xl space-y-5 md:space-y-6 animate-float-slow" style={{ animationDelay: '1s' }}>
                        <div className="flex items-start space-x-3 md:space-x-4">
                            <Quote size={20} className="text-gray-300 dark:text-gray-600 flex-shrink-0 mt-1 rotate-180 md:w-6 md:h-6" />
                            <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                                探索 <span className="font-semibold text-apple-text dark:text-white border-b-2 border-apple-blue/30">极简主义</span> 与前沿技术的交汇点。
                                在这里，代码不仅是逻辑的堆砌，更是思维的艺术。我们剥离繁复的表象，
                                只为触达数字世界的本质。
                            </p>
                        </div>

                        {/* 装饰性代码块 - 移动端更紧凑 */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 md:p-4 border-l-4 border-apple-blue font-mono text-[10px] md:text-xs text-gray-500 dark:text-gray-400 w-full md:w-auto inline-block shadow-sm">
                            <div className="flex justify-between items-center mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">
                                <span>philosophy.ts</span>
                                <div className="flex space-x-1">
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                </div>
                            </div>
                            <p><span className="text-purple-500">const</span> <span className="text-blue-500">art</span> = (<span className="text-orange-500">code</span>) ={'>'} code.<span className="text-green-500">transcend</span>();</p>
                            <p className="mt-1 text-gray-400">// Less is exponentially more.</p>
                        </div>
                    </div>
                </div>

                {/* 右侧：签名动画区域 - 移动端增加上边距 */}
                <div className="relative flex justify-center lg:justify-end animate-in slide-in-from-right-8 duration-700 delay-200 mt-4 lg:mt-0">
                    {/* 装饰背景块 (Glassmorphism) */}
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-[2rem] -rotate-3 scale-90 -z-10 blur-2xl transition-all duration-500 group-hover:blur-3xl animate-float-medium"></div>
                    
                    <div className="w-full max-w-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/50 dark:border-gray-700/50 rounded-3xl p-6 md:p-8 shadow-2xl transition-transform hover:scale-[1.02] duration-500 relative overflow-hidden">
                        {/* 内部高光 */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
                        
                        <div className="flex justify-between items-center mb-6 md:mb-8 border-b border-gray-200/30 dark:border-gray-700/30 pb-4">
                            <div className="flex space-x-2">
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-400"></div>
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-400"></div>
                            </div>
                            <span className="text-xs font-mono text-gray-400">signature.svg</span>
                        </div>
                        
                        <SignatureAnimation onClick={scrollToContent} />
                        
                        <div className="mt-6 flex justify-between items-center text-xs font-mono text-gray-400">
                            <span>Ln 1, Col 1</span>
                            <span>UTF-8</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 鼠标滚动指示器 - 动态显示/隐藏 */}
            <div 
                className={`
                    absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer 
                    transition-all duration-500 ease-in-out
                    ${showScrollIndicator ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
                `}
                onClick={scrollToContent}
            >
                <span className="text-[10px] text-gray-400 mb-2 tracking-widest uppercase animate-pulse hover:text-apple-blue transition-colors">Scroll</span>
                <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center p-1 group hover:border-apple-blue transition-colors">
                    <div className="w-1 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-scroll-wheel group-hover:bg-apple-blue transition-colors"></div>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mb-20 relative">
      {/* 极简版 Hero 区域 */}
      <InteractiveHero />

      {/* Main Content Start - Reduced scroll-mt to hide mouse indicator under navbar */}
      <div id="content-start" className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 scroll-mt-20">
        {/* 主要内容 */}
        <div className={`lg:col-span-8 space-y-6 md:space-y-8 transition-opacity duration-300 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0 border-b border-gray-100 dark:border-gray-800 pb-4">
            <h2 className="text-xl md:text-2xl font-bold text-apple-text dark:text-apple-dark-text">
                {currentTag ? `标签: ${currentTag}` : '最新文章'}
            </h2>
            <div className="flex items-start gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
               <button 
                  onClick={() => handleCategoryClick('All')}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors whitespace-nowrap h-[26px] ${currentCategory === 'All' ? 'bg-apple-blue text-white border-apple-blue' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-apple-blue'}`}
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
                    <div className="text-center py-10 text-gray-500">未找到文章。</div>
                ) : (
                    articles.map((article) => (
                    <Card key={article.id} hover className="flex flex-col md:flex-row group cursor-pointer h-auto md:h-64" onClick={() => navigate(`/article/${article.id}`)}>
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
                                <span className="text-gray-300">•</span>
                                <span className="text-gray-500">{article.date}</span>
                                {article.updatedAt && (
                                    <>
                                        <span className="text-gray-300 hidden sm:inline">•</span>
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

        {/* 侧边栏 */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
           <FlipAboutCard />

           <div className="sticky top-24 space-y-6 md:space-y-8">
             <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">热门话题</h3>
                <div className="space-y-2" key={trendingTags.join(',')}>
                    {trendingTags.map((tag, i) => (
                    <button 
                        key={tag} 
                        onClick={() => handleTagClick(tag)}
                        className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors animate-slide-up-fade text-left"
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tag}</span>
                        <Hash size={14} className="text-gray-400"/>
                    </button>
                    ))}
                </div>
             </div>

             <Announcements />
             <RecommendedAuthors />
           </div>
        </div>
      </div>
    </div>
  );
};