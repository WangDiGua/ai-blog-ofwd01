import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Spinner, Pagination, Avatar, Button, Skeleton, AnnouncementModal } from '../components/ui';
import { request } from '../utils/lib';
import { Article, Announcement } from '../types';
import { Eye, Clock, Hash, Bell, Github, FileCode, Video, MessageCircle, UserPlus } from 'lucide-react';

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
        request.get<Announcement[]>('/announcements').then(setNews);
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

// --- 推荐作者组件 ---
const RecommendedAuthors = () => {
    const authors = [
        { id: 1, name: 'Alice Walker', avatar: 'https://ui-avatars.com/api/?name=Alice+Walker&background=FF5733&color=fff', articles: 42 },
        { id: 2, name: 'David Chen', avatar: 'https://ui-avatars.com/api/?name=David+Chen&background=33FF57&color=fff', articles: 18 },
        { id: 3, name: 'Elena G', avatar: 'https://ui-avatars.com/api/?name=Elena+G&background=3357FF&color=fff', articles: 35 }
    ];

    return (
        <Card className="p-4 md:p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                <UserPlus size={14} className="mr-2"/> 推荐作者
            </h3>
            <div className="space-y-4">
                {authors.map(author => (
                    <div key={author.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Avatar src={author.avatar} alt={author.name} size="sm" />
                            <div>
                                <div className="text-sm font-semibold text-apple-text dark:text-apple-dark-text">{author.name}</div>
                                <div className="text-xs text-gray-500">{author.articles} 篇文章</div>
                            </div>
                        </div>
                        <Button size="sm" variant="secondary" className="text-xs px-2 py-1">关注</Button>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export const Home = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [trendingTags, setTrendingTags] = useState(['#React19', '#TailwindCSS', '#UXDesign']);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
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
        const data = await request.get<{items: Article[], totalPages: number}>('/articles', { 
            page, 
            limit: LIMIT,
            category: currentCategory,
            tag: currentTag
        });
        setArticles(data.items);
        setTotalPages(data.totalPages);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [page, currentCategory, currentTag]);

  const handleCategoryClick = (cat: string) => {
      setSearchParams({ category: cat });
      setPage(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTagClick = (tag: string) => {
      setSearchParams({ tag: tag });
      setPage(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
      setSearchParams({});
      setPage(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 mb-20">
      
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
                                <span className="flex items-center"><Clock size={14} className="mr-1"/> 5 分钟阅读</span>
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
                
                {/* 分页 */}
                {articles.length > 0 && (
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                )}
            </>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
           <Card className="p-4 md:p-6">
              <h3 className="text-lg font-bold mb-4 text-apple-text dark:text-apple-dark-text">关于我</h3>
              <div className="flex items-center space-x-4 mb-4">
                <Avatar src="https://picsum.photos/id/1005/100/100" alt="Admin" size="lg" />
                <div>
                  <div className="font-semibold text-apple-text dark:text-apple-dark-text">John Developer</div>
                  <div className="text-xs text-apple-subtext dark:text-apple-dark-subtext">前端工程师</div>
                </div>
              </div>
              <p className="text-sm text-apple-subtext dark:text-apple-dark-subtext mb-4">
                热衷于创建整洁、易用和高性能的用户界面。
              </p>
              
              <div className="grid grid-cols-4 gap-2 mb-4">
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