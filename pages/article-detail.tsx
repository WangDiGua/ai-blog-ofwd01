import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../context/store';
import { Button, Spinner, Avatar, EmojiPicker, MarkdownRenderer, ImageViewer, Modal, RankBadge, Img, ReportModal } from '../components/ui';
import { articleApi } from '../services/api';
import { Article, Comment, CULTIVATION_LEVELS, CultivationLevel } from '../types';
import { Heart, MessageCircle, Calendar, Bookmark, List, ThumbsUp, Smile, Clock, Hash, ShieldAlert, Share2, Download, ExternalLink, Hourglass, Lock, Flag, FileText, ChevronRight } from 'lucide-react';
import { calculateReadingTime, generateHeadingId } from '../utils/lib';

// 免责声明组件
const Disclaimer = () => (
    <div className="mb-12 p-4 md:p-6 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center mb-4 space-x-2 border-b border-gray-200 dark:border-gray-700 pb-3">
            <ShieldAlert size={20} className="text-gray-400 dark:text-gray-500" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">免责声明 & 版权许可</h3>
        </div>
        <div className="space-y-3 text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            <p>
                <span className="font-semibold text-gray-600 dark:text-gray-300 mr-1">1. 侵权处理：</span>
                本站部分内容来源于网络或用户投稿，旨在传递更多信息。若内容标注错误或侵犯了您的合法权益，请持权属证明联系站长（admin@iblog.app），我们将第一时间核实并删除。
            </p>
            <p>
                <span className="font-semibold text-gray-600 dark:text-gray-300 mr-1">2. 立场声明：</span>
                本站所有文章仅代表作者个人观点，不代表本站立场。文中提及的技术方案、投资建议或第三方观点仅供参考，不构成任何专业建议，请读者自行甄别。
            </p>
            <p>
                <span className="font-semibold text-gray-600 dark:text-gray-300 mr-1">3. 版权协议：</span>
                除非特别注明，本站所有原创内容均采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh" target="_blank" rel="noreferrer" className="text-apple-blue hover:underline">CC BY-NC-SA 4.0</a> 知识共享许可协议。转载请注明出处及原文链接。
            </p>
        </div>
    </div>
);

// 递归评论组件 - 移动端优化版
const CommentItem = ({ comment, depth = 0, onReport }: { comment: Comment, depth?: number, onReport: (id: string) => void, key?: any }) => {
    const [replyOpen, setReplyOpen] = useState(false);
    
    // 移动端减少缩进 (ml-3 vs md:ml-12)
    return (
        <div className={`flex space-x-2 md:space-x-3 ${depth > 0 ? 'ml-3 md:ml-12 mt-4 border-l-2 border-gray-100 dark:border-gray-800 pl-3 md:pl-4' : ''}`}>
            <div className="flex-shrink-0">
                <Avatar src={comment.user.avatar} alt={comment.user.name} size={depth > 0 ? 'sm' : 'md'} />
            </div>
            <div className="flex-1 min-w-0 group">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-semibold text-sm text-apple-text dark:text-apple-dark-text truncate max-w-[120px] md:max-w-xs">{comment.user.name}</span>
                        <RankBadge level={comment.user.level} />
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-auto md:ml-0">{comment.date}</span>
                    </div>
                    
                    {/* Report button */}
                    <button 
                        onClick={() => onReport(comment.id)}
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                        title="举报"
                    >
                        <Flag size={12} />
                    </button>
                </div>
                {/* 使用 MarkdownRenderer 渲染评论内容 */}
                <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
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
                         <textarea className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-apple-blue dark:text-white resize-none" placeholder="写下回复..." rows={3}/>
                         <div className="flex justify-end mt-2">
                             <Button size="sm" onClick={() => setReplyOpen(false)}>发送</Button>
                         </div>
                    </div>
                )}

                {comment.replies && comment.replies.map(reply => (
                    <CommentItem key={reply.id} comment={reply} depth={depth + 1} onReport={onReport} />
                ))}
            </div>
        </div>
    );
}

export const ArticleDetail = () => {
  const { id } = useParams<{id: string}>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [previewCover, setPreviewCover] = useState(false); // 封面预览状态
  const [readingSeconds, setReadingSeconds] = useState(0); // 阅读时长(秒)
  
  // Rating State
  const [ratings, setRatings] = useState<Record<number, number>>({ 1: 5, 2: 3, 3: 12, 4: 89, 5: 230 });
  const [myRating, setMyRating] = useState<number | null>(null);

  // Report Modal State
  const [reportCommentId, setReportCommentId] = useState<string | null>(null);
  
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

  // 阅读计时器
  useEffect(() => {
    const timer = setInterval(() => {
        setReadingSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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

  const handleRate = (score: number) => {
      requireAuth(() => {
          // 乐观更新
          setRatings(prev => {
              const next = { ...prev };
              if (myRating !== null) {
                  next[myRating]--;
              }
              if (myRating !== score) {
                  next[score]++;
                  setMyRating(score);
                  showToast('感谢您的评价！', 'success');
              } else {
                  // 如果点击已选的，视为取消
                  setMyRating(null);
                  showToast('已取消评价', 'info');
              }
              return next;
          });
      });
  };

  const canComment = () => {
      if (!user) return false;
      // 等级索引 >= 1 (筑基期) 才能评论
      const userLevelIndex = CULTIVATION_LEVELS.indexOf(user.level);
      return userLevelIndex >= 1;
  };

  const handlePostComment = () => {
      requireAuth(() => {
          if (!canComment()) {
              showToast('境界不足！需达到【筑基期】方可神识传音（评论）', 'error');
              return;
          }
          if (!commentText.trim()) {
              showToast('评论内容不能为空', 'error');
              return;
          }
          showToast('评论已发布', 'success');
          setCommentText('');
      });
  };

  const handleReportComment = (commentId: string) => {
      requireAuth(() => {
          setReportCommentId(commentId);
      });
  };

  const insertEmoji = (emoji: string) => {
      setCommentText(prev => prev + emoji);
      setShowEmoji(false);
  };

  const handleDownloadCard = () => {
      showToast('海报已保存到相册 (模拟)', 'success');
      setTimeout(() => setIsShareOpen(false), 800);
  };

  // 平滑滚动到标题
  const scrollToHeading = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
          // 顶部导航栏高度偏移 + 一些额外 padding
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
          });
      } else {
          console.warn(`Element with id ${id} not found`);
      }
  };

  if (loading) return <div className="flex justify-center h-[50vh] items-center"><Spinner /></div>;
  if (!article) return <div className="text-center py-20">文章未找到</div>;

  // 提取目录 (## Heading)
  const toc = article.content.split('\n').reduce<{id: string, text: string, level: number}[]>((acc, line) => {
      // 匹配 ## (h2) 或 ### (h3)
      const match = line.match(/^(#{2,3})\s+(.*)$/);
      if (match) {
          const level = match[1].length;
          // 清除 Markdown 格式（如 **粗体**）
          const rawText = match[2];
          const text = rawText.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim();
          const id = generateHeadingId(text);
          acc.push({ id, text, level });
      }
      return acc;
  }, []);

  // 生成当前页面的二维码 (使用公开API)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}&color=000000&bgcolor=ffffff`;

  const EMOJI_RATINGS = [
      { score: 1, emoji: '😠', label: '不喜欢' },
      { score: 2, emoji: '😞', label: '一般' },
      { score: 3, emoji: '😐', label: '还可以' },
      { score: 4, emoji: '🙂', label: '不错' },
      { score: 5, emoji: '😍', label: '力荐' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-10 mb-20">
      
      <ReportModal 
          isOpen={!!reportCommentId}
          onClose={() => setReportCommentId(null)}
          targetId={reportCommentId || ''}
          targetType="comment"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* 左侧侧边栏 (互动) - 桌面端 */}
        <div className="hidden lg:block lg:col-span-1 space-y-6 sticky top-24 h-fit">
           <button 
             onClick={() => handleAction('like')} 
             className={`flex flex-col items-center p-3 rounded-full transition-colors ${isLiked ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
             title="点赞"
           >
              <Heart size={24} className={isLiked ? 'fill-current' : ''} />
              <span className="text-xs mt-1 font-medium">{article.likes + (isLiked ? 1 : 0)}</span>
           </button>
           <button 
                onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex flex-col items-center p-3 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="评论"
           >
              <MessageCircle size={24} />
              <span className="text-xs mt-1 font-medium">{article.comments?.length || 0}</span>
           </button>
           <button 
             onClick={() => handleAction('bookmark')}
             className={`flex flex-col items-center p-3 rounded-full transition-colors ${isBookmarked ? 'text-apple-blue bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
             title="收藏"
           >
              <Bookmark size={24} className={isBookmarked ? 'fill-current' : ''} />
           </button>
           <button 
             onClick={() => setIsShareOpen(true)}
             className="flex flex-col items-center p-3 rounded-full text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
             title="分享"
           >
              <Share2 size={24} />
           </button>

           {/* 阅读计时器 */}
           <div className="flex flex-col items-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-gray-400 select-none animate-in fade-in cursor-default" title="已阅读时长">
               <Hourglass size={20} className="text-apple-blue/70 animate-pulse" />
               <span className="text-xs mt-1 font-mono font-medium text-apple-text dark:text-apple-dark-text tracking-wide">
                   {formatTimer(readingSeconds)}
               </span>
           </div>
        </div>

        {/* 主要文章内容 */}
        <div className="lg:col-span-8">
            <div className="mb-6 md:mb-8 animate-in slide-in-from-bottom-4 duration-700">
               <div className="flex items-center space-x-2 text-sm text-apple-blue font-semibold mb-2 md:mb-3">
                  <span className="uppercase">{article.category}</span>
               </div>
               <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-apple-text dark:text-apple-dark-text mb-4 md:mb-6 leading-tight">
                 {article.title}
               </h1>
               <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-800 gap-4 md:gap-0">
                  <div className="flex items-center space-x-3">
                     <Avatar src="https://picsum.photos/id/1005/50/50" alt="Author" />
                     <div>
                        <div className="font-medium text-apple-text dark:text-apple-dark-text flex items-center gap-2">
                            {article.authorName || "王地瓜"}
                            <RankBadge level={article.authorLevel || "真仙/渡劫期"} />
                        </div>
                        <div className="text-xs text-gray-500 flex items-center flex-wrap gap-y-1">
                           <span className="flex items-center mr-3"><Calendar size={12} className="mr-1"/> {article.date}</span>
                           <span className="flex items-center mr-3"><Clock size={12} className="mr-1"/> {calculateReadingTime(article.content)}</span>
                           <span className="flex items-center"><FileText size={12} className="mr-1"/> {article.content.length} 字</span>
                        </div>
                     </div>
                  </div>
                  {/* 移动端操作栏 */}
                  <div className="flex lg:hidden justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                     <div className="flex space-x-6">
                        <button onClick={() => handleAction('like')} className="flex items-center space-x-1">
                            <Heart className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'} size={20}/>
                            <span className="text-xs text-gray-500">{article.likes + (isLiked ? 1 : 0)}</span>
                        </button>
                        <button onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center space-x-1">
                             <MessageCircle className="text-gray-400" size={20}/>
                             <span className="text-xs text-gray-500">{article.comments?.length || 0}</span>
                        </button>
                     </div>
                     <div className="flex space-x-4">
                        <button onClick={() => handleAction('bookmark')}>
                            <Bookmark className={isBookmarked ? 'fill-apple-blue text-apple-blue' : 'text-gray-400'} size={20}/>
                        </button>
                        <button onClick={() => setIsShareOpen(true)}>
                            <Share2 className="text-gray-400" size={20}/>
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            {/* 封面图片 */}
            <div 
                className="rounded-xl md:rounded-3xl overflow-hidden mb-8 md:mb-10 shadow-lg cursor-zoom-in relative group aspect-video"
                onClick={() => setPreviewCover(true)}
            >
                <Img src={article.cover} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity pointer-events-none">
                     <span className="text-white text-xs md:text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">查看大图</span>
                </div>
            </div>

            {/* 摘要显示 */}
            <div className="mb-8 p-4 md:p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border-l-4 border-apple-blue">
                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2 uppercase tracking-wider opacity-80">摘要</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                    {article.summary}
                </p>
            </div>

            {/* 内容主体 (使用 MarkdownRenderer 替代手动循环) */}
            <article className="mb-12 md:mb-16">
               <MarkdownRenderer content={article.content} />
            </article>

            {/* 文章评分模块 */}
            <div className="mb-12 py-8 border-t border-b border-gray-200 dark:border-gray-800 text-center">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-6">觉得这篇文章怎么样？打个分吧</h3>
                <div className="flex justify-center items-center gap-4 md:gap-8 flex-wrap">
                    {EMOJI_RATINGS.map((item) => (
                        <button 
                            key={item.score}
                            onClick={() => handleRate(item.score)}
                            className={`
                                relative group flex flex-col items-center p-3 md:p-4 rounded-2xl transition-all duration-300
                                ${myRating === item.score ? 'bg-apple-blue/10 scale-110' : 'hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-105'}
                            `}
                        >
                            <span className="text-3xl md:text-4xl mb-2 filter grayscale group-hover:grayscale-0 transition-all" style={{ filter: myRating === item.score ? 'none' : '' }}>
                                {item.emoji}
                            </span>
                            <span className={`text-xs font-medium ${myRating === item.score ? 'text-apple-blue' : 'text-gray-500'}`}>
                                {item.label}
                            </span>
                            
                            {/* 计数徽标 */}
                            <div className={`
                                absolute -top-2 -right-1 bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 
                                text-[10px] font-bold px-2 py-0.5 rounded-full text-gray-500 min-w-[24px] text-center
                                ${myRating === item.score ? 'text-apple-blue border-apple-blue/30' : ''}
                            `}>
                                {ratings[item.score] || 0}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* 免责声明 */}
            <Disclaimer />

            {/* 评论区 - 添加 ID 用于跳转 */}
            <div id="comments-section" className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl md:rounded-3xl p-4 md:p-8 scroll-mt-24 border border-gray-100 dark:border-gray-800">
               <h3 className="text-lg md:text-xl font-bold mb-6 text-apple-text dark:text-apple-dark-text">评论 ({article.comments?.length || 0})</h3>
               
               <div className="mb-8 flex space-x-3 md:space-x-4">
                  <Avatar src={user?.avatar || 'https://ui-avatars.com/api/?name=Guest'} alt="me" />
                  <div className="flex-1 relative">
                      {/* 如果没有权限评论(且已登录)，显示遮罩提示；如果未登录，则不显示遮罩，允许点击输入框触发登录 */}
                      {user && !canComment() && (
                          <div className="absolute inset-0 z-10 bg-white/60 dark:bg-black/60 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center text-center cursor-not-allowed border border-gray-200 dark:border-gray-700">
                                <Lock className="text-gray-500 mb-2" size={24} />
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">境界不足</p>
                                <p className="text-xs text-gray-500 mt-1">需突破至【筑基期】方可参与论道</p>
                                <Button size="sm" className="mt-2 bg-purple-600 hover:bg-purple-700 text-white" onClick={() => window.location.href='/profile'}>
                                    去突破
                                </Button>
                          </div>
                      )}

                      {/* 普通长文本输入框 (替代富文本) */}
                      <div onClick={() => !user && requireAuth(()=>{})}>
                          <textarea
                            className="w-full p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-apple-blue outline-none resize-none text-sm transition-all text-apple-text dark:text-apple-dark-text shadow-sm placeholder-gray-400"
                            rows={4}
                            placeholder={user ? (canComment() ? "写下一条友善的评论..." : "修炼中...") : "登录后参与讨论..."}
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            disabled={user && !canComment()} // 仅在已登录但等级不足时禁用，未登录时不禁用以便触发onClick
                          />
                      </div>

                      <div className="flex justify-between mt-2">
                         <button onClick={() => setShowEmoji(!showEmoji)} className="text-gray-400 hover:text-apple-blue p-2">
                              <Smile size={20} />
                         </button>
                         <Button size="sm" onClick={handlePostComment} disabled={!commentText.trim() || (user && !canComment())}>发表评论</Button>
                      </div>

                      {showEmoji && (
                          <div className="absolute top-full left-0 mt-2 z-10 w-full max-w-xs">
                              <EmojiPicker onSelect={insertEmoji} />
                          </div>
                      )}
                  </div>
               </div>

               <div className="space-y-6">
                  {article.comments?.map(comment => (
                     <CommentItem key={comment.id} comment={comment} onReport={handleReportComment} />
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
              {toc.length > 0 ? (
                  <ul className="space-y-1 relative">
                     {/* 左侧装饰线 */}
                     <div className="absolute left-[5px] top-0 bottom-0 w-[2px] bg-gray-100 dark:bg-gray-800"></div>
                     
                     {toc.map((header, idx) => (
                        <li key={`${header.id}-${idx}`} className={`pl-${header.level === 2 ? '4' : '8'} py-1`}>
                           <a 
                             href={`#${header.id}`} 
                             className={`
                                text-sm transition-all duration-200 block truncate flex items-center group
                                ${header.level === 2 ? 'font-medium text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400 text-xs'}
                                hover:text-apple-blue hover:translate-x-1
                             `}
                             onClick={(e) => {
                                 e.preventDefault();
                                 scrollToHeading(header.id);
                             }}
                             title={header.text}
                           >
                             {header.level === 2 && (
                                <div className="absolute left-0 w-2.5 h-2.5 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-full group-hover:border-apple-blue transition-colors z-10" style={{ marginTop: '4px' }}></div>
                             )}
                             {header.text}
                           </a>
                        </li>
                     ))}
                  </ul>
              ) : (
                  <p className="text-sm text-gray-400 italic">本文暂无目录</p>
              )}
           </div>
        </div>

      </div>
      
      {/* 封面图大图预览 */}
      <ImageViewer src={previewCover ? article.cover : null} onClose={() => setPreviewCover(false)} />

      {/* 分享卡片模态框 - 修改：使用 variant='transparent'，移除 hacky 的 overrides */}
      <Modal 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
        title="分享文章" 
        hideHeader
        variant="transparent"
        className="max-w-md w-full"
      >
          <div className="flex flex-col items-center w-full">
              {/* 卡片主体 */}
              <div id="share-card" className="w-full bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 relative select-none">
                  {/* 顶部装饰氛围 */}
                  <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 z-0" />
                  
                  <div className="p-6 relative z-10">
                      {/* 作者信息行 */}
                      <div className="flex items-center space-x-3 mb-5">
                          <Avatar src="https://picsum.photos/id/1005/50/50" alt="Author" size="md" />
                          <div>
                              <p className="font-bold text-apple-text dark:text-apple-dark-text">王地瓜</p>
                              <div className="flex items-center text-xs text-gray-500 space-x-2">
                                  <span>{article.date}</span>
                                  <span>·</span>
                                  <span>Sweet Potato 认证作者</span>
                              </div>
                          </div>
                      </div>

                      {/* 封面图片 */}
                      <div className="rounded-2xl overflow-hidden mb-5 shadow-lg relative aspect-video">
                          <Img src={article.cover} alt="Cover" className="w-full h-full object-cover" />
                          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-md font-bold tracking-wider">
                              精选文章
                          </div>
                      </div>

                      {/* 标题 */}
                      <h2 className="text-xl font-bold text-apple-text dark:text-apple-dark-text mb-2 leading-tight">
                          {article.title}
                      </h2>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-6">
                          {article.summary}
                      </p>

                      {/* 底部信息区 */}
                      <div className="flex justify-between items-end pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
                          <div>
                              <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-bold text-lg text-apple-blue font-serif italic">Sweet Potato</span>
                                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500">阅读 · 分享 · 创造</span>
                              </div>
                              <p className="text-[10px] text-gray-400">长按识别二维码阅读全文</p>
                          </div>
                          
                          {/* 二维码区域 */}
                          <div className="p-1 bg-white rounded-lg shadow-sm">
                              <img 
                                src={qrCodeUrl} 
                                alt="QR Code" 
                                className="w-16 h-16 rounded mix-blend-multiply" 
                              />
                          </div>
                      </div>
                  </div>
              </div>

              {/* 操作按钮 */}
              <div className="w-full mt-6 space-y-3">
                  <Button className="w-full shadow-lg shadow-blue-500/20 py-3" onClick={handleDownloadCard}>
                      <Download className="mr-2" size={18} /> 保存卡片到相册
                  </Button>
                  <button onClick={() => setIsShareOpen(false)} className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 py-2">
                      取消
                  </button>
              </div>
          </div>
      </Modal>
    </div>
  );
};