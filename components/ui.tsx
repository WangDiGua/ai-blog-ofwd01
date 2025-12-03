import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/store';
import { X, ChevronLeft, ChevronRight, ArrowUp, Type, Coffee, Search, Clock, Hash, Play, Pause, SkipBack, SkipForward, Maximize2, Minimize2, CheckCircle, AlertCircle, Info, Smile } from 'lucide-react';
import { request, debounce } from '../utils/lib';
import { Article } from '../types';

// --- Card Component ---
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, className = '', hover = false, ...props }: CardProps) => {
  return (
    <div 
      className={`
        bg-apple-card dark:bg-apple-dark-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden
        transition-all duration-300 ease-out
        ${hover ? 'hover:shadow-md hover:scale-[1.01] hover:-translate-y-1' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// --- Button Component ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-apple-blue text-white hover:bg-blue-600 shadow-sm active:scale-95",
    secondary: "bg-gray-100 dark:bg-gray-800 text-apple-text dark:text-apple-dark-text hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95",
    ghost: "bg-transparent text-apple-blue hover:bg-blue-50/50 dark:hover:bg-blue-900/20",
    danger: "bg-red-500 text-white hover:bg-red-600 active:scale-95"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-full",
    md: "px-5 py-2.5 text-sm rounded-full",
    lg: "px-8 py-3.5 text-base rounded-full"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Avatar Component ---
export const Avatar = ({ src, alt, size = 'md' }: { src: string; alt: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${sizes[size]} rounded-full object-cover border border-gray-100 dark:border-gray-800 shadow-sm`}
    />
  );
};

// --- Loading Spinner ---
export const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-apple-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// --- Theme Toggle Animation Component ---
export const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useStore();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full overflow-hidden shadow-inner focus:outline-none focus:ring-2 focus:ring-apple-blue/50 transition-colors duration-500"
      style={{ backgroundColor: darkMode ? '#1a202c' : '#87CEEB' }} // Sky color
      aria-label="Toggle Theme"
    >
      {/* Sky Container */}
      <div className="absolute inset-0 theme-toggle-sky">
        
        {/* Sun */}
        <div 
          className="absolute w-5 h-5 bg-yellow-400 rounded-full shadow-lg theme-sun"
          style={{ 
            top: darkMode ? '150%' : '50%', 
            left: darkMode ? '50%' : '20%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 10px rgba(255, 223, 0, 0.7)'
          }}
        />

        {/* Moon */}
        <div 
          className="absolute w-5 h-5 bg-gray-100 rounded-full shadow-lg theme-moon"
          style={{ 
            top: darkMode ? '50%' : '-50%', 
            left: darkMode ? '80%' : '50%',
            transform: 'translate(-50%, -50%)',
             boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
          }}
        >
          {/* Craters */}
          <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-gray-300 rounded-full opacity-50"></div>
          <div className="absolute bottom-1.5 right-1.5 w-1 h-1 bg-gray-300 rounded-full opacity-50"></div>
        </div>

        {/* Stars (Only in dark mode) */}
        <div 
          className="absolute inset-0 theme-star"
          style={{ opacity: darkMode ? 1 : 0 }}
        >
           <div className="absolute top-1 left-2 w-0.5 h-0.5 bg-white rounded-full opacity-80 animate-pulse"></div>
           <div className="absolute top-4 left-6 w-0.5 h-0.5 bg-white rounded-full opacity-60"></div>
           <div className="absolute bottom-2 left-4 w-0.5 h-0.5 bg-white rounded-full opacity-70 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

      </div>
    </button>
  );
};

// --- Pagination Component ---
export const Pagination = ({ page, totalPages, onPageChange }: { page: number, totalPages: number, onPageChange: (p: number) => void }) => {
  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <Button 
        variant="secondary" 
        size="sm" 
        disabled={page <= 1} 
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} />
      </Button>
      
      <span className="text-sm font-medium text-apple-subtext mx-2">
        Page {page} of {totalPages}
      </span>

      <Button 
        variant="secondary" 
        size="sm" 
        disabled={page >= totalPages} 
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
};

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

// --- Toast Notifications ---
export const ToastContainer = () => {
    const { toasts, removeToast } = useStore();
    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] space-y-2 pointer-events-none">
            {toasts.map(toast => (
                <div 
                    key={toast.id}
                    className="pointer-events-auto flex items-center px-4 py-3 rounded-xl shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 fade-in duration-300"
                >
                    {toast.type === 'success' && <CheckCircle className="text-green-500 mr-2" size={18} />}
                    {toast.type === 'error' && <AlertCircle className="text-red-500 mr-2" size={18} />}
                    {toast.type === 'info' && <Info className="text-blue-500 mr-2" size={18} />}
                    <span className="text-sm font-medium text-apple-text dark:text-apple-dark-text">{toast.message}</span>
                </div>
            ))}
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
                                        onClick={() => { setQuery(tag); performSearch(tag); }}
                                        className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-apple-text dark:text-apple-dark-text rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Categories</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {['Tech', 'Design', 'Life', 'Music', 'Coding'].map(cat => (
                                    <button key={cat} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-300">
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

// --- Floating Menu (Sticky Sidebar) ---
export const FloatingMenu = () => {
    const { cycleFontSize } = useStore();
    const [showDonate, setShowDonate] = useState(false);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <div className="fixed right-4 bottom-24 z-40 flex flex-col space-y-3">
                <button 
                    onClick={cycleFontSize}
                    className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-apple-text dark:text-apple-dark-text"
                    title="Adjust Font Size"
                >
                    <Type size={18} />
                </button>
                <button 
                    onClick={() => setShowDonate(true)}
                    className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-pink-500"
                    title="Donate"
                >
                    <Coffee size={18} />
                </button>
                <button 
                    onClick={scrollToTop}
                    className="w-10 h-10 bg-apple-blue text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    title="Back to Top"
                >
                    <ArrowUp size={18} />
                </button>
            </div>

            <Modal isOpen={showDonate} onClose={() => setShowDonate(false)} title="Buy me a coffee">
                <div className="text-center p-4">
                    <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Coffee className="text-pink-500 h-10 w-10" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        If you like my work, you can support me to keep this blog running!
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="secondary" onClick={() => window.open('https://paypal.me', '_blank')}>PayPal</Button>
                        <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={() => window.open('https://weixin.qq.com', '_blank')}>WeChat</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

// --- Full Screen Music Player ---
export const FullPlayerModal = () => {
    const { currentSong, isPlaying, togglePlay, isFullPlayerOpen, setFullPlayerOpen } = useStore();
    
    if (!isFullPlayerOpen || !currentSong) return null;

    return (
        <div className="fixed inset-0 z-[80] bg-white/30 dark:bg-black/30 backdrop-blur-xl flex flex-col animate-in slide-in-from-bottom-10 duration-300">
             {/* Background Blur */}
             <div className="absolute inset-0 -z-10 overflow-hidden">
                 <img src={currentSong.cover} alt="bg" className="w-full h-full object-cover opacity-30 dark:opacity-20 blur-3xl scale-110" />
             </div>

             {/* Header */}
             <div className="flex items-center justify-between p-6">
                 <button onClick={() => setFullPlayerOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-gray-800 dark:text-white">
                     <ChevronLeft size={28} />
                 </button>
                 <span className="text-xs font-semibold tracking-widest uppercase text-gray-500 dark:text-gray-400">Now Playing</span>
                 <div className="w-10" /> {/* Spacer */}
             </div>

             {/* Content */}
             <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 gap-10 md:gap-20 overflow-hidden">
                 {/* Art */}
                 <div className="w-64 h-64 md:w-96 md:h-96 rounded-2xl shadow-2xl overflow-hidden flex-shrink-0">
                     <img src={currentSong.cover} alt="Art" className="w-full h-full object-cover" />
                 </div>

                 {/* Lyrics / Info */}
                 <div className="w-full max-w-md text-center md:text-left h-64 md:h-96 overflow-y-auto no-scrollbar mask-gradient">
                     <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{currentSong.title}</h2>
                     <p className="text-xl text-apple-blue mb-8">{currentSong.artist}</p>
                     
                     <div className="space-y-4 text-gray-600 dark:text-gray-300 font-medium text-lg leading-relaxed opacity-80">
                         {currentSong.lyrics ? (
                             currentSong.lyrics.map((line, i) => (
                                 <p key={i} className="hover:text-apple-text dark:hover:text-white transition-colors">{line.replace(/\[.*?\]/, '')}</p>
                             ))
                         ) : (
                             <p>Lyrics not available</p>
                         )}
                     </div>
                 </div>
             </div>

             {/* Controls */}
             <div className="pb-12 px-8 max-w-3xl mx-auto w-full">
                 {/* Progress Bar (Mock) */}
                 <div className="w-full bg-gray-300/50 dark:bg-gray-700/50 h-1.5 rounded-full mb-8 cursor-pointer relative group">
                     <div className="absolute top-0 left-0 h-full bg-apple-text dark:bg-white w-1/3 rounded-full">
                         <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
                     </div>
                 </div>

                 <div className="flex items-center justify-between">
                     <button className="text-gray-500 hover:text-gray-900 dark:hover:text-white"><SkipBack size={32} /></button>
                     <button 
                        onClick={togglePlay}
                        className="w-20 h-20 bg-apple-text dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
                     >
                         {isPlaying ? <Pause size={36} className="fill-current" /> : <Play size={36} className="fill-current ml-2" />}
                     </button>
                     <button className="text-gray-500 hover:text-gray-900 dark:hover:text-white"><SkipForward size={32} /></button>
                 </div>
             </div>
        </div>
    );
};

// --- Emoji Picker (Simple) ---
export const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
    const emojis = ["👍", "❤️", "😂", "😮", "😢", "😡", "🎉", "🔥", "👀", "🚀", "💯", "🤔", "👏", "💩", "👻"];
    
    return (
        <div className="p-2 grid grid-cols-5 gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
            {emojis.map(e => (
                <button 
                    key={e} 
                    onClick={() => onSelect(e)}
                    className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors"
                >
                    {e}
                </button>
            ))}
        </div>
    );
};
