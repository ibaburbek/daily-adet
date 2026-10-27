import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  GraduationCap,
  Moon,
  Table as TableIcon,
  LayoutGrid,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getWeekDays,
  formatWeekRangeKk,
  getScheduleItemsForDay,
  toIsoDate,
  WeekDayInfo,
} from '../utils/kazakh-date';
import {
  SCHOOL_PERIODS,
  TUTORING_PERIODS,
  inferPeriodFromTime,
} from '../utils/timetable-data';
import { ScheduleItem } from '../types';

interface WeeklyScheduleSectionProps {
  onOpenNewLesson: (
    dayOfWeek?: number,
    dateStr?: string,
    period?: number,
    timetableType?: 'school' | 'tutoring'
  ) => void;
  onEditLesson: (item: ScheduleItem) => void;
}

export const WeeklyScheduleSection: React.FC<WeeklyScheduleSectionProps> = ({
  onOpenNewLesson,
  onEditLesson,
}) => {
  const { schedule, deleteScheduleItem } = useApp();

  // Active timetable mode: 'school' (Mon-Fri, periods 0-8 + breaks) vs 'tutoring' (Mon-Sun, periods 1-5)
  const [activeTimetableType, setActiveTimetableType] = useState<'school' | 'tutoring'>('school');

  // Display mode: 'spreadsheet' (reference HTML table with rowSpan) vs 'cards' (day cards)
  const [viewMode, setViewMode] = useState<'spreadsheet' | 'cards'>('spreadsheet');

  // Anchor date for weekly navigation
  const [weekAnchorDate, setWeekAnchorDate] = useState<Date>(() => new Date());

  // Mobile focused day for card view
  const [mobileSelectedDayOfWeek, setMobileSelectedDayOfWeek] = useState<number>(() => {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 7 : jsDay;
  });

  // Compute 7 days for the active week
  const weekDays = useMemo(() => {
    return getWeekDays(weekAnchorDate);
  }, [weekAnchorDate]);

  // Days to display in table: School shows Mon–Fri (5 days); Tutoring shows Mon–Sun (7 days)
  const displayDays = useMemo(() => {
    if (activeTimetableType === 'school') {
      return weekDays.slice(0, 5); // Monday through Friday
    }
    return weekDays; // Monday through Sunday
  }, [weekDays, activeTimetableType]);

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

  // Group lessons for each day of the week, filtered by timetableType
  const lessonsByDay = useMemo(() => {
    const map = new Map<number, { dayInfo: WeekDayInfo; lessons: ScheduleItem[] }>();

    weekDays.forEach((dayInfo) => {
      const allDayLessons = getScheduleItemsForDay(schedule, dayInfo.date);
      const filtered = allDayLessons.filter((item) => {
        if (activeTimetableType === 'tutoring') {
          return item.timetableType === 'tutoring' || item.category === 'tutoring';
        }
        return item.timetableType !== 'tutoring' && item.category !== 'tutoring';
      });

      map.set(dayInfo.dayOfWeek, { dayInfo, lessons: filtered });
    });

    return map;
  }, [weekDays, schedule, activeTimetableType]);

  // Total lessons in current timetable view for the week
  const totalWeekLessons = useMemo(() => {
    let count = 0;
    lessonsByDay.forEach(({ lessons }) => {
      count += lessons.length;
    });
    return count;
  }, [lessonsByDay]);

  // Active periods list based on timetable type
  const activePeriods = activeTimetableType === 'school' ? SCHOOL_PERIODS : TUTORING_PERIODS;

  return (
    <section className="space-y-3.5">
      {/* 1. Header & Controls */}
      <div
        className="rounded-2xl p-4 sm:p-5 border space-y-3.5 backdrop-blur-md transition-all shadow-sm"
        style={{
          backgroundColor: 'var(--glass-bg)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Top title and action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: 'var(--color-accent-primary)' }}
              />
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--color-text-primary)] uppercase">
                1. Апталық сабақ кестесі (Weekly Timetable)
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-sec-bg)] text-[var(--color-accent-primary)] border border-[var(--color-border)]">
                {totalWeekLessons} сабақ
              </span>
            </div>
            <p className="text-xs text-[var(--color-accent-secondary)] font-medium">
              Қос сабақтар тігінен бір ұяшыққа біріктірілген (2-period merged cells)
            </p>
          </div>

          {/* New Lesson button */}
          <button
            onClick={() => onOpenNewLesson(undefined, undefined, undefined, activeTimetableType)}
            className="flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-[#101923] transition-all active:scale-95 shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent-primary)' }}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Сабақ қосу</span>
          </button>
        </div>

        {/* Timetable Mode Switcher Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[var(--color-border-subtle)]">
          <div className="flex items-center p-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-sec-bg)] gap-1">
            <button
              onClick={() => setActiveTimetableType('school')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTimetableType === 'school'
                  ? 'bg-[var(--color-accent-primary)] text-[#101923] shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Мектеп кестесі (Дүй–Жұм)</span>
            </button>
            <button
              onClick={() => setActiveTimetableType('tutoring')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTimetableType === 'tutoring'
                  ? 'bg-[var(--color-accent-primary)] text-[#101923] shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Кешкі репетиторлық (Дүй–Жек)</span>
            </button>
          </div>

          {/* View toggle (Spreadsheet vs Cards) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-sec-bg)] gap-1">
              <button
                onClick={() => setViewMode('spreadsheet')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'spreadsheet'
                    ? 'bg-[var(--color-card-bg)] text-[var(--color-accent-primary)] font-bold shadow-xs'
                    : 'text-[var(--color-text-secondary)]'
                }`}
                title="Spreadsheet кесте көрінісі"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Кесте парағы</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'cards'
                    ? 'bg-[var(--color-card-bg)] text-[var(--color-accent-primary)] font-bold shadow-xs'
                    : 'text-[var(--color-text-secondary)]'
                }`}
                title="Күндер бойынша карточкалар"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Күндер бойынша</span>
              </button>
            </div>
          </div>
        </div>

        {/* Week navigation bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
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

          {!isCurrentWeek && (
            <button
              onClick={goToCurrentWeek}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 hover:bg-[var(--color-accent-primary)]/20 transition-all active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Осы аптаға оралу</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN SPREADSHEET TIMETABLE VIEW (with vertical rowSpan cell merging) */}
      {viewMode === 'spreadsheet' ? (
        <div className="space-y-2">
          {/* Mobile horizontal scroll hint */}
          <div className="sm:hidden text-center text-[10px] text-[var(--color-text-muted)] flex items-center justify-center gap-1">
            <span>← Кестені толық көру үшін оңға/солға сырғытыңыз →</span>
          </div>

          {/* Spreadsheet Table Container */}
          <div className="overflow-x-auto rounded-xl border border-[#7C9E89] shadow-md bg-white">
            <table className="w-full border-collapse text-center min-w-[760px]">
              {/* Header: Sage Green with centered bold day names */}
              <thead>
                <tr className="bg-[#D6E4CF]">
                  {/* Narrow first column for period & time */}
                  <th className="border border-[#8BAA96] py-3 px-2 text-[11px] font-extrabold uppercase tracking-wider text-[#14281D] w-[110px] min-w-[110px] bg-[#D4E2CD] select-none">
                    Сабақ / Уақыт
                  </th>

                  {/* Days */}
                  {displayDays.map((day) => (
                    <th
                      key={day.isoDate}
                      className={`border border-[#8BAA96] py-3 px-2 text-center transition-colors ${
                        day.isToday ? 'bg-[#C2D8BA]' : 'bg-[#D6E4CF]'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-extrabold text-[#11261B] uppercase tracking-wide">
                        {day.dayName}
                      </div>
                      <div className="text-[10px] font-semibold text-[#2D5239] mt-0.5">
                        {day.dayNumber}{' '}
                        {day.date.toLocaleString('kk', { month: 'short' })}
                        {day.isToday && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded bg-[#11261B] text-[#D6E4CF] text-[9px] font-bold">
                            БҮГІН
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body: Periods with vertical rowSpan merge algorithm */}
              <tbody>
                {(() => {
                  // Active rowSpan tracking map: dayOfWeek -> remaining rows to skip
                  const skipCounts = new Map<number, number>();

                  return activePeriods.map((periodItem, pIndex) => {
                    // Full-width break row
                    if (periodItem.isBreak) {
                      return (
                        <tr
                          key={`break-${pIndex}`}
                          className="bg-[#DEE9D7] text-[#24422D]"
                        >
                          <td
                            colSpan={displayDays.length + 1}
                            className="py-1.5 px-3 text-center font-bold text-[11px] tracking-wider border border-[#8BAA96] bg-[#DEE9D7] text-[#24422D] select-none uppercase"
                          >
                            — {periodItem.label} —
                          </td>
                        </tr>
                      );
                    }

                    // Regular teaching period row
                    const currentPeriodNum = periodItem.period;

                    return (
                      <tr
                        key={`period-${currentPeriodNum}`}
                        className="hover:bg-[#F9FCF8] transition-colors"
                      >
                        {/* Narrow first column: Period number and time */}
                        <td className="border border-[#8BAA96] bg-[#EDF3EA] py-2.5 px-1.5 text-center select-none w-[110px] min-w-[110px] align-middle">
                          <div className="font-extrabold text-sm text-[#14281D] leading-none">
                            {currentPeriodNum}
                          </div>
                          <div className="text-[10px] font-mono text-[#3D5B46] mt-1 leading-none font-semibold">
                            {periodItem.timeRange}
                          </div>
                        </td>

                        {/* Day cells with HTML rowSpan for merged consecutive lessons */}
                        {displayDays.map((day) => {
                          const remainingSkip = skipCounts.get(day.dayOfWeek) || 0;

                          // If this cell is covered by a vertical rowSpan from a previous period, omit <td>!
                          if (remainingSkip > 0) {
                            skipCounts.set(day.dayOfWeek, remainingSkip - 1);
                            return null;
                          }

                          // Find lesson for this day that starts at currentPeriodNum
                          const dayLessons = lessonsByDay.get(day.dayOfWeek)?.lessons || [];
                          const lesson = dayLessons.find((l) => {
                            if (typeof l.startPeriod === 'number') {
                              return l.startPeriod === currentPeriodNum;
                            }
                            const inferred = inferPeriodFromTime(
                              l.startTime,
                              activeTimetableType === 'tutoring'
                            );
                            return inferred.startPeriod === currentPeriodNum;
                          });

                          if (lesson) {
                            const startP =
                              lesson.startPeriod ??
                              inferPeriodFromTime(
                                lesson.startTime,
                                activeTimetableType === 'tutoring'
                              ).startPeriod;
                            const endP =
                              lesson.endPeriod ??
                              inferPeriodFromTime(
                                lesson.endTime,
                                activeTimetableType === 'tutoring'
                              ).endPeriod;
                            const span = Math.max(1, endP - startP + 1);

                            // If this lesson spans across consecutive periods (e.g. 1-2, 3-4, 7-8),
                            // instruct future period rows to skip this day column!
                            if (span > 1) {
                              skipCounts.set(day.dayOfWeek, span - 1);
                            }

                            return (
                              <td
                                key={day.isoDate}
                                rowSpan={span}
                                onClick={() => onEditLesson(lesson)}
                                className="border border-[#8BAA96] bg-white p-2.5 text-center align-middle hover:bg-[#F2F7F0] transition-colors cursor-pointer group relative shadow-2xs"
                              >
                                <div className="flex flex-col items-center justify-center h-full min-h-[52px] space-y-0.5">
                                  {/* Lesson Name / Subject */}
                                  <div className="font-extrabold text-xs sm:text-sm text-[#112317] group-hover:text-[#1F4E30] leading-tight">
                                    {lesson.title}
                                  </div>

                                  {/* Class / Group */}
                                  {lesson.groupName && (
                                    <div className="text-xs font-bold text-[#2A4D36] leading-tight mt-0.5">
                                      {lesson.groupName}
                                    </div>
                                  )}

                                  {/* Classroom / Room */}
                                  {lesson.room && (
                                    <div className="text-[11px] font-medium text-[#4B6B57] leading-tight">
                                      {lesson.room}
                                    </div>
                                  )}

                                  {/* Merged badge indicator */}
                                  {span > 1 && (
                                    <div className="mt-1">
                                      <span className="text-[9px] font-bold text-[#20472D] bg-[#E2EEDC] px-2 py-0.5 rounded-full border border-[#8BAA96]/80 inline-block shadow-2xs">
                                        {startP}–{endP} қос сабақ
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Floating hover action buttons */}
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-white rounded border border-[#8BAA96] shadow-xs p-0.5 z-10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditLesson(lesson);
                                    }}
                                    title="Өңдеу"
                                    className="p-1 hover:text-[#1F4E30] text-[#4B6B57] transition-colors"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteScheduleItem(lesson.id);
                                    }}
                                    title="Өшіру"
                                    className="p-1 hover:text-rose-600 text-rose-400 transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                            );
                          }

                          // Empty cell: allows adding a lesson for this day and period
                          return (
                            <td
                              key={day.isoDate}
                              rowSpan={1}
                              onClick={() =>
                                onOpenNewLesson(
                                  day.dayOfWeek,
                                  day.isoDate,
                                  currentPeriodNum,
                                  activeTimetableType
                                )
                              }
                              className="border border-[#8BAA96] bg-white p-1 text-center align-middle hover:bg-[#F2F7F0] transition-colors cursor-pointer group"
                              title={`${day.dayName}, ${currentPeriodNum}-сабаққа қосу`}
                            >
                              <div className="w-full h-full min-h-[44px] flex items-center justify-center opacity-0 group-hover:opacity-100 text-[#507A5F] transition-opacity">
                                <Plus className="w-4 h-4 stroke-[2]" />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 3. CARDS VIEW (Day by Day view) */
        <div className="space-y-3">
          {/* Quick day buttons */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => {
              const entry = lessonsByDay.get(day.dayOfWeek);
              const count = entry?.lessons.length || 0;
              const isSelected = mobileSelectedDayOfWeek === day.dayOfWeek;

              return (
                <button
                  key={day.isoDate}
                  onClick={() => setMobileSelectedDayOfWeek(day.dayOfWeek)}
                  className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all ${
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

          {/* Cards for selected day */}
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
                      {dayInfo.dayName}, {dayInfo.dayNumber}{' '}
                      {dayInfo.date.toLocaleString('kk', { month: 'long' })}
                    </span>
                    {dayInfo.isToday && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-accent-primary)] text-[#101923]">
                        БҮГІН
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      onOpenNewLesson(
                        dayInfo.dayOfWeek,
                        dayInfo.isoDate,
                        undefined,
                        activeTimetableType
                      )
                    }
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
                      onClick={() =>
                        onOpenNewLesson(
                          dayInfo.dayOfWeek,
                          dayInfo.isoDate,
                          undefined,
                          activeTimetableType
                        )
                      }
                      className="text-xs font-semibold text-[var(--color-accent-primary)] hover:underline"
                    >
                      + Жаңа сабақ қосу
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {lessons.map((lesson) => {
                      const isMerged =
                        typeof lesson.startPeriod === 'number' &&
                        typeof lesson.endPeriod === 'number' &&
                        lesson.endPeriod > lesson.startPeriod;

                      return (
                        <div
                          key={lesson.id}
                          className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-sec-bg)] space-y-2 transition-all hover:border-[var(--color-accent-primary)]/40"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--color-card-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[var(--color-accent-primary)]" />
                              {lesson.startTime} — {lesson.endTime}
                            </span>
                            {isMerged && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/30">
                                {lesson.startPeriod}–{lesson.endPeriod} қос сабақ
                              </span>
                            )}
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
      )}
    </section>
  );
};
