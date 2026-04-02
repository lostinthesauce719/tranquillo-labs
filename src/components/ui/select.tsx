'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */
interface SelectContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  value: string;
  setValue: (v: string) => void;
  displayLabel: string;
  setDisplayLabel: (l: string) => void;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error('Select components must be used within <Select>');
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Root                                                               */
/* ------------------------------------------------------------------ */
interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

function Select({ value: controlledValue, defaultValue = '', onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const [displayLabel, setDisplayLabel] = React.useState('');
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = React.useCallback(
    (v: string) => {
      if (!isControlled) setUncontrolledValue(v);
      onValueChange?.(v);
      setOpen(false);
    },
    [isControlled, onValueChange],
  );

  return (
    <SelectContext.Provider value={{ open, setOpen, value, setValue, displayLabel, setDisplayLabel }}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Trigger                                                            */
/* ------------------------------------------------------------------ */
interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder?: string;
  label?: string;
  error?: string;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, placeholder = 'Select...', label, error, ...props }, ref) => {
    const { open, setOpen, displayLabel } = useSelectContext();

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <span className="block text-sm font-medium text-text-primary">{label}</span>
        )}
        <button
          ref={ref}
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-lg border bg-surface px-3 py-2 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-colors',
            error ? 'border-danger' : 'border-border',
            className,
          )}
          onClick={() => setOpen((o) => !o)}
          {...props}
        >
          <span className={displayLabel ? 'text-text-primary' : 'text-text-muted/60'}>
            {displayLabel || placeholder}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={cn('ml-2 shrink-0 text-text-muted transition-transform', open && 'rotate-180')}
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  },
);
SelectTrigger.displayName = 'SelectTrigger';

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */
const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelectContext();

    React.useEffect(() => {
      if (!open) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, [open, setOpen]);

    React.useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('[role="combobox"]') && !target.closest('[role="listbox"]')) {
          setOpen(false);
        }
      };
      // Delay to avoid closing on the same click that opened
      const timer = setTimeout(() => document.addEventListener('mousedown', handler), 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handler);
      };
    }, [open, setOpen]);

    if (!open) return null;

    return (
      <div
        ref={ref}
        role="listbox"
        className={cn(
          'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-surface py-1 shadow-lg',
          'animate-in fade-in-0 zoom-in-95',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
SelectContent.displayName = 'SelectContent';

/* ------------------------------------------------------------------ */
/*  Item                                                               */
/* ------------------------------------------------------------------ */
interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value: itemValue, className, children, ...props }, ref) => {
    const ctx = useSelectContext();
    const isSelected = ctx.value === itemValue;

    // Update display label when value matches
    React.useEffect(() => {
      if (isSelected && typeof children === 'string') {
        ctx.setDisplayLabel(children);
      }
    }, [isSelected, children, ctx]);

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        className={cn(
          'relative flex cursor-pointer select-none items-center px-3 py-2 text-sm text-text-primary',
          'hover:bg-surface-mid',
          isSelected && 'bg-brand/5 font-medium',
          className,
        )}
        onClick={() => {
          ctx.setValue(itemValue);
          if (typeof children === 'string') ctx.setDisplayLabel(children);
        }}
        {...props}
      >
        {children}
        {isSelected && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="ml-auto shrink-0 text-brand"
          >
            <path d="M3 8l4 4 6-7" />
          </svg>
        )}
      </div>
    );
  },
);
SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectContent, SelectItem };
