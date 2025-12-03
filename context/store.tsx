import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { User, Song } from '../types';
import { request } from '../utils/lib';

interface AppState {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string) => Promise<void>;
  logout: () => void;
  
  // Music Player State
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  
  // Theme
  darkMode: boolean;
  toggleTheme: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Initialize dark mode from local storage or preference
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

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

  const login = async (username: string) => {
    try {
        const userData = await request.post<User>('/login', { username });
        setUser(userData);
    } catch (e) {
        console.error("Login failed", e);
        throw e;
    }
  };

  const logout = () => {
    setUser(null);
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

  const value = useMemo(() => ({
    user,
    isLoggedIn: !!user,
    login,
    logout,
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    darkMode,
    toggleTheme
  }), [user, currentSong, isPlaying, darkMode]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useStore must be used within an AppProvider');
  }
  return context;
};