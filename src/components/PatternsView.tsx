'use client';

import { useMemo } from 'react';
import { getPatternInsights, formatDurationLong } from '@/lib/patterns';

interface PatternsViewProps {
  babyName: string;
}

export function PatternsView({ babyName }: PatternsViewProps) {
  const insights = useMemo(() => getPatternInsights(), []);

  if (!insights.hasEnoughData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h2 className="text-lg font-medium lowercase-ui mb-2">
          learning {babyName}'s patterns
        </h2>
        <p className="text-muted text-center lowercase-ui">
          {insights.daysOfData === 0
            ? 'start logging events to see patterns emerge'
            : `${insights.daysOfData} day${insights.daysOfData !== 1 ? 's' : ''} of data · need at least 3 days`}
        </p>
        <div className="mt-6 flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${i < insights.daysOfData ? 'bg-accent' : 'bg-border'}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4">
        <h2 className="text-lg font-medium lowercase-ui">{babyName}'s patterns</h2>
        <p className="text-sm text-muted lowercase-ui">
          based on the last {insights.daysOfData} days
        </p>
      </div>

      <div className="divider" />

      {/* Sleep Section */}
      <section className="px-6 py-4">
        <h3 className="text-sm text-muted mb-3 lowercase-ui">sleep</h3>

        <div className="bg-surface rounded-xl p-4 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-medium">
                {formatDurationLong(insights.averageTotalSleep)}
              </p>
              <p className="text-sm text-muted lowercase-ui">avg total/day</p>
            </div>
            <div>
              <p className="text-2xl font-medium">
                {insights.averageNapCount.toFixed(1)}
              </p>
              <p className="text-sm text-muted lowercase-ui">naps/day</p>
            </div>
          </div>

          {/* Typical nap times */}
          {insights.typicalNapTimes.length > 0 && (
            <div>
              <p className="text-sm text-muted mb-2 lowercase-ui">usually naps around:</p>
              <div className="flex flex-wrap gap-2">
                {insights.typicalNapTimes.map((time, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm lowercase-ui"
                  >
                    {time}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="divider" />

      {/* Feeding Section */}
      <section className="px-6 py-4">
        <h3 className="text-sm text-muted mb-3 lowercase-ui">feeding</h3>

        <div className="bg-surface rounded-xl p-4 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-medium">
                {insights.averageFeedCount.toFixed(1)}
              </p>
              <p className="text-sm text-muted lowercase-ui">feeds/day</p>
            </div>
            <div>
              <p className="text-2xl font-medium">
                {formatDurationLong(insights.averageFeedInterval)}
              </p>
              <p className="text-sm text-muted lowercase-ui">avg gap</p>
            </div>
          </div>

          {/* Typical feed times */}
          {insights.typicalFeedTimes.length > 0 && (
            <div>
              <p className="text-sm text-muted mb-2 lowercase-ui">typical times:</p>
              <p className="text-sm lowercase-ui">
                {insights.typicalFeedTimes.join(' · ')}
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="divider" />

      {/* Typical Day Section */}
      <section className="px-6 py-4 pb-8">
        <h3 className="text-sm text-muted mb-3 lowercase-ui">your typical day</h3>

        <div className="bg-surface rounded-xl p-4">
          <div className="space-y-3">
            {insights.typicalDay.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm text-muted w-16 lowercase-ui">{item.time}</span>
                <span className="text-sm lowercase-ui">{item.activity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
