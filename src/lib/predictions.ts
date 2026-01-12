import { BabyEvent, Prediction, EventType } from './types';
import { getDefaultsForAge, AgeBasedDefaults } from './wake-windows';

export function getPredictions(
  events: BabyEvent[],
  birthDate: Date
): Prediction[] {
  const defaults = getDefaultsForAge(birthDate);
  const now = new Date();
  const predictions: Prediction[] = [];

  // Get last events by type
  const lastSleep = getLastEventOfType(events, 'sleep');
  const lastFeed = getLastEventOfType(events, 'feed');
  const lastDiaper = getLastEventOfType(events, 'diaper');

  // Sleep prediction
  const sleepPrediction = predictNextSleep(lastSleep, defaults, now);
  if (sleepPrediction) predictions.push(sleepPrediction);

  // Feed prediction
  const feedPrediction = predictNextFeed(lastFeed, defaults, now);
  if (feedPrediction) predictions.push(feedPrediction);

  // Diaper prediction (simpler - based on time + feeds)
  const diaperPrediction = predictNextDiaper(lastDiaper, lastFeed, now);
  if (diaperPrediction) predictions.push(diaperPrediction);

  // Sort by urgency first, then by predicted time
  return predictions.sort((a, b) => {
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    return a.predictedAt.getTime() - b.predictedAt.getTime();
  });
}

function getLastEventOfType(
  events: BabyEvent[],
  type: EventType
): BabyEvent | null {
  const filtered = events.filter((e) => e.type === type);
  if (filtered.length === 0) return null;
  return filtered.sort(
    (a, b) => b.startedAt.getTime() - a.startedAt.getTime()
  )[0];
}

function predictNextSleep(
  lastSleep: BabyEvent | null,
  defaults: AgeBasedDefaults,
  now: Date
): Prediction | null {
  // If currently sleeping (no end time), no prediction needed
  if (lastSleep && !lastSleep.endedAt) return null;

  // Calculate awake time
  const lastWakeTime = lastSleep?.endedAt || now;
  const awakeMinutes = (now.getTime() - lastWakeTime.getTime()) / (1000 * 60);

  const { wakeWindowMinutes } = defaults;
  const avgWakeWindow = (wakeWindowMinutes.min + wakeWindowMinutes.max) / 2;
  const minutesUntilNap = avgWakeWindow - awakeMinutes;

  // Determine urgency
  const isUrgent = awakeMinutes >= wakeWindowMinutes.min;
  const isPastWindow = awakeMinutes >= wakeWindowMinutes.max;

  const predictedAt = new Date(now.getTime() + minutesUntilNap * 60 * 1000);

  let reason: string;
  if (isPastWindow) {
    reason = `awake ${formatDuration(awakeMinutes)} · overtired`;
  } else if (isUrgent) {
    reason = `awake ${formatDuration(awakeMinutes)} · window closing`;
  } else {
    reason = `awake ${formatDuration(awakeMinutes)}`;
  }

  return {
    type: 'sleep',
    predictedAt,
    confidence: lastSleep ? 'medium' : 'low',
    reason,
    isUrgent,
  };
}

function predictNextFeed(
  lastFeed: BabyEvent | null,
  defaults: AgeBasedDefaults,
  now: Date
): Prediction | null {
  if (!lastFeed) {
    return {
      type: 'feed',
      predictedAt: now,
      confidence: 'low',
      reason: 'no recent feeds logged',
      isUrgent: true,
    };
  }

  const timeSinceFeed = (now.getTime() - lastFeed.startedAt.getTime()) / (1000 * 60);
  const { feedIntervalMinutes } = defaults;
  const avgInterval = (feedIntervalMinutes.min + feedIntervalMinutes.max) / 2;
  const minutesUntilFeed = avgInterval - timeSinceFeed;

  const isUrgent = timeSinceFeed >= feedIntervalMinutes.min;
  const predictedAt = new Date(now.getTime() + Math.max(0, minutesUntilFeed) * 60 * 1000);

  const feedTime = formatTime(lastFeed.startedAt);
  const reason = `last feed ${formatDuration(timeSinceFeed)} ago at ${feedTime}`;

  return {
    type: 'feed',
    predictedAt,
    confidence: 'medium',
    reason,
    isUrgent,
  };
}

function predictNextDiaper(
  lastDiaper: BabyEvent | null,
  lastFeed: BabyEvent | null,
  now: Date
): Prediction | null {
  // Simple heuristic: check diaper every 2-3 hours, or after feeds
  const DIAPER_CHECK_INTERVAL = 150; // 2.5 hours

  if (!lastDiaper) {
    return {
      type: 'diaper',
      predictedAt: now,
      confidence: 'low',
      reason: 'no recent changes logged',
      isUrgent: false,
    };
  }

  const timeSinceDiaper = (now.getTime() - lastDiaper.startedAt.getTime()) / (1000 * 60);
  const minutesUntilCheck = DIAPER_CHECK_INTERVAL - timeSinceDiaper;

  // If feed happened after last diaper, suggest checking sooner
  let reason = `last change ${formatDuration(timeSinceDiaper)} ago`;
  let isUrgent = timeSinceDiaper >= DIAPER_CHECK_INTERVAL;

  if (lastFeed && lastFeed.startedAt > lastDiaper.startedAt) {
    reason += ' · fed since';
    isUrgent = isUrgent || timeSinceDiaper >= 90;
  }

  const predictedAt = new Date(now.getTime() + Math.max(0, minutesUntilCheck) * 60 * 1000);

  return {
    type: 'diaper',
    predictedAt,
    confidence: 'low',
    reason,
    isUrgent,
  };
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase();
}

export function formatPredictionTime(prediction: Prediction): string {
  const now = new Date();
  const diff = prediction.predictedAt.getTime() - now.getTime();
  const minutes = Math.round(diff / (1000 * 60));

  if (minutes <= 0) {
    return 'now';
  }
  if (minutes < 60) {
    return `in ~${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `in ~${hours}h`;
  }
  return `in ~${hours}h ${mins}m`;
}
