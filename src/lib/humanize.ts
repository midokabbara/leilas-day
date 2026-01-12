import { BabyEvent, EventType } from './types';

// Format duration in human-friendly way
export function formatDuration(minutes: number): string {
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${Math.round(minutes)}m`;

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Format time in lowercase am/pm
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase();
}

// Format date naturally
export function formatDay(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase();
}

// Format age in months
export function formatAge(birthDate: Date): string {
  const now = new Date();
  const months = (now.getFullYear() - birthDate.getFullYear()) * 12
    + (now.getMonth() - birthDate.getMonth());

  if (months < 1) {
    const days = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} day${days !== 1 ? 's' : ''} old`;
  }
  if (months === 1) return '1 month old';
  return `${months} months old`;
}

// Get time since a date
export function timeSince(date: Date): { minutes: number; text: string } {
  const now = new Date();
  const minutes = (now.getTime() - date.getTime()) / (1000 * 60);
  return {
    minutes,
    text: formatDuration(minutes),
  };
}

// Human-readable event descriptions
export function describeEvent(event: BabyEvent): string {
  const metadata = event.metadata as Record<string, unknown>;

  switch (event.type) {
    case 'sleep':
      if (!event.endedAt) {
        return 'fell asleep';
      }
      const sleepDuration = (event.endedAt.getTime() - event.startedAt.getTime()) / (1000 * 60);
      return `woke up · slept ${formatDuration(sleepDuration)}`;

    case 'feed':
      const feedType = metadata?.feedType || 'fed';
      const amount = metadata?.amountOz;
      const side = metadata?.side;
      const duration = metadata?.durationMin;

      if (feedType === 'bottle' && amount) {
        return `fed · bottle · ${amount} oz`;
      }
      if (feedType === 'breast') {
        const parts = ['fed · breast'];
        if (side) parts.push(String(side).charAt(0).toUpperCase());
        if (duration) parts.push(`${duration}m`);
        return parts.join(' · ');
      }
      if (feedType === 'solid') {
        return 'fed · solids';
      }
      return 'fed';

    case 'diaper':
      const diaperType = metadata?.diaperType || 'changed';
      return `diaper · ${diaperType}`;

    case 'play':
      if (!event.endedAt) {
        return 'started playing';
      }
      const playDuration = (event.endedAt.getTime() - event.startedAt.getTime()) / (1000 * 60);
      return `played · ${formatDuration(playDuration)}`;

    case 'meds':
      const med = metadata?.medication || 'meds';
      return `${med}`;

    case 'pump':
      const pumpAmount = metadata?.amountOz;
      const pumpSide = metadata?.side;
      const parts = ['pumped'];
      if (pumpAmount) parts.push(`${pumpAmount} oz`);
      if (pumpSide) parts.push(String(pumpSide));
      return parts.join(' · ');

    default:
      return event.type;
  }
}

// Hero card state messages
export function getHeroState(
  lastSleep: BabyEvent | null,
  ongoingSleep: BabyEvent | null
): { state: string; time: string; guidance: string; action: string; actionType: EventType } {

  // If currently sleeping
  if (ongoingSleep) {
    const { text } = timeSince(ongoingSleep.startedAt);
    return {
      state: "she's sleeping",
      time: text,
      guidance: 'sweet dreams',
      action: 'tap when she wakes',
      actionType: 'sleep',
    };
  }

  // If awake
  const lastWake = lastSleep?.endedAt || new Date();
  const { minutes, text } = timeSince(lastWake);

  // Determine guidance based on awake time (assuming ~3 month old defaults)
  let guidance: string;
  if (minutes < 45) {
    guidance = 'just woke up';
  } else if (minutes < 75) {
    guidance = 'enjoying awake time';
  } else if (minutes < 90) {
    guidance = 'ready for a nap soon';
  } else {
    guidance = 'nap time · getting sleepy';
  }

  return {
    state: "she's been awake",
    time: text,
    guidance,
    action: 'tap when she sleeps',
    actionType: 'sleep',
  };
}

// Coming up item descriptions
export function formatComingUp(
  type: EventType,
  minutesUntil: number,
  lastEvent: BabyEvent | null
): string {
  const timeText = minutesUntil <= 0
    ? 'now'
    : minutesUntil < 60
      ? `in ~${Math.round(minutesUntil)} min`
      : `in ~${Math.round(minutesUntil / 60)}h`;

  switch (type) {
    case 'feed':
      if (lastEvent) {
        const metadata = lastEvent.metadata as Record<string, unknown>;
        const amount = metadata?.amountOz;
        const lastTime = formatTime(lastEvent.startedAt);
        if (amount) {
          return `feed ${timeText} · last was ${amount}oz at ${lastTime}`;
        }
        return `feed ${timeText} · last at ${lastTime}`;
      }
      return `feed ${timeText}`;

    case 'diaper':
      if (lastEvent) {
        const { text } = timeSince(lastEvent.startedAt);
        return `diaper check · changed ${text} ago`;
      }
      return `diaper check ${timeText}`;

    case 'meds':
      if (lastEvent) {
        const metadata = lastEvent.metadata as Record<string, unknown>;
        const med = metadata?.medication || 'meds';
        return `${med} ${timeText}`;
      }
      return `meds ${timeText}`;

    default:
      return `${type} ${timeText}`;
  }
}
