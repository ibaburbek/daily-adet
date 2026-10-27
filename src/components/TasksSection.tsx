import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  ArrowUpDown,
  Tag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, Priority } from '../types';
import { toIsoDate, timeToMinutes } from '../utils/kazakh-date';

interface TasksSectionProps {
  onOpenNewTask: () => void;
  onEditTask: (task: Task) => void;
}

const PRIORITY_INFO: Record<Priority, { label: string; color: string; border: string; order: number }> = {
  high: { label: 'Жоғары', color: 'text-rose-400 bg-rose-500/10', border: 'border-rose-500/30', order: 1 },
  medium: { label: 'Орташа', color: 'text-amber-400 bg-amber-500/10', border: 'border-amber-500/30', order: 2 },
  low: { label: 'Төмен', color: 'text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10', border: 'border-[var(--color-accent-primary)]/30', order: 3 },
};

export const TasksSection: React.FC<TasksSectionProps> = ({
  onOpenNewTask,
  onEditTask,
}) => {
  const { tasks, toggleTask, deleteTask, selectedDateStr } = useApp();

  const [filterMode, setFilterMode] = useState<'today' | 'upcoming' | 'completed' | 'all'>('today');
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'title'>('time');

  const todayIso = toIsoDate(new Date());

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterMode === 'today') {
        return t.date === todayIso && !t.completed;
      }
      if (filterMode === 'upcoming') {
        return t.date > todayIso && !t.completed;
      }
      if (filterMode === 'completed') {
        return t.completed;
      }
      return true; // 'all'
    });
  }, [tasks, filterMode, todayIso]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (sortBy === 'priority') {
        const orderA = PRIORITY_INFO[a.priority]?.order || 2;
        const orderB = PRIORITY_INFO[b.priority]?.order || 2;
        if (orderA !== orderB) return orderA - orderB;
      }

      if (sortBy === 'time') {
        const timeA = timeToMinutes(a.dueTime || '23:59');
        const timeB = timeToMinutes(b.dueTime || '23:59');
        if (timeA !== timeB) return timeA - timeB;
      }

      return a.title.localeCompare(b.title);
    });
  }, [filteredTasks, sortBy]);

  const todayCount = tasks.filter((t) => t.date === todayIso).length;
  const todayDone = tasks.filter((t) => t.date === todayIso && t.completed).length;

  return (
    <section className="space-y-3">
      {/* Header of Section 3 */}
      <div
        className="rounded-2xl p-4 sm:p-5 border space-y-3 backdrop-blur-md transition-all"
        style={{
          backgroundColor: 'var(--glass-bg)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: 'var(--color-accent-primary)' }}
            />
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--color-text-primary)] uppercase">
              3. Тапсырмалар
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-sec-bg)] text-[var(--color-accent-primary)] border border-[var(--color-border)]">
              Бүгін: {todayDone}/{todayCount}
            </span>
          </div>

          {/* Add task button */}
          <button
            onClick={onOpenNewTask}
            className="flex items-center justify-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl text-[#101923] transition-all active:scale-95 shadow-sm shrink-0 self-start sm:self-auto"
            style={{ backgroundColor: 'var(--color-accent-primary)' }}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Тапсырма қосу</span>
          </button>
        </div>

        {/* Filters and Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--color-border-subtle)]">
          {/* Quick Filter Tabs */}
          <div
            className="flex items-center p-0.5 rounded-xl border text-xs"
            style={{
              backgroundColor: 'var(--color-sec-bg)',
              borderColor: 'var(--color-border)',
            }}
          >
            <button
              onClick={() => setFilterMode('today')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterMode === 'today'
                  ? 'bg-[var(--color-card-bg)] text-[var(--color-accent-primary)] font-bold shadow-xs'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              Бүгін
            </button>
            <button
              onClick={() => setFilterMode('upcoming')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterMode === 'upcoming'
                  ? 'bg-[var(--color-card-bg)] text-[var(--color-accent-primary)] font-bold shadow-xs'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              Келешекте
            </button>
            <button
              onClick={() => setFilterMode('completed')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterMode === 'completed'
                  ? 'bg-[var(--color-card-bg)] text-[var(--color-accent-primary)] font-bold shadow-xs'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              Орындалған
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-[var(--color-card-bg)] text-[var(--color-accent-primary)] font-bold shadow-xs'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              Барлығы
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-sec-bg)] text-xs text-[var(--color-text-primary)] outline-none"
            >
              <option value="time">Уақыт бойынша</option>
              <option value="priority">Маңыздылық бойынша</option>
              <option value="title">Атауы бойынша</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        {sortedTasks.length === 0 ? (
          <div className="py-7 text-center space-y-2 border border-dashed border-[var(--color-border-subtle)] rounded-xl">
            <CheckSquare className="w-8 h-8 mx-auto text-[var(--color-text-muted)] opacity-60" />
            <p className="text-xs text-[var(--color-text-secondary)]">
              {filterMode === 'today'
                ? 'Бүгінге орындалмаған тапсырмалар жоқ.'
                : filterMode === 'upcoming'
                ? 'Келешектегі тапсырмалар әлі жоспарланбаған.'
                : filterMode === 'completed'
                ? 'Әзірге орындалған тапсырмалар жоқ.'
                : 'Тапсырмалар тізімі бос.'}
            </p>
            <button
              onClick={onOpenNewTask}
              className="text-xs font-semibold text-[var(--color-accent-primary)] hover:underline inline-flex items-center gap-1 pt-1"
            >
              <Plus className="w-3.5 h-3.5" /> Жаңа тапсырма қосу
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTasks.map((task) => {
              const priority = PRIORITY_INFO[task.priority] || PRIORITY_INFO.medium;

              return (
                <div
                  key={task.id}
                  className={`group rounded-xl p-3 sm:p-3.5 border transition-all duration-200 backdrop-blur-md flex items-start gap-3 select-none ${
                    task.completed
                      ? 'opacity-65 bg-[var(--color-card-bg)]/50 border-[var(--color-border-subtle)]'
                      : 'hover:border-[var(--color-accent-primary)]/50 bg-[var(--color-sec-bg)]/80 border-[var(--color-border)]'
                  }`}
                >
                  {/* Subtle sage-green completion checkbox */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-transform active:scale-90 touch-manipulation"
                    aria-label={task.completed ? 'Аяқталмады деп белгілеу' : 'Орындалды деп белгілеу'}
                  >
                    {task.completed ? (
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center animate-pop"
                        style={{
                          backgroundColor: 'var(--color-accent-primary)',
                          boxShadow: '0 0 10px var(--color-accent-glow)',
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#101923] stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-[var(--color-border)] hover:border-[var(--color-accent-primary)] transition-colors flex items-center justify-center" />
                    )}
                  </button>

                  {/* Task details */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onEditTask(task)}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm font-semibold tracking-tight transition-all ${
                          task.completed
                            ? 'line-through text-[var(--color-text-muted)]'
                            : 'text-[var(--color-text-primary)]'
                        }`}
                      >
                        {task.title}
                      </h4>

                      {/* Priority tag */}
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded border ${priority.color} ${priority.border}`}
                      >
                        {priority.label}
                      </span>
                    </div>

                    {task.description && (
                      <p
                        className={`text-xs mt-1 line-clamp-2 ${
                          task.completed
                            ? 'text-[var(--color-text-muted)] line-through'
                            : 'text-[var(--color-text-secondary)]'
                        }`}
                      >
                        {task.description}
                      </p>
                    )}

                    {/* Due date & time */}
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[var(--color-accent-primary)]" />
                        {task.date === todayIso ? 'Бүгін' : task.date}
                      </span>
                      {task.dueTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[var(--color-accent-primary)]" />
                          {task.dueTime}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] transition-colors"
                      title="Өңдеу"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
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
