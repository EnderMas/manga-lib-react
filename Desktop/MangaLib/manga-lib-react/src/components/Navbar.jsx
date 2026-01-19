import React from 'react';
import { Search, Moon, Sun, Plus, ArrowUpDown } from 'lucide-react';
import { cn } from '../lib/utils';

export const Navbar = ({ 
  searchQuery, 
  setSearchQuery, 
  toggleDarkMode, 
  isDarkMode,
  onAddClick,
  className
}) => {
  return (
    <nav className={cn(
      "sticky top-0 z-40 w-full border-b border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 py-3 flex items-center justify-between transition-colors duration-500",
      className
    )}>
      {/* 1. Logo / 标题区域 */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <span className="font-serif font-bold text-white text-lg">M</span>
        </div>
        <h1 className="hidden md:block font-serif font-bold text-xl tracking-tight dark:text-white">
          MangaLib <span className="text-xs text-gray-400 font-sans font-normal align-top">v3.0</span>
        </h1>
      </div>

      {/* 2. 中间搜索框 */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索漫画标题、作者..."
            className="w-full bg-gray-100 dark:bg-neutral-900 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all dark:text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* 3. 右侧功能区 */}
      <div className="flex items-center gap-3">
        {/* 排序按钮 (暂时只是个 UI 占位，稍后接逻辑) */}
        <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors" title="排序">
          <ArrowUpDown size={20} />
        </button>

        {/* 深色模式切换 */}
        <button 
          onClick={toggleDarkMode}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* 添加漫画按钮 */}
        <button 
          onClick={onAddClick}
          className="hidden md:flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/20 dark:shadow-white/20"
        >
          <Plus size={16} strokeWidth={3} />
          <span>添加漫画</span>
        </button>
      </div>
    </nav>
  );
};