import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { User, Song } from '../types';

interface AppState {
  user: User | null;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  
  // Music Player State
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  
  // Theme (simplified)
  darkMode: boolean;
  toggleTheme: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const login = () => {
    // Simulate login
    setUser({
      id: 'me',
      name: 'Guest User',
      avatar: 'https://picsum.photos/id/64/100/100'
    });
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
    // In a real app, we would toggle a class on the html element here
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
