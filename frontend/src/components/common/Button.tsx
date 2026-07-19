import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export function Button({ variant = 'primary', isLoading, className, children, disabled, ...rest }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-title-md text-title-md py-4 px-6 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none';

  const variants: Record<string, string> = {
    primary: 'lavender-gradient text-on-primary shadow-lg hover:scale-[1.02] button-glow',
    secondary: 'bg-white border border-outline-variant text-on-surface hover:bg-surface-container',
    ghost: 'glass-surface text-on-surface hover:-translate-y-0.5',
  };

  return (
    <button className={cn(base, variants[variant], className)} disabled={disabled || isLoading} {...rest}>
      {isLoading ? <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span> : children}
    </button>
  );
}
