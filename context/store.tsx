import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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
    const root = window.document.documentElement;
    // 使用正确的类名 'eye-protection' 匹配 index.html 中的 CSS 定义
    root.classList.remove('light', 'dark', 'eye-protection');
    
    if (theme === 'dark') root.classList.add('dark');
    else if (theme === 'eye') root.classList.add('eye-protection');
    else root.classList.add('light');

    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load persisted theme & user
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme) setTheme(savedTheme);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
    
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
  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // --- Actions: Auth ---
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    showToast(`欢迎回来, ${userData.name}`, 'success');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    showToast('已退出登录', 'info');
  };

  const updateUser = async (data: Partial<User>) => {
      if (!user) return;
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
  };

  const requireAuth = (callback: () => void) => {
      if (user) {
          callback();
      } else {
          showToast('请先登录', 'info');
          setAuthModalOpen(true);
      }
  };

  // --- Actions: Theme & Settings ---
  const toggleTheme = () => {
    let next: ThemeMode;
    if (theme === 'light') next = 'dark';
    else if (theme === 'dark') next = 'eye';
    else next = 'light';
    
    setTheme(next);
    
    const labels: Record<ThemeMode, string> = { light: '浅色模式', dark: '深色模式', eye: '护眼模式' };
    showToast(`已切换至: ${labels[next]}`, 'info');
  };

  const cycleFontSize = () => {
      const next = fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'huge' : 'normal';
      setFontSize(next);
      showToast('字体大小已调整', 'info');
  };

  const toggleFestive = () => {
      setShowFestive(!showFestive);
      showToast(showFestive ? '节日氛围已关闭' : '节日氛围已开启', 'info');
  };

  const cycleSeasonMode = () => {
      const modes: SeasonMode[] = ['auto', 'spring', 'summer', 'autumn', 'winter'];
      const idx = modes.indexOf(seasonMode);
      const next = modes[(idx + 1) % modes.length];
      setSeasonMode(next);
      showToast(`季节模式: ${next}`, 'info');
  };

  // --- Actions: AI ---
  const incrementAiUsage = async () => {
      if (!user) return;
      try {
          await aiApi.updateUsage(user.id);
          const newUsage = (user.aiUsage || 0) + 1;
          updateUser({ aiUsage: newUsage });
      } catch (e) {
          console.error("Failed to update AI usage");
      }
  };

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

  const playSong = (song: Song) => {
      if (currentSong?.id === song.id) {
          togglePlay();
      } else {
          setCurrentSong(song);
          setIsPlaying(true);
          showToast(`开始播放: ${song.title}`, 'success');
      }
  };

  const togglePlay = () => {
      if (!currentSong) return;
      setIsPlaying(!isPlaying);
  };

  const closePlayer = () => {
      setIsPlaying(false);
      setCurrentSong(null);
      setFullPlayerOpen(false);
  };

  return (
    <AppContext.Provider value={{
        user, isLoggedIn: !!user, login, logout, updateUser, requireAuth,
        theme, toggleTheme, fontSize, cycleFontSize,
        showFestive, toggleFestive, seasonMode, cycleSeasonMode,
        isSearchOpen, setSearchOpen, isAuthModalOpen, setAuthModalOpen,
        toasts, showToast,
        currentSong, isPlaying, playSong, togglePlay, closePlayer, isFullPlayerOpen, setFullPlayerOpen,
        incrementAiUsage
    }}>
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