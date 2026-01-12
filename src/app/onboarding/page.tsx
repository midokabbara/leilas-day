'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveBaby, setOnboardingComplete } from '@/lib/storage';
import { Baby } from '@/lib/types';

export default function Onboarding() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [step, setStep] = useState<'name' | 'date' | 'done'>('name');

  const handleSubmit = () => {
    if (!name.trim() || !birthDate) return;

    const baby: Baby = {
      id: crypto.randomUUID(),
      userId: 'local',
      name: name.trim().toLowerCase(),
      birthDate: new Date(birthDate),
      createdAt: new Date(),
    };

    saveBaby(baby);
    setOnboardingComplete();
    setStep('done');

    // Navigate to dashboard after brief delay
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {step === 'name' && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-medium lowercase-ui">
                welcome to leila's day
              </h1>
              <p className="text-muted lowercase-ui">
                the simplest way to track your baby's schedule
              </p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm text-muted lowercase-ui">
                  what's your baby's name?
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="leila"
                  autoFocus
                  className="
                    mt-2 w-full px-4 py-3 rounded-xl
                    bg-surface border border-border
                    text-foreground placeholder:text-muted/50
                    focus:outline-none focus:border-accent
                    lowercase-ui text-lg
                  "
                />
              </label>

              <button
                onClick={() => name.trim() && setStep('date')}
                disabled={!name.trim()}
                className="
                  w-full py-4 rounded-xl
                  bg-foreground text-background
                  font-medium lowercase-ui
                  disabled:opacity-30
                  transition-opacity
                "
              >
                next
              </button>
            </div>
          </div>
        )}

        {step === 'date' && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-medium lowercase-ui">
                hi {name.toLowerCase()}!
              </h1>
              <p className="text-muted lowercase-ui">
                when was {name.toLowerCase()} born?
              </p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm text-muted lowercase-ui">
                  birth date
                </span>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  autoFocus
                  className="
                    mt-2 w-full px-4 py-3 rounded-xl
                    bg-surface border border-border
                    text-foreground
                    focus:outline-none focus:border-accent
                    lowercase-ui text-lg
                  "
                />
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('name')}
                  className="
                    flex-1 py-4 rounded-xl
                    bg-surface border border-border
                    text-foreground font-medium lowercase-ui
                  "
                >
                  back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!birthDate}
                  className="
                    flex-1 py-4 rounded-xl
                    bg-foreground text-background
                    font-medium lowercase-ui
                    disabled:opacity-30
                    transition-opacity
                  "
                >
                  let's go
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center space-y-4">
            <div className="text-4xl">✓</div>
            <h1 className="text-2xl font-medium lowercase-ui">
              all set!
            </h1>
            <p className="text-muted lowercase-ui">
              let's start tracking {name.toLowerCase()}'s day
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
