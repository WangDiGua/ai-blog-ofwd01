import React, { useState } from 'react';
import { Play, Code, Eye, X } from 'lucide-react';

// --- 卡片组件 ---
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, className = '', hover = false, ...props }: CardProps) => {
  return (
    <div 
      className={`
        bg-apple-card dark:bg-apple-dark-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden
        transition-all duration-300 ease-out
        ${hover ? 'hover:shadow-md hover:scale-[1.01] hover:-translate-y-1' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// --- 骨架屏组件 ---
export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg ${className}`} />
);

// --- 按钮组件 ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-apple-blue text-white hover:bg-blue-600 shadow-sm active:scale-95",
    secondary: "bg-gray-100 dark:bg-gray-800 text-apple-text dark:text-apple-dark-text hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95",
    ghost: "bg-transparent text-apple-blue hover:bg-blue-50/50 dark:hover:bg-blue-900/20",
    danger: "bg-red-500 text-white hover:bg-red-600 active:scale-95"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-full",
    md: "px-5 py-2.5 text-sm rounded-full",
    lg: "px-8 py-3.5 text-base rounded-full"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- 头像组件 ---
export const Avatar = ({ src, alt, size = 'md' }: { src: string; alt: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${sizes[size]} rounded-full object-cover border border-gray-100 dark:border-gray-800 shadow-sm`}
    />
  );
};

// --- 加载动画 ---
export const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-apple-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// --- Markdown/代码渲染器 ---
export const MarkdownRenderer = ({ content }: { content: string }) => {
    const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    
    // 简单检测 HTML 代码块以运行
    const hasHtmlBlock = content.includes('```html');
    
    const extractHtml = (md: string) => {
        const match = md.match(/```html([\s\S]*?)```/);
        return match ? match[1] : '';
    };

    const runCode = () => {
        const html = extractHtml(content);
        if (!html) return;
        const newWindow = window.open();
        if(newWindow) {
            newWindow.document.write(html);
            newWindow.document.close();
        }
    };

    return (
        <div className="w-full">
            {hasHtmlBlock && (
                <div className="flex justify-end space-x-2 mb-2">
                     <button onClick={() => setViewMode(viewMode === 'preview' ? 'code' : 'preview')} className="text-xs flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                         {viewMode === 'preview' ? <Code size={14} className="mr-1"/> : <Eye size={14} className="mr-1"/>}
                         {viewMode === 'preview' ? '查看代码' : '预览'}
                     </button>
                     <button onClick={runCode} className="text-xs flex items-center bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-600 dark:text-green-400 font-medium">
                         <Play size={14} className="mr-1"/> 运行
                     </button>
                </div>
            )}
            
            {viewMode === 'code' ? (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                    {content}
                </pre>
            ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none text-apple-text dark:text-apple-dark-text">
                     {content.split('\n').map((line, i) => {
                        if (line.startsWith('```')) return null; // 演示中隐藏代码块
                        if (line.startsWith('# ')) {
                            const text = line.substring(2).trim();
                            return <h1 key={i} id={text} className="text-xl font-bold my-4 text-apple-text dark:text-apple-dark-text scroll-mt-24">{text}</h1>;
                        }
                        if (line.startsWith('## ')) {
                            const text = line.substring(3).trim();
                            return <h2 key={i} id={text} className="text-lg font-bold my-3 text-apple-text dark:text-apple-dark-text scroll-mt-24">{text}</h2>;
                        }
                        if (line.startsWith('* ')) return <li key={i} className="ml-4 list-disc my-1">{line.substring(2)}</li>;
                        if (line.startsWith('> ')) {
                            return <blockquote key={i} className="border-l-4 border-apple-blue pl-4 italic my-4 text-gray-600 dark:text-gray-400">{line.replace('> ', '')}</blockquote>
                        }
                        
                        // 图片检测: ![alt](url)
                        const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
                        if (imgMatch) {
                            return (
                                <div key={i} className="my-4 group">
                                    <img 
                                        src={imgMatch[2]} 
                                        alt={imgMatch[1]} 
                                        className="rounded-xl shadow-md cursor-zoom-in max-h-96 w-auto mx-auto hover:opacity-90 transition-opacity"
                                        onClick={() => setPreviewImage(imgMatch[2])}
                                    />
                                    {imgMatch[1] && <p className="text-center text-xs text-gray-500 mt-2">{imgMatch[1]}</p>}
                                </div>
                            );
                        }

                        if (line.trim() === '') return <br key={i} />;

                        return <p key={i} className="my-2 leading-relaxed text-gray-700 dark:text-gray-300">{line}</p>;
                     })}
                </div>
            )}

            {/* 图片预览弹窗 */}
            {previewImage && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setPreviewImage(null)}
                >
                    <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2 transition-colors">
                        <X size={32} />
                    </button>
                    <img 
                        src={previewImage} 
                        className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-200" 
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}
        </div>
    );
};