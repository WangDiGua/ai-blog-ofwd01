import React from 'react';
import { Github, Twitter, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"><Github className="h-6 w-6" /></a>
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"><Twitter className="h-6 w-6" /></a>
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"><Mail className="h-6 w-6" /></a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              &copy; 2025 iBlog. 基于苹果美学设计。
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
