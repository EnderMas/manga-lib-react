// src/hooks/useMangaData.js
import { useState, useEffect } from 'react';
import { getImageFromDB } from '../lib/db';

export function useMangaData() {
  const [mangaList, setMangaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载数据的核心逻辑
  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. 从 LocalStorage 获取元数据 (标题, 作者, Tags...)
      const storedList = JSON.parse(localStorage.getItem('mangaList') || '[]');
      
      if (storedList.length === 0) {
        setMangaList([]);
        setIsLoading(false);
        return;
      }

      // 2. 遍历列表，去 IndexedDB 找对应的图片
      const fullList = await Promise.all(
        storedList.map(async (item) => {
          // 尝试获取图片 Blob
          const blob = await getImageFromDB(item.id);
          
          // 如果找到了图片，创建一个临时的 URL (blob:http://...)
          // 如果没找到，就给一个空字符串或者占位符
          const imgUrl = blob ? URL.createObjectURL(blob) : '';
          
          return {
            ...item,
            img: imgUrl, // 替换原本可能为空的 img 字段
          };
        })
      );

      // 3. 更新状态
      setMangaList(fullList);
    } catch (error) {
      console.error("Failed to load manga data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 组件挂载时自动加载一次
  useEffect(() => {
    loadData();
    
    // 清理函数：释放创建的 ObjectURL，防止内存泄漏
    return () => {
      mangaList.forEach(item => {
        if (item.img) URL.revokeObjectURL(item.img);
      });
    };
  }, []); // 空数组表示只在初始化时执行一次

  return { mangaList, isLoading, reloadData: loadData };
}