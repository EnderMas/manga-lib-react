import React from 'react';
import { Trash2, Shuffle, Moon, Sun, Upload, Grid, Terminal, Save } from 'lucide-react';
import { cn } from '../lib/utils';

export const TopNav = ({ 
  recycleCount = 0, 
  onOpenRecycle, 
  onToggleTheme, 
  isDarkMode,
  onImportClick,
  onRandomClick
}) => {
  return (
    <nav className="sticky top-0 z-50 h-16 transition-all duration-500 group">
      {/* 背景模糊层 */}
      <div className="absolute inset-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-100 dark:border-neutral-900 transition-all duration-500 -z-10 pointer-events-none"></div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4 relative z-10">
        {/* 左侧：工具切换 & 回收站 */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center bg-gray-100 dark:bg-neutral-900 p-1 rounded-full relative">
            <button className="p-2 rounded-full transition-all duration-300 bg-white dark:bg-neutral-800 shadow-sm text-black dark:text-white transform scale-105" title="画廊">
              <Grid size={20} />
            </button>
            <button className="p-2 rounded-full transition-all duration-300 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" title="爬虫工具 (暂未迁移)">
              <Terminal size={20} />
            </button>
          </div>

          <button 
            className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors" 
            onClick={onOpenRecycle}
          >
            <Trash2 size={18} />
            <span>({recycleCount})</span>
          </button>
          
          {/* 保存指示器 (静态展示) */}
          <span className="text-xs text-green-500 animate-pulse hidden flex items-center gap-1">
            <Save size={12} /> 已保存
          </span>
        </div>

        {/* 中间：滚动时合并的控制栏 (暂时留空，后续做高级交互) */}
        <div className="hidden md:flex items-center gap-4 opacity-0 pointer-events-none"></div>

        {/* 右侧：随机、导入、主题 */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* 随机按钮 (带流体光斑效果) */}
          <button 
            className="btn-random-glass group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm overflow-hidden isolate" 
            onClick={onRandomClick}
            title="随机打开一个条目"
          >
            <span className="glass-blob blob-1"></span>
            <span className="glass-blob blob-2"></span>
            <span className="glass-blob blob-3"></span>
            
            <span className="relative z-10 flex items-center gap-1.5 text-shadow-sm">
              <Shuffle size={18} />
              <span className="hidden sm:inline">随机</span>
            </span>
          </button>
          
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs font-bold uppercase tracking-wider hover:scale-105 transition-transform shadow-lg" 
            onClick={onImportClick}
          >
            <Upload size={14} />
            <span className="hidden sm:inline">导入</span>
          </button>
          
          <button 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors text-gray-600 dark:text-gray-400" 
            onClick={onToggleTheme}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
};