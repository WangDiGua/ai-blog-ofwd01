import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/store';
import { Button, MarkdownRenderer } from '../components/ui';
import { GoogleGenAI } from "@google/genai";
import { Bot, Send, Sparkles, Plus, ToggleLeft, ToggleRight, Clock, Menu, X } from 'lucide-react';
import { ChatMessage } from '../types';
import { request } from '../utils/lib';

export const AIAssistant = () => {
    const { user, requireAuth, incrementAiUsage, showToast } = useStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showThinking, setShowThinking] = useState(false);
    const [history, setHistory] = useState<{id: string, title: string, date: string}[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 移动端侧边栏状态
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 限制逻辑
    const MAX_USAGE = user?.role === 'vip' ? 20 : 10;
    const remaining = MAX_USAGE - (user?.aiUsage || 0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    useEffect(() => {
        // 加载模拟历史记录
        request.get('/ai/history').then((data: any) => setHistory(data));
    }, []);

    const startNewChat = () => {
        setMessages([]);
        showToast('已开始新对话', 'info');
        if (window.innerWidth < 768) setIsSidebarOpen(false);
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        requireAuth(async () => {
            if (remaining <= 0) {
                showToast(`您已达到 ${MAX_USAGE} 条消息的限制。升级 VIP 以获取更多。`, 'error');
                return;
            }

            const userMsg: ChatMessage = {
                id: Date.now().toString(),
                role: 'user',
                text: input,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, userMsg]);
            setInput('');
            setLoading(true);

            // 模拟思考过程
            if (showThinking) {
                await new Promise(r => setTimeout(r, 1500));
            }

            try {
                // 初始化 Google GenAI
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'DEMO_KEY' });
                
                let text = '';
                if (!process.env.API_KEY) {
                    await new Promise(r => setTimeout(r, 1000));
                    text = `这是一个包含代码的示例响应：\n\n您询问了：${userMsg.text}\n\n\`\`\`html\n<h1>来自 AI 的问候</h1>\n<button onclick="alert('点击了！')">点我</button>\n\`\`\``;
                } else {
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: userMsg.text,
                    });
                    text = response.text || "我无法生成响应。";
                }

                const aiMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'model',
                    text: text,
                    timestamp: Date.now()
                };

                setMessages(prev => [...prev, aiMsg]);
                await incrementAiUsage();

            } catch (error) {
                console.error("AI Error:", error);
                showToast('无法连接到 AI 助手', 'error');
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: "抱歉，我遇到了错误。请稍后再试。",
                    timestamp: Date.now()
                }]);
            } finally {
                setLoading(false);
            }
        });
    };

    // 使用 dvh 以兼容移动浏览器高度，添加 mt-4 避免遮挡
    return (
        <div className="max-w-7xl mx-auto px-2 md:px-4 h-[calc(100vh-8rem)] md:h-[calc(100vh-8rem)] flex gap-4 md:gap-6 box-border pb-2 md:pb-4 relative mt-4">
            
            {/* 移动端侧边栏遮罩 */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* 侧边栏 (历史/信息) - 响应式抽屉 */}
            <div className={`
                fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 shadow-xl transform transition-transform duration-300 ease-in-out
                md:relative md:transform-none md:flex md:flex-col md:w-72 md:flex-shrink-0 md:rounded-2xl md:border md:shadow-sm md:h-full md:z-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex justify-between items-center md:hidden mb-4">
                    <h2 className="font-bold text-lg">历史记录</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <Button onClick={startNewChat} className="w-full mb-6 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-opacity">
                    <Plus size={16} className="mr-2" /> 新对话
                </Button>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center"><Clock size={12} className="mr-1"/> 最近记录</h3>
                        <div className="space-y-2">
                            {history.map(item => (
                                <div key={item.id} className="p-3 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                                    <div className="font-medium truncate">{item.title}</div>
                                    <div className="text-xs text-gray-400 mt-1">{item.date}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
                    {user ? (
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-apple-blue uppercase">{user.role.toUpperCase()} 套餐</span>
                                <span className="text-xs text-gray-500">剩余 {remaining}/{MAX_USAGE}</span>
                            </div>
                            <div className="w-full bg-white dark:bg-gray-700 rounded-full h-1.5 mb-2">
                                <div 
                                    className="bg-apple-blue h-1.5 rounded-full transition-all duration-1000" 
                                    style={{ width: `${Math.min((user.aiUsage / MAX_USAGE) * 100, 100)}%` }} 
                                />
                            </div>
                            {user.role === 'user' && (
                                <button className="text-xs text-apple-blue font-medium hover:underline w-full text-left">升级到 VIP 获取更多 &rarr;</button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <p className="text-xs text-gray-500 mb-3">登录以使用 AI 功能</p>
                            <Button size="sm" className="w-full" onClick={() => requireAuth(() => {})}>登录</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* 聊天区域 */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden relative h-full">
                {/* 头部 */}
                <div className="h-16 flex-shrink-0 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
                     <div className="flex items-center space-x-3">
                         <button 
                            onClick={() => setIsSidebarOpen(true)} 
                            className="md:hidden p-2 -ml-2 text-gray-500 hover:text-apple-blue"
                         >
                            <Menu size={24} />
                         </button>
                         <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                             <Sparkles size={16} />
                         </div>
                         <div>
                             <h2 className="font-semibold text-apple-text dark:text-apple-dark-text leading-tight text-sm md:text-base">Gemini 助手</h2>
                             <div className="text-[10px] text-green-500 flex items-center"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>在线</div>
                         </div>
                     </div>
                     <div className="flex items-center space-x-2">
                         <span className="text-[10px] md:text-xs text-gray-500 mr-1 hidden sm:inline">显示思考过程</span>
                         <button onClick={() => setShowThinking(!showThinking)} className="text-apple-blue">
                             {showThinking ? <ToggleRight size={24} /> : <ToggleLeft size={24} className="text-gray-300" />}
                         </button>
                     </div>
                </div>

                {/* 消息 */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-gray-50/30 dark:bg-black/20">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 opacity-50 animate-in fade-in duration-700">
                             <Bot size={48} className="mb-4 text-apple-blue" />
                             <p className="text-lg font-medium text-apple-text dark:text-apple-dark-text">今天我能为您做什么？</p>
                             <p className="text-sm mt-2 max-w-xs">让我生成代码、撰写文章或解释复杂主题。</p>
                        </div>
                    )}
                    
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && (
                                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs mr-2 mt-1 shadow-md flex-shrink-0">
                                    <Sparkles size={12} />
                                </div>
                            )}
                            <div className={`
                                max-w-[90%] md:max-w-[85%] rounded-2xl px-4 py-3 md:px-5 md:py-4 text-sm leading-relaxed shadow-sm
                                ${msg.role === 'user' 
                                    ? 'bg-apple-blue text-white rounded-br-none' 
                                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none'}
                            `}>
                                {msg.role === 'model' ? (
                                    <MarkdownRenderer content={msg.text} />
                                ) : (
                                    msg.text
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {loading && (
                        <div className="flex justify-start">
                             <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs mr-2 mt-1 shadow-md flex-shrink-0">
                                <Sparkles size={12} />
                             </div>
                             <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-100 dark:border-gray-700 shadow-sm rounded-bl-none">
                                 {showThinking && (
                                     <div className="text-xs text-gray-400 mb-2 font-mono flex items-center">
                                         <span className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></span> 思考中...
                                     </div>
                                 )}
                                 <div className="flex items-center space-x-1">
                                     <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                     <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" />
                                     <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-300" />
                                 </div>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* 输入区域 */}
                <div className="flex-shrink-0 p-3 md:p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                    <div className="relative flex items-center max-w-4xl mx-auto">
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={user ? "发送给 Gemini..." : "登录以聊天"}
                            disabled={!user || remaining <= 0 || loading}
                            className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl py-3 pl-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-apple-blue/50 text-apple-text dark:text-apple-dark-text max-h-32 min-h-[48px] text-sm"
                            rows={1}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim() || loading || !user}
                            className="absolute right-2 p-2 bg-apple-blue text-white rounded-xl disabled:opacity-50 disabled:bg-gray-400 hover:scale-105 transition-all shadow-md"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};