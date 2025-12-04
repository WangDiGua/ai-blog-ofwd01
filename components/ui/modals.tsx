import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/store';
import { request, debounce } from '../../utils/lib';
import { Article } from '../../types';
import { X, Search, Hash, ArrowUp } from 'lucide-react';

// --- Modal Component ---
export const Modal = ({ isOpen, onClose, title, children, className = '' }: { isOpen: boolean, onClose: () => void, title?: string, children: React.ReactNode, className?: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className={`relative bg-white dark:bg-apple-dark-card w-full max-w-md rounded-2xl shadow-2xl p-6 transform transition-all animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto ${className}`}>
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-inherit z-10 pb-2">
          {title && <h3 className="text-xl font-bold text-apple-text dark:text-apple-dark-text">{title}</h3>}
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// --- Search Modal (Spotlight Style) ---
export const SearchModal = () => {
    const { isSearchOpen, setSearchOpen } = useStore();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Article[]>([]);
    const [hotSearches, setHotSearches] = useState<string[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (isSearchOpen) {
            // Load hot searches
            request.get<string[]>('/search/hot').then(setHotSearches);
        }
    }, [isSearchOpen]);

    const performSearch = React.useCallback(debounce(async (q: string) => {
        if (!q.trim()) {
            setResults([]);
            return;
        }
        const res = await request.get<{items: Article[]}>('/articles', { q, limit: 5 });
        setResults(res.items);
    }, 300), []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        performSearch(e.target.value);
    };

    const handleSelect = (id: string) => {
        navigate(`/article/${id}`);
        setSearchOpen(false);
    };

    const handleTagClick = (tag: string) => {
        navigate(`/?tag=${encodeURIComponent(tag)}`);
        setSearchOpen(false);
    }
    
    const handleCategoryClick = (cat: string) => {
        navigate(`/?category=${cat}`);
        setSearchOpen(false);
    }

    if (!isSearchOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[20vh] px-4">
             <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSearchOpen(false)} />
             
             <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center px-4 py-4 border-b border-gray-100 dark:border-gray-800">
                    <Search className="text-gray-400 mr-3" />
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="Search for articles, topics, or ideas..." 
                        className="flex-1 bg-transparent border-none outline-none text-lg text-apple-text dark:text-apple-dark-text placeholder-gray-400"
                        value={query}
                        onChange={handleChange}
                    />
                    <div className="hidden md:flex items-center space-x-1">
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-1 rounded">ESC</span>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {query.trim() === '' ? (
                         <div className="p-6">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Popular Searches</h4>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {hotSearches.map(tag => (
                                    <button 
                                        key={tag} 
                                        onClick={() => handleTagClick(tag)}
                                        className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-apple-text dark:text-apple-dark-text rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Categories</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {['Tech', 'Design', 'Life', 'Music', 'Coding'].map(cat => (
                                    <button key={cat} onClick={() => handleCategoryClick(cat)} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-300">
                                        <Hash size={14} className="mr-2 text-apple-blue"/> {cat}
                                    </button>
                                ))}
                            </div>
                         </div>
                    ) : (
                        <div className="py-2">
                             {results.length > 0 ? (
                                 results.map(article => (
                                     <div 
                                        key={article.id} 
                                        onClick={() => handleSelect(article.id)}
                                        className="px-4 py-3 hover:bg-apple-blue/10 cursor-pointer flex items-center justify-between group"
                                     >
                                         <div>
                                            <div className="font-medium text-apple-text dark:text-apple-dark-text group-hover:text-apple-blue">{article.title}</div>
                                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{article.summary}</div>
                                         </div>
                                         <ArrowUp className="opacity-0 group-hover:opacity-100 -rotate-45 text-apple-blue transform transition-all" size={16} />
                                     </div>
                                 ))
                             ) : (
                                 <div className="p-8 text-center text-gray-500">No results found for "{query}"</div>
                             )}
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
};
