import React, { useMemo } from 'react';
import {
  Flame,
  Plus,
  CheckCircle2,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  TrendingUp,
  Target,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Habit } from '../types';
import {
  toIsoDate,
  KAZAKH_WEEKDAYS_SHORT,
  formatKazakhShortDate,
} from '../utils/kazakh-date';

interface HabitsViewProps {
  onOpenNewHabitModal: () => void;
  onEditHabit: (habit: Habit) => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  onOpenNewHabitModal,
  onEditHabit,
}) => {
  const { habits, toggleHabitDay, deleteHabit, selectedDateStr } = useApp();

  // Compute past 7 days array
  const last7Days = useMemo(() => {
    const list: { iso: string; dayShort: string; isToday: boolean }[] = [];
    const todayIso = toIsoDate(new Date());

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = toIsoDate(d);
      const dayShort = KAZAKH_WEEKDAYS_SHORT[d.getDay()];
      list.push({
        iso,
        dayShort,
        isToday: iso === todayIso,
      });
    }
    return list;
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Күнделікті әдеттер
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-accent-secondary)] mt-0.5">
            Тұрақтылық пен жүйелілік — табыс кілті ({habits.length})
          </p>
        </div>

        <button
          onClick={onOpenNewHabitModal}
          className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl text-[#101923] shadow-sm active:scale-95 transition-all"
          style={{ backgroundColor: 'var(--color-accent-primary)' }}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Әдет қосу</span>
        </button>
      </div>

      {/* Habits List */}
      {habits.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center border space-y-3 backdrop-blur-md"
          style={{
            backgroundColor: 'var(--glass-bg)',
            borderColor: 'var(--color-border)',
          }}
        >
          <Flame className="w-12 h-12 mx-auto text-amber-400 opacity-70" />
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
            Әзірге әдеттер тізімі бос
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
            Күнделікті кітап оқу, жаттығу жасау немесе су ішу сияқты пайдалы әдеттерді енгізіп, серия жинаңыз.
          </p>
          <button
            onClick={onOpenNewHabitModal}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-[#101923] shadow-sm active:scale-95"
            style={{ backgroundColor: 'var(--color-accent-primary)' }}
          >
            <Plus className="w-4 h-4" /> Жаңа әдет қосу
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            // Calculate active streak
            let streak = 0;
            const now = new Date();
            for (let i = 0; i < 60; i++) {
              const d = new Date(now);
              d.setDate(d.getDate() - i);
              const iso = toIsoDate(d);
              if (habit.completions[iso]) {
                streak++;
              } else if (i > 0) {
                break;
              }
            }

            // Total completed days in history
            const totalDone = Object.values(habit.completions).filter(Boolean).length;

            return (
              <div
                key={habit.id}
                className="rounded-2xl p-4 sm:p-5 border space-y-3.5 transition-all duration-200 backdrop-blur-md hover:border-[var(--color-accent-primary)]/40"
                style={{
                  backgroundColor: 'var(--glass-bg)',
                  borderColor: 'var(--color-border)',
                }}
              >
                {/* Title and stats bar */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3
                      className="text-base font-bold text-[var(--color-text-primary)] cursor-pointer hover:text-[var(--color-accent-primary)]"
                      onClick={() => onEditHabit(habit)}
                    >
                      {habit.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                      <span className="flex items-center gap-1 font-semibold text-amber-400">
                        <Flame className="w-3.5 h-3.5" /> {streak} күн үздіксіз
                      </span>
                      <span>•</span>
                      <span>Барлығы: {totalDone} күн</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditHabit(habit)}
                      className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] hover:border-[var(--color-accent-primary)] transition-colors active:scale-90"
                      title="Өңдеу"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-rose-400 hover:border-rose-500/40 transition-colors active:scale-90"
                      title="Өшіру"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 7-Day Completion Tracker Matrix */}
                <div className="pt-1">
                  <div className="text-[11px] font-semibold text-[var(--color-text-muted)] mb-1.5 flex items-center justify-between">
                    <span>Соңғы 7 күн:</span>
                    <span className="text-[10px]">Белгілеу үшін күнді басыңыз</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {last7Days.map((day) => {
                      const isCompleted = !!habit.completions[day.iso];

                      return (
                        <button
                          key={day.iso}
                          onClick={() => toggleHabitDay(habit.id, day.iso)}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 touch-manipulation ${
                            isCompleted
                              ? 'bg-[var(--color-accent-primary)] border-[var(--color-accent-primary)] text-[#101923] shadow-xs'
                              : day.isToday
                              ? 'border-[var(--color-accent-primary)] bg-[var(--color-sec-bg)] text-[var(--color-text-primary)] ring-1 ring-[var(--color-accent-primary)]/50'
                              : 'border-[var(--color-border)] bg-[var(--color-sec-bg)]/60 text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)]/40'
                          }`}
                        >
                          <span className="text-[10px] font-bold">
                            {day.dayShort}
                          </span>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                            ) : (
                              <div
                                className={`w-2.5 h-2.5 rounded-full ${
                                  day.isToday
                                    ? 'bg-[var(--color-accent-primary)]/60'
                                    : 'bg-[var(--color-border)]'
                                }`}
                              />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
