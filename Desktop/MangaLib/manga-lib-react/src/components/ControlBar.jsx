import React from 'react';
import { Search, X, Trash2, CheckSquare, Reply, Maximize2, Minimize2, Eye, EyeOff, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

export const ControlBar = ({
  searchQuery,
  setSearchQuery,
  gridSize,
  setGridSize,
  isDeleteMode,
  toggleDeleteMode,
  nsfwMode,
  cycleNSFW,
  selectedCount,
  onSelectAll,
  onDeleteSelected,
  onOpenSettings
}) => {
  return (
    <div className="relative z-30 bg-[#fafafa]/95 dark:bg-[#0a0a0a]/95 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 transition-colors duration-500 flex flex-wrap md:flex-row justify-between items-end md:items-center gap-4">
      
      {/* 左侧：大搜索框 */}
      <div className="w-full md:w-1/3 relative group">
        <input 
          className="w-full bg-transparent border-b border-gray-300 dark:border-neutral-800 py-2 pr-10 text-xl font-serif focus:border-black dark:focus:border-white outline-none transition-colors dark:text-white placeholder-gray-300 dark:placeholder-neutral-700" 
          placeholder="搜索收藏..." 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        {searchQuery && (
            <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-8 top-2 text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 transition-colors"
            >
                <X size={20} />
            </button>
        )}
        <Search className="absolute right-0 top-2 text-gray-300" size={24} />
      </div>

      {/* 右侧：控制工具栏 */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-end flex-wrap">
        
        {/* 删除模式控件组 */}
        <div className="relative">
            {!isDeleteMode ? (
                <button 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-neutral-800 text-xs font-bold transition-colors text-gray-500 dark:text-gray-400 hover:border-red-500 hover:text-red-500"
                    onClick={toggleDeleteMode}
                >
                    <Trash2 size={16} />
                    <span>删除模式</span>
                </button>
            ) : (
                <div className="flex items-center gap-2 animate-fade-in">
                    <button 
                        className="p-1.5 rounded-full bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 transition-colors" 
                        onClick={toggleDeleteMode}
                        title="退出"
                    >
                        <Reply size={16} />
                    </button>
                    <div className="h-6 w-px bg-gray-300 dark:bg-neutral-700 mx-1"></div>
                    <button 
                        className="px-3 py-1.5 rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors min-w-[60px]"
                        onClick={onSelectAll}
                    >
                        全选
                    </button>
                    <button 
                        className="px-4 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors shadow-md flex items-center gap-1"
                        onClick={onDeleteSelected}
                    >
                        <Trash2 size={14} />
                        <span>删除({selectedCount})</span>
                    </button>
                </div>
            )}
        </div>

        {/* 尺寸滑块 */}
        <div className="flex items-center gap-2 group">
            <Minimize2 size={14} className="text-gray-400" />
            <input 
                type="range" 
                min="150" 
                max="400" 
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
                className="w-24 md:w-32 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-black dark:accent-white" 
            />
            <Maximize2 size={14} className="text-gray-400" />
        </div>

        {/* NSFW 切换 */}
        <button 
            onClick={cycleNSFW}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-300",
                nsfwMode === 0 && "border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-gray-400 hover:border-gray-400",
                nsfwMode === 1 && "border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10",
                nsfwMode === 2 && "border-red-500 bg-red-500 text-white hover:bg-red-600"
            )}
        >
            {nsfwMode === 0 && <Eye size={16} />}
            {nsfwMode === 1 && <Eye size={16} className="opacity-50" />}
            {nsfwMode === 2 && <EyeOff size={16} />}
            <span>
                {nsfwMode === 0 && '显示'}
                {nsfwMode === 1 && '模糊'}
                {nsfwMode === 2 && '隐藏'}
            </span>
        </button>

        {/* 设置按钮 */}
        <button 
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400 transition-colors"
            onClick={onOpenSettings}
        >
            <Settings size={20} />
        </button>
      </div>
    </div>
  );
};