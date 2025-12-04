import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../context/store';
import { Button, Spinner, Avatar, EmojiPicker } from '../components/ui';
import { request } from '../utils/lib';
import { Article, Comment } from '../types';
import { Heart, MessageCircle, Calendar, Bookmark, List, ThumbsUp, Smile, Clock } from 'lucide-react';

// Recursive Comment Component
const CommentItem = ({ comment, depth = 0 }: { comment: Comment, depth?: number }) => {
    const [replyOpen, setReplyOpen] = useState(false);
    
    return (
        <div className={`flex space-x-3 ${depth > 0 ? 'ml-8 md:ml-12 mt-4 border-l-2 border-gray-100 dark:border-gray-800 pl-4' : ''}`}>
            <Avatar src={comment.user.avatar} alt={comment.user.name} />
            <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-sm text-apple-text dark:text-apple-dark-text">{comment.user.name}</span>
                    <span className="text-xs text-gray-400">{comment.date}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{comment.content}</p>
                
                <div className="flex items-center space-x-4 mt-2">
                    <button className="flex items-center text-xs text-gray-400 hover:text-apple-blue transition-colors">
                        <ThumbsUp size={12} className="mr-1"/> Like
                    </button>
                    <button onClick={() => setReplyOpen(!replyOpen)} className="text-xs text-gray-400 hover:text-apple-text transition-colors">Reply</button>
                </div>

                {replyOpen && (
                    <div className="mt-3">
                         <textarea className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-apple-blue dark:text-white" placeholder="Write a reply..." rows={2}/>
                         <div className="flex justify-end mt-2">
                             <Button size="sm" onClick={() => setReplyOpen(false)}>Post</Button>
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
  
  const { user, requireAuth, showToast } = useStore();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await request.get<Article>(`/articles/${id}`);
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
            showToast(isLiked ? 'Unliked' : 'Liked', 'info');
        } else if (action === 'bookmark') {
            setIsBookmarked(!isBookmarked);
            showToast(isBookmarked ? 'Removed from bookmarks' : 'Bookmarked', 'info');
        }
      });
  };

  const handlePostComment = () => {
      requireAuth(() => {
          if (!commentText.trim()) return;
          showToast('Comment posted', 'success');
          setCommentText('');
      });
  };

  const insertEmoji = (emoji: string) => {
      setCommentText(prev => prev + emoji);
      setShowEmoji(false);
  };

  if (loading) return <div className="flex justify-center h-[50vh] items-center"><Spinner /></div>;
  if (!article) return <div className="text-center py-20">Article not found</div>;

  const toc = article.content.split('\n').filter(l => l.startsWith('## ')).map(l => l.replace('## ', ''));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar (Interaction) - Desktop */}
        <div className="hidden lg:block lg:col-span-1 space-y-6 sticky top-24 h-fit">
           <button 
             onClick={() => handleAction('like')} 
             className={`flex flex-col items-center p-3 rounded-full transition-colors ${isLiked ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
           >
              <Heart size={24} className={isLiked ? 'fill-current' : ''} />
              <span className="text-xs mt-1 font-medium">{article.likes + (isLiked ? 1 : 0)}</span>
           </button>
           <button className="flex flex-col items-center p-3 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
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

        {/* Main Article Content */}
        <div className="lg:col-span-8">
            <div className="mb-8 animate-in slide-in-from-bottom-4 duration-700">
               <div className="flex items-center space-x-2 text-sm text-apple-blue font-semibold mb-3">
                  <span className="uppercase">{article.category}</span>
               </div>
               <h1 className="text-3xl md:text-5xl font-bold text-apple-text dark:text-apple-dark-text mb-6 leading-tight">
                 {article.title}
               </h1>
               <div className="flex items-center justify-between pb-8 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center space-x-3">
                     <Avatar src="https://picsum.photos/id/1005/50/50" alt="Author" />
                     <div>
                        <div className="font-medium text-apple-text dark:text-apple-dark-text">John Developer</div>
                        <div className="text-xs text-gray-500 flex items-center">
                           <Calendar size={12} className="mr-1"/> {article.date}
                           <span className="mx-2">•</span>
                           <Clock size={12} className="mr-1"/> 8 min read
                        </div>
                     </div>
                  </div>
                  {/* Mobile Actions Row */}
                  <div className="flex lg:hidden space-x-2">
                     <button onClick={() => handleAction('like')}><Heart className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}/></button>
                     <button onClick={() => handleAction('bookmark')}><Bookmark className={isBookmarked ? 'fill-apple-blue text-apple-blue' : 'text-gray-400'}/></button>
                  </div>
               </div>
            </div>

            {/* Cover Image */}
            <div className="rounded-3xl overflow-hidden mb-10 shadow-lg">
                <img src={article.cover} alt="Cover" className="w-full object-cover" />
            </div>

            {/* Content Body */}
            <article className="prose prose-lg dark:prose-invert max-w-none mb-16 text-apple-text dark:text-apple-dark-text">
               {/* Simulating Markdown rendering */}
               {article.content.split('\n').map((line, idx) => {
                  if (line.startsWith('## ')) {
                      return <h2 key={idx} id={line.replace('## ', '')} className="text-2xl font-bold mt-8 mb-4">{line.replace('## ', '')}</h2>
                  } else if (line.startsWith('* ')) {
                      return <li key={idx} className="ml-4 list-disc">{line.replace('* ', '')}</li>
                  } else if (line.startsWith('> ')) {
                      return <blockquote key={idx} className="border-l-4 border-apple-blue pl-4 italic my-4 text-gray-600 dark:text-gray-400">{line.replace('> ', '')}</blockquote>
                  } else if (line.trim() === '') {
                      return <br key={idx}/>
                  }
                  return <p key={idx} className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">{line}</p>
               })}
            </article>

            {/* Comments Section */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-8">
               <h3 className="text-xl font-bold mb-6 text-apple-text dark:text-apple-dark-text">Comments ({article.comments?.length || 0})</h3>
               
               <div className="mb-8 flex space-x-4">
                  <Avatar src={user?.avatar || 'https://ui-avatars.com/api/?name=Guest'} alt="me" />
                  <div className="flex-1 relative">
                      <textarea 
                         className="w-full rounded-xl p-3 border-none focus:ring-2 focus:ring-apple-blue bg-white dark:bg-gray-800 resize-none text-apple-text dark:text-apple-dark-text" 
                         rows={3} 
                         placeholder="Write a thoughtful comment..." 
                         value={commentText}
                         onChange={(e) => setCommentText(e.target.value)}
                         onFocus={() => { if(!user) requireAuth(()=>{}) }}
                      />
                      <button onClick={() => setShowEmoji(!showEmoji)} className="absolute bottom-3 left-3 text-gray-400 hover:text-apple-blue">
                          <Smile size={20} />
                      </button>
                      {showEmoji && (
                          <div className="absolute top-full left-0 mt-2 z-10">
                              <EmojiPicker onSelect={insertEmoji} />
                          </div>
                          )}
                      <div className="flex justify-end mt-2">
                         <Button size="sm" onClick={handlePostComment}>Post Comment</Button>
                      </div>
                  </div>
               </div>

               <div className="space-y-6">
                  {article.comments?.map(comment => (
                     <CommentItem key={comment.id} comment={comment} />
                  ))}
               </div>
            </div>
        </div>

        {/* Right Sidebar (TOC) - Desktop */}
        <div className="hidden lg:block lg:col-span-3">
           <div className="sticky top-24">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                 <List size={14} className="mr-2"/> Table of Contents
              </h3>
              <ul className="space-y-3 border-l-2 border-gray-100 dark:border-gray-800">
                 {toc.map(header => (
                    <li key={header} className="pl-4">
                       <a 
                         href={`#${header}`} 
                         className="text-sm text-gray-500 dark:text-gray-400 hover:text-apple-blue transition-colors block"
                         onClick={(e) => {
                             e.preventDefault();
                             document.getElementById(header)?.scrollIntoView({ behavior: 'smooth' });
                         }}
                       >
                         {header}
                       </a>
                    </li>
                 ))}
              </ul>
           </div>
        </div>

      </div>
    </div>
  );
};