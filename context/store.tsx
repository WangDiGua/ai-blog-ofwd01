import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode, useCallback } from 'react';
import { User, Song, ToastMessage, ToastType } from '../types';
import { request } from '../utils/lib';

interface AppState {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  logout: () => void;
  
  // Music Player State
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  isFullPlayerOpen: boolean;
  setFullPlayerOpen: (open: boolean) => void;
  
  // Theme & UI
  darkMode: boolean;
  toggleTheme: () => void;
  fontSize: number; // Percentage, e.g., 100, 110, 120
  cycleFontSize: () => void;

  // Search Modal
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // Toast
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullPlayerOpen, setFullPlayerOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Initialize dark mode from local storage or preference
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Apply Theme
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

  // Apply Font Size
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
        const userData = await request.post<User>('/login', { username });
        setUser(userData);
        showToast(`Welcome back, ${userData.name}!`, 'success');
    } catch (e) {
        showToast('Login failed. Please try again.', 'error');
        throw e;
    }
  };

  const updateUser = async (data: Partial<User>) => {
      try {
          // Simulate update
          await request.post('/user/update', data);
          setUser(prev => prev ? { ...prev, ...data } : null);
          showToast('Profile updated successfully', 'success');
      } catch(e) {
          showToast('Failed to update profile', 'error');
      }
  };

  const logout = () => {
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (currentSong) {
      setIsPlaying(prev => !prev);
    }
  };

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  const cycleFontSize = () => {
      setFontSize(prev => {
          if (prev >= 125) return 100;
          if (prev >= 112.5) return 125;
          return 112.5;
      });
      showToast('Font size adjusted');
  };

  const value = useMemo(() => ({
    user,
    isLoggedIn: !!user,
    login,
    updateUser,
    logout,
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    isFullPlayerOpen,
    setFullPlayerOpen,
    darkMode,
    toggleTheme,
    fontSize,
    cycleFontSize,
    isSearchOpen,
    setSearchOpen,
    toasts,
    showToast,
    removeToast
  }), [user, currentSong, isPlaying, isFullPlayerOpen, darkMode, fontSize, isSearchOpen, toasts]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useStore must be used within an AppProvider');
  }
  return context;
};
