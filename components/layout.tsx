import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Music, User as UserIcon, LogIn, Github, Twitter, Mail, Maximize2, RefreshCw, Bot } from 'lucide-react';
import { useStore } from '../context/store';
import { Button, Avatar, ThemeToggle, Modal, ToastContainer, FloatingMenu, SearchModal, FullPlayerModal, Captcha } from './ui';
import { debounce, throttle } from '../utils/lib';

// --- Auth Modal Content ---
const AuthForm = ({ onClose }: { onClose: () => void }) => {
  const { login, showToast } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Validation State
  const [captchaValid, setCaptchaValid] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [timer, setTimer] = useState(0);

  // Countdown timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendCode = () => {
      if (!email) {
          showToast('Please enter your email', 'error');
          return;
      }
      setCodeSent(true);
      setTimer(60);
      showToast('Verification code sent!', 'success');
      // In real app, call API here
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    if (!captchaValid) {
        showToast('Invalid Captcha', 'error');
        return;
    }

    if (isRegister && (!email || !verificationCode)) {
        showToast('Please verify your email', 'error');
        return;
    }
    
    setLoading(true);
    // Simulate API delay
    try {
      await login(username);
      onClose();
    } catch(err) {
      // Toast handled in store
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = (provider: string) => {
      showToast(`${provider} login not implemented in demo`, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-apple-text dark:text-apple-dark-text">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="text-sm text-apple-subtext dark:text-apple-dark-subtext">Enter your details below</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
           <input 
             type="text" 
             placeholder="Username (Try 'vip' for VIP role)" 
             value={username}
             onChange={(e) => setUsername(e.target.value)}
             className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text transition-all"
           />
        </div>

        {isRegister && (
             <div className="space-y-4 animate-in slide-in-from-top-2">
                <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text"
                />
                <div className="flex space-x-2">
                    <input 
                        type="text" 
                        placeholder="Email Code" 
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text"
                    />
                    <Button 
                        type="button" 
                        variant="secondary" 
                        disabled={timer > 0 || !email}
                        onClick={handleSendCode}
                        className="w-24 whitespace-nowrap text-xs"
                    >
                        {timer > 0 ? `${timer}s` : 'Get Code'}
                    </Button>
                </div>
             </div>
        )}

        <div>
           <input 
             type="password" 
             placeholder="Password" 
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text"
           />
        </div>

        {/* Captcha */}
        <Captcha onValidate={setCaptchaValid} />
        
        <Button type="submit" className="w-full shadow-lg shadow-blue-500/20" disabled={loading}>
          {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Sign In')}
        </Button>
      </form>

      <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-apple-dark-card text-gray-500">Or continue with</span>
          </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
          <button onClick={() => socialLogin('Github')} className="flex items-center justify-center p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><Github size={20}/></button>
          <button onClick={() => socialLogin('WeChat')} className="flex items-center justify-center p-2 rounded-full bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-green-600"><span className="font-bold text-xs">WeChat</span></button>
          <button onClick={() => socialLogin('QQ')} className="flex items-center justify-center p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-500"><span className="font-bold text-xs">QQ</span></button>
          <button onClick={() => socialLogin('Gitee')} className="flex items-center justify-center p-2 rounded-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-500"><span className="font-bold text-xs">Gitee</span></button>
      </div>

      <div className="text-center text-sm text-gray-500">
        {isRegister ? "Already have an account? " : "Don't have an account? "}
        <button 
          type="button"
          onClick={() => { setIsRegister(!isRegister); setCaptchaValid(false); }}
          className="text-apple-blue font-semibold hover:underline"
        >
          {isRegister ? 'Sign In' : 'Sign Up'}
        </button>
      </div>
    </div>
  );
};

// --- Navbar Component ---
export const Navbar = () => {
  const { user, isLoggedIn, logout, setSearchOpen, isAuthModalOpen, setAuthModalOpen } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Blog', path: '/' },
    { name: 'Community', path: '/community' },
    { name: 'Music', path: '/music' },
    { name: 'Tools', path: '/tools' },
    { name: 'About', path: '/about' },
    { name: 'AI Assistant', path: '/ai' },
  ];

  return (
    <>
      <ToastContainer />
      <SearchModal />
      <FloatingMenu />
      <FullPlayerModal />

      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent
          ${isScrolled || isMobileMenuOpen ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-800/50 shadow-sm' : 'bg-transparent py-2'}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-2xl font-semibold tracking-tight text-black dark:text-white">iBlog</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8 items-center">
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
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center space-x-4">
              
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Search Trigger */}
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-400 hover:text-apple-blue transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Search className="h-5 w-5" />
              </button>

              {isLoggedIn && user ? (
                 <div className="relative group cursor-pointer" onClick={() => navigate('/profile')} title="Go to Profile">
                   <Avatar src={user.avatar} alt={user.name} size="sm" />
                 </div>
              ) : (
                <Button size="sm" onClick={() => setAuthModalOpen(true)}>
                  Login
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              <button onClick={() => setSearchOpen(true)} className="text-gray-400"><Search className="h-5 w-5" /></button>
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

        {/* Mobile Menu */}
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
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              {isLoggedIn ? (
                 <div className="flex items-center justify-between px-3">
                    <div className="flex items-center space-x-3" onClick={() => {navigate('/profile'); setIsMobileMenuOpen(false);}}>
                       <Avatar src={user?.avatar || ''} alt="User" size="sm" />
                       <span className="font-medium text-apple-text dark:text-apple-dark-text">{user?.name}</span>
                    </div>
                    <span className="text-xs text-red-500 font-medium" onClick={() => {logout(); setIsMobileMenuOpen(false);}}>Log out</span>
                 </div>
              ) : (
                <Button className="w-full" onClick={() => { setAuthModalOpen(true); setIsMobileMenuOpen(false); }}>Sign In</Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <Modal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)}>
         <AuthForm onClose={() => setAuthModalOpen(false)} />
      </Modal>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
};

// --- Mini Player ---
export const MiniPlayer = () => {
  const { currentSong, isPlaying, togglePlay, setFullPlayerOpen } = useStore();
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
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl p-3 z-[40] flex items-center space-x-4 transition-all duration-500 animate-in slide-in-from-bottom-10">
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
    </div>
  );
};

// --- Footer Component ---
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
              &copy; 2025 iBlog. Designed with Apple Aesthetics.
            </p>
            <div className="mt-2 text-center text-xs text-gray-400 dark:text-gray-600 space-x-4">
              <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300">Privacy Policy</a>
              <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
