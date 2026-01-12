'use client';

import { useState, useMemo } from 'react';
import { DaySelector } from './DaySelector';
import { Timeline } from './Timeline';
import { getEventsForDay } from '@/lib/storage';
import { BabyEvent } from '@/lib/types';

interface HistoryViewProps {
  onEventTap?: (event: BabyEvent) => void;
}

export function HistoryView({ onEventTap }: HistoryViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const events = useMemo(() => {
    return getEventsForDay(currentDate);
  }, [currentDate]);

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  // Can only go to next day if not already at today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDateNormalized = new Date(currentDate);
  currentDateNormalized.setHours(0, 0, 0, 0);
  const canGoNext = currentDateNormalized < today;

  // Calculate daily summary
  const summary = useMemo(() => {
    const sleepEvents = events.filter(e => e.type === 'sleep' && e.endedAt);
    const totalSleepMinutes = sleepEvents.reduce((sum, e) => {
      if (e.endedAt) {
        return sum + (e.endedAt.getTime() - e.startedAt.getTime()) / (1000 * 60);
      }
      return sum;
    }, 0);

    const feedCount = events.filter(e => e.type === 'feed').length;
    const diaperCount = events.filter(e => e.type === 'diaper').length;

    return {
      sleepHours: Math.floor(totalSleepMinutes / 60),
      sleepMinutes: Math.round(totalSleepMinutes % 60),
      feedCount,
      diaperCount,
      napCount: sleepEvents.length,
    };
  }, [events]);

  return (
    <div className="flex-1 flex flex-col">
      <DaySelector
        currentDate={currentDate}
        onPrevious={goToPreviousDay}
        onNext={goToNextDay}
        canGoNext={canGoNext}
      />

      <div className="divider" />

      {/* Daily Summary Card */}
      {events.length > 0 && (
        <div className="px-6 py-4">
          <div className="bg-surface rounded-xl p-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-medium">
                {summary.sleepHours > 0 ? `${summary.sleepHours}h` : `${summary.sleepMinutes}m`}
              </p>
              <p className="text-sm text-muted lowercase-ui">sleep</p>
            </div>
            <div>
              <p className="text-2xl font-medium">{summary.feedCount}</p>
              <p className="text-sm text-muted lowercase-ui">feeds</p>
            </div>
            <div>
              <p className="text-2xl font-medium">{summary.diaperCount}</p>
              <p className="text-sm text-muted lowercase-ui">diapers</p>
            </div>
          </div>
        </div>
      )}

      <div className="divider" />

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        <Timeline events={events} onEventTap={onEventTap} />
      </div>
    </div>
  );
}
