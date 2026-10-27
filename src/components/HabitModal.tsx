import React, { useState, useEffect } from 'react';
import { X, Flame, AlertCircle } from 'lucide-react';
import { Habit } from '../types';
import { useApp } from '../context/AppContext';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit?: Habit | null;
}

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  habitToEdit,
}) => {
  const { addHabit, updateHabit } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('health');
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'weekends'>('daily');
  const [targetDays, setTargetDays] = useState(7);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setCategory(habitToEdit.category);
      setFrequency(habitToEdit.frequency);
      setTargetDays(habitToEdit.targetDaysPerWeek);
    } else {
      setTitle('');
      setCategory('health');
      setFrequency('daily');
      setTargetDays(7);
    }
    setError(null);
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Әдет атауын жазыңыз.');
      return;
    }

    if (habitToEdit) {
      updateHabit(habitToEdit.id, {
        title: title.trim(),
        category,
        frequency,
        targetDaysPerWeek: targetDays,
      });
    } else {
      addHabit({
        title: title.trim(),
        category,
        frequency,
        targetDaysPerWeek: targetDays,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-pop"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            {habitToEdit ? 'Әдетті өңдеу' : 'Жаңа әдет қосу'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--color-text-primary)]">
              Әдет атауы *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Мысалы: Таңғы медитация (10 мин)..."
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-[var(--color-accent-primary)]"
              style={{
                backgroundColor: 'var(--color-sec-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              autoFocus
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--color-text-primary)]">
              Санат
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
              style={{
                backgroundColor: 'var(--color-sec-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="health">Денсаулық пен спорт</option>
              <option value="study">Оқу мен білім</option>
              <option value="personal">Жеке даму</option>
              <option value="work">Жұмыс пен мансап</option>
              <option value="finance">Қаржылық тәртіп</option>
            </select>
          </div>

          {/* Frequency & Target */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                Жиілігі
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                style={{
                  backgroundColor: 'var(--color-sec-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <option value="daily">Күн сайын (Daily)</option>
                <option value="weekdays">Жұмыс күндері (Дүй-Жұм)</option>
                <option value="weekends">Демалыс күндері (Сен-Жек)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                Аптасына мақсат (күн)
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={targetDays}
                onChange={(e) => setTargetDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                style={{
                  backgroundColor: 'var(--color-sec-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              Болдырмау
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[var(--color-accent-primary)] text-[#101923] active:scale-95 shadow-sm"
            >
              {habitToEdit ? 'Өзгерісті сақтау' : 'Әдетті бастау'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
