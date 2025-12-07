import React, { useEffect, useState } from 'react';
import { Card, Button, Avatar, MarkdownRenderer, MarkdownEditor } from '../components/ui';
import { communityApi } from '../services/api';
import { CommunityPost } from '../types';
import { useStore } from '../context/store';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';

interface CommentMock {
  id: number;
  user: string;
  avatar: string;
  content: string;
  time: string;
}

export const Community = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const { isLoggedIn, requireAuth, showToast, user } = useStore();
  
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentMock[]>>({});

  useEffect(() => {
    communityApi.getPosts().then(data => {
        setPosts(data);
        const initialComments: Record<string, CommentMock[]> = {};
        data.forEach(p => {
            initialComments[p.id] = [
                { id: 1, user: 'Alice', avatar: 'https://ui-avatars.com/api/?name=Alice&background=random', content: '这个设计太棒了！**点赞**', time: '10分钟前' },
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
    let url = window.location.href;
    try {
        const urlObj = new URL(url);
        if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
            url = 'https://iblog.app';
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
        throw new Error("Share API not supported");
      }
    } catch (error) {
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
      if (!commentInput.trim()) {
          showToast('评论内容不能为空', 'error');
          return;
      }

      requireAuth(() => {
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
                
                {/* 使用 Markdown 渲染帖子内容 */}
                <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3 md:mb-4">
                    <MarkdownRenderer content={post.content} />
                </div>
                
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

                {activePostId === post.id && (
                    <div className="mt-4 animate-in slide-in-from-top-2 fade-in">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 md:p-4 space-y-4">
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                {commentsMap[post.id]?.map(comment => (
                                    <div key={comment.id} className="flex space-x-2">
                                        <Avatar src={comment.avatar} alt={comment.user} size="sm" />
                                        <div className="flex-1 bg-white dark:bg-gray-800 p-2 rounded-lg rounded-tl-none shadow-sm text-sm">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-semibold text-apple-text dark:text-apple-dark-text text-xs">{comment.user}</span>
                                                <span className="text-[10px] text-gray-400">{comment.time}</span>
                                            </div>
                                            {/* 使用 Markdown 渲染评论 */}
                                            <div className="text-gray-600 dark:text-gray-300">
                                                <MarkdownRenderer content={comment.content} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!commentsMap[post.id] || commentsMap[post.id].length === 0) && (
                                    <p className="text-center text-gray-400 text-xs py-2">暂无评论，抢沙发！</p>
                                )}
                            </div>

                            <div className="flex space-x-2 items-end">
                                <Avatar src={user?.avatar || 'https://ui-avatars.com/api/?name=Guest'} alt="Me" size="sm" />
                                <div className="flex-1 relative">
                                    <textarea 
                                        className="w-full bg-white dark:bg-gray-800 border-none rounded-xl p-2 text-sm focus:ring-2 focus:ring-apple-blue outline-none resize-none text-apple-text dark:text-apple-dark-text"
                                        rows={1}
                                        placeholder="写下你的评论... (支持 Markdown)"
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