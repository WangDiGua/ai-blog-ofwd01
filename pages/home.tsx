import React, { useEffect, useState, useTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Pagination, Img } from '../components/ui';
import { articleApi } from '../services/api';
import { Article } from '../types';
import { Eye, Clock, Hash, RotateCw } from 'lucide-react';
import { calculateReadingTime } from '../utils/lib';
import { CategoryCarousel, TagCarousel } from '../components/ui/Carousels';
import { ArticleSkeleton, FlipAboutCard, Announcements, RecommendedAuthors } from '../components/HomeWidgets';

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
  
  // React 18 Concurrent Feature
  const [isPending, startTransition] = useTransition();
  
  const searchParams = new URLSearchParams(location.search);
  const LIMIT = 5;

  // 当前过滤器
  const currentCategory = searchParams.get('category') || 'All';
  const currentTag = searchParams.get('tag');

  // 获取分类和标签数据
  useEffect(() => {
      articleApi.getTags().then(tags => {
          setAllTags(tags);
          setTrendingTags(tags.slice(0, 5));
      });
      articleApi.getCategories().then(cats => {
          setAllCategories(cats.map(c => c.id));
      });
  }, []);

  // 轮播标签动画
  useEffect(() => {
    if (allTags.length === 0) return;
    const interval = setInterval(() => {
        // 简单洗牌
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
      // 使用 startTransition 标记低优先级更新，保持 UI (如按钮点击态) 响应迅速
      startTransition(() => {
          updateParams('category', cat);
          setPage(1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  };

  const handleTagClick = (tag: string) => {
      startTransition(() => {
          updateParams('tag', tag);
          setPage(1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  };

  const clearFilters = () => {
      startTransition(() => {
          navigate({ search: '' });
          setPage(1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      });
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
        <div className={`lg:col-span-8 space-y-6 md:space-y-8 transition-opacity duration-300 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
            <h2 className="text-xl md:text-2xl font-bold text-apple-text dark:text-apple-dark-text">
                {currentTag ? `标签: ${currentTag}` : '最新文章'}
            </h2>
            <div className="flex items-start gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
               {/* 固定 '全部' 选项 */}
               <button 
                  onClick={() => handleCategoryClick('All')}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors whitespace-nowrap h-[26px] ${currentCategory === 'All' ? 'bg-apple-blue text-white border-apple-blue' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-apple-blue'}`}
               >
                 全部
               </button>
               
               {/* 轮播其余分类 */}
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
                            <p className="text-apple-subtext dark:text-apple-dark-subtext line-clamp-2 text-sm leading-relaxed">
                            {article.summary}
                            </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-400 space-x-4">
                                <span className="flex items-center"><Eye size={14} className="mr-1"/> {article.views}</span>
                                <span className="flex items-center"><Clock size={14} className="mr-1"/> {calculateReadingTime(article.content)}</span>
                            </div>
                            {/* 使用 TagCarousel 替换原有的标签渲染 */}
                            <TagCarousel tags={article.tags} />
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