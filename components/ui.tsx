import React from 'react';
import { useStore } from '../context/store';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Card Component ---
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

// --- Button Component ---
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

// --- Avatar Component ---
export const Avatar = ({ src, alt, size = 'md' }: { src: string; alt: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16"
  };

  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${sizes[size]} rounded-full object-cover border border-gray-100 dark:border-gray-800 shadow-sm`}
    />
  );
};

// --- Loading Spinner ---
export const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-apple-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// --- Theme Toggle Animation Component ---
export const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useStore();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full overflow-hidden shadow-inner focus:outline-none focus:ring-2 focus:ring-apple-blue/50 transition-colors duration-500"
      style={{ backgroundColor: darkMode ? '#1a202c' : '#87CEEB' }} // Sky color
      aria-label="Toggle Theme"
    >
      {/* Sky Container */}
      <div className="absolute inset-0 theme-toggle-sky">
        
        {/* Sun */}
        <div 
          className="absolute w-5 h-5 bg-yellow-400 rounded-full shadow-lg theme-sun"
          style={{ 
            top: darkMode ? '150%' : '50%', 
            left: darkMode ? '50%' : '20%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 10px rgba(255, 223, 0, 0.7)'
          }}
        />

        {/* Moon */}
        <div 
          className="absolute w-5 h-5 bg-gray-100 rounded-full shadow-lg theme-moon"
          style={{ 
            top: darkMode ? '50%' : '-50%', 
            left: darkMode ? '80%' : '50%',
            transform: 'translate(-50%, -50%)',
             boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
          }}
        >
          {/* Craters */}
          <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-gray-300 rounded-full opacity-50"></div>
          <div className="absolute bottom-1.5 right-1.5 w-1 h-1 bg-gray-300 rounded-full opacity-50"></div>
        </div>

        {/* Stars (Only in dark mode) */}
        <div 
          className="absolute inset-0 theme-star"
          style={{ opacity: darkMode ? 1 : 0 }}
        >
           <div className="absolute top-1 left-2 w-0.5 h-0.5 bg-white rounded-full opacity-80 animate-pulse"></div>
           <div className="absolute top-4 left-6 w-0.5 h-0.5 bg-white rounded-full opacity-60"></div>
           <div className="absolute bottom-2 left-4 w-0.5 h-0.5 bg-white rounded-full opacity-70 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

      </div>
    </button>
  );
};

// --- Pagination Component ---
export const Pagination = ({ page, totalPages, onPageChange }: { page: number, totalPages: number, onPageChange: (p: number) => void }) => {
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
      
      <span className="text-sm font-medium text-apple-subtext mx-2">
        Page {page} of {totalPages}
      </span>

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

// --- Modal Component ---
export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title?: string, children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative bg-white dark:bg-apple-dark-card w-full max-w-md rounded-2xl shadow-2xl p-6 transform transition-all animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          {title && <h3 className="text-xl font-bold text-apple-text dark:text-apple-dark-text">{title}</h3>}
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
