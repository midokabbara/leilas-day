'use client';

type Tab = 'now' | 'history' | 'patterns';

interface TabNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'now', label: 'now' },
  { id: 'history', label: 'history' },
  { id: 'patterns', label: 'patterns' },
];

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav className="flex justify-center gap-8 py-4 border-b border-border">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`
            relative px-2 py-1 lowercase-ui
            transition-colors
            ${activeTab === id ? 'text-foreground font-medium' : 'text-muted'}
          `}
        >
          {label}
          {activeTab === id && (
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground" />
          )}
        </button>
      ))}
    </nav>
  );
}
