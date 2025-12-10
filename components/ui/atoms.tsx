import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Play, Code, Eye, X, Bold, Italic, List, Link as LinkIcon, Image as ImageIcon, Heading, Quote, Crown, ImageOff } from 'lucide-react';
import DOMPurify from 'dompurify';
import { CultivationLevel } from '../../types';

// --- 配置 DOMPurify ---
// 允许部分安全的标签和属性，防止 XSS 攻击
const sanitize = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'span', 'div', 'img'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'src', 'alt', 'style'],
  });
};

// --- 通用默认图片常量 ---
export const DEFAULT_IMAGE = "https://placehold.co/800x600/f3f4f6/9ca3af?text=No+Image";
export const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=User&background=random";

// --- 增强版图片组件 (带自动回退) ---
interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
}

export const Img = React.memo(({ src, alt, className = '', fallbackSrc = DEFAULT_IMAGE, ...props }: ImgProps) => {
    const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImgSrc(src || fallbackSrc);
        setHasError(false);
    }, [src, fallbackSrc]);

    const handleError = () => {
        if (!hasError) {
            setImgSrc(fallbackSrc);
            setHasError(true);
        }
    };

    // 如果外部传入了 object- 相关类名，则不应用默认的 object-cover
    const hasObjectFit = className.includes('object-');
    const objectFitClass = hasObjectFit ? '' : 'object-cover';

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={`${className} ${hasError ? 'object-contain bg-gray-100 dark:bg-gray-800' : objectFitClass}`}
            onError={handleError}
            {...props}
        />
    );
});

// --- 等级徽章组件 ---
export const RankBadge = React.memo(({ level }: { level?: CultivationLevel }) => {
    if (!level) return null;

    const getStyle = (lvl: CultivationLevel) => {
        switch (lvl) {
            case '炼气期': return 'bg-gray-100 text-gray-500 border-gray-200';
            case '筑基期': return 'bg-green-50 text-green-600 border-green-200';
            case '结丹期': return 'bg-yellow-50 text-yellow-600 border-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
            case '元婴期': return 'bg-purple-50 text-purple-600 border-purple-300 shadow-[0_0_10px_rgba(147,51,234,0.3)] animate-pulse';
            case '化神期': return 'bg-indigo-50 text-indigo-600 border-indigo-300 shadow-[0_0_15px_rgba(79,70,229,0.4)] ring-1 ring-indigo-200';
            case '炼虚期': return 'bg-blue-50 text-blue-600 border-blue-300 shadow-[0_0_15px_rgba(37,99,235,0.4)] ring-1 ring-blue-200';
            case '合体期': return 'bg-orange-50 text-orange-600 border-orange-300 shadow-[0_0_20px_rgba(234,88,12,0.5)] ring-2 ring-orange-200';
            case '大乘期': return 'bg-rose-50 text-rose-600 border-rose-300 shadow-[0_0_20px_rgba(225,29,72,0.6)] ring-2 ring-rose-200';
            case '真仙/渡劫期': return 'bg-gradient-to-r from-yellow-100 via-red-100 to-purple-100 text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-red-600 to-purple-600 border-yellow-400 font-bold shadow-[0_0_25px_rgba(255,215,0,0.6)] ring-2 ring-yellow-400 animate-pulse';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    return (
        <span className={`inline-flex items-center justify-center px-2 py-0.5 text-[10px] md:text-xs rounded border select-none transition-all duration-300 ${getStyle(level)}`}>
            {level}
        </span>
    );
});

// --- 卡片组件 ---
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = React.memo(({ children, className = '', hover = false, ...props }: CardProps) => {
  return (
    <div 
      className={`
        bg-apple-card dark:bg-apple-dark-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden
        transition-all duration-300 ease-ios
        ${hover ? 'hover:shadow-md hover:scale-[1.01] hover:-translate-y-1' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
});

// --- 骨架屏组件 ---
export const Skeleton = React.memo(({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg ${className}`} />
));

// --- 按钮组件 ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'vip';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.memo(({ children, variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) => {
  // Use 'ease-ios' and updated active:scale behavior
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 ease-ios focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-apple-blue text-white hover:bg-blue-600 shadow-sm active:scale-90 hover:scale-[1.02]",
    secondary: "bg-gray-100 dark:bg-gray-800 text-apple-text dark:text-apple-dark-text hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-90 hover:scale-[1.02]",
    ghost: "bg-transparent text-apple-blue hover:bg-blue-50/50 dark:hover:bg-blue-900/20 active:scale-90",
    danger: "bg-red-500 text-white hover:bg-red-600 active:scale-90 hover:scale-[1.02]",
    vip: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg hover:shadow-yellow-500/30 active:scale-90 border border-yellow-300/50 hover:scale-[1.02]"
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
});

// --- 头像组件 (带错误处理) ---
export const Avatar = React.memo(({ src, alt, size = 'md', className = '' }: { src: string; alt: string; size?: 'sm' | 'md' | 'lg' | 'xl', className?: string }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  // 简单的 XSS 防护，防止 src 注入 javascript:
  const safeSrc = (imgSrc || '').replace(/script:/gi, '');

  return (
    <img 
      src={safeSrc || DEFAULT_AVATAR} 
      alt={alt} 
      onError={() => {
          if(!hasError) {
              setImgSrc(DEFAULT_AVATAR);
              setHasError(true);
          }
      }}
      className={`${sizes[size]} rounded-full object-cover border border-gray-100 dark:border-gray-800 shadow-sm transition-transform duration-300 ease-ios hover:scale-105 ${className}`}
    />
  );
});

// --- 加载动画 ---
export const Spinner = React.memo(() => (
  <svg className="animate-spin h-5 w-5 text-apple-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
));

// --- 图片查看器组件 (使用 Portal) ---
export const ImageViewer = React.memo(({ src, onClose }: { src: string | null, onClose: () => void }) => {
    if (!src) return null;
    const safeSrc = src.replace(/script:/gi, '');
    
    return ReactDOM.createPortal(
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in-ios"
            onClick={onClose}
        >
            <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2 transition-colors">
                <X size={32} />
            </button>
            <Img 
                src={safeSrc} 
                className="max-w-[95vw] max-h-[95vh] rounded-lg shadow-2xl object-contain animate-modal-spring" 
                onClick={(e) => e.stopPropagation()} 
                alt="Full preview"
            />
        </div>,
        document.body
    );
});

// --- Helper: URL Sanitization (Prevent XSS) ---
const sanitizeUrl = (url: string) => {
    try {
        const lower = url.toLowerCase().trim();
        // Prevent javascript: vbscript: data: protocols (except images)
        if (lower.startsWith('javascript:') || lower.startsWith('vbscript:')) {
            return '#';
        }
        return url;
    } catch (e) {
        return '#';
    }
};

// --- Helper: Parse inline markdown (bold, italic, code, link) with Security ---
const parseInline = (text: string) => {
    // 1. Strictly Escape HTML characters first to prevent injection
    let safeText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // 2. Apply Markdown syntax replacements

    // Code: `code`
    safeText = safeText.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-500">$1</code>');
    
    // Bold: **bold**
    safeText = safeText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *italic*
    safeText = safeText.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Link: [text](url) - Sanitized
    safeText = safeText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, txt, url) => {
        const cleanUrl = sanitizeUrl(url);
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-apple-blue hover:underline">${txt}</a>`;
    });

    // 3. Final Sanitize via DOMPurify before rendering
    return <span dangerouslySetInnerHTML={{ __html: sanitize(safeText) }} />;
};

// --- Markdown/代码渲染器 (集成 Img 组件) ---
export const MarkdownRenderer = React.memo(({ content }: { content: string }) => {
    if (!content) return null; // Safety check

    const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    
    // Memoize the parsing logic so it doesn't run on every render unless content changes
    const parsedContent = useMemo(() => {
        const hasHtmlBlock = content.includes('```html');
        
        const extractHtml = (md: string) => {
            const match = md.match(/```html([\s\S]*?)```/);
            return match ? match[1] : '';
        };

        const renderLines = () => content.split('\n').map((line, i) => {
            if (line.trim().startsWith('```')) return null; // 简单忽略代码块标记行
            
            if (line.startsWith('# ')) {
                const text = line.substring(2).trim();
                return <h1 key={i} id={text} className="text-xl font-bold my-4 text-apple-text dark:text-apple-dark-text scroll-mt-24">{parseInline(text)}</h1>;
            }
            if (line.startsWith('## ')) {
                const text = line.substring(3).trim();
                return <h2 key={i} id={text} className="text-lg font-bold my-3 text-apple-text dark:text-apple-dark-text scroll-mt-24">{parseInline(text)}</h2>;
            }
            if (line.startsWith('### ')) {
                const text = line.substring(4).trim();
                return <h3 key={i} id={text} className="text-base font-bold my-2 text-apple-text dark:text-apple-dark-text scroll-mt-24">{parseInline(text)}</h3>;
            }
            if (line.startsWith('* ') || line.startsWith('- ')) {
                return <li key={i} className="ml-4 list-disc my-1">{parseInline(line.substring(2))}</li>;
            }
            if (line.startsWith('> ')) {
                return <blockquote key={i} className="border-l-4 border-apple-blue pl-4 italic my-4 text-gray-600 dark:text-gray-400">{parseInline(line.replace('> ', ''))}</blockquote>
            }
            
            // 图片检测: ![alt](url)
            const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
            if (imgMatch) {
                const cleanSrc = sanitizeUrl(imgMatch[2]);
                return (
                    <div key={i} className="my-4 group">
                        <Img 
                            src={cleanSrc} 
                            alt={imgMatch[1]} 
                            className="rounded-xl shadow-md cursor-zoom-in max-h-96 w-auto mx-auto hover:opacity-90 transition-opacity object-contain"
                            onClick={() => setPreviewImage(cleanSrc)}
                        />
                        {imgMatch[1] && <p className="text-center text-xs text-gray-500 mt-2">{imgMatch[1]}</p>}
                    </div>
                );
            }

            if (line.trim() === '') return <br key={i} />;

            return <p key={i} className="my-2 leading-relaxed text-gray-700 dark:text-gray-300">{parseInline(line)}</p>;
        });

        return { hasHtmlBlock, extractHtml, renderLines };
    }, [content]);

    const runCode = () => {
        const html = parsedContent.extractHtml(content);
        if (!html) return;
        
        const newWindow = window.open();
        if(newWindow) {
            newWindow.document.write(html);
            newWindow.document.close();
        }
    };

    return (
        <div className="w-full">
            {parsedContent.hasHtmlBlock && (
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
                     {parsedContent.renderLines()}
                </div>
            )}

            <ImageViewer src={previewImage} onClose={() => setPreviewImage(null)} />
        </div>
    );
});

// --- Markdown 编辑器组件 (React版 v-md-editor 替代品) ---
interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    height?: string;
}

export const MarkdownEditor = ({ value, onChange, placeholder, height = "300px" }: MarkdownEditorProps) => {
    const [preview, setPreview] = useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const insertText = (before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const beforeText = text.substring(0, start);
        const afterText = text.substring(end);
        const selection = text.substring(start, end);

        const newText = beforeText + before + selection + after + afterText;
        onChange(newText);
        
        // Restore focus and cursor
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 transition-colors">
            {/* 工具栏 */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center space-x-1">
                    <button onClick={() => insertText('**', '**')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="加粗"><Bold size={16}/></button>
                    <button onClick={() => insertText('*', '*')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="斜体"><Italic size={16}/></button>
                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                    <button onClick={() => insertText('## ')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="标题"><Heading size={16}/></button>
                    <button onClick={() => insertText('> ')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="引用"><Quote size={16}/></button>
                    <button onClick={() => insertText('* ')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="列表"><List size={16}/></button>
                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                    <button onClick={() => insertText('[](url)')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="链接"><LinkIcon size={16}/></button>
                    <button onClick={() => insertText('![alt](url)')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="图片"><ImageIcon size={16}/></button>
                </div>
                <div className="flex items-center">
                    <button 
                        onClick={() => setPreview(!preview)} 
                        className={`flex items-center px-3 py-1 text-xs font-medium rounded-full transition-colors ${preview ? 'bg-apple-blue text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                    >
                        {preview ? <Eye size={14} className="mr-1"/> : <Code size={14} className="mr-1"/>}
                        {preview ? '预览中' : '编辑中'}
                    </button>
                </div>
            </div>

            {/* 编辑区域 */}
            <div className="relative" style={{ height }}>
                {preview ? (
                    <div className="w-full h-full p-4 overflow-y-auto bg-white dark:bg-gray-800">
                         <div className="prose prose-sm dark:prose-invert max-w-none">
                             <MarkdownRenderer content={value || '无内容预览'} />
                         </div>
                    </div>
                ) : (
                    <textarea 
                        ref={textareaRef}
                        className="w-full h-full p-4 bg-transparent border-none outline-none resize-none text-apple-text dark:text-apple-dark-text font-mono text-sm leading-relaxed"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                    />
                )}
            </div>
        </div>
    );
};