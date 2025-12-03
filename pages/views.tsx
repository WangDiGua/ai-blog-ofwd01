import React, { useEffect, useState } from 'react';
import { useStore } from '../context/store';
import { Card, Button, Spinner, Avatar } from '../components/ui';
import { request } from '../utils/lib';
import { Article, CommunityPost, Song } from '../types';
import { Heart, MessageCircle, Share2, Play, Pause, Clock, Eye, Hash } from 'lucide-react';

// --- HOME PAGE ---
export const Home = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await request.get<Article[]>('/articles');
        setArticles(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Hero / Intro */}
      <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-apple-text">
          Think Different.
        </h1>
        <p className="text-lg md:text-xl text-apple-subtext max-w-2xl mx-auto">
          Exploring the intersection of design, technology, and lifestyle through a minimalist lens.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-apple-text">Latest Stories</h2>
            <div className="flex space-x-2">
               {['All', 'Tech', 'Design'].map(cat => (
                 <button key={cat} className="px-3 py-1 text-xs font-medium bg-white rounded-full border border-gray-200 hover:border-apple-blue transition-colors">
                   {cat}
                 </button>
               ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner /></div>
          ) : (
            articles.map((article) => (
              <Card key={article.id} hover className="flex flex-col md:flex-row group cursor-pointer h-full md:h-64">
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
                    <h3 className="text-xl md:text-2xl font-bold text-apple-text mb-2 leading-tight group-hover:text-apple-blue transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-apple-subtext line-clamp-2 text-sm leading-relaxed">
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
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">About Me</h3>
              <div className="flex items-center space-x-4 mb-4">
                <Avatar src="https://picsum.photos/id/1005/100/100" alt="Admin" size="lg" />
                <div>
                  <div className="font-semibold text-apple-text">John Developer</div>
                  <div className="text-xs text-apple-subtext">Frontend Engineer</div>
                </div>
              </div>
              <p className="text-sm text-apple-subtext mb-4">
                Passionate about creating clean, accessible, and high-performance user interfaces. 
              </p>
              <Button variant="secondary" size="sm" className="w-full">Follow</Button>
           </Card>

           <div className="sticky top-24">
             <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Trending Topics</h3>
             <div className="space-y-2">
               {['#React19', '#TailwindCSS', '#UXDesign', '#AppleEvent', '#CodingLife'].map(tag => (
                 <a key={tag} href="#" className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-medium text-gray-700">{tag}</span>
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

// --- COMMUNITY PAGE ---
export const Community = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const { isLoggedIn, login } = useStore();

  useEffect(() => {
    request.get<CommunityPost[]>('/community').then(setPosts);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-apple-text">Community</h1>
          <p className="text-apple-subtext mt-1">Join the conversation.</p>
        </div>
        <Button onClick={isLoggedIn ? () => {} : login}>
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
                  <h4 className="font-semibold text-apple-text">{post.author.name}</h4>
                  <span className="text-xs text-gray-400">{post.timeAgo}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{post.content}</p>
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

// --- MUSIC PAGE ---
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
        <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-200 rounded-3xl shadow-inner">
           <div className={`w-64 h-64 md:w-80 md:h-80 rounded-2xl shadow-2xl overflow-hidden mb-8 transition-transform duration-700 ease-spring ${isPlaying ? 'scale-105' : 'scale-100'}`}>
              <img 
                src={currentSong ? currentSong.cover : "https://picsum.photos/seed/music/400/400"} 
                alt="Album Art" 
                className="w-full h-full object-cover"
              />
           </div>
           <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-apple-text mb-1">{currentSong?.title || "No Song Selected"}</h2>
              <p className="text-lg text-apple-subtext">{currentSong?.artist || "Select a song from the list"}</p>
           </div>
           
           <div className="flex items-center space-x-8">
              <button className="p-4 rounded-full bg-white shadow-sm hover:scale-105 transition-transform">
                <Play className="fill-current rotate-180 text-gray-400" size={24}/>
              </button>
              <button 
                onClick={togglePlay}
                className="p-6 rounded-full bg-apple-blue text-white shadow-lg hover:scale-105 transition-transform hover:shadow-blue-500/30"
              >
                {isPlaying ? <Pause size={32} className="fill-current"/> : <Play size={32} className="fill-current ml-1"/>}
              </button>
              <button className="p-4 rounded-full bg-white shadow-sm hover:scale-105 transition-transform">
                <Play className="fill-current text-gray-400" size={24}/>
              </button>
           </div>
        </div>

        {/* Right: Playlist */}
        <div className="space-y-4">
           <h2 className="text-2xl font-bold mb-6">Top Hits</h2>
           {songs.map((song) => (
             <div 
                key={song.id}
                onClick={() => playSong(song)}
                className={`
                  flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 group
                  ${currentSong?.id === song.id ? 'bg-white shadow-md scale-[1.02]' : 'hover:bg-white/50 hover:shadow-sm'}
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
                   <h4 className={`text-sm font-semibold ${currentSong?.id === song.id ? 'text-apple-blue' : 'text-apple-text'}`}>{song.title}</h4>
                   <p className="text-xs text-gray-500">{song.artist}</p>
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

// --- ABOUT / TOOLS PLACEHOLDERS ---
export const Tools = () => (
  <div className="max-w-7xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold mb-8">Developer Tools</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       {['JSON Formatter', 'Timestamp Converter', 'Color Picker', 'Base64 Encoder', 'Lorem Ipsum Gen', 'Diff Checker'].map(tool => (
         <Card key={tool} hover className="p-6 flex flex-col items-center justify-center text-center h-48 cursor-pointer border-dashed border-2 border-gray-100 bg-gray-50/50">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm mb-4 flex items-center justify-center">
               <Hash className="text-apple-blue" />
            </div>
            <h3 className="font-semibold text-apple-text">{tool}</h3>
            <p className="text-xs text-gray-400 mt-2">Useful utility for daily tasks</p>
         </Card>
       ))}
    </div>
  </div>
);

export const About = () => (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Avatar src="https://picsum.photos/id/1005/200/200" alt="Me" size="lg" />
        <h1 className="text-4xl font-bold mt-6 mb-2">John Developer</h1>
        <p className="text-xl text-apple-subtext mb-8">Building digital experiences with pixels and love.</p>
        
        <div className="flex justify-center space-x-4 mb-12">
            <Button>Download Resume</Button>
            <Button variant="secondary">Contact Me</Button>
        </div>

        <div className="text-left bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold mb-4">Philosophy</h3>
           <p className="text-gray-600 mb-6 leading-relaxed">
             I believe that great software is not just about code, but about how it makes the user feel. 
             Adhering to principles of minimalism, clarity, and depth, I strive to create interfaces that are intuitive and delightful.
           </p>
           
           <h3 className="text-lg font-bold mb-4">Tech Stack</h3>
           <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Tailwind', 'Node.js', 'Next.js', 'Figma', 'GraphQL'].map(skill => (
                  <span key={skill} className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium text-gray-600">
                      {skill}
                  </span>
              ))}
           </div>
        </div>
    </div>
);
