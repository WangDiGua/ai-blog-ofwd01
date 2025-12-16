import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/store';
import { Avatar, Button, Modal } from '../components/ui';
import { ChevronLeft, MoreHorizontal, Mic, Send, MessageCircle, Pin, Trash2, XCircle, AlertCircle } from 'lucide-react';

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
    isPinned: boolean;
    relation: 'mutual' | 'single' | 'none'; // mutual: 互关, single: 单向/陌生人
}

// 模拟 2 个联系人
// 1. Mutual (互关): 正常聊天
// 2. Single (单向): 限制 1 条消息
const INITIAL_CONTACTS: ContactUser[] = [
    { 
        id: '1', 
        name: 'Alice (互关)', 
        avatar: 'https://ui-avatars.com/api/?name=Alice+Mutual&background=0D8ABC&color=fff', 
        lastMsg: '嘿，设计稿确认了吗？', 
        time: '10:30', 
        unread: 2, 
        isPinned: true, 
        relation: 'mutual' 
    },
    { 
        id: '2', 
        name: 'Bob (陌生人)', 
        avatar: 'https://ui-avatars.com/api/?name=Bob+Single&background=FF5733&color=fff', 
        lastMsg: '等待回复...', 
        time: '昨天', 
        unread: 0, 
        isPinned: false, 
        relation: 'single' 
    },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
    '1': [
        { id: 1, sender: 'them', text: '嗨！你有空吗？', time: '10:00' },
        { id: 2, sender: 'me', text: '有的，怎么了？', time: '10:05' },
        { id: 3, sender: 'them', text: '嘿，设计稿确认了吗？', time: '10:30' },
    ],
    '2': [] // 空记录，测试单条限制
};

export const Contact = () => {
    const { user, requireAuth, showToast } = useStore();
    
    // State
    const [contacts, setContacts] = useState<ContactUser[]>(INITIAL_CONTACTS);
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
    const [inputText, setInputText] = useState('');
    const [showMenu, setShowMenu] = useState(false); // Dropdown menu state
    
    // Derived selected contact (safe lookup)
    const selectedContact = contacts.find(c => c.id === selectedContactId);

    // Refs
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // 滚动到底部逻辑
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    // Auto scroll
    useEffect(() => {
        const timer = setTimeout(scrollToBottom, 50);
        return () => clearTimeout(timer);
    }, [messages, selectedContactId]);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sorted Contacts: Pinned first
    const sortedContacts = [...contacts].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0; // Maintain original order or sort by time/unread
    });

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim() || !selectedContact) return;

        // --- Logic Check: Restriction ---
        if (selectedContact.relation !== 'mutual') {
            // Count messages sent by 'me'
            const myMsgCount = (messages[selectedContact.id] || []).filter(m => m.sender === 'me').length;
            if (myMsgCount >= 1) {
                showToast('对方未关注您，仅可发送一条私信', 'error');
                return;
            }
        }

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
        
        // Update contact last msg
        setContacts(prev => prev.map(c => c.id === selectedContact.id ? {...c, lastMsg: inputText, time: '刚刚'} : c));
        
        setInputText('');

        // Auto Reply (Only for mutual)
        if (selectedContact.relation === 'mutual') {
            setTimeout(() => {
                 const replyMsg: Message = {
                    id: Date.now() + 1,
                    sender: 'them',
                    text: "我收到了你的消息！(自动回复)",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => ({
                    ...prev,
                    [selectedContact.id]: [...(prev[selectedContact.id] || []), replyMsg]
                }));
            }, 1000);
        }
    };

    // --- Actions ---

    const togglePin = () => {
        if (!selectedContact) return;
        const newStatus = !selectedContact.isPinned;
        setContacts(prev => prev.map(c => c.id === selectedContact.id ? { ...c, isPinned: newStatus } : c));
        showToast(newStatus ? '已置顶' : '已取消置顶', 'info');
        setShowMenu(false);
    };

    const clearHistory = () => {
        if (!selectedContact) return;
        setMessages(prev => ({ ...prev, [selectedContact.id]: [] }));
        showToast('聊天记录已清空', 'success');
        setShowMenu(false);
    };

    const deleteSession = () => {
        if (!selectedContact) return;
        setContacts(prev => prev.filter(c => c.id !== selectedContact.id));
        setSelectedContactId(null);
        showToast('会话已删除', 'info');
        setShowMenu(false);
    };

    // Check if input should be disabled
    const isInputDisabled = () => {
        if (!selectedContact) return true;
        if (selectedContact.relation === 'mutual') return false;
        // Non-mutual: check if already sent 1 message
        const myMsgCount = (messages[selectedContact.id] || []).filter(m => m.sender === 'me').length;
        return myMsgCount >= 1;
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
        <div className="max-w-6xl mx-auto px-2 md:px-4 py-2 md:py-4 h-[calc(100vh-6rem)] mb-20 md:mb-0 box-border">
            <div className="flex h-full bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                
                {/* 左侧联系人列表 */}
                <div className={`w-full md:w-80 flex-shrink-0 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-gray-900/50 ${selectedContactId ? 'hidden md:flex' : 'flex'}`}>
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
                        {sortedContacts.length > 0 ? (
                            sortedContacts.map(contact => (
                                <div 
                                    key={contact.id}
                                    onClick={() => setSelectedContactId(contact.id)}
                                    className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative ${selectedContactId === contact.id ? 'bg-blue-50 dark:bg-gray-800' : ''} ${contact.isPinned ? 'bg-gray-50/80 dark:bg-gray-800/30' : ''}`}
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
                                            <div className="flex items-center">
                                                <h4 className="text-sm font-semibold text-apple-text dark:text-apple-dark-text truncate max-w-[100px]">{contact.name}</h4>
                                                {contact.isPinned && <Pin size={12} className="ml-1 text-gray-400 rotate-45 fill-gray-400" />}
                                            </div>
                                            <span className="text-[10px] text-gray-400">{contact.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{contact.lastMsg}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400 text-sm">暂无联系人</div>
                        )}
                    </div>
                </div>

                {/* 右侧聊天窗口 */}
                <div className={`flex-1 flex flex-col bg-white dark:bg-gray-900 ${!selectedContactId ? 'hidden md:flex' : 'flex'}`}>
                    {selectedContact ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-14 md:h-16 flex items-center justify-between px-3 md:px-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur sticky top-0 z-10 relative">
                                <div className="flex items-center">
                                    <button onClick={() => setSelectedContactId(null)} className="md:hidden mr-2 p-1 text-gray-500">
                                        <ChevronLeft size={24} />
                                    </button>
                                    <div>
                                        <div className="flex items-center">
                                            <h3 className="font-semibold text-sm md:text-base text-apple-text dark:text-apple-dark-text">{selectedContact.name}</h3>
                                            {selectedContact.relation !== 'mutual' && (
                                                <span className="ml-2 text-[10px] border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded text-gray-400">
                                                    陌生人
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-400 md:hidden">在线</span>
                                    </div>
                                </div>
                                
                                {/* Actions Dropdown */}
                                <div className="relative" ref={menuRef}>
                                    <button 
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>
                                    
                                    {/* Dropdown Content */}
                                    {showMenu && (
                                        <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                            <button onClick={togglePin} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center text-gray-700 dark:text-gray-200">
                                                <Pin size={16} className="mr-2" /> {selectedContact.isPinned ? '取消置顶' : '置顶会话'}
                                            </button>
                                            <button onClick={clearHistory} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center text-gray-700 dark:text-gray-200">
                                                <Trash2 size={16} className="mr-2" /> 清空记录
                                            </button>
                                            <button onClick={deleteSession} className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center text-red-500">
                                                <XCircle size={16} className="mr-2" /> 删除会话
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div 
                                className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50/50 dark:bg-black/20"
                                ref={chatContainerRef} // Ref 绑定到容器
                            >
                                {selectedContact.relation !== 'mutual' && (
                                    <div className="flex justify-center my-4">
                                        <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs px-3 py-1.5 rounded-lg flex items-center">
                                            <AlertCircle size={12} className="mr-1.5"/>
                                            对方未关注您，您仅可发送一条私信。
                                        </div>
                                    </div>
                                )}

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
                            </div>

                            {/* Input Area */}
                            <div className="p-3 md:p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                                    <button type="button" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30" disabled={isInputDisabled()}>
                                        <Mic size={20} />
                                    </button>
                                    <input 
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder={isInputDisabled() ? "无法发送更多消息" : "输入消息..."}
                                        disabled={isInputDisabled()}
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!inputText.trim() || isInputDisabled()}
                                        className="p-2 bg-apple-blue text-white rounded-full disabled:opacity-50 disabled:bg-gray-400 hover:bg-blue-600 transition-colors"
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