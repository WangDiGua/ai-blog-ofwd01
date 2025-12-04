import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Spinner, Pagination, Avatar, Button, Skeleton } from '../components/ui';
import { request } from '../utils/lib';
import { Article } from '../types';
import { Eye, Clock, Hash, Bell } from 'lucide-react';

const ArticleSkeleton = () => (
  <Card className="flex flex-col md:flex-row h-full md:h-64 p-0 overflow-hidden">
    <div className="md:w-2/5 h-48 md:h-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
    <div className="p-6 md:w-3/5 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-8 w-3/4" />
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

// --- Announcements Component ---
const Announcements = () => {
    const [news, setNews] = useState<{id: number, text: string, type: string}[]>([]);
    
    useEffect(() => {
        request.get<any[]>('/announcements').then(setNews);
    }, []);

    if (news.length === 0) return null;

    return (
        <Card className="p-6">
             <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                 <Bell size={14} className="mr-2"/> Announcements
             </h3>
             <div className="space-y-3">
                 {news.map(n => (
                     <div key={n.id} className="text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                         {n.text}
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

  // Current filters
  const currentCategory = searchParams.get('category') || 'All';
  const currentTag = searchParams.get('tag');

  // Rotate Tags with Animation
  useEffect(() => {
    const interval = setInterval(() => {
        // Simple shuffle for demo
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
  };

  const handleTagClick = (tag: string) => {
      setSearchParams({ tag: tag });
      setPage(1);
  };

  const clearFilters = () => {
      setSearchParams({});
      setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Hero / Intro */}
      <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-apple-text dark:text-apple-dark-text">
          Think Different.
        </h1>
        <p className="text-lg md:text-xl text-apple-subtext dark:text-apple-dark-subtext max-w-2xl mx-auto">
          Exploring the intersection of design, technology, and lifestyle through a minimalist lens.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-apple-text dark:text-apple-dark-text">
                {currentTag ? `Tag: ${currentTag}` : 'Latest Stories'}
            </h2>
            <div className="flex space-x-2">
               {['All', 'Tech', 'Design', 'Life'].map(cat => (
                 <button 
                    key={cat} 
                    onClick={() => handleCategoryClick(cat)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${currentCategory === cat ? 'bg-apple-blue text-white border-apple-blue' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-apple-blue'}`}
                 >
                   {cat}
                 </button>
               ))}
               {(currentTag || currentCategory !== 'All') && (
                   <button onClick={clearFilters} className="px-3 py-1 text-xs font-medium text-red-500 hover:underline">Clear</button>
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
                    <div className="text-center py-10 text-gray-500">No articles found.</div>
                ) : (
                    articles.map((article) => (
                    <Card key={article.id} hover className="flex flex-col md:flex-row group cursor-pointer h-full md:h-64" onClick={() => navigate(`/article/${article.id}`)}>
                        <div className="md:w-2/5 h-48 md:h-full overflow-hidden">
                        <img 
                            src={article.cover} 
                            alt={article.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        </div>
                        <div className="p-6 md:w-3/5 flex flex-col justify-between">
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
                            <h3 className="text-xl md:text-2xl font-bold text-apple-text dark:text-apple-dark-text mb-2 leading-tight group-hover:text-apple-blue transition-colors">
                            {article.title}
                            </h3>
                            <p className="text-apple-subtext dark:text-apple-dark-subtext line-clamp-2 text-sm leading-relaxed">
                            {article.summary}
                            </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-400 space-x-4">
                                <span className="flex items-center"><Eye size={14} className="mr-1"/> {article.views}</span>
                                <span className="flex items-center"><Clock size={14} className="mr-1"/> 5 min read</span>
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
                
                {/* Pagination */}
                {articles.length > 0 && (
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 text-apple-text dark:text-apple-dark-text">About Me</h3>
              <div className="flex items-center space-x-4 mb-4">
                <Avatar src="https://picsum.photos/id/1005/100/100" alt="Admin" size="lg" />
                <div>
                  <div className="font-semibold text-apple-text dark:text-apple-dark-text">John Developer</div>
                  <div className="text-xs text-apple-subtext dark:text-apple-dark-subtext">Frontend Engineer</div>
                </div>
              </div>
              <p className="text-sm text-apple-subtext dark:text-apple-dark-subtext mb-4">
                Passionate about creating clean, accessible, and high-performance user interfaces. 
              </p>
              <Button variant="secondary" size="sm" className="w-full">Follow</Button>
           </Card>

           <div className="sticky top-24 space-y-8">
             <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Trending Topics</h3>
                {/* Key change triggers animation */}
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

             {/* Announcements */}
             <Announcements />
           </div>
        </div>
      </div>
    </div>
  );
};
