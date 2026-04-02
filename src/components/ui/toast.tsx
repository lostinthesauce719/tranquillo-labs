'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Toast variants                                                     */
/* ------------------------------------------------------------------ */
const toastVariants = cva(
  'pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface text-text-primary',
        success: 'border-success/30 bg-success/5 text-success',
        warning: 'border-warning/30 bg-warning/5 text-warning',
        danger: 'border-danger/30 bg-danger/5 text-danger',
        info: 'border-info/30 bg-info/5 text-info',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

/* ------------------------------------------------------------------ */
/*  Toast store (simple pub/sub)                                       */
/* ------------------------------------------------------------------ */
export interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  duration?: number;
}

type ToastListener = (toasts: ToastData[]) => void;

let toasts: ToastData[] = [];
const listeners = new Set<ToastListener>();

function notify() {
  listeners.forEach((l) => l([...toasts]));
}

function addToast(data: Omit<ToastData, 'id'>) {
  const id = Math.random().toString(36).slice(2, 9);
  toasts = [...toasts, { id, ...data }];
  notify();

  const duration = data.duration ?? 5000;
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }

  return id;
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export function toast(data: Omit<ToastData, 'id'>) {
  return addToast(data);
}

export function useToasts() {
  const [state, setState] = React.useState<ToastData[]>([]);

  React.useEffect(() => {
    listeners.add(setState);
    return () => { listeners.delete(setState); };
  }, []);

  return { toasts: state, removeToast };
}

/* ------------------------------------------------------------------ */
/*  Toast component                                                    */
/* ------------------------------------------------------------------ */
interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  onClose?: () => void;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, title, description, onClose, ...props }, ref) => (
    <div ref={ref} className={cn(toastVariants({ variant }), className)} {...props}>
      <div className="flex-1 space-y-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {description && <p className="text-sm opacity-80">{description}</p>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-md p-0.5 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      )}
    </div>
  ),
);
Toast.displayName = 'Toast';

/* ------------------------------------------------------------------ */
/*  Toaster (container that renders toasts)                            */
/* ------------------------------------------------------------------ */
function Toaster() {
  const { toasts: activeToasts, removeToast: remove } = useToasts();

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 pointer-events-none">
      {activeToasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          title={t.title}
          description={t.description}
          onClose={() => remove(t.id)}
        />
      ))}
    </div>
  );
}

export { Toast, Toaster, toastVariants };
