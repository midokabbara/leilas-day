'use client';

import { EventType } from '@/lib/types';

interface QuickLogProps {
  onTap: (type: EventType) => void;
  activeEvent?: EventType | null;
}

// Simplified to just the quick actions (not sleep, which is hero)
const QUICK_ACTIONS: { type: EventType; label: string }[] = [
  { type: 'feed', label: 'fed' },
  { type: 'diaper', label: 'diaper' },
  { type: 'play', label: 'played' },
];

export function QuickLog({ onTap, activeEvent }: QuickLogProps) {
  return (
    <section className="px-6 py-4">
      <h2 className="text-sm text-muted mb-3 lowercase-ui">quick log</h2>

      <div className="flex gap-3">
        {QUICK_ACTIONS.map(({ type, label }) => {
          const isActive = activeEvent === type;
          return (
            <button
              key={type}
              onClick={() => onTap(type)}
              className={`
                flex-1 py-3 rounded-xl
                flex items-center justify-center gap-2
                transition-colors lowercase-ui
                ${isActive
                  ? 'bg-accent text-white'
                  : 'bg-surface hover:bg-border/50 active:bg-border'
                }
              `}
            >
              <span
                className={`
                  w-2 h-2 rounded-full
                  ${isActive ? 'bg-white' : 'border border-current'}
                `}
              />
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
