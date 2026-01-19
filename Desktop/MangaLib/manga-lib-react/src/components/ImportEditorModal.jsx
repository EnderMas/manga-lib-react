import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, ZoomIn, Star } from 'lucide-react';
import { cn } from '../lib/utils';

export const ImportEditorModal = ({ isOpen, onClose, items, onSave }) => {
  if (!isOpen || items.length === 0) return null;

  // 本地状态：允许用户修改 items 里的数据
  const [editingItems, setEditingItems] = useState([]);

  // 当外部 items 传入时，深拷贝一份到本地状态
  useEffect(() => {
    if (isOpen && items.length > 0) {
      setEditingItems(JSON.parse(JSON.stringify(items)));
    }
  }, [isOpen, items]);

  const updateItem = (index, field, value) => {
    const newItems = [...editingItems];
    newItems[index][field] = value;
    setEditingItems(newItems);
  };

  const removeTag = (itemIndex, tagToRemove) => {
    const newItems = [...editingItems];
    newItems[itemIndex].tags = newItems[itemIndex].tags.filter(t => t !== tagToRemove);
    setEditingItems(newItems);
  };

  const addTag = (itemIndex, e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const newItems = [...editingItems];
      const tag = e.target.value.trim();
      if (!newItems[itemIndex].tags.includes(tag)) {
        newItems[itemIndex].tags.push(tag);
      }
      setEditingItems(newItems);
      e.target.value = '';
    }
  };

  const removeItem = (index) => {
    const newItems = [...editingItems];
    newItems.splice(index, 1);
    setEditingItems(newItems);
    if (newItems.length === 0) onClose();
  };

  const toggleAllNSFW = () => {
    const allNSFW = editingItems.every(i => i.isNSFW);
    const newItems = editingItems.map(i => ({ ...i, isNSFW: !allNSFW }));
    setEditingItems(newItems);
  };

  const handleSave = () => {
    onSave(editingItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <div className="absolute inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="absolute inset-0 md:inset-10 bg-white dark:bg-[#111] md:rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-neutral-800 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-[#111] z-10">
            <h3 className="font-serif text-2xl dark:text-white">导入预览 ({editingItems.length})</h3>
            <div className="flex gap-4 items-center">
                <button 
                    onClick={toggleAllNSFW}
                    className="text-red-500 hover:text-red-600 font-bold text-xs uppercase tracking-widest px-3 py-2 border border-red-500/20 rounded hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                    全设为 NSFW
                </button>
                <div className="h-6 w-px bg-gray-200 dark:bg-neutral-800"></div>
                <button onClick={onClose} className="text-sm font-bold text-gray-400 hover:text-black dark:hover:text-white transition-colors">取消</button>
                <button onClick={handleSave} className="bg-black dark:bg-white text-white dark:text-black px-8 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2">
                    <Check size={16}/> 保存全部
                </button>
            </div>
        </div>

        {/* List Content */}
        <div className="flex-grow overflow-y-auto p-8 bg-[#fafafa] dark:bg-[#0a0a0a] space-y-6">
            {editingItems.map((item, index) => (
                <div key={item.tempId || index} className="flex flex-col lg:flex-row gap-8 bg-white dark:bg-[#161616] p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
                    {/* Cover Preview */}
                    <div className="w-full lg:w-48 aspect-[2/3] rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden relative group">
                        <img src={item.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="cover"/>
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                             <ZoomIn className="text-white mb-2" size={24}/>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="flex-grow space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mr-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">标题</label>
                                    <input 
                                        type="text" value={item.title} 
                                        onChange={(e) => updateItem(index, 'title', e.target.value)}
                                        className="w-full bg-transparent border-b border-gray-300 dark:border-neutral-700 py-2 text-lg font-serif focus:border-black dark:focus:border-white outline-none dark:text-white transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">作者</label>
                                    <input 
                                        type="text" value={item.author} 
                                        onChange={(e) => updateItem(index, 'author', e.target.value)}
                                        className="w-full bg-transparent border-b border-gray-300 dark:border-neutral-700 py-2 text-lg font-serif focus:border-black dark:focus:border-white outline-none dark:text-white transition-colors"
                                    />
                                </div>
                            </div>
                            <button onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full">
                                <Trash2 size={20}/>
                            </button>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer w-fit">
                            <input 
                                type="checkbox" 
                                checked={item.isNSFW || false} 
                                onChange={(e) => updateItem(index, 'isNSFW', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                            />
                            <span className="text-sm font-bold text-red-500">NSFW 内容 (敏感)</span>
                        </label>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">标签</label>
                            <div className="flex flex-wrap gap-2 items-center min-h-[40px] p-2 bg-gray-50 dark:bg-neutral-900 rounded-lg border border-transparent focus-within:border-gray-300 dark:focus-within:border-neutral-700">
                                {item.tags.map(tag => (
                                    <div key={tag} className={cn(
                                        "flex items-center gap-1 px-2 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider",
                                        item.isNSFW 
                                            ? "border-red-200 dark:border-red-900/30 text-red-500 bg-red-50 dark:bg-red-900/10" 
                                            : "border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-neutral-800"
                                    )}>
                                        <span>{tag}</span>
                                        <button onClick={() => removeTag(index, tag)} className="hover:text-red-500"><X size={12}/></button>
                                    </div>
                                ))}
                                <input 
                                    type="text" 
                                    placeholder="+ 回车添加" 
                                    className="bg-transparent text-sm min-w-[80px] flex-grow outline-none dark:text-white placeholder-gray-400"
                                    onKeyDown={(e) => addTag(index, e)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};