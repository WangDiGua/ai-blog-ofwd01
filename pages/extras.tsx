import React, { useEffect, useState } from 'react';
import { Card, Button, Avatar } from '../components/ui';
import { request } from '../utils/lib';
import { CommunityPost, Song } from '../types';
import { useStore } from '../context/store';
import { Heart, MessageCircle, Share2, Play, Pause, Hash } from 'lucide-react';

// --- COMMUNITY PAGE ---
export const Community = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const { isLoggedIn, requireAuth } = useStore();

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
        <Button onClick={() => requireAuth(() => console.log('post'))}>
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

// --- TOOLS PAGE ---
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

// --- ABOUT PAGE ---
export const About = () => (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Avatar src="https://picsum.photos/id/1005/200/200" alt="Me" size="xl" />
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