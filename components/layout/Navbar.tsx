import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, ShieldAlert, ChevronDown } from 'lucide-react';
import { useStore } from '../../context/store';
import { Button, Avatar, ThemeToggle, Modal, ToastContainer, FloatingMenu, SearchModal, FullPlayerModal, AdminLoginModal, FestiveWidget } from '../ui';
import { AuthForm } from '../auth/AuthForm';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout, setSearchOpen, isAuthModalOpen, setAuthModalOpen } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminModalOpen, setAdminModalOpen] = useState(false);
  const [expandedMobileMenus, setExpandedMobileMenus] = useState<string[]>([]);
  
  // Sliding Background State
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navRefs = useRef<(HTMLAnchorElement | HTMLDivElement | null)[]>([]);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: '博客', path: '/', hasSubmenu: true, subItems: [{name: '首页', path: '/'}, {name: '起始页', path: '/start'}] },
    { name: '社区', path: '/community' },
    { name: '相册', path: '/album' },
    { name: '音乐', path: '/music' },
    { name: '工具', path: '/tools' },
    { name: '联系', path: '/contact', hasSubmenu: true, subItems: [{name: '即时聊天', path: '/contact'}, {name: '留言板', path: '/message-board'}] },
    { name: '关于', path: '/about' },
    { name: 'AI 助手', path: '/ai' },
  ];

  // Update sliding pill position
  useEffect(() => {
    const updatePill = () => {
        let targetIndex = -1;

        // Determine target: hovered item takes precedence, otherwise active item
        if (hoveredIndex !== null) {
            targetIndex = hoveredIndex;
        } else {
            // Logic to find active tab including sub-routes
            targetIndex = navLinks.findIndex(link => {
                if (link.path === location.pathname) return true;
                if (link.hasSubmenu && link.subItems?.some(sub => sub.path === location.pathname)) return true;
                return false;
            });
            
            // Default to home active only if exactly home
            if (targetIndex === -1 && location.pathname === '/') targetIndex = 0;
        }

        const targetEl = navRefs.current[targetIndex];

        if (targetEl) {
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
  }, [hoveredIndex, location.pathname, navLinks.length]);

  const toggleMobileSubmenu = (name: string) => {
      setExpandedMobileMenus(prev => 
          prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
      );
  };

  return (
    <>
      <ToastContainer />
      <SearchModal />
      <FloatingMenu />
      <FestiveWidget />
      <FullPlayerModal />
      <AdminLoginModal isOpen={isAdminModalOpen} onClose={() => setAdminModalOpen(false)} />

      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent
          ${isScrolled || isMobileMenuOpen ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-800/50 shadow-sm' : 'bg-transparent py-2'}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-2xl font-semibold tracking-tight text-black dark:text-white">iBlog</span>
            </div>

            {/* Desktop Menu with Sliding Background */}
            <div className="hidden md:flex relative space-x-1 items-center bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-full border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md">
              
              {/* The Sliding Pill */}
              <div 
                className="absolute bg-white dark:bg-gray-700 rounded-full shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                style={{ 
                    left: pillStyle.left, 
                    width: pillStyle.width, 
                    height: 'calc(100% - 8px)',
                    top: 4,
                    opacity: pillStyle.opacity 
                }}
              />

              {navLinks.map((link, index) => {
                const isActive = location.pathname === link.path || (link.hasSubmenu && link.subItems?.some(sub => sub.path === location.pathname));
                
                // Render items with submenu
                if (link.hasSubmenu) {
                    return (
                        <div
                            key={link.name}
                            ref={(el) => { navRefs.current[index] = el; }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className="relative group z-20"
                        >
                            <Link
                                to={link.path}
                                className={`
                                    relative px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 flex items-center
                                    ${isActive ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}
                                `}
                            >
                                {link.name}
                                <ChevronDown size={12} className="ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                            </Link>

                            {/* Dropdown Menu */}
                            <div className="absolute top-full left-0 pt-2 w-32 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-1 overflow-hidden">
                                    {link.subItems?.map(sub => (
                                        <Link 
                                            key={sub.name}
                                            to={sub.path} 
                                            className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                                        >
                                            {sub.name}
                                        </Link>
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
                    className={`
                        relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200
                        ${isActive ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}
                    `}
                    >
                    {link.name}
                    </Link>
                );
              })}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-400 hover:text-apple-blue transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Search className="h-5 w-5" />
              </button>

              {isLoggedIn && user ? (
                 <div className="relative group cursor-pointer" onClick={() => navigate('/profile')} title="前往个人资料">
                   <Avatar src={user.avatar} alt={user.name} size="sm" />
                 </div>
              ) : (
                <Button size="sm" onClick={() => setAuthModalOpen(true)}>
                  登录
                </Button>
              )}
              {user?.role === 'admin' && (
                  <button 
                     onClick={() => setAdminModalOpen(true)}
                     className="text-red-500 hover:text-red-600 transition-colors"
                     title="系统管理"
                  >
                      <ShieldAlert size={20}/>
                  </button>
              )}
            </div>

            <div className="md:hidden flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-apple-text dark:text-apple-dark-text hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        <div className={`md:hidden absolute w-full bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[80vh] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const isExpanded = expandedMobileMenus.includes(link.name);

              return (
              <div key={link.name}>
                  {link.hasSubmenu ? (
                      <div>
                           <button
                             onClick={() => toggleMobileSubmenu(link.name)}
                             className={`
                                w-full flex items-center justify-between px-3 py-3 rounded-xl text-base font-medium transition-all
                                ${isActive ? 'text-apple-blue font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'}
                             `}
                           >
                               <span>{link.name}</span>
                               <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                           </button>
                           {/* 移动端子菜单 Accordion */}
                           <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                               <div className="pl-4 space-y-1 mt-1 border-l-2 border-gray-100 dark:border-gray-800 ml-3">
                                   {link.subItems?.map(sub => (
                                       <Link 
                                            key={sub.name}
                                            to={sub.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-apple-blue rounded-lg"
                                        >
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
                        className={`
                          block px-3 py-3 rounded-xl text-base font-medium transition-all
                          ${isActive ? 'bg-gray-100 dark:bg-gray-800 text-apple-blue font-bold shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'}
                        `}
                      >
                        {link.name}
                      </Link>
                  )}
              </div>
            )})}
             {user?.role === 'admin' && (
                  <button 
                     onClick={() => { setIsMobileMenuOpen(false); setAdminModalOpen(true); }}
                     className="block w-full text-left px-3 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50"
                  >
                      系统后台
                  </button>
              )}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              {isLoggedIn ? (
                 <div className="flex items-center justify-between px-3">
                    <div className="flex items-center space-x-3" onClick={() => {navigate('/profile'); setIsMobileMenuOpen(false);}}>
                       <Avatar src={user?.avatar || ''} alt="User" size="sm" />
                       <span className="font-medium text-apple-text dark:text-apple-dark-text">{user?.name}</span>
                    </div>
                    <span className="text-xs text-red-500 font-medium" onClick={() => {logout(); setIsMobileMenuOpen(false);}}>登出</span>
                 </div>
              ) : (
                <Button className="w-full" onClick={() => { setAuthModalOpen(true); setIsMobileMenuOpen(false); }}>登录</Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <Modal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)}>
         <AuthForm onClose={() => setAuthModalOpen(false)} />
      </Modal>
    </>
  );
};