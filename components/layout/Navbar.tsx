import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, ShieldAlert, ChevronDown, Sparkles, Layout } from 'lucide-react';
import { useStore } from '../../context/store';
import { Button, Avatar, ThemeToggle, AdminLoginModal, LiquidLogo } from '../ui';
import { throttle } from '../../utils/lib';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout, setSearchOpen, setAuthModalOpen } = useStore();
  
  // 状态管理
  const [isCompact, setIsCompact] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminModalOpen, setAdminModalOpen] = useState(false);
  const [expandedMobileMenus, setExpandedMobileMenus] = useState<string[]>([]);
  const [pageTitle, setPageTitle] = useState('Sweet Potato');
  
  // Ref 记录滚动位置
  const lastScrollY = useRef(0);

  // Sliding Background State (Pill)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navRefs = useRef<(HTMLAnchorElement | HTMLDivElement | null)[]>([]);

  // --- 路由标题映射 ---
  useEffect(() => {
      const getPageContext = (pathname: string) => {
          if (pathname === '/' || pathname === '/start') return '探索首页';
          if (pathname.startsWith('/article/')) return '深度阅读';
          if (pathname === '/categories') return '知识分类';
          if (pathname === '/timeline') return '时光轴';
          if (pathname.startsWith('/user/') || pathname === '/profile') return '个人中心';
          if (pathname === '/community') return '社区互动';
          if (pathname === '/music') return '聆听音乐';
          if (pathname === '/album') return '光影画廊';
          if (pathname === '/tools') return '开发者工具';
          if (pathname === '/contact') return '即时通讯';
          if (pathname === '/friend-links') return '友情链接';
          if (pathname === '/message-board') return '留言板';
          if (pathname === '/ai') return 'AI 助手';
          if (pathname === '/about') return '关于我';
          return 'Sweet Potato';
      };
      setPageTitle(getPageContext(location.pathname));
  }, [location.pathname]);
  
  // --- 核心逻辑: 滚动监听 ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;
      
      if (isMobileMenuOpen) {
          setIsCompact(false);
          return;
      }

      // 1. 在顶部区域始终展开
      if (currentScrollY < 60) {
          setIsCompact(false);
      } 
      // 2. 向下滚动且不在顶部 -> 收缩
      else if (delta > 0 && currentScrollY > 100) {
          setIsCompact(true);
      } 
      // 3. 向上滚动超过阈值 (防止微小抖动触发) -> 展开
      else if (delta < -10) {
          setIsCompact(false);
      }

      lastScrollY.current = currentScrollY;
    };

    // 使用较短的 throttle 时间保证响应速度
    const throttledScroll = throttle(handleScroll, 50);
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [isMobileMenuOpen]);

  const navLinks = [
    { 
      name: '博客', 
      path: '/', 
      hasSubmenu: true, 
      subItems: [
        {name: '首页', path: '/'}, 
        {name: '文章分类', path: '/categories'}, 
        {name: '时间线', path: '/timeline'},
        {name: '起始页', path: '/start'}
      ] 
    },
    { name: '社区', path: '/community' },
    { name: '相册', path: '/album' },
    { name: '音乐', path: '/music' },
    { name: '工具', path: '/tools' },
    { 
      name: '联系', 
      path: '/contact', 
      hasSubmenu: true, 
      subItems: [
        {name: '即时聊天', path: '/contact'}, 
        {name: '留言板', path: '/message-board'},
        {name: '友情链接', path: '/friend-links'}
      ] 
    },
    { name: '关于', path: '/about' },
    { name: 'AI', path: '/ai' },
  ];

  // Update sliding pill position
  useEffect(() => {
    const updatePill = () => {
        let targetIndex = -1;
        if (hoveredIndex !== null) {
            targetIndex = hoveredIndex;
        } else {
            targetIndex = navLinks.findIndex(link => {
                if (link.path === location.pathname) return true;
                if (link.hasSubmenu && link.subItems?.some(sub => sub.path === location.pathname)) return true;
                return false;
            });
            if (targetIndex === -1 && location.pathname === '/') targetIndex = 0;
        }

        const targetEl = navRefs.current[targetIndex];
        if (targetEl && !isCompact) { 
            setPillStyle({
                left: targetEl.offsetLeft,
                width: targetEl.offsetWidth,
                opacity: 1
            });
        } else {
            setPillStyle(prev => ({ ...prev, opacity: 0 }));
        }
    };

    updatePill();
    window.addEventListener('resize', updatePill);
    return () => window.removeEventListener('resize', updatePill);
  }, [hoveredIndex, location.pathname, navLinks.length, isCompact]);

  const toggleMobileSubmenu = (name: string) => {
      setExpandedMobileMenus(prev => 
          prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
      );
  };

  return (
    <>
      <AdminLoginModal isOpen={isAdminModalOpen} onClose={() => setAdminModalOpen(false)} />

      {/* 
          Navbar Container 
          - 使用 fixed + transform: translate-x-1/2 居中，避免 width 变化时的布局抖动
          - 宽度过渡使用 cubic-bezier(0.32, 0.72, 0, 1) 实现 iOS 风格的平滑感
          - 使用 transition-all 确保所有属性平滑过渡
          - 移除 max-w 限制，直接使用 width 属性在不同断点切换
      */}
      <nav 
        className={`
          fixed z-50 left-1/2 -translate-x-1/2 
          transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isCompact 
            ? 'top-4 w-[92%] md:w-[800px] rounded-full bg-white/90 dark:bg-gray-900/90 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl' 
            : 'top-0 w-full rounded-none bg-white/80 dark:bg-black/80 shadow-sm border-b border-gray-200/50 dark:border-gray-800/50 backdrop-blur-md'
          }
        `}
      >
        <div className={`mx-auto h-14 md:h-16 relative flex items-center justify-between transition-all duration-500 ${isCompact ? 'px-4' : 'px-4 sm:px-6 lg:px-8 w-full max-w-7xl'}`}>
            
            {/* Left: Logo */}
            {/* 修复：移动端收缩模式下隐藏 Logo，防止与中间标题重叠 */}
            <div 
                className={`
                    flex-shrink-0 flex items-center cursor-pointer z-20 transition-opacity duration-300
                    ${isCompact ? 'opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto' : 'opacity-100'}
                `} 
                onClick={() => navigate('/')}
            >
                {/* 缩放 Logo 而不是改变其布局空间 */}
                <div className={`transition-all duration-500 origin-left ${isCompact ? 'scale-75' : 'scale-100'}`}>
                    <LiquidLogo />
                </div>
            </div>

            {/* Center Zone: 叠加布局，避免布局挤压 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                
                {/* 1. Page Title (Compact Mode Only) */}
                <div 
                    className={`
                        absolute whitespace-nowrap flex items-center
                        transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                        ${isCompact 
                            ? 'opacity-100 translate-y-0 scale-100 delay-100' 
                            : 'opacity-0 translate-y-4 scale-90 pointer-events-none'}
                    `}
                >
                    <span className="text-sm font-bold text-apple-text dark:text-apple-dark-text tracking-wide flex items-center bg-gray-100/80 dark:bg-gray-800/80 px-4 py-1.5 rounded-full backdrop-blur-md">
                        <Sparkles size={12} className="mr-2 text-apple-blue" />
                        {pageTitle}
                    </span>
                </div>

                {/* 2. Navigation Links (Full Mode Only) */}
                <div 
                    className={`
                        hidden md:flex relative items-center
                        transition-all duration-300 ease-out
                        ${isCompact ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'}
                    `}
                >
                    {/* Sliding Pill Background */}
                    <div 
                        className="absolute bg-gray-100 dark:bg-gray-800 rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                        style={{ 
                            left: pillStyle.left, 
                            width: pillStyle.width, 
                            height: '80%',
                            top: '10%',
                            opacity: pillStyle.opacity 
                        }}
                    />
                    
                    {navLinks.map((link, index) => {
                        const isActive = location.pathname === link.path || (link.hasSubmenu && link.subItems?.some(sub => sub.path === location.pathname));
                        if (link.hasSubmenu) {
                            return (
                                <div
                                    key={link.name}
                                    ref={(el) => { navRefs.current[index] = el; }}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    className="relative group z-10"
                                >
                                    <Link
                                        to={link.path}
                                        className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 flex items-center ${isActive ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                                    >
                                        {link.name}
                                        <ChevronDown size={10} className="ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                    {/* Dropdown */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-36 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                                        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-1.5 overflow-hidden ring-1 ring-black/5">
                                            {link.subItems?.map(sub => (
                                                <Link key={sub.name} to={sub.path} className="block px-3 py-2 text-xs font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-apple-blue transition-colors text-center">{sub.name}</Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                ref={(el) => { navRefs.current[index] = el; }}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className={`relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${isActive ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2 md:space-x-3 z-20">
              <div className={`transition-all duration-300 ${isCompact ? 'scale-90' : 'scale-100'} hidden md:block`}>
                  <ThemeToggle />
              </div>
              <button 
                onClick={() => setSearchOpen(true)}
                className={`
                    p-2 text-gray-500 hover:text-apple-blue transition-all rounded-full hover:bg-gray-100 dark:hover:bg-gray-800
                    ${isCompact ? 'scale-90' : 'scale-100'}
                `}
              >
                <Search className="h-5 w-5" />
              </button>

              {isLoggedIn && user ? (
                 <div className={`relative group cursor-pointer transition-all duration-300 ${isCompact ? 'scale-90' : 'scale-100'}`} onClick={() => navigate('/profile')} title="个人资料">
                   <Avatar src={user.avatar} alt={user.name} size="sm" />
                 </div>
              ) : (
                <Button size="sm" onClick={() => setAuthModalOpen(true)} className={`transition-all duration-300 ${isCompact ? 'px-3 py-1 text-xs h-8' : ''}`}>
                  登录
                </Button>
              )}
              
              {user?.role === 'admin' && !isCompact && (
                  <button onClick={() => setAdminModalOpen(true)} className="text-red-500 hover:text-red-600 hidden md:block" title="系统管理">
                      <ShieldAlert size={18}/>
                  </button>
              )}

              {/* Mobile Menu Toggle */}
              <div className="md:hidden flex items-center">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-full text-apple-text dark:text-apple-dark-text hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
                  >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </button>
              </div>
            </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[85vh] opacity-100 overflow-y-auto shadow-2xl' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="px-4 pt-2 pb-8 space-y-1">
            <div className="flex justify-between items-center px-3 pb-4 pt-2 border-b border-gray-100 dark:border-gray-800 mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Navigation</span>
                <ThemeToggle />
            </div>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const isExpanded = expandedMobileMenus.includes(link.name);
              return (
              <div key={link.name}>
                  {link.hasSubmenu ? (
                      <div className="rounded-xl overflow-hidden">
                           <button
                             onClick={() => toggleMobileSubmenu(link.name)}
                             className={`w-full flex items-center justify-between px-4 py-3.5 text-base font-medium transition-all ${isActive ? 'text-apple-blue font-bold bg-blue-50 dark:bg-blue-900/10' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                           >
                               <span>{link.name}</span>
                               <ChevronDown size={16} className={`transition-transform duration-300 text-gray-400 ${isExpanded ? 'rotate-180' : ''}`} />
                           </button>
                           <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                               <div className="bg-gray-50 dark:bg-gray-900/50 py-2 space-y-1">
                                   {link.subItems?.map(sub => (
                                       <Link key={sub.name} to={sub.path} onClick={() => setIsMobileMenuOpen(false)} className="block px-8 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-apple-blue dark:hover:text-white transition-colors">
                                            {sub.name}
                                        </Link>
                                   ))}
                               </div>
                           </div>
                      </div>
                  ) : (
                      <Link
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block px-4 py-3.5 rounded-xl text-base font-medium transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-900/10 text-apple-blue font-bold' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                      >
                        {link.name}
                      </Link>
                  )}
              </div>
            )})}
             {user?.role === 'admin' && (
                  <button onClick={() => { setIsMobileMenuOpen(false); setAdminModalOpen(true); }} className="block w-full text-left px-4 py-3.5 rounded-xl text-base font-medium text-red-500 hover:bg-red-50 mt-2">系统后台</button>
              )}
            <div className="pt-6 mt-4 border-t border-gray-100 dark:border-gray-800">
              {isLoggedIn ? (
                 <div className="flex items-center justify-between px-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4">
                    <div className="flex items-center space-x-3" onClick={() => {navigate('/profile'); setIsMobileMenuOpen(false);}}>
                       <Avatar src={user?.avatar || ''} alt="User" size="sm" />
                       <div className="flex flex-col">
                           <span className="font-bold text-sm text-apple-text dark:text-apple-dark-text">{user?.name}</span>
                           <span className="text-xs text-gray-400">{user?.email || '已登录用户'}</span>
                       </div>
                    </div>
                    <button className="text-xs text-red-500 font-medium px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg" onClick={() => {logout(); setIsMobileMenuOpen(false);}}>登出</button>
                 </div>
              ) : (
                <Button className="w-full h-12 text-base shadow-lg shadow-blue-500/20" onClick={() => { setAuthModalOpen(true); setIsMobileMenuOpen(false); }}>立即登录</Button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};