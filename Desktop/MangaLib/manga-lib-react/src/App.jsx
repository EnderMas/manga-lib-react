import React, { useState, useMemo, useEffect } from 'react';
import { useMangaData } from './hooks/useMangaData';
import { MangaCard } from './components/MangaCard';
import { ImportButton } from './components/ImportButton';
import { TopNav } from './components/TopNav';      // 新组件
import { TagFilter } from './components/TagFilter'; // 新组件
import { ControlBar } from './components/ControlBar'; // 新组件

function App() {
  const { mangaList, isLoading, reloadData } = useMangaData();
  
  // --- 状态管理 ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [starredIds, setStarredIds] = useState(new Set());
  
  // 视觉控制状态
  const [gridSize, setGridSize] = useState(240);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [nsfwMode, setNsfwMode] = useState(1); // 0:显示, 1:模糊, 2:隐藏
  const [filterLogic, setFilterLogic] = useState('AND');

  // --- 提取所有 Tag ---
  const allTags = useMemo(() => {
    const tags = new Set();
    mangaList.forEach(m => {
      // 增加 ?. 保护，防止旧数据没有 tags 字段导致崩溃
      if (Array.isArray(m.tags)) {
        m.tags.forEach(t => tags.add(t));
      }
    });
    return tags;
  }, [mangaList]);

  // --- 深色模式初始化 ---
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // --- 交互逻辑 ---
  const toggleStar = (id) => {
    setStarredIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleDeleteSelect = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredManga.length) {
        setSelectedIds(new Set());
    } else {
        const newSet = new Set();
        filteredManga.forEach(m => newSet.add(m.id));
        setSelectedIds(newSet);
    }
  };

  const cycleNSFW = () => {
      setNsfwMode(prev => (prev + 1) % 3);
  };

  // --- 核心筛选 ---
  const filteredManga = useMemo(() => {
    let result = mangaList.filter(manga => {
      // 1. NSFW 模式过滤
      if (nsfwMode === 2 && manga.isNSFW) return false;

      // 2. 搜索过滤
      const matchSearch = 
        manga.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (manga.author && manga.author.toLowerCase().includes(searchQuery.toLowerCase()));

      // 3. 标签过滤
      let matchTags = true;
      if (selectedTags.length > 0) {
          if (filterLogic === 'AND') {
              matchTags = selectedTags.every(tag => manga.tags && manga.tags.includes(tag));
          } else {
              matchTags = selectedTags.some(tag => manga.tags && manga.tags.includes(tag));
          }
      }

      return matchSearch && matchTags;
    });

    // 置顶排序
    return [...result].sort((a, b) => {
      const aStarred = starredIds.has(a.id) ? 1 : 0;
      const bStarred = starredIds.has(b.id) ? 1 : 0;
      return bStarred - aStarred;
    });
  }, [mangaList, searchQuery, selectedTags, starredIds, nsfwMode, filterLogic]);

  // --- Loading ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a] text-gray-500">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 dark:bg-neutral-800 rounded-full mb-4"></div>
          <p>加载资源库...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-300 flex flex-col">
      {/* 1. 顶部导航 (Sticky) */}
      <TopNav 
        recycleCount={0}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        isDarkMode={isDarkMode}
        onImportClick={() => document.getElementById('hidden-import-input').click()}
        onRandomClick={() => alert("随机功能开发中")}
      />
      
      {/* 隐藏的文件输入框，用于触发 ImportButton 的逻辑 */}
      <div className="hidden">
        <ImportButton onImportSuccess={reloadData} customId="hidden-import-input" />
      </div>

      <main className="flex-grow w-full max-w-[1800px] mx-auto px-4 sm:px-6 py-8">
        
        {/* 2. 标签过滤器 (View Header) */}
        <TagFilter 
            allTags={allTags}
            activeTags={selectedTags}
            onToggleTag={toggleTag}
            onClearTags={() => setSelectedTags([])}
            filterLogic={filterLogic}
            onToggleLogic={() => setFilterLogic(prev => prev === 'AND' ? 'OR' : 'AND')}
        />

        {/* 3. 控制栏 (Search & Toolbar) */}
        <ControlBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            gridSize={gridSize}
            setGridSize={setGridSize}
            isDeleteMode={isDeleteMode}
            toggleDeleteMode={() => setIsDeleteMode(!isDeleteMode)}
            nsfwMode={nsfwMode}
            cycleNSFW={cycleNSFW}
            selectedCount={selectedIds.size}
            onSelectAll={handleSelectAll}
            onDeleteSelected={() => alert("删除功能开发中")}
            onOpenSettings={() => alert("设置功能开发中")}
        />

        {/* 4. 网格展示区 */}
        {filteredManga.length > 0 ? (
          <div 
            className="grid gap-6 md:gap-8 animate-fade-in mt-6" 
            style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${gridSize}px, 1fr))` }}
          >
            {filteredManga.map((manga) => (
              <MangaCard 
                key={manga.id} 
                manga={manga}
                isStarred={starredIds.has(manga.id)}
                isSelected={selectedIds.has(manga.id)}
                isDeleteMode={isDeleteMode}
                onToggleStar={toggleStar}
                onClick={(id) => isDeleteMode ? toggleDeleteSelect(id) : console.log("Open:", id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 opacity-40">
            <span className="material-symbols-rounded text-6xl font-light mb-4 text-gray-300">radio_button_unchecked</span>
            <p className="font-serif text-2xl text-gray-400">暂无收藏</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;