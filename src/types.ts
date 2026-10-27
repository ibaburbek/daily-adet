export type Priority = 'high' | 'medium' | 'low';

export type TaskCategory = 'work' | 'study' | 'personal' | 'health' | 'finance' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  date: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm (24-hour)
  priority: Priority;
  category: TaskCategory;
  tags?: string[];
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  icon?: string;
  frequency: 'daily' | 'weekdays' | 'weekends';
  completions: Record<string, boolean>; // date string "YYYY-MM-DD": true
  targetDaysPerWeek: number;
  createdAt: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm 24-hr
  endTime: string; // HH:mm 24-hr
  category: string;
  notes?: string;
  completed?: boolean;
  dayOfWeek?: number; // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun (or 7)
  recurringWeekly?: boolean;
  room?: string; // Classroom or online link
  groupName?: string; // Group / Class name
  startPeriod?: number; // Period number (0, 1, 2, 3...)
  endPeriod?: number; // For merged multi-period lessons, e.g. 4
  timetableType?: 'school' | 'tutoring';
}

export type ThemeMode = 'dark' | 'light' | 'system';

export type BackgroundPresetId =
  | 'midnight'
  | 'navy-sage'
  | 'deep-blue'
  | 'charcoal'
  | 'radial-glow';

export interface BackgroundPreset {
  id: BackgroundPresetId;
  nameKk: string;
  descriptionKk: string;
  cssBackground: string;
  previewGradient: string;
}

export interface BackgroundConfig {
  type: 'preset' | 'custom';
  presetId: BackgroundPresetId;
  hasCustomImage: boolean;
  overlayOpacity: number; // 0.1 to 0.9
}

export interface AppDataBackup {
  version: number;
  exportedAt: string;
  tasks: Task[];
  habits: Habit[];
  schedule: ScheduleItem[];
  theme: ThemeMode;
  backgroundConfig: BackgroundConfig;
}
