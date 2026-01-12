'use client';

import { formatDay } from '@/lib/humanize';

interface DaySelectorProps {
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  canGoNext: boolean;
}

export function DaySelector({ currentDate, onPrevious, onNext, canGoNext }: DaySelectorProps) {
  const dayName = formatDay(currentDate);
  const weekday = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const isToday = dayName === 'today';

  return (
    <div className="px-6 py-4 flex items-center justify-between">
      <button
        onClick={onPrevious}
        className="p-2 -m-2 text-muted hover:text-foreground transition-colors"
        aria-label="Previous day"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 4L6 10L12 16" />
        </svg>
      </button>

      <div className="text-center">
        <p className="font-medium lowercase-ui">{dayName}</p>
        {!isToday && (
          <p className="text-sm text-muted lowercase-ui">{weekday}</p>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={`
          p-2 -m-2 transition-colors
          ${canGoNext ? 'text-muted hover:text-foreground' : 'text-border'}
        `}
        aria-label="Next day"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 4L14 10L8 16" />
        </svg>
      </button>
    </div>
  );
}
