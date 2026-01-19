import React, { useState } from 'react';
import { Trash2, RotateCcw, X, AlertTriangle, Maximize2 } from 'lucide-react';

export const RecycleBinModal = ({ 
  isOpen, 
  onClose, 
  items, 
  onRestore, 
  onRestoreAll,
  onDeletePermanently, 
  onEmptyBin 
}) => {
  const [itemSize, setItemSize] = useState(200);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-md" onClick={onClose}></div>
      
      {/* 弹窗主体: 宽度扩展为 w-[95vw] */}
      <div className="relative w-[95vw] h-[90vh] bg-white dark:bg-[#111] md:rounded-xl shadow-2xl flex flex-col border border-gray-200 dark:border-neutral-800 animate-fade-in mx-auto mt-4">
        
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-[#111] md:rounded-t-xl">
          <div className="flex items-center gap-4">
            <h3 className="font-serif text-xl dark:text-white flex items-center gap-2">
                <Trash2 size={20} /> 回收站 ({items.length})
            </h3>
            {/* 封面大小滑块 */}
            <div className="hidden md:flex items-center gap-2 px-4 py-1 bg-gray-100 dark:bg-neutral-900 rounded-full">
                <Maximize2 size={14} className="text-gray-400" />
                <input 
                    type="range" min="100" max="400" 
                    value={itemSize} onChange={(e) => setItemSize(Number(e.target.value))}
                    className="w-32 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700 accent-black dark:accent-white"
                />
            </div>
          </div>
          <button className="text-sm font-bold text-gray-400 hover:text-black dark:hover:text-white" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* 列表区域 */}
        <div className="flex-grow overflow-y-auto p-6 bg-[#fafafa] dark:bg-[#0a0a0a]">
          {items.length > 0 ? (
            <div 
                className="grid gap-4" 
                style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${itemSize}px, 1fr))` }}
            >
              {items.map((item, index) => (
                <div key={item.id} className="relative group aspect-[2/3] bg-gray-200 dark:bg-neutral-900 rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-sm">
                  {/* 使用缩略图占位 */}
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                  
                  {/* 悬浮操作层 */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                    <p className="text-white text-xs font-bold text-center line-clamp-2 mb-2">{item.title}</p>
                    <button 
                      onClick={() => onRestore(index)} 
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-full text-xs font-bold w-full transition-colors flex items-center justify-center gap-1 shadow-lg"
                    >
                      <RotateCcw size={14} /> 恢复
                    </button>
                    <button 
                      onClick={() => onDeletePermanently(index)} 
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-full text-xs font-bold w-full transition-colors flex items-center justify-center gap-1 shadow-lg"
                    >
                      <Trash2 size={14} /> 彻底删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Trash2 size={64} className="mb-4 opacity-20" />
              <p className="text-lg">回收站为空</p>
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-[#161616] flex justify-between items-center md:rounded-b-xl">
          <p className="text-xs text-gray-400">关闭网页不会清空回收站。</p>
          <div className="flex gap-3">
             {items.length > 0 && (
                <button 
                  onClick={onRestoreAll}
                  className="text-green-600 hover:text-green-700 text-xs font-bold uppercase border border-green-500/20 px-4 py-2 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={16} /> 全部还原
                </button>
             )}
            <button 
              onClick={onEmptyBin}
              className="text-red-500 hover:text-red-600 text-xs font-bold uppercase border border-red-500/20 px-4 py-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
            >
              <AlertTriangle size={16} /> 清空回收站
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};