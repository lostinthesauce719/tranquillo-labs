'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const progressVariants = cva('h-full rounded-full transition-all duration-300 ease-in-out', {
  variants: {
    variant: {
      default: 'bg-brand',
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
      info: 'bg-info',
      accent: 'bg-accent',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

const trackSizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof progressVariants> {
  value?: number;
  max?: number;
  label?: string;
  showValue?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, variant, size = 'md', value = 0, max = 100, label, showValue, ...props }, ref) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div ref={ref} className={cn('w-full space-y-1', className)} {...props}>
        {(label || showValue) && (
          <div className="flex items-center justify-between text-sm">
            {label && <span className="text-text-primary font-medium">{label}</span>}
            {showValue && <span className="text-text-muted">{Math.round(pct)}%</span>}
          </div>
        )}
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          className={cn('w-full overflow-hidden rounded-full bg-surface-mid', trackSizes[size || 'md'])}
        >
          <div
            className={progressVariants({ variant, size })}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  },
);
Progress.displayName = 'Progress';

export { Progress, progressVariants };
