import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/store';
import { Button } from './atoms';
import { Modal } from './modals';
import { ChevronLeft, ChevronRight, ArrowUp, Type, Coffee, Sun, Moon, CheckCircle, AlertCircle, Info, Plus } from 'lucide-react';

// --- 动画主题切换 (日落 / 月升) ---
export const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useStore();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full overflow-hidden focus:outline-none transition-colors duration-500 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="切换主题"
    >
       {/* 太阳和月亮的容器 */}
       <div className="absolute inset-0 flex items-center justify-center">
          {/* 太阳: 浅色模式可见 (y=0), 深色模式下移 (y=100%) */}
          <div 
            className="absolute transition-all duration-500 ease-out"
            style={{ 
              transform: darkMode ? 'translateY(150%)' : 'translateY(0)',
              opacity: darkMode ? 0 : 1
            }}
          >
             <Sun className="text-orange-500 fill-orange-500" size={24} />
          </div>

          {/* 月亮: 浅色模式隐藏 (y=100%), 深色模式上移 (y=0) */}
          <div 
            className="absolute transition-all duration-500 ease-out"
            style={{ 
              transform: darkMode ? 'translateY(0)' : 'translateY(150%)',
              opacity: darkMode ? 1 : 0
            }}
          >
             <Moon className="text-yellow-300 fill-yellow-300" size={24} />
          </div>
       </div>
    </button>
  );
};

// --- 分页组件 ---
export const Pagination = ({ page, totalPages, onPageChange }: { page: number, totalPages: number, onPageChange: (p: number) => void }) => {
  const getPageNumbers = () => {
      const pages = [];
      for (let i = 1; i <= totalPages; i++) {
          if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
              pages.push(i);
          } else if (pages[pages.length - 1] !== '...') {
              pages.push('...');
          }
      }
      return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <Button 
        variant="secondary" 
        size="sm" 
        disabled={page <= 1} 
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} />
      </Button>
      
      <div className="flex space-x-1">
          {getPageNumbers().map((p, idx) => (
              <button
                  key={idx}
                  onClick={() => typeof p === 'number' && onPageChange(p)}
                  disabled={typeof p !== 'number'}
                  className={`
                      w-8 h-8 rounded-full text-xs font-medium transition-all
                      ${p === page 
                          ? 'bg-apple-blue text-white shadow-md scale-110' 
                          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                      ${typeof p !== 'number' ? 'cursor-default' : ''}
                  `}
              >
                  {p}
              </button>
          ))}
      </div>

      <Button 
        variant="secondary" 
        size="sm" 
        disabled={page >= totalPages} 
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
};

// --- Toast 通知 ---
export const ToastContainer = () => {
    const { toasts } = useStore();
    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] space-y-2 pointer-events-none">
            {toasts.map(toast => (
                <div 
                    key={toast.id}
                    className="pointer-events-auto flex items-center px-4 py-3 rounded-xl shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 fade-in duration-300"
                >
                    {toast.type === 'success' && <CheckCircle className="text-green-500 mr-2" size={18} />}
                    {toast.type === 'error' && <AlertCircle className="text-red-500 mr-2" size={18} />}
                    {toast.type === 'info' && <Info className="text-blue-500 mr-2" size={18} />}
                    <span className="text-sm font-medium text-apple-text dark:text-apple-dark-text">{toast.message}</span>
                </div>
            ))}
        </div>
    );
};

// --- 悬浮菜单 (重新设计) ---
export const FloatingMenu = () => {
    const { cycleFontSize } = useStore();
    const [showDonate, setShowDonate] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <div className="fixed right-6 bottom-10 z-40 flex flex-col items-center group">
                {/* 菜单项 */}
                <div className={`flex flex-col-reverse items-center space-y-reverse space-y-3 mb-4 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    <button 
                        onClick={scrollToTop}
                        className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-apple-blue dark:hover:text-white hover:scale-110 transition-all"
                        title="回到顶部"
                    >
                        <ArrowUp size={18} />
                    </button>
                    <button 
                        onClick={() => setShowDonate(true)}
                        className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-pink-500 hover:text-pink-600 hover:scale-110 transition-all"
                        title="打赏"
                    >
                        <Coffee size={18} />
                    </button>
                    <button 
                        onClick={cycleFontSize}
                        className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-apple-blue dark:hover:text-white hover:scale-110 transition-all"
                        title="调整字号"
                    >
                        <Type size={18} />
                    </button>
                </div>

                {/* 主触发按钮 */}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-105 border border-white/20 
                    ${isOpen ? 'bg-gray-800 text-white rotate-45' : 'bg-apple-blue text-white'}`}
                >
                    <Plus size={24} className="transition-transform" />
                </button>
            </div>

            <Modal isOpen={showDonate} onClose={() => setShowDonate(false)} title="请我喝杯咖啡">
                <div className="text-center p-4">
                    <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Coffee className="text-pink-500 h-10 w-10" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        如果您喜欢我的作品，您可以支持我继续运营这个博客！
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="secondary" onClick={() => window.open('https://paypal.me', '_blank')}>PayPal</Button>
                        <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={() => window.open('https://weixin.qq.com', '_blank')}>微信</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

// --- 表情选择器 (简单版) ---
export const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
    const emojis = ["👍", "❤️", "😂", "😮", "😢", "😡", "🎉", "🔥", "👀", "🚀", "💯", "🤔", "👏", "💩", "👻"];
    
    return (
        <div className="p-2 grid grid-cols-5 gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
            {emojis.map(e => (
                <button 
                    key={e} 
                    onClick={() => onSelect(e)}
                    className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors"
                >
                    {e}
                </button>
            ))}
        </div>
    );
};

// --- 验证码组件 ---
export const Captcha = ({ onValidate }: { onValidate: (isValid: boolean) => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [code, setCode] = useState('');
    const [input, setInput] = useState('');

    const generateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let newCode = '';
        for(let i=0; i<4; i++) newCode += chars.charAt(Math.floor(Math.random() * chars.length));
        setCode(newCode);
        return newCode;
    };

    const drawCaptcha = (text: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0,0, canvas.width, canvas.height);
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0,0, canvas.width, canvas.height);
        
        ctx.font = '24px monospace';
        ctx.fillStyle = '#1d1d1f';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        
        // 添加噪点
        for(let i=0; i<10; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.strokeStyle = '#d1d5db';
            ctx.stroke();
        }
        
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate((Math.random() - 0.5) * 0.4);
        ctx.fillText(text, 0, 0);
        ctx.restore();
    };

    useEffect(() => {
        const c = generateCode();
        drawCaptcha(c);
        onValidate(false);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase();
        setInput(val);
        onValidate(val === code);
    };

    const refresh = () => {
        const c = generateCode();
        drawCaptcha(c);
        setInput('');
        onValidate(false);
    };

    return (
        <div className="flex space-x-2">
            <input 
                type="text" 
                placeholder="验证码" 
                className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border-none outline-none text-apple-text dark:text-apple-dark-text"
                value={input}
                onChange={handleChange}
                maxLength={4}
            />
            <canvas 
                ref={canvasRef} 
                width={100} 
                height={40} 
                className="rounded-xl cursor-pointer" 
                onClick={refresh}
                title="点击刷新"
            />
        </div>
    );
};