import React from 'react';
import {
  Flame,
  Plus,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Habit } from '../types';

interface DailyHabitsSectionProps {
  onOpenNewHabit: () => void;
  onEditHabit: (habit: Habit) => void;
}

export const DailyHabitsSection: React.FC<DailyHabitsSectionProps> = ({
  onOpenNewHabit,
  onEditHabit,
}) => {
  const { habits, toggleHabitDay, deleteHabit, selectedDateStr } = useApp();

  const totalHabits = habits.length;
  const completedHabits = habits.filter((h) => !!h.completions[selectedDateStr]).length;
  const percent = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  return (
    <section className="space-y-3">
      {/* Header of Section 2 */}
      <div
        className="rounded-2xl p-4 sm:p-5 border space-y-3 backdrop-blur-md transition-all"
        style={{
          backgroundColor: 'var(--glass-bg)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: 'var(--color-accent-primary)' }}
            />
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--color-text-primary)] uppercase">
              2. Күнделікті әдеттер
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-sec-bg)] text-[var(--color-accent-primary)] border border-[var(--color-border)]">
              {completedHabits} / {totalHabits} орындалды
            </span>
          </div>

          <button
            onClick={onOpenNewHabit}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-[#101923] transition-all active:scale-95 shadow-sm shrink-0"
            style={{ backgroundColor: 'var(--color-accent-primary)' }}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Әдет қосу</span>
          </button>
        </div>

        {/* Compact Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span className="font-medium">Бүгінгі орындалу қарқыны:</span>
            <span className="font-bold font-mono text-[var(--color-accent-primary)]">
              {percent}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--color-sec-bg)] overflow-hidden border border-[var(--color-border-subtle)]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percent}%`,
                backgroundColor: 'var(--color-accent-primary)',
                boxShadow: '0 0 8px var(--color-accent-glow)',
              }}
            />
          </div>
        </div>

        {/* Habits Checklist */}
        {habits.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <Flame className="w-8 h-8 mx-auto text-amber-400 opacity-60" />
            <p className="text-xs text-[var(--color-text-muted)]">
              Күнделікті әдеттер әлі қосылмаған
            </p>
            <button
              onClick={onOpenNewHabit}
              className="text-xs font-semibold text-[var(--color-accent-primary)] hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Жаңа әдет қосу
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {habits.map((habit) => {
              const isCompleted = !!habit.completions[selectedDateStr];

              // Calculate active streak
              let streak = 0;
              const now = new Date();
              for (let i = 0; i < 30; i++) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const iso = d.toISOString().split('T')[0];
                if (habit.completions[iso]) {
                  streak++;
                } else if (i > 0) {
                  break;
                }
              }

              return (
                <div
                  key={habit.id}
                  className={`group rounded-xl p-3 border flex items-center justify-between gap-3 transition-all duration-200 select-none ${
                    isCompleted
                      ? 'border-[var(--color-accent-primary)]/50 bg-[var(--color-accent-primary)]/10 shadow-xs'
                      : 'border-[var(--color-border)] bg-[var(--color-sec-bg)]/80 hover:border-[var(--color-accent-primary)]/30'
                  }`}
                >
                  {/* Left: Checkbox & Title */}
                  <div
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    onClick={() => toggleHabitDay(habit.id, selectedDateStr)}
                  >
                    {/* One-tap checkbox */}
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-transform active:scale-90 ${
                        isCompleted
                          ? 'bg-[var(--color-accent-primary)] text-[#101923] shadow-sm animate-pop'
                          : 'border-2 border-[var(--color-border)] text-transparent group-hover:border-[var(--color-accent-primary)]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    </div>

                    <div className="min-w-0">
                      <h4
                        className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                          isCompleted
                            ? 'text-[var(--color-text-primary)]'
                            : 'text-[var(--color-text-primary)]'
                        }`}
                      >
                        {habit.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                          🔥 {streak} күн серия
                        </span>
                        <span>•</span>
                        <span>
                          {habit.frequency === 'daily'
                            ? 'Күн сайын'
                            : habit.frequency === 'weekdays'
                            ? 'Жұмыс күндері'
                            : 'Демалыста'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => onEditHabit(habit)}
                      className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] transition-colors"
                      title="Өңдеу"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1 text-[var(--color-text-muted)] hover:text-rose-400 transition-colors"
                      title="Өшіру"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
