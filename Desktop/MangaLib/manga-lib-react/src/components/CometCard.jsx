import React, { useRef, useState } from "react";
import { cn } from "../lib/utils";

export const CometCard = ({ 
  children, 
  className, 
  glowColor = "rgba(255, 255, 255, 0.8)", // 默认光晕颜色
  isStarred = false 
}) => {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 1. 设置光晕位置
    setPosition({ x, y });

    // 2. 计算 3D 倾斜 (强度可调，这里设为 20)
    const rotateX = ((y - centerY) / centerY) * -10; // 这里的数值控制倾斜幅度
    const rotateY = ((x - centerX) / centerX) * 10;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
    // 鼠标离开时复位
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden rounded-xl bg-gray-100 dark:bg-neutral-900 transition-all duration-200 ease-out",
        "transform-style-3d cursor-pointer select-none", // 确保 3D 效果开启
        isStarred && "shadow-[0_0_20px_rgba(255,215,0,0.3)] border-2 border-yellow-500/50", // 收藏时的金色辉光
        className
      )}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.02, 1.02, 1.02)`,
      }}
    >
      {/* 1. 光标跟随的流光层 (The Comet Glow) */}
      <div
        className="pointer-events-none absolute -inset-px z-0 transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 40%)`,
        }}
      />
      
      {/* 2. 内部内容容器 (遮挡多余的光晕，只留边缘) */}
      <div className={cn(
        "relative z-10 h-full w-full rounded-[10px] bg-white dark:bg-[#111] overflow-hidden flex flex-col",
        // 如果需要卡片内容背景也是半透明，可以调整这里
      )}>
        {children}
      </div>

      {/* 3. 电镀流光特效 (仅收藏时显示) */}
      {isStarred && (
        <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-tr from-transparent via-yellow-200/20 to-transparent opacity-50 animate-pulse" />
      )}
    </div>
  );
};