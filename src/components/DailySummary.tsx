'use client';

import { BabyEvent } from '@/lib/types';

interface DailySummaryProps {
  events: BabyEvent[];
}

export function DailySummary({ events }: DailySummaryProps) {
  // Filter to today's events
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayEvents = events.filter((e) => {
    const eventDate = new Date(e.startedAt);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate.getTime() === today.getTime();
  });

  const feedCount = todayEvents.filter((e) => e.type === 'feed').length;
  const napCount = todayEvents.filter((e) => e.type === 'sleep').length;
  const diaperCount = todayEvents.filter((e) => e.type === 'diaper').length;

  return (
    <footer className="px-6 py-4 border-t border-border">
      <p className="text-sm text-muted text-center lowercase-ui">
        today{' '}
        <span className="text-foreground">{feedCount}</span> feed{feedCount !== 1 ? 's' : ''}
        {' · '}
        <span className="text-foreground">{napCount}</span> nap{napCount !== 1 ? 's' : ''}
        {' · '}
        <span className="text-foreground">{diaperCount}</span> diaper{diaperCount !== 1 ? 's' : ''}
      </p>
    </footer>
  );
}
