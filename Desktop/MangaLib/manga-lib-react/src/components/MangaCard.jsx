import React, { useState, useEffect } from 'react';
import { Star, Trash2, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { CometCard } from './ui/CometCard';
import { motion } from "motion/react";
import { HoloEffect } from './ui/HoloEffect';

export const MangaCard = ({ 
  manga, 
  isStarred, 
  isSelected, 
  isDeleteMode, 
  nsfwMode, 
  onToggleStar, 
  onClick,
  id 
}) => {
  const [isPeeking, setIsPeeking] = useState(false);

  useEffect(() => {
    let timer;
    if (isPeeking) {
        timer = setTimeout(() => setIsPeeking(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [isPeeking]);

  const handleClick = () => {
      if (isDeleteMode) {
          onClick(manga.id);
          return;
      }
      if (manga.isNSFW && nsfwMode === 1 && !isPeeking) {
          setIsPeeking(true);
      } else {
          onClick(manga.id);
      }
  };

  const shouldBlur = manga.isNSFW && nsfwMode === 1 && !isPeeking;

  return (
    <div className="h-full">
      {/* [修复] 在最外层添加 'group' 类，确保 hover 状态能传递给子元素 */}
      <CometCard className="aspect-[2/3] w-full h-full cursor-pointer group">
        <div 
          id={id}
          className={cn(
            "relative w-full h-full rounded-2xl overflow-hidden border transition-all duration-300",
            "bg-gray-200 dark:bg-neutral-900",
            isSelected 
              ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-black" 
              : "border-gray-200 dark:border-neutral-800"
          )}
          onClick={handleClick}
        >
          {/* 图片层 */}
          <motion.div layoutId={`image-${manga.id}`} className="w-full h-full relative">
            {manga.img ? (
              <img 
                src={manga.img} 
                alt={manga.title} 
                className={cn(
                  "w-full h-full object-cover transition-all duration-500",
                  shouldBlur ? "blur-xl scale-110" : "blur-0 scale-100"
                )}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-neutral-800 text-gray-400">
                <span className="text-xs">No Cover</span>
              </div>
            )}
            
{/* [新增] Holo 特效，仅当收藏时显示 */}
            <HoloEffect isStarred={isStarred} />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
          </motion.div>

          {/* 交互层 */}
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start z-20">
              {isDeleteMode && (
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors bg-white/10 backdrop-blur-sm",
                  isSelected ? "border-blue-500 bg-blue-500 text-white" : "border-white/70 text-transparent"
                )}>
                  <CheckCircle size={14} strokeWidth={3} />
                </div>
              )}

              {!isDeleteMode && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(manga.id);
                  }}
                  // [修复] 逻辑：
                  // 1. 已收藏 (isStarred): opacity-100 (常驻显示)
                  // 2. 未收藏: opacity-0 group-hover:opacity-100 (悬浮显示)
                  className={cn(
                    "ml-auto p-2 rounded-full backdrop-blur-md transition-all duration-300",
                    isStarred 
                      ? "bg-yellow-400/20 text-yellow-400 opacity-100 shadow-[0_0_10px_rgba(250,204,21,0.5)]" 
                      : "bg-black/30 text-white/50 hover:bg-black/50 hover:text-white opacity-0 group-hover:opacity-100"
                  )}
                >
                  <Star size={16} fill={isStarred ? "currentColor" : "none"} />
                </button>
              )}
            </div>

            <div className="z-20 text-white">
              <h3 className="font-bold text-sm line-clamp-2 leading-tight mb-1 text-shadow-sm">{manga.title}</h3>
              <p className="text-xs text-white/70 line-clamp-1">{manga.author}</p>
              {manga.tags && manga.tags.length > 0 && (
                 <div className="flex gap-1 mt-2 flex-wrap">
                   {manga.tags.slice(0, 2).map(tag => (
                     <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white/10 backdrop-blur-sm rounded-md border border-white/10">{tag}</span>
                   ))}
                 </div>
              )}
            </div>
          </div>

          {isDeleteMode && (
            <div className={cn("absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity flex items-center justify-center z-10", isSelected ? "opacity-100" : "opacity-0 hover:opacity-100")}>
              <Trash2 className="text-white/80" size={32} />
            </div>
          )}
        </div>
      </CometCard>
    </div>
  );
};