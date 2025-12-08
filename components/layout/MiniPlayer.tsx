import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../context/store';
import { Music, Maximize2, X } from 'lucide-react';
import { throttle } from '../../utils/lib';

export const MiniPlayer = () => {
  const { currentSong, isPlaying, togglePlay, setFullPlayerOpen, closePlayer } = useStore();
  const [progress, setProgress] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateProgress = useCallback(
    throttle(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 1));
    }, 1000),
    []
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(updateProgress, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, updateProgress]);

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl p-3 z-[40] flex items-center space-x-4 transition-all duration-500 animate-in slide-in-from-bottom-10 group">
      <div onClick={() => setFullPlayerOpen(true)} className="relative group cursor-pointer">
          <img src={currentSong.cover} alt="Cover" className="w-12 h-12 rounded-lg shadow-sm" />
          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 size={16} className="text-white"/>
          </div>
      </div>
      
      <div className="flex-1 min-w-0" onClick={() => setFullPlayerOpen(true)}>
        <h4 className="text-sm font-semibold truncate text-apple-text dark:text-apple-dark-text cursor-pointer hover:underline">{currentSong.title}</h4>
        <p className="text-xs text-apple-subtext dark:text-apple-dark-text truncate">{currentSong.artist}</p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-2">
          <div className="bg-apple-blue h-1 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
          <button 
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isPlaying ? (
               <span className="w-3 h-3 bg-apple-text dark:bg-apple-dark-text rounded-sm" /> 
            ) : (
               <Music className="w-5 h-5 text-apple-text dark:text-apple-dark-text ml-0.5" />
            )}
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); closePlayer(); }}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500"
            title="关闭播放器"
          >
            <X size={16} />
          </button>
      </div>
    </div>
  );
};
