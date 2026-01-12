'use client';

interface HeaderProps {
  babyName: string;
}

export function Header({ babyName }: HeaderProps) {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase();

  return (
    <header className="px-6 py-4 flex items-center justify-between">
      <h1 className="text-lg font-medium lowercase-ui">{babyName}</h1>
      <time className="text-sm text-muted">{timeString}</time>
    </header>
  );
}
