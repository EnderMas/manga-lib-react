import React, { useRef } from 'react';
import { cn } from '../lib/utils';

export const MangaCard = ({ 
  manga, 
  isStarred = false, 
  isSelected = false,
  isDeleteMode = false,
  onClick,
  onToggleStar
}) => {
  const cardRef = useRef(null);

  // --- 原版倾斜逻辑复刻 ---
  const handleTilt = (e) => {
    // 假设 tiltIntensity 默认为 10，你可以从 props 传入
    const tiltIntensity = 10; 
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -tiltIntensity;
    const rotateY = ((x - centerX) / centerX) * tiltIntensity;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  };

  const resetTilt = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }
  };

  return (
    <div className="group flex flex-col gap-3 animate-fade-in relative select-none">
      {/* 卡片主体 */}
      <div 
        ref={cardRef}
        className={cn(
          "tilt-card relative aspect-[2/3] overflow-hidden rounded-sm bg-gray-200 dark:bg-neutral-900 shadow-sm group-hover:shadow-2xl cursor-pointer",
          isSelected && "card-selected",
          isStarred && "starred"
        )}
        onClick={() => onClick(manga.id)}
        onMouseMove={!isDeleteMode ? handleTilt : undefined}
        onMouseLeave={!isDeleteMode ? resetTilt : undefined}
      >
        {/* 图片 */}
        <img 
          src={manga.img} 
          alt={manga.title}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* 删除模式覆盖层 */}
        {isDeleteMode && (
          <div className={cn(
            "absolute inset-0 transition-all duration-200 z-20 flex items-center justify-center",
            isSelected ? "bg-black/40 opacity-100" : "bg-transparent opacity-0 group-hover:opacity-100"
          )}>
             <div className="bg-white dark:bg-black rounded-full p-2 shadow-lg">
                <span className={`material-symbols-rounded text-2xl ${isSelected ? 'text-red-600' : 'text-gray-400'}`}>
                    {isSelected ? 'check_circle' : 'circle'}
                </span>
             </div>
          </div>
        )}

        {/* 收藏按钮 (原版样式 .star-manga-btn) */}
        {!isDeleteMode && (
            <button 
                className="star-manga-btn" 
                onClick={(e) => { e.stopPropagation(); onToggleStar(manga.id); }}
            >
                <span className="material-symbols-rounded text-[18px]">
                    {isStarred ? 'star' : 'star_border'}
                </span>
            </button>
        )}

        {/* 悬浮渐变遮罩 */}
        {!isDeleteMode && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        )}
      </div>

      {/* 底部信息 (标题、作者、Tag) */}
      <div className="space-y-1">
        <h3 className="font-serif text-lg font-bold leading-tight text-gray-900 dark:text-white truncate" title={manga.title}>
            {manga.title}
        </h3>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 truncate">
            {manga.author}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
            {/* 增加 ?. 和 || [] 保护 */}
            {(manga.tags || []).slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-gray-200 dark:border-neutral-800 text-gray-400 dark:text-neutral-500">
                    {tag}
                </span>
            ))}
        </div>
      </div>
    </div>
  );
};