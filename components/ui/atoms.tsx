import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { CultivationLevel } from '../../types';
import MDEditor from '@uiw/react-md-editor';
// import rehypeSanitize from 'rehype-sanitize';
import { generateHeadingId } from '../../utils/lib';

// --- 通用默认图片常量 ---
export const DEFAULT_IMAGE = "https://placehold.co/800x600/f3f4f6/9ca3af?text=No+Image";
export const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=User&background=random";

// --- 增强版图片组件 (带自动回退) ---
interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
    src?: string;
    alt?: string;
    className?: string;
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
        bg-apple-card dark:bg-apple-dark-card rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden
        transition-all duration-300 ease-ios
        ${hover ? 'hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 hover:scale-[1.01] hover:-translate-y-1' : ''}
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
  children?: React.ReactNode;
  className?: string;
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
      className={`${sizes[size]} rounded-full object-cover border border-gray-200 dark:border-gray-800 shadow-sm transition-transform duration-300 ease-ios hover:scale-105 ${className}`}
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

// --- Hook: 自动检测当前暗黑模式状态 ---
const useDarkMode = () => {
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setIsDark(document.documentElement.classList.contains('dark'));
                }
            });
        });
        
        observer.observe(document.documentElement, { attributes: true });
        
        // 初始检查
        setIsDark(document.documentElement.classList.contains('dark'));

        return () => observer.disconnect();
    }, []);

    return isDark;
};

// Helper: 递归获取子元素的纯文本，用于生成 ID
const getTextFromChildren = (children: React.ReactNode): string => {
    if (typeof children === 'string') return children;
    if (typeof children === 'number') return String(children);
    if (Array.isArray(children)) return children.map(getTextFromChildren).join('');
    if (React.isValidElement<{ children?: React.ReactNode }>(children) && children.props.children) {
        return getTextFromChildren(children.props.children);
    }
    return '';
};

// --- Markdown 渲染器 (Powered by @uiw/react-md-editor) ---
export const MarkdownRenderer = React.memo(({ content }: { content: string }) => {
    const isDark = useDarkMode();
    
    if (!content) return null;

    // 自定义标题组件，自动生成 ID 以支持目录跳转
    const components = {
        h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
            const text = getTextFromChildren(children);
            const id = generateHeadingId(text);
            return <h1 id={id} {...props}>{children}</h1>;
        },
        h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
            const text = getTextFromChildren(children);
            const id = generateHeadingId(text);
            return <h2 id={id} {...props}>{children}</h2>;
        },
        h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
            const text = getTextFromChildren(children);
            const id = generateHeadingId(text);
            return <h3 id={id} {...props}>{children}</h3>;
        },
        h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
            const text = getTextFromChildren(children);
            const id = generateHeadingId(text);
            return <h4 id={id} {...props}>{children}</h4>;
        }
    };

    return (
        <div data-color-mode={isDark ? 'dark' : 'light'}>
            <MDEditor.Markdown 
                source={content} 
                style={{ 
                    whiteSpace: 'pre-wrap', 
                    backgroundColor: 'transparent',
                    color: 'inherit',
                    fontFamily: 'inherit',
                    fontSize: 'inherit'
                }} 
                components={components}
                // rehypePlugins={[rehypeSanitize]}
            />
        </div>
    );
});

// --- Markdown 编辑器组件 (Powered by @uiw/react-md-editor) ---
interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    height?: string;
}

export const MarkdownEditor = ({ value, onChange, placeholder, height = "300px" }: MarkdownEditorProps) => {
    const isDark = useDarkMode();

    return (
        <div data-color-mode={isDark ? 'dark' : 'light'}>
            <MDEditor
                value={value}
                onChange={(val) => onChange(val || '')}
                height={parseInt(height) || 300}
                preview="edit"
                textareaProps={{
                    placeholder: placeholder
                }}
                className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
                style={{
                    backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                    color: isDark ? '#f5f5f7' : '#1d1d1f',
                    // borderColor is handled by class
                }}
                // previewOptions={{
                //     rehypePlugins: [rehypeSanitize]
                // }}
            />
        </div>
    );
};