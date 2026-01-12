'use client';

import { EventType, BabyEvent } from '@/lib/types';
import { formatComingUp } from '@/lib/humanize';

interface ComingUpItem {
  type: EventType;
  minutesUntil: number;
  lastEvent: BabyEvent | null;
}

interface ComingUpProps {
  items: ComingUpItem[];
  onTap: (type: EventType) => void;
}

export function ComingUp({ items, onTap }: ComingUpProps) {
  if (items.length === 0) return null;

  return (
    <section className="px-6 py-4">
      <h2 className="text-sm text-muted mb-3 lowercase-ui">also coming up</h2>

      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.type}
            onClick={() => onTap(item.type)}
            className="
              w-full text-left py-2 px-1 -mx-1
              rounded-lg
              hover:bg-surface active:bg-surface
              transition-colors
            "
          >
            <p className="text-foreground lowercase-ui">
              {formatComingUp(item.type, item.minutesUntil, item.lastEvent)}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
