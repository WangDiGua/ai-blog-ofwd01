import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Avatar } from '../components/ui';
import { request } from '../utils/lib';
import { CommunityPost, Song } from '../types';
import { useStore } from '../context/store';
import { Heart, MessageCircle, Share2, Play, Pause, Hash, Mail, Phone, Send, ChevronLeft, MoreHorizontal, Video as VideoIcon, Mic } from 'lucide-react';

// --- 社区页面 ---
export const Community = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const { isLoggedIn, requireAuth } = useStore();

  useEffect(() => {
    request.get<CommunityPost[]>('/community').then(setPosts);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 mb-20">
      <div className="flex justify-between items-end mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-apple-text dark:text-apple-dark-text">社区</h1>
          <p className="text-apple-subtext dark:text-apple-dark-subtext mt-1 text-sm md:text-base">加入讨论。</p>
        </div>
        <Button onClick={() => requireAuth(() => console.log('post'))}>
          {isLoggedIn ? '发帖' : '登录'}
        </Button>
      </div>

      <div className="space-y-4 md:space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="p-4 md:p-6">
            <div className="flex items-start space-x-3 md:space-x-4">
              <Avatar src={post.author.avatar} alt={post.author.name} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-sm md:text-base text-apple-text dark:text-apple-dark-text truncate">{post.author.name}</h4>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{post.timeAgo}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3 md:mb-4">{post.content}</p>
                <div className="flex items-center space-x-6">
                  <button className="flex items-center space-x-1 text-gray-400 hover:text-red-500 transition-colors">
                    <Heart size={16} /> <span className="text-xs">{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-500 transition-colors">
                    <MessageCircle size={16} /> <span className="text-xs">{post.comments}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-400 hover:text-green-500 transition-colors">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// --- 音乐页面 ---
export const MusicPage = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const { playSong, currentSong, isPlaying, togglePlay } = useStore();

  useEffect(() => {
    request.get<Song[]>('/music').then(setSongs);
  }, []);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 mb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* 左侧: 播放器视觉 */}
        <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-black rounded-3xl shadow-inner border border-white/20">
           <div className={`w-48 h-48 md:w-80 md:h-80 rounded-2xl shadow-2xl overflow-hidden mb-6 md:mb-8 transition-transform duration-700 ease-spring ${isPlaying ? 'scale-105' : 'scale-100'}`}>
              <img 
                src={currentSong ? currentSong.cover : "https://picsum.photos/seed/music/400/400"} 
                alt="Album Art" 
                className="w-full h-full object-cover"
              />
           </div>
           <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-apple-text dark:text-apple-dark-text mb-1">{currentSong?.title || "未选择歌曲"}</h2>
              <p className="text-base md:text-lg text-apple-subtext dark:text-apple-dark-subtext">{currentSong?.artist || "从列表中选择一首歌曲"}</p>
           </div>
           
           <div className="flex items-center space-x-6 md:space-x-8">
              <button className="p-3 md:p-4 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:scale-105 transition-transform">
                <Play className="fill-current rotate-180 text-gray-400" size={20} />
              </button>
              <button 
                onClick={togglePlay}
                className="p-5 md:p-6 rounded-full bg-apple-blue text-white shadow-lg hover:scale-105 transition-transform hover:shadow-blue-500/30"
              >
                {isPlaying ? <Pause size={28} className="fill-current"/> : <Play size={28} className="fill-current ml-1"/>}
              </button>
              <button className="p-3 md:p-4 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:scale-105 transition-transform">
                <Play className="fill-current text-gray-400" size={20} />
              </button>
           </div>
        </div>

        {/* 右侧: 播放列表 */}
        <div className="space-y-3 md:space-y-4">
           <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-apple-text dark:text-apple-dark-text">热门金曲</h2>
           {songs.map((song) => (
             <div 
                key={song.id}
                onClick={() => playSong(song)}
                className={`
                  flex items-center p-2 md:p-3 rounded-xl cursor-pointer transition-all duration-200 group
                  ${currentSong?.id === song.id ? 'bg-white dark:bg-gray-800 shadow-md scale-[1.02]' : 'hover:bg-white/50 dark:hover:bg-gray-800/50 hover:shadow-sm'}
                `}
             >
                <div className="w-8 text-center text-sm font-medium text-gray-400 mr-2 md:mr-4">
                   {currentSong?.id === song.id && isPlaying ? (
                     <span className="flex space-x-0.5 justify-center h-3 items-end">
                       <span className="w-0.5 bg-apple-blue h-full animate-pulse"/>
                       <span className="w-0.5 bg-apple-blue h-2/3 animate-pulse delay-75"/>
                       <span className="w-0.5 bg-apple-blue h-full animate-pulse delay-150"/>
                     </span>
                   ) : (
                     <span className="group-hover:hidden">{song.id}</span>
                   )}
                   <Play size={12} className="hidden group-hover:inline text-apple-blue mx-auto" />
                </div>
                <img src={song.cover} alt="art" className="w-10 h-10 rounded-md shadow-sm mr-3 md:mr-4" />
                <div className="flex-1 min-w-0">
                   <h4 className={`text-sm font-semibold truncate ${currentSong?.id === song.id ? 'text-apple-blue' : 'text-apple-text dark:text-apple-dark-text'}`}>{song.title}</h4>
                   <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
                </div>
                <div className="text-xs text-gray-400 font-medium ml-2">
                  {formatTime(song.duration)}
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

// --- 工具页面 ---
export const Tools = () => (
  <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 mb-20">
    <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-apple-text dark:text-apple-dark-text">开发者工具</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
       {[
           { name: 'JSON 格式化', desc: '美化或压缩 JSON 数据' },
           { name: '时间戳转换', desc: '转换 Unix 时间戳' },
           { name: '颜色提取器', desc: '识别和转换颜色代码' },
           { name: 'Base64 编码', desc: '编码和解码 Base64' },
           { name: 'Lorem Ipsum 生成', desc: '生成占位文本' },
           { name: 'Diff 检查器', desc: '比较文本差异' }
       ].map(tool => (
         <Card key={tool.name} hover className="p-6 flex flex-col items-center justify-center text-center h-40 md:h-48 cursor-pointer border-dashed border-2 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-4 flex items-center justify-center">
               <Hash className="text-apple-blue" size={20} />
            </div>
            <h3 className="font-semibold text-sm md:text-base text-apple-text dark:text-apple-dark-text">{tool.name}</h3>
            <p className="text-xs text-gray-400 mt-2">{tool.desc}</p>
         </Card>
       ))}
    </div>
  </div>
);

// --- 联系页面 (微信风格聊天) ---
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

    // 有新消息时滚动到底部
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

        // 模拟自动回复
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

    // 使用 100dvh 以获得更好的移动浏览器支持 (地址栏处理)
    return (
        <div className="max-w-6xl mx-auto px-2 md:px-4 py-2 md:py-4 h-[calc(100dvh-5rem)] md:h-[calc(100vh-6rem)] mb-20 md:mb-0">
            <div className="flex h-full bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                
                {/* 侧边栏 (联系人列表) */}
                <div className={`w-full md:w-80 flex-shrink-0 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-gray-900/50 ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
                    {/* 侧边栏头部 */}
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

                    {/* 联系人 */}
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

                {/* 主聊天区域 */}
                <div className={`flex-1 flex flex-col bg-white dark:bg-gray-900 ${!selectedContact ? 'hidden md:flex' : 'flex'}`}>
                    {selectedContact ? (
                        <>
                            {/* 聊天头部 */}
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

                            {/* 聊天消息 */}
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

                            {/* 输入区域 */}
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

// --- 关于页面 ---
export const About = () => (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-16 text-center mb-16">
        <Avatar src="https://picsum.photos/id/1005/200/200" alt="Me" size="xl" />
        <h1 className="text-3xl md:text-4xl font-bold mt-6 mb-2 text-apple-text dark:text-apple-dark-text">John Developer</h1>
        <p className="text-lg md:text-xl text-apple-subtext dark:text-apple-dark-subtext mb-8">用像素和爱构建数字体验。</p>
        
        <div className="flex justify-center space-x-4 mb-12">
            <Button>下载简历</Button>
            <Button variant="secondary">联系我</Button>
        </div>

        <div className="text-left bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
           <h3 className="text-lg font-bold mb-4 text-apple-text dark:text-apple-dark-text">哲学</h3>
           <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-sm md:text-base">
             我相信优秀的软件不仅仅是关于代码，更是关于它给用户带来的感受。
             坚持极简、清晰和深度的原则，我致力于创造直观且令人愉悦的界面。
           </p>
           
           <h3 className="text-lg font-bold mb-4 text-apple-text dark:text-apple-dark-text">技术栈</h3>
           <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Tailwind', 'Node.js', 'Next.js', 'Figma', 'GraphQL'].map(skill => (
                  <span key={skill} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">
                      {skill}
                  </span>
              ))}
           </div>
        </div>
    </div>
);