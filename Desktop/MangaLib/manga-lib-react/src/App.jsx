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
import { GroupManagerModal } from './components/GroupManagerModal.jsx'; // [New]
import { removeImageFromDB } from './lib/db'; 
import { AnimatePresence, motion } from "motion/react";
import { cn } from './lib/utils'; // [修复] 必须引入 cn 才能解决黑屏
import { useOutsideClick } from "./hooks/use-outside-click"; // [新增]
import { X } from 'lucide-react'; // [新增] Close icon 

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

  // [New State] 展开卡片状态
  const [activeManga, setActiveManga] = useState(null);
  const expandRef = React.useRef(null);

  // 处理 ESC 关闭和 Body 滚动锁定
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") setActiveManga(null);
    }
    if (activeManga) {
      document.body.style.overflow = "hidden"; // 锁定滚动
    } else {
      document.body.style.overflow = "auto";
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeManga]);

  useOutsideClick(expandRef, () => setActiveManga(null));

  // [New State] 标签增强与分组
  const [starredTags, setStarredTags] = useState([]);
  const [tagGroups, setTagGroups] = useState([]);
  const [isGroupManagerOpen, setIsGroupManagerOpen] = useState(false); // [New]

  // 更新分组的辅助函数
  const updateTagGroups = (newGroups) => {
      setTagGroups(newGroups);
      localStorage.setItem('tagGroups', JSON.stringify(newGroups));
  };

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

// 切换标签收藏逻辑 (支持 s:前缀 和 n:前缀)
  const toggleStarTag = (tag, isNsfw) => {
    // 构造唯一ID: 如果是NSFW则加 n:，否则加 s:
    const tagId = (isNsfw ? 'n:' : 's:') + tag;
    
    setStarredTags(prev => {
      const newTags = prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId];
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

  const toggleTag = (tag, isNsfw) => {
    // 构造唯一ID
    const tagId = (isNsfw ? 'n:' : 's:') + tag;

    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
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

// --- 提取并分类所有 Tag ---
  const { sfwTags, nsfwTags } = useMemo(() => {
    const sfw = new Set();
    const nsfw = new Set();
    
    mangaList.forEach(m => {
      if (Array.isArray(m.tags)) {
        m.tags.forEach(t => {
          // 根据漫画本身的属性决定 Tag 的归属
          if (m.isNSFW) {
            nsfw.add(t);
          } else {
            sfw.add(t);
          }
        });
      }
    });

    return { 
        sfwTags: Array.from(sfw).sort(), 
        nsfwTags: Array.from(nsfw).sort() 
    };
  }, [mangaList]);
  const filteredManga = useMemo(() => {
    let result = mangaList.filter(manga => {
      if (nsfwMode === 2 && manga.isNSFW) return false;
      const matchSearch = manga.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (manga.author && manga.author.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // --- 标签过滤 (支持前缀身份隔离) ---
      let matchTags = true;
      if (selectedTags.length > 0) {
        const checkTagMatch = (tagId) => {
          const isNsfwTag = tagId.startsWith('n:');
          const rawTagName = tagId.substring(2);
          
          // 严格隔离：选中的是NSFW标签则只匹配NSFW漫画，反之亦然
          if (isNsfwTag !== manga.isNSFW) return false;
          return manga.tags && manga.tags.includes(rawTagName);
        };

        if (filterLogic === 'AND') {
          matchTags = selectedTags.every(checkTagMatch);
        } else {
          matchTags = selectedTags.some(checkTagMatch);
        }
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
              sfwTags={sfwTags}
              nsfwTags={nsfwTags}
              activeTags={selectedTags}
              onToggleTag={toggleTag}
              onClearTags={() => setSelectedTags([])}
              filterLogic={filterLogic}
              onToggleLogic={() => setFilterLogic(prev => prev === 'AND' ? 'OR' : 'AND')}
              starredTags={starredTags}
              onToggleStarTag={toggleStarTag}
              tagGroups={tagGroups}
              onManageGroups={() => setIsGroupManagerOpen(true)} // [New]
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
                nsfwMode={nsfwMode} // [New] 传递 NSFW 模式状态
                onToggleStar={toggleStar}
                onClick={(id) => {
                    if (isDeleteMode) {
                        toggleDeleteSelect(id);
                    } else {
                        // 找到完整的 manga 对象并激活展开视图
                        const item = mangaList.find(m => m.id === id);
                        setActiveManga(item);
                    }
                }}
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

      {/* --- 展开式卡片 Overlay --- */}
      <AnimatePresence>
        {activeManga && (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm h-full w-full"
            />
            
            {/* 展开的卡片容器 */}
            <motion.div
              layoutId={`card-${activeManga.id}`}
              ref={expandRef}
              // [修改] 尺寸放大：max-w-5xl, h-[80vh]
              className="w-full max-w-5xl h-[80vh] md:h-[600px] flex flex-col md:flex-row bg-white dark:bg-[#161616] rounded-3xl overflow-hidden shadow-2xl relative z-10 mx-4"
            >
              {/* [删除] 关闭按钮已移除 (点击外部或ESC关闭) */}

              {/* 左侧：图片区域 (包含查看大图交互) */}
              {/* [修改] 增加 group 类，用于控制 hover 提示 */}
              <div 
                className="w-full md:w-1/2 h-60 md:h-full relative bg-gray-100 dark:bg-[#0a0a0a] group cursor-zoom-in"
                onClick={() => openLightbox(activeManga.id)}
              >
                 <motion.div layoutId={`image-${activeManga.id}`} className="w-full h-full">
                    <img
                      src={activeManga.img}
                      alt={activeManga.title}
                      // [修改] 移除了 blur 相关的判断，详情页始终清晰
                      className="w-full h-full object-cover"
                    />
                    
                    {/* [新增] 查看大图遮罩 */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <span class="material-symbols-rounded text-sm">zoom_in</span>
                            点击查看大图
                        </div>
                    </div>

                    {/* 渐变遮罩 (仅移动端保留，用于提升文字可读性) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden pointer-events-none" />
                 </motion.div>
              </div>

              {/* 右侧：详情区域 */}
              <div className="flex-1 p-8 md:p-12 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-6">
                    {/* 标题 & 作者 */}
                    <div>
                        <motion.h3 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="font-serif text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight"
                        >
                            {activeManga.title}
                        </motion.h3>
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mt-3"
                        >
                            {activeManga.author}
                        </motion.p>
                    </div>

                    {/* Tags */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap gap-2 pt-2"
                    >
                        {activeManga.tags.map(tag => (
                            <span key={tag} className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border select-none",
                                activeManga.isNSFW 
                                    ? "border-nsfwLight dark:border-nsfwDark text-nsfwLight dark:text-nsfwDark bg-nsfwLight/10" 
                                    : "border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-neutral-800"
                            )}>
                                {tag}
                            </span>
                        ))}
                    </motion.div>
                </div>

                {/* 底部操作栏 */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex gap-3 pt-8 mt-auto border-t border-gray-100 dark:border-neutral-800"
                >
                    {/* [修改] 移除了查看大图按钮，只保留编辑按钮 (放到了右侧) */}
                    <div className="flex-1"></div> {/* 占位符，把编辑按钮挤到右边 */}
                    
                    <button 
                        onClick={() => openEditModal(activeManga.id)} 
                        className="flex items-center gap-2 px-6 py-3 border border-gray-200 dark:border-neutral-700 rounded-full hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300"
                        title="编辑详情"
                    >
                        <span className="material-symbols-rounded text-sm">edit</span>
                        <span>编辑</span>
                    </button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;