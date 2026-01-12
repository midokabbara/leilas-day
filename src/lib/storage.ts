import { Baby, BabyEvent } from './types';

const STORAGE_KEYS = {
  BABY: 'leilas-day:baby',
  EVENTS: 'leilas-day:events',
  ONBOARDING_COMPLETE: 'leilas-day:onboarding-complete',
};

// Baby data
export function getBaby(): Baby | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.BABY);
  if (!data) return null;
  const baby = JSON.parse(data);
  return {
    ...baby,
    birthDate: new Date(baby.birthDate),
    createdAt: new Date(baby.createdAt),
  };
}

export function saveBaby(baby: Baby): void {
  localStorage.setItem(STORAGE_KEYS.BABY, JSON.stringify(baby));
}

// Events
export function getEvents(): BabyEvent[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
  if (!data) return [];
  const events = JSON.parse(data) as BabyEvent[];
  return events.map((e) => ({
    ...e,
    startedAt: new Date(e.startedAt),
    endedAt: e.endedAt ? new Date(e.endedAt) : null,
    createdAt: new Date(e.createdAt),
  }));
}

export function saveEvents(events: BabyEvent[]): void {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
}

export function addEvent(event: BabyEvent): void {
  const events = getEvents();
  events.push(event);
  saveEvents(events);
}

export function updateEvent(id: string, updates: Partial<BabyEvent>): void {
  const events = getEvents();
  const index = events.findIndex((e) => e.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], ...updates };
    saveEvents(events);
  }
}

export function deleteEvent(id: string): void {
  const events = getEvents();
  const filtered = events.filter((e) => e.id !== id);
  saveEvents(filtered);
}

// Onboarding
export function isOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true';
}

export function setOnboardingComplete(): void {
  localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
}

// Get events by day
export function getEventsForDay(date: Date): BabyEvent[] {
  const events = getEvents();
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return events
    .filter((e) => {
      const eventTime = new Date(e.startedAt);
      return eventTime >= startOfDay && eventTime <= endOfDay;
    })
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
}

// Get last event of a type
export function getLastEventOfType(type: string): BabyEvent | null {
  const events = getEvents();
  const filtered = events
    .filter((e) => e.type === type)
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  return filtered[0] || null;
}

// Get ongoing event (started but not ended)
export function getOngoingEvent(type?: string): BabyEvent | null {
  const events = getEvents();
  const ongoing = events.filter((e) => !e.endedAt);
  if (type) {
    return ongoing.find((e) => e.type === type) || null;
  }
  return ongoing[0] || null;
}

// Clear all data (for testing)
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.BABY);
  localStorage.removeItem(STORAGE_KEYS.EVENTS);
  localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
}
