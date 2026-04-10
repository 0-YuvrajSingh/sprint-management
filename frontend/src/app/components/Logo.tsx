import React from 'react';
import { BarChart3 } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconSize?: number;
  showText?: boolean;
}

export function Logo({ className = "", iconSize = 4, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ml-1 ${className}`}>
      <div className="relative group">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Icon Container */}
        <div 
          className="relative w-8 h-8 rounded-lg flex items-center justify-center shadow-sm bg-primary"
          style={{ background: 'var(--gradient-primary, #4f46e5)' }}
        >
          <BarChart3 
            className="text-primary-foreground" 
            style={{ width: `${iconSize * 0.25}rem`, height: `${iconSize * 0.25}rem` }}
          />
        </div>
      </div>
      
      {showText && (
        <span className="font-semibold text-lg text-foreground tracking-tight">
          AgileTrack
        </span>
      )}
    </div>
  );
}
