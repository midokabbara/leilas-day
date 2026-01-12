'use client';

import { Prediction } from '@/lib/types';
import { formatPredictionTime } from '@/lib/predictions';

interface NextUpProps {
  predictions: Prediction[];
  onTapPrediction: (type: Prediction['type']) => void;
}

const EVENT_LABELS: Record<string, string> = {
  sleep: 'nap',
  feed: 'feed',
  diaper: 'diaper',
  play: 'play',
  meds: 'meds',
  pump: 'pump',
};

export function NextUp({ predictions, onTapPrediction }: NextUpProps) {
  if (predictions.length === 0) {
    return null;
  }

  // Show top 2 predictions
  const topPredictions = predictions.slice(0, 2);

  return (
    <section className="px-6 py-4">
      <h2 className="text-sm text-muted mb-3 lowercase-ui">next up</h2>

      <div className="space-y-3">
        {topPredictions.map((prediction) => (
          <button
            key={prediction.type}
            onClick={() => onTapPrediction(prediction.type)}
            className="w-full text-left tap-target flex items-start gap-3 py-2 px-1 -mx-1 rounded-lg hover:bg-surface active:bg-surface"
          >
            <span className="mt-0.5">
              {prediction.isUrgent ? (
                <span className="inline-block w-2 h-2 rounded-full bg-accent" />
              ) : (
                <span className="inline-block w-2 h-2 rounded-full border border-muted" />
              )}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium lowercase-ui">
                  {EVENT_LABELS[prediction.type]} {formatPredictionTime(prediction)}
                </span>
              </div>
              <p className="text-sm text-muted mt-0.5 lowercase-ui">
                {prediction.reason}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
