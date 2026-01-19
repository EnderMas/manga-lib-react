// src/components/ImportButton.jsx
import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { saveImageToDB } from '../lib/db';

export const ImportButton = ({ onImportSuccess, customId }) => {
  const fileInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');

  // 辅助函数：将 Base64 字符串转回 Blob
  const base64ToBlob = async (base64) => {
    const res = await fetch(base64);
    return await res.blob();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusText('正在读取文件...');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const htmlContent = event.target.result;
        
        // 1. 正则提取 JSON 数据
        const match = htmlContent.match(/<script id="initial-state" type="application\/json">(.*?)<\/script>/);
        
        if (!match || !match[1]) {
          throw new Error("未在文件中找到备份数据 (initial-state)");
        }

        setStatusText('正在解析数据...');
        const backupData = JSON.parse(match[1]);
        
        // 2. 恢复数据到 LocalStorage 和 IndexedDB
        const { mangaList, recycleBin, allTags, starredTags, starredGroups, starredManga, appSettings } = backupData;

        let count = 0;
        const total = (mangaList?.length || 0) + (recycleBin?.length || 0);

        if (mangaList && Array.isArray(mangaList)) {
          for (let m of mangaList) {
            count++;
            setStatusText(`正在恢复图片 (${count}/${total})...`);
            if (m.img && m.img.startsWith('data:')) {
              const blob = await base64ToBlob(m.img);
              await saveImageToDB(m.id, blob);
              delete m.img; 
            }
          }
          localStorage.setItem('mangaList', JSON.stringify(mangaList));
        }

        if (recycleBin && Array.isArray(recycleBin)) {
          for (let m of recycleBin) {
            count++;
            setStatusText(`正在恢复回收站 (${count}/${total})...`);
            if (m.img && m.img.startsWith('data:')) {
              const blob = await base64ToBlob(m.img);
              await saveImageToDB(m.id, blob);
              delete m.img;
            }
          }
          localStorage.setItem('recycleBin', JSON.stringify(recycleBin));
        }

        setStatusText('正在恢复配置...');
        if (allTags) localStorage.setItem('allTags', JSON.stringify(allTags));
        if (starredTags) localStorage.setItem('starredTags', JSON.stringify(starredTags));
        if (starredGroups) localStorage.setItem('starredGroups', JSON.stringify(starredGroups));
        if (starredManga) localStorage.setItem('starredManga', JSON.stringify(starredManga));
        if (appSettings) localStorage.setItem('appSettings', JSON.stringify(appSettings));

        setStatusText('导入成功！');
        setTimeout(() => {
            setIsProcessing(false);
            setStatusText('');
            if (onImportSuccess) onImportSuccess(); 
        }, 1000);

      } catch (error) {
        console.error(error);
        alert("导入失败: " + error.message);
        setIsProcessing(false);
      }
      
      if(fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  };

  return (
    <>
      <button
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        disabled={isProcessing}
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all
          ${isProcessing 
            ? 'bg-gray-200 text-gray-500 cursor-wait dark:bg-neutral-800' 
            : 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-md hover:scale-105'
          }`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            <span>{statusText}</span>
          </>
        ) : (
          <>
            <Upload size={16} />
            <span>导入备份 (Backup.html)</span>
          </>
        )}
      </button>
      <input
        id={customId}
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".html"
        className="hidden"
      />
    </>
  );
};