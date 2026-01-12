'use client';

import { useEffect, useState } from 'react';
import { formatAge } from '@/lib/humanize';

interface HeaderProps {
  babyName: string;
  birthDate?: Date;
}

export function Header({ babyName, birthDate }: HeaderProps) {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).toLowerCase()
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-medium lowercase-ui">{babyName}</h1>
        {birthDate && (
          <p className="text-sm text-muted lowercase-ui">
            {formatAge(birthDate)}
          </p>
        )}
      </div>
      <time className="text-sm text-muted">{timeString}</time>
    </header>
  );
}
