import { Task, Habit, ScheduleItem } from '../types';
import { toIsoDate } from './kazakh-date';
import { INITIAL_SCHOOL_LESSONS, INITIAL_TUTORING_LESSONS } from './timetable-data';

export function getInitialDemoData(): {
  tasks: Task[];
  habits: Habit[];
  schedule: ScheduleItem[];
} {
  const now = new Date();
  const today = toIsoDate(now);

  // Compute past 6 days for habit streaks
  const pastDates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    pastDates.push(toIsoDate(d));
  }

  const tasks: Task[] = [
    {
      id: 'task-1',
      title: 'Тоқсандық есепті аяқтау және тексеру',
      description: 'Негізгі көрсеткіштер мен графиктерін дайындау',
      completed: true,
      completedAt: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      date: today,
      dueTime: '11:00',
      priority: 'high',
      category: 'work',
      tags: ['Есеп', 'Қаржы'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'Жаңа өнім дизайнын үйлестіру',
      description: 'Түстер палитрасы мен батырмалардың орналасуын қайта қарау',
      completed: false,
      date: today,
      dueTime: '14:30',
      priority: 'high',
      category: 'work',
      tags: ['Дизайн', 'UI/UX'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'Ағылшын тілінен 15 жаңа сөз жаттау',
      description: 'Флеш-карталар арқылы қайталау',
      completed: false,
      date: today,
      dueTime: '17:00',
      priority: 'medium',
      category: 'study',
      tags: ['Тіл', 'Сөздік'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'Дәрумендер мен дәріхана заттарын алу',
      description: 'Кешкі серуен кезінде кіріп шығу',
      completed: false,
      date: today,
      dueTime: '19:00',
      priority: 'low',
      category: 'health',
      tags: ['Денсаулық'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-5',
      title: 'Күнделікті шығындарды жазу',
      description: 'Қаржылық қосымшаға бүгінгі түбіртектерді енгізу',
      completed: true,
      completedAt: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
      date: today,
      dueTime: '21:30',
      priority: 'low',
      category: 'finance',
      tags: ['Бюджет'],
      createdAt: new Date().toISOString(),
    },
  ];

  const habits: Habit[] = [
    {
      id: 'habit-1',
      title: 'Таңғы жаттығу (15 мин)',
      category: 'health',
      icon: 'Activity',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      completions: {
        [pastDates[0]]: true,
        [pastDates[1]]: true,
        [pastDates[2]]: true,
        [pastDates[3]]: true,
        [pastDates[4]]: true,
        [pastDates[5]]: true,
        [today]: true,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'habit-2',
      title: '2 литр таза су ішу',
      category: 'health',
      icon: 'Droplets',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      completions: {
        [pastDates[1]]: true,
        [pastDates[2]]: true,
        [pastDates[3]]: true,
        [pastDates[4]]: true,
        [pastDates[5]]: true,
        [today]: false,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'habit-3',
      title: 'Көркем әдебиет оқу (20 бет)',
      category: 'study',
      icon: 'BookOpen',
      frequency: 'daily',
      targetDaysPerWeek: 6,
      completions: {
        [pastDates[2]]: true,
        [pastDates[3]]: true,
        [pastDates[4]]: true,
        [pastDates[5]]: true,
        [today]: false,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'habit-4',
      title: 'Кешкі ой жинақтау және қорытынды',
      category: 'personal',
      icon: 'Sparkles',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      completions: {
        [pastDates[3]]: true,
        [pastDates[4]]: true,
        [pastDates[5]]: true,
        [today]: false,
      },
      createdAt: new Date().toISOString(),
    },
  ];

  const schedule: ScheduleItem[] = [
    ...INITIAL_SCHOOL_LESSONS,
    ...INITIAL_TUTORING_LESSONS,
  ];

  return { tasks, habits, schedule };
}
