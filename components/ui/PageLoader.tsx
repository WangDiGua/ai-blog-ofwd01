import React from 'react';

export const PageLoader = () => {
    return (
        <div className="fixed inset-0 z-[9999] bg-apple-bg dark:bg-apple-dark-bg flex flex-col items-center justify-center overflow-hidden">
            {/* 注入动画样式 */}
            <style>{`
                @keyframes fly-float {
                    0% { transform: translateY(0) rotate(0deg) translateX(0); }
                    25% { transform: translateY(-15px) rotate(-5deg) translateX(5px); }
                    50% { transform: translateY(-5px) rotate(0deg) translateX(0); }
                    75% { transform: translateY(-15px) rotate(5deg) translateX(-5px); }
                    100% { transform: translateY(0) rotate(0deg) translateX(0); }
                }
                
                @keyframes speed-line {
                    0% { transform: translateX(100%) scaleX(0.5); opacity: 0; }
                    50% { transform: translateX(-50%) scaleX(1); opacity: 1; }
                    100% { transform: translateX(-200%) scaleX(0.5); opacity: 0; }
                }

                @keyframes pulse-shadow {
                    0%, 100% { transform: scale(0.8); opacity: 0.2; }
                    50% { transform: scale(1.2); opacity: 0.1; }
                }
            `}</style>

            <div className="relative w-32 h-32 flex items-center justify-center">
                {/* 纸飞机 SVG */}
                <div style={{ animation: 'fly-float 3s ease-in-out infinite' }} className="relative z-10 drop-shadow-2xl">
                    <svg 
                        width="64" 
                        height="64" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-apple-blue dark:text-white"
                    >
                        <path 
                            d="M22 2L11 13" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                        <path 
                            d="M22 2L15 22L11 13L2 9L22 2Z" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="fill-white dark:fill-apple-blue/20"
                        />
                    </svg>
                </div>

                {/* 阴影效果 */}
                <div 
                    className="absolute bottom-6 w-12 h-3 bg-black rounded-full blur-md"
                    style={{ animation: 'pulse-shadow 3s ease-in-out infinite' }}
                ></div>

                {/* 速度线装饰 */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-0 h-0.5 w-12 bg-gray-300 dark:bg-gray-700 rounded-full" style={{ animation: 'speed-line 1.5s linear infinite', animationDelay: '0s' }}></div>
                    <div className="absolute top-1/3 right-0 h-0.5 w-8 bg-gray-300 dark:bg-gray-700 rounded-full" style={{ animation: 'speed-line 2s linear infinite', animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-1/3 left-10 h-0.5 w-6 bg-gray-300 dark:bg-gray-700 rounded-full" style={{ animation: 'speed-line 1s linear infinite', animationDelay: '0.8s' }}></div>
                </div>
            </div>

            {/* 加载文字 */}
            <div className="mt-8 flex flex-col items-center space-y-2">
                <span className="text-apple-blue font-bold text-lg tracking-widest uppercase animate-pulse">Loading</span>
                <div className="w-32 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-apple-blue rounded-full w-1/2 animate-[shimmer_1.5s_infinite_linear] relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/30 skew-x-12 animate-[spin_1s_linear_infinite]" style={{ animation: 'none', transform: 'translateX(-100%)' }}></div>
                    </div>
                </div>
                <style>{`
                    @keyframes shimmer {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(200%); }
                    }
                `}</style>
            </div>
        </div>
    );
};
