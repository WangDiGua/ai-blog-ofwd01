
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/store';
import { request, debounce } from '../../utils/lib';
import { Article, Announcement } from '../../types';
import { X, Search, Hash, Lock, Send, Bug, Lightbulb, Clock, ArrowUpRight, User } from 'lucide-react';
import { Button, Spinner, MarkdownRenderer } from './atoms';

// --- Base Modal Component ---
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
      <div className={`relative bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl p-6 transform transition-all animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800 ${className}`}>
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-inherit z-10 pb-2">
          {title && <h3 className="text-xl font-bold text-apple-text dark:text-apple-dark-text">{title}</h3>}
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// --- Search Modal ---
export const SearchModal = () => {
    const { isSearchOpen, setSearchOpen } = useStore();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Article[]>([]);
    const [hotSearches, setHotSearches] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isSearchOpen) {
            request.get<string[]>('/search/hot').then(setHotSearches);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isSearchOpen]);

    const performSearch = async (q: string) => {
        if (!q.trim()) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            const res = await request.get<{items: Article[]}>('/articles', { q, limit: 5 });
            setResults(res.items);
        } catch(e) { console.error(e); }
        finally { setLoading(false); }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = React.useCallback(debounce(performSearch, 300), []);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleClose = () => {
        setSearchOpen(false);
        setQuery('');
        setResults([]);
    };

    const goToArticle = (id: string) => {
        navigate(`/article/${id}`);
        handleClose();
    };

    if (!isSearchOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-start justify-center pt-24 px-4">
             <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl transition-opacity animate-in fade-in" onClick={handleClose} />
             
             <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in slide-in-from-top-4 duration-300">
                 <div className="flex items-center p-4 border-b border-gray-100 dark:border-gray-800">
                     <Search className="text-gray-400 ml-2" size={20} />
                     <input 
                        ref={inputRef}
                        className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-lg text-apple-text dark:text-apple-dark-text placeholder-gray-400"
                        placeholder="Search articles, tags, or topics..."
                        value={query}
                        onChange={handleInput}
                     />
                     <button onClick={handleClose} className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 rounded text-gray-500">ESC</button>
                 </div>

                 <div className="p-4 max-h-[60vh] overflow-y-auto">
                     {loading ? (
                         <div className="flex justify-center py-8"><Spinner /></div>
                     ) : query ? (
                         results.length > 0 ? (
                             <div className="space-y-2">
                                 {results.map(article => (
                                     <div key={article.id} onClick={() => goToArticle(article.id)} className="flex items-start p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group transition-colors">
                                         <div className="flex-1">
                                             <h4 className="font-semibold text-apple-text dark:text-apple-dark-text group-hover:text-apple-blue">{article.title}</h4>
                                             <p className="text-sm text-gray-500 line-clamp-1">{article.summary}</p>
                                         </div>
                                         <ArrowUpRight size={16} className="text-gray-300 group-hover:text-apple-blue opacity-0 group-hover:opacity-100 transition-all" />
                                     </div>
                                 ))}
                             </div>
                         ) : (
                             <div className="text-center py-8 text-gray-500">No results found for "{query}"</div>
                         )
                     ) : (
                         <div>
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Popular Searches</h4>
                             <div className="flex flex-wrap gap-2">
                                 {hotSearches.map(tag => (
                                     <button 
                                        key={tag}
                                        onClick={() => { setQuery(tag); performSearch(tag); }}
                                        className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors"
                                     >
                                         <Hash size={14} className="mr-1 text-gray-400"/> {tag}
                                     </button>
                                 ))}
                             </div>
                         </div>
                     )}
                 </div>
             </div>
        </div>
    );
};

// --- Admin Login Modal ---
export const AdminLoginModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        // Simple mock validation
        if (password === 'admin123') {
            onClose();
            window.location.href = 'https://google.com'; // Redirect to backend placeholder
        } else {
            setError('Invalid System Password');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="System Access">
            <div className="flex flex-col items-center justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                    <Lock size={32} className="text-red-500" />
                </div>
                <p className="text-center text-sm text-gray-500">Restricted Area. Authorized Personnel Only.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <input 
                        type="password" 
                        placeholder="Enter Admin Password" 
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-red-500 outline-none text-apple-text dark:text-apple-dark-text text-center tracking-widest"
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
                </div>
                <Button variant="danger" type="submit" className="w-full">
                    Authenticate
                </Button>
            </form>
        </Modal>
    );
};

// --- Announcement Modal ---
export const AnnouncementModal = ({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: Announcement | null }) => {
    if (!data) return null;
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Announcement" className="max-w-2xl">
            <div className="space-y-6">
                 <div className="flex items-center space-x-2 text-sm text-gray-500">
                     <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase text-white
                        ${data.type === 'info' ? 'bg-blue-500' : data.type === 'warning' ? 'bg-orange-500' : 'bg-green-500'}
                     `}>
                        {data.type}
                     </span>
                     <span>•</span>
                     <span className="flex items-center"><Clock size={14} className="mr-1"/> {data.date}</span>
                     <span>•</span>
                     <span className="flex items-center"><User size={14} className="mr-1"/> {data.publisher}</span>
                 </div>
                 
                 <div>
                     <h2 className="text-2xl font-bold text-apple-text dark:text-apple-dark-text mb-4">{data.title}</h2>
                     <div className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
                         <MarkdownRenderer content={data.content} />
                     </div>
                 </div>

                 <div className="flex justify-end">
                     <Button onClick={onClose}>Close</Button>
                 </div>
            </div>
        </Modal>
    );
};

// --- Feedback Modal ---
export const FeedbackModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const { user, showToast } = useStore();
    const [content, setContent] = useState('');
    const [type, setType] = useState<'bug' | 'suggestion'>('suggestion');

    const handleSubmit = async () => {
        if (!content.trim()) return;
        try {
            await request.post('/user/feedback', { userId: user?.id, content, type });
            showToast('Thank you for your feedback!', 'success');
            setContent('');
            onClose();
        } catch (e) {
            showToast('Failed to send feedback', 'error');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Give Feedback">
            <div className="space-y-4">
                <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setType('suggestion')}
                        className={`flex-1 flex items-center justify-center py-2 rounded-md text-sm font-medium transition-all ${type === 'suggestion' ? 'bg-white dark:bg-gray-700 shadow-sm text-apple-blue' : 'text-gray-500'}`}
                    >
                        <Lightbulb size={16} className="mr-2"/> Suggestion
                    </button>
                    <button 
                        onClick={() => setType('bug')}
                        className={`flex-1 flex items-center justify-center py-2 rounded-md text-sm font-medium transition-all ${type === 'bug' ? 'bg-white dark:bg-gray-700 shadow-sm text-red-500' : 'text-gray-500'}`}
                    >
                        <Bug size={16} className="mr-2"/> Bug Report
                    </button>
                </div>
                
                <textarea 
                    className="w-full h-32 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none resize-none text-apple-text dark:text-apple-dark-text"
                    placeholder="Tell us what you think..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                
                <div className="flex justify-end space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!content.trim()}>
                        <Send size={16} className="mr-2"/> Submit
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
