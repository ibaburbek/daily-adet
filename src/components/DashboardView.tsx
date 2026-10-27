import React, { useMemo } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getKazakhGreeting,
  formatKazakhFullDate,
  formatTime24,
  toIsoDate,
} from '../utils/kazakh-date';
import { Task, ScheduleItem, Habit } from '../types';
import { WeeklyScheduleSection } from './WeeklyScheduleSection';
import { DailyHabitsSection } from './DailyHabitsSection';
import { TasksSection } from './TasksSection';

interface DashboardViewProps {
  onOpenNewTaskModal: () => void;
  onEditTask: (task: Task) => void;
  onOpenNewScheduleModal: (
    dayOfWeek?: number,
    dateStr?: string,
    period?: number,
    timetableType?: 'school' | 'tutoring'
  ) => void;
  onEditScheduleItem: (item: ScheduleItem) => void;
  onOpenNewHabitModal: () => void;
  onEditHabit: (habit: Habit) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewTaskModal,
  onEditTask,
  onOpenNewScheduleModal,
  onEditScheduleItem,
  onOpenNewHabitModal,
  onEditHabit,
}) => {
  const { tasks, habits } = useApp();

  const now = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => toIsoDate(now), [now]);

  const greetingData = useMemo(() => getKazakhGreeting(now), [now]);
  const formattedFullDate = useMemo(() => formatKazakhFullDate(now), [now]);

  // Overall compact daily progress computation
  const todayTasks = useMemo(() => tasks.filter((t) => t.date === todayIso), [tasks, todayIso]);
  const completedTasks = useMemo(() => todayTasks.filter((t) => t.completed).length, [todayTasks]);

  const totalHabits = habits.length;
  const completedHabits = useMemo(
    () => habits.filter((h) => !!h.completions[todayIso]).length,
    [habits, todayIso]
  );

  const totalItems = todayTasks.length + totalHabits;
  const completedItems = completedTasks + completedHabits;
  const overallPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-5 py-4 space-y-6 pb-36">
      {/* 
        HEADER
        - Greeting
        - Current date
        - Compact overall daily progress
      */}
      <header
        className="rounded-2xl p-4 sm:p-5 border space-y-3 backdrop-blur-md transition-all shadow-sm"
        style={{
          backgroundColor: 'var(--glass-bg)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Greeting & Date */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
                {greetingData.greeting}
              </h1>
              <span className="text-xl">{greetingData.icon}</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-accent-secondary)] font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
              {formattedFullDate}
            </p>
          </div>

          {/* Time & Compact Daily Progress */}
          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            <div
              className="px-2.5 py-1 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5"
              style={{
                backgroundColor: 'var(--color-sec-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <Clock className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
              <span>{formatTime24()}</span>
            </div>

            {/* Compact Daily Progress Pill */}
            <div
              className="px-3 py-1.5 rounded-xl border flex items-center gap-2.5"
              style={{
                backgroundColor: 'var(--color-sec-bg)',
                borderColor: 'var(--color-border)',
              }}
            >
              {/* Mini ring */}
              <div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[var(--color-border)]"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    strokeWidth="4"
                    strokeDasharray={`${overallPercent}, 100`}
                    strokeLinecap="round"
                    stroke="var(--color-accent-primary)"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>

              <div className="text-[11px] leading-tight">
                <span className="text-[var(--color-text-muted)] block">Бүгінгі прогресс:</span>
                <span className="font-bold text-[var(--color-accent-primary)]">
                  {overallPercent}% ({completedItems}/{totalItems})
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 
        SECTION 1 — АПТАЛЫҚ САБАҚ КЕСТЕСІ (TOP PRIORITY)
        - Complete weekly calendar
        - All seven days (Monday through Sunday)
        - Every lesson visible in the selected week
        - Week navigation
        - Add lesson action
      */}
      <WeeklyScheduleSection
        onOpenNewLesson={(dayOfWeek, dateStr, period, timetableType) =>
          onOpenNewScheduleModal(dayOfWeek, dateStr, period, timetableType)
        }
        onEditLesson={(item) => onEditScheduleItem(item)}
      />

      {/* 
        SECTION 2 — КҮНДЕЛІКТІ ӘДЕТТЕР (BELOW SCHEDULE)
        - Habit checklist
        - Daily completion progress
        - Add habit action
      */}
      <DailyHabitsSection
        onOpenNewHabit={onOpenNewHabitModal}
        onEditHabit={onEditHabit}
      />

      {/* 
        SECTION 3 — ТАПСЫРМАЛАР (BELOW HABITS)
        - Today's task list
        - Completion checkboxes
        - Filters
        - Add task action
      */}
      <TasksSection
        onOpenNewTask={onOpenNewTaskModal}
        onEditTask={onEditTask}
      />
    </div>
  );
};
