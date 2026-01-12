import { BabyEvent } from './types';
import { getEvents } from './storage';

export interface DayStats {
  date: Date;
  totalSleepMinutes: number;
  napCount: number;
  feedCount: number;
  diaperCount: number;
}

export interface PatternInsights {
  daysOfData: number;
  hasEnoughData: boolean;

  // Sleep patterns
  averageTotalSleep: number; // minutes per day
  averageNapCount: number;
  typicalNapTimes: string[]; // e.g., ["9:30 am", "1:00 pm"]
  averageNapDuration: number; // minutes

  // Feed patterns
  averageFeedCount: number;
  typicalFeedTimes: string[];
  averageFeedInterval: number; // minutes

  // Typical day schedule
  typicalDay: { time: string; activity: string }[];
}

export function getPatternInsights(): PatternInsights {
  const events = getEvents();
  const now = new Date();

  // Get events from last 7 days
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentEvents = events.filter(e => e.startedAt >= sevenDaysAgo);

  // Count unique days with data
  const daysWithData = new Set(
    recentEvents.map(e => e.startedAt.toDateString())
  );
  const daysOfData = daysWithData.size;
  const hasEnoughData = daysOfData >= 3;

  // Calculate daily stats
  const dailyStats = getDailyStats(recentEvents, 7);

  // Sleep patterns
  const sleepEvents = recentEvents.filter(e => e.type === 'sleep' && e.endedAt);
  const totalSleepMinutes = sleepEvents.reduce((sum, e) => {
    if (e.endedAt) {
      return sum + (e.endedAt.getTime() - e.startedAt.getTime()) / (1000 * 60);
    }
    return sum;
  }, 0);

  const averageTotalSleep = daysOfData > 0 ? totalSleepMinutes / daysOfData : 0;
  const averageNapCount = daysOfData > 0 ? sleepEvents.length / daysOfData : 0;
  const averageNapDuration = sleepEvents.length > 0 ? totalSleepMinutes / sleepEvents.length : 0;

  // Find typical nap times (cluster analysis)
  const napStartTimes = sleepEvents.map(e => {
    const hours = e.startedAt.getHours();
    const minutes = e.startedAt.getMinutes();
    return hours * 60 + minutes; // minutes since midnight
  });
  const typicalNapTimes = clusterTimes(napStartTimes).map(formatMinutesAsTime);

  // Feed patterns
  const feedEvents = recentEvents.filter(e => e.type === 'feed');
  const averageFeedCount = daysOfData > 0 ? feedEvents.length / daysOfData : 0;

  const feedStartTimes = feedEvents.map(e => {
    const hours = e.startedAt.getHours();
    const minutes = e.startedAt.getMinutes();
    return hours * 60 + minutes;
  });
  const typicalFeedTimes = clusterTimes(feedStartTimes).map(formatMinutesAsTime);

  // Calculate average feed interval
  const sortedFeeds = [...feedEvents].sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
  let totalInterval = 0;
  let intervalCount = 0;
  for (let i = 1; i < sortedFeeds.length; i++) {
    const interval = (sortedFeeds[i].startedAt.getTime() - sortedFeeds[i-1].startedAt.getTime()) / (1000 * 60);
    if (interval < 480) { // Only count intervals under 8 hours (exclude overnight)
      totalInterval += interval;
      intervalCount++;
    }
  }
  const averageFeedInterval = intervalCount > 0 ? totalInterval / intervalCount : 180;

  // Build typical day
  const typicalDay = buildTypicalDay(typicalNapTimes, typicalFeedTimes, averageNapDuration);

  return {
    daysOfData,
    hasEnoughData,
    averageTotalSleep,
    averageNapCount,
    typicalNapTimes,
    averageNapDuration,
    averageFeedCount,
    typicalFeedTimes,
    averageFeedInterval,
    typicalDay,
  };
}

function getDailyStats(events: BabyEvent[], days: number): DayStats[] {
  const stats: DayStats[] = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const dayEvents = events.filter(e =>
      e.startedAt >= date && e.startedAt <= endOfDay
    );

    const sleepEvents = dayEvents.filter(e => e.type === 'sleep' && e.endedAt);
    const totalSleepMinutes = sleepEvents.reduce((sum, e) => {
      if (e.endedAt) {
        return sum + (e.endedAt.getTime() - e.startedAt.getTime()) / (1000 * 60);
      }
      return sum;
    }, 0);

    stats.push({
      date,
      totalSleepMinutes,
      napCount: sleepEvents.length,
      feedCount: dayEvents.filter(e => e.type === 'feed').length,
      diaperCount: dayEvents.filter(e => e.type === 'diaper').length,
    });
  }

  return stats;
}

// Simple clustering to find typical times
function clusterTimes(minutesSinceMidnight: number[]): number[] {
  if (minutesSinceMidnight.length === 0) return [];

  // Sort times
  const sorted = [...minutesSinceMidnight].sort((a, b) => a - b);

  // Simple clustering: group times within 60 minutes of each other
  const clusters: number[][] = [];
  let currentCluster: number[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i-1] < 60) {
      currentCluster.push(sorted[i]);
    } else {
      clusters.push(currentCluster);
      currentCluster = [sorted[i]];
    }
  }
  clusters.push(currentCluster);

  // Return average of each cluster (only clusters with 2+ occurrences)
  return clusters
    .filter(c => c.length >= 2)
    .map(c => Math.round(c.reduce((a, b) => a + b, 0) / c.length))
    .slice(0, 4); // Max 4 typical times
}

function formatMinutesAsTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return mins === 0
    ? `${displayHours} ${period}`
    : `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

function buildTypicalDay(
  napTimes: string[],
  feedTimes: string[],
  avgNapDuration: number
): { time: string; activity: string }[] {
  const schedule: { time: string; activity: string }[] = [];

  // Add morning wake (assume 7am if no data)
  schedule.push({ time: '7:00', activity: 'wake + feed' });

  // Interleave naps and feeds
  const allTimes: { time: string; type: 'nap' | 'feed' }[] = [
    ...napTimes.map(t => ({ time: t, type: 'nap' as const })),
    ...feedTimes.filter(t => !t.includes('7')).map(t => ({ time: t, type: 'feed' as const })),
  ];

  // Sort by time
  allTimes.sort((a, b) => {
    const aMin = parseTimeToMinutes(a.time);
    const bMin = parseTimeToMinutes(b.time);
    return aMin - bMin;
  });

  // Add to schedule
  for (const item of allTimes) {
    if (item.type === 'nap') {
      const durationStr = avgNapDuration > 60
        ? `${Math.round(avgNapDuration / 60)}h ${Math.round(avgNapDuration % 60)}m`
        : `${Math.round(avgNapDuration)}m`;
      schedule.push({ time: item.time, activity: `nap (${durationStr})` });
    } else {
      schedule.push({ time: item.time, activity: 'feed' });
    }
  }

  // Add bedtime
  schedule.push({ time: '7:30 pm', activity: 'bedtime' });

  return schedule.slice(0, 10); // Max 10 items
}

function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d+):?(\d+)?\s*(am|pm)/i);
  if (!match) return 0;

  let hours = parseInt(match[1]);
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const period = match[3].toLowerCase();

  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function formatDurationLong(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
