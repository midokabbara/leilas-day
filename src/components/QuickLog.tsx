'use client';

import { EventType } from '@/lib/types';

interface QuickLogProps {
  onTapEvent: (type: EventType) => void;
  activeEvent?: EventType | null;
}

const EVENTS: { type: EventType; label: string }[] = [
  { type: 'sleep', label: 'sleep' },
  { type: 'feed', label: 'feed' },
  { type: 'diaper', label: 'diaper' },
  { type: 'play', label: 'play' },
  { type: 'meds', label: 'meds' },
  { type: 'pump', label: 'pump' },
];

export function QuickLog({ onTapEvent, activeEvent }: QuickLogProps) {
  return (
    <section className="px-6 py-4">
      <h2 className="text-sm text-muted mb-3 lowercase-ui">log</h2>

      <div className="grid grid-cols-3 gap-3">
        {EVENTS.map(({ type, label }) => {
          const isActive = activeEvent === type;
          return (
            <button
              key={type}
              onClick={() => onTapEvent(type)}
              className={`
                tap-target flex items-center justify-center
                py-4 px-3 rounded-xl text-center
                transition-colors lowercase-ui font-medium
                ${isActive
                  ? 'bg-accent text-white'
                  : 'bg-surface hover:bg-border/50 active:bg-border'
                }
              `}
            >
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
