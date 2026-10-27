import React, { useEffect } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CompletionToast: React.FC = () => {
  const { lastCompletedItem, clearLastCompleted } = useApp();

  useEffect(() => {
    if (!lastCompletedItem) return;
    const timer = setTimeout(() => {
      clearLastCompleted();
    }, 2800);
    return () => clearTimeout(timer);
  }, [lastCompletedItem, clearLastCompleted]);

  if (!lastCompletedItem) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-pop">
      <div
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border shadow-lg backdrop-blur-md"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-accent-primary)',
          boxShadow: '0 8px 24px -4px rgba(163, 191, 168, 0.25)',
        }}
      >
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-accent-primary)' }}
        >
          <CheckCircle2 className="w-4 h-4 text-[#101923]" />
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-primary)]">
          <span className="font-semibold text-[var(--color-accent-primary)]">
            {lastCompletedItem.type === 'task' ? 'Тапсырма' : 'Әдет'} орындалды:
          </span>
          <span className="truncate max-w-[180px] sm:max-w-[260px]">
            «{lastCompletedItem.title}»
          </span>
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-secondary)] shrink-0" />
        </div>
      </div>
    </div>
  );
};
