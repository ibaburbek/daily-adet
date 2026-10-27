/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ScheduleView } from './components/ScheduleView';
import { TasksView } from './components/TasksView';
import { HabitsView } from './components/HabitsView';
import { SettingsView } from './components/SettingsView';
import { TaskModal } from './components/TaskModal';
import { ScheduleModal } from './components/ScheduleModal';
import { HabitModal } from './components/HabitModal';
import { CompletionToast } from './components/CompletionToast';
import { Task, ScheduleItem, Habit } from './types';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    backgroundConfig,
    activeCssBackground,
    resolvedTheme,
  } = useApp();

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<ScheduleItem | null>(null);
  const [schedulePrefill, setSchedulePrefill] = useState<{ dayOfWeek?: number; dateStr?: string }>({});

  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  // Modal openers
  const handleOpenNewTask = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenNewSchedule = (dayOfWeek?: number, dateStr?: string) => {
    setScheduleToEdit(null);
    setSchedulePrefill({ dayOfWeek, dateStr });
    setIsScheduleModalOpen(true);
  };

  const handleEditSchedule = (item: ScheduleItem) => {
    setScheduleToEdit(item);
    setSchedulePrefill({});
    setIsScheduleModalOpen(true);
  };

  const handleOpenNewHabit = () => {
    setHabitToEdit(null);
    setIsHabitModalOpen(true);
  };

  const handleEditHabit = (habit: Habit) => {
    setHabitToEdit(habit);
    setIsHabitModalOpen(true);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col font-sans transition-colors duration-200">
      {/* 1. Full-page background layer (Built-in gradient or Custom IndexedDB Image) */}
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-all duration-500 ease-in-out"
        style={{
          background: activeCssBackground,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* 2. Adjustable Dark/Light Overlay for high text contrast and card readability */}
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundColor: resolvedTheme === 'dark' ? '#101923' : '#F4F6F4',
          opacity: backgroundConfig.overlayOpacity,
        }}
      />

      {/* 3. Subtle ambient glow layer */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(163, 191, 168, 0.12), transparent 70%)',
        }}
      />

      {/* 4. Main Foreground UI */}
      <div className="relative z-10 flex-1 flex flex-col min-h-screen">
        <Header
          onOpenNewTaskModal={handleOpenNewTask}
          onOpenNewScheduleModal={handleOpenNewSchedule}
        />

        <main className="flex-1 w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenNewTaskModal={handleOpenNewTask}
              onEditTask={handleEditTask}
              onOpenNewScheduleModal={handleOpenNewSchedule}
              onEditScheduleItem={handleEditSchedule}
              onOpenNewHabitModal={handleOpenNewHabit}
              onEditHabit={handleEditHabit}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView
              onOpenNewScheduleModal={handleOpenNewSchedule}
              onEditScheduleItem={handleEditSchedule}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              onOpenNewTaskModal={handleOpenNewTask}
              onEditTask={handleEditTask}
            />
          )}

          {activeTab === 'habits' && (
            <HabitsView
              onOpenNewHabitModal={handleOpenNewHabit}
              onEditHabit={handleEditHabit}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>

        <Navbar />
      </div>

      {/* 5. Modals & Subtle Sage Notification Toast */}
      <CompletionToast />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        scheduleToEdit={scheduleToEdit}
        prefillDayOfWeek={schedulePrefill.dayOfWeek}
        prefillDate={schedulePrefill.dateStr}
      />

      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        habitToEdit={habitToEdit}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
