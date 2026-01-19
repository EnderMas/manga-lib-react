// src/components/ImageImporter.jsx
import React, { useRef } from 'react';
import { saveImageToDB } from '../lib/db';

export const ImageImporter = ({ onImportComplete, customId }) => {
  const fileInputRef = useRef(null);

  const handleFiles = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems = [];
    const newTags = new Set();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fullName = file.name.replace(/\.[^/.]+$/, ""); // 去后缀
      const parts = fullName.split('_'); // 分割 Title_Author_Tags

      const title = parts[0] ? parts[0].trim() : "未命名";
      const author = parts.length > 1 ? parts[1].trim() : "未知";
      let tags = [];
      let isNSFW = false;

      // Tag 解析
      if (parts.length > 2) {
        const tagSection = parts[2].trim();
        // 假设标签用 - 分割
        tags = tagSection.split('-').map(t => t.trim()).filter(t => t);
      }

      // NSFW 检测 (文件名包含 R18 或 NSFW)
      if (fullName.toUpperCase().includes("NSFW") || fullName.toUpperCase().includes("R18")) {
        isNSFW = true;
        // [修改] 如果检测到是 NSFW，强制添加 'NSFW' 标签（如果还没加的话）
        if (!tags.includes('NSFW')) {
            tags.push('NSFW');
        }
      }

      const id = Date.now() + Math.random(); // 生成唯一 ID
      
      // 1. 保存图片 Blob 到 IndexedDB
      await saveImageToDB(id, file);

      // 2. 创建元数据对象
      const newItem = {
        id,
        title,
        author,
        tags,
        isNSFW,
        img: URL.createObjectURL(file) // 创建预览图
      };

      newItems.push(newItem);
      tags.forEach(t => newTags.add(t));
    }

    // 3. 回调父组件更新列表
    if (onImportComplete) {
      onImportComplete(newItems, newTags);
    }
    
    // 清空 input
    e.target.value = '';
  };

  return (
    <input
      id={customId}
      type="file"
      multiple
      accept="image/*"
      ref={fileInputRef}
      onChange={handleFiles}
      className="hidden"
    />
  );
};