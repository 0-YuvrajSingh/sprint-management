import React from 'react';
import { cn } from './utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'narrow' | 'full';
}

export function PageContainer({ 
  children, 
  className, 
  variant = 'default' 
}: PageContainerProps) {
  const maxWidthClass = {
    default: 'max-w-7xl',
    narrow: 'max-w-4xl',
    full: 'max-w-none',
  }[variant];

  return (
    <div className={cn(
      "px-6 py-8 lg:px-12 lg:py-10",
      maxWidthClass,
      "mx-auto w-full min-h-screen",
      className
    )}>
      {children}
    </div>
  );
}
