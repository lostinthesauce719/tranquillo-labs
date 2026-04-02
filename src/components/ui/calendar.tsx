'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: Date | null;
  onChange?: (date: Date) => void;
  defaultMonth?: Date;
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, value, onChange, defaultMonth, ...props }, ref) => {
    const today = new Date();
    const [viewDate, setViewDate] = React.useState(
      defaultMonth ?? value ?? today,
    );

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfWeek(year, month);

    function prevMonth() {
      setViewDate(new Date(year, month - 1, 1));
    }

    function nextMonth() {
      setViewDate(new Date(year, month + 1, 1));
    }

    // Build grid cells
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
      <div ref={ref} className={cn('w-[280px] rounded-lg border border-border bg-surface p-3', className)} {...props}>
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="rounded-md p-1 text-text-muted hover:text-text-primary hover:bg-surface-mid transition-colors"
            aria-label="Previous month"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10 4l-4 4 4 4" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-text-primary">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="rounded-md p-1 text-text-muted hover:text-text-primary hover:bg-surface-mid transition-colors"
            aria-label="Next month"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 4l4 4-4 4" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0">
          {DAYS.map((d) => (
            <div key={d} className="flex h-8 items-center justify-center text-xs font-medium text-text-muted">
              {d}
            </div>
          ))}

          {/* Day cells */}
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="h-8" />;
            }
            const date = new Date(year, month, day);
            const isSelected = value ? isSameDay(date, value) : false;
            const isToday = isSameDay(date, today);

            return (
              <button
                key={day}
                type="button"
                onClick={() => onChange?.(date)}
                className={cn(
                  'flex h-8 w-full items-center justify-center rounded-md text-sm transition-colors',
                  'hover:bg-surface-mid',
                  isSelected && 'bg-brand text-white hover:bg-brand/90',
                  !isSelected && isToday && 'font-bold text-brand',
                  !isSelected && !isToday && 'text-text-primary',
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);
Calendar.displayName = 'Calendar';

export { Calendar };
