import React from 'react';
import { Icon } from './Icon';

export function EmptyState({
  icon = 'inventory_2',
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-stack-lg px-gutter glass-surface rounded-lg">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-stack-md">
        <Icon name={icon} className="text-primary text-3xl" />
      </div>
      <h3 className="font-title-md text-title-md mb-1">{title}</h3>
      {description && <p className="text-body-sm text-on-surface-variant max-w-xs mb-stack-md">{description}</p>}
      {action}
    </div>
  );
}
