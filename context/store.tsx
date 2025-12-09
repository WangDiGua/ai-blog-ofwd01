import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode, useCallback } from 'react';
import { User, Song, ToastMessage, ToastType } from '../types';
import { userApi, aiApi } from '../services/api';

export type SeasonMode = 'auto' | 'spring' | 'summer' | 'autumn' | 'winter';

interface AppState {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  logout: () => void;
  incrementAiUsage: () => Promise<void>;
  
  // 认证模态框
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  requireAuth: (callback: () => void) => void;

  // 音乐播放器状态
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  closePlayer: () => void;
  isFullPlayerOpen: boolean;
  setFullPlayerOpen: (open: boolean) => void;
  
  // 主题与 UI
  darkMode: boolean;
  toggleTheme: () => void;
  fontSize: number; 
  cycleFontSize: () => void;
  
  // 节日与季节
  showFestive: boolean; 
  toggleFestive: () => void;
  seasonMode: SeasonMode;
  cycleSeasonMode: () => void;

  // 搜索模态框
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // 提示消息
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullPlayerOpen, setFullPlayerOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  
  // 节日与季节状态
  const [showFestive, setShowFestive] = useState(false);
  const [seasonMode, setSeasonMode] = useState<SeasonMode>('auto');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // 从本地存储或首选项初始化深色模式
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // 应用主题
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // 应用字体大小
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`; // 100% = 16px
  }, [fontSize]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const login = async (username: string) => {
    try {
        const userData = await userApi.login(username);
        setUser(userData);
        showToast(`欢迎回来，${userData.name}！`, 'success');
    } catch (e) {
        showToast('登录失败，请重试。', 'error');
        throw e;
    }
  };

  const updateUser = async (data: Partial<User>) => {
      try {
          await userApi.updateProfile(data);
          setUser(prev => prev ? { ...prev, ...data } : null);
          showToast('个人资料更新成功', 'success');
      } catch(e) {
          showToast('更新个人资料失败', 'error');
      }
  };

  const incrementAiUsage = async () => {
    if (!user) return;
    try {
      const res = await aiApi.updateUsage(user.id);
      setUser(prev => prev ? { ...prev, aiUsage: res.usage } : null);
    } catch (e) {
      console.error(e);
    }
  };

  const logout = () => {
    setUser(null);
    showToast('已成功登出', 'info');
  };

  const requireAuth = useCallback((callback: () => void) => {
    if (user) {
        callback();
    } else {
        setAuthModalOpen(true);
        showToast('请先登录以继续', 'info');
    }
  }, [user, showToast]);

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (currentSong) {
      setIsPlaying(prev => !prev);
    }
  };

  const closePlayer = () => {
    setCurrentSong(null);
    setIsPlaying(false);
    setFullPlayerOpen(false);
  };

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  const toggleFestive = () => {
      setShowFestive(prev => {
          const next = !prev;
          showToast(next ? '节日氛围已开启' : '节日氛围已关闭', 'success');
          return next;
      });
  };

  const cycleSeasonMode = () => {
      const modes: SeasonMode[] = ['auto', 'spring', 'summer', 'autumn', 'winter'];
      setSeasonMode(prev => {
          const currentIndex = modes.indexOf(prev);
          const nextMode = modes[(currentIndex + 1) % modes.length];
          const labels = { auto: '自动节气', spring: '春季', summer: '夏季', autumn: '秋季', winter: '冬季' };
          showToast(`已切换至: ${labels[nextMode]}`, 'info');
          return nextMode;
      });
  };

  const cycleFontSize = () => {
      setFontSize(prev => {
          if (prev >= 125) return 100;
          if (prev >= 112.5) return 125;
          return 112.5;
      });
      showToast('字体大小已调整');
  };

  const value = useMemo(() => ({
    user,
    isLoggedIn: !!user,
    login,
    updateUser,
    logout,
    incrementAiUsage,
    isAuthModalOpen, 
    setAuthModalOpen,
    requireAuth,
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    closePlayer,
    isFullPlayerOpen,
    setFullPlayerOpen,
    darkMode,
    toggleTheme,
    fontSize,
    cycleFontSize,
    showFestive,
    toggleFestive,
    seasonMode,
    cycleSeasonMode,
    isSearchOpen,
    setSearchOpen,
    toasts,
    showToast,
    removeToast
  }), [user, isAuthModalOpen, currentSong, isPlaying, isFullPlayerOpen, darkMode, fontSize, showFestive, seasonMode, isSearchOpen, toasts]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useStore must be used within an AppProvider');
  }
  return context;
};