'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { HeroCard } from '@/components/HeroCard';
import { ComingUp } from '@/components/ComingUp';
import { QuickLog } from '@/components/QuickLog';
import { DailySummary } from '@/components/DailySummary';
import { TabNav } from '@/components/TabNav';
import { ToastContainer } from '@/components/Toast';
import { HistoryView } from '@/components/HistoryView';
import { PatternsView } from '@/components/PatternsView';
import {
  getBaby,
  getEvents,
  addEvent,
  updateEvent,
  isOnboardingComplete,
  getLastEventOfType,
  getOngoingEvent,
  getEventsForDay,
} from '@/lib/storage';
import { getHeroState } from '@/lib/humanize';
import { getPredictions } from '@/lib/predictions';
import { Baby, BabyEvent, EventType } from '@/lib/types';

type Tab = 'now' | 'history' | 'patterns';

interface Toast {
  id: string;
  message: string;
  onUndo?: () => void;
}

export default function Dashboard() {
  const router = useRouter();
  const [baby, setBaby] = useState<Baby | null>(null);
  const [events, setEvents] = useState<BabyEvent[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('now');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    if (!isOnboardingComplete()) {
      router.push('/onboarding');
      return;
    }

    const loadedBaby = getBaby();
    const loadedEvents = getEvents();

    setBaby(loadedBaby);
    setEvents(loadedEvents);
    setIsLoading(false);
  }, [router]);

  // Refresh events periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(getEvents());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const showToast = useCallback((message: string, onUndo?: () => void) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, onUndo }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleSleepAction = useCallback(() => {
    const ongoingSleep = getOngoingEvent('sleep');

    if (ongoingSleep) {
      // End sleep
      updateEvent(ongoingSleep.id, { endedAt: new Date() });
      setEvents(getEvents());
      showToast('woke up!', () => {
        updateEvent(ongoingSleep.id, { endedAt: null });
        setEvents(getEvents());
      });
    } else {
      // Start sleep
      const newEvent: BabyEvent = {
        id: crypto.randomUUID(),
        babyId: baby?.id || '1',
        type: 'sleep',
        startedAt: new Date(),
        endedAt: null,
        metadata: {},
        createdAt: new Date(),
      };
      addEvent(newEvent);
      setEvents(getEvents());
      showToast('sleep started', () => {
        // Undo would delete the event
        setEvents(getEvents().filter((e) => e.id !== newEvent.id));
      });
    }
  }, [baby, showToast]);

  const handleQuickLog = useCallback((type: EventType) => {
    const newEvent: BabyEvent = {
      id: crypto.randomUUID(),
      babyId: baby?.id || '1',
      type,
      startedAt: new Date(),
      endedAt: new Date(),
      metadata: getDefaultMetadata(type),
      createdAt: new Date(),
    };
    addEvent(newEvent);
    setEvents(getEvents());

    const labels: Record<string, string> = {
      feed: 'fed!',
      diaper: 'diaper changed!',
      play: 'play logged!',
      meds: 'meds logged!',
      pump: 'pump logged!',
    };
    showToast(labels[type] || 'logged!');
  }, [baby, showToast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted lowercase-ui">loading...</p>
      </div>
    );
  }

  if (!baby) {
    return null; // Will redirect to onboarding
  }

  // Get current state for hero card
  const lastSleep = getLastEventOfType('sleep');
  const ongoingSleep = getOngoingEvent('sleep');
  const heroState = getHeroState(lastSleep, ongoingSleep);

  // Get predictions for "coming up"
  const predictions = getPredictions(events, baby.birthDate);
  const comingUpItems = predictions
    .filter((p) => p.type !== 'sleep') // Sleep is handled by hero
    .slice(0, 2)
    .map((p) => ({
      type: p.type,
      minutesUntil: (p.predictedAt.getTime() - Date.now()) / (1000 * 60),
      lastEvent: getLastEventOfType(p.type),
    }));

  // Get today's events for summary
  const todayEvents = getEventsForDay(new Date());

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header babyName={baby.name} birthDate={baby.birthDate} />

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'now' && (
        <main className="flex-1 flex flex-col py-6">
          {/* Hero Card */}
          <HeroCard
            state={heroState.state}
            time={heroState.time}
            guidance={heroState.guidance}
            action={heroState.action}
            onAction={handleSleepAction}
            isActive={!!ongoingSleep}
          />

          <div className="divider my-6" />

          {/* Coming Up */}
          <ComingUp items={comingUpItems} onTap={handleQuickLog} />

          <div className="divider my-2" />

          {/* Quick Log */}
          <QuickLog onTap={handleQuickLog} />

          <div className="flex-1" />

          {/* Daily Summary */}
          <DailySummary events={todayEvents} />
        </main>
      )}

      {activeTab === 'history' && (
        <HistoryView />
      )}

      {activeTab === 'patterns' && (
        <PatternsView babyName={baby.name} />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
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
