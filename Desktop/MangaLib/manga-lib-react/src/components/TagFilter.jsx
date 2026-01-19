import React, { useState, useMemo } from 'react';
import { ChevronDown, Library, Star, Filter, Folder } from 'lucide-react';
import { cn } from '../lib/utils';

export const TagFilter = ({ 
  allTags, 
  activeTags, 
  onToggleTag,
  onClearTags,
  filterLogic,
  onToggleLogic,
  starredTags = [], 
  onToggleStarTag,  
  tagGroups = []    
}) => {
  const [isSfwOpen, setIsSfwOpen] = useState(false);
  const [isNsfwOpen, setIsNsfwOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);

  // ... (useMemo 逻辑保持不变) ...
  const { sfwTags, nsfwTags } = useMemo(() => {
    // ... 代码不变 ...
    const sfw = []; const nsfw = [];
    const nsfwKeywords = ['R18', 'NSFW', 'HENTAI', 'SEX', 'PORN', 'ADULT', '18+', 'GROTESQUE'];
    Array.from(allTags).sort().forEach(tag => {
        const upper = tag.toUpperCase();
        if (nsfwKeywords.some(k => upper.includes(k))) nsfw.push(tag);
        else sfw.push(tag);
    });
    return { sfwTags: sfw, nsfwTags: nsfw };
  }, [allTags]);

  // ... (toggleGroup 逻辑保持不变) ...
  const toggleGroup = (groupTags) => { /*...*/ };

  return (
    <div className="relative z-30 bg-[#fafafa]/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md -mx-4 sm:-mx-6 px-4 sm:px-6 pt-3 pb-3 transition-colors duration-500 flex flex-col gap-2 shadow-sm">
      <div className="flex justify-between items-start gap-4 min-h-[44px]"> {/* 高度稍增 */}
        
        {/* 左侧：已选标签展示区 */}
        <div className="flex flex-wrap items-center gap-2 flex-grow transition-all">
          <button 
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wider transition-all shadow-md z-10", // py-1.5 -> py-2
              activeTags.length === 0 
                ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                : "border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-gray-400 bg-white dark:bg-neutral-900"
            )}
            onClick={onClearTags}
          >
            全部
          </button>
          
          {/* [修复] 分组开关：如果 tagGroups 为空也显示，但置灰，方便你知道它存在 */}
          <button 
            onClick={() => tagGroups.length > 0 && setIsGroupOpen(!isGroupOpen)}
            disabled={tagGroups.length === 0}
            className={cn(
                "flex-shrink-0 px-3 py-2 rounded-full border text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 z-10",
                isGroupOpen 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                    : tagGroups.length === 0
                        ? "border-transparent text-gray-300 dark:text-neutral-700 cursor-not-allowed" // 空状态
                        : "border-gray-200 dark:border-neutral-800 text-gray-500 hover:text-blue-500 hover:border-blue-500"
            )}
            title={tagGroups.length === 0 ? "暂无分组配置" : "查看分组"}
          >
            <Folder size={16} />
            <span>分组</span>
          </button>

          {/* [修改] 逻辑切换：文字改为中文，添加进出动画 */}
          {activeTags.length > 1 && (
             <button 
                onClick={onToggleLogic} 
                className={cn(
                    "flex-shrink-0 px-3 py-2 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm z-10 animate-fade-in-scale", // 添加 animate 类
                    filterLogic === 'AND' ? "bg-black dark:bg-white text-white dark:text-black" : "bg-transparent"
                )}
             > 
                <Filter size={14} /> 
                {/* [修改] 文字 */}
                <span>{filterLogic === 'AND' ? '符合全部' : '符合任意'}</span>
             </button>
          )}

          {/* 已选 Chips */}
          {activeTags.map(tag => (
            <button key={tag} onClick={() => onToggleTag(tag)} className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-full border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider shadow-md">
              {tag}
            </button>
          ))}
        </div>
        
        {/* 右侧：抽屉开关 */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2 border-l border-gray-200 dark:border-neutral-800 pl-2">
          <button onClick={() => setIsSfwOpen(!isSfwOpen)} className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-xs font-bold text-gray-500 dark:text-gray-400">
            <span>Tag</span> <ChevronDown size={18} className={cn("transition-transform", isSfwOpen && "rotate-180")} />
          </button>
          <button onClick={() => setIsNsfwOpen(!isNsfwOpen)} className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/10 text-xs font-bold text-nsfwLight dark:text-nsfwDark">
            {/* [修改] R18 -> NSFW */}
            <span>NSFW</span> <ChevronDown size={18} className={cn("transition-transform", isNsfwOpen && "rotate-180")} />
          </button>
        </div>
      </div>
      
      {/* ... (后续抽屉代码，TagChip组件的 padding 也建议改为 py-1 增加大小) ... */}
      <div className="w-full h-px bg-gray-200 dark:bg-neutral-800 my-1"></div>
      
      {/* 略：抽屉内容代码不变，但请确保 TagChip 里的 padding 也调大了 */}
      {/* ... */}
      
    </div>
  );
};

// [修改] 辅助组件：Tag Chip 调大
const TagChip = ({ tag, isActive, isStarred, onToggle, onStar, isNsfw }) => (
    <div className={cn(
        "group flex items-center rounded-full border text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer select-none", // text-[10px] -> [11px]
        isActive 
            ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white" 
            : isNsfw
                ? "border-red-200 dark:border-red-900 text-red-500 hover:border-red-400 bg-white dark:bg-neutral-900"
                : "border-gray-200 dark:border-neutral-800 text-gray-500 hover:border-gray-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900"
    )}>
        {/* px-2 py-0.5 -> px-3 py-1.5 */}
        <span onClick={onToggle} className="px-3 py-1.5">{tag}</span> 
        <button 
            onClick={(e) => { e.stopPropagation(); onStar(); }}
            className={cn(
                "pr-2 pl-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-yellow-500",
                isStarred && "opacity-100 text-yellow-500"
            )}
        >
            <Star size={12} fill={isStarred ? "currentColor" : "none"} />
        </button>
    </div>
);