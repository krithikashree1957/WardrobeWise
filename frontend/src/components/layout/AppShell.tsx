import React from 'react';
import { TopNavBar } from './TopNavBar';
import { BottomNavBar } from './BottomNavBar';

/**
 * Wraps all authenticated pages with the shared top/bottom nav, matching
 * the fixed 64px header + safe bottom padding used throughout the Stitch
 * dashboard export.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-on-surface overflow-x-hidden pb-24">
      <TopNavBar />
      <main className="mt-[64px] px-container-padding-mobile md:px-container-padding-desktop max-w-screen-xl mx-auto pt-stack-lg space-y-stack-lg">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
}
