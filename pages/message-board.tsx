import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Avatar, ReportModal } from '../components/ui';
import { Send, MessageSquare, ChevronLeft, Heart, Flag } from 'lucide-react';
import { useStore } from '../context/store';
import { communityApi } from '../services/api';

interface Danmaku {
    id: number;
    text: string;
    top: number;
    duration: number;
    color: string;
    likes: number; // Add likes
}

const COLORS = ['text-white', 'text-yellow-300', 'text-green-300', 'text-blue-300', 'text-pink-300', 'text-purple-300'];

// 独立弹幕组件以处理自身的交互状态
const DanmakuItem = ({ 
    item, 
    onAnimationEnd, 
    onLike, 
    onReport 
}: { 
    item: Danmaku, 
    onAnimationEnd: (id: number) => void,
    onLike: (id: number) => void,
    onReport: (id: number) => void
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`
                absolute flex items-center space-x-2 whitespace-nowrap text-lg md:text-2xl font-medium drop-shadow-md will-change-transform z-10
                cursor-pointer transition-all hover:z-50 hover:scale-105
                ${item.color}
            `}
            style={{
                top: `${item.top}%`,
                left: '100%',
                // 使用 animationPlayState 来暂停
                animation: `danmaku ${item.duration}s linear forwards`,
                animationPlayState: isHovered ? 'paused' : 'running'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onAnimationEnd={() => onAnimationEnd(item.id)}
        >
            <span>{item.text}</span>
            
            {/* 仅在悬停或有点赞时显示额外信息 */}
            <div className={`flex items-center space-x-2 transition-opacity duration-200 ${isHovered || item.likes > 0 ? 'opacity-100' : 'opacity-0'}`}>
                {/* 点赞数 (0时不显示数字, 但悬停时显示心形按钮) */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onLike(item.id); }}
                    className="flex items-center space-x-1 hover:text-red-500 bg-black/20 rounded-full px-2 py-0.5 backdrop-blur-sm"
                >
                    <Heart size={14} className={item.likes > 0 ? "fill-red-500 text-red-500" : ""} />
                    {item.likes > 0 && <span className="text-xs font-bold text-white">{item.likes}</span>}
                </button>

                {/* 举报按钮 (仅悬停显示) */}
                {isHovered && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onReport(item.id); }}
                        className="p-1 hover:text-orange-500 bg-black/20 rounded-full backdrop-blur-sm"
                        title="举报"
                    >
                        <Flag size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

export const MessageBoard = () => {
    const navigate = useNavigate();
    const { showToast, requireAuth } = useStore();
    const [messages, setMessages] = useState<Danmaku[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [initialMessages, setInitialMessages] = useState<string[]>([]);
    
    // Report Modal State
    const [reportTarget, setReportTarget] = useState<string | null>(null);

    // 初始化弹幕
    useEffect(() => {
        communityApi.getDanmaku().then(data => {
            setInitialMessages(data);
            const initial = data.map((msg, i) => createDanmaku(msg, i * 2000));
            setMessages(initial);
        });
    }, []);

    // 持续生成模拟弹幕
    useEffect(() => {
        if (initialMessages.length === 0) return;
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const randomMsg = initialMessages[Math.floor(Math.random() * initialMessages.length)];
                addDanmaku(randomMsg);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [initialMessages]);

    const createDanmaku = (text: string, delay = 0): Danmaku => ({
        id: Date.now() + Math.random(),
        text,
        top: Math.random() * 80 + 5, // 5% - 85% height
        duration: Math.random() * 10 + 15, // 15s - 25s (slower for interaction)
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        likes: Math.random() > 0.8 ? Math.floor(Math.random() * 10) : 0 // 随机初始化点赞
    });

    const addDanmaku = (text: string) => {
        setMessages(prev => [...prev, createDanmaku(text)]);
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // 发送自己的弹幕 (高亮显示)
        const newDanmaku: Danmaku = {
            id: Date.now(),
            text: inputValue,
            top: Math.random() * 80 + 5,
            duration: 20,
            color: 'text-white border-2 border-apple-blue px-3 py-1 rounded-full font-bold bg-apple-blue/20 shadow-[0_0_15px_rgba(0,113,227,0.5)]',
            likes: 0
        };

        setMessages(prev => [...prev, newDanmaku]);
        setInputValue('');
        showToast('弹幕发送成功！', 'success');
    };

    const handleAnimationEnd = (id: number) => {
        setMessages(prev => prev.filter(m => m.id !== id));
    };

    const handleLike = (id: number) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, likes: m.likes + 1 } : m));
    };

    const handleReport = (id: number) => {
        requireAuth(() => {
            setReportTarget(String(id));
        });
    };

    return (
        // Removed unnecessary z-[100] to prevent masking global modals (now in App.tsx layout)
        <div className="relative w-full min-h-screen overflow-hidden bg-gray-900 flex flex-col items-center justify-end pb-24 md:pb-32">
            
            <ReportModal 
                isOpen={!!reportTarget}
                onClose={() => setReportTarget(null)}
                targetId={reportTarget || ''}
                targetType="danmaku"
            />

            {/* 背景 */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-indigo-950 -z-20" />
            
            {/* 返回按钮 */}
            <div className="absolute top-6 left-6 z-50">
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
                    <span>返回首页</span>
                </button>
            </div>
            
            {/* 弹幕层 */}
            <div className="absolute inset-0 overflow-hidden z-0 pointer-events-auto">
                {messages.map(msg => (
                    <DanmakuItem 
                        key={msg.id} 
                        item={msg} 
                        onAnimationEnd={handleAnimationEnd}
                        onLike={handleLike}
                        onReport={handleReport}
                    />
                ))}
            </div>

            <style>{`
                @keyframes danmaku {
                    from { transform: translateX(0); }
                    to { transform: translateX(-150vw); }
                }
            `}</style>

            {/* 输入区域 */}
            <div className="z-10 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-10 duration-700 pointer-events-auto">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6 text-center shadow-2xl">
                    <div className="mb-4 md:mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center justify-center">
                            <MessageSquare className="mr-3" /> 留言板
                        </h1>
                        <p className="text-gray-300 text-sm md:text-base">悬停弹幕可点赞互动，无需登录！</p>
                    </div>

                    <form onSubmit={handleSend} className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-apple-blue transition-all"
                            placeholder="说点什么吧..."
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            maxLength={50}
                        />
                        <button 
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="bg-apple-blue hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 md:px-6 rounded-xl font-medium transition-colors flex items-center whitespace-nowrap"
                        >
                            <Send size={18} className="mr-1" /> 发送
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};