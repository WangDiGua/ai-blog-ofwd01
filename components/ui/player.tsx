import React from 'react';
import { useStore } from '../../context/store';
import { ChevronLeft, SkipBack, SkipForward, Play, Pause, X } from 'lucide-react';

// --- 全屏音乐播放器 ---
export const FullPlayerModal = () => {
    const { currentSong, isPlaying, togglePlay, isFullPlayerOpen, setFullPlayerOpen } = useStore();
    
    if (!isFullPlayerOpen || !currentSong) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white/30 dark:bg-black/30 backdrop-blur-xl flex flex-col animate-in slide-in-from-bottom-10 duration-300">
             {/* 背景模糊 */}
             <div className="absolute inset-0 -z-10 overflow-hidden">
                 <img src={currentSong.cover} alt="bg" className="w-full h-full object-cover opacity-30 dark:opacity-20 blur-3xl scale-110" />
             </div>

             {/* 头部带关闭按钮 */}
             <div className="flex items-center justify-between p-6 z-20">
                 <button onClick={() => setFullPlayerOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-gray-800 dark:text-white transition-colors">
                     <ChevronLeft size={28} />
                 </button>
                 <span className="text-xs font-semibold tracking-widest uppercase text-gray-500 dark:text-gray-400">正在播放</span>
                 <button onClick={() => setFullPlayerOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-gray-800 dark:text-white transition-colors">
                     <X size={28} />
                 </button>
             </div>

             {/* 内容 */}
             <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 gap-10 md:gap-20 overflow-hidden z-10">
                 {/* 封面 */}
                 <div className="w-64 h-64 md:w-96 md:h-96 rounded-2xl shadow-2xl overflow-hidden flex-shrink-0">
                     <img src={currentSong.cover} alt="Art" className="w-full h-full object-cover" />
                 </div>

                 {/* 歌词 / 信息 */}
                 <div className="w-full max-w-md text-center md:text-left h-64 md:h-96 overflow-y-auto no-scrollbar mask-gradient">
                     <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{currentSong.title}</h2>
                     <p className="text-xl text-apple-blue mb-8">{currentSong.artist}</p>
                     
                     <div className="space-y-4 text-gray-600 dark:text-gray-300 font-medium text-lg leading-relaxed opacity-80">
                         {currentSong.lyrics ? (
                             currentSong.lyrics.map((line, i) => (
                                 <p key={i} className="hover:text-apple-text dark:hover:text-white transition-colors">{line.replace(/\[.*?\]/, '')}</p>
                             ))
                         ) : (
                             <p>暂无歌词</p>
                         )}
                     </div>
                 </div>
             </div>

             {/* 控制器 */}
             <div className="pb-12 px-8 max-w-3xl mx-auto w-full z-20">
                 {/* 进度条 (模拟) */}
                 <div className="w-full bg-gray-300/50 dark:bg-gray-700/50 h-1.5 rounded-full mb-8 cursor-pointer relative group">
                     <div className="absolute top-0 left-0 h-full bg-apple-text dark:bg-white w-1/3 rounded-full">
                         <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
                     </div>
                 </div>

                 <div className="flex items-center justify-between">
                     <button className="text-gray-500 hover:text-gray-900 dark:hover:text-white"><SkipBack size={32} /></button>
                     <button 
                        onClick={togglePlay}
                        className="w-20 h-20 bg-apple-text dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
                     >
                         {isPlaying ? <Pause size={36} className="fill-current" /> : <Play size={36} className="fill-current ml-2" />}
                     </button>
                     <button className="text-gray-500 hover:text-gray-900 dark:hover:text-white"><SkipForward size={32} /></button>
                 </div>
             </div>
        </div>
    );
};