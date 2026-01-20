import React from 'react';
import { motion } from "motion/react";

export const HoloEffect = ({ isStarred }) => {
  if (!isStarred) return null;

  return (
    <>
      {/* 1. 镭射炫彩层 (Color Dodge) - 模拟闪卡表面的油墨反光 */}
      <motion.div 
        className="absolute inset-0 z-10 pointer-events-none opacity-40 mix-blend-color-dodge"
        style={{
            background: "linear-gradient(105deg, transparent 20%, rgba(255, 0, 150, 0.5) 40%, rgba(0, 255, 255, 0.5) 60%, transparent 80%)",
            backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />

      {/* 2. 闪光纹理层 (Overlay) - 模拟磨砂或钻闪质感 */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none opacity-20 mix-blend-overlay"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* 3. 金色边框流光 (仅针对收藏) */}
      <div className="absolute inset-0 z-20 pointer-events-none rounded-2xl border-[3px] border-yellow-400/30 mix-blend-screen shadow-[inset_0_0_20px_rgba(250,204,21,0.2)]"></div>
    </>
  );
};