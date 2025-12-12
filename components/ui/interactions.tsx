import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useStore, ThemeMode } from '../../context/store';
import { Button } from './atoms';
import { Modal } from './modals';
import { authApi } from '../../services/api/auth';
import { ArrowUp, Type, Coffee, Sun, Moon, Eye, CheckCircle, AlertCircle, Info, Gift, RefreshCw, CloudSun, Command, X, Cloud } from 'lucide-react';

// --- 自定义滚动条 (Global) ---
// 需求：滚动条高度为当前页面高度的 10%
export const CustomScrollbar = () => {
    const [thumbTop, setThumbTop] = useState(0);
    const [thumbHeight, setThumbHeight] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    
    // 使用 Ref 存储瞬时值，避免事件闭包问题
    const stateRef = useRef({
        startY: 0,
        startScrollTop: 0,
        thumbHeight: 0,
        availableTrackHeight: 0
    });
    
    const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const updateDimensions = useCallback(() => {
        const vh = window.innerHeight;
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;

        // 如果内容高度小于等于视口，隐藏滚动条
        if (scrollHeight <= vh) {
            setThumbHeight(0);
            return;
        }

        // 核心需求：滚动条高度占当前页高度的 10%
        const targetHeight = vh * 0.1; 
        
        // 限制最小高度，防止过小无法点击
        const finalHeight = Math.max(targetHeight, 40);
        
        setThumbHeight(finalHeight);

        // 计算位置
        // 可滚动的最大距离
        const maxScroll = scrollHeight - vh;
        // 滑块可移动的最大距离
        const maxThumbTop = vh - finalHeight;

        if (maxScroll > 0) {
            const currentTop = (scrollTop / maxScroll) * maxThumbTop;
            setThumbTop(currentTop);
            
            // 更新 ref 供拖拽使用
            stateRef.current.thumbHeight = finalHeight;
            stateRef.current.availableTrackHeight = maxThumbTop;
        }
    }, []);

    // 监听滚动与尺寸变化
    useEffect(() => {
        const handleScroll = () => {
            updateDimensions();
            setIsVisible(true);
            
            if (!stateRef.current.startY) { // 只有非拖拽状态才自动隐藏
                if (hideTimeout.current) clearTimeout(hideTimeout.current);
                hideTimeout.current = setTimeout(() => setIsVisible(false), 1500);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', updateDimensions);
        
        // 使用 ResizeObserver 监听文档高度变化 (如动态加载内容)
        const resizeObserver = new ResizeObserver(updateDimensions);
        resizeObserver.observe(document.body);

        updateDimensions();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', updateDimensions);
            resizeObserver.disconnect();
            if (hideTimeout.current) clearTimeout(hideTimeout.current);
        };
    }, [updateDimensions]);

    // 拖拽逻辑
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setIsVisible(true);
        if (hideTimeout.current) clearTimeout(hideTimeout.current);

        stateRef.current.startY = e.clientY;
        stateRef.current.startScrollTop = window.scrollY;

        const handleMouseMove = (ev: MouseEvent) => {
            const deltaY = ev.clientY - stateRef.current.startY;
            const vh = window.innerHeight;
            const scrollHeight = document.documentElement.scrollHeight;
            const maxScroll = scrollHeight - vh;
            const availableTrack = stateRef.current.availableTrackHeight;

            if (availableTrack > 0) {
                const ratio = deltaY / availableTrack;
                const scrollDelta = ratio * maxScroll;
                window.scrollTo(0, stateRef.current.startScrollTop + scrollDelta);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            stateRef.current.startY = 0; // Reset drag flag
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            
            // 恢复自动隐藏
            hideTimeout.current = setTimeout(() => setIsVisible(false), 1500);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    if (thumbHeight === 0) return null;

    return ReactDOM.createPortal(
        <div className="fixed top-0 right-0 h-full w-3 z-[9999] pointer-events-none mix-blend-difference">
            <div 
                className={`
                    absolute right-[2px] w-1.5 rounded-full bg-gray-400/80 hover:bg-gray-500/90
                    backdrop-blur-md transition-opacity duration-300 ease-out pointer-events-auto cursor-default
                    ${isVisible || isDragging ? 'opacity-100' : 'opacity-0'}
                    ${isDragging ? 'bg-gray-600/90 w-2 right-[1px]' : ''}
                `}
                style={{
                    height: `${thumbHeight}px`,
                    transform: `translateY(${thumbTop}px)`,
                    willChange: 'transform' // 性能优化
                }}
                onMouseDown={handleMouseDown}
            />
        </div>,
        document.body
    );
};

// --- 全屏主题切换遮罩动画 ---
export const ThemeTransitionOverlay = () => {
    const { isThemeAnimating, transitionStage, theme, previousTheme } = useStore();

    // 锁定滚动并处理滚动条抖动
    useEffect(() => {
        if (isThemeAnimating) {
            // 1. 计算滚动条宽度 (窗口总宽度 - 可视区域宽度)
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            
            // 2. 锁定滚动
            document.body.style.overflow = 'hidden';
            
            // 3. 如果存在滚动条，添加右内边距以填补空间，防止页面内容跳动
            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`;
                
                // 同时处理 Fixed 定位的 Navbar (假设是 <nav> 标签)
                const nav = document.querySelector('nav');
                if (nav) {
                    nav.style.paddingRight = `${scrollbarWidth}px`;
                }
            }
        } else {
            // 恢复初始状态
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            const nav = document.querySelector('nav');
            if (nav) {
                nav.style.paddingRight = '';
            }
        }
        
        // 清理函数
        return () => { 
            document.body.style.overflow = ''; 
            document.body.style.paddingRight = '';
            const nav = document.querySelector('nav');
            if (nav) {
                nav.style.paddingRight = '';
            }
        };
    }, [isThemeAnimating]);

    if (!isThemeAnimating) return null;

    // 获取背景色
    const getBgColor = (mode: ThemeMode) => {
        switch (mode) {
            case 'light': return 'bg-sky-200'; // 浅色背景
            case 'dark': return 'bg-slate-900'; // 深色背景
            case 'eye': return 'bg-[#f3ebd6]'; // 护眼背景 (暖色)
            default: return 'bg-sky-200';
        }
    };

    // 背景色过渡: 下落阶段使用旧主题色，升起阶段使用新主题色
    const containerClass = transitionStage === 'setting' ? getBgColor(previousTheme) : getBgColor(theme);

    // 渲染天体 (太阳/月亮)
    const CelestialBody = ({ type, position }: { type: ThemeMode, position: 'center' | 'bottom' | 'hidden' }) => {
        let Icon = Sun;
        let colorClass = "text-yellow-500 fill-yellow-500 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]";
        let bgGlow = "bg-yellow-400/20";

        if (type === 'dark') {
            Icon = Moon;
            colorClass = "text-gray-200 fill-gray-200 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]";
            bgGlow = "bg-white/10";
        } else if (type === 'eye') {
            Icon = Eye; 
            colorClass = "text-green-600 fill-green-100 drop-shadow-[0_0_30px_rgba(74,222,128,0.4)]";
            bgGlow = "bg-green-400/20";
        }

        // 位置样式
        let posStyle = {};
        if (position === 'center') {
            posStyle = { top: '50%', transform: 'translate(-50%, -50%)', opacity: 1 };
        } else if (position === 'bottom') {
            posStyle = { top: '120%', transform: 'translate(-50%, 0)', opacity: 1 }; // 沉入底部
        } else {
            posStyle = { top: '120%', transform: 'translate(-50%, 0)', opacity: 0 }; // 初始隐藏
        }

        return (
            <div 
                className={`absolute left-1/2 transition-all duration-[1500ms] ease-in-out z-20`}
                style={posStyle}
            >
                <div className={`w-32 h-32 md:w-64 md:h-64 rounded-full flex items-center justify-center ${bgGlow} backdrop-blur-sm`}>
                    <Icon size={80} className={`md:w-40 md:h-40 ${colorClass}`} />
                </div>
            </div>
        );
    };

    return ReactDOM.createPortal(
        <div className={`fixed inset-0 z-[10000] pointer-events-auto transition-colors duration-[1500ms] ease-in-out ${containerClass} flex items-center justify-center overflow-hidden`}>
            {/* 装饰云层 */}
            <div className={`absolute top-20 left-20 text-white/20 transition-transform duration-[3000ms] ${transitionStage === 'setting' ? '-translate-x-10' : 'translate-x-10'}`}>
                <Cloud size={120} fill="currentColor" />
            </div>
            <div className={`absolute bottom-40 right-20 text-white/10 transition-transform duration-[3000ms] ${transitionStage === 'setting' ? 'translate-x-10' : '-translate-x-10'}`}>
                <Cloud size={180} fill="currentColor" />
            </div>

            {/* 旧天体 (负责下落) */}
            <CelestialBody 
                type={previousTheme} 
                position={transitionStage === 'setting' ? 'bottom' : 'hidden'} 
            />

            {/* 新天体 (负责升起) */}
            <CelestialBody 
                type={theme} 
                position={transitionStage === 'rising' ? 'center' : 'bottom'} 
            />
            
            {/* 文字提示 */}
            <div className="absolute bottom-10 text-center w-full transition-opacity duration-500 opacity-50 text-apple-text dark:text-white font-mono text-sm tracking-widest uppercase">
                {transitionStage === 'setting' ? 'Switching Theme...' : 'Almost there...'}
            </div>
        </div>,
        document.body
    );
};

// --- 动画主题切换按钮 (简化版) ---
export const ThemeToggle = () => {
  const { theme, toggleTheme, isThemeAnimating } = useStore();

  return (
    <button
      onClick={toggleTheme}
      disabled={isThemeAnimating}
      className="relative w-10 h-10 rounded-full overflow-hidden focus:outline-none transition-colors duration-500 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="切换主题"
      title={`当前模式: ${theme === 'dark' ? '深色' : theme === 'eye' ? '护眼' : '浅色'}`}
    >
       <div className="absolute inset-0 flex items-center justify-center">
          {theme === 'light' && <Sun className="text-orange-500 fill-orange-500 animate-in zoom-in duration-300" size={24} />}
          {theme === 'dark' && <Moon className="text-yellow-300 fill-yellow-300 animate-in zoom-in duration-300" size={24} />}
          {theme === 'eye' && <Eye className="text-green-600 fill-green-100 animate-in zoom-in duration-300" size={24} />}
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
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[50000] space-y-2 pointer-events-none">
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
    const { cycleFontSize, showFestive, toggleFestive, cycleSeasonMode, seasonMode, currentSong } = useStore();
    const [showDonate, setShowDonate] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // 监听滚动事件：计算进度和显示状态
    useEffect(() => {
        const handleScroll = () => {
            // 使用 window.scrollY 或 document.documentElement.scrollTop 兼容性更好
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight; // 使用 window.innerHeight 更准确反映视口
            
            // 可滚动的最大高度
            const maxScroll = scrollHeight - clientHeight;
            
            // 计算进度 (防止除以0或负数)
            const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
            
            setScrollProgress(Math.min(100, Math.max(0, progress)));
            setShowScrollTop(scrollTop > 300);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll); // 窗口大小改变时重新计算
        
        handleScroll(); // 初始化调用，确保初始状态正确

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        { icon: Coffee, action: () => setShowDonate(true), label: "打赏", color: "text-pink-500" },
        { icon: Type, action: cycleFontSize, label: "调整字号", color: "text-gray-600 dark:text-gray-300" },
        ...(showFestive ? [{ icon: CloudSun, action: cycleSeasonMode, label: `季节: ${seasonMode}`, color: getSeasonIconColor() }] : []),
        { icon: Gift, action: toggleFestive, label: "节日氛围", color: showFestive ? 'text-red-500' : 'text-gray-600 dark:text-gray-300' },
    ];

    // 计算圆环属性
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    // 进度为0时 offset应为circumference(全空)，进度100时offset为0(全满)
    const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

    return ReactDOM.createPortal(
        <>
            {/* 动态调整 bottom 位置 */}
            <div className={`fixed right-6 z-[90] flex items-end transition-all duration-500 ease-in-out ${currentSong ? 'bottom-28' : 'bottom-10'}`}>
                
                {/* 独立的返回顶部按钮 (在菜单左侧) */}
                <button
                    onClick={scrollToTop}
                    className={`
                        mr-4 w-12 h-12 rounded-full flex items-center justify-center bg-white/80 dark:bg-black/60 backdrop-blur-xl shadow-lg border border-gray-100 dark:border-gray-700
                        transition-all duration-500 ease-out group overflow-hidden relative
                        ${showScrollTop ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'}
                    `}
                    title="回到顶部"
                >
                    {/* 进度圆环 SVG */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 48 48">
                        <circle
                            cx="24" cy="24" r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                            cx="24" cy="24" r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="text-apple-blue transition-all duration-300 ease-out"
                        />
                    </svg>

                    {/* 内容: 默认显示百分比，悬浮显示箭头 */}
                    <span className="text-[10px] font-bold text-apple-blue group-hover:opacity-0 transition-opacity duration-200 absolute">
                        {Math.round(scrollProgress)}%
                    </span>
                    <ArrowUp 
                        size={20} 
                        className="text-apple-blue opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 absolute" 
                    />
                </button>

                {/* 菜单部分 */}
                <div className="flex flex-col items-center">
                    {/* 菜单项容器 */}
                    <div className={`flex flex-col-reverse items-center space-y-reverse space-y-4 mb-4 absolute bottom-full pb-4 right-1`}>
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

                    {/* 主触发按钮 */}
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