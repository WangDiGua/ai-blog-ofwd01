import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/store';
import { Card, Button, Spinner, Avatar, Pagination } from '../components/ui';
import { request } from '../utils/lib';
import { Article, CommunityPost, Song } from '../types';
import { Heart, MessageCircle, Share2, Play, Pause, Clock, Eye, Hash, Calendar, Bookmark, List, ThumbsUp } from 'lucide-react';

// --- HOME PAGE ---
export const Home = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  
  // Get query params
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q') || '';

  const LIMIT = 6;

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const data = await request.get<{items: Article[], totalPages: number}>('/articles', { 
            page, 
            limit: LIMIT,
            q: searchQuery 
        });
        setArticles(data.items);
        setTotalPages(data.totalPages);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [page, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Hero / Intro */}
      {!searchQuery && (
        <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-apple-text dark:text-apple-dark-text">
            Think Different.
          </h1>
          <p className="text-lg md:text-xl text-apple-subtext dark:text-apple-dark-subtext max-w-2xl mx-auto">
            Exploring the intersection of design, technology, and lifestyle through a minimalist lens.
          </p>
        </div>
      )}

      {searchQuery && (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-apple-text dark:text-apple-dark-text">Search results for "{searchQuery}"</h2>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-apple-text dark:text-apple-dark-text">Latest Stories</h2>
            <div className="flex space-x-2">
               {['All', 'Tech', 'Design'].map(cat => (
                 <button key={cat} className="px-3 py-1 text-xs font-medium bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-apple-blue transition-colors">
                   {cat}
                 </button>
               ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner /></div>
          ) : (
            <>
                {articles.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No articles found.</div>
                ) : (
                    articles.map((article) => (
                    <Card key={article.id} hover className="flex flex-col md:flex-row group cursor-pointer h-full md:h-64" onClick={() => navigate(`/article/${article.id}`)}>
                        <div className="md:w-2/5 h-48 md:h-full overflow-hidden">
                        <img 
                            src={article.cover} 
                            alt={article.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        </div>
                        <div className="p-6 md:w-3/5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs font-semibold text-apple-blue uppercase tracking-wider">{article.category}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500">{article.date}</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-apple-text dark:text-apple-dark-text mb-2 leading-tight group-hover:text-apple-blue transition-colors">
                            {article.title}
                            </h3>
                            <p className="text-apple-subtext dark:text-apple-dark-subtext line-clamp-2 text-sm leading-relaxed">
                            {article.summary}
                            </p>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-gray-400 space-x-4">
                            <span className="flex items-center"><Eye size={14} className="mr-1"/> {article.views}</span>
                            <span className="flex items-center"><Clock size={14} className="mr-1"/> 5 min read</span>
                        </div>
                        </div>
                    </Card>
                    ))
                )}
                
                {/* Pagination */}
                {articles.length > 0 && (
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 text-apple-text dark:text-apple-dark-text">About Me</h3>
              <div className="flex items-center space-x-4 mb-4">
                <Avatar src="https://picsum.photos/id/1005/100/100" alt="Admin" size="lg" />
                <div>
                  <div className="font-semibold text-apple-text dark:text-apple-dark-text">John Developer</div>
                  <div className="text-xs text-apple-subtext dark:text-apple-dark-subtext">Frontend Engineer</div>
                </div>
              </div>
              <p className="text-sm text-apple-subtext dark:text-apple-dark-subtext mb-4">
                Passionate about creating clean, accessible, and high-performance user interfaces. 
              </p>
              <Button variant="secondary" size="sm" className="w-full">Follow</Button>
           </Card>

           <div className="sticky top-24">
             <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Trending Topics</h3>
             <div className="space-y-2">
               {['#React19', '#TailwindCSS', '#UXDesign', '#AppleEvent', '#CodingLife'].map(tag => (
                 <a key={tag} href="#" className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tag}</span>
                    <Hash size={14} className="text-gray-400"/>
                 </a>
               ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- ARTICLE DETAIL PAGE ---
export const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { user, isLoggedIn, login } = useStore();

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

  // Generate Table of Contents from content string
  const getToc = (content: string) => {
    const lines = content.split('\n');
    const headers = lines
        .filter(line => line.startsWith('## '))
        .map(line => line.replace('## ', ''));
    return headers;
  };

  if (loading) return <div className="flex justify-center h-[50vh] items-center"><Spinner /></div>;
  if (!article) return <div className="text-center py-20">Article not found</div>;

  const toc = getToc(article.content);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar (Interaction) - Desktop */}
        <div className="hidden lg:block lg:col-span-1 space-y-6 sticky top-24 h-fit">
           <button 
             onClick={() => setIsLiked(!isLiked)} 
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
             onClick={() => setIsBookmarked(!isBookmarked)}
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
                     <button onClick={() => setIsLiked(!isLiked)}><Heart className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}/></button>
                     <button><Bookmark className="text-gray-400"/></button>
                  </div>
               </div>
            </div>

            {/* Cover Image */}
            <div className="rounded-3xl overflow-hidden mb-10 shadow-lg">
                <img src={article.cover} alt="Cover" className="w-full object-cover" />
            </div>

            {/* Content Body */}
            <article className="prose prose-lg dark:prose-invert max-w-none mb-16 text-apple-text dark:text-apple-dark-text">
               {/* Simulating Markdown rendering by splitting paragraphs */}
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
               
               {isLoggedIn ? (
                   <div className="mb-8 flex space-x-4">
                      <Avatar src={user?.avatar || ''} alt="me" />
                      <div className="flex-1">
                          <textarea className="w-full rounded-xl p-3 border-none focus:ring-2 focus:ring-apple-blue bg-white dark:bg-gray-800 resize-none text-apple-text dark:text-apple-dark-text" rows={3} placeholder="Write a thoughtful comment..." />
                          <div className="flex justify-end mt-2">
                             <Button size="sm">Post Comment</Button>
                          </div>
                      </div>
                   </div>
               ) : (
                   <div className="mb-8 text-center p-6 bg-white dark:bg-gray-800 rounded-xl">
                      <p className="text-gray-500 mb-3">Login to join the discussion</p>
                      <Button onClick={() => login('guest')}>Login</Button>
                   </div>
               )}

               <div className="space-y-6">
                  {article.comments?.map(comment => (
                     <div key={comment.id} className="flex space-x-4">
                        <Avatar src={comment.user.avatar} alt={comment.user.name} />
                        <div>
                           <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-sm text-apple-text dark:text-apple-dark-text">{comment.user.name}</span>
                              <span className="text-xs text-gray-400">{comment.date}</span>
                           </div>
                           <p className="text-sm text-gray-600 dark:text-gray-300">{comment.content}</p>
                           <div className="flex items-center space-x-4 mt-2">
                              <button className="flex items-center text-xs text-gray-400 hover:text-apple-blue transition-colors">
                                 <ThumbsUp size={12} className="mr-1"/> Like
                              </button>
                              <button className="text-xs text-gray-400 hover:text-apple-text transition-colors">Reply</button>
                           </div>
                        </div>
                     </div>
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

// --- COMMUNITY PAGE (Unchanged but needs dark mode styling) ---
export const Community = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const { isLoggedIn } = useStore();

  useEffect(() => {
    request.get<CommunityPost[]>('/community').then(setPosts);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-apple-text dark:text-apple-dark-text">Community</h1>
          <p className="text-apple-subtext dark:text-apple-dark-subtext mt-1">Join the conversation.</p>
        </div>
        <Button>
          {isLoggedIn ? 'New Post' : 'Login to Post'}
        </Button>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar src={post.author.avatar} alt={post.author.name} />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-apple-text dark:text-apple-dark-text">{post.author.name}</h4>
                  <span className="text-xs text-gray-400">{post.timeAgo}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">{post.content}</p>
                <div className="flex items-center space-x-6">
                  <button className="flex items-center space-x-1 text-gray-400 hover:text-red-500 transition-colors">
                    <Heart size={18} /> <span className="text-xs">{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-500 transition-colors">
                    <MessageCircle size={18} /> <span className="text-xs">{post.comments}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-400 hover:text-green-500 transition-colors">
                    <Share2 size={18} />
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

// --- MUSIC PAGE (Unchanged but dark mode aware) ---
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
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: Player Visual */}
        <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-black rounded-3xl shadow-inner border border-white/20">
           <div className={`w-64 h-64 md:w-80 md:h-80 rounded-2xl shadow-2xl overflow-hidden mb-8 transition-transform duration-700 ease-spring ${isPlaying ? 'scale-105' : 'scale-100'}`}>
              <img 
                src={currentSong ? currentSong.cover : "https://picsum.photos/seed/music/400/400"} 
                alt="Album Art" 
                className="w-full h-full object-cover"
              />
           </div>
           <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-apple-text dark:text-apple-dark-text mb-1">{currentSong?.title || "No Song Selected"}</h2>
              <p className="text-lg text-apple-subtext dark:text-apple-dark-subtext">{currentSong?.artist || "Select a song from the list"}</p>
           </div>
           
           <div className="flex items-center space-x-8">
              <button className="p-4 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:scale-105 transition-transform">
                <Play className="fill-current rotate-180 text-gray-400" size={24}/>
              </button>
              <button 
                onClick={togglePlay}
                className="p-6 rounded-full bg-apple-blue text-white shadow-lg hover:scale-105 transition-transform hover:shadow-blue-500/30"
              >
                {isPlaying ? <Pause size={32} className="fill-current"/> : <Play size={32} className="fill-current ml-1"/>}
              </button>
              <button className="p-4 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:scale-105 transition-transform">
                <Play className="fill-current text-gray-400" size={24}/>
              </button>
           </div>
        </div>

        {/* Right: Playlist */}
        <div className="space-y-4">
           <h2 className="text-2xl font-bold mb-6 text-apple-text dark:text-apple-dark-text">Top Hits</h2>
           {songs.map((song) => (
             <div 
                key={song.id}
                onClick={() => playSong(song)}
                className={`
                  flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 group
                  ${currentSong?.id === song.id ? 'bg-white dark:bg-gray-800 shadow-md scale-[1.02]' : 'hover:bg-white/50 dark:hover:bg-gray-800/50 hover:shadow-sm'}
                `}
             >
                <div className="w-8 text-center text-sm font-medium text-gray-400 mr-4">
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
                <img src={song.cover} alt="art" className="w-10 h-10 rounded-md shadow-sm mr-4" />
                <div className="flex-1">
                   <h4 className={`text-sm font-semibold ${currentSong?.id === song.id ? 'text-apple-blue' : 'text-apple-text dark:text-apple-dark-text'}`}>{song.title}</h4>
                   <p className="text-xs text-gray-500 dark:text-gray-400">{song.artist}</p>
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  {formatTime(song.duration)}
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export const Tools = () => (
  <div className="max-w-7xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold mb-8 text-apple-text dark:text-apple-dark-text">Developer Tools</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       {['JSON Formatter', 'Timestamp Converter', 'Color Picker', 'Base64 Encoder', 'Lorem Ipsum Gen', 'Diff Checker'].map(tool => (
         <Card key={tool} hover className="p-6 flex flex-col items-center justify-center text-center h-48 cursor-pointer border-dashed border-2 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-4 flex items-center justify-center">
               <Hash className="text-apple-blue" />
            </div>
            <h3 className="font-semibold text-apple-text dark:text-apple-dark-text">{tool}</h3>
            <p className="text-xs text-gray-400 mt-2">Useful utility for daily tasks</p>
         </Card>
       ))}
    </div>
  </div>
);

export const About = () => (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Avatar src="https://picsum.photos/id/1005/200/200" alt="Me" size="lg" />
        <h1 className="text-4xl font-bold mt-6 mb-2 text-apple-text dark:text-apple-dark-text">John Developer</h1>
        <p className="text-xl text-apple-subtext dark:text-apple-dark-subtext mb-8">Building digital experiences with pixels and love.</p>
        
        <div className="flex justify-center space-x-4 mb-12">
            <Button>Download Resume</Button>
            <Button variant="secondary">Contact Me</Button>
        </div>

        <div className="text-left bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
           <h3 className="text-lg font-bold mb-4 text-apple-text dark:text-apple-dark-text">Philosophy</h3>
           <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
             I believe that great software is not just about code, but about how it makes the user feel. 
             Adhering to principles of minimalism, clarity, and depth, I strive to create interfaces that are intuitive and delightful.
           </p>
           
           <h3 className="text-lg font-bold mb-4 text-apple-text dark:text-apple-dark-text">Tech Stack</h3>
           <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Tailwind', 'Node.js', 'Next.js', 'Figma', 'GraphQL'].map(skill => (
                  <span key={skill} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300">
                      {skill}
                  </span>
              ))}
           </div>
        </div>
    </div>
);