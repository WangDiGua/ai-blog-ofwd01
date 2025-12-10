import React, { useState, useEffect } from 'react';
import { Github, Twitter, Mail, Heart, Shield, BarChart3, Code, Cpu } from 'lucide-react';

export const Footer = () => {
  // 模拟访客统计数据
  const [visitorStats, setVisitorStats] = useState({ total: 102456, today: 128 });

  useEffect(() => {
    // 模拟数据动态增长效果
    const randomIncrement = Math.floor(Math.random() * 5);
    setVisitorStats(prev => ({
        total: prev.total + randomIncrement,
        today: prev.today + randomIncrement
    }));
  }, []);

  return (
    <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* 上半部分：多列信息布局 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 pb-10 border-b border-gray-100 dark:border-gray-800">
            
            {/* 1. 免责声明 */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
                    <Shield size={16} className="mr-2 text-gray-500"/> 免责声明
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-justify">
                    本站部分内容源于网络，仅供学习与交流。若本站内容侵犯了您的合法权益，请联系管理员处理。本站不承担任何因使用本站内容而导致的损失。内容观点仅代表作者本人，不代表本站立场。
                </p>
            </div>

            {/* 2. 致谢 & 技术栈 */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
                    <Heart size={16} className="mr-2 text-red-500"/> 致谢 & 技术栈
                </h4>
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
                    <p className="flex items-center hover:text-apple-blue transition-colors cursor-default">
                         <Code size={12} className="mr-2"/> 开发框架: React 19 + Vite
                    </p>
                    <p className="flex items-center hover:text-sky-500 transition-colors cursor-default">
                         <span className="w-3 h-3 bg-sky-400 rounded-full mr-2"></span> 样式驱动: Tailwind CSS
                    </p>
                     <p className="flex items-center hover:text-purple-500 transition-colors cursor-default">
                         <span className="w-3 h-3 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full mr-2"></span> AI 支持: Google Gemini
                    </p>
                    <div className="pt-2">
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                            <Github size={12} className="mr-1.5"/> Open Source
                        </a>
                    </div>
                </div>
            </div>

             {/* 3. 访客统计 */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
                    <BarChart3 size={16} className="mr-2 text-apple-blue"/> 访客统计
                </h4>
                <div className="grid grid-cols-2 gap-4">
                     <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                         <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">总访客量</div>
                         <div className="text-lg font-mono font-bold text-gray-800 dark:text-gray-200">
                            {visitorStats.total.toLocaleString()}
                         </div>
                     </div>
                     <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                         <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">今日访客</div>
                         <div className="text-lg font-mono font-bold text-green-500 flex items-center">
                            {visitorStats.today.toLocaleString()}
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full ml-2 animate-pulse"></span>
                         </div>
                     </div>
                </div>
                <div className="text-[10px] text-gray-400 flex items-center">
                    <Cpu size={10} className="mr-1"/> 系统运行正常 · v2.1.0
                </div>
            </div>
        </div>

        {/* 下半部分：版权与社交链接 */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"><Github className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"><Twitter className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"><Mail className="h-5 w-5" /></a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center md:text-left text-xs text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} iBlog. Design inspired by Apple. Powered by <span className="font-semibold text-gray-700 dark:text-gray-300">Google Gemini</span>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};