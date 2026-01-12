'use client';

import { BabyEvent } from '@/lib/types';
import { formatTime, describeEvent } from '@/lib/humanize';

interface TimelineProps {
  events: BabyEvent[];
  onEventTap?: (event: BabyEvent) => void;
}

export function Timeline({ events, onEventTap }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-muted lowercase-ui">no events yet today</p>
        <p className="text-sm text-muted/70 mt-2 lowercase-ui">
          start logging to see your timeline
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 space-y-1">
      {events.map((event) => {
        const time = formatTime(event.startedAt);
        const description = describeEvent(event);
        const isOngoing = !event.endedAt && (event.type === 'sleep' || event.type === 'play');

        return (
          <button
            key={event.id}
            onClick={() => onEventTap?.(event)}
            className="
              w-full text-left py-3 px-2 -mx-2
              rounded-lg
              hover:bg-surface active:bg-surface
              transition-colors
              flex items-start gap-4
            "
          >
            {/* Time column */}
            <span className="text-sm text-muted w-16 shrink-0 lowercase-ui">
              {time}
            </span>

            {/* Description */}
            <div className="flex-1 min-w-0">
              <p className={`lowercase-ui ${isOngoing ? 'text-accent font-medium' : 'text-foreground'}`}>
                {description}
              </p>

              {/* Sleep duration bar */}
              {event.type === 'sleep' && event.endedAt && (
                <div className="mt-2 flex items-center gap-2">
                  <div
                    className="h-1.5 bg-accent/30 rounded-full"
                    style={{
                      width: `${Math.min(100, ((event.endedAt.getTime() - event.startedAt.getTime()) / (1000 * 60 * 90)) * 100)}%`,
                      minWidth: '20px',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Ongoing indicator */}
            {isOngoing && (
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0 mt-1.5" />
            )}
          </button>
        );
      })}
    </div>
  );
}
