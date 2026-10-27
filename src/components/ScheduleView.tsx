import React, { useMemo } from 'react';
import {
  CalendarClock,
  Plus,
  Clock,
  Trash2,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatKazakhFullDate,
  formatTime24,
  timeToMinutes,
} from '../utils/kazakh-date';
import { ScheduleItem } from '../types';

interface ScheduleViewProps {
  onOpenNewScheduleModal: () => void;
  onEditScheduleItem: (item: ScheduleItem) => void;
}

const CATEGORY_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  lecture: { label: 'Дәріс', bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  seminar: { label: 'Семинар', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  practice: { label: 'Практика', bg: 'bg-[var(--color-accent-primary)]/10', text: 'text-[var(--color-accent-primary)]', border: 'border-[var(--color-accent-primary)]/30' },
  lab: { label: 'Зертхана', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  tutoring: { label: 'Жеке сабақ', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  work: { label: 'Жұмыс / Мәжіліс', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  study: { label: 'Оқу', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  personal: { label: 'Жеке', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  health: { label: 'Денсаулық', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  finance: { label: 'Қаржы', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  other: { label: 'Басқа', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
};

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  onOpenNewScheduleModal,
  onEditScheduleItem,
}) => {
  const {
    currentDate,
    selectedDateStr,
    isViewingToday,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    selectedDateSchedule,
    toggleScheduleItem,
    deleteScheduleItem,
  } = useApp();

  // Sort today's schedule chronologically
  const sortedSchedule = useMemo(() => {
    return [...selectedDateSchedule].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );
  }, [selectedDateSchedule]);

  const currentMinutes = useMemo(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5 pb-32">
      {/* Header & Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Күн тәртібі мен кесте
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-accent-secondary)] mt-0.5">
            {formatKazakhFullDate(currentDate)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center border rounded-xl p-1"
            style={{
              backgroundColor: 'var(--color-sec-bg)',
              borderColor: 'var(--color-border)',
            }}
          >
            <button
              onClick={goToPreviousDay}
              className="p-1 rounded-lg hover:text-[var(--color-accent-primary)] transition-colors"
              aria-label="Алдыңғы күн"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-2.5 py-0.5 text-xs font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent-primary)]"
            >
              {isViewingToday ? 'Бүгін' : 'Бүгінге қайту'}
            </button>
            <button
              onClick={goToNextDay}
              className="p-1 rounded-lg hover:text-[var(--color-accent-primary)] transition-colors"
              aria-label="Келесі күн"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenNewScheduleModal}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl text-[#101923] transition-all active:scale-95 shadow-sm"
            style={{
              backgroundColor: 'var(--color-accent-primary)',
            }}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Әрекет қосу</span>
          </button>
        </div>
      </div>

      {/* Schedule Items Timeline */}
      {sortedSchedule.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center border space-y-3 backdrop-blur-md"
          style={{
            backgroundColor: 'var(--glass-bg)',
            borderColor: 'var(--color-border)',
          }}
        >
          <CalendarClock className="w-12 h-12 mx-auto text-[var(--color-text-muted)] opacity-60" />
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
            Бұл күнге жоспарланған әрекеттер жоқ
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
            Күніңізді тиімді өткізу үшін уақыт блоктарын қосып, сағаттық кесте түзіңіз.
          </p>
          <button
            onClick={onOpenNewScheduleModal}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-[#101923] shadow-sm active:scale-95"
            style={{ backgroundColor: 'var(--color-accent-primary)' }}
          >
            <Plus className="w-4 h-4" /> Жаңа уақыт блогын қосу
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedSchedule.map((item, index) => {
            const startMin = timeToMinutes(item.startTime);
            const endMin = timeToMinutes(item.endTime);
            const isActiveNow = isViewingToday && currentMinutes >= startMin && currentMinutes < endMin;
            const categoryInfo = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.other;

            return (
              <div
                key={item.id}
                className={`relative rounded-2xl p-4 border transition-all duration-200 backdrop-blur-md ${
                  isActiveNow
                    ? 'border-[var(--color-accent-primary)] shadow-md ring-1 ring-[var(--color-accent-primary)]/40'
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/40'
                }`}
                style={{
                  backgroundColor: isActiveNow
                    ? 'var(--color-card-bg)'
                    : 'var(--glass-bg)',
                }}
              >
                {/* Active indicator badge */}
                {isActiveNow && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--color-accent-primary)] text-[#101923] text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#101923] animate-pulse" />
                    ҚАЗІР ӨТУДЕ
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    {/* Time & Category */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[var(--color-sec-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[var(--color-accent-primary)]" />
                        {item.startTime} — {item.endTime}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${categoryInfo.bg} ${categoryInfo.text} ${categoryInfo.border}`}
                      >
                        {categoryInfo.label}
                      </span>
                      {item.completed && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          ✓ Аяқталды
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      className={`text-sm sm:text-base font-bold tracking-tight cursor-pointer hover:text-[var(--color-accent-primary)] ${
                        item.completed
                          ? 'line-through text-[var(--color-text-muted)]'
                          : 'text-[var(--color-text-primary)]'
                      }`}
                      onClick={() => onEditScheduleItem(item)}
                    >
                      {item.title}
                    </h3>

                    {/* Room and Group */}
                    {(item.room || item.groupName) && (
                      <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)] pt-0.5">
                        {item.room && (
                          <span className="flex items-center gap-1 font-medium">
                            📍 {item.room}
                          </span>
                        )}
                        {item.groupName && (
                          <span className="flex items-center gap-1 font-semibold text-[var(--color-accent-secondary)]">
                            👥 {item.groupName}
                          </span>
                        )}
                        {item.recurringWeekly && (
                          <span className="text-[10px] text-[var(--color-text-muted)]">
                            (Апта сайын)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {item.notes && (
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={() => toggleScheduleItem(item.id)}
                      className={`p-1.5 rounded-lg border transition-all active:scale-90 ${
                        item.completed
                          ? 'bg-[var(--color-accent-primary)] text-[#101923] border-[var(--color-accent-primary)]'
                          : 'border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-secondary)]'
                      }`}
                      title={item.completed ? 'Аяқталмады' : 'Орындалды'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteScheduleItem(item.id)}
                      className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-rose-400 hover:border-rose-500/40 transition-colors active:scale-90"
                      title="Өшіру"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
