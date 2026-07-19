import React from 'react';
import { cn } from '../../lib/utils';

interface IconProps {
  name: string;
  filled?: boolean;
  className?: string;
  size?: number;
}

/**
 * Wrapper around Google's Material Symbols Outlined font, matching the
 * exact icon system used throughout the Stitch design (data-icon attrs).
 */
export function Icon({ name, filled = false, className, size }: IconProps) {
  return (
    <span
      className={cn('material-symbols-outlined select-none', className)}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        fontSize: size ? `${size}px` : undefined,
      }}
    >
      {name}
    </span>
  );
}
