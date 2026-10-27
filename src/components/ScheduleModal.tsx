import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, AlertCircle, MapPin, Users, Repeat, Layers } from 'lucide-react';
import { ScheduleItem } from '../types';
import { useApp } from '../context/AppContext';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleToEdit?: ScheduleItem | null;
  prefillDayOfWeek?: number;
  prefillDate?: string;
  prefillPeriod?: number;
  prefillTimetableType?: 'school' | 'tutoring';
}

const WEEKDAY_OPTIONS = [
  { value: 1, label: 'Дүйсенбі (Monday)' },
  { value: 2, label: 'Сейсенбі (Tuesday)' },
  { value: 3, label: 'Сәрсенбі (Wednesday)' },
  { value: 4, label: 'Бейсенбі (Thursday)' },
  { value: 5, label: 'Жұма (Friday)' },
  { value: 6, label: 'Сенбі (Saturday)' },
  { value: 7, label: 'Жексенбі (Sunday)' },
];

interface PeriodPreset {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  startPeriod: number;
  endPeriod: number;
  isMerged?: boolean;
}

const SCHOOL_PERIOD_PRESETS: PeriodPreset[] = [
  { id: 'p0', label: '0-сабақ (08:00 – 08:45)', startTime: '08:00', endTime: '08:45', startPeriod: 0, endPeriod: 0 },
  { id: 'p1', label: '1-сабақ (08:55 – 09:40)', startTime: '08:55', endTime: '09:40', startPeriod: 1, endPeriod: 1 },
  { id: 'p2', label: '2-сабақ (09:50 – 10:35)', startTime: '09:50', endTime: '10:35', startPeriod: 2, endPeriod: 2 },
  { id: 'p1-2', label: '1–2 сабақ [Қос сабақ / Merged] (08:55 – 10:35)', startTime: '08:55', endTime: '10:35', startPeriod: 1, endPeriod: 2, isMerged: true },
  { id: 'p3', label: '3-сабақ (10:55 – 11:40)', startTime: '10:55', endTime: '11:40', startPeriod: 3, endPeriod: 3 },
  { id: 'p4', label: '4-сабақ (11:50 – 12:35)', startTime: '11:50', endTime: '12:35', startPeriod: 4, endPeriod: 4 },
  { id: 'p3-4', label: '3–4 сабақ [Қос сабақ / Merged] (10:55 – 12:35)', startTime: '10:55', endTime: '12:35', startPeriod: 3, endPeriod: 4, isMerged: true },
  { id: 'p5', label: '5-сабақ (13:25 – 14:10)', startTime: '13:25', endTime: '14:10', startPeriod: 5, endPeriod: 5 },
  { id: 'p6', label: '6-сабақ (14:20 – 15:05)', startTime: '14:20', endTime: '15:05', startPeriod: 6, endPeriod: 6 },
  { id: 'p5-6', label: '5–6 сабақ [Қос сабақ / Merged] (13:25 – 15:05)', startTime: '13:25', endTime: '15:05', startPeriod: 5, endPeriod: 6, isMerged: true },
  { id: 'p7', label: '7-сабақ (15:20 – 16:05)', startTime: '15:20', endTime: '16:05', startPeriod: 7, endPeriod: 7 },
  { id: 'p8', label: '8-сабақ (16:15 – 17:00)', startTime: '16:15', endTime: '17:00', startPeriod: 8, endPeriod: 8 },
  { id: 'p7-8', label: '7–8 сабақ [Қос сабақ / Merged] (15:20 – 17:00)', startTime: '15:20', endTime: '17:00', startPeriod: 7, endPeriod: 8, isMerged: true },
];

const TUTORING_PERIOD_PRESETS: PeriodPreset[] = [
  { id: 't1', label: '1-пара (17:15 – 18:00)', startTime: '17:15', endTime: '18:00', startPeriod: 1, endPeriod: 1 },
  { id: 't2', label: '2-пара (18:10 – 18:55)', startTime: '18:10', endTime: '18:55', startPeriod: 2, endPeriod: 2 },
  { id: 't1-2', label: '1–2 қос пара [Merged] (17:15 – 18:55)', startTime: '17:15', endTime: '18:55', startPeriod: 1, endPeriod: 2, isMerged: true },
  { id: 't3', label: '3-пара (19:05 – 19:50)', startTime: '19:05', endTime: '19:50', startPeriod: 3, endPeriod: 3 },
  { id: 't2-3', label: '2–3 қос пара [Merged] (18:10 – 19:50)', startTime: '18:10', endTime: '19:50', startPeriod: 2, endPeriod: 3, isMerged: true },
  { id: 't4', label: '4-пара (20:00 – 20:45)', startTime: '20:00', endTime: '20:45', startPeriod: 4, endPeriod: 4 },
  { id: 't5', label: '5-пара (20:55 – 21:40)', startTime: '20:55', endTime: '21:40', startPeriod: 5, endPeriod: 5 },
  { id: 't4-5', label: '4–5 қос пара [Merged] (20:00 – 21:40)', startTime: '20:00', endTime: '21:40', startPeriod: 4, endPeriod: 5, isMerged: true },
];

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  scheduleToEdit,
  prefillDayOfWeek,
  prefillDate,
  prefillPeriod,
  prefillTimetableType,
}) => {
  const { addScheduleItem, updateScheduleItem, selectedDateStr } = useApp();

  const [timetableType, setTimetableType] = useState<'school' | 'tutoring'>('school');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('p1');
  const [startPeriod, setStartPeriod] = useState<number | undefined>(1);
  const [endPeriod, setEndPeriod] = useState<number | undefined>(1);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(prefillDate || selectedDateStr);
  const [startTime, setStartTime] = useState('08:55');
  const [endTime, setEndTime] = useState('09:40');
  const [category, setCategory] = useState('lecture');
  const [notes, setNotes] = useState('');
  const [room, setRoom] = useState('');
  const [groupName, setGroupName] = useState('');
  const [recurringWeekly, setRecurringWeekly] = useState(true);
  const [dayOfWeek, setDayOfWeek] = useState(prefillDayOfWeek || 1);
  const [error, setError] = useState<string | null>(null);

  // Sync state when modal opens or props change
  useEffect(() => {
    if (!isOpen) return;

    if (scheduleToEdit) {
      const type = scheduleToEdit.timetableType || (scheduleToEdit.category === 'tutoring' ? 'tutoring' : 'school');
      setTimetableType(type);
      setTitle(scheduleToEdit.title);
      setDate(scheduleToEdit.date);
      setStartTime(scheduleToEdit.startTime);
      setEndTime(scheduleToEdit.endTime);
      setCategory(scheduleToEdit.category || (type === 'tutoring' ? 'tutoring' : 'lecture'));
      setNotes(scheduleToEdit.notes || '');
      setRoom(scheduleToEdit.room || '');
      setGroupName(scheduleToEdit.groupName || '');
      setRecurringWeekly(scheduleToEdit.recurringWeekly !== false);
      setStartPeriod(scheduleToEdit.startPeriod);
      setEndPeriod(scheduleToEdit.endPeriod ?? scheduleToEdit.startPeriod);

      // Match preset if possible
      const presets = type === 'school' ? SCHOOL_PERIOD_PRESETS : TUTORING_PERIOD_PRESETS;
      const matched = presets.find(
        (p) =>
          p.startPeriod === scheduleToEdit.startPeriod &&
          p.endPeriod === (scheduleToEdit.endPeriod ?? scheduleToEdit.startPeriod)
      );
      setSelectedPresetId(matched ? matched.id : 'custom');

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
      // New item creation
      const type = prefillTimetableType || 'school';
      setTimetableType(type);
      setTitle('');
      setDate(prefillDate || selectedDateStr);
      setCategory(type === 'tutoring' ? 'tutoring' : 'lecture');
      setNotes('');
      setRoom('');
      setGroupName('');
      setRecurringWeekly(true);

      const presets = type === 'school' ? SCHOOL_PERIOD_PRESETS : TUTORING_PERIOD_PRESETS;
      let targetPreset: PeriodPreset | undefined;

      if (typeof prefillPeriod === 'number') {
        targetPreset = presets.find((p) => p.startPeriod === prefillPeriod && p.startPeriod === p.endPeriod);
      }
      if (!targetPreset) {
        targetPreset = presets[0];
      }

      setSelectedPresetId(targetPreset.id);
      setStartPeriod(targetPreset.startPeriod);
      setEndPeriod(targetPreset.endPeriod);
      setStartTime(targetPreset.startTime);
      setEndTime(targetPreset.endTime);

      if (prefillDayOfWeek) {
        setDayOfWeek(prefillDayOfWeek);
      } else {
        const d = new Date(prefillDate || selectedDateStr);
        const jsDay = d.getDay();
        setDayOfWeek(jsDay === 0 ? 7 : jsDay);
      }
    }
    setError(null);
  }, [isOpen, scheduleToEdit, prefillDayOfWeek, prefillDate, prefillPeriod, prefillTimetableType, selectedDateStr]);

  if (!isOpen) return null;

  // Change timetable type
  const handleTypeChange = (type: 'school' | 'tutoring') => {
    setTimetableType(type);
    const presets = type === 'school' ? SCHOOL_PERIOD_PRESETS : TUTORING_PERIOD_PRESETS;
    const defaultPreset = presets[0];
    setSelectedPresetId(defaultPreset.id);
    setStartPeriod(defaultPreset.startPeriod);
    setEndPeriod(defaultPreset.endPeriod);
    setStartTime(defaultPreset.startTime);
    setEndTime(defaultPreset.endTime);
    if (!scheduleToEdit) {
      setCategory(type === 'tutoring' ? 'tutoring' : 'lecture');
    }
  };

  // Change period preset
  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId === 'custom') {
      return;
    }
    const presets = timetableType === 'school' ? SCHOOL_PERIOD_PRESETS : TUTORING_PERIOD_PRESETS;
    const found = presets.find((p) => p.id === presetId);
    if (found) {
      setStartPeriod(found.startPeriod);
      setEndPeriod(found.endPeriod);
      setStartTime(found.startTime);
      setEndTime(found.endTime);
    }
  };

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

    const payload: Omit<ScheduleItem, 'id'> = {
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
      startPeriod,
      endPeriod: endPeriod ?? startPeriod,
      timetableType,
      completed: false,
    };

    if (scheduleToEdit) {
      updateScheduleItem(scheduleToEdit.id, payload);
    } else {
      addScheduleItem(payload);
    }

    onClose();
  };

  const currentPresets = timetableType === 'school' ? SCHOOL_PERIOD_PRESETS : TUTORING_PERIOD_PRESETS;

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
              {scheduleToEdit ? 'Сабақты өңдеу' : 'Жаңа сабақ қосу'}
            </h3>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Апталық кестеге сабақ енгізу және біріктіру (rowSpan)
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Timetable Type Switcher */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
              Кесте түрі (Timetable Type)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('school')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  timetableType === 'school'
                    ? 'bg-[var(--color-accent-primary)] text-[#101923] border-[var(--color-accent-primary)] shadow-sm'
                    : 'bg-[var(--color-sec-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/40'
                }`}
              >
                🏫 Мектеп кестесі (0–8 сабақ)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('tutoring')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  timetableType === 'tutoring'
                    ? 'bg-[var(--color-accent-primary)] text-[#101923] border-[var(--color-accent-primary)] shadow-sm'
                    : 'bg-[var(--color-sec-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/40'
                }`}
              >
                🌙 Репетиторлық (1–5 пара)
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--color-text-primary)]">
              Сабақ немесе пән атауы *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Мысалы: Math, CS, Algebra, Geometry..."
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-[var(--color-accent-primary)]"
              style={{
                backgroundColor: 'var(--color-sec-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              autoFocus
            />
          </div>

          {/* Period Selection (Preset with merged support) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                Сабақ уақыты мен парасы (Период)
              </label>
              <span className="text-[10px] text-[var(--color-accent-primary)] font-medium">
                Қос сабақтар тігінен бірігеді
              </span>
            </div>
            <select
              value={selectedPresetId}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-xs font-medium outline-none"
              style={{
                backgroundColor: 'var(--color-sec-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <optgroup label="Стандартты сабақтар мен қос сабақтар (Merged)">
                {currentPresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.isMerged ? '⚡ ' : ''}{preset.label}
                  </option>
                ))}
              </optgroup>
              <option value="custom">⚙️ Басқа еркін уақыт (Custom time)</option>
            </select>
          </div>

          {/* Manual start/end time if custom or fine-tuning */}
          {selectedPresetId === 'custom' && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-sec-bg)]/50">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
                  Басталуы
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs outline-none bg-[var(--color-sec-bg)] border-[var(--color-border)] text-[var(--color-text-primary)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
                  Аяқталуы
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs outline-none bg-[var(--color-sec-bg)] border-[var(--color-border)] text-[var(--color-text-primary)]"
                />
              </div>
            </div>
          )}

          {/* Group and Classroom */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                Сынып / Топ / Оқушы
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="10C, 10 A/B/C, Idil, 5..."
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
                Кабинет / Аудитория
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="B9, Comp Lab, B10, Zoom..."
                className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                style={{
                  backgroundColor: 'var(--color-sec-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
          </div>

          {/* Weekday & Category */}
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
                Сабақ түрі / Формат
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
                <option value="practice">Практика (Practice)</option>
                <option value="lab">Зертхана (Lab)</option>
                <option value="tutoring">Жеке сабақ / Репетитор</option>
                <option value="seminar">Семинар</option>
                <option value="work">Мәжіліс / Жұмыс</option>
                <option value="other">Басқа</option>
              </select>
            </div>
          </div>

          {/* Recurring weekly toggle */}
          <label
            className="flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none"
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
                Кестеде аптаның осы күні тұрақты түрде көрсетіледі
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
              placeholder="Тақырып, сілтеме немесе қосымша ақпарат..."
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
              {scheduleToEdit ? 'Өзгерісті сақтау' : 'Сабақты кестеге қосу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
