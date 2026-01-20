import React, { useState } from 'react';
import { X, Save, Plus, Trash2, FileJson, Edit3 } from 'lucide-react';

export const GroupManagerModal = ({ isOpen, onClose, groups, onUpdateGroups }) => {
  if (!isOpen) return null;

  // 简单的 JSON 导入逻辑
  const handleImportJS = () => {
    // 模拟触发原来的逻辑，或者提示用户
    if (window.TAG_GROUPS_JS && window.TAG_GROUPS_JS.length > 0) {
        if(confirm(`检测到预加载的 JS 分组数据 (${window.TAG_GROUPS_JS.length} 个)。是否覆盖当前分组？`)) {
            onUpdateGroups(window.TAG_GROUPS_JS);
            alert("导入成功！");
        }
    } else {
        alert("未检测到 window.TAG_GROUPS_JS 数据。请确保已在 index.html 引入 manga_tag_group.js");
    }
  };

  const handleClear = () => {
      if(confirm("确定清空所有分组吗？")) onUpdateGroups([]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-[#111] w-full max-w-md p-6 rounded-xl shadow-2xl relative animate-fade-in border border-gray-200 dark:border-neutral-800">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white"><X size={20}/></button>
        
        <h3 className="text-xl font-serif mb-6 dark:text-white flex items-center gap-2">
            <Edit3 size={20}/> 分组管理
        </h3>

        <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800">
                <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">当前状态</h4>
                <p className="text-sm dark:text-gray-300">已存在 {groups.length} 个分组。</p>
            </div>

            <button onClick={handleImportJS} className="w-full py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                <FileJson size={18}/> 从 JS 文件导入 (覆盖)
            </button>
            
            <button onClick={() => alert("手动创建分组功能将在下一版本实装 (UI开发中)")} className="w-full py-3 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <Plus size={18}/> 新建/编辑分组
            </button>

            <button onClick={handleClear} className="w-full py-3 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Trash2 size={18}/> 清空所有分组
            </button>
        </div>
      </div>
    </div>
  );
};