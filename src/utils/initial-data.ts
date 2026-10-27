import { Task, Habit, ScheduleItem } from '../types';
import { toIsoDate } from './kazakh-date';

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

  // Calculate dates for Monday through Sunday of current week
  const monday = new Date(now);
  const currentDay = monday.getDay();
  const diffToMonday = monday.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  monday.setDate(diffToMonday);

  const getWeekDayIso = (offset: number) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + offset);
    return toIsoDate(d);
  };

  const schedule: ScheduleItem[] = [
    // Дүйсенбі (Monday - 1)
    {
      id: 'sch-mon-1',
      title: 'Математикалық талдау (Дәріс)',
      date: getWeekDayIso(0),
      dayOfWeek: 1,
      recurringWeekly: true,
      startTime: '09:00',
      endTime: '10:20',
      category: 'lecture',
      room: '304 ауд.',
      groupName: 'ИТ-21 тобы',
      notes: '1-модуль: Туынды және интегралдар',
      completed: true,
    },
    {
      id: 'sch-mon-2',
      title: 'Алгоритмдер мен деректер құрылымы',
      date: getWeekDayIso(0),
      dayOfWeek: 1,
      recurringWeekly: true,
      startTime: '10:40',
      endTime: '12:00',
      category: 'practice',
      room: '215 ауд.',
      groupName: 'ИТ-21 тобы',
      notes: 'Сұрыптау алгоритмдерін талдау',
      completed: true,
    },
    {
      id: 'sch-mon-3',
      title: 'Жеке оқушымен кеңес беру',
      date: getWeekDayIso(0),
      dayOfWeek: 1,
      recurringWeekly: true,
      startTime: '14:00',
      endTime: '15:20',
      category: 'tutoring',
      room: 'Zoom онлайн',
      groupName: 'Айдос С.',
      notes: 'Күрделі есептерді талдау',
      completed: false,
    },

    // Сейсенбі (Tuesday - 2)
    {
      id: 'sch-tue-1',
      title: 'Python бағдарламалау тілі',
      date: getWeekDayIso(1),
      dayOfWeek: 2,
      recurringWeekly: true,
      startTime: '10:00',
      endTime: '11:20',
      category: 'lecture',
      room: '401 ауд.',
      groupName: 'CS-101',
      notes: 'OOP негіздері мен кластар',
      completed: false,
    },
    {
      id: 'sch-tue-2',
      title: 'Python зертханалық жұмысы',
      date: getWeekDayIso(1),
      dayOfWeek: 2,
      recurringWeekly: true,
      startTime: '11:40',
      endTime: '13:00',
      category: 'lab',
      room: '108 комп. сынып',
      groupName: 'CS-101',
      notes: 'Зертханалық №4 тексеру',
      completed: false,
    },
    {
      id: 'sch-tue-3',
      title: 'Олимпиадаға дайындық үйірмесі',
      date: getWeekDayIso(1),
      dayOfWeek: 2,
      recurringWeekly: true,
      startTime: '15:00',
      endTime: '16:30',
      category: 'seminar',
      room: '202 ауд.',
      groupName: 'Жас ғалымдар',
      notes: 'Динамикалық бағдарламалау',
      completed: false,
    },

    // Сәрсенбі (Wednesday - 3)
    {
      id: 'sch-wed-1',
      title: 'Деректер қоры және SQL',
      date: getWeekDayIso(2),
      dayOfWeek: 3,
      recurringWeekly: true,
      startTime: '09:00',
      endTime: '10:20',
      category: 'lecture',
      room: '302 ауд.',
      groupName: 'ИТ-22',
      notes: 'Реляциялық модель және JOIN сұраныстары',
      completed: false,
    },
    {
      id: 'sch-wed-2',
      title: 'Ғылыми жетекшілік және кеңес',
      date: getWeekDayIso(2),
      dayOfWeek: 3,
      recurringWeekly: true,
      startTime: '11:00',
      endTime: '12:30',
      category: 'seminar',
      room: '312 кабинет',
      groupName: 'Дипломшылар',
      notes: 'Жоба құрылымын бекіту',
      completed: false,
    },
    {
      id: 'sch-wed-3',
      title: 'Веб-әзірлеу негіздері (Frontend)',
      date: getWeekDayIso(2),
      dayOfWeek: 3,
      recurringWeekly: true,
      startTime: '14:00',
      endTime: '15:20',
      category: 'practice',
      room: '210 ауд.',
      groupName: 'ИТ-22',
      notes: 'React және Tailwind CSS практикасы',
      completed: false,
    },

    // Бейсенбі (Thursday - 4)
    {
      id: 'sch-thu-1',
      title: 'Жасанды интеллектке кіріспе',
      date: getWeekDayIso(3),
      dayOfWeek: 4,
      recurringWeekly: true,
      startTime: '10:00',
      endTime: '11:20',
      category: 'lecture',
      room: '501 ауд.',
      groupName: 'AI-301',
      notes: 'Машиналық оқыту алгоритмдері',
      completed: false,
    },
    {
      id: 'sch-thu-2',
      title: 'Математикалық талдау (Семинар)',
      date: getWeekDayIso(3),
      dayOfWeek: 4,
      recurringWeekly: true,
      startTime: '13:00',
      endTime: '14:20',
      category: 'seminar',
      room: '304 ауд.',
      groupName: 'ИТ-21 тобы',
      notes: 'Есептерді тақтада шығару',
      completed: false,
    },
    {
      id: 'sch-thu-3',
      title: 'Кафедраның апталық мәжілісі',
      date: getWeekDayIso(3),
      dayOfWeek: 4,
      recurringWeekly: true,
      startTime: '16:00',
      endTime: '17:00',
      category: 'work',
      room: 'Конференц-зал',
      groupName: 'Оқытушылар құрамы',
      notes: 'Аралық бақылау мәселелері',
      completed: false,
    },

    // Жұма (Friday - 5)
    {
      id: 'sch-fri-1',
      title: 'Алгоритмдер: қорытынды тестілеу',
      date: getWeekDayIso(4),
      dayOfWeek: 5,
      recurringWeekly: true,
      startTime: '09:30',
      endTime: '10:50',
      category: 'lab',
      room: '108 комп. сынып',
      groupName: 'ИТ-21 тобы',
      notes: 'Практикалық бақылау жұмысы',
      completed: false,
    },
    {
      id: 'sch-fri-2',
      title: 'Кәсіби ағылшын тіліндегі сабақ',
      date: getWeekDayIso(4),
      dayOfWeek: 5,
      recurringWeekly: true,
      startTime: '11:30',
      endTime: '12:50',
      category: 'lecture',
      room: '405 ауд.',
      groupName: 'ИТ-21 тобы',
      notes: 'Technical Presentation Skills',
      completed: false,
    },
    {
      id: 'sch-fri-3',
      title: 'Апталық сабақ қорытындысы мен бағалау',
      date: getWeekDayIso(4),
      dayOfWeek: 5,
      recurringWeekly: true,
      startTime: '15:00',
      endTime: '16:30',
      category: 'work',
      room: 'Оқытушылар бөлмесі',
      groupName: 'Жеке уақыт',
      notes: 'Электронды журналға баға қою',
      completed: false,
    },

    // Сенбі (Saturday - 6)
    {
      id: 'sch-sat-1',
      title: 'Шеберлік сыныбы: Жоба әзірлеу',
      date: getWeekDayIso(5),
      dayOfWeek: 6,
      recurringWeekly: true,
      startTime: '11:00',
      endTime: '12:30',
      category: 'practice',
      room: 'Google Meet',
      groupName: 'Ашық курс',
      notes: 'Портфолио жинақтау бойынша кеңес',
      completed: false,
    },
  ];

  return { tasks, habits, schedule };
}
