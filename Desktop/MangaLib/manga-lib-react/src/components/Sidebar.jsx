import React, { useMemo } from 'react';
import { Hash, Tag } from 'lucide-react';
import { cn } from '../lib/utils';

export const Sidebar = ({ 
  mangaList, 
  selectedTags, 
  toggleTag 
}) => {
  // 自动从 mangaList 中提取并统计所有 Tag
  const tagStats = useMemo(() => {
    const stats = {};
    mangaList.forEach(manga => {
      if (manga.tags && Array.isArray(manga.tags)) {
        manga.tags.forEach(tag => {
          stats[tag] = (stats[tag] || 0) + 1;
        });
      }
    });
    // 转为数组并按数量排序
    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1]) // 数量降序
      .map(([name, count]) => ({ name, count }));
  }, [mangaList]);

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block h-[calc(100vh-65px)] sticky top-[65px] overflow-y-auto p-6 border-r border-gray-200 dark:border-neutral-800">
      <div className="mb-6">
        <h3 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4">
          <Tag size={18} />
          <span>热门标签</span>
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {tagStats.map(({ name, count }) => {
            const isSelected = selectedTags.includes(name);
            return (
              <button
                key={name}
                onClick={() => toggleTag(name)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-md transition-all border flex items-center gap-1.5",
                  isSelected 
                    ? "bg-yellow-500 border-yellow-500 text-white shadow-md shadow-yellow-500/20" 
                    : "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-400 hover:border-yellow-500/50 hover:text-yellow-600 dark:hover:text-yellow-400"
                )}
              >
                <span>{name}</span>
                <span className={cn("opacity-40 text-[10px]", isSelected && "text-white")}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* 这里预留位置给后续的 "分组筛选" 或 "回收站" */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-neutral-900 rounded-xl border border-dashed border-gray-200 dark:border-neutral-800 text-center">
        <span className="text-xs text-gray-400">更多筛选即将推出...</span>
      </div>
    </aside>
  );
};