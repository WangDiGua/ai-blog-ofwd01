import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Music, Maximize2, ShieldAlert, ArrowUp, Coffee, Type, Gift, Plus, Github, Twitter, Mail } from 'lucide-react';
import { useStore } from '../context/store';
import { Button, Avatar, ThemeToggle, Modal, ToastContainer, FloatingMenu, SearchModal, FullPlayerModal, Captcha, AdminLoginModal, FestiveWidget } from './ui';
import { debounce, throttle } from '../utils/lib';
import { authApi } from '../services/api/auth';

// --- 认证表单内容 ---
const AuthForm = ({ onClose }: { onClose: () => void }) => {
  const { login, showToast } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 密码强度状态
  const [pwdStrength, setPwdStrength] = useState(0); // 0-4
  
  // 验证码状态
  const [captchaCode, setCaptchaCode] = useState(''); // 用户输入的验证码
  const [captchaKey, setCaptchaKey] = useState('');   // 后端返回的验证码ID
  const [verificationCode, setVerificationCode] = useState(''); // 邮件验证码
  const [timer, setTimer] = useState(0);
  
  // 安全限制状态 (本地简单限制，主要依赖后端)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  // 倒计时逻辑
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // 计算密码强度
  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Za-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setPassword(val);
      if (isRegister) {
          setPwdStrength(calculatePasswordStrength(val));
      }
  };

  const handleSendCode = async () => {
      if (!email) {
          showToast('请输入您的邮箱', 'error');
          return;
      }
      if (!email.endsWith('@qq.com')) {
          showToast('仅支持发送验证码到 QQ 邮箱', 'error');
          return;
      }
      
      try {
          // 调用后端真实发送接口
          await authApi.sendVerifyCode(email);
          setTimer(60);
          showToast('验证码已发送至您的邮箱！', 'success');
      } catch (e: any) {
          showToast(e.message || '发送失败，请稍后重试', 'error');
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 检查本地锁定
    if (lockoutUntil) {
        const now = Date.now();
        if (now < lockoutUntil) {
            const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
            showToast(`操作过于频繁，请 ${remainingSeconds} 秒后再试`, 'error');
            return;
        } else {
            setLockoutUntil(null);
        }
    }

    if (!username || !password) {
        showToast('请填写所有字段', 'error');
        return;
    }

    // 注册逻辑
    if (isRegister) {
        if (!email || !verificationCode) {
            showToast('请填写邮箱和验证码', 'error');
            return;
        }
        if (pwdStrength < 3) {
             showToast('密码强度不足：需至少8位，且包含字母和数字', 'error');
             return;
        }

        setLoading(true);
        try {
            await authApi.register({
                username, 
                email, 
                password, 
                code: verificationCode // 邮件验证码
            });
            showToast('注册成功，请登录', 'success');
            setIsRegister(false); // 切换回登录页
        } catch (err: any) {
            showToast(err.message || '注册失败', 'error');
        } finally {
            setLoading(false);
        }
    } 
    // 登录逻辑
    else {
        if (!captchaCode) {
            showToast('请输入图形验证码', 'error');
            return;
        }

        setLoading(true);
        try {
            // 调用 store 中的 login 方法，该方法会调用 authApi.login
            // 我们需要临时扩展 login 方法或直接在此处调用 API 并处理 Token
            // 这里为了保持 store 状态同步，我们假设 store.login 已经更新为接受额外参数，
            // 或者我们在这里调用 API，然后手动更新 store。
            // 为了简单起见，我们修改 store.login 的签名比较麻烦，直接在这里调用 API
            
            const userData = await authApi.login({ 
                username, 
                password, 
                captchaKey, 
                captchaCode 
            });
            
            // 登录成功，将 Token 存入 localStorage (Client.ts 会自动读取)
            if (userData.token) {
                localStorage.setItem('token', userData.token);
            }
            
            // 此时我们需要手动更新 Store 中的 User 状态
            // 由于 store.login 原本逻辑比较简单，我们这里重新加载页面或调用一个 store 方法来设置 User
            // 为了不修改 context 签名太多，我们直接刷新页面，或者利用 store.login(username) 的副作用(如果它重新获取profile的话)
            // 最佳实践：更新 store.login 支持真实登录。这里我们采用简易方案：
            // 直接调用 store 的 login 逻辑(如果它支持)
            
            // 既然已经在 layout 中，我们假设 AppProvider 的 login 方法会处理用户信息获取
            // 我们可以在 store 中修改 login 实现，或者在这里刷新。
            // 让我们在 Context/Store 中做正确的实现，这里我们先重载页面
            
            window.location.reload(); 
            // 实际上 store.login 应该被重写为接受 (username, password...)
            
            onClose();
        } catch(err: any) {
            showToast(err.message || '登录失败', 'error');
            // 登录失败通常需要刷新验证码
            // 触发 Captcha 组件刷新 (由于是子组件，可以通过 key 强制刷新，或者让用户手动点)
            setCaptchaCode('');
        } finally {
            setLoading(false);
        }
    }
  };

  const isLocked = lockoutUntil && Date.now() < lockoutUntil;

  // 获取强度对应的颜色和文本
  const getStrengthMeta = () => {
      if (password.length === 0) return { color: 'bg-gray-200', text: '' };
      if (password.length < 8) return { color: 'bg-red-500', text: '太短' };
      
      switch (pwdStrength) {
          case 1: 
          case 2: return { color: 'bg-red-500', text: '弱' };
          case 3: return { color: 'bg-yellow-500', text: '中' };
          case 4: return { color: 'bg-green-500', text: '强' };
          default: return { color: 'bg-gray-200', text: '' };
      }
  };
  
  const strengthMeta = getStrengthMeta();

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
             placeholder="用户名" 
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
                    placeholder="邮箱地址 (仅限 QQ 邮箱)" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!!isLocked}
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text disabled:opacity-50"
                />
                <div className="flex space-x-2">
                    <input 
                        type="text" 
                        placeholder="邮件验证码" 
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
                        {timer > 0 ? `${timer}s` : '获取'}
                    </Button>
                </div>
             </div>
        )}

        <div>
           <input 
             type="password" 
             placeholder={isRegister ? "密码 (至少8位, 含字母数字)" : "密码"} 
             value={password}
             onChange={handlePasswordChange}
             disabled={!!isLocked}
             className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text disabled:opacity-50"
           />
           {/* 密码强度可视化 */}
           {isRegister && password.length > 0 && (
               <div className="mt-2 flex items-center space-x-2 animate-in fade-in slide-in-from-top-1">
                   <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                       <div 
                           className={`h-full transition-all duration-300 ${strengthMeta.color}`} 
                           style={{ width: `${Math.min((pwdStrength / 4) * 100, 100)}%` }}
                       />
                   </div>
                   <span className={`text-xs font-medium ${strengthMeta.color.replace('bg-', 'text-')}`}>
                       {strengthMeta.text}
                   </span>
               </div>
           )}
        </div>

        {/* 登录时显示图形验证码 */}
        {!isRegister && (
            <div className="flex space-x-2 animate-in fade-in">
                <input 
                    type="text" 
                    placeholder="验证码" 
                    value={captchaCode}
                    onChange={(e) => setCaptchaCode(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text"
                />
                {/* 传递回调函数以获取后端返回的 Key */}
                <Captcha onRefresh={(key) => setCaptchaKey(key)} />
            </div>
        )}
        
        <Button type="submit" className="w-full shadow-lg shadow-blue-500/20" disabled={loading || !!isLocked}>
          {loading ? '处理中...' : (isLocked ? '已锁定 (1分钟)' : (isRegister ? '注册' : '登录'))}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-500">
        <button 
          type="button"
          onClick={() => { 
              setIsRegister(!isRegister); 
              setCaptchaCode('');
              setPassword(''); 
              setPwdStrength(0); 
              setLockoutUntil(null);
          }}
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
  
  // Sliding Background State
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  
  const navigate = useNavigate();
  const location = useLocation();

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

  // Update sliding pill position
  useEffect(() => {
    const updatePill = () => {
        let targetIndex = -1;

        // Determine target: hovered item takes precedence, otherwise active item
        if (hoveredIndex !== null) {
            targetIndex = hoveredIndex;
        } else {
            targetIndex = navLinks.findIndex(link => link.path === location.pathname);
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

              {navLinks.map((link, index) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  ref={(el) => { navRefs.current[index] = el; }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={({ isActive }) => `
                    relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200
                    ${isActive ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}
                  `}
                >
                  {link.name}
                </NavLink>
              ))}
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

        <div className={`md:hidden absolute w-full bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `
                  block px-3 py-3 rounded-xl text-base font-medium transition-all
                  ${isActive ? 'bg-gray-100 dark:bg-gray-800 text-apple-blue font-bold shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'}
                `}
              >
                {link.name}
              </NavLink>
            ))}
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