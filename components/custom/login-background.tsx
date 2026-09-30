"use client";

import { useEffect, useState } from "react";

const emojis = ["🏠", "🔑", "🏢", "🛋️", "📦", "💰", "🪴", "🚪", "📝", "📋"];

export default function LoginBackground() {
  const [mounted, setMounted] = useState(false);
  const [elements, setElements] = useState<{ id: string; emoji: string; left: string; top: string; animationDuration: string; animationDelay: string }[]>([]);

  useEffect(() => {
    setMounted(true);
    
    const isMobile = window.innerWidth < 768;
    const cols = isMobile ? 3 : 6;
    const rows = isMobile ? 5 : 4;
    
    const cellWidth = 100 / cols;
    const cellHeight = 100 / rows;
    
    const newElements = [];
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Add random padding inside the cell to avoid grid-like rigidity, 
        // but keep them bound to their cell so they never overlap.
        const leftOffset = (Math.random() * 0.6 + 0.2) * cellWidth; // 20% to 80% of cell width
        const topOffset = (Math.random() * 0.6 + 0.2) * cellHeight; // 20% to 80% of cell height
        
        newElements.push({
          id: `${r}-${c}`,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          left: `${(c * cellWidth) + leftOffset}%`,
          top: `${(r * cellHeight) + topOffset}%`,
          animationDuration: `${4 + Math.random() * 4}s`, // 4-8s
          animationDelay: `${Math.random() * 6}s`,
        });
      }
    }
    
    setElements(newElements);
  }, []);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      <style>
        {`
          @keyframes elegant-pop {
            0% { 
              transform: scale(0.9) translateY(15px); 
              opacity: 0; 
              filter: blur(8px);
            }
            30% { 
              transform: scale(1.05) translateY(-5px); 
              opacity: 0.25; 
              filter: blur(0px);
            }
            70% { 
              transform: scale(1) translateY(-15px); 
              opacity: 0.25; 
              filter: blur(0px);
            }
            100% { 
              transform: scale(0.9) translateY(-30px); 
              opacity: 0; 
              filter: blur(8px);
            }
          }
        `}
      </style>
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute text-4xl select-none"
          style={{
            left: el.left,
            top: el.top,
            opacity: 0, // Initial state
            animation: `elegant-pop ${el.animationDuration} ease-in-out ${el.animationDelay} infinite`,
          }}
        >
          {el.emoji}
        </div>
      ))}
    </div>
  );
}
