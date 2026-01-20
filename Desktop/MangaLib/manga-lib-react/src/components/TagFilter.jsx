import React, { useState, useMemo } from 'react';
import { ChevronDown, Library, Star, Filter, Folder } from 'lucide-react';
import { cn } from '../lib/utils';

export const TagFilter = ({ 
  sfwTags, 
  nsfwTags, 
  activeTags, 
  onToggleTag,
  onClearTags,
  filterLogic,
  onToggleLogic,
  starredTags = [], 
  onToggleStarTag,  
  tagGroups = [],
  onManageGroups // [New]
}) => {
  const [isSfwOpen, setIsSfwOpen] = useState(false);
  const [isNsfwOpen, setIsNsfwOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);

  // 辅助：处理分组点击 (默认分组Tag视为SFW)
  const toggleGroup = (groupTags) => {
      // 构造目标ID列表 (添加 s: 前缀)
      const targetIds = groupTags.map(t => 's:' + t);
      const allSelected = targetIds.every(id => activeTags.includes(id));
      
      targetIds.forEach((id, index) => {
          const rawTag = groupTags[index];
          if (allSelected) { 
              if (activeTags.includes(id)) onToggleTag(rawTag, false); 
          } else {
              if (!activeTags.includes(id)) onToggleTag(rawTag, false);
          }
      });
  };

  // 辅助：判断是否显示分割线
  const hasUnstarredSfw = sfwTags.some(t => !starredTags.includes('s:' + t));
  
  const hasAnyStarred = starredTags.length > 0 && (
      sfwTags.some(t => starredTags.includes('s:' + t)) || 
      nsfwTags.some(t => starredTags.includes('n:' + t))
  );

  return (
    <div className="relative z-30 bg-[#fafafa]/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md -mx-4 sm:-mx-6 px-4 sm:px-6 pt-3 pb-3 transition-colors duration-500 flex flex-col gap-2 shadow-sm">
      <div className="flex justify-between items-start gap-4 min-h-[44px]">
        
        {/* 左侧：控制栏 */}
        <div className="flex flex-wrap items-center gap-2 flex-grow transition-all">
          <button 
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wider transition-all shadow-md z-10",
              activeTags.length === 0 
                ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                : "border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-gray-400 bg-white dark:bg-neutral-900"
            )}
            onClick={onClearTags}
          >
            全部
          </button>
          
          {/* 分组按钮：分离式设计 */}
          <div className="flex items-center rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm z-10 flex-shrink-0 h-[34px]">
             <button 
                onClick={() => setIsGroupOpen(!isGroupOpen)}
                className={cn(
                    "px-3 h-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-neutral-800",
                    isGroupOpen ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" : "text-gray-500"
                )}
                title="切换分组显示"
             >
                <Folder size={16} />
                <span>分组</span>
             </button>
             <div className="w-px h-4 bg-gray-200 dark:bg-neutral-800"></div>
             <button 
                onClick={onManageGroups}
                className="px-2 h-full text-gray-400 hover:text-blue-500 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center"
                title="管理分组"
             >
                 <Library size={12} />
             </button>
          </div>

          {activeTags.length > 1 && (
             <button 
                onClick={onToggleLogic} 
                className={cn(
                    "flex-shrink-0 px-3 py-2 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm z-10 animate-fade-in-scale",
                    filterLogic === 'AND' ? "bg-black dark:bg-white text-white dark:text-black" : "bg-transparent"
                )}
             > 
                <Filter size={14} /> 
                <span>{filterLogic === 'AND' ? '符合全部' : '符合任意'}</span>
             </button>
          )}

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
            <span style={{ color: '#ff5d8f' }} className="dark:hidden">NSFW</span> {/* 浅色模式文字颜色 */}
            <span style={{ color: '#ffc4d6' }} className="hidden dark:inline">NSFW</span> {/* 深色模式文字颜色 */}
            <ChevronDown size={18} className={cn("transition-transform", isNsfwOpen && "rotate-180")} />
          </button>
        </div>
      </div>

      <div className="w-full h-px bg-gray-200 dark:bg-neutral-800 my-1"></div>

      {/* 1. 分组抽屉 */}
      <div className={cn("transition-all duration-300 ease-in-out overflow-hidden bg-blue-50/50 dark:bg-blue-900/10 rounded-lg", isGroupOpen ? "max-h-[500px] mb-2" : "max-h-0")}>
          <div className="flex flex-wrap gap-2 p-3">
              {tagGroups.length === 0 && <span className="text-xs text-gray-400 p-2">暂无分组配置 (需导入 manga_tag_group.js)</span>}
              {tagGroups.map(group => {
                  const activeCount = group.tags.filter(t => activeTags.includes(t)).length;
                  const isFull = activeCount === group.tags.length && group.tags.length > 0;
                  return (
                    <button
                        key={group.id}
                        onClick={() => toggleGroup(group.tags)}
                        className={cn(
                            "text-xs px-3 py-1.5 rounded-md border flex items-center gap-2 transition-all",
                            isFull 
                                ? "bg-blue-500 text-white border-blue-600" 
                                : activeCount > 0 
                                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300"
                                    : "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400"
                        )}
                    >
                        <Folder size={12}/>
                        <span className="font-bold">{group.name}</span>
                        <span className="text-[10px] opacity-70">({activeCount}/{group.tags.length})</span>
                    </button>
                  );
              })}
          </div>
      </div>

      {/* 2. 普通标签抽屉 (包含收藏栏) */}
      <div className={cn("transition-all duration-300 ease-in-out overflow-hidden", isSfwOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0")}>
        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-neutral-900/50 rounded-lg">
            {sfwTags.length === 0 && nsfwTags.length === 0 && <span className="text-xs text-gray-400 p-2">暂无标签数据</span>}
            
            {/* [SFW] 收藏 */}
            {sfwTags.map(tag => {
                const id = 's:' + tag;
                if (!starredTags.includes(id)) return null;
                return <TagChip key={`starred-sfw-${tag}`} tag={tag} isActive={activeTags.includes(id)} isStarred={true} onToggle={() => onToggleTag(tag, false)} onStar={() => onToggleStarTag(tag, false)} isNsfw={false} />;
            })}
            
            {/* [NSFW] 收藏 */}
            {nsfwTags.map(tag => {
                const id = 'n:' + tag;
                if (!starredTags.includes(id)) return null;
                return <TagChip key={`starred-nsfw-${tag}`} tag={tag} isActive={activeTags.includes(id)} isStarred={true} onToggle={() => onToggleTag(tag, true)} onStar={() => onToggleStarTag(tag, true)} isNsfw={true} />;
            })}
            
            {/* 分割线 */}
            {hasAnyStarred && hasUnstarredSfw && (
                <div className="w-full h-px bg-gray-200 dark:bg-neutral-800 my-1 opacity-50"></div>
            )}
            
            {/* [SFW] 未收藏 */}
            {sfwTags.map(tag => {
                const id = 's:' + tag;
                if (starredTags.includes(id)) return null;
                return <TagChip key={tag} tag={tag} isActive={activeTags.includes(id)} isStarred={false} onToggle={() => onToggleTag(tag, false)} onStar={() => onToggleStarTag(tag, false)} isNsfw={false} />;
            })}
        </div>
      </div>
        
      {/* 3. NSFW 标签抽屉 (仅显示未收藏的，或者全部显示？通常收藏后还在下面留一份方便查找，或者隐藏。此处保持逻辑一致：未收藏的在下面) */}
      {/* 修正：通常抽屉里显示所有归类为该抽屉的 Tag，哪怕已收藏。上面的收藏栏是“快捷方式”。但为了不重复，我们通常隐藏已收藏的。这里保持逻辑：仅显示未收藏的。 */}
      <div className={cn("transition-all duration-300 ease-in-out overflow-hidden", isNsfwOpen ? "max-h-[2000px] opacity-100 mt-2" : "max-h-0 opacity-0")}>
        <div className="flex flex-wrap gap-2 p-2 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/30">
            {nsfwTags.length === 0 && <span className="text-xs text-red-400 p-2">未找到 NSFW 标签</span>}
            
            {/* [NSFW] 未收藏 */}
            {nsfwTags.map(tag => {
                 const id = 'n:' + tag;
                 if (starredTags.includes(id)) return null; 
                 return <TagChip key={tag} tag={tag} isActive={activeTags.includes(id)} isStarred={false} onToggle={() => onToggleTag(tag, true)} onStar={() => onToggleStarTag(tag, true)} isNsfw={true} />;
            })}
        </div>
      </div>
    </div>
  );
};

// [修复 & 升级] Tag Chip: 选中状态变色逻辑
const TagChip = ({ tag, isActive, isStarred, onToggle, onStar, isNsfw }) => {
    let containerClass = "group flex items-center rounded-full border text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer select-none ";
    let buttonClass = "pr-2 pl-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-yellow-500 ";
    const style = {};

    if (isActive) {
        if (isNsfw) {
            // [需求3] NSFW 选中：底色为主题色 (#ff5d8f / #ffc4d6)
            containerClass += "border-transparent nsfw-active-chip ";
            // 利用 CSS 变量注入颜色
            style['--nsfw-bg'] = 'var(--nsfw-primary)';
            style['--nsfw-text'] = 'var(--nsfw-active-text)';
        } else {
            // SFW 选中：黑底白字 (标准)
            containerClass += "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white ";
        }
    } else {
        // 未选中状态
        if (isNsfw) {
            containerClass += "border-red-200 dark:border-red-900 bg-white dark:bg-neutral-900 nsfw-text-color ";
            style['--nsfw-text-color'] = 'var(--nsfw-primary)';
        } else {
            containerClass += "border-gray-200 dark:border-neutral-800 text-gray-500 hover:border-gray-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900 ";
        }
    }

    if (isStarred) buttonClass += "opacity-100 text-yellow-500 ";

    return (
        <div 
            className={containerClass}
            style={style}
        >
            <style jsx>{`
                .nsfw-active-chip {
                    background-color: var(--nsfw-bg);
                    color: var(--nsfw-text);
                }
                .nsfw-text-color {
                    color: var(--nsfw-text-color);
                }
                .nsfw-text-color:hover {
                    border-color: var(--nsfw-text-color);
                }
            `}</style>

            <span onClick={onToggle} className="px-3 py-1.5">{tag}</span>
            <button 
                onClick={(e) => { e.stopPropagation(); onStar(); }}
                className={buttonClass}
            >
                <Star size={12} fill={isStarred ? "currentColor" : "none"} />
            </button>
        </div>
    );
};