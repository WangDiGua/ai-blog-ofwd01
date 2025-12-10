import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useMemo, useCallback } from 'react';
import { User, ToastMessage, ToastType, Song } from '../types';
import { aiApi } from '../services/api';

export type ThemeMode = 'light' | 'dark' | 'eye';
export type SeasonMode = 'auto' | 'spring' | 'summer' | 'autumn' | 'winter';
export type FontSize = 'normal' | 'large' | 'huge';

interface AppContextType {
  // User / Auth
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  requireAuth: (callback: () => void) => void;

  // Theme & UI Settings
  theme: ThemeMode;
  toggleTheme: () => void;
  isThemeAnimating: boolean; // 新增：是否正在进行主题动画
  transitionStage: 'idle' | 'setting' | 'rising'; // 新增：动画阶段
  previousTheme: ThemeMode; // 新增：用于判断动画起始状态
  fontSize: FontSize;
  cycleFontSize: () => void;
  
  // Festive / Season
  showFestive: boolean;
  toggleFestive: () => void;
  seasonMode: SeasonMode;
  cycleSeasonMode: () => void;

  // Global UI State
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  
  // Toast Notifications
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastType) => void;

  // Music Player
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  closePlayer: () => void;
  isFullPlayerOpen: boolean;
  setFullPlayerOpen: (open: boolean) => void;

  // AI
  incrementAiUsage: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // --- State: Auth ---
  const [user, setUser] = useState<User | null>(null);
  
  // --- State: Theme ---
  const [theme, setTheme] = useState<ThemeMode>('light');
  // 动画状态管理
  const [isThemeAnimating, setIsThemeAnimating] = useState(false);
  const [transitionStage, setTransitionStage] = useState<'idle' | 'setting' | 'rising'>('idle');
  const [previousTheme, setPreviousTheme] = useState<ThemeMode>('light');
  
  // --- State: Settings ---
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [showFestive, setShowFestive] = useState(true);
  const [seasonMode, setSeasonMode] = useState<SeasonMode>('auto');

  // --- State: UI Modals ---
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  // --- State: Toast ---
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // --- State: Music ---
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullPlayerOpen, setFullPlayerOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Effects: Theme Application ---
  useEffect(() => {
    // 这里的 DOM 操作仅在 theme 状态真正改变时执行
    // 我们将在动画的中间阶段改变这个状态
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'eye-protection');
    
    if (theme === 'dark') root.classList.add('dark');
    else if (theme === 'eye') root.classList.add('eye-protection');
    else root.classList.add('light');

    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load persisted theme & user
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme) {
        setTheme(savedTheme);
        setPreviousTheme(savedTheme);
    }
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
        setPreviousTheme('dark');
    }
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        try {
            setUser(JSON.parse(savedUser));
        } catch(e) {
            console.error("Failed to parse user", e);
        }
    }
  }, []);

  // --- Effects: Font Size ---
  useEffect(() => {
      const root = window.document.documentElement;
      root.style.fontSize = fontSize === 'normal' ? '16px' : fontSize === 'large' ? '18px' : '20px';
  }, [fontSize]);


  // --- Actions: Toast ---
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // --- Actions: Auth ---
  const login = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    showToast(`欢迎回来, ${userData.name}`, 'success');
  }, [showToast]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    showToast('已退出登录', 'info');
  }, [showToast]);

  const updateUser = useCallback(async (data: Partial<User>) => {
      setUser(prev => {
          if (!prev) return null;
          const updated = { ...prev, ...data };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
      });
  }, []);

  const requireAuth = useCallback((callback: () => void) => {
      setUser(currentUser => {
          if (currentUser) {
              callback();
          } else {
              showToast('请先登录', 'info');
              setAuthModalOpen(true);
          }
          return currentUser;
      });
  }, [showToast]);

  // --- Actions: Theme & Settings ---
  const toggleTheme = useCallback(() => {
    if (isThemeAnimating) return; // 防止动画过程中重复点击

    setPreviousTheme(theme); // 记录当前主题
    setIsThemeAnimating(true);
    setTransitionStage('setting'); // 开始第一阶段：落日/落月

    // 计算下一个主题
    let nextTheme: ThemeMode;
    if (theme === 'light') nextTheme = 'dark';
    else if (theme === 'dark') nextTheme = 'eye';
    else nextTheme = 'light';

    // 动画时序控制
    // 1.5秒后（下落完成），切换实际主题，并开始升起
    setTimeout(() => {
        setTheme(nextTheme); // 切换 React 状态，触发 DOM 变更
        setTransitionStage('rising'); // 开始第二阶段：升起
        
        // 再过 1.5秒（升起完成），结束动画
        setTimeout(() => {
            setIsThemeAnimating(false);
            setTransitionStage('idle');
            
            const labels: Record<ThemeMode, string> = { light: '浅色模式', dark: '深色模式', eye: '护眼模式' };
            showToast(`已切换至: ${labels[nextTheme]}`, 'info');
        }, 1500);
    }, 1500);

  }, [theme, isThemeAnimating, showToast]);

  const cycleFontSize = useCallback(() => {
      setFontSize(prev => {
          const next = prev === 'normal' ? 'large' : prev === 'large' ? 'huge' : 'normal';
          showToast('字体大小已调整', 'info');
          return next;
      });
  }, [showToast]);

  const toggleFestive = useCallback(() => {
      setShowFestive(prev => {
          showToast(!prev ? '节日氛围已开启' : '节日氛围已关闭', 'info');
          return !prev;
      });
  }, [showToast]);

  const cycleSeasonMode = useCallback(() => {
      setSeasonMode(prev => {
          const modes: SeasonMode[] = ['auto', 'spring', 'summer', 'autumn', 'winter'];
          const idx = modes.indexOf(prev);
          const next = modes[(idx + 1) % modes.length];
          showToast(`季节模式: ${next}`, 'info');
          return next;
      });
  }, [showToast]);

  // --- Actions: AI ---
  const incrementAiUsage = useCallback(async () => {
      setUser(currentUser => {
          if (!currentUser) return null;
          // Optimistic update locally? Or better fetch.
          // For now, keep as is but wrap in callback logic
          aiApi.updateUsage(currentUser.id).then(() => {
               // Assuming API success
          }).catch(console.error);
          
          const newUsage = (currentUser.aiUsage || 0) + 1;
          const updated = { ...currentUser, aiUsage: newUsage };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
      });
  }, []);

  // --- Actions: Music ---
  useEffect(() => {
      if (!audioRef.current) {
          audioRef.current = new Audio();
          audioRef.current.onended = () => setIsPlaying(false);
      }
  }, []);

  useEffect(() => {
      if (currentSong && audioRef.current) {
           if (isPlaying) {
               // Audio playing logic would go here
           } else {
               // Audio pausing logic would go here
           }
      }
  }, [currentSong, isPlaying]);

  const playSong = useCallback((song: Song) => {
      setCurrentSong(curr => {
          if (curr?.id === song.id) {
              setIsPlaying(p => !p);
              return curr;
          }
          setIsPlaying(true);
          showToast(`开始播放: ${song.title}`, 'success');
          return song;
      });
  }, [showToast]);

  const togglePlay = useCallback(() => {
      if (currentSong) setIsPlaying(p => !p);
  }, [currentSong]);

  const closePlayer = useCallback(() => {
      setIsPlaying(false);
      setCurrentSong(null);
      setFullPlayerOpen(false);
  }, []);

  // 使用 useMemo 缓存 Context Value，避免不必要的重渲染
  const contextValue = useMemo(() => ({
        user, isLoggedIn: !!user, login, logout, updateUser, requireAuth,
        theme, toggleTheme, isThemeAnimating, transitionStage, previousTheme,
        fontSize, cycleFontSize,
        showFestive, toggleFestive, seasonMode, cycleSeasonMode,
        isSearchOpen, setSearchOpen, isAuthModalOpen, setAuthModalOpen,
        toasts, showToast,
        currentSong, isPlaying, playSong, togglePlay, closePlayer, isFullPlayerOpen, setFullPlayerOpen,
        incrementAiUsage
  }), [
        user, theme, isThemeAnimating, transitionStage, previousTheme, fontSize, showFestive, seasonMode, 
        isSearchOpen, isAuthModalOpen, toasts, currentSong, isPlaying, isFullPlayerOpen,
        login, logout, updateUser, requireAuth, toggleTheme, cycleFontSize, toggleFestive, cycleSeasonMode,
        showToast, playSong, togglePlay, closePlayer, incrementAiUsage
  ]);

  return (
    <AppContext.Provider value={contextValue}>
        {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useStore must be used within an AppProvider');
  }
  return context;
};