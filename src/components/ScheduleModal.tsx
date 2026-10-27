import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, AlertCircle, MapPin, Users, Repeat } from 'lucide-react';
import { ScheduleItem } from '../types';
import { useApp } from '../context/AppContext';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleToEdit?: ScheduleItem | null;
  prefillDayOfWeek?: number;
  prefillDate?: string;
}

const WEEKDAY_OPTIONS = [
  { value: 1, label: 'Дүйсенбі' },
  { value: 2, label: 'Сейсенбі' },
  { value: 3, label: 'Сәрсенбі' },
  { value: 4, label: 'Бейсенбі' },
  { value: 5, label: 'Жұма' },
  { value: 6, label: 'Сенбі' },
  { value: 7, label: 'Жексенбі' },
];

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  scheduleToEdit,
  prefillDayOfWeek,
  prefillDate,
}) => {
  const { addScheduleItem, updateScheduleItem, selectedDateStr } = useApp();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(prefillDate || selectedDateStr);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:20');
  const [category, setCategory] = useState('lecture');
  const [notes, setNotes] = useState('');
  const [room, setRoom] = useState('');
  const [groupName, setGroupName] = useState('');
  const [recurringWeekly, setRecurringWeekly] = useState(true);
  const [dayOfWeek, setDayOfWeek] = useState(prefillDayOfWeek || 1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (scheduleToEdit) {
      setTitle(scheduleToEdit.title);
      setDate(scheduleToEdit.date);
      setStartTime(scheduleToEdit.startTime);
      setEndTime(scheduleToEdit.endTime);
      setCategory(scheduleToEdit.category || 'lecture');
      setNotes(scheduleToEdit.notes || '');
      setRoom(scheduleToEdit.room || '');
      setGroupName(scheduleToEdit.groupName || '');
      setRecurringWeekly(scheduleToEdit.recurringWeekly !== false);

      if (typeof scheduleToEdit.dayOfWeek === 'number') {
        setDayOfWeek(scheduleToEdit.dayOfWeek);
      } else if (scheduleToEdit.date) {
        const d = new Date(scheduleToEdit.date);
        const jsDay = d.getDay();
        setDayOfWeek(jsDay === 0 ? 7 : jsDay);
      } else {
        setDayOfWeek(1);
      }
    } else {
      setTitle('');
      setDate(prefillDate || selectedDateStr);
      setStartTime('09:00');
      setEndTime('10:20');
      setCategory('lecture');
      setNotes('');
      setRoom('');
      setGroupName('');
      setRecurringWeekly(true);

      if (prefillDayOfWeek) {
        setDayOfWeek(prefillDayOfWeek);
      } else {
        const d = new Date(prefillDate || selectedDateStr);
        const jsDay = d.getDay();
        setDayOfWeek(jsDay === 0 ? 7 : jsDay);
      }
    }
    setError(null);
  }, [scheduleToEdit, isOpen, selectedDateStr, prefillDayOfWeek, prefillDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Сабақ немесе әрекет атауын жазыңыз.');
      return;
    }

    if (startTime >= endTime) {
      setError('Аяқталу уақыты басталу уақытынан кеш болуы керек.');
      return;
    }

    if (scheduleToEdit) {
      updateScheduleItem(scheduleToEdit.id, {
        title: title.trim(),
        date,
        startTime,
        endTime,
        category,
        notes: notes.trim() || undefined,
        room: room.trim() || undefined,
        groupName: groupName.trim() || undefined,
        recurringWeekly,
        dayOfWeek,
      });
    } else {
      addScheduleItem({
        title: title.trim(),
        date,
        startTime,
        endTime,
        category,
        notes: notes.trim() || undefined,
        room: room.trim() || undefined,
        groupName: groupName.trim() || undefined,
        recurringWeekly,
        dayOfWeek,
        completed: false,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-pop my-auto"
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
          <div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              {scheduleToEdit ? 'Сабақ / Кестені өңдеу' : 'Жаңа сабақ қосу'}
            </h3>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Апталық сабақ кестесіне енгізу
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--color-text-primary)]">
              Сабақ немесе әрекет атауы *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Мысалы: Математикалық талдау, Python негіздері..."
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-[var(--color-accent-primary)]"
              style={{
                backgroundColor: 'var(--color-sec-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              autoFocus
            />
          </div>

          {/* Group and Classroom */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                Топ / Сынып
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="ИТ-21, 10-сынып..."
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
                <MapPin className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                Аудитория / Орны
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="304 ауд., Zoom..."
                className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                style={{
                  backgroundColor: 'var(--color-sec-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
          </div>

          {/* Weekday & Recurring */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                Апта күні
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                style={{
                  backgroundColor: 'var(--color-sec-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {WEEKDAY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                Сабақ түрі / Санат
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
                <option value="lecture">Дәріс (Lecture)</option>
                <option value="seminar">Семинар (Seminar)</option>
                <option value="practice">Практика (Practice)</option>
                <option value="lab">Зертхана (Laboratory)</option>
                <option value="tutoring">Жеке сабақ (Tutoring)</option>
                <option value="work">Жұмыс / Мәжіліс</option>
                <option value="other">Басқа</option>
              </select>
            </div>
          </div>

          {/* Start and End Time (24h) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                Басталуы (24h)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
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
                Аяқталуы (24h)
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                style={{
                  backgroundColor: 'var(--color-sec-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
          </div>

          {/* Recurring weekly toggle */}
          <label className="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none"
            style={{
              backgroundColor: 'var(--color-sec-bg)',
              borderColor: 'var(--color-border)',
            }}
          >
            <input
              type="checkbox"
              checked={recurringWeekly}
              onChange={(e) => setRecurringWeekly(e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--color-accent-primary)]"
            />
            <div className="text-xs">
              <span className="font-semibold text-[var(--color-text-primary)] flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                Апта сайын қайталанады
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] block">
                Бұл сабақ әр аптаның таңдалған күнінде автоматты көрсетіледі
              </span>
            </div>
          </label>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--color-text-primary)]">
              Ескертпелер (міндетті емес)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Тақырып, сілтеме немесе тапсырма..."
              className="w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-colors focus:border-[var(--color-accent-primary)] resize-none"
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
              {scheduleToEdit ? 'Өзгерісті сақтау' : 'Сабақты қосу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
