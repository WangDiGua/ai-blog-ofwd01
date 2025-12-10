import React, { useEffect, useState } from 'react';
import { musicApi } from '../services/api';
import { Song } from '../types';
import { useStore } from '../context/store';
import { Play, Pause } from 'lucide-react';
import { Img } from '../components/ui';

export const MusicPage = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const { playSong, currentSong, isPlaying, togglePlay } = useStore();

  useEffect(() => {
    musicApi.getList().then(setSongs);
  }, []);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 mb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-black rounded-3xl shadow-inner border border-white/20">
           <div className={`w-48 h-48 md:w-80 md:h-80 rounded-2xl shadow-2xl overflow-hidden mb-6 md:mb-8 transition-transform duration-700 ease-spring ${isPlaying ? 'scale-105' : 'scale-100'}`}>
              <Img 
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
                <Img src={song.cover} alt="art" className="w-10 h-10 rounded-md shadow-sm mr-3 md:mr-4" />
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