'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { NextUp } from '@/components/NextUp';
import { QuickLog } from '@/components/QuickLog';
import { DailySummary } from '@/components/DailySummary';
import { getPredictions } from '@/lib/predictions';
import { BabyEvent, EventType, Prediction } from '@/lib/types';

// Demo data - will be replaced with Supabase
const DEMO_BABY = {
  name: "leila",
  birthDate: new Date('2024-10-01'), // ~3 months old
};

export default function Dashboard() {
  const [events, setEvents] = useState<BabyEvent[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [activeEvent, setActiveEvent] = useState<EventType | null>(null);
  const [, setCurrentTime] = useState(new Date());

  // Update time every minute for predictions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Recalculate predictions when events change
  useEffect(() => {
    const newPredictions = getPredictions(events, DEMO_BABY.birthDate);
    setPredictions(newPredictions);
  }, [events]);

  const handleTapEvent = (type: EventType) => {
    // For sleep/play, toggle active state
    if (type === 'sleep' || type === 'play') {
      if (activeEvent === type) {
        // End the active event
        setEvents((prev) => {
          const updated = [...prev];
          const activeIdx = updated.findIndex(
            (e) => e.type === type && !e.endedAt
          );
          if (activeIdx !== -1) {
            updated[activeIdx] = {
              ...updated[activeIdx],
              endedAt: new Date(),
            };
          }
          return updated;
        });
        setActiveEvent(null);
      } else {
        // Start a new event
        const newEvent: BabyEvent = {
          id: crypto.randomUUID(),
          babyId: '1',
          type,
          startedAt: new Date(),
          endedAt: null,
          metadata: {},
          createdAt: new Date(),
        };
        setEvents((prev) => [...prev, newEvent]);
        setActiveEvent(type);
      }
    } else {
      // For other events, just log immediately
      const newEvent: BabyEvent = {
        id: crypto.randomUUID(),
        babyId: '1',
        type,
        startedAt: new Date(),
        endedAt: new Date(),
        metadata: getDefaultMetadata(type),
        createdAt: new Date(),
      };
      setEvents((prev) => [...prev, newEvent]);

      // Show brief confirmation (could be a toast)
      console.log(`Logged ${type} at ${new Date().toLocaleTimeString()}`);
    }
  };

  const handleTapPrediction = (type: EventType) => {
    // Tapping a prediction logs it
    handleTapEvent(type);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header babyName={DEMO_BABY.name} />

      <div className="divider" />

      <main className="flex-1 flex flex-col">
        <NextUp predictions={predictions} onTapPrediction={handleTapPrediction} />

        <div className="divider" />

        <QuickLog onTapEvent={handleTapEvent} activeEvent={activeEvent} />
      </main>

      <DailySummary events={events} />
    </div>
  );
}

function getDefaultMetadata(type: EventType): Record<string, unknown> {
  switch (type) {
    case 'feed':
      return { feedType: 'bottle', amountOz: 4 };
    case 'diaper':
      return { diaperType: 'wet' };
    case 'meds':
      return { medication: 'vitamin d', dose: '1ml' };
    case 'pump':
      return { amountOz: 3, side: 'both' };
    default:
      return {};
  }
}
