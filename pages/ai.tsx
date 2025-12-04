import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/store';
import { Button, Avatar, Card, Spinner } from '../components/ui';
import { GoogleGenAI } from "@google/genai";
import { Bot, Send, User as UserIcon, Lock, Sparkles, Plus } from 'lucide-react';
import { ChatMessage } from '../types';

export const AIAssistant = () => {
    const { user, requireAuth, incrementAiUsage, showToast } = useStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Limit Logic
    const MAX_USAGE = user?.role === 'vip' ? 20 : 10;
    const remaining = MAX_USAGE - (user?.aiUsage || 0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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

            try {
                // Initialize Google GenAI
                // Note: In a real environment, ensure process.env.API_KEY is available.
                // If checking locally without key, this might fail, so we wrap in try/catch.
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'DEMO_KEY' });
                
                let text = '';
                
                if (!process.env.API_KEY) {
                    // Fallback simulation for demo if no key
                    await new Promise(r => setTimeout(r, 1500));
                    text = "I am a simulated AI response because no API Key was provided in the environment. In a real deployment, I would use the Google Gemini API to answer: " + userMsg.text;
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
        <div className="max-w-5xl mx-auto px-4 py-6 h-[calc(100vh-80px)] flex gap-6">
            {/* Sidebar (History/Info) */}
            <div className="hidden md:flex flex-col w-64 flex-shrink-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                <Button className="w-full mb-6 flex items-center justify-center bg-apple-text dark:bg-white text-white dark:text-black hover:opacity-90">
                    <Plus size={16} className="mr-2" /> New Chat
                </Button>

                <div className="flex-1 overflow-y-auto">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Today</h3>
                    <div className="space-y-2">
                        <div className="p-3 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 truncate cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
                            React Optimization Tips
                        </div>
                        <div className="p-3 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 truncate cursor-pointer">
                            CSS Grid vs Flexbox
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
                    {user ? (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-apple-blue uppercase">{user.role === 'vip' ? 'VIP Plan' : 'Free Plan'}</span>
                                <span className="text-xs text-gray-500">{remaining}/{MAX_USAGE} left</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div 
                                    className="bg-apple-blue h-1.5 rounded-full transition-all" 
                                    style={{ width: `${(user.aiUsage / MAX_USAGE) * 100}%` }} 
                                />
                            </div>
                            {user.role !== 'vip' && (
                                <button className="text-xs text-apple-blue mt-2 hover:underline w-full text-left">Upgrade to VIP &rarr;</button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-2">Login to chat with AI</p>
                            <Button size="sm" className="w-full" onClick={() => requireAuth(() => {})}>Login</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden relative">
                {/* Header */}
                <div className="h-16 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
                     <div className="flex items-center space-x-3">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white">
                             <Sparkles size={16} />
                         </div>
                         <h2 className="font-semibold text-apple-text dark:text-apple-dark-text">Gemini Assistant</h2>
                     </div>
                     <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200">Online</span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 dark:bg-black/20">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 opacity-50">
                             <Bot size={48} className="mb-4" />
                             <p className="text-lg font-medium">How can I help you today?</p>
                        </div>
                    )}
                    
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm
                                ${msg.role === 'user' 
                                    ? 'bg-apple-blue text-white rounded-br-sm' 
                                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-sm'}
                            `}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                             <div className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-4 border border-gray-100 dark:border-gray-700 shadow-sm rounded-bl-sm flex items-center space-x-2">
                                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300" />
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
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
                            className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl py-3 pl-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-apple-blue/50 text-apple-text dark:text-apple-dark-text max-h-32"
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
