import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';

import type { Task } from '../types/task';
import { initialTasks } from '../data/initialData';

import {
  lightTheme,
  darkTheme,
} from '../theme/theme';

import type {
  AppTheme,
} from '../theme/theme';


// ======================================================
// APP CONTEXT TYPE
// ======================================================

interface AppContextType {

  // ====================================================
  // TASKS
  // ====================================================

  tasks: Task[];

  addTask: (
    title: string,
    description: string,
    priority: Task['priority'],
    deadline: string
  ) => void;

  completeTask: (id: number) => void;

  deleteTask: (id: number) => void;


  // ====================================================
  // THEME
  // ====================================================

  isDarkMode: boolean;

  theme: AppTheme;

  setDarkMode: (enabled: boolean) => void;

  toggleDarkMode: (enabled: boolean) => void;
}


// ======================================================
// CREATE CONTEXT
// ======================================================

const AppContext =
  createContext<AppContextType | undefined>(undefined);


// ======================================================
// PROVIDER PROPS
// ======================================================

interface AppProviderProps {
  children: ReactNode;
}


// ======================================================
// APP PROVIDER
// ======================================================

export function AppProvider({
  children,
}: AppProviderProps) {

  // ====================================================
  // TASK STATE
  // ====================================================

  const [tasks, setTasks] =
    useState<Task[]>(initialTasks);


  // ====================================================
  // DARK MODE STATE
  // ====================================================

  const [isDarkMode, setIsDarkMode] =
    useState(false);


  // ====================================================
  // CURRENT THEME
  // ====================================================

  const theme = isDarkMode
    ? darkTheme
    : lightTheme;


  // ====================================================
  // ADD TASK
  // ====================================================

  const addTask = (
    title: string,
    description: string,
    priority: Task['priority'],
    deadline: string
  ) => {

    const newTask: Task = {
      id: Date.now(),
      title,
      description,
      priority,
      deadline,
      completed: false,
    };

    setTasks((currentTasks) => [
      ...currentTasks,
      newTask,
    ]);
  };


  // ====================================================
  // COMPLETE TASK
  // ====================================================

  const completeTask = (id: number) => {

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      )
    );
  };


  // ====================================================
  // DELETE TASK
  // ====================================================

  const deleteTask = (id: number) => {

    setTasks((currentTasks) =>
      currentTasks.filter(
        (task) => task.id !== id
      )
    );
  };


  // ====================================================
  // DARK MODE
  // ====================================================

  const setDarkMode = (enabled: boolean) => {
    setIsDarkMode(enabled);
  };


  // ====================================================
  // TOGGLE DARK MODE
  // ====================================================

  const toggleDarkMode = (enabled: boolean) => {
    setIsDarkMode(enabled);
  };


  // ====================================================
  // PROVIDER
  // ====================================================

  return (
    <AppContext.Provider
      value={{
        // Tasks
        tasks,
        addTask,
        completeTask,
        deleteTask,

        // Theme
        isDarkMode,
        theme,

        // Dark mode controls
        setDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}


// ======================================================
// USE APP HOOK
// ======================================================

export function useApp() {

  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      'useApp must be used inside an AppProvider'
    );
  }

  return context;
}