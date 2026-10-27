import { ScheduleItem } from '../types';

export const KAZAKH_WEEKDAYS = [
  'Жексенбі',
  'Дүйсенбі',
  'Сейсенбі',
  'Сәрсенбі',
  'Бейсенбі',
  'Жұма',
  'Сенбі',
];

export const KAZAKH_WEEKDAYS_SHORT = [
  'Жек',
  'Дүй',
  'Сей',
  'Сәр',
  'Бей',
  'Жұм',
  'Сен',
];

export const KAZAKH_MONTHS = [
  'қаңтар',
  'ақпан',
  'наурыз',
  'сәуір',
  'мамыр',
  'маусым',
  'шілде',
  'тамыз',
  'қыркүйек',
  'қазан',
  'қараша',
  'желтоқсан',
];

export function getKazakhGreeting(date = new Date()): { greeting: string; icon: string } {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) {
    return { greeting: 'Қайырлы таң', icon: '☀️' };
  } else if (hour >= 12 && hour < 18) {
    return { greeting: 'Қайырлы күн', icon: '🌤️' };
  } else if (hour >= 18 && hour < 23) {
    return { greeting: 'Қайырлы кеш', icon: '🌙' };
  } else {
    return { greeting: 'Қайырлы түн', icon: '✨' };
  }
}

export function formatKazakhFullDate(date: Date): string {
  const dayName = KAZAKH_WEEKDAYS[date.getDay()];
  const day = date.getDate();
  const monthName = KAZAKH_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${day} ${monthName} ${year} ж.`;
}

export function formatKazakhShortDate(date: Date): string {
  const day = date.getDate();
  const monthName = KAZAKH_MONTHS[date.getMonth()];
  return `${day} ${monthName}`;
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(isoString: string): Date {
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatTime24(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export interface CurrentScheduleStatus {
  status: 'active' | 'upcoming' | 'none';
  item?: ScheduleItem;
  message: string;
  badge: string;
  progressPercent?: number;
}

export function getScheduleActivityStatus(
  scheduleItems: ScheduleItem[],
  targetDateStr: string,
  now = new Date()
): CurrentScheduleStatus {
  const todayIso = toIsoDate(now);
  if (targetDateStr !== todayIso) {
    return {
      status: 'none',
      message: 'Таңдалған күн үшін кестені қараңыз',
      badge: 'Кесте',
    };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayItems = scheduleItems
    .filter((item) => item.date === todayIso)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  if (todayItems.length === 0) {
    return {
      status: 'none',
      message: 'Бүгінге жоспарланған кестелік әрекеттер жоқ',
      badge: 'Бос уақыт',
    };
  }

  // Check for currently active item
  for (const item of todayItems) {
    const start = timeToMinutes(item.startTime);
    const end = timeToMinutes(item.endTime);
    if (currentMinutes >= start && currentMinutes < end) {
      const remainingMinutes = end - currentMinutes;
      const totalDuration = Math.max(1, end - start);
      const elapsed = currentMinutes - start;
      const progressPercent = Math.min(100, Math.round((elapsed / totalDuration) * 100));

      return {
        status: 'active',
        item,
        message: `Аяқталуына ${remainingMinutes} мин қалды`,
        badge: 'Қазір өтіп жатыр',
        progressPercent,
      };
    }
  }

  // Check for next upcoming item today
  const upcomingItem = todayItems.find(
    (item) => timeToMinutes(item.startTime) > currentMinutes
  );

  if (upcomingItem) {
    const start = timeToMinutes(upcomingItem.startTime);
    const diff = start - currentMinutes;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    const timeText = hours > 0 ? `${hours} сағ ${mins} мин` : `${mins} мин`;

    return {
      status: 'upcoming',
      item: upcomingItem,
      message: `${upcomingItem.startTime}-де басталады (${timeText} қалды)`,
      badge: 'Келесі жоспар',
    };
  }

  return {
    status: 'none',
    message: 'Бүгінгі барлық кестелік әрекеттер аяқталды',
    badge: 'Аяқталды ✨',
  };
}

export function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export interface WeekDayInfo {
  date: Date;
  isoDate: string;
  dayName: string; // e.g. "Дүйсенбі"
  dayShort: string; // e.g. "Дүй"
  dayNumber: number; // e.g. 26
  dayOfWeek: number; // 1 = Monday ... 7 = Sunday
  isToday: boolean;
}

export function getWeekDays(anchorDate: Date): WeekDayInfo[] {
  const monday = getMondayOfWeek(anchorDate);
  const todayIso = toIsoDate(new Date());
  const days: WeekDayInfo[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dayOfWeek = i + 1; // 1=Mon, 2=Tue, ..., 7=Sun
    const isoDate = toIsoDate(d);

    // KAZAKH_WEEKDAYS: 0=Sun, 1=Mon, 2=Tue...
    const jsDay = d.getDay();
    const dayName = KAZAKH_WEEKDAYS[jsDay];
    const dayShort = KAZAKH_WEEKDAYS_SHORT[jsDay];

    days.push({
      date: d,
      isoDate,
      dayName,
      dayShort,
      dayNumber: d.getDate(),
      dayOfWeek,
      isToday: isoDate === todayIso,
    });
  }

  return days;
}

export function formatWeekRangeKk(mondayDate: Date): string {
  const sundayDate = new Date(mondayDate);
  sundayDate.setDate(mondayDate.getDate() + 6);

  const startDay = mondayDate.getDate();
  const startMonth = KAZAKH_MONTHS[mondayDate.getMonth()];
  const endDay = sundayDate.getDate();
  const endMonth = KAZAKH_MONTHS[sundayDate.getMonth()];
  const year = sundayDate.getFullYear();

  if (mondayDate.getMonth() === sundayDate.getMonth()) {
    return `${startDay} — ${endDay} ${endMonth} ${year} ж.`;
  }
  return `${startDay} ${startMonth} — ${endDay} ${endMonth} ${year} ж.`;
}

export function getScheduleItemsForDay(schedule: ScheduleItem[], targetDate: Date): ScheduleItem[] {
  const targetIso = toIsoDate(targetDate);
  const jsDay = targetDate.getDay();
  const dayOfWeekNumber = jsDay === 0 ? 7 : jsDay; // 1=Mon ... 7=Sun

  const matches = schedule.filter((item) => {
    // 1. Exact date match
    if (item.date === targetIso) {
      return true;
    }
    // 2. Weekly recurring match
    if (item.recurringWeekly) {
      if (typeof item.dayOfWeek === 'number') {
        const itemDay = item.dayOfWeek === 0 ? 7 : item.dayOfWeek;
        return itemDay === dayOfWeekNumber;
      }
    }
    return false;
  });

  // Sort chronologically by start time
  return matches.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
}

