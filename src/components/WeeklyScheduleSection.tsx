import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Repeat,
  Sparkles,
  Edit2,
  Trash2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getWeekDays,
  formatWeekRangeKk,
  getScheduleItemsForDay,
  toIsoDate,
  WeekDayInfo,
} from '../utils/kazakh-date';
import { ScheduleItem } from '../types';

interface WeeklyScheduleSectionProps {
  onOpenNewLesson: (dayOfWeek?: number, dateStr?: string) => void;
  onEditLesson: (item: ScheduleItem) => void;
}

const CATEGORY_MAP: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  lecture: {
    label: 'Дәріс',
    bg: 'bg-sky-500/15',
    text: 'text-sky-300',
    border: 'border-sky-500/30',
    dot: 'bg-sky-400',
  },
  seminar: {
    label: 'Семинар',
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
  },
  practice: {
    label: 'Практика',
    bg: 'bg-[var(--color-accent-primary)]/15',
    text: 'text-[var(--color-accent-primary)]',
    border: 'border-[var(--color-accent-primary)]/30',
    dot: 'bg-[var(--color-accent-primary)]',
  },
  lab: {
    label: 'Зертхана',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  tutoring: {
    label: 'Жеке сабақ',
    bg: 'bg-purple-500/15',
    text: 'text-purple-300',
    border: 'border-purple-500/30',
    dot: 'bg-purple-400',
  },
  work: {
    label: 'Мәжіліс/Жұмыс',
    bg: 'bg-slate-500/15',
    text: 'text-slate-300',
    border: 'border-slate-500/30',
    dot: 'bg-slate-400',
  },
  other: {
    label: 'Басқа',
    bg: 'bg-slate-500/15',
    text: 'text-slate-300',
    border: 'border-slate-500/30',
    dot: 'bg-slate-400',
  },
};

export const WeeklyScheduleSection: React.FC<WeeklyScheduleSectionProps> = ({
  onOpenNewLesson,
  onEditLesson,
}) => {
  const { schedule, deleteScheduleItem, toggleScheduleItem } = useApp();

  // Anchor date for weekly navigation
  const [weekAnchorDate, setWeekAnchorDate] = useState<Date>(() => new Date());

  // Mobile focused day (defaults to today's day of week: 1..7)
  const [mobileSelectedDayOfWeek, setMobileSelectedDayOfWeek] = useState<number>(() => {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 7 : jsDay;
  });

  // Mobile layout mode: 'all-scroll' (horizontal scroll grid) vs 'tabbed' (quick day tab preview)
  const [mobileViewMode, setMobileViewMode] = useState<'grid' | 'tabs'>('grid');

  // Compute 7 days for the active week
  const weekDays = useMemo(() => {
    return getWeekDays(weekAnchorDate);
  }, [weekAnchorDate]);

  // Is viewing the real current week?
  const isCurrentWeek = useMemo(() => {
    const todayIso = toIsoDate(new Date());
    return weekDays.some((d) => d.isoDate === todayIso);
  }, [weekDays]);

  const weekRangeText = useMemo(() => {
    return formatWeekRangeKk(weekDays[0].date);
  }, [weekDays]);

  // Navigation handlers
  const goToPreviousWeek = () => {
    setWeekAnchorDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const goToNextWeek = () => {
    setWeekAnchorDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const goToCurrentWeek = () => {
    setWeekAnchorDate(new Date());
    const jsDay = new Date().getDay();
    setMobileSelectedDayOfWeek(jsDay === 0 ? 7 : jsDay);
  };

  // Group lessons for each day of the week
  const lessonsByDay = useMemo(() => {
    const map = new Map<number, { dayInfo: WeekDayInfo; lessons: ScheduleItem[] }>();
    weekDays.forEach((dayInfo) => {
      const lessons = getScheduleItemsForDay(schedule, dayInfo.date);
      map.set(dayInfo.dayOfWeek, { dayInfo, lessons });
    });
    return map;
  }, [weekDays, schedule]);

  // Total lessons in the week
  const totalWeekLessons = useMemo(() => {
    let count = 0;
    lessonsByDay.forEach(({ lessons }) => {
      count += lessons.length;
    });
    return count;
  }, [lessonsByDay]);

  return (
    <section className="space-y-3.5">
      {/* 1. Section Header & Week Controls */}
      <div
        className="rounded-2xl p-4 sm:p-5 border space-y-3 backdrop-blur-md transition-all"
        style={{
          backgroundColor: 'var(--glass-bg)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title and stats */}
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: 'var(--color-accent-primary)' }}
              />
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--color-text-primary)] uppercase">
                1. Апталық сабақ кестесі
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-sec-bg)] text-[var(--color-accent-primary)] border border-[var(--color-border)]">
                {totalWeekLessons} сабақ
              </span>
            </div>
            <p className="text-xs text-[var(--color-accent-secondary)] mt-0.5 font-medium">
              Аптаның барлық күндері (Дүйсенбі — Жексенбі) толық кестесі
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={() => onOpenNewLesson(mobileSelectedDayOfWeek)}
            className="flex items-center justify-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl text-[#101923] transition-all active:scale-95 shadow-sm shrink-0 self-start sm:self-auto"
            style={{ backgroundColor: 'var(--color-accent-primary)' }}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Сабақ қосу</span>
          </button>
        </div>

        {/* Week navigation bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-1.5">
            <button
              onClick={goToPreviousWeek}
              className="p-1.5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors active:scale-90"
              aria-label="Алдыңғы апта"
              title="Алдыңғы апта"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] px-2 font-mono whitespace-nowrap">
              {weekRangeText}
            </span>

            <button
              onClick={goToNextWeek}
              className="p-1.5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors active:scale-90"
              aria-label="Келесі апта"
              title="Келесі апта"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isCurrentWeek && (
              <button
                onClick={goToCurrentWeek}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 hover:bg-[var(--color-accent-primary)]/20 transition-all active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Осы аптаға оралу</span>
              </button>
            )}

            {/* Mobile View Toggle */}
            <div className="sm:hidden flex items-center p-0.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-sec-bg)] text-[11px]">
              <button
                onClick={() => setMobileViewMode('grid')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  mobileViewMode === 'grid'
                    ? 'bg-[var(--color-card-bg)] text-[var(--color-accent-primary)] font-bold shadow-xs'
                    : 'text-[var(--color-text-secondary)]'
                }`}
              >
                Барлық апта
              </button>
              <button
                onClick={() => setMobileViewMode('tabs')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  mobileViewMode === 'tabs'
                    ? 'bg-[var(--color-card-bg)] text-[var(--color-accent-primary)] font-bold shadow-xs'
                    : 'text-[var(--color-text-secondary)]'
                }`}
              >
                Күндер бойынша
              </button>
            </div>
          </div>
        </div>

        {/* Legend for Categories */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-[10px]">
          <span className="text-[var(--color-text-muted)] font-medium">Белгілер:</span>
          {Object.entries(CATEGORY_MAP).slice(0, 5).map(([key, style]) => (
            <span
              key={key}
              className={`px-2 py-0.5 rounded-md border flex items-center gap-1 font-medium ${style.bg} ${style.text} ${style.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              {style.label}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Responsive Weekly Schedule View */}

      {/* A. 7-Day Quick Pill Selector (Visible on Mobile for fast navigation & overview) */}
      <div className="sm:hidden grid grid-cols-7 gap-1">
        {weekDays.map((day) => {
          const entry = lessonsByDay.get(day.dayOfWeek);
          const count = entry?.lessons.length || 0;
          const isSelected = mobileSelectedDayOfWeek === day.dayOfWeek;

          return (
            <button
              key={day.isoDate}
              onClick={() => {
                setMobileSelectedDayOfWeek(day.dayOfWeek);
                if (mobileViewMode === 'grid') {
                  const el = document.getElementById(`day-col-${day.dayOfWeek}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                }
              }}
              className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all touch-manipulation active:scale-95 ${
                isSelected
                  ? 'bg-[var(--color-accent-primary)] text-[#101923] border-[var(--color-accent-primary)] font-bold shadow-sm'
                  : day.isToday
                  ? 'border-[var(--color-accent-primary)] bg-[var(--color-sec-bg)] text-[var(--color-accent-primary)] font-semibold'
                  : 'border-[var(--color-border)] bg-[var(--color-sec-bg)]/80 text-[var(--color-text-secondary)]'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider">{day.dayShort}</span>
              <span className="text-xs font-bold leading-none mt-0.5">{day.dayNumber}</span>
              <span
                className={`text-[9px] mt-1 px-1 rounded-full ${
                  isSelected
                    ? 'bg-black/20 text-[#101923]'
                    : count > 0
                    ? 'bg-[var(--color-card-bg)] text-[var(--color-accent-primary)]'
                    : 'text-[var(--color-text-muted)]'
                }`}
              >
                {count > 0 ? count : '—'}
              </span>
            </button>
          );
        })}
      </div>

      {/* B. The 7 Columns Calendar (Desktop: 7 col grid | Mobile: horizontally scrollable or tabbed) */}
      {mobileViewMode === 'tabs' ? (
        /* Mobile Focused Tab View */
        <div className="sm:hidden space-y-3">
          {(() => {
            const entry = lessonsByDay.get(mobileSelectedDayOfWeek);
            if (!entry) return null;
            const { dayInfo, lessons } = entry;

            return (
              <div
                className={`rounded-2xl p-4 border transition-all ${
                  dayInfo.isToday
                    ? 'border-[var(--color-accent-primary)] ring-1 ring-[var(--color-accent-primary)]/40 bg-[var(--glass-bg)]'
                    : 'border-[var(--color-border)] bg-[var(--glass-bg)]'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)] mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">
                      {dayInfo.dayName}, {dayInfo.dayNumber} {dayInfo.date.toLocaleString('kk', { month: 'long' })}
                    </span>
                    {dayInfo.isToday && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-accent-primary)] text-[#101923]">
                        БҮГІН
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onOpenNewLesson(dayInfo.dayOfWeek, dayInfo.isoDate)}
                    className="text-xs font-semibold text-[var(--color-accent-primary)] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Сабақ қосу
                  </button>
                </div>

                {lessons.length === 0 ? (
                  <div className="p-6 text-center space-y-2">
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Бұл күні сабақ жоспарланбаған
                    </p>
                    <button
                      onClick={() => onOpenNewLesson(dayInfo.dayOfWeek, dayInfo.isoDate)}
                      className="text-xs font-semibold text-[var(--color-accent-primary)] hover:underline"
                    >
                      + Жаңа сабақ кестесін қосу
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {lessons.map((lesson) => {
                      const catStyle = CATEGORY_MAP[lesson.category] || CATEGORY_MAP.other;

                      return (
                        <div
                          key={lesson.id}
                          className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-sec-bg)] space-y-1.5 transition-all hover:border-[var(--color-accent-primary)]/40"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--color-card-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[var(--color-accent-primary)]" />
                              {lesson.startTime} — {lesson.endTime}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                            >
                              {catStyle.label}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
                            {lesson.title}
                          </h4>

                          <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                            {lesson.room && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[var(--color-accent-primary)]" />
                                {lesson.room}
                              </span>
                            )}
                            {lesson.groupName && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-[var(--color-accent-secondary)]" />
                                {lesson.groupName}
                              </span>
                            )}
                          </div>

                          {lesson.notes && (
                            <p className="text-[11px] text-[var(--color-text-muted)] pt-0.5">
                              {lesson.notes}
                            </p>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--color-border-subtle)]">
                            <button
                              onClick={() => onEditLesson(lesson)}
                              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" /> Өңдеу
                            </button>
                            <button
                              onClick={() => deleteScheduleItem(lesson.id)}
                              className="text-xs text-[var(--color-text-muted)] hover:text-rose-400 flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Өшіру
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      ) : (
        /* Full 7-column layout (Desktop: 7 col grid | Mobile: horizontally scrollable 7 columns) */
        <div className="relative">
          {/* Mobile scroll hint */}
          <div className="sm:hidden text-center pb-1 text-[10px] text-[var(--color-text-muted)]">
            ← Аптаның барлық күндерін көру үшін сырғытыңыз →
          </div>

          <div className="overflow-x-auto pb-2 scrollbar-thin">
            <div className="grid grid-cols-7 gap-2.5 min-w-[760px] sm:min-w-0">
              {weekDays.map((day) => {
                const entry = lessonsByDay.get(day.dayOfWeek);
                const lessons = entry?.lessons || [];
                const hasLessons = lessons.length > 0;

                return (
                  <div
                    key={day.isoDate}
                    id={`day-col-${day.dayOfWeek}`}
                    className={`rounded-2xl border flex flex-col transition-all duration-200 backdrop-blur-md ${
                      day.isToday
                        ? 'border-[var(--color-accent-primary)] ring-1 ring-[var(--color-accent-primary)]/50 shadow-md bg-[var(--color-card-bg)]'
                        : hasLessons
                        ? 'border-[var(--color-border)] bg-[var(--glass-bg)] hover:border-[var(--color-accent-primary)]/40'
                        : 'border-[var(--color-border-subtle)] bg-[var(--color-sec-bg)]/40 opacity-80'
                    }`}
                  >
                    {/* Column Day Header */}
                    <div
                      className={`p-2.5 border-b text-center rounded-t-2xl transition-colors ${
                        day.isToday
                          ? 'bg-[var(--color-accent-primary)]/15 border-[var(--color-accent-primary)]/40'
                          : 'border-[var(--color-border-subtle)] bg-[var(--color-sec-bg)]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider ${
                            day.isToday
                              ? 'text-[var(--color-accent-primary)]'
                              : 'text-[var(--color-text-secondary)]'
                          }`}
                        >
                          {day.dayShort}
                        </span>

                        {day.isToday ? (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[var(--color-accent-primary)] text-[#101923]">
                            БҮГІН
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                            {day.dayNumber}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <span className="text-[10px] text-[var(--color-text-muted)] truncate">
                          {day.dayName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 rounded-full ${
                            hasLessons
                              ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]'
                              : 'text-[var(--color-text-muted)]'
                          }`}
                        >
                          {lessons.length}
                        </span>
                      </div>
                    </div>

                    {/* Lesson Cards inside this day */}
                    <div className="p-2 space-y-2 flex-1 flex flex-col justify-between min-h-[160px]">
                      {hasLessons ? (
                        <div className="space-y-1.5">
                          {lessons.map((lesson) => {
                            const catStyle = CATEGORY_MAP[lesson.category] || CATEGORY_MAP.other;

                            return (
                              <div
                                key={lesson.id}
                                className="group relative rounded-xl p-2 border border-[var(--color-border)] bg-[var(--color-sec-bg)]/90 hover:border-[var(--color-accent-primary)]/50 transition-all text-left shadow-xs"
                              >
                                {/* Time & Category */}
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="font-mono text-[10px] font-bold text-[var(--color-text-primary)]">
                                    {lesson.startTime}
                                  </span>
                                  <span
                                    className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                                    title={catStyle.label}
                                  >
                                    {catStyle.label}
                                  </span>
                                </div>

                                {/* Title */}
                                <h4
                                  className="text-xs font-bold text-[var(--color-text-primary)] line-clamp-2 leading-tight cursor-pointer hover:text-[var(--color-accent-primary)]"
                                  onClick={() => onEditLesson(lesson)}
                                  title={lesson.title}
                                >
                                  {lesson.title}
                                </h4>

                                {/* Room or Group */}
                                {(lesson.room || lesson.groupName) && (
                                  <div className="mt-1 pt-1 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-1 text-[10px] text-[var(--color-text-muted)]">
                                    {lesson.room && (
                                      <span className="truncate flex items-center gap-0.5">
                                        <MapPin className="w-2.5 h-2.5 text-[var(--color-accent-primary)] shrink-0" />
                                        {lesson.room}
                                      </span>
                                    )}
                                    {lesson.groupName && (
                                      <span className="truncate text-right font-medium text-[var(--color-text-secondary)]">
                                        {lesson.groupName}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Hover actions */}
                                <div className="absolute top-1 right-1 hidden group-hover:flex items-center gap-0.5 bg-[var(--color-card-bg)]/95 p-0.5 rounded-md border border-[var(--color-border)] shadow-sm">
                                  <button
                                    onClick={() => onEditLesson(lesson)}
                                    className="p-1 hover:text-[var(--color-accent-primary)] text-[var(--color-text-muted)] transition-colors"
                                    title="Өңдеу"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => deleteScheduleItem(lesson.id)}
                                    className="p-1 hover:text-rose-400 text-[var(--color-text-muted)] transition-colors"
                                    title="Өшіру"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-[10px] text-[var(--color-text-muted)] flex flex-col items-center justify-center flex-1">
                          <span>Сабақ жоқ</span>
                        </div>
                      )}

                      {/* Add quick lesson button for this day */}
                      <button
                        onClick={() => onOpenNewLesson(day.dayOfWeek, day.isoDate)}
                        className="w-full py-1 rounded-lg text-[10px] font-medium border border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-all flex items-center justify-center gap-1 active:scale-95 mt-1"
                        title={`${day.dayName} күніне сабақ қосу`}
                      >
                        <Plus className="w-3 h-3" /> Сабақ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
