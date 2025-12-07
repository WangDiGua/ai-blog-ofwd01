import React from 'react';
import { Avatar, Button } from '../components/ui';

export const About = () => (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-16 text-center mb-16">
        <Avatar src="https://picsum.photos/id/1005/200/200" alt="Me" size="xl" />
        <h1 className="text-3xl md:text-4xl font-bold mt-6 mb-2 text-apple-text dark:text-apple-dark-text">John Developer</h1>
        <p className="text-lg md:text-xl text-apple-subtext dark:text-apple-dark-subtext mb-8">用像素和爱构建数字体验。</p>
        
        <div className="flex justify-center space-x-4 mb-12">
            <Button>下载简历</Button>
            <Button variant="secondary">联系我</Button>
        </div>

        <div className="text-left bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
           <h3 className="text-lg font-bold mb-4 text-apple-text dark:text-apple-dark-text">哲学</h3>
           <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-sm md:text-base">
             我相信优秀的软件不仅仅是关于代码，更是关于它给用户带来的感受。
             坚持极简、清晰和深度的原则，我致力于创造直观且令人愉悦的界面。
           </p>
           
           <h3 className="text-lg font-bold mb-4 text-apple-text dark:text-apple-dark-text">技术栈</h3>
           <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Tailwind', 'Node.js', 'Next.js', 'Figma', 'GraphQL'].map(skill => (
                  <span key={skill} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">
                      {skill}
                  </span>
              ))}
           </div>
        </div>
    </div>
);