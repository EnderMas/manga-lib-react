import React, { useState, useMemo } from 'react';
import { ChevronDown, Library, Check, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

export const TagFilter = ({ 
  allTags, 
  activeTags, 
  onToggleTag,
  onClearTags,
  filterLogic,
  onToggleLogic 
}) => {
  const [isSfwOpen, setIsSfwOpen] = useState(false);
  const [isNsfwOpen, setIsNsfwOpen] = useState(false);

  // 简单的标签分类逻辑 (模拟原版)
  // 假设所有 Tag 都在 allTags 里，我们需要根据某种规则区分 SFW/NSFW
  // 这里暂时为了简化，全部放在 SFW 里，或者你需要传入带有类型信息的 tags 数据
  // 为了视觉还原，我们先把所有 Tags 渲染在 SFW 抽屉里
  const sortedTags = useMemo(() => Array.from(allTags).sort(), [allTags]);

  return (
    <div className="relative z-30 bg-[#fafafa]/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md -mx-4 sm:-mx-6 px-4 sm:px-6 pt-2 pb-2 transition-colors duration-500 flex flex-col gap-1">
      <div className="flex justify-between items-start gap-4 min-h-[40px]">
        
        {/* 左侧：已选标签展示区 */}
        <div className="flex flex-wrap items-center gap-2 flex-grow transition-all">
          <button 
            className={cn(
              "flex-shrink-0 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all shadow-md z-10",
              activeTags.length === 0 
                ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                : "border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-gray-400 bg-white dark:bg-neutral-900"
            )}
            onClick={onClearTags}
          >
            全部
          </button>
          
          <button className="flex-shrink-0 px-3 py-1.5 rounded-full border border-gray-200 dark:border-neutral-800 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 text-gray-500 hover:text-blue-500 hover:border-blue-500 z-10 ml-1">
            <Library size={16} />
            <span>成组</span>
          </button>

          {/* 筛选逻辑切换按钮 (AND/OR) */}
          {activeTags.length > 1 && (
             <button 
                onClick={onToggleLogic}
                className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1 shadow-sm z-10",
                    filterLogic === 'AND' 
                        ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                        : "bg-transparent text-black dark:text-white border-black dark:border-white"
                )}
             >
                <Filter size={14} />
                <span>{filterLogic === 'AND' ? '符合全部' : '符合任意'}</span>
             </button>
          )}

          {/* 已选中的标签 Chips */}
          {activeTags.map(tag => (
            <button
              key={tag}
              onClick={() => onToggleTag(tag)}
              className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider shadow-md"
            >
              {tag}
            </button>
          ))}
        </div>
        
        {/* 右侧：抽屉开关 */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2 border-l border-gray-200 dark:border-neutral-800 pl-2">
          <button 
            className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-xs font-bold text-gray-500 dark:text-gray-400 transition-colors"
            onClick={() => setIsSfwOpen(!isSfwOpen)}
          >
            <span>普通</span>
            <ChevronDown size={18} className={cn("transition-transform", isSfwOpen && "rotate-180")} />
          </button>
          <button 
            className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/10 text-xs font-bold text-nsfwLight dark:text-nsfwDark transition-colors"
            onClick={() => setIsNsfwOpen(!isNsfwOpen)}
          >
            <span>NSFW</span>
            <ChevronDown size={18} className={cn("transition-transform", isNsfwOpen && "rotate-180")} />
          </button>
        </div>
      </div>

      <div className="w-full h-px bg-gray-200 dark:bg-neutral-800 my-1"></div>

      {/* 抽屉内容区域 */}
      <div className="relative">
        <div className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            isSfwOpen ? "max-h-[2000px] opacity-100 mt-2" : "max-h-0 opacity-0"
        )}>
            <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-neutral-900/50 rounded-lg">
                {sortedTags.map(tag => (
                    <button
                        key={tag}
                        onClick={() => onToggleTag(tag)}
                        className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full transition-colors",
                            activeTags.includes(tag) 
                                ? "bg-black text-white border-black" 
                                : "border-gray-200 dark:border-neutral-800 text-gray-500 hover:border-gray-400 dark:hover:border-neutral-600"
                        )}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
        
        {/* NSFW 抽屉 (暂时留空或复用逻辑) */}
        <div className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            isNsfwOpen ? "max-h-[2000px] opacity-100 mt-2" : "max-h-0 opacity-0"
        )}>
            <div className="flex flex-wrap gap-2 p-2 bg-red-50 dark:bg-red-900/10 rounded-lg border border-nsfwLight/20">
                <span className="text-xs text-nsfwLight">NSFW 标签暂未分类...</span>
            </div>
        </div>
      </div>
    </div>
  );
};