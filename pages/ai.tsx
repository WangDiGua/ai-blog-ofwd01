import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/store';
import { Button, MarkdownRenderer, Spinner } from '../components/ui'; // Import MarkdownRenderer
import { GoogleGenAI } from "@google/genai";
import { Bot, Send, User as UserIcon, Lock, Sparkles, Plus, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import { ChatMessage } from '../types';
import { request } from '../utils/lib';

export const AIAssistant = () => {
    const { user, requireAuth, incrementAiUsage, showToast } = useStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showThinking, setShowThinking] = useState(false);
    const [history, setHistory] = useState<{id: string, title: string, date: string}[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Limit Logic
    const MAX_USAGE = user?.role === 'vip' ? 20 : 10;
    const remaining = MAX_USAGE - (user?.aiUsage || 0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    useEffect(() => {
        // Load mock history
        request.get('/ai/history').then((data: any) => setHistory(data));
    }, []);

    const startNewChat = () => {
        setMessages([]);
        showToast('Started new conversation', 'info');
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        requireAuth(async () => {
            if (remaining <= 0) {
                showToast(`You have reached your limit of ${MAX_USAGE} messages. Upgrade to VIP for more.`, 'error');
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

            // Simulation of Thinking Process
            if (showThinking) {
                await new Promise(r => setTimeout(r, 1500));
            }

            try {
                // Initialize Google GenAI
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'DEMO_KEY' });
                
                let text = '';
                if (!process.env.API_KEY) {
                    await new Promise(r => setTimeout(r, 1000));
                    text = `Here is a sample response including code:\n\nYou asked about: ${userMsg.text}\n\n\`\`\`html\n<h1>Hello from AI</h1>\n<button onclick="alert('Clicked!')">Click Me</button>\n\`\`\``;
                } else {
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: userMsg.text,
                    });
                    text = response.text || "I couldn't generate a response.";
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
                showToast('Failed to connect to AI Assistant', 'error');
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: "Sorry, I encountered an error. Please try again later.",
                    timestamp: Date.now()
                }]);
            } finally {
                setLoading(false);
            }
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-64px)] flex gap-6">
            {/* Sidebar (History/Info) - Hidden on mobile */}
            <div className="hidden md:flex flex-col w-72 flex-shrink-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm h-full">
                <Button onClick={startNewChat} className="w-full mb-6 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-opacity">
                    <Plus size={16} className="mr-2" /> New Chat
                </Button>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center"><Clock size={12} className="mr-1"/> Recent History</h3>
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
                                <span className="text-xs font-bold text-apple-blue uppercase">{user.role.toUpperCase()} Plan</span>
                                <span className="text-xs text-gray-500">{remaining}/{MAX_USAGE} left</span>
                            </div>
                            <div className="w-full bg-white dark:bg-gray-700 rounded-full h-1.5 mb-2">
                                <div 
                                    className="bg-apple-blue h-1.5 rounded-full transition-all duration-1000" 
                                    style={{ width: `${Math.min((user.aiUsage / MAX_USAGE) * 100, 100)}%` }} 
                                />
                            </div>
                            {user.role === 'user' && (
                                <button className="text-xs text-apple-blue font-medium hover:underline w-full text-left">Upgrade to VIP for more &rarr;</button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <p className="text-xs text-gray-500 mb-3">Login to access AI features</p>
                            <Button size="sm" className="w-full" onClick={() => requireAuth(() => {})}>Login</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden relative h-full">
                {/* Header */}
                <div className="h-16 flex-shrink-0 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
                     <div className="flex items-center space-x-3">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                             <Sparkles size={16} />
                         </div>
                         <div>
                             <h2 className="font-semibold text-apple-text dark:text-apple-dark-text leading-tight">Gemini Assistant</h2>
                             <div className="text-[10px] text-green-500 flex items-center"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>Online</div>
                         </div>
                     </div>
                     <div className="flex items-center space-x-2">
                         <span className="text-xs text-gray-500 mr-1">Show Thinking</span>
                         <button onClick={() => setShowThinking(!showThinking)} className="text-apple-blue">
                             {showThinking ? <ToggleRight size={24} /> : <ToggleLeft size={24} className="text-gray-300" />}
                         </button>
                     </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 dark:bg-black/20">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 opacity-50 animate-in fade-in duration-700">
                             <Bot size={48} className="mb-4 text-apple-blue" />
                             <p className="text-lg font-medium text-apple-text dark:text-apple-dark-text">How can I help you today?</p>
                             <p className="text-sm mt-2 max-w-xs">Ask me to generate code, write articles, or explain complex topics.</p>
                        </div>
                    )}
                    
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs mr-2 mt-1 shadow-md">
                                    <Sparkles size={14} />
                                </div>
                            )}
                            <div className={`
                                max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm
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
                             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs mr-2 mt-1 shadow-md">
                                <Sparkles size={14} />
                             </div>
                             <div className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-4 border border-gray-100 dark:border-gray-700 shadow-sm rounded-bl-none">
                                 {showThinking && (
                                     <div className="text-xs text-gray-400 mb-2 font-mono flex items-center">
                                         <span className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></span> Thinking...
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

                {/* Input Area */}
                <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
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
                            placeholder={user ? "Message Gemini..." : "Login to chat"}
                            disabled={!user || remaining <= 0 || loading}
                            className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl py-3 pl-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-apple-blue/50 text-apple-text dark:text-apple-dark-text max-h-32 min-h-[48px]"
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
                    <p className="text-center text-[10px] text-gray-400 mt-2">
                        AI can make mistakes. Check important info.
                    </p>
                </div>
            </div>
        </div>
    );
};