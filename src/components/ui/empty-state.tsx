'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  heading: string;
  body?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, heading, body, action, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-mid/50 px-6 py-12 text-center',
        className,
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-mid text-text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary">{heading}</h3>
      {body && <p className="mt-1 max-w-sm text-sm text-text-muted">{body}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            'mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium',
            'bg-brand text-white hover:bg-brand/90 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20',
          )}
        >
          {action.label}
        </button>
      )}
      {children}
    </div>
  ),
);
EmptyState.displayName = 'EmptyState';

export { EmptyState };
