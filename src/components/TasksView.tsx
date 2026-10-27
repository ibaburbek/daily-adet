import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  Clock,
  Calendar,
  AlertCircle,
  Tag,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, Priority, TaskCategory } from '../types';
import { formatKazakhShortDate } from '../utils/kazakh-date';

interface TasksViewProps {
  onOpenNewTaskModal: () => void;
  onEditTask: (task: Task) => void;
}

const CATEGORY_MAP: Record<TaskCategory, string> = {
  work: 'Жұмыс',
  study: 'Оқу',
  personal: 'Жеке',
  health: 'Денсаулық',
  finance: 'Қаржы',
  other: 'Басқа',
};

const PRIORITY_MAP: Record<Priority, { label: string; color: string; border: string }> = {
  high: { label: 'Жоғары', color: 'text-rose-400 bg-rose-500/10', border: 'border-rose-500/30' },
  medium: { label: 'Орташа', color: 'text-amber-400 bg-amber-500/10', border: 'border-amber-500/30' },
  low: { label: 'Төмен', color: 'text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10', border: 'border-[var(--color-accent-primary)]/30' },
};

export const TasksView: React.FC<TasksViewProps> = ({
  onOpenNewTaskModal,
  onEditTask,
}) => {
  const { tasks, toggleTask, deleteTask, selectedDateStr } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dateScope, setDateScope] = useState<'selected' | 'all'>('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Date filter
      if (dateScope === 'selected' && task.date !== selectedDateStr) {
        return false;
      }

      // Status filter
      if (statusFilter === 'pending' && task.completed) return false;
      if (statusFilter === 'completed' && !task.completed) return false;

      // Category filter
      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        const matchesTags = task.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTags) return false;
      }

      return true;
    });
  }, [tasks, dateScope, selectedDateStr, statusFilter, categoryFilter, priorityFilter, searchQuery]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Тапсырмалар
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-accent-secondary)] mt-0.5">
            Барлық мақсаттарыңыз бен істер тізімі ({filteredTasks.length})
          </p>
        </div>

        <button
          onClick={onOpenNewTaskModal}
          className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl text-[#101923] shadow-sm active:scale-95 transition-all"
          style={{ backgroundColor: 'var(--color-accent-primary)' }}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Тапсырма қосу</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div
        className="rounded-2xl p-4 border space-y-3 backdrop-blur-md"
        style={{
          backgroundColor: 'var(--glass-bg)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Тапсырма атауы немесе тег бойынша іздеу..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border transition-colors outline-none focus:border-[var(--color-accent-primary)]"
            style={{
              backgroundColor: 'var(--color-sec-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Date scope */}
          <div
            className="flex items-center p-0.5 rounded-lg border text-xs"
            style={{
              backgroundColor: 'var(--color-sec-bg)',
              borderColor: 'var(--color-border)',
            }}
          >
            <button
              onClick={() => setDateScope('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                dateScope === 'all'
                  ? 'bg-[var(--color-card-bg)] text-[var(--color-accent-primary)] font-semibold'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              Барлық мерзім
            </button>
            <button
              onClick={() => setDateScope('selected')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                dateScope === 'selected'
                  ? 'bg-[var(--color-card-bg)] text-[var(--color-accent-primary)] font-semibold'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              Таңдалған күн
            </button>
          </div>

          {/* Status filter */}
          <div
            className="flex items-center p-0.5 rounded-lg border text-xs"
            style={{
              backgroundColor: 'var(--color-sec-bg)',
              borderColor: 'var(--color-border)',
            }}
          >
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-1 rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-[var(--color-card-bg)] text-[var(--color-accent-primary)] font-semibold'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              Барлығы
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2 py-1 rounded-md transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-[var(--color-card-bg)] text-[var(--color-accent-primary)] font-semibold'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              Аяқталмаған
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2 py-1 rounded-md transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-[var(--color-card-bg)] text-[var(--color-accent-primary)] font-semibold'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              Аяқталған
            </button>
          </div>

          {/* Category Select */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border text-xs font-medium outline-none"
            style={{
              backgroundColor: 'var(--color-sec-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="all">Санат: Барлығы</option>
            {Object.entries(CATEGORY_MAP).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center border space-y-3 backdrop-blur-md"
          style={{
            backgroundColor: 'var(--glass-bg)',
            borderColor: 'var(--color-border)',
          }}
        >
          <AlertCircle className="w-10 h-10 mx-auto text-[var(--color-text-muted)] opacity-60" />
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
            Сәйкес тапсырмалар табылмады
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Сүзгіні өзгертіңіз немесе жаңа тапсырма қосыңыз.
          </p>
          <button
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-[#101923] shadow-sm active:scale-95"
            style={{ backgroundColor: 'var(--color-accent-primary)' }}
          >
            <Plus className="w-4 h-4" /> Жаңа тапсырма
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const priorityInfo = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;

            return (
              <div
                key={task.id}
                className={`group rounded-2xl p-4 border transition-all duration-200 backdrop-blur-md flex items-start gap-3.5 ${
                  task.completed
                    ? 'opacity-65 bg-[var(--color-card-bg)]/50 border-[var(--color-border-subtle)]'
                    : 'bg-[var(--glass-bg)] border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/50'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-transform active:scale-90"
                  aria-label={task.completed ? 'Аяқталмаған ету' : 'Орындалды деп белгілеу'}
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
                    <div className="w-5 h-5 rounded-md border-2 border-[var(--color-border)] hover:border-[var(--color-accent-primary)] transition-colors" />
                  )}
                </button>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={`text-sm sm:text-base font-bold tracking-tight cursor-pointer ${
                        task.completed
                          ? 'line-through text-[var(--color-text-muted)]'
                          : 'text-[var(--color-text-primary)] hover:text-[var(--color-accent-primary)]'
                      }`}
                      onClick={() => onEditTask(task)}
                    >
                      {task.title}
                    </h3>

                    {/* Priority */}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${priorityInfo.color} ${priorityInfo.border}`}
                    >
                      {priorityInfo.label}
                    </span>

                    {/* Category */}
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[var(--color-sec-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]">
                      {CATEGORY_MAP[task.category] || task.category}
                    </span>
                  </div>

                  {task.description && (
                    <p
                      className={`text-xs mt-1.5 ${
                        task.completed
                          ? 'text-[var(--color-text-muted)] line-through'
                          : 'text-[var(--color-text-secondary)]'
                      }`}
                    >
                      {task.description}
                    </p>
                  )}

                  {/* Date & Time badge */}
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                      {task.date}
                    </span>
                    {task.dueTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                        {task.dueTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit & Delete actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEditTask(task)}
                    className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] hover:border-[var(--color-accent-primary)] transition-colors active:scale-90"
                    title="Өңдеу"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-rose-400 hover:border-rose-500/40 transition-colors active:scale-90"
                    title="Өшіру"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
