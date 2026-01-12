'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
  onUndo?: () => void;
}

export function Toast({ message, duration = 3000, onClose, onUndo }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 200); // Wait for fade out
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`
        fixed bottom-24 left-4 right-4
        bg-foreground text-background
        rounded-xl px-4 py-3
        flex items-center justify-between
        transition-opacity duration-200
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <span className="lowercase-ui">{message}</span>
      {onUndo && (
        <button
          onClick={() => {
            onUndo();
            onClose();
          }}
          className="ml-4 text-accent-muted font-medium lowercase-ui"
        >
          undo
        </button>
      )}
    </div>
  );
}

// Toast container for managing multiple toasts
interface ToastItem {
  id: string;
  message: string;
  onUndo?: () => void;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <>
      {toasts.slice(-1).map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          onClose={() => onRemove(toast.id)}
          onUndo={toast.onUndo}
        />
      ))}
    </>
  );
}
