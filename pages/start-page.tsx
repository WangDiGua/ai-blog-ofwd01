import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Globe, Command, Home, Settings, Grid, Terminal } from 'lucide-react';

const ENGINES = [
    { name: 'Google', url: 'https://www.google.com/search?q=', placeholder: '在 Google 上搜索...' },
    { name: 'Bing', url: 'https://www.bing.com/search?q=', placeholder: '在 Bing 上搜索...' },
    { name: 'Baidu', url: 'https://www.baidu.com/s?wd=', placeholder: '百度一下...' },
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', placeholder: '隐私搜索...' },
];

export const StartPage = () => {
    const navigate = useNavigate();
    const [time, setTime] = useState(new Date());
    const [query, setQuery] = useState('');
    const [engineIdx, setEngineIdx] = useState(0);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        window.location.href = `${ENGINES[engineIdx].url}${encodeURIComponent(query)}`;
    };

    // 格式化日期
    const dateStr = time.toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' });
    const timeStr = time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    // Dock Icon Component
    const DockIcon = ({ icon: Icon, label, onClick, color = "bg-gray-200 dark:bg-gray-700" }: any) => (
        <div className="group relative flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 hover:-translate-y-2" onClick={onClick}>
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${color} flex items-center justify-center shadow-lg border border-white/20 hover:scale-110 transition-transform duration-200`}>
                <Icon size={24} className="text-gray-700 dark:text-gray-200" />
            </div>
            <span className="absolute -top-10 px-2 py-1 bg-gray-800/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-sm pointer-events-none">
                {label}
            </span>
            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full opacity-0 group-hover:opacity-100" />
        </div>
    );

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden bg-white dark:bg-black">
            {/* 背景层 */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-black -z-20" />
            
            {/* 动态模糊装饰 */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-[128px] -z-10 mix-blend-multiply dark:mix-blend-screen animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-[128px] -z-10 mix-blend-multiply dark:mix-blend-screen animate-pulse delay-1000" />

            {/* 主要内容区域 */}
            <div className="z-10 w-full max-w-2xl px-4 flex flex-col items-center space-y-12 animate-in fade-in zoom-in-95 duration-700 -mt-20">
                
                {/* 时钟区域 */}
                <div className="text-center space-y-2 select-none">
                    <h1 className="text-8xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-500 dark:from-white dark:to-gray-400 drop-shadow-sm font-mono">
                        {timeStr}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-medium">
                        {dateStr}
                    </p>
                </div>

                {/* 搜索区域 */}
                <div className={`w-full transition-all duration-300 transform ${isFocused ? 'scale-105' : 'scale-100'}`}>
                    <form onSubmit={handleSearch} className="relative group">
                        <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity ${isFocused ? 'opacity-50' : ''}`}></div>
                        <div className="relative flex items-center bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-xl overflow-hidden">
                            
                            {/* 引擎切换 */}
                            <div className="relative group/engine border-r border-gray-200 dark:border-gray-700">
                                <button type="button" className="flex items-center space-x-2 px-4 py-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer outline-none">
                                    <Globe size={20} className="text-gray-500" />
                                    <span className="text-sm font-medium hidden md:block w-16 truncate">{ENGINES[engineIdx].name}</span>
                                </button>
                                
                                {/* 下拉菜单 */}
                                <div className="absolute top-full left-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden hidden group-hover/engine:block z-50 animate-in slide-in-from-top-2">
                                    {ENGINES.map((engine, idx) => (
                                        <button
                                            key={engine.name}
                                            type="button"
                                            onClick={() => setEngineIdx(idx)}
                                            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${engineIdx === idx ? 'text-apple-blue font-bold bg-blue-50 dark:bg-blue-900/20' : 'text-gray-600 dark:text-gray-300'}`}
                                        >
                                            {engine.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <input 
                                type="text"
                                className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-lg text-gray-800 dark:text-white placeholder-gray-400"
                                placeholder={ENGINES[engineIdx].placeholder}
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                autoFocus
                            />
                            
                            <button 
                                type="submit" 
                                className="p-4 text-apple-blue hover:text-blue-600 transition-colors"
                            >
                                <Search size={24} />
                            </button>
                        </div>
                    </form>
                    
                    {/* 快捷提示 */}
                    <div className="mt-4 flex justify-center space-x-6 text-xs text-gray-400 font-medium opacity-0 animate-in fade-in delay-500 duration-1000 fill-mode-forwards">
                        <span className="flex items-center"><Command size={10} className="mr-1"/> + L 聚焦地址栏</span>
                        <span>Tab 切换引擎</span>
                        <span>Enter 搜索</span>
                    </div>
                </div>
            </div>

            {/* 底部 Dock 栏 */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <div className="flex items-end gap-3 px-4 pb-3 pt-3 bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-gray-700/30 rounded-3xl shadow-2xl">
                    <DockIcon icon={Home} label="返回首页" onClick={() => navigate('/')} color="bg-blue-500/20" />
                    <DockIcon icon={Grid} label="应用列表" onClick={() => {}} />
                    <DockIcon icon={Terminal} label="终端" onClick={() => {}} />
                    <div className="w-px h-10 bg-gray-400/30 dark:bg-gray-600/30 mx-1 self-center" />
                    <DockIcon icon={Settings} label="设置" onClick={() => {}} />
                </div>
            </div>
        </div>
    );
};