import React from 'react';
import { X, Sliders } from 'lucide-react';

export const VisualSettingsModal = ({ isOpen, onClose, config, setConfig }) => {
  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={onClose}></div>
      
      <div className="bg-white dark:bg-neutral-900 w-96 max-h-[80vh] overflow-y-auto rounded-xl shadow-2xl pointer-events-auto border border-gray-200 dark:border-neutral-800 flex flex-col animate-fade-in">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center">
            <h3 className="font-bold text-sm flex items-center gap-2 dark:text-white"><Sliders size={16}/> 随机按钮视觉调试</h3>
            <button onClick={onClose}><X size={16} className="dark:text-white"/></button>
        </div>
        
        <div className="p-4 space-y-6">
            {/* 1. 毛玻璃强度 */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">毛玻璃强度 (Blur): {config.blur}px</label>
                <input type="range" min="0" max="40" value={config.blur} onChange={(e) => handleChange('blur', e.target.value)} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
            </div>

            {/* 2. Blob 大小 */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">光斑大小: {config.size}%</label>
                <input type="range" min="50" max="300" value={config.size} onChange={(e) => handleChange('size', e.target.value)} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
            </div>

            {/* 3. 移动速度 */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">动画时长 (越小越快): {config.speed}s</label>
                <input type="range" min="0.5" max="20" step="0.5" value={config.speed} onChange={(e) => handleChange('speed', e.target.value)} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
            </div>

            {/* 4. 间距 (Spread) */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">移动幅度 (Spread): {config.spread}px</label>
                <input type="range" min="0" max="100" value={config.spread} onChange={(e) => handleChange('spread', e.target.value)} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
            </div>

             {/* 5. 混合模式 */}
             <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">混合模式 (Blend)</label>
                <select value={config.blend} onChange={(e) => handleChange('blend', e.target.value)} className="w-full bg-gray-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs dark:text-white">
                    <option value="normal">Normal</option>
                    <option value="overlay">Overlay</option>
                    <option value="screen">Screen</option>
                    <option value="multiply">Multiply</option>
                    <option value="hard-light">Hard Light</option>
                </select>
            </div>

            {/* 6. 颜色配置 */}
            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <label className="text-xs font-bold text-gray-400 uppercase">浅色模式配色</label>
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex gap-1"><input type="color" value={config.lightC1a} onChange={(e) => handleChange('lightC1a', e.target.value)} className="h-6 w-8"/><input type="color" value={config.lightC1b} onChange={(e) => handleChange('lightC1b', e.target.value)} className="h-6 w-8"/></div>
                    <div className="flex gap-1"><input type="color" value={config.lightC2a} onChange={(e) => handleChange('lightC2a', e.target.value)} className="h-6 w-8"/><input type="color" value={config.lightC2b} onChange={(e) => handleChange('lightC2b', e.target.value)} className="h-6 w-8"/></div>
                    <div className="flex gap-1"><input type="color" value={config.lightC3a} onChange={(e) => handleChange('lightC3a', e.target.value)} className="h-6 w-8"/><input type="color" value={config.lightC3b} onChange={(e) => handleChange('lightC3b', e.target.value)} className="h-6 w-8"/></div>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase">深色模式配色</label>
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex gap-1"><input type="color" value={config.darkC1a} onChange={(e) => handleChange('darkC1a', e.target.value)} className="h-6 w-8"/><input type="color" value={config.darkC1b} onChange={(e) => handleChange('darkC1b', e.target.value)} className="h-6 w-8"/></div>
                    <div className="flex gap-1"><input type="color" value={config.darkC2a} onChange={(e) => handleChange('darkC2a', e.target.value)} className="h-6 w-8"/><input type="color" value={config.darkC2b} onChange={(e) => handleChange('darkC2b', e.target.value)} className="h-6 w-8"/></div>
                    <div className="flex gap-1"><input type="color" value={config.darkC3a} onChange={(e) => handleChange('darkC3a', e.target.value)} className="h-6 w-8"/><input type="color" value={config.darkC3b} onChange={(e) => handleChange('darkC3b', e.target.value)} className="h-6 w-8"/></div>
                </div>
            </div>
            
            {/* Blob 开关 */}
            <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Blob 开关</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={config.showBlob1} onChange={(e) => handleChange('showBlob1', e.target.checked)}/> Blob 1</label>
                    <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={config.showBlob2} onChange={(e) => handleChange('showBlob2', e.target.checked)}/> Blob 2</label>
                    <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={config.showBlob3} onChange={(e) => handleChange('showBlob3', e.target.checked)}/> Blob 3</label>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};