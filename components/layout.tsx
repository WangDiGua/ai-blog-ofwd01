import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Music, User as UserIcon, LogIn, Github, Twitter, Mail, Maximize2, RefreshCw, Bot, ShieldAlert } from 'lucide-react';
import { useStore } from '../context/store';
import { Button, Avatar, ThemeToggle, Modal, ToastContainer, FloatingMenu, SearchModal, FullPlayerModal, Captcha, AdminLoginModal } from './ui';
import { debounce, throttle } from '../utils/lib';

// --- 认证表单内容 ---
const AuthForm = ({ onClose }: { onClose: () => void }) => {
  const { login, showToast } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 验证状态
  const [captchaValid, setCaptchaValid] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [timer, setTimer] = useState(0);
  const [captchaKey, setCaptchaKey] = useState(0); // 用于强制刷新验证码
  
  // 安全限制状态
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  // 倒计时逻辑
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendCode = () => {
      if (!email) {
          showToast('请输入您的邮箱', 'error');
          return;
      }
      setTimer(60);
      showToast('验证码已发送！', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 检查是否被锁定
    if (lockoutUntil) {
        const now = Date.now();
        if (now < lockoutUntil) {
            const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
            showToast(`操作过于频繁，请 ${remainingSeconds} 秒后再试`, 'error');
            return;
        } else {
            // 锁定时间已过，重置状态
            setLockoutUntil(null);
            setFailedAttempts(0);
        }
    }

    if (!username || !password) {
        showToast('请填写所有字段', 'error');
        return;
    }
    
    // 如果验证码错误，刷新验证码并增加错误计数
    if (!captchaValid) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        
        if (newAttempts >= 5) {
            const lockTime = Date.now() + 60000; // 锁定 1 分钟
            setLockoutUntil(lockTime);
            showToast('验证码错误次数过多，请 1 分钟后再试', 'error');
        } else {
            showToast(`验证码无效，还剩 ${5 - newAttempts} 次机会`, 'error');
            setCaptchaKey(prev => prev + 1); // 强制刷新组件
        }
        return;
    }

    if (isRegister && (!email || !verificationCode)) {
        showToast('请验证您的邮箱', 'error');
        return;
    }
    
    setLoading(true);
    // 模拟 API 延迟
    try {
      await login(username);
      // 登录成功清空错误计数
      setFailedAttempts(0);
      setLockoutUntil(null);
      onClose();
    } catch(err) {
      // Toast 已在 store 中处理
    } finally {
      setLoading(false);
    }
  };

  const isLocked = lockoutUntil && Date.now() < lockoutUntil;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-apple-text dark:text-apple-dark-text">{isRegister ? '创建账户' : '欢迎回来'}</h2>
        <p className="text-sm text-apple-subtext dark:text-apple-dark-subtext">请输入您的详细信息</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
           <input 
             type="text" 
             placeholder="用户名 (尝试 'admin', 'vip')" 
             value={username}
             onChange={(e) => setUsername(e.target.value)}
             disabled={!!isLocked}
             className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text transition-all disabled:opacity-50"
           />
        </div>

        {isRegister && (
             <div className="space-y-4 animate-in slide-in-from-top-2">
                <input 
                    type="email" 
                    placeholder="邮箱地址" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!!isLocked}
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text disabled:opacity-50"
                />
                <div className="flex space-x-2">
                    <input 
                        type="text" 
                        placeholder="验证码" 
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        disabled={!!isLocked}
                        className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text disabled:opacity-50"
                    />
                    <Button 
                        type="button" 
                        variant="secondary" 
                        disabled={timer > 0 || !email || !!isLocked}
                        onClick={handleSendCode}
                        className="w-24 whitespace-nowrap text-xs"
                    >
                        {timer > 0 ? `${timer}s` : '获取验证码'}
                    </Button>
                </div>
             </div>
        )}

        <div>
           <input 
             type="password" 
             placeholder="密码" 
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             disabled={!!isLocked}
             className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text disabled:opacity-50"
           />
        </div>

        {/* 使用 key 属性强制重新渲染以刷新验证码 */}
        <div className={isLocked ? 'opacity-50 pointer-events-none' : ''}>
            <Captcha key={captchaKey} onValidate={setCaptchaValid} />
        </div>
        
        <Button type="submit" className="w-full shadow-lg shadow-blue-500/20" disabled={loading || !!isLocked}>
          {loading ? '处理中...' : (isLocked ? '已锁定 (1分钟)' : (isRegister ? '注册' : '登录'))}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-500">
        <button 
          type="button"
          onClick={() => { setIsRegister(!isRegister); setCaptchaValid(false); setFailedAttempts(0); setLockoutUntil(null); }}
          className="text-apple-blue font-semibold hover:underline"
        >
          {isRegister ? '切换到登录' : '切换到注册'}
        </button>
      </div>
    </div>
  );
};

// --- 导航栏组件 ---
export const Navbar = () => {
  const { user, isLoggedIn, logout, setSearchOpen, isAuthModalOpen, setAuthModalOpen } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminModalOpen, setAdminModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: '博客', path: '/' },
    { name: '社区', path: '/community' },
    { name: '音乐', path: '/music' },
    { name: '工具', path: '/tools' },
    { name: '联系', path: '/contact' },
    { name: '关于', path: '/about' },
    { name: 'AI 助手', path: '/ai' },
  ];

  return (
    <>
      <ToastContainer />
      <SearchModal />
      <FloatingMenu />
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

            <div className="hidden md:flex space-x-6 items-center">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) => `
                    text-sm font-medium transition-colors duration-200
                    ${isActive ? 'text-apple-blue' : 'text-apple-subtext hover:text-apple-text dark:text-apple-dark-subtext dark:hover:text-apple-dark-text'}
                  `}
                >
                  {link.name}
                </NavLink>
              ))}
              {user?.role === 'admin' && (
                  <button 
                     onClick={() => setAdminModalOpen(true)}
                     className="text-sm font-medium text-red-500 hover:text-red-600 flex items-center"
                  >
                      <ShieldAlert size={14} className="mr-1"/> 系统
                  </button>
              )}
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

        <div className={`md:hidden absolute w-full bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `
                  block px-3 py-2 rounded-lg text-base font-medium
                  ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 text-apple-blue' : 'text-apple-text dark:text-apple-dark-text hover:bg-gray-50 dark:hover:bg-gray-900'}
                `}
              >
                {link.name}
              </NavLink>
            ))}
             {user?.role === 'admin' && (
                  <button 
                     onClick={() => { setIsMobileMenuOpen(false); setAdminModalOpen(true); }}
                     className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-500 hover:bg-red-50"
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

      <div className="h-16" />
    </>
  );
};

// --- 迷你播放器 ---
export const MiniPlayer = () => {
  const { currentSong, isPlaying, togglePlay, setFullPlayerOpen, closePlayer } = useStore();
  const [progress, setProgress] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateProgress = useCallback(
    throttle(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 1));
    }, 1000),
    []
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(updateProgress, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, updateProgress]);

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl p-3 z-[40] flex items-center space-x-4 transition-all duration-500 animate-in slide-in-from-bottom-10 group">
      <div onClick={() => setFullPlayerOpen(true)} className="relative group cursor-pointer">
          <img src={currentSong.cover} alt="Cover" className="w-12 h-12 rounded-lg shadow-sm" />
          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 size={16} className="text-white"/>
          </div>
      </div>
      
      <div className="flex-1 min-w-0" onClick={() => setFullPlayerOpen(true)}>
        <h4 className="text-sm font-semibold truncate text-apple-text dark:text-apple-dark-text cursor-pointer hover:underline">{currentSong.title}</h4>
        <p className="text-xs text-apple-subtext dark:text-apple-dark-text truncate">{currentSong.artist}</p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-2">
          <div className="bg-apple-blue h-1 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
          <button 
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isPlaying ? (
               <span className="w-3 h-3 bg-apple-text dark:bg-apple-dark-text rounded-sm" /> 
            ) : (
               <Music className="w-5 h-5 text-apple-text dark:text-apple-dark-text ml-0.5" />
            )}
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); closePlayer(); }}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500"
            title="关闭播放器"
          >
            <X size={16} />
          </button>
      </div>
    </div>
  );
};

// --- 页脚组件 ---
export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"><Github className="h-6 w-6" /></a>
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"><Twitter className="h-6 w-6" /></a>
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"><Mail className="h-6 w-6" /></a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              &copy; 2025 iBlog. 基于苹果美学设计。
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};