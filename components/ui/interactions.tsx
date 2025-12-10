import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useStore } from '../../context/store';
import { Button } from './atoms';
import { Modal } from './modals';
import { authApi } from '../../services/api/auth';
import { ArrowUp, Type, Coffee, Sun, Moon, Eye, CheckCircle, AlertCircle, Info, Gift, RefreshCw, CloudSun, Command, X } from 'lucide-react';

// --- 全局自定义光标 ---
export const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const followerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 如果是触摸设备，不启用自定义光标
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const moveCursor = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            
            // 主光标直接跟随
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${clientX - 4}px, ${clientY - 4}px, 0)`;
            }
            
            // 跟随圆环带有延迟动画
            if (followerRef.current) {
                followerRef.current.animate({
                    transform: `translate3d(${clientX - 16}px, ${clientY - 16}px, 0)`
                }, {
                    duration: 500,
                    fill: "forwards"
                });
            }
        };

        const handleMouseDown = () => {
             if (cursorRef.current) cursorRef.current.style.transform += ' scale(0.8)';
             if (followerRef.current) followerRef.current.style.transform += ' scale(1.5)';
        };

        const handleMouseUp = () => {
             // Reset logic handled by next move event implicitly or could be explicit
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // 仅在桌面端显示
    return (
        <div className="hidden md:block pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            {/* 核心点 */}
            <div 
                ref={cursorRef}
                className="absolute w-2 h-2 bg-white rounded-full mix-blend-difference will-change-transform"
                style={{ left: 0, top: 0 }}
            />
            {/* 跟随圆环 */}
            <div 
                ref={followerRef}
                className="absolute w-8 h-8 border border-white rounded-full mix-blend-difference will-change-transform opacity-50"
                style={{ left: 0, top: 0 }}
            />
        </div>
    );
};

// --- 动画主题切换 (三态：亮色/暗色/护眼) ---
export const ThemeToggle = () => {
  const { theme, toggleTheme } = useStore();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full overflow-hidden focus:outline-none transition-colors duration-500 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="切换主题"
      title={`当前模式: ${theme === 'dark' ? '深色' : theme === 'eye' ? '护眼' : '浅色'}`}
    >
       <div className="absolute inset-0 flex items-center justify-center">
          
          {/* 太阳 (浅色) */}
          <div 
            className="absolute transition-all duration-500 ease-out"
            style={{ 
              transform: theme === 'light' ? 'translateY(0) scale(1)' : 'translateY(150%) scale(0.5)',
              opacity: theme === 'light' ? 1 : 0
            }}
          >
             <Sun className="text-orange-500 fill-orange-500" size={24} />
          </div>

          {/* 月亮 (深色) */}
          <div 
            className="absolute transition-all duration-500 ease-out"
            style={{ 
              transform: theme === 'dark' ? 'translateY(0) scale(1)' : theme === 'light' ? 'translateY(150%) scale(0.5)' : 'translateY(-150%) scale(0.5)',
              opacity: theme === 'dark' ? 1 : 0
            }}
          >
             <Moon className="text-yellow-300 fill-yellow-300" size={24} />
          </div>

          {/* 眼睛 (护眼) */}
          <div 
            className="absolute transition-all duration-500 ease-out"
            style={{ 
              transform: theme === 'eye' ? 'translateY(0) scale(1)' : 'translateY(-150%) scale(0.5)',
              opacity: theme === 'eye' ? 1 : 0
            }}
          >
             <Eye className="text-green-600 fill-green-100" size={24} />
          </div>

       </div>
    </button>
  );
};

// --- 分页组件 (带总数) ---
export const Pagination = ({ page, totalPages, totalItems, onPageChange }: { page: number, totalPages: number, totalItems?: number, onPageChange: (p: number) => void }) => {
  // ... (No changes to Pagination logic, keeping it compact)
  const getPageNumbers = () => {
      const pages = [];
      for (let i = 1; i <= totalPages; i++) {
          if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
              pages.push(i);
          } else if (pages[pages.length - 1] !== '...') {
              pages.push('...');
          }
      }
      return pages;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
      {totalItems !== undefined && (
          <span className="text-sm text-gray-500">共 {totalItems} 条内容</span>
      )}
      <div className="flex items-center space-x-2">
         {getPageNumbers().map((p, idx) => (
            <button
                key={idx}
                onClick={() => typeof p === 'number' && onPageChange(p)}
                disabled={typeof p !== 'number'}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${p === page ? 'bg-apple-blue text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
                {p}
            </button>
         ))}
      </div>
    </div>
  );
};

// --- Toast 通知 (Portal) ---
export const ToastContainer = () => {
    const { toasts } = useStore();
    return ReactDOM.createPortal(
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
        </div>,
        document.body
    );
};

// --- 悬浮菜单 (精修版 - Portal) ---
export const FloatingMenu = () => {
    const { cycleFontSize, showFestive, toggleFestive, cycleSeasonMode, seasonMode } = useStore();
    const [showDonate, setShowDonate] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsOpen(false);
    };

    const getSeasonIconColor = () => {
        switch(seasonMode) {
            case 'spring': return 'text-pink-500';
            case 'summer': return 'text-green-500';
            case 'autumn': return 'text-orange-500';
            case 'winter': return 'text-blue-500';
            default: return 'text-gray-600 dark:text-gray-300';
        }
    };

    const menuItems = [
        { icon: ArrowUp, action: scrollToTop, label: "回到顶部", color: "text-gray-600 dark:text-gray-300" },
        { icon: Coffee, action: () => setShowDonate(true), label: "打赏", color: "text-pink-500" },
        { icon: Type, action: cycleFontSize, label: "调整字号", color: "text-gray-600 dark:text-gray-300" },
        ...(showFestive ? [{ icon: CloudSun, action: cycleSeasonMode, label: `季节: ${seasonMode}`, color: getSeasonIconColor() }] : []),
        { icon: Gift, action: toggleFestive, label: "节日氛围", color: showFestive ? 'text-red-500' : 'text-gray-600 dark:text-gray-300' },
    ];

    return ReactDOM.createPortal(
        <>
            <div className="fixed right-6 bottom-10 z-[90] flex flex-col items-center">
                {/* 菜单项容器 */}
                <div className={`flex flex-col-reverse items-center space-y-reverse space-y-4 mb-4`}>
                    {menuItems.map((item, index) => (
                        <div 
                            key={index}
                            className={`
                                relative group flex items-center justify-end
                                transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                            `}
                            style={{
                                transform: isOpen ? `translateY(0) scale(1)` : `translateY(${20 * (index + 1)}px) scale(0.5)`,
                                opacity: isOpen ? 1 : 0,
                                pointerEvents: isOpen ? 'auto' : 'none',
                                transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
                            }}
                        >
                            {/* Label Tooltip */}
                            <span className="absolute right-14 px-3 py-1.5 bg-black/80 text-white text-xs font-medium rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-xl mr-2">
                                {item.label}
                            </span>

                            <button 
                                onClick={() => { item.action(); }}
                                className={`w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/40 dark:border-gray-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all ${item.color}`}
                            >
                                <item.icon size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* 主触发按钮 (图标优化) */}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        w-14 h-14 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-2xl border border-white/20 
                        transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-50
                        hover:scale-105 active:scale-95 group
                        ${isOpen ? 'bg-gray-900 dark:bg-white text-white dark:text-black' : 'bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white'}
                    `}
                >
                    <div className="relative w-6 h-6">
                        <Command 
                            size={24} 
                            className={`absolute inset-0 transition-all duration-500 ${isOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} 
                        />
                        <X 
                            size={24} 
                            className={`absolute inset-0 transition-all duration-500 ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} 
                        />
                    </div>
                </button>
            </div>

            <Modal isOpen={showDonate} onClose={() => setShowDonate(false)} title="请我喝杯咖啡">
                <div className="text-center p-4">
                    <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Coffee className="text-pink-500 h-10 w-10" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        如果您喜欢我的作品，您可以支持我继续运营这个博客！
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="secondary" onClick={() => window.open('https://paypal.me', '_blank')}>PayPal</Button>
                        <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={() => window.open('https://weixin.qq.com', '_blank')}>微信</Button>
                    </div>
                </div>
            </Modal>
        </>,
        document.body
    );
};

// --- 表情选择器 (简单版) ---
export const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
    const emojis = ["👍", "❤️", "😂", "😮", "😢", "😡", "🎉", "🔥", "👀", "🚀", "💯", "🤔", "👏", "💩", "👻"];
    return (
        <div className="p-2 grid grid-cols-5 gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
            {emojis.map(e => (
                <button key={e} onClick={() => onSelect(e)} className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors">{e}</button>
            ))}
        </div>
    );
};

// --- 真实验证码组件 ---
export const Captcha = ({ onRefresh }: { onRefresh: (key: string) => void }) => {
    const [imgSrc, setImgSrc] = useState('');
    const [loading, setLoading] = useState(false);
    const refreshCaptcha = async () => {
        setLoading(true);
        try {
            const res = await authApi.getCaptcha();
            setImgSrc(res.image);
            onRefresh(res.key);
        } catch (e) { console.error("Failed to fetch captcha", e); } finally { setLoading(false); }
    };
    useEffect(() => { refreshCaptcha(); }, []);
    return (
        <div className="relative group cursor-pointer" onClick={refreshCaptcha} title="点击刷新">
            {loading ? (
                <div className="w-[100px] h-[40px] bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center animate-pulse">
                    <RefreshCw size={16} className="animate-spin text-gray-400" />
                </div>
            ) : imgSrc ? (
                <img src={imgSrc} alt="Captcha" className="w-[100px] h-[40px] rounded-xl object-cover border border-gray-200 dark:border-gray-700" />
            ) : (
                <div className="w-[100px] h-[40px] bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-500">加载失败</div>
            )}
        </div>
    );
};