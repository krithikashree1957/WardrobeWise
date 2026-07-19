import React from 'react';
import { cn } from '../../lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-surface-container-high rounded-md', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="glass-surface p-2 rounded-lg">
      <Skeleton className="w-full h-48 mb-2 rounded-md" />
      <Skeleton className="w-2/3 h-3 mb-1" />
      <Skeleton className="w-1/3 h-3" />
    </div>
  );
}
