import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/store';
import { Avatar, Button } from '../components/ui';
import { ChevronLeft, MoreHorizontal, Mic, Send, MessageCircle } from 'lucide-react';

interface Message {
  id: number;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

interface ContactUser {
    id: string;
    name: string;
    avatar: string;
    lastMsg: string;
    time: string;
    unread: number;
}

const INITIAL_CONTACTS: ContactUser[] = [
    { id: '1', name: 'Alice 设计师', avatar: 'https://ui-avatars.com/api/?name=Alice+D&background=0D8ABC&color=fff', lastMsg: '嘿，你看过新的设计稿了吗？', time: '10:30', unread: 2 },
    { id: '2', name: 'Bob 工程师', avatar: 'https://ui-avatars.com/api/?name=Bob+E&background=FF5733&color=fff', lastMsg: 'PR 已经合并了。', time: '昨天', unread: 0 },
    { id: '3', name: '产品团队', avatar: 'https://ui-avatars.com/api/?name=Product&background=6C3483&color=fff', lastMsg: '下午3点开会', time: '周一', unread: 5 },
    { id: '4', name: '客服机器人', avatar: 'https://ui-avatars.com/api/?name=Bot&background=28B463&color=fff', lastMsg: '有什么可以帮您的吗？', time: '周日', unread: 0 },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
    '1': [
        { id: 1, sender: 'them', text: '嗨！你有空吗？', time: '10:00' },
        { id: 2, sender: 'me', text: '有的，怎么了？', time: '10:05' },
        { id: 3, sender: 'them', text: '我们可以审查一下 Figma 文件吗？', time: '10:15' },
        { id: 4, sender: 'them', text: '嘿，你看过新的设计稿了吗？', time: '10:30' },
    ],
    '2': [
        { id: 1, sender: 'me', text: '后端准备好了吗？', time: '昨天' },
        { id: 2, sender: 'them', text: '快好了。', time: '昨天' },
        { id: 3, sender: 'them', text: 'PR 已经合并了。', time: '昨天' },
    ]
};

export const Contact = () => {
    const { user, requireAuth } = useStore();
    const [selectedContact, setSelectedContact] = useState<ContactUser | null>(null);
    const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
    const [inputText, setInputText] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedContact]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim() || !selectedContact) return;

        const newMsg: Message = {
            id: Date.now(),
            sender: 'me',
            text: inputText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => ({
            ...prev,
            [selectedContact.id]: [...(prev[selectedContact.id] || []), newMsg]
        }));
        setInputText('');

        setTimeout(() => {
             const replyMsg: Message = {
                id: Date.now() + 1,
                sender: 'them',
                text: "我只是个演示机器人，但我收到了你的消息！",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => ({
                ...prev,
                [selectedContact.id]: [...(prev[selectedContact.id] || []), replyMsg]
            }));
        }, 1000);
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
                 <h2 className="text-2xl font-bold mb-4 text-apple-text dark:text-apple-dark-text">需要登录</h2>
                 <p className="mb-6 text-gray-500">请登录以访问聊天室。</p>
                 <Button onClick={() => requireAuth(() => {})}>立即登录</Button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-2 md:px-4 py-2 md:py-4 h-[calc(100dvh-5rem)] md:h-[calc(100vh-6rem)] mb-20 md:mb-0">
            <div className="flex h-full bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                
                <div className={`w-full md:w-80 flex-shrink-0 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-gray-900/50 ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-3 md:p-4 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur">
                        <div className="flex items-center space-x-3 mb-3 md:mb-4">
                            <Avatar src={user.avatar} alt="Me" size="md" />
                            <div>
                                <h3 className="font-semibold text-sm md:text-base text-apple-text dark:text-apple-dark-text">{user.name}</h3>
                                <div className="flex items-center text-xs text-green-500">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> 在线
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                             <input 
                                className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text"
                                placeholder="搜索..."
                             />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {INITIAL_CONTACTS.map(contact => (
                            <div 
                                key={contact.id}
                                onClick={() => setSelectedContact(contact)}
                                className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${selectedContact?.id === contact.id ? 'bg-blue-50 dark:bg-gray-800' : ''}`}
                            >
                                <div className="relative">
                                    <Avatar src={contact.avatar} alt={contact.name} size="md" />
                                    {contact.unread > 0 && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                                            {contact.unread}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 ml-3 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-sm font-semibold text-apple-text dark:text-apple-dark-text truncate">{contact.name}</h4>
                                        <span className="text-[10px] text-gray-400">{contact.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{contact.lastMsg}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`flex-1 flex flex-col bg-white dark:bg-gray-900 ${!selectedContact ? 'hidden md:flex' : 'flex'}`}>
                    {selectedContact ? (
                        <>
                            <div className="h-14 md:h-16 flex items-center justify-between px-3 md:px-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur sticky top-0 z-10">
                                <div className="flex items-center">
                                    <button onClick={() => setSelectedContact(null)} className="md:hidden mr-2 p-1 text-gray-500">
                                        <ChevronLeft size={24} />
                                    </button>
                                    <div>
                                        <h3 className="font-semibold text-sm md:text-base text-apple-text dark:text-apple-dark-text">{selectedContact.name}</h3>
                                        <span className="text-[10px] text-gray-400 md:hidden">在线</span>
                                    </div>
                                </div>
                                <button className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50/50 dark:bg-black/20">
                                {(messages[selectedContact.id] || []).map(msg => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] md:max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                            msg.sender === 'me' 
                                            ? 'bg-apple-blue text-white rounded-br-none' 
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none'
                                        }`}>
                                            <p>{msg.text}</p>
                                            <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-blue-100' : 'text-gray-400'}`}>{msg.time}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-3 md:p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                                    <button type="button" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                        <Mic size={20} />
                                    </button>
                                    <input 
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text"
                                        placeholder="输入消息..."
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!inputText.trim()}
                                        className="p-2 bg-apple-blue text-white rounded-full disabled:opacity-50 hover:bg-blue-600 transition-colors"
                                    >
                                        <Send size={18} className="ml-0.5" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <MessageCircle size={64} className="mb-4 opacity-20" />
                            <p className="text-lg">选择联系人开始聊天</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};