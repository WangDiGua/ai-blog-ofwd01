import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Pagination, Avatar, Button, Skeleton, AnnouncementModal } from '../components/ui';
import { articleApi, systemApi, userApi } from '../services/api';
import { Article, Announcement, User } from '../types';
import { Eye, Clock, Hash, Bell, Github, FileCode, Video, MessageCircle, UserPlus, RefreshCw, MapPin, Navigation } from 'lucide-react';
import { useStore } from '../context/store';
import { calculateReadingTime } from '../utils/lib';

const ArticleSkeleton = () => (
  <Card className="flex flex-col md:flex-row h-auto md:h-64 p-0 overflow-hidden">
    <div className="w-full md:w-2/5 h-48 md:h-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
    <div className="p-4 md:p-6 md:w-3/5 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-6 md:h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex space-x-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </Card>
);

// --- 公告组件 ---
const Announcements = () => {
    const [news, setNews] = useState<Announcement[]>([]);
    const [selected, setSelected] = useState<Announcement | null>(null);
    
    useEffect(() => {
        systemApi.getAnnouncements().then(setNews);
    }, []);

    if (news.length === 0) return null;

    return (
        <Card className="p-4 md:p-6">
             <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                 <Bell size={14} className="mr-2"/> 公告
             </h3>
             <div className="space-y-3">
                 {news.map(n => (
                     <div 
                         key={n.id} 
                         onClick={() => setSelected(n)}
                         className="text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                     >
                         {n.summary}
                     </div>
                 ))}
             </div>
             <AnnouncementModal isOpen={!!selected} onClose={() => setSelected(null)} data={selected} />
        </Card>
    );
};

// --- 动态天气场景组件 (高性能 CSS 动画) ---
const WeatherScene = ({ code, isDay = true }: { code: number, isDay?: boolean }) => {
    // 映射天气代码到类型
    const getWeatherType = (c: number) => {
        if (c <= 1) return 'sunny';
        if (c <= 3) return 'cloudy';
        if (c <= 48) return 'fog';
        if (c <= 67 || (c >= 80 && c <= 82)) return 'rainy';
        if (c <= 77 || c === 85 || c === 86) return 'snowy';
        if (c >= 95) return 'storm';
        return 'sunny';
    };

    const type = getWeatherType(code);

    return (
        <div className={`relative w-full h-32 rounded-2xl overflow-hidden mb-4 transition-colors duration-1000 ${
            type === 'storm' || !isDay ? 'bg-gradient-to-b from-gray-900 to-indigo-900' :
            type === 'rainy' ? 'bg-gradient-to-b from-gray-400 to-blue-400' :
            type === 'cloudy' ? 'bg-gradient-to-b from-blue-300 to-blue-100' :
            'bg-gradient-to-b from-blue-400 to-blue-200' // Sunny
        }`}>
            {/* 动画样式定义 */}
            <style>{`
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
                @keyframes rain-drop { 0% { transform: translateY(-20px); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(120px); opacity: 0; } }
                @keyframes flash { 0%, 90%, 100% { opacity: 0; } 92%, 98% { opacity: 0.5; } }
                @keyframes snow-fall { 0% { transform: translateY(-10px) translateX(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(120px) translateX(20px); opacity: 0; } }
            `}</style>

            {/* 太阳 / 月亮 */}
            {(type === 'sunny' || type === 'cloudy') && (
                <div 
                    className="absolute top-4 right-6 w-16 h-16 rounded-full"
                    style={{ 
                        background: isDay ? '#FDB813' : '#F4F6F0',
                        boxShadow: isDay ? '0 0 40px #FDB813' : '0 0 20px #FFFFFF',
                        animation: 'float 6s ease-in-out infinite'
                    }}
                >
                    {isDay && <div className="absolute inset-0 border-4 border-yellow-200/30 rounded-full animate-[spin-slow_20s_linear_infinite]" style={{ borderStyle: 'dashed' }} />}
                </div>
            )}

            {/* 云层 */}
            {(type === 'cloudy' || type === 'rainy' || type === 'storm' || type === 'fog' || type === 'snowy') && (
                <>
                    <div className="absolute top-8 left-4 w-20 h-8 bg-white/80 rounded-full blur-md animate-[float_8s_ease-in-out_infinite]" />
                    <div className="absolute top-12 left-16 w-24 h-10 bg-white/60 rounded-full blur-lg animate-[float_10s_ease-in-out_infinite_reverse]" />
                    {/* 深色云 (雨天/风暴) */}
                    {(type === 'rainy' || type === 'storm') && (
                        <div className="absolute top-6 right-10 w-28 h-12 bg-gray-600/50 rounded-full blur-md animate-[float_7s_ease-in-out_infinite]" />
                    )}
                </>
            )}

            {/* 雨滴 (生成多个 CSS 粒子) */}
            {(type === 'rainy' || type === 'storm') && Array.from({length: 15}).map((_, i) => (
                <div 
                    key={i}
                    className="absolute bg-blue-200 w-0.5 h-4 rounded-full opacity-0"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * -20}px`,
                        animation: `rain-drop ${0.8 + Math.random() * 0.5}s linear infinite`,
                        animationDelay: `${Math.random() * 2}s`
                    }}
                />
            ))}

            {/* 雪花 */}
            {type === 'snowy' && Array.from({length: 15}).map((_, i) => (
                <div 
                    key={i}
                    className="absolute bg-white w-1.5 h-1.5 rounded-full opacity-0 blur-[1px]"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * -20}px`,
                        animation: `snow-fall ${3 + Math.random() * 2}s linear infinite`,
                        animationDelay: `${Math.random() * 5}s`
                    }}
                />
            ))}

            {/* 雷暴闪电 */}
            {type === 'storm' && (
                <div className="absolute inset-0 bg-white pointer-events-none animate-[flash_5s_infinite]" />
            )}
        </div>
    );
};

// --- 3D 翻转关于我卡片组件 ---
const FlipAboutCard = () => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [weatherData, setWeatherData] = useState<{temp: number, code: number, desc: string} | null>(null);
    const [locationInfo, setLocationInfo] = useState<{ip: string, city: string, region: string} | null>(null);
    const [greeting, setGreeting] = useState('');
    const [loading, setLoading] = useState(true);

    // 天气代码描述映射
    const getWeatherDesc = (code: number) => {
        if (code === 0) return '晴朗';
        if (code <= 3) return '多云';
        if (code <= 48) return '雾';
        if (code <= 67) return '小雨';
        if (code <= 77) return '雪';
        if (code <= 82) return '大雨';
        if (code <= 86) return '大雪';
        if (code <= 99) return '雷暴';
        return '未知';
    };

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 6) setGreeting('夜深了');
        else if (hour < 12) setGreeting('早上好');
        else if (hour < 18) setGreeting('下午好');
        else setGreeting('晚上好');

        const fetchData = async () => {
            try {
                // 1. 获取详细位置 (使用 ipapi.co，支持 HTTPS)
                const locRes = await fetch('https://ipapi.co/json/');
                if (!locRes.ok) throw new Error('Location fetch failed');
                const locData = await locRes.json();
                
                setLocationInfo({
                    ip: locData.ip,
                    city: locData.city,
                    region: locData.region
                });

                // 2. 根据获取到的经纬度获取天气 (Open-Meteo)
                if (locData.latitude && locData.longitude) {
                    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${locData.latitude}&longitude=${locData.longitude}&current_weather=true`);
                    const wData = await weatherRes.json();
                    
                    setWeatherData({
                        temp: wData.current_weather.temperature,
                        code: wData.current_weather.weathercode,
                        desc: getWeatherDesc(wData.current_weather.weathercode)
                    });
                }
            } catch (e) {
                console.error("Fetch info failed", e);
                // Fallback for demo
                setLocationInfo({ ip: '未知 IP', city: 'Unknown', region: 'Unknown' });
                setWeatherData({ temp: 20, code: 1, desc: '多云' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const isDayTime = () => {
        const hour = new Date().getHours();
        return hour > 6 && hour < 18;
    };

    return (
        <div className="relative w-full h-[320px] perspective-1000">
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
            
            <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* 正面：关于我 */}
                <Card className="absolute inset-0 backface-hidden p-6 flex flex-col items-center justify-center text-center z-10">
                    <button 
                        onClick={() => setIsFlipped(true)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-apple-blue hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors group"
                        title="查看访客信息"
                    >
                        <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                    </button>

                    <h3 className="text-lg font-bold mb-4 text-apple-text dark:text-apple-dark-text w-full text-left">关于我</h3>
                    <div className="flex items-center space-x-4 mb-4 w-full">
                        <Avatar src="https://picsum.photos/id/1005/100/100" alt="Admin" size="lg" />
                        <div className="text-left">
                            <div className="font-semibold text-apple-text dark:text-apple-dark-text">John Developer</div>
                            <div className="text-xs text-apple-subtext dark:text-apple-dark-subtext">前端工程师</div>
                        </div>
                    </div>
                    <p className="text-sm text-apple-subtext dark:text-apple-dark-subtext mb-4 text-left w-full">
                        热衷于创建整洁、易用和高性能的用户界面。
                    </p>
                    
                    <div className="grid grid-cols-4 gap-2 mb-4 w-full">
                        <a href="#" className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Github">
                            <Github size={20} className="text-gray-600 dark:text-gray-300"/>
                        </a>
                        <a href="#" className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Gitee">
                            <FileCode size={20} className="text-red-500"/>
                        </a>
                        <a href="#" className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="抖音">
                            <Video size={20} className="text-black dark:text-white"/>
                        </a>
                        <a href="#" className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="QQ">
                            <MessageCircle size={20} className="text-blue-500"/>
                        </a>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full">完整资料</Button>
                </Card>

                {/* 背面：访客信息 & 动态天气 */}
                <Card className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center overflow-hidden bg-white dark:bg-gray-900">
                    <button 
                        onClick={() => setIsFlipped(false)}
                        className="absolute top-4 right-4 z-20 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 backdrop-blur-md rounded-full transition-colors"
                        title="返回"
                    >
                        <RefreshCw size={18} />
                    </button>

                    {loading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <RefreshCw className="animate-spin text-gray-300" />
                        </div>
                    ) : (
                        <div className="w-full h-full relative">
                            {/* 顶部动态天气背景 */}
                            <WeatherScene code={weatherData?.code || 0} isDay={isDayTime()} />
                            
                            {/* 下半部分信息内容 */}
                            <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-t-3xl p-5 flex flex-col justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-colors duration-300">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-lg font-bold text-apple-text dark:text-apple-dark-text">{greeting}！</h3>
                                        <span className="text-2xl font-bold text-apple-blue">{weatherData?.temp}°</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-3">
                                        欢迎来自 <span className="text-apple-blue font-bold">{locationInfo?.region} {locationInfo?.city}</span> 的朋友
                                    </p>
                                    
                                    <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                                        <MapPin size={14} className="text-apple-blue"/>
                                        <span className="flex-1 truncate">
                                            {weatherData?.desc} · {locationInfo?.city || '未知城市'}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">您的 IP 地址</span>
                                        <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">{locationInfo?.ip}</span>
                                    </div>
                                    <Navigation size={16} className="text-gray-300 rotate-45" />
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

// --- 推荐作者组件 ---
const RecommendedAuthors = () => {
    const navigate = useNavigate();
    const { requireAuth, showToast } = useStore();
    const [authors, setAuthors] = useState<(User & { articles: number })[]>([
        { id: 'u-1', name: 'Alice Walker', avatar: 'https://ui-avatars.com/api/?name=Alice+Walker&background=FF5733&color=fff', articles: 42, role: 'user', aiUsage: 0, isFollowing: false, level: '元婴期' },
        { id: 'u-2', name: 'David Chen', avatar: 'https://ui-avatars.com/api/?name=David+Chen&background=33FF57&color=fff', articles: 18, role: 'user', aiUsage: 0, isFollowing: false, level: '筑基期' },
        { id: 'u-3', name: 'Elena G', avatar: 'https://ui-avatars.com/api/?name=Elena+G&background=3357FF&color=fff', articles: 35, role: 'vip', aiUsage: 0, isFollowing: false, level: '化神期' }
    ]);

    const handleFollow = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        requireAuth(async () => {
            const newAuthors = [...authors];
            const author = newAuthors[index];
            author.isFollowing = !author.isFollowing;
            setAuthors(newAuthors);
            
            // Call mock API
            await userApi.follow({ userId: author.id, isFollowing: author.isFollowing });
            showToast(author.isFollowing ? `已关注 ${author.name}` : `已取消关注 ${author.name}`, 'success');
        });
    };

    return (
        <Card className="p-4 md:p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                <UserPlus size={14} className="mr-2"/> 推荐作者
            </h3>
            <div className="space-y-4">
                {authors.map((author, idx) => (
                    <div 
                        key={author.id} 
                        className="flex items-center justify-between group cursor-pointer"
                        onClick={() => navigate(`/user/${author.id}`)}
                    >
                        <div className="flex items-center space-x-3">
                            <Avatar src={author.avatar} alt={author.name} size="sm" />
                            <div>
                                <div className="text-sm font-semibold text-apple-text dark:text-apple-dark-text group-hover:text-apple-blue transition-colors">{author.name}</div>
                                <div className="text-xs text-gray-500">{author.articles} 篇文章</div>
                            </div>
                        </div>
                        <Button 
                            size="sm" 
                            variant={author.isFollowing ? "secondary" : "primary"} 
                            className={`text-xs px-2 py-1 ${author.isFollowing ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                            onClick={(e) => handleFollow(e, idx)}
                        >
                            {author.isFollowing ? '已关注' : '关注'}
                        </Button>
                    </div>
                ))}
            </div>
        </Card>
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
  const [trendingTags, setTrendingTags] = useState(['#React19', '#TailwindCSS', '#UXDesign']);
  
  const searchParams = new URLSearchParams(location.search);
  
  const LIMIT = 5;
  const ALL_TAGS = ['#React19', '#TailwindCSS', '#UXDesign', '#AppleEvent', '#CodingLife', '#WebAssembly', '#NextJS', '#Figma', '#Minimalism', '#Darkmode', '#AI', '#ThreeJS', '#Rust', '#Cyberpunk'];

  // 当前过滤器
  const currentCategory = searchParams.get('category') || 'All';
  const currentTag = searchParams.get('tag');

  // 轮播标签动画
  useEffect(() => {
    const interval = setInterval(() => {
        // 简单洗牌
        const shuffled = [...ALL_TAGS].sort(() => 0.5 - Math.random());
        setTrendingTags(shuffled.slice(0, 5));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
        setTotalItems(data.total); // 设置总条数
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [page, currentCategory, currentTag]);

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
      updateParams('category', cat);
      setPage(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTagClick = (tag: string) => {
      updateParams('tag', tag);
      setPage(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
      navigate({ search: '' });
      setPage(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 mb-20 relative">
      {/* 英雄 / 介绍区域 */}
      <div className="text-center mb-10 md:mb-16 space-y-3 md:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl md:text-6xl font-bold tracking-tight text-apple-text dark:text-apple-dark-text">
          非同凡想
        </h1>
        <p className="text-base md:text-xl text-apple-subtext dark:text-apple-dark-subtext max-w-2xl mx-auto px-4">
          通过极简主义的镜头探索设计、技术和生活的交汇点。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 主要内容 */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
            <h2 className="text-xl md:text-2xl font-bold text-apple-text dark:text-apple-dark-text">
                {currentTag ? `标签: ${currentTag}` : '最新文章'}
            </h2>
            <div className="flex flex-wrap gap-2">
               {['All', 'Tech', 'Design', 'Life'].map(cat => (
                 <button 
                    key={cat} 
                    onClick={() => handleCategoryClick(cat)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${currentCategory === cat ? 'bg-apple-blue text-white border-apple-blue' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-apple-blue'}`}
                 >
                   {cat === 'All' ? '全部' : cat === 'Tech' ? '科技' : cat === 'Design' ? '设计' : '生活'}
                 </button>
               ))}
               {(currentTag || currentCategory !== 'All') && (
                   <button onClick={clearFilters} className="px-3 py-1 text-xs font-medium text-red-500 hover:underline">清除</button>
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
                        <img 
                            src={article.cover} 
                            alt={article.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        </div>
                        <div className="p-4 md:p-6 md:w-3/5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                            <span 
                                onClick={(e) => { e.stopPropagation(); handleCategoryClick(article.category); }}
                                className="text-xs font-semibold text-apple-blue uppercase tracking-wider hover:underline"
                            >
                                {article.category}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500">{article.date}</span>
                            </div>
                            <h3 className="text-lg md:text-2xl font-bold text-apple-text dark:text-apple-dark-text mb-2 leading-tight group-hover:text-apple-blue transition-colors">
                            {article.title}
                            </h3>
                            <p className="text-apple-subtext dark:text-apple-dark-subtext line-clamp-2 text-sm leading-relaxed">
                            {article.summary}
                            </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-400 space-x-4">
                                <span className="flex items-center"><Eye size={14} className="mr-1"/> {article.views}</span>
                                <span className="flex items-center"><Clock size={14} className="mr-1"/> {calculateReadingTime(article.content)}</span>
                            </div>
                            {article.tags && article.tags.length > 0 && (
                                <div className="flex space-x-2">
                                    {article.tags.slice(0,2).map(tag => (
                                        <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                        </div>
                    </Card>
                    ))
                )}
                
                {/* 分页 (传入总数) */}
                {articles.length > 0 && (
                    <Pagination page={page} totalPages={totalPages} totalItems={totalItems} onPageChange={setPage} />
                )}
            </>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
           {/* 关于我卡片 (翻转版) */}
           <FlipAboutCard />

           <div className="sticky top-24 space-y-6 md:space-y-8">
             <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">热门话题</h3>
                {/* 触发动画的关键变化 */}
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

             {/* 公告 */}
             <Announcements />

             {/* 推荐作者 */}
             <RecommendedAuthors />
           </div>
        </div>
      </div>
    </div>
  );
};