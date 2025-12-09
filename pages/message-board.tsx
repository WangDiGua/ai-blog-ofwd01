import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Button } from '../components/ui';
import { Send, MessageSquare, ChevronLeft } from 'lucide-react'; // Import ChevronLeft
import { useStore } from '../context/store';

interface Danmaku {
    id: number;
    text: string;
    top: number;
    duration: number;
    color: string;
    avatar?: string;
}

const COLORS = ['text-white', 'text-yellow-300', 'text-green-300', 'text-blue-300', 'text-pink-300', 'text-purple-300'];

const INITIAL_MESSAGES = [
    "网站做得真棒！", "前排围观", "博主更新好快", "这是什么神仙特效", "Hello World!", 
    "React 19 太强了", "求源码！", "UI 设计很有品味", "打卡滴滴滴", "期待更多内容"
];

export const MessageBoard = () => {
    const navigate = useNavigate(); // Hook
    const { showToast, user } = useStore();
    const [messages, setMessages] = useState<Danmaku[]>([]);
    const [inputValue, setInputValue] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // 初始化弹幕
    useEffect(() => {
        const initial = INITIAL_MESSAGES.map((msg, i) => createDanmaku(msg, i * 2000));
        setMessages(initial);

        // 持续生成模拟弹幕
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const randomMsg = INITIAL_MESSAGES[Math.floor(Math.random() * INITIAL_MESSAGES.length)];
                addDanmaku(randomMsg);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const createDanmaku = (text: string, delay = 0): Danmaku => ({
        id: Date.now() + Math.random(),
        text,
        top: Math.random() * 80 + 5, // 5% - 85% height
        duration: Math.random() * 10 + 10, // 10s - 20s
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
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
            duration: 15,
            color: 'text-red-500 border border-red-500 px-2 rounded-full font-bold bg-white/10'
        };

        setMessages(prev => [...prev, newDanmaku]);
        setInputValue('');
        showToast('弹幕发送成功！', 'success');
    };

    // 清理超出屏幕的弹幕 (简单模拟，实际可用 onAnimationEnd)
    const handleAnimationEnd = (id: number) => {
        setMessages(prev => prev.filter(m => m.id !== id));
    };

    return (
        <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-gray-900 flex flex-col items-center justify-end pb-20 md:pb-32">
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
            <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={`absolute whitespace-nowrap text-lg md:text-2xl font-medium drop-shadow-md animate-danmaku will-change-transform ${msg.color}`}
                        style={{
                            top: `${msg.top}%`,
                            left: '100%',
                            animationDuration: `${msg.duration}s`
                        }}
                        onAnimationEnd={() => handleAnimationEnd(msg.id)}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes danmaku {
                    from { transform: translateX(0); }
                    to { transform: translateX(-150vw); }
                }
                .animate-danmaku {
                    animation-name: danmaku;
                    animation-timing-function: linear;
                    animation-fill-mode: forwards;
                }
            `}</style>

            {/* 输入区域 */}
            <div className="z-10 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-10 duration-700">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center shadow-2xl">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
                            <MessageSquare className="mr-3" /> 留言板
                        </h1>
                        <p className="text-gray-300">无需登录，发送弹幕与大家互动！</p>
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
                            className="bg-apple-blue hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-xl font-medium transition-colors flex items-center"
                        >
                            <Send size={18} className="mr-1" /> 发送
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};