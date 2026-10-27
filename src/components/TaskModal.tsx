import React, { useState, useEffect } from 'react';
import { X, Check, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Task, Priority, TaskCategory } from '../types';
import { useApp } from '../context/AppContext';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
}) => {
  const { addTask, updateTask, selectedDateStr } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(selectedDateStr);
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [tagsString, setTagsString] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setDate(taskToEdit.date);
      setDueTime(taskToEdit.dueTime || '');
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category);
      setTagsString(taskToEdit.tags ? taskToEdit.tags.join(', ') : '');
    } else {
      setTitle('');
      setDescription('');
      setDate(selectedDateStr);
      setDueTime('');
      setPriority('medium');
      setCategory('work');
      setTagsString('');
    }
    setError(null);
  }, [taskToEdit, isOpen, selectedDateStr]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Тапсырма атауын жазыңыз.');
      return;
    }

    const tags = tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        dueTime: dueTime || undefined,
        priority,
        category,
        tags: tags.length ? tags : undefined,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
        date,
        dueTime: dueTime || undefined,
        priority,
        category,
        tags: tags.length ? tags : undefined,
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
          <h3 className="text-base font-bold text-[var(--color-text-primary)]">
            {taskToEdit ? 'Тапсырманы өңдеу' : 'Жаңа тапсырма қосу'}
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
              Тапсырма атауы *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Мысалы: Баяндаманы дайындау..."
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-[var(--color-accent-primary)]"
              style={{
                backgroundColor: 'var(--color-sec-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--color-text-primary)]">
              Сипаттама (міндетті емес)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Қосымша мәліметтер..."
              className="w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-colors focus:border-[var(--color-accent-primary)] resize-none"
              style={{
                backgroundColor: 'var(--color-sec-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Date & Due Time (24h) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                Күні
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                style={{
                  backgroundColor: 'var(--color-sec-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                Мерзімі (24-сағаттық)
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                style={{
                  backgroundColor: 'var(--color-sec-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                Маңыздылық
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                style={{
                  backgroundColor: 'var(--color-sec-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <option value="high">Жоғары (High)</option>
                <option value="medium">Орташа (Medium)</option>
                <option value="low">Төмен (Low)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                Санат
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                style={{
                  backgroundColor: 'var(--color-sec-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <option value="work">Жұмыс</option>
                <option value="study">Оқу</option>
                <option value="personal">Жеке</option>
                <option value="health">Денсаулық</option>
                <option value="finance">Қаржы</option>
                <option value="other">Басқа</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--color-text-primary)]">
              Тегтер (үтір арқылы бөліңіз)
            </label>
            <input
              type="text"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              placeholder="Мысалы: Жоба, Есеп, Қаржы"
              className="w-full px-3.5 py-2 rounded-xl border text-xs outline-none"
              style={{
                backgroundColor: 'var(--color-sec-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
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
              {taskToEdit ? 'Өзгерісті сақтау' : 'Тапсырманы қосу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
