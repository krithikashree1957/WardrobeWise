import React from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'panel';
}

/** The core glassmorphism container used across every Stitch screen. */
export function GlassCard({ variant = 'surface', className, children, ...rest }: GlassCardProps) {
  return (
    <div
      className={cn(variant === 'surface' ? 'glass-surface' : 'glass-panel', 'rounded-lg', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
