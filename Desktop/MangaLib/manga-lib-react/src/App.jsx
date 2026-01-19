import React, { useState, useMemo, useEffect } from 'react';
import { useMangaData } from './hooks/useMangaData';
import { MangaCard } from './components/MangaCard';
import { TopNav } from './components/TopNav'; 
import { TagFilter } from './components/TagFilter'; 
import { ControlBar } from './components/ControlBar'; 
import { RecycleBinModal } from './components/RecycleBinModal.jsx'; 
import { ScraperView } from './components/ScraperView.jsx'; 
import { ImageImporter } from './components/ImageImporter.jsx';
import { ImportEditorModal } from './components/ImportEditorModal.jsx'; 
import { removeImageFromDB } from './lib/db'; 

function App() {
  const { mangaList, setMangaList, recycleBin, setRecycleBin, isLoading, reloadData } = useMangaData();
  
  // --- 状态管理 ---
  const [currentView, setCurrentView] = useState('gallery'); 
  const [isRecycleOpen, setIsRecycleOpen] = useState(false);
  const [importCandidates, setImportCandidates] = useState([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [starredIds, setStarredIds] = useState(new Set());

  const [gridSize, setGridSize] = useState(240);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [nsfwMode, setNsfwMode] = useState(1); 
  const [filterLogic, setFilterLogic] = useState('AND');

  // [New State] 标签增强与分组
  const [starredTags, setStarredTags] = useState([]);
  const [tagGroups, setTagGroups] = useState([]);

  // --- 初始化加载 ---
  useEffect(() => {
    const savedGroups = JSON.parse(localStorage.getItem('tagGroups') || '[]');
    setTagGroups(savedGroups);
    const savedStarredTags = JSON.parse(localStorage.getItem('starredTags') || '[]');
    setStarredTags(savedStarredTags);
  }, []);

  // --- 持久化保存 ---
  useEffect(() => {
    if (!isLoading) {
      const metaList = mangaList.map(({img, ...rest}) => rest);
      const metaRecycle = recycleBin.map(({img, ...rest}) => rest);
      localStorage.setItem('mangaList', JSON.stringify(metaList));
      localStorage.setItem('recycleBin', JSON.stringify(metaRecycle));
    }
  }, [mangaList, recycleBin, isLoading]);

  // --- 交互逻辑 ---

  // 切换标签收藏 (已修复重复定义)
  const toggleStarTag = (tag) => {
    setStarredTags(prev => {
      const newTags = prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag];
      localStorage.setItem('starredTags', JSON.stringify(newTags));
      return newTags;
    });
  };

  const handleImageImport = (newItems) => {
    setImportCandidates(newItems);
    setIsImportModalOpen(true);
  };

  const confirmImport = (finalItems) => {
    setMangaList(prev => [...finalItems, ...prev]);
    const metaList = [...finalItems, ...mangaList].map(({img, ...rest}) => rest);
    localStorage.setItem('mangaList', JSON.stringify(metaList));
    console.log(`成功导入 ${finalItems.length} 张图片`);
  };

  const deleteSelectedItems = () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 个项目吗？\n它们将被移动到回收站。`)) return;

    const newMangaList = [];
    const movedToRecycle = [];
    mangaList.forEach(manga => {
      if (selectedIds.has(manga.id)) movedToRecycle.push(manga);
      else newMangaList.push(manga);
    });

    setMangaList(newMangaList);
    setRecycleBin(prev => [...prev, ...movedToRecycle]);
    setSelectedIds(new Set());
    setIsDeleteMode(false);
  };
  
  const handleRandom = () => {
    if (filteredManga.length === 0) {
      alert("当前列表为空，无法随机");
      return;
    }
    const randomIndex = Math.floor(Math.random() * filteredManga.length);
    const randomItem = filteredManga[randomIndex];
    const card = document.getElementById(`manga-card-${randomItem.id}`);
    
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.transition = "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
      card.style.transform = "scale(1.15)";
      card.style.zIndex = "10";
      card.style.boxShadow = "0 0 0 4px #eab308";
      
      setTimeout(() => {
        card.style.transform = "";
        card.style.zIndex = "";
        card.style.boxShadow = "";
      }, 1000);
    }
  };

  const restoreFromRecycle = (index) => {
    const item = recycleBin[index];
    const newRecycle = [...recycleBin];
    newRecycle.splice(index, 1);
    setRecycleBin(newRecycle);
    setMangaList([item, ...mangaList]);
  };

  const restoreAllFromRecycle = () => {
    if (recycleBin.length === 0) return;
    if (!confirm(`确定还原回收站中的 ${recycleBin.length} 个项目吗？`)) return;
    setMangaList(prev => [...recycleBin, ...prev]);
    setRecycleBin([]);
  };

  const deletePermanently = async (index) => {
    if (!confirm("彻底删除后无法恢复，确定吗？")) return;
    const item = recycleBin[index];
    const newRecycle = [...recycleBin];
    newRecycle.splice(index, 1);
    await removeImageFromDB(item.id);
    setRecycleBin(newRecycle);
  };

  const emptyRecycleBin = async () => {
    if (!confirm("确定清空回收站？")) return;
    for (const item of recycleBin) {
      await removeImageFromDB(item.id);
    }
    setRecycleBin([]);
  };

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
    if (selectedIds.size === filteredManga.length) setSelectedIds(new Set());
    else {
      const newSet = new Set();
      filteredManga.forEach(m => newSet.add(m.id));
      setSelectedIds(newSet);
    }
  };

  const cycleNSFW = () => setNsfwMode(prev => (prev + 1) % 3);

  const allTags = useMemo(() => {
    const tags = new Set();
    mangaList.forEach(m => {
      if (Array.isArray(m.tags)) m.tags.forEach(t => tags.add(t));
    });
    return tags;
  }, [mangaList]);

  const filteredManga = useMemo(() => {
    let result = mangaList.filter(manga => {
      if (nsfwMode === 2 && manga.isNSFW) return false;
      const matchSearch = manga.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (manga.author && manga.author.toLowerCase().includes(searchQuery.toLowerCase()));
      let matchTags = true;
      if (selectedTags.length > 0) {
        if (filterLogic === 'AND') matchTags = selectedTags.every(tag => manga.tags && manga.tags.includes(tag));
        else matchTags = selectedTags.some(tag => manga.tags && manga.tags.includes(tag));
      }
      return matchSearch && matchTags;
    });
    return [...result].sort((a, b) => {
      const aStarred = starredIds.has(a.id) ? 1 : 0;
      const bStarred = starredIds.has(b.id) ? 1 : 0;
      return bStarred - aStarred;
    });
  }, [mangaList, searchQuery, selectedTags, starredIds, nsfwMode, filterLogic]);

  // --- 渲染逻辑 ---
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) setIsDarkMode(true);
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

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
      <TopNav 
        recycleCount={recycleBin.length}
        onOpenRecycle={() => setIsRecycleOpen(true)}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        isDarkMode={isDarkMode}
        onImportClick={() => document.getElementById('image-importer-input').click()}
        onRandomClick={handleRandom}
        currentView={currentView}
        onChangeView={setCurrentView}
      />

      <main className="flex-grow w-full max-w-[1800px] mx-auto px-4 sm:px-6 py-8">
        {currentView === 'scraper' ? (
          <ScraperView />
        ) : (
          <>
            <TagFilter 
              allTags={allTags}
              activeTags={selectedTags}
              onToggleTag={toggleTag}
              onClearTags={() => setSelectedTags([])}
              filterLogic={filterLogic}
              onToggleLogic={() => setFilterLogic(prev => prev === 'AND' ? 'OR' : 'AND')}
              starredTags={starredTags}
              onToggleStarTag={toggleStarTag}
              tagGroups={tagGroups}
            />

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
              onDeleteSelected={deleteSelectedItems} 
              onOpenSettings={() => alert("高级设置开发中...")}
            /> 

            {filteredManga.length > 0 ? (
              <div className="grid gap-6 md:gap-8 animate-fade-in mt-6" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${gridSize}px, 1fr))` }}>
                {filteredManga.map((manga) => (
                  <MangaCard 
                    key={manga.id} 
                    id={`manga-card-${manga.id}`}
                    manga={manga}
                    isStarred={starredIds.has(manga.id)}
                    isSelected={selectedIds.has(manga.id)}
                    isDeleteMode={isDeleteMode}
                    onToggleStar={toggleStar}
                    onClick={(id) => isDeleteMode ? toggleDeleteSelect(id) : console.log("Open Edit for:", id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 opacity-40">
                <span className="material-symbols-rounded text-6xl font-light mb-4 text-gray-300">radio_button_unchecked</span>
                <p className="font-serif text-2xl text-gray-400">暂无收藏</p>
              </div>
            )}
          </>
        )}
      </main>

      <ImageImporter 
        customId="image-importer-input" 
        onImportComplete={handleImageImport} 
      />

      <ImportEditorModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        items={importCandidates}
        onSave={confirmImport}
      />

      <RecycleBinModal 
        isOpen={isRecycleOpen}
        onClose={() => setIsRecycleOpen(false)}
        items={recycleBin}
        onRestore={restoreFromRecycle}
        onRestoreAll={restoreAllFromRecycle}
        onDeletePermanently={deletePermanently}
        onEmptyBin={emptyRecycleBin}
      />
    </div>
  );
}

export default App;