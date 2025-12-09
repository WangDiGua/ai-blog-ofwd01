import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/store';
import { Button } from './atoms';
import { Modal } from './modals';
import { authApi } from '../../services/api/auth';
import { ChevronLeft, ChevronRight, ArrowUp, Type, Coffee, Sun, Moon, CheckCircle, AlertCircle, Info, Plus, Gift, RefreshCw, CloudSun } from 'lucide-react';

// --- 动画主题切换 (日落 / 月升) ---
export const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useStore();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full overflow-hidden focus:outline-none transition-colors duration-500 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="切换主题"
    >
       {/* 太阳和月亮的容器 */}
       <div className="absolute inset-0 flex items-center justify-center">
          {/* 太阳: 浅色模式可见 (y=0), 深色模式下移 (y=100%) */}
          <div 
            className="absolute transition-all duration-500 ease-out"
            style={{ 
              transform: darkMode ? 'translateY(150%)' : 'translateY(0)',
              opacity: darkMode ? 0 : 1
            }}
          >
             <Sun className="text-orange-500 fill-orange-500" size={24} />
          </div>

          {/* 月亮: 浅色模式隐藏 (y=100%), 深色模式上移 (y=0) */}
          <div 
            className="absolute transition-all duration-500 ease-out"
            style={{ 
              transform: darkMode ? 'translateY(0)' : 'translateY(150%)',
              opacity: darkMode ? 1 : 0
            }}
          >
             <Moon className="text-yellow-300 fill-yellow-300" size={24} />
          </div>
       </div>
    </button>
  );
};

// --- 分页组件 (带总数) ---
export const Pagination = ({ page, totalPages, totalItems, onPageChange }: { page: number, totalPages: number, totalItems?: number, onPageChange: (p: number) => void }) => {
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
        <Button 
          variant="secondary" 
          size="sm" 
          disabled={page <= 1} 
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
        </Button>
        
        <div className="flex space-x-1">
            {getPageNumbers().map((p, idx) => (
                <button
                    key={idx}
                    onClick={() => typeof p === 'number' && onPageChange(p)}
                    disabled={typeof p !== 'number'}
                    className={`
                        w-8 h-8 rounded-full text-xs font-medium transition-all
                        ${p === page 
                            ? 'bg-apple-blue text-white shadow-md scale-110' 
                            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                        ${typeof p !== 'number' ? 'cursor-default' : ''}
                    `}
                >
                    {p}
                </button>
            ))}
        </div>

        <Button 
          variant="secondary" 
          size="sm" 
          disabled={page >= totalPages} 
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};

// --- Toast 通知 ---
export const ToastContainer = () => {
    const { toasts } = useStore();
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

// --- 悬浮菜单 (Refined Style) ---
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

    return (
        <>
            <div className="fixed right-6 bottom-10 z-40 flex flex-col items-center">
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
                            <span className="absolute right-14 px-2 py-1 bg-black/70 text-white text-xs rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none mr-2">
                                {item.label}
                            </span>

                            <button 
                                onClick={() => { item.action(); }}
                                className={`w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-white/20 dark:border-gray-700 rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all ${item.color}`}
                            >
                                <item.icon size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* 主触发按钮 */}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        w-14 h-14 rounded-full flex items-center justify-center shadow-xl backdrop-blur-xl border border-white/20 
                        transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-50
                        hover:scale-105 active:scale-95
                        ${isOpen ? 'bg-gray-800 dark:bg-gray-700 text-white rotate-[135deg]' : 'bg-apple-blue text-white rotate-0'}
                    `}
                >
                    <Plus size={28} className="transition-transform" />
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
        </>
    );
};

// --- 表情选择器 (简单版) ---
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

// --- 真实验证码组件 (从后端获取图片) ---
export const Captcha = ({ onRefresh }: { onRefresh: (key: string) => void }) => {
    const [imgSrc, setImgSrc] = useState('');
    const [loading, setLoading] = useState(false);

    const refreshCaptcha = async () => {
        setLoading(true);
        try {
            // 调用真实后端获取验证码
            const res = await authApi.getCaptcha();
            // 假设后端返回 { key: "uuid", image: "base64 string" }
            setImgSrc(res.image);
            onRefresh(res.key); // 将 key 回传给父组件
        } catch (e) {
            console.error("Failed to fetch captcha", e);
        } finally {
            setLoading(false);
        }
    };

    // 初始加载
    useEffect(() => {
        refreshCaptcha();
    }, []);

    return (
        <div className="relative group cursor-pointer" onClick={refreshCaptcha} title="点击刷新">
            {loading ? (
                <div className="w-[100px] h-[40px] bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center animate-pulse">
                    <RefreshCw size={16} className="animate-spin text-gray-400" />
                </div>
            ) : imgSrc ? (
                <img 
                    src={imgSrc} 
                    alt="Captcha" 
                    className="w-[100px] h-[40px] rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                />
            ) : (
                <div className="w-[100px] h-[40px] bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-500">
                    加载失败
                </div>
            )}
        </div>
    );
};