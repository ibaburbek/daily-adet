import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Task,
  Habit,
  ScheduleItem,
  ThemeMode,
  BackgroundConfig,
  BackgroundPresetId,
  AppDataBackup,
} from '../types';
import { toIsoDate, getScheduleItemsForDay } from '../utils/kazakh-date';
import { getInitialDemoData } from '../utils/initial-data';
import {
  saveCustomBackgroundToIDB,
  getCustomBackgroundFromIDB,
  deleteCustomBackgroundFromIDB,
} from '../utils/idb-storage';
import { inferPeriodFromTime } from '../utils/timetable-data';
import { getPresetById } from '../utils/background-presets';

export type ActiveTab = 'dashboard' | 'schedule' | 'tasks' | 'habits' | 'settings';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Date selection
  currentDate: Date;
  selectedDateStr: string;
  isViewingToday: boolean;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
  setSelectedDate: (date: Date) => void;

  // Tasks
  tasks: Task[];
  todayTasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  // Habits
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completions'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  toggleHabitDay: (id: string, dateStr: string) => void;
  deleteHabit: (id: string) => void;

  // Schedule
  schedule: ScheduleItem[];
  selectedDateSchedule: ScheduleItem[];
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;
  toggleScheduleItem: (id: string) => void;
  deleteScheduleItem: (id: string) => void;

  // Theme & Background
  theme: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: ThemeMode) => void;

  backgroundConfig: BackgroundConfig;
  customImageUrl: string | null;
  activeCssBackground: string;
  setBackgroundPreset: (presetId: BackgroundPresetId) => void;
  setCustomImage: (blob: Blob) => Promise<void>;
  removeCustomImage: () => Promise<void>;
  setOverlayOpacity: (opacity: number) => void;

  // Completion Animation & Toast Notification
  lastCompletedItem: { title: string; type: 'task' | 'habit' } | null;
  clearLastCompleted: () => void;

  // Backup & Reset
  exportBackup: () => void;
  importBackup: (jsonContent: string) => { success: boolean; error?: string; count?: { tasks: number; habits: number; schedule: number } };
  resetToSampleData: () => void;
}

const STORAGE_KEYS = {
  TASKS: 'dailyflow_tasks_v2',
  HABITS: 'dailyflow_habits_v2',
  SCHEDULE: 'dailyflow_schedule_v2',
  THEME: 'dailyflow_theme_v2',
  BG_CONFIG: 'dailyflow_bg_config_v2',
};

const DEFAULT_BG_CONFIG: BackgroundConfig = {
  type: 'preset',
  presetId: 'navy-sage',
  hasCustomImage: false,
  overlayOpacity: 0.5,
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const selectedDateStr = useMemo(() => toIsoDate(currentDate), [currentDate]);
  const isViewingToday = useMemo(() => selectedDateStr === toIsoDate(new Date()), [selectedDateStr]);

  // Animation trigger
  const [lastCompletedItem, setLastCompletedItem] = useState<{ title: string; type: 'task' | 'habit' } | null>(null);

  // Initialize or load state
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return getInitialDemoData().tasks;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return getInitialDemoData().habits;
  });

  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      if (saved) {
        const parsed: ScheduleItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Backward-compatible migration: ensure dayOfWeek, timetableType, and periods are populated
          const migrated = parsed.map((item) => {
            let dayOfWeek = item.dayOfWeek;
            if (typeof dayOfWeek !== 'number' && item.date) {
              const d = new Date(item.date);
              const jsDay = d.getDay();
              dayOfWeek = jsDay === 0 ? 7 : jsDay;
            }
            const timetableType = item.timetableType || (item.category === 'tutoring' ? 'tutoring' : 'school');
            let startPeriod = item.startPeriod;
            let endPeriod = item.endPeriod;
            if (typeof startPeriod !== 'number') {
              const inferred = inferPeriodFromTime(item.startTime, timetableType === 'tutoring');
              startPeriod = inferred.startPeriod;
              endPeriod = typeof endPeriod === 'number' ? endPeriod : inferred.endPeriod;
            }
            return {
              ...item,
              dayOfWeek: dayOfWeek ?? 1,
              recurringWeekly: item.recurringWeekly ?? true,
              timetableType,
              startPeriod,
              endPeriod: endPeriod ?? startPeriod,
            };
          });

          // Ensure school merged lessons (like school-mon-3-4) are present
          const hasSchoolMerged = migrated.some(
            (i) => i.id === 'school-mon-3-4' || (i.startPeriod === 3 && i.endPeriod === 4)
          );
          if (!hasSchoolMerged) {
            const demo = getInitialDemoData().schedule;
            const existingIds = new Set(migrated.map((m) => m.id));
            const newDemo = demo.filter((d) => !existingIds.has(d.id));
            return [...migrated, ...newDemo];
          }

          return migrated;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return getInitialDemoData().schedule;
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'dark'; // Default dark mode as required
  });

  const [backgroundConfig, setBackgroundConfig] = useState<BackgroundConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BG_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          type: parsed.type || 'preset',
          presetId: parsed.presetId || 'navy-sage',
          hasCustomImage: !!parsed.hasCustomImage,
          overlayOpacity: typeof parsed.overlayOpacity === 'number' ? parsed.overlayOpacity : 0.5,
        };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_BG_CONFIG;
  });

  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);

  // System theme detector
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const matcher = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    matcher.addEventListener('change', handler);
    return () => matcher.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: 'dark' | 'light' = useMemo(() => {
    if (theme === 'system') {
      return systemIsDark ? 'dark' : 'light';
    }
    return theme;
  }, [theme, systemIsDark]);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [resolvedTheme]);

  // Load custom image from IndexedDB on startup if enabled
  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (backgroundConfig.hasCustomImage) {
      getCustomBackgroundFromIDB().then((blob) => {
        if (!active) return;
        if (blob) {
          createdUrl = URL.createObjectURL(blob);
          setCustomImageUrl(createdUrl);
        } else {
          // If blob was not found, revert to preset
          setBackgroundConfig((prev) => ({
            ...prev,
            hasCustomImage: false,
            type: 'preset',
          }));
        }
      });
    } else {
      setCustomImageUrl(null);
    }

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [backgroundConfig.hasCustomImage]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BG_CONFIG, JSON.stringify(backgroundConfig));
  }, [backgroundConfig]);

  // CSS background computed
  const activeCssBackground = useMemo(() => {
    if (backgroundConfig.type === 'custom' && customImageUrl) {
      return `url("${customImageUrl}") center / cover no-repeat fixed`;
    }
    const preset = getPresetById(backgroundConfig.presetId);
    return preset.cssBackground;
  }, [backgroundConfig, customImageUrl]);

  // Date navigation handlers
  const goToPreviousDay = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  };

  const goToNextDay = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const setSelectedDate = (date: Date) => {
    setCurrentDate(date);
  };

  // Filtered lists for current view
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.date === selectedDateStr);
  }, [tasks, selectedDateStr]);

  const selectedDateSchedule = useMemo(() => {
    return getScheduleItemsForDay(schedule, currentDate);
  }, [schedule, currentDate]);

  // Task actions
  const addTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newCompleted = !t.completed;
          if (newCompleted) {
            setLastCompletedItem({ title: t.title, type: 'task' });
          }
          return {
            ...t,
            completed: newCompleted,
            completedAt: newCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Habit actions
  const addHabit = (newHabit: Omit<Habit, 'id' | 'createdAt' | 'completions'>) => {
    const habit: Habit = {
      ...newHabit,
      id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      completions: {},
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, habit]);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  };

  const toggleHabitDay = (id: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const current = !!h.completions[dateStr];
          const updated = !current;
          if (updated) {
            setLastCompletedItem({ title: h.title, type: 'habit' });
          }
          return {
            ...h,
            completions: {
              ...h.completions,
              [dateStr]: updated,
            },
          };
        }
        return h;
      })
    );
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  // Schedule actions
  const addScheduleItem = (newItem: Omit<ScheduleItem, 'id'>) => {
    const item: ScheduleItem = {
      ...newItem,
      id: `sch-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    };
    setSchedule((prev) => [...prev, item]);
  };

  const updateScheduleItem = (id: string, updates: Partial<ScheduleItem>) => {
    setSchedule((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const toggleScheduleItem = (id: string) => {
    setSchedule((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const deleteScheduleItem = (id: string) => {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
  };

  // Theme actions
  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  // Background actions
  const setBackgroundPreset = (presetId: BackgroundPresetId) => {
    setBackgroundConfig((prev) => ({
      ...prev,
      type: 'preset',
      presetId,
    }));
  };

  const setCustomImage = async (blob: Blob): Promise<void> => {
    await saveCustomBackgroundToIDB(blob);
    if (customImageUrl) {
      URL.revokeObjectURL(customImageUrl);
    }
    const newUrl = URL.createObjectURL(blob);
    setCustomImageUrl(newUrl);
    setBackgroundConfig((prev) => ({
      ...prev,
      type: 'custom',
      hasCustomImage: true,
    }));
  };

  const removeCustomImage = async (): Promise<void> => {
    await deleteCustomBackgroundFromIDB();
    if (customImageUrl) {
      URL.revokeObjectURL(customImageUrl);
      setCustomImageUrl(null);
    }
    setBackgroundConfig((prev) => ({
      ...prev,
      type: 'preset',
      hasCustomImage: false,
    }));
  };

  const setOverlayOpacity = (opacity: number) => {
    const clamped = Math.max(0.05, Math.min(0.95, opacity));
    setBackgroundConfig((prev) => ({
      ...prev,
      overlayOpacity: clamped,
    }));
  };

  const clearLastCompleted = () => {
    setLastCompletedItem(null);
  };

  // Backup & Restore
  const exportBackup = () => {
    const backup: AppDataBackup = {
      version: 2,
      exportedAt: new Date().toISOString(),
      tasks,
      habits,
      schedule,
      theme,
      backgroundConfig,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `daily_adet_backup_${toIsoDate(new Date())}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importBackup = (jsonContent: string) => {
    try {
      const data = JSON.parse(jsonContent);
      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Файл пішімі дұрыс емес (JSON жарамсыз)' };
      }

      if (!Array.isArray(data.tasks) || !Array.isArray(data.habits) || !Array.isArray(data.schedule)) {
        return { success: false, error: 'Қажетті құрылымдар (тапсырмалар, әдеттер, кесте) табылмады' };
      }

      setTasks(data.tasks);
      setHabits(data.habits);
      setSchedule(data.schedule);

      if (data.theme && ['dark', 'light', 'system'].includes(data.theme)) {
        setThemeState(data.theme);
      }

      if (data.backgroundConfig && data.backgroundConfig.presetId) {
        setBackgroundConfig((prev) => ({
          ...prev,
          type: data.backgroundConfig.type === 'custom' ? 'preset' : (data.backgroundConfig.type || 'preset'),
          presetId: data.backgroundConfig.presetId || 'navy-sage',
          overlayOpacity: typeof data.backgroundConfig.overlayOpacity === 'number' ? data.backgroundConfig.overlayOpacity : 0.5,
        }));
      }

      return {
        success: true,
        count: {
          tasks: data.tasks.length,
          habits: data.habits.length,
          schedule: data.schedule.length,
        },
      };
    } catch (err) {
      return { success: false, error: 'Файлды оқу кезінде қате орын алды: ' + String(err) };
    }
  };

  const resetToSampleData = () => {
    const demo = getInitialDemoData();
    setTasks(demo.tasks);
    setHabits(demo.habits);
    setSchedule(demo.schedule);
    setThemeState('dark');
    setBackgroundConfig(DEFAULT_BG_CONFIG);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentDate,
        selectedDateStr,
        isViewingToday,
        goToPreviousDay,
        goToNextDay,
        goToToday,
        setSelectedDate,
        tasks,
        todayTasks,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        habits,
        addHabit,
        updateHabit,
        toggleHabitDay,
        deleteHabit,
        schedule,
        selectedDateSchedule,
        addScheduleItem,
        updateScheduleItem,
        toggleScheduleItem,
        deleteScheduleItem,
        theme,
        resolvedTheme,
        setTheme,
        backgroundConfig,
        customImageUrl,
        activeCssBackground,
        setBackgroundPreset,
        setCustomImage,
        removeCustomImage,
        setOverlayOpacity,
        lastCompletedItem,
        clearLastCompleted,
        exportBackup,
        importBackup,
        resetToSampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
