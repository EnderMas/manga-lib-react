// src/hooks/useMangaData.js
import { useState, useEffect } from 'react';
import { getImageFromDB } from '../lib/db';

export function useMangaData() {
  const [mangaList, setMangaList] = useState([]);
  const [recycleBin, setRecycleBin] = useState([]); // 新增回收站状态
  const [isLoading, setIsLoading] = useState(true);

  // 辅助：加载列表图片
  const hydrateList = async (list) => {
    return await Promise.all(
      list.map(async (item) => {
        const blob = await getImageFromDB(item.id);
        const imgUrl = blob ? URL.createObjectURL(blob) : '';
        return { ...item, img: imgUrl };
      })
    );
  };

  // 加载数据的核心逻辑
  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. 读取 LocalStorage
      const storedList = JSON.parse(localStorage.getItem('mangaList') || '[]');
      const storedRecycle = JSON.parse(localStorage.getItem('recycleBin') || '[]');

      // 2. 并行加载图片
      const [fullList, fullRecycle] = await Promise.all([
        hydrateList(storedList),
        hydrateList(storedRecycle)
      ]);

      // 3. 更新状态
      setMangaList(fullList);
      setRecycleBin(fullRecycle);
    } catch (error) {
      console.error("Failed to load data:", error);
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

  return { 
    mangaList, 
    setMangaList, // 暴露 setter 以便 App.jsx 修改
    recycleBin, 
    setRecycleBin, // 暴露 setter
    isLoading, 
    reloadData: loadData 
  };
}