// Age-based wake windows and feeding intervals
// Based on pediatric sleep research

export interface AgeBasedDefaults {
  wakeWindowMinutes: { min: number; max: number };
  feedIntervalMinutes: { min: number; max: number };
  napsPerDay: { min: number; max: number };
}

// Age in months -> defaults
export const AGE_DEFAULTS: Record<string, AgeBasedDefaults> = {
  '0-1': {
    wakeWindowMinutes: { min: 30, max: 60 },
    feedIntervalMinutes: { min: 90, max: 180 },
    napsPerDay: { min: 4, max: 6 },
  },
  '1-2': {
    wakeWindowMinutes: { min: 45, max: 75 },
    feedIntervalMinutes: { min: 120, max: 180 },
    napsPerDay: { min: 4, max: 5 },
  },
  '2-3': {
    wakeWindowMinutes: { min: 60, max: 90 },
    feedIntervalMinutes: { min: 150, max: 210 },
    napsPerDay: { min: 3, max: 5 },
  },
  '3-4': {
    wakeWindowMinutes: { min: 75, max: 120 },
    feedIntervalMinutes: { min: 180, max: 240 },
    napsPerDay: { min: 3, max: 4 },
  },
  '4-6': {
    wakeWindowMinutes: { min: 90, max: 150 },
    feedIntervalMinutes: { min: 180, max: 240 },
    napsPerDay: { min: 3, max: 4 },
  },
  '6-9': {
    wakeWindowMinutes: { min: 120, max: 180 },
    feedIntervalMinutes: { min: 210, max: 270 },
    napsPerDay: { min: 2, max: 3 },
  },
  '9-12': {
    wakeWindowMinutes: { min: 150, max: 210 },
    feedIntervalMinutes: { min: 240, max: 300 },
    napsPerDay: { min: 2, max: 2 },
  },
  '12+': {
    wakeWindowMinutes: { min: 180, max: 300 },
    feedIntervalMinutes: { min: 240, max: 300 },
    napsPerDay: { min: 1, max: 2 },
  },
};

export function getAgeGroup(birthDate: Date): string {
  const now = new Date();
  const ageMonths = (now.getFullYear() - birthDate.getFullYear()) * 12
    + (now.getMonth() - birthDate.getMonth());

  if (ageMonths < 1) return '0-1';
  if (ageMonths < 2) return '1-2';
  if (ageMonths < 3) return '2-3';
  if (ageMonths < 4) return '3-4';
  if (ageMonths < 6) return '4-6';
  if (ageMonths < 9) return '6-9';
  if (ageMonths < 12) return '9-12';
  return '12+';
}

export function getDefaultsForAge(birthDate: Date): AgeBasedDefaults {
  const ageGroup = getAgeGroup(birthDate);
  return AGE_DEFAULTS[ageGroup];
}
