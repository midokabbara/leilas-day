'use client';

import { EventType } from '@/lib/types';

interface HeroCardProps {
  state: string;
  time: string;
  guidance: string;
  action: string;
  onAction: () => void;
  isActive?: boolean;
}

export function HeroCard({
  state,
  time,
  guidance,
  action,
  onAction,
  isActive = false,
}: HeroCardProps) {
  return (
    <div
      className={`
        mx-4 rounded-2xl p-6
        ${isActive ? 'bg-accent/10' : 'bg-surface'}
        border border-border
      `}
    >
      <div className="text-center space-y-4">
        {/* State description */}
        <p className="text-muted lowercase-ui">
          {state}
        </p>

        {/* Big time display */}
        <p className="text-5xl font-medium tracking-tight">
          {time}
        </p>

        {/* Guidance */}
        <div className="flex items-center justify-center gap-2">
          <span
            className={`
              inline-block w-2 h-2 rounded-full
              ${isActive ? 'bg-accent animate-pulse' : 'bg-accent'}
            `}
          />
          <p className="text-foreground lowercase-ui">
            {guidance}
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={onAction}
          className="
            mt-4 w-full py-4 rounded-xl
            bg-foreground text-background
            font-medium lowercase-ui
            active:scale-[0.98] transition-transform
          "
        >
          {action}
        </button>
      </div>
    </div>
  );
}
