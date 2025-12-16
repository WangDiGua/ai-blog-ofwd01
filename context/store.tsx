import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useMemo, useCallback, PropsWithChildren } from 'react';
import { User, ToastMessage, ToastType, Song, PlayMode } from '../types';
import { aiApi, musicApi } from '../services/api';

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
  isThemeAnimating: boolean;
  transitionStage: 'idle' | 'setting' | 'rising';
  previousTheme: ThemeMode;
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
  playMode: PlayMode; // 新增
  volume: number; // 新增 0-1
  playSong: (song: Song) => void;
  togglePlay: () => void;
  playNext: () => void; // 新增
  playPrev: () => void; // 新增
  togglePlayMode: () => void; // 新增
  setVolume: (val: number) => void; // 新增
  closePlayer: () => void;
  isFullPlayerOpen: boolean;
  setFullPlayerOpen: (open: boolean) => void;

  // AI
  incrementAiUsage: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: PropsWithChildren) => {
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
  const [playlist, setPlaylist] = useState<Song[]>([]); // 内部维护播放列表
  const [playMode, setPlayMode] = useState<PlayMode>('order');
  const [volume, setVolume] = useState(0.7);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Effects: Theme Application ---
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'eye-protection');
    
    if (theme === 'dark') root.classList.add('dark');
    else if (theme === 'eye') root.classList.add('eye-protection');
    else root.classList.add('light');

    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load persisted theme & user & Fetch Initial Music
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

    // 初始化获取音乐列表以便全局播放
    musicApi.getList().then(songs => setPlaylist(songs));
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
    if (isThemeAnimating) return; 

    setPreviousTheme(theme); 
    setIsThemeAnimating(true);
    setTransitionStage('setting'); 

    let nextTheme: ThemeMode;
    if (theme === 'light') nextTheme = 'dark';
    else if (theme === 'dark') nextTheme = 'eye';
    else nextTheme = 'light';

    setTimeout(() => {
        setTheme(nextTheme); 
        setTransitionStage('rising'); 
        
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
          aiApi.updateUsage(currentUser.id).catch(console.error);
          const newUsage = (currentUser.aiUsage || 0) + 1;
          const updated = { ...currentUser, aiUsage: newUsage };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
      });
  }, []);

  // --- Actions: Music Logic ---
  
  // 播放下一首
  const playNext = useCallback(() => {
      if (playlist.length === 0) return;
      
      setCurrentSong(current => {
          const currentIndex = playlist.findIndex(s => s.id === current?.id);
          let nextIndex = 0;

          if (playMode === 'random') {
              nextIndex = Math.floor(Math.random() * playlist.length);
          } else if (playMode === 'loop') {
              // 单曲循环逻辑通常在 onEnded 处理，但如果用户点击下一首，也应该切歌还是重播？通常切歌
              // 这里如果手动点击下一首，我们切换到列表下一首
              nextIndex = (currentIndex + 1) % playlist.length;
          } else {
              // 顺序播放
              nextIndex = (currentIndex + 1) % playlist.length;
          }
          
          setIsPlaying(true);
          return playlist[nextIndex];
      });
  }, [playlist, playMode]);

  // 播放上一首
  const playPrev = useCallback(() => {
      if (playlist.length === 0) return;
      
      setCurrentSong(current => {
          const currentIndex = playlist.findIndex(s => s.id === current?.id);
          let prevIndex = 0;
          
          if (playMode === 'random') {
               prevIndex = Math.floor(Math.random() * playlist.length);
          } else {
               prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
          }
          
          setIsPlaying(true);
          return playlist[prevIndex];
      });
  }, [playlist, playMode]);

  // 切换播放模式
  const togglePlayMode = useCallback(() => {
      setPlayMode(prev => {
          const next = prev === 'order' ? 'loop' : prev === 'loop' ? 'random' : 'order';
          const labels: Record<PlayMode, string> = { order: '顺序播放', loop: '单曲循环', random: '随机播放' };
          showToast(labels[next], 'info');
          return next;
      });
  }, [showToast]);

  useEffect(() => {
      if (!audioRef.current) {
          audioRef.current = new Audio();
          // 监听播放结束事件，实现自动播放逻辑
          audioRef.current.onended = () => {
              // 在 useEffect 内部无法直接获取最新的 playMode 状态（闭包陷阱）
              // 解决方法：使用 ref 追踪 playMode 或 依赖项重新绑定
              // 这里为了简单，我们在 handleEnded 中做逻辑判断，但因为 playNext 已经使用了 useCallback 且依赖了 playMode
              // 我们需要确保 onEnded 调用的是最新的 playNext
          };
      }
  }, []);

  // 专门处理 onEnded 的 Effect
  useEffect(() => {
      if (audioRef.current) {
          audioRef.current.onended = () => {
              if (playMode === 'loop') {
                  audioRef.current!.currentTime = 0;
                  audioRef.current!.play();
              } else {
                  playNext();
              }
          };
      }
  }, [playMode, playNext]);

  // 处理音量
  useEffect(() => {
      if (audioRef.current) {
          audioRef.current.volume = volume;
      }
  }, [volume]);

  // 处理播放/暂停/切歌
  useEffect(() => {
      // 这里的逻辑主要处理 playSong 改变 currentSong 后触发播放
      // 实际的 play/pause 操作可以在组件层面控制，或者在这里监听
      // 简单起见，我们仅做辅助
  }, [currentSong]);

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

  const contextValue = useMemo(() => ({
        user, isLoggedIn: !!user, login, logout, updateUser, requireAuth,
        theme, toggleTheme, isThemeAnimating, transitionStage, previousTheme,
        fontSize, cycleFontSize,
        showFestive, toggleFestive, seasonMode, cycleSeasonMode,
        isSearchOpen, setSearchOpen, isAuthModalOpen, setAuthModalOpen,
        toasts, showToast,
        currentSong, isPlaying, playMode, volume, 
        playSong, togglePlay, playNext, playPrev, togglePlayMode, setVolume, closePlayer, isFullPlayerOpen, setFullPlayerOpen,
        incrementAiUsage
  }), [
        user, theme, isThemeAnimating, transitionStage, previousTheme, fontSize, showFestive, seasonMode, 
        isSearchOpen, isAuthModalOpen, toasts, 
        currentSong, isPlaying, isFullPlayerOpen, playMode, volume,
        login, logout, updateUser, requireAuth, toggleTheme, cycleFontSize, toggleFestive, cycleSeasonMode,
        showToast, playSong, togglePlay, playNext, playPrev, togglePlayMode, setVolume, closePlayer, incrementAiUsage
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