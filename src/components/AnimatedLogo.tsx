"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "~/lib/utils";

export default function AnimatedLogo() {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={containerRef}
      className="relative flex items-center justify-center cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Container for the logo with glow effect */}
      <div className={cn(
        "absolute inset-0 bg-[#22c55e] rounded-full blur-xl transition-opacity duration-500",
        isHovered ? "opacity-20" : "opacity-0"
      )} />
      
      <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex items-center justify-center">
        <span className={cn(
          "text-4xl sm:text-5xl font-black text-[#0f1f0f] transition-all duration-300",
          isHovered && "text-[#22c55e] scale-110"
        )}>
          FN
        </span>
      </div>
    </div>
  );
}
