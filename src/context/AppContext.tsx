import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from 'react';

import type { Task } from '../types/task';

import { initialTasks } from '../data/initialData';

import {
  seedInitialTasks,
  insertTask,
  updateTaskCompletion,
  deleteTaskFromDatabase,
} from '../database/taskDatabase';

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
  ) => Promise<void>;

  completeTask: (
    id: number
  ) => Promise<void>;

  deleteTask: (
    id: number
  ) => Promise<void>;


  // ====================================================
  // DATABASE
  // ====================================================

  databaseReady: boolean;


  // ====================================================
  // THEME
  // ====================================================

  isDarkMode: boolean;

  theme: AppTheme;

  setDarkMode: (
    enabled: boolean
  ) => void;

  toggleDarkMode: (
    enabled: boolean
  ) => void;
}


// ======================================================
// CREATE CONTEXT
// ======================================================

const AppContext =
  createContext<AppContextType | undefined>(
    undefined
  );


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
    useState<Task[]>([]);


  // ====================================================
  // DATABASE STATE
  // ====================================================

  const [databaseReady, setDatabaseReady] =
    useState(false);

  const databaseInitialization = useRef<{
    promise: Promise<void>;
    markReady: () => void;
    started: boolean;
  } | null>(null);

  if (!databaseInitialization.current) {
    let markReady = () => {};
    const promise = new Promise<void>((resolve) => {
      markReady = resolve;
    });

    databaseInitialization.current = {
      promise,
      markReady,
      started: false,
    };
  }


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
  // LOAD TASKS FROM SQLITE
  // ====================================================

  useEffect(() => {

    const initialization =
      databaseInitialization.current;

    if (!initialization || initialization.started) {
      return;
    }

    initialization.started = true;

    async function loadTasks() {

      try {

        /*
         * seedInitialTasks() checks whether
         * the initial sample data has already
         * been inserted.
         *
         * First launch:
         *   initialTasks → SQLite
         *
         * Later launches:
         *   SQLite → tasks
         */

        const savedTasks =
          await seedInitialTasks(
            initialTasks
          );

        setTasks(savedTasks);

        setDatabaseReady(true);

      } catch (error) {

        console.error(
          'Failed to load tasks from SQLite:',
          error
        );

      } finally {

        initialization!.markReady();

      }

    }

    loadTasks();

  }, []);


  // ====================================================
  // ADD TASK
  // ====================================================

  const addTask = async (
    title: string,
    description: string,
    priority: Task['priority'],
    deadline: string
  ) => {

    await databaseInitialization.current?.promise;

    const newTask: Task = {

      id: Date.now(),

      title,

      description,

      priority,

      deadline,

      completed: false,

    };


    // ==================================================
    // SAVE TO SQLITE
    // ==================================================

    await insertTask(newTask);


    // ==================================================
    // UPDATE UI
    // ==================================================

    setTasks((currentTasks) => [
      newTask,
      ...currentTasks,
    ]);

  };


  // ====================================================
  // COMPLETE TASK
  // ====================================================

  const completeTask = async (
    id: number
  ) => {

    await databaseInitialization.current?.promise;

    const task = tasks.find(
      (currentTask) =>
        currentTask.id === id
    );


    if (!task) {
      return;
    }


    const newCompletedState =
      !task.completed;


    // ==================================================
    // SAVE CHANGE TO SQLITE
    // ==================================================

    await updateTaskCompletion(
      id,
      newCompletedState
    );


    // ==================================================
    // UPDATE UI
    // ==================================================

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === id
          ? {
              ...currentTask,
              completed:
                newCompletedState,
            }
          : currentTask
      )
    );

  };


  // ====================================================
  // DELETE TASK
  // ====================================================

  const deleteTask = async (
    id: number
  ) => {

    await databaseInitialization.current?.promise;

    // ==================================================
    // DELETE FROM SQLITE
    // ==================================================

    await deleteTaskFromDatabase(id);


    // ==================================================
    // UPDATE UI
    // ==================================================

    setTasks((currentTasks) =>
      currentTasks.filter(
        (task) =>
          task.id !== id
      )
    );

  };


  // ====================================================
  // DARK MODE
  // ====================================================

  const setDarkMode = (
    enabled: boolean
  ) => {

    setIsDarkMode(enabled);

  };


  // ====================================================
  // TOGGLE DARK MODE
  // ====================================================

  const toggleDarkMode = (
    enabled: boolean
  ) => {

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

        // Database
        databaseReady,

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

  const context =
    useContext(AppContext);


  if (!context) {

    throw new Error(
      'useApp must be used inside an AppProvider'
    );

  }


  return context;
}