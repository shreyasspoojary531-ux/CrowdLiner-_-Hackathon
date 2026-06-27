"use client";

import { motion } from "framer-motion";
import { getCrowdStatus } from "@/utils/crowdData";
import { useState, useRef } from "react";

interface CrowdBarProps {
  percentage: number;
  animate?: boolean;
  height?: number;
}

export default function CrowdBar({ percentage, animate = true, height = 5 }: CrowdBarProps) {
  const { color, label } = getCrowdStatus(percentage);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayWidth = `${percentage}%`;

  return (
    <div 
      ref={containerRef}
      className="w-full relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between text-xs mb-2 font-medium">
        <span className="text-text-secondary">Crowd Level</span>
        <span style={{ color }} className="font-semibold transition-colors duration-300">
          {label}
        </span>
      </div>
      
      {/* Outer Bar Container */}
      <div 
        className="w-full bg-background rounded-full overflow-visible border border-border-custom relative cursor-help"
        style={{ height: `${height}px` }}
      >
        {/* Fill Indicator */}
        {animate ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: displayWidth }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        ) : (
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: displayWidth, backgroundColor: color }}
          />
        )}

        {/* Hover Tooltip Tracking Bar Endpoint */}
        <div 
          className="absolute bottom-full mb-2 -translate-x-1/2 pointer-events-none transition-all duration-200 z-30"
          style={{ 
            left: displayWidth,
            opacity: isHovered ? 1 : 0,
            transform: `translate(-50%, ${isHovered ? "-4px" : "4px"})`
          }}
        >
          <div className="layer-3 text-[10px] font-mono font-bold text-white px-2 py-1 rounded-md whitespace-nowrap shadow-xl flex items-center gap-1 border border-border-light">
            <span style={{ color }}>●</span>
            <span>{percentage}% Occupancy</span>
          </div>
          {/* Tooltip arrow */}
          <div className="w-1.5 h-1.5 rotate-45 bg-[#1A1A1A] border-r border-b border-border-light mx-auto -mt-[4px] relative z-20" />
        </div>
      </div>
    </div>
  );
}
