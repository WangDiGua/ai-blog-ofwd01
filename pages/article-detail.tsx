import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../context/store';
import { Button, Spinner, Avatar, EmojiPicker, MarkdownRenderer, MarkdownEditor, ImageViewer } from '../components/ui';
import { articleApi } from '../services/api';
import { Article, Comment } from '../types';
import { Heart, MessageCircle, Calendar, Bookmark, List, ThumbsUp, Smile, Clock, Hash } from 'lucide-react';

// 递归评论组件
const CommentItem = ({ comment, depth = 0 }: { comment: Comment, depth?: number }) => {
    const [replyOpen, setReplyOpen] = useState(false);
    
    return (
        <div className={`flex space-x-3 ${depth > 0 ? 'ml-3 md:ml-12 mt-4 border-l-2 border-gray-100 dark:border-gray-800 pl-3 md:pl-4' : ''}`}>
            <Avatar src={comment.user.avatar} alt={comment.user.name} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-sm text-apple-text dark:text-apple-dark-text truncate">{comment.user.name}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{comment.date}</span>
                </div>
                {/* 使用 MarkdownRenderer 渲染评论内容 */}
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    <MarkdownRenderer content={comment.content} />
                </div>
                
                <div className="flex items-center space-x-4 mt-2">
                    <button className="flex items-center text-xs text-gray-400 hover:text-apple-blue transition-colors">
                        <ThumbsUp size={12} className="mr-1"/> 点赞
                    </button>
                    <button onClick={() => setReplyOpen(!replyOpen)} className="text-xs text-gray-400 hover:text-apple-text transition-colors">回复</button>
                </div>

                {replyOpen && (
                    <div className="mt-3">
                         <textarea className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-apple-blue dark:text-white" placeholder="写下回复..." rows={2}/>
                         <div className="flex justify-end mt-2">
                             <Button size="sm" onClick={() => setReplyOpen(false)}>发送</Button>
                         </div>
                    </div>
                )}

                {comment.replies && comment.replies.map(reply => (
                    <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                ))}
            </div>
        </div>
    );
}

export const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [previewCover, setPreviewCover] = useState(false); // 封面预览状态
  
  const { user, requireAuth, showToast } = useStore();

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await articleApi.getDetail(id);
        setArticle(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAction = (action: string) => {
      requireAuth(() => {
        if (action === 'like') {
            setIsLiked(!isLiked);
            showToast(isLiked ? '已取消点赞' : '已点赞', 'info');
        } else if (action === 'bookmark') {
            setIsBookmarked(!isBookmarked);
            showToast(isBookmarked ? '已取消收藏' : '已收藏', 'info');
        }
      });
  };

  const handlePostComment = () => {
      if (!commentText.trim()) {
          showToast('评论内容不能为空', 'error');
          return;
      }
      requireAuth(() => {
          showToast('评论已发布', 'success');
          setCommentText('');
      });
  };

  const insertEmoji = (emoji: string) => {
      setCommentText(prev => prev + emoji);
      setShowEmoji(false);
  };

  if (loading) return <div className="flex justify-center h-[50vh] items-center"><Spinner /></div>;
  if (!article) return <div className="text-center py-20">文章未找到</div>;

  // 提取目录 (## Heading)
  const toc = article.content.split('\n')
    .filter(l => l.startsWith('## '))
    .map(l => l.replace('## ', '').trim());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 mb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 左侧侧边栏 (互动) - 桌面端 */}
        <div className="hidden lg:block lg:col-span-1 space-y-6 sticky top-24 h-fit">
           <button 
             onClick={() => handleAction('like')} 
             className={`flex flex-col items-center p-3 rounded-full transition-colors ${isLiked ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
           >
              <Heart size={24} className={isLiked ? 'fill-current' : ''} />
              <span className="text-xs mt-1 font-medium">{article.likes + (isLiked ? 1 : 0)}</span>
           </button>
           <button 
                onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex flex-col items-center p-3 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
           >
              <MessageCircle size={24} />
              <span className="text-xs mt-1 font-medium">{article.comments?.length || 0}</span>
           </button>
           <button 
             onClick={() => handleAction('bookmark')}
             className={`flex flex-col items-center p-3 rounded-full transition-colors ${isBookmarked ? 'text-apple-blue bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
           >
              <Bookmark size={24} className={isBookmarked ? 'fill-current' : ''} />
           </button>
        </div>

        {/* 主要文章内容 */}
        <div className="lg:col-span-8">
            <div className="mb-6 md:mb-8 animate-in slide-in-from-bottom-4 duration-700">
               <div className="flex items-center space-x-2 text-sm text-apple-blue font-semibold mb-3">
                  <span className="uppercase">{article.category}</span>
               </div>
               <h1 className="text-2xl md:text-5xl font-bold text-apple-text dark:text-apple-dark-text mb-4 md:mb-6 leading-tight">
                 {article.title}
               </h1>
               <div className="flex items-center justify-between pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center space-x-3">
                     <Avatar src="https://picsum.photos/id/1005/50/50" alt="Author" />
                     <div>
                        <div className="font-medium text-apple-text dark:text-apple-dark-text">John Developer</div>
                        <div className="text-xs text-gray-500 flex items-center">
                           <Calendar size={12} className="mr-1"/> {article.date}
                           <span className="mx-2">•</span>
                           <Clock size={12} className="mr-1"/> 8 分钟阅读
                        </div>
                     </div>
                  </div>
                  {/* 移动端操作栏 */}
                  <div className="flex lg:hidden space-x-4">
                     <button onClick={() => handleAction('like')} className="flex items-center space-x-1">
                         <Heart className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'} size={20}/>
                         <span className="text-xs text-gray-500">{article.likes + (isLiked ? 1 : 0)}</span>
                     </button>
                     <button onClick={() => handleAction('bookmark')}>
                         <Bookmark className={isBookmarked ? 'fill-apple-blue text-apple-blue' : 'text-gray-400'} size={20}/>
                     </button>
                  </div>
               </div>
            </div>

            {/* 封面图片 */}
            <div 
                className="rounded-2xl md:rounded-3xl overflow-hidden mb-8 md:mb-10 shadow-lg cursor-zoom-in relative group"
                onClick={() => setPreviewCover(true)}
            >
                <img src={article.cover} alt="Cover" className="w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity pointer-events-none">
                     <span className="text-white text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">查看大图</span>
                </div>
            </div>

            {/* 内容主体 (使用 MarkdownRenderer 替代手动循环) */}
            <article className="mb-12 md:mb-16">
               <MarkdownRenderer content={article.content} />
            </article>

            {/* 评论区 - 添加 ID 用于跳转 */}
            <div id="comments-section" className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl md:rounded-3xl p-4 md:p-8 scroll-mt-24">
               <h3 className="text-lg md:text-xl font-bold mb-6 text-apple-text dark:text-apple-dark-text">评论 ({article.comments?.length || 0})</h3>
               
               <div className="mb-8 flex space-x-3 md:space-x-4">
                  <Avatar src={user?.avatar || 'https://ui-avatars.com/api/?name=Guest'} alt="me" />
                  <div className="flex-1 relative">
                      {/* 使用 MarkdownEditor 替代简单文本框 */}
                      <div onClick={() => { if(!user) requireAuth(()=>{}) }}>
                          <MarkdownEditor 
                            value={commentText} 
                            onChange={setCommentText} 
                            placeholder="写下一条友善的评论... (支持 Markdown)"
                            height="150px"
                          />
                      </div>

                      <div className="flex justify-between mt-2">
                         <button onClick={() => setShowEmoji(!showEmoji)} className="text-gray-400 hover:text-apple-blue p-2">
                              <Smile size={20} />
                         </button>
                         <Button size="sm" onClick={handlePostComment} disabled={!commentText.trim()}>发表评论</Button>
                      </div>

                      {showEmoji && (
                          <div className="absolute top-full left-0 mt-2 z-10">
                              <EmojiPicker onSelect={insertEmoji} />
                          </div>
                      )}
                  </div>
               </div>

               <div className="space-y-6">
                  {article.comments?.map(comment => (
                     <CommentItem key={comment.id} comment={comment} />
                  ))}
               </div>
            </div>
        </div>

        {/* 右侧侧边栏 (目录) - 桌面端 */}
        <div className="hidden lg:block lg:col-span-3">
           <div className="sticky top-24">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                 <List size={14} className="mr-2"/> 目录
              </h3>
              <ul className="space-y-3 border-l-2 border-gray-100 dark:border-gray-800">
                 {toc.map(header => (
                    <li key={header} className="pl-4">
                       <a 
                         href={`#${header}`} 
                         className="text-sm text-gray-500 dark:text-gray-400 hover:text-apple-blue transition-colors flex items-center"
                         onClick={(e) => {
                             e.preventDefault();
                             // 现在 header 直接对应了 MarkdownRenderer 中生成的 id
                             document.getElementById(header)?.scrollIntoView({ behavior: 'smooth' });
                         }}
                       >
                         <Hash size={12} className="mr-2 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                         {header}
                       </a>
                    </li>
                 ))}
              </ul>
           </div>
        </div>

      </div>
      
      {/* 封面图大图预览 */}
      <ImageViewer src={previewCover ? article.cover : null} onClose={() => setPreviewCover(false)} />
    </div>
  );
};