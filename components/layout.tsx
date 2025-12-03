import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Search, Menu, X, Music, User as UserIcon, LogIn, Github, Twitter, Mail } from 'lucide-react';
import { useStore } from '../context/store';
import { Button, Avatar } from './ui';
import { debounce, throttle } from '../utils/lib';

// --- Navbar Component ---
export const Navbar = () => {
  const { user, login, isLoggedIn } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // Handle Scroll Effect for Frosted Glass
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debounced Search Handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(
    debounce((query: string) => {
      console.log('Searching for:', query);
      // In a real app, this would trigger an API call or filter context
    }, 500),
    []
  );

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    handleSearch(val);
  };

  const navLinks = [
    { name: 'Blog', path: '/' },
    { name: 'Community', path: '/community' },
    { name: 'Music', path: '/music' },
    { name: 'Tools', path: '/tools' },
    { name: 'About', path: '/about' },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent
          ${isScrolled || isMobileMenuOpen ? 'bg-white/80 backdrop-blur-xl border-gray-200/50 shadow-sm' : 'bg-transparent py-2'}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-semibold tracking-tight text-black">iBlog</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8 items-center">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) => `
                    text-sm font-medium transition-colors duration-200
                    ${isActive ? 'text-apple-blue' : 'text-apple-subtext hover:text-apple-text'}
                  `}
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            {/* Right Actions: Search & Profile */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={onSearchChange}
                  placeholder="Search..."
                  className="block w-40 lg:w-60 pl-10 pr-3 py-1.5 border-none rounded-full leading-5 bg-gray-100 text-apple-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:bg-white transition-all duration-300 sm:text-sm"
                />
              </div>

              {isLoggedIn && user ? (
                <div className="flex items-center space-x-2">
                   <Avatar src={user.avatar} alt={user.name} size="sm" />
                </div>
              ) : (
                <Button size="sm" onClick={login}>
                  Login
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-apple-text hover:bg-gray-100 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden absolute w-full bg-white/95 backdrop-blur-xl border-b border-gray-200 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="px-4 pt-2 pb-6 space-y-2">
            <div className="mb-4 mt-2">
               <input
                  type="text"
                  placeholder="Search articles..."
                  className="block w-full pl-4 pr-3 py-2 rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-apple-blue/50 outline-none"
                />
            </div>
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `
                  block px-3 py-2 rounded-lg text-base font-medium
                  ${isActive ? 'bg-blue-50 text-apple-blue' : 'text-apple-text hover:bg-gray-50'}
                `}
              >
                {link.name}
              </NavLink>
            ))}
            <div className="pt-4 border-t border-gray-100">
              {isLoggedIn ? (
                 <div className="flex items-center space-x-3 px-3">
                    <div className="bg-gray-200 rounded-full p-2"><UserIcon size={20}/></div>
                    <span className="font-medium">My Profile</span>
                 </div>
              ) : (
                <Button className="w-full" onClick={() => { login(); setIsMobileMenuOpen(false); }}>Sign In</Button>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
};

// --- Music Player Mini Component (Floating) ---
export const MiniPlayer = () => {
  const { currentSong, isPlaying, togglePlay } = useStore();
  const [progress, setProgress] = useState(0);

  // Throttled progress updater simulation
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
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 bg-white/80 backdrop-blur-2xl border border-gray-200/50 shadow-lg rounded-2xl p-3 z-40 flex items-center space-x-4 transition-all duration-500 animate-in slide-in-from-bottom-10">
      <img src={currentSong.cover} alt="Cover" className="w-12 h-12 rounded-lg shadow-sm" />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate text-apple-text">{currentSong.title}</h4>
        <p className="text-xs text-apple-subtext truncate">{currentSong.artist}</p>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
          <div className="bg-apple-blue h-1 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <button 
        onClick={togglePlay}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        {isPlaying ? (
           <span className="w-3 h-3 bg-apple-text rounded-sm" /> 
        ) : (
           <Music className="w-5 h-5 text-apple-text ml-0.5" />
        )}
      </button>
    </div>
  );
};

// --- Footer Component ---
export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500"><Github className="h-6 w-6" /></a>
            <a href="#" className="text-gray-400 hover:text-gray-500"><Twitter className="h-6 w-6" /></a>
            <a href="#" className="text-gray-400 hover:text-gray-500"><Mail className="h-6 w-6" /></a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-xs text-gray-500">
              &copy; 2025 iBlog. Designed with Apple Aesthetics.
            </p>
            <div className="mt-2 text-center text-xs text-gray-400 space-x-4">
              <a href="#" className="hover:text-gray-600">Privacy Policy</a>
              <a href="#" className="hover:text-gray-600">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
