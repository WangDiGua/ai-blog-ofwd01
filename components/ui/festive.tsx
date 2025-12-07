import React, { useState, useEffect } from 'react';
import { X, Gift, Snowflake } from 'lucide-react';
import { useStore } from '../../context/store';

// --- 节日挂件组件 ---
export const FestiveWidget = () => {
    const { showFestive, toggleFestive } = useStore();
    const [theme, setTheme] = useState<'none' | 'christmas' | 'spring'>('spring');

    // 可以在这里根据日期自动切换
    useEffect(() => {
        const month = new Date().getMonth();
        if (month === 11) setTheme('christmas');
        else if (month === 0 || month === 1) setTheme('spring');
    }, []);

    if (!showFestive || theme === 'none') return null;

    return (
        <div className="hidden 2xl:block pointer-events-none fixed inset-0 z-30">
            {/* 左侧挂件 */}
            <div className="fixed left-6 top-1/4 pointer-events-auto group animate-in slide-in-from-left-10 duration-1000">
                <button 
                    onClick={toggleFestive} 
                    className="absolute -top-2 -right-2 bg-gray-200 dark:bg-gray-700 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="关闭节日装饰"
                >
                    <X size={12} />
                </button>
                {theme === 'christmas' ? (
                    <div className="flex flex-col items-center">
                        <Snowflake size={64} className="text-blue-200 animate-spin-slow" />
                        <div className="w-2 h-32 bg-gradient-to-b from-gray-300 to-transparent mt-[-10px]"></div>
                        <Gift size={48} className="text-red-500 -mt-2" />
                    </div>
                ) : (
                    <div className="bg-red-600 w-16 pt-6 pb-12 rounded-b-full shadow-lg border-2 border-yellow-400 flex flex-col items-center space-y-4">
                        <div className="w-10 h-10 border-2 border-yellow-400 rounded-full flex items-center justify-center text-yellow-400 font-bold text-xl bg-red-700">春</div>
                        <div className="text-yellow-100 font-serif text-2xl space-y-2 flex flex-col">
                            <span>欢</span><span>度</span><span>佳</span><span>节</span>
                        </div>
                        <div className="w-2 h-20 bg-yellow-400/50 mt-2"></div>
                    </div>
                )}
            </div>

            {/* 右侧挂件 */}
            <div className="fixed right-6 top-1/4 pointer-events-auto group animate-in slide-in-from-right-10 duration-1000">
                <button 
                    onClick={toggleFestive} 
                    className="absolute -top-2 -left-2 bg-gray-200 dark:bg-gray-700 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="关闭节日装饰"
                >
                    <X size={12} />
                </button>
                {theme === 'christmas' ? (
                    <div className="flex flex-col items-center">
                        <Snowflake size={64} className="text-blue-200 animate-spin-slow" />
                        <div className="w-2 h-32 bg-gradient-to-b from-gray-300 to-transparent mt-[-10px]"></div>
                        <Gift size={48} className="text-green-500 -mt-2" />
                    </div>
                ) : (
                    <div className="bg-red-600 w-16 pt-6 pb-12 rounded-b-full shadow-lg border-2 border-yellow-400 flex flex-col items-center space-y-4">
                        <div className="w-10 h-10 border-2 border-yellow-400 rounded-full flex items-center justify-center text-yellow-400 font-bold text-xl bg-red-700">福</div>
                        <div className="text-yellow-100 font-serif text-2xl space-y-2 flex flex-col">
                            <span>恭</span><span>喜</span><span>发</span><span>财</span>
                        </div>
                        <div className="w-2 h-20 bg-yellow-400/50 mt-2"></div>
                    </div>
                )}
            </div>
        </div>
    );
};