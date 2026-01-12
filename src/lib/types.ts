export type EventType = 'sleep' | 'feed' | 'diaper' | 'play' | 'meds' | 'pump';

export type FeedType = 'bottle' | 'breast' | 'solid';
export type DiaperType = 'wet' | 'dirty' | 'both';
export type Side = 'left' | 'right' | 'both';

export interface Baby {
  id: string;
  userId: string;
  name: string;
  birthDate: Date;
  createdAt: Date;
}

export interface BabyEvent {
  id: string;
  babyId: string;
  type: EventType;
  startedAt: Date;
  endedAt: Date | null;
  metadata: EventMetadata;
  createdAt: Date;
}

export type EventMetadata =
  | FeedMetadata
  | DiaperMetadata
  | SleepMetadata
  | PlayMetadata
  | MedsMetadata
  | PumpMetadata;

export interface FeedMetadata {
  feedType: FeedType;
  amountOz?: number;
  side?: Side;
  durationMin?: number;
}

export interface DiaperMetadata {
  diaperType: DiaperType;
}

export interface SleepMetadata {
  quality?: 1 | 2 | 3;
}

export interface PlayMetadata {
  activity?: string;
}

export interface MedsMetadata {
  medication: string;
  dose: string;
}

export interface PumpMetadata {
  amountOz: number;
  side: Side;
}

export interface Medication {
  id: string;
  babyId: string;
  name: string;
  dose: string;
  frequencyHours: number;
}

export interface Prediction {
  type: EventType;
  predictedAt: Date;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  isUrgent: boolean;
}
