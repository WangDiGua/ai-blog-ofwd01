import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Avatar, Modal, ToastContainer } from '../components/ui';
import { request } from '../utils/lib';
import { CommunityPost, Song, User } from '../types';
import { useStore } from '../context/store';
import { Heart, MessageCircle, Share2, Play, Pause, Hash, Mail, Phone, Send, ChevronLeft, MoreHorizontal, Video as VideoIcon, Mic, ThumbsUp, Copy, RefreshCw, ArrowRightLeft, Check, AlertCircle, Clock, Type } from 'lucide-react';

// --- 类型定义 ---
interface CommentMock {
  id: number;
  user: string;
  avatar: string;
  content: string;
  time: string;
}

// --- 社区页面 ---
export const Community = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const { isLoggedIn, requireAuth, showToast, user } = useStore();
  
  // 本地状态：记录点赞的帖子ID
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  // 本地状态：展开评论的帖子ID
  const [activePostId, setActivePostId] = useState<string | null>(null);
  // 本地状态：评论输入框内容
  const [commentInput, setCommentInput] = useState('');
  // 本地状态：模拟的评论列表数据 (key: postId, value: comments)
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentMock[]>>({});

  useEffect(() => {
    request.get<CommunityPost[]>('/community').then(data => {
        setPosts(data);
        // 初始化一些模拟评论数据
        const initialComments: Record<string, CommentMock[]> = {};
        data.forEach(p => {
            initialComments[p.id] = [
                { id: 1, user: 'Alice', avatar: 'https://ui-avatars.com/api/?name=Alice&background=random', content: '这个设计太棒了！', time: '10分钟前' },
                { id: 2, user: 'Bob', avatar: 'https://ui-avatars.com/api/?name=Bob&background=random', content: '同感，非常流畅。', time: '5分钟前' }
            ];
        });
        setCommentsMap(initialComments);
    });
  }, []);

  const handleLike = (postId: string) => {
    requireAuth(() => {
      const isLiked = likedPosts.has(postId);
      const newLikedPosts = new Set(likedPosts);
      
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, likes: p.likes + (isLiked ? -1 : 1) };
        }
        return p;
      }));

      if (isLiked) {
        newLikedPosts.delete(postId);
        showToast('已取消点赞');
      } else {
        newLikedPosts.add(postId);
        showToast('点赞成功', 'success');
      }
      setLikedPosts(newLikedPosts);
    });
  };

  const handleShare = async (post: CommunityPost) => {
    // 确保 URL 对 Web Share API 有效
    let url = window.location.href;
    try {
        const urlObj = new URL(url);
        // 如果不是 http/https (例如 about:srcdoc)，Web Share API 可能会拒绝
        if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
            url = 'https://iblog.app'; // 使用一个有效的占位符或首页
        }
    } catch {
        url = 'https://iblog.app';
    }

    const shareData = {
      title: 'iBlog 社区',
      text: `${post.author.name}: ${post.content}`,
      url: url
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        throw new Error("Share API not supported or invalid data");
      }
    } catch (error) {
      // 降级处理：复制到剪贴板
      try {
          await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
          showToast('链接已复制到剪贴板', 'success');
      } catch (clipboardError) {
          showToast('无法分享', 'error');
      }
    }
  };

  const toggleComments = (postId: string) => {
      if (activePostId === postId) {
          setActivePostId(null);
      } else {
          setActivePostId(postId);
      }
  };

  const submitComment = (postId: string) => {
      requireAuth(() => {
          if (!commentInput.trim()) return;
          
          const newComment: CommentMock = {
              id: Date.now(),
              user: user?.name || '我',
              avatar: user?.avatar || '',
              content: commentInput,
              time: '刚刚'
          };

          setCommentsMap(prev => ({
              ...prev,
              [postId]: [...(prev[postId] || []), newComment]
          }));
          
          // 更新帖子评论数显示
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
          
          setCommentInput('');
          showToast('评论已发布', 'success');
      });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 mb-20">
      <div className="flex justify-between items-end mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-apple-text dark:text-apple-dark-text">社区</h1>
          <p className="text-apple-subtext dark:text-apple-dark-subtext mt-1 text-sm md:text-base">加入讨论。</p>
        </div>
        <Button onClick={() => requireAuth(() => showToast('发帖功能开发中...', 'info'))}>
          {isLoggedIn ? '发帖' : '登录'}
        </Button>
      </div>

      <div className="space-y-4 md:space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="p-4 md:p-6 transition-all duration-300">
            <div className="flex items-start space-x-3 md:space-x-4">
              <Avatar src={post.author.avatar} alt={post.author.name} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-sm md:text-base text-apple-text dark:text-apple-dark-text truncate">{post.author.name}</h4>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{post.timeAgo}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3 md:mb-4 whitespace-pre-wrap">{post.content}</p>
                
                {/* 操作栏 */}
                <div className="flex items-center space-x-6 border-t border-gray-100 dark:border-gray-800 pt-3">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-1 transition-colors ${likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                  >
                    <Heart size={18} className={likedPosts.has(post.id) ? 'fill-current' : ''} /> 
                    <span className="text-xs font-medium">{post.likes}</span>
                  </button>
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className={`flex items-center space-x-1 transition-colors ${activePostId === post.id ? 'text-apple-blue' : 'text-gray-400 hover:text-apple-blue'}`}
                  >
                    <MessageCircle size={18} className={activePostId === post.id ? 'fill-current' : ''}/> 
                    <span className="text-xs font-medium">{post.comments}</span>
                  </button>
                  <button 
                    onClick={() => handleShare(post)}
                    className="flex items-center space-x-1 text-gray-400 hover:text-green-500 transition-colors"
                  >
                    <Share2 size={18} />
                  </button>
                </div>

                {/* 评论区 (折叠) */}
                {activePostId === post.id && (
                    <div className="mt-4 animate-in slide-in-from-top-2 fade-in">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 md:p-4 space-y-4">
                            {/* 评论列表 */}
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                {commentsMap[post.id]?.map(comment => (
                                    <div key={comment.id} className="flex space-x-2">
                                        <Avatar src={comment.avatar} alt={comment.user} size="sm" />
                                        <div className="flex-1 bg-white dark:bg-gray-800 p-2 rounded-lg rounded-tl-none shadow-sm text-sm">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-semibold text-apple-text dark:text-apple-dark-text text-xs">{comment.user}</span>
                                                <span className="text-[10px] text-gray-400">{comment.time}</span>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {(!commentsMap[post.id] || commentsMap[post.id].length === 0) && (
                                    <p className="text-center text-gray-400 text-xs py-2">暂无评论，抢沙发！</p>
                                )}
                            </div>

                            {/* 输入框 */}
                            <div className="flex space-x-2 items-end">
                                <Avatar src={user?.avatar || 'https://ui-avatars.com/api/?name=Guest'} alt="Me" size="sm" />
                                <div className="flex-1 relative">
                                    <textarea 
                                        className="w-full bg-white dark:bg-gray-800 border-none rounded-xl p-2 text-sm focus:ring-2 focus:ring-apple-blue outline-none resize-none text-apple-text dark:text-apple-dark-text"
                                        rows={1}
                                        placeholder="写下你的评论..."
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(post.id); }}}
                                    />
                                </div>
                                <Button size="sm" onClick={() => submitComment(post.id)} disabled={!commentInput.trim()}>
                                    <Send size={14} />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// --- 音乐页面 (保持不变) ---
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

// --- 开发者工具组件集 ---

// 1. JSON 格式化工具
const JsonTool = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    const format = () => {
        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, 2));
            setError('');
        } catch (e) {
            setError('无效的 JSON 格式');
            setOutput('');
        }
    };

    const compress = () => {
         try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed));
            setError('');
        } catch (e) {
            setError('无效的 JSON 格式');
            setOutput('');
        }
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            <textarea 
                className="w-full h-32 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-mono border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text"
                placeholder="在此粘贴 JSON..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex space-x-2">
                <Button size="sm" onClick={format}>美化</Button>
                <Button size="sm" variant="secondary" onClick={compress}>压缩</Button>
                <Button size="sm" variant="secondary" onClick={() => {setInput(''); setOutput(''); setError('');}}>清空</Button>
            </div>
            {error && <div className="text-red-500 text-xs flex items-center"><AlertCircle size={12} className="mr-1"/>{error}</div>}
            <div className="flex-1 relative">
                <textarea 
                    readOnly
                    className="w-full h-full p-3 bg-gray-900 text-green-400 rounded-lg text-xs font-mono border-none outline-none"
                    value={output}
                    placeholder="结果将显示在这里..."
                />
                {output && (
                    <button 
                        onClick={() => navigator.clipboard.writeText(output)}
                        className="absolute top-2 right-2 p-1.5 bg-gray-800 rounded text-gray-400 hover:text-white"
                        title="复制"
                    >
                        <Copy size={14}/>
                    </button>
                )}
            </div>
        </div>
    );
};

// 2. 时间戳转换工具
const TimeTool = () => {
    const [now, setNow] = useState(Math.floor(Date.now() / 1000));
    const [tsInput, setTsInput] = useState('');
    const [dateResult, setDateResult] = useState('');
    const [dateInput, setDateInput] = useState('');
    const [tsResult, setTsResult] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
        return () => clearInterval(timer);
    }, []);

    const convertTs = () => {
        if (!tsInput) return;
        const ts = parseInt(tsInput);
        // 判断是秒还是毫秒 (简单判断：如果小于 10000000000 视为秒)
        const date = new Date(ts < 10000000000 ? ts * 1000 : ts);
        setDateResult(date.toLocaleString());
    };

    const convertDate = () => {
        if (!dateInput) return;
        const ts = new Date(dateInput).getTime();
        setTsResult(isNaN(ts) ? '无效日期' : Math.floor(ts / 1000).toString());
    };

    return (
        <div className="space-y-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-xs text-gray-500 uppercase">当前 Unix 时间戳</div>
                <div className="text-3xl font-mono font-bold text-apple-blue mt-1">{now}</div>
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-semibold">时间戳转日期</h4>
                <div className="flex space-x-2">
                    <input 
                        className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-sm font-mono"
                        placeholder="Unix 时间戳"
                        value={tsInput}
                        onChange={(e) => setTsInput(e.target.value)}
                    />
                    <Button size="sm" onClick={convertTs}>转换</Button>
                </div>
                {dateResult && <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm text-green-600 dark:text-green-400 font-medium">{dateResult}</div>}
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-semibold">日期转时间戳</h4>
                <div className="flex space-x-2">
                    <input 
                        type="datetime-local"
                        className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-sm"
                        value={dateInput}
                        onChange={(e) => setDateInput(e.target.value)}
                    />
                    <Button size="sm" onClick={convertDate}>转换</Button>
                </div>
                {tsResult && <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm text-green-600 dark:text-green-400 font-mono font-medium">{tsResult}</div>}
            </div>
        </div>
    );
};

// 3. 颜色提取器
const ColorTool = () => {
    const [color, setColor] = useState('#0071e3');
    const [hex, setHex] = useState('#0071e3');
    const [rgb, setRgb] = useState('rgb(0, 113, 227)');

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setColor(val);
        setHex(val);
        const rgbVal = hexToRgb(val);
        if (rgbVal) setRgb(rgbVal);
    };

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setHex(val);
        if (/^#[0-9A-F]{6}$/i.test(val)) {
            setColor(val);
            const rgbVal = hexToRgb(val);
            if (rgbVal) setRgb(rgbVal);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                 <input 
                    type="color" 
                    value={color}
                    onChange={handleColorChange}
                    className="w-20 h-20 p-1 bg-white dark:bg-gray-800 rounded-xl cursor-pointer shadow-sm border border-gray-200 dark:border-gray-700"
                 />
                 <div className="flex-1 space-y-3">
                     <div>
                         <label className="text-xs text-gray-500 block mb-1">HEX</label>
                         <div className="flex items-center">
                             <input 
                                className="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-sm font-mono uppercase"
                                value={hex}
                                onChange={handleHexChange}
                             />
                             <button className="ml-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500" onClick={() => navigator.clipboard.writeText(hex)}>
                                 <Copy size={16}/>
                             </button>
                         </div>
                     </div>
                     <div>
                         <label className="text-xs text-gray-500 block mb-1">RGB</label>
                         <div className="flex items-center">
                             <input 
                                className="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-sm font-mono"
                                value={rgb}
                                readOnly
                             />
                             <button className="ml-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500" onClick={() => navigator.clipboard.writeText(rgb)}>
                                 <Copy size={16}/>
                             </button>
                         </div>
                     </div>
                 </div>
            </div>
            <div className="p-4 rounded-xl text-white text-center font-bold shadow-inner" style={{ backgroundColor: color }}>
                预览效果 PREVIEW
            </div>
        </div>
    );
};

// 4. Base64 编码
const Base64Tool = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');

    const process = () => {
        try {
            if (mode === 'encode') {
                // 处理 UTF-8 字符
                setOutput(btoa(unescape(encodeURIComponent(input))));
            } else {
                setOutput(decodeURIComponent(escape(atob(input))));
            }
        } catch (e) {
            setOutput('错误：无效的输入');
        }
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-center space-x-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg self-center">
                <button 
                    onClick={() => { setMode('encode'); setOutput(''); }} 
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'encode' ? 'bg-white dark:bg-gray-700 shadow text-apple-blue' : 'text-gray-500'}`}
                >
                    编码
                </button>
                <button 
                    onClick={() => { setMode('decode'); setOutput(''); }} 
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'decode' ? 'bg-white dark:bg-gray-700 shadow text-apple-blue' : 'text-gray-500'}`}
                >
                    解码
                </button>
            </div>
            
            <textarea 
                className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-mono border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-apple-blue outline-none resize-none text-apple-text dark:text-apple-dark-text"
                placeholder={mode === 'encode' ? "输入文本..." : "输入 Base64..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            
            <Button className="w-full" onClick={process}>
                <ArrowRightLeft size={16} className="mr-2"/> {mode === 'encode' ? '编码' : '解码'}
            </Button>
            
            <div className="flex-1 relative">
                <textarea 
                    readOnly
                    className="w-full h-full p-3 bg-gray-100 dark:bg-gray-900 rounded-lg text-xs font-mono border-none outline-none resize-none text-apple-text dark:text-apple-dark-text"
                    value={output}
                    placeholder="结果..."
                />
                 {output && (
                    <button 
                        onClick={() => navigator.clipboard.writeText(output)}
                        className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded shadow text-gray-400 hover:text-apple-blue"
                        title="复制"
                    >
                        <Copy size={14}/>
                    </button>
                )}
            </div>
        </div>
    );
};

// 5. Lorem Ipsum
const LoremTool = () => {
    const [count, setCount] = useState(3);
    const [text, setText] = useState('');

    const generate = () => {
        const sentences = [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            "The quick brown fox jumps over the lazy dog.",
            "Pack my box with five dozen liquor jugs."
        ];
        
        let result = [];
        for(let i=0; i<count; i++) {
            // 随机组合 3-6 个句子成一段
            const numSentences = Math.floor(Math.random() * 4) + 3;
            let paragraph = "";
            for(let j=0; j<numSentences; j++) {
                paragraph += sentences[Math.floor(Math.random() * sentences.length)] + " ";
            }
            result.push(paragraph.trim());
        }
        setText(result.join('\n\n'));
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">段落数: {count}</span>
                <input 
                    type="range" min="1" max="10" 
                    value={count} onChange={(e) => setCount(parseInt(e.target.value))}
                    className="flex-1 accent-apple-blue"
                />
                <Button size="sm" onClick={generate}>生成</Button>
            </div>
            <textarea 
                readOnly
                className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm leading-relaxed border border-gray-200 dark:border-gray-700 resize-none text-apple-text dark:text-apple-dark-text"
                value={text}
                placeholder="点击生成以获取文本..."
            />
            {text && (
                <Button variant="secondary" onClick={() => navigator.clipboard.writeText(text)}>
                    <Copy size={16} className="mr-2"/> 复制全部
                </Button>
            )}
        </div>
    );
};

// 6. Diff 检查器 (简单行级)
const DiffTool = () => {
    const [oldText, setOldText] = useState('');
    const [newText, setNewText] = useState('');
    const [diffResult, setDiffResult] = useState<React.ReactNode[] | null>(null);

    const checkDiff = () => {
        const oldLines = oldText.split('\n');
        const newLines = newText.split('\n');
        const result: React.ReactNode[] = [];
        
        const maxLines = Math.max(oldLines.length, newLines.length);

        for (let i = 0; i < maxLines; i++) {
            const oldL = oldLines[i] || '';
            const newL = newLines[i] || '';

            if (oldL === newL) {
                result.push(
                    <div key={i} className="flex text-xs font-mono text-gray-500 dark:text-gray-400 px-2 py-0.5">
                        <span className="w-8 text-right mr-4 select-none opacity-50">{i+1}</span>
                        <span>{oldL}</span>
                    </div>
                );
            } else {
                if (oldL) {
                    result.push(
                        <div key={`d-${i}`} className="flex text-xs font-mono bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5">
                            <span className="w-8 text-right mr-4 select-none opacity-50">-</span>
                            <span>{oldL}</span>
                        </div>
                    );
                }
                if (newL) {
                    result.push(
                        <div key={`a-${i}`} className="flex text-xs font-mono bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5">
                            <span className="w-8 text-right mr-4 select-none opacity-50">+</span>
                            <span>{newL}</span>
                        </div>
                    );
                }
            }
        }
        setDiffResult(result);
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex space-x-4 h-1/3">
                <textarea 
                    className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-xs font-mono resize-none text-apple-text dark:text-apple-dark-text"
                    placeholder="原文..."
                    value={oldText}
                    onChange={(e) => setOldText(e.target.value)}
                />
                <textarea 
                    className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-xs font-mono resize-none text-apple-text dark:text-apple-dark-text"
                    placeholder="新文..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                />
            </div>
            <Button size="sm" onClick={checkDiff}>对比差异</Button>
            <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-y-auto p-2">
                {diffResult || <div className="text-center text-gray-400 text-sm mt-10">输入文本并点击对比</div>}
            </div>
        </div>
    );
};

// --- 工具页面 ---
export const Tools = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
       { id: 'json', name: 'JSON 格式化', desc: '美化或压缩 JSON 数据', icon: Hash, component: <JsonTool /> },
       { id: 'time', name: '时间戳转换', desc: '转换 Unix 时间戳', icon: Clock, component: <TimeTool /> },
       { id: 'color', name: '颜色提取器', desc: 'Hex/RGB 转换与预览', icon: VideoIcon, component: <ColorTool /> },
       { id: 'base64', name: 'Base64 编码', desc: '编码和解码 Base64', icon: ArrowRightLeft, component: <Base64Tool /> },
       { id: 'lorem', name: 'Lorem Ipsum', desc: '生成随机占位文本', icon: Type, component: <LoremTool /> },
       { id: 'diff', name: 'Diff 检查器', desc: '比较文本差异', icon: RefreshCw, component: <DiffTool /> }
  ];

  const currentTool = tools.find(t => t.id === activeTool);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 mb-20">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-apple-text dark:text-apple-dark-text">开发者工具</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
         {tools.map(tool => (
           <Card 
                key={tool.id} 
                hover 
                onClick={() => setActiveTool(tool.id)}
                className="p-6 flex flex-col items-center justify-center text-center h-40 md:h-48 cursor-pointer border-dashed border-2 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:border-apple-blue dark:hover:border-apple-blue transition-colors"
           >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-4 flex items-center justify-center text-apple-blue">
                 <tool.icon size={20} />
              </div>
              <h3 className="font-semibold text-sm md:text-base text-apple-text dark:text-apple-dark-text">{tool.name}</h3>
              <p className="text-xs text-gray-400 mt-2">{tool.desc}</p>
           </Card>
         ))}
      </div>

      {/* 工具弹窗 */}
      <Modal 
        isOpen={!!activeTool} 
        onClose={() => setActiveTool(null)} 
        title={currentTool?.name}
        className="max-w-3xl h-[80vh] flex flex-col"
      >
          <div className="flex-1 overflow-hidden pt-2">
            {currentTool?.component}
          </div>
      </Modal>
    </div>
  );
};

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