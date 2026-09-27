import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import TasksScreen from './src/screens/TasksScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import MoreScreen from './src/screens/More';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import type { Task } from './src/types/task';

import {
  AppProvider,
  useApp,
} from './src/context/AppContext';


// ==================================================
// APP
// ==================================================

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}


// ==================================================
// APP CONTENT
// ==================================================

function AppContent() {

  /*
   * --------------------------------------------------
   * APP CONTEXT
   * --------------------------------------------------
   *
   * Tasks now come from AppContext.
   *
   * AppContext is connected to SQLite.
   *
   * --------------------------------------------------
   */

  const {
    tasks,
    addTask,
    completeTask,
    deleteTask,
  } = useApp();


  /*
   * --------------------------------------------------
   * AUTHENTICATION
   * --------------------------------------------------
   */

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);


  /*
   * --------------------------------------------------
   * NAVIGATION
   * --------------------------------------------------
   */

  const [screen, setScreen] = useState<
    | 'home'
    | 'tasks'
    | 'addTask'
    | 'schedule'
    | 'more'
    | 'profile'
    | 'settings'
  >('home');

  const [taskEntryOrigin, setTaskEntryOrigin] =
    useState<'home' | 'tasks'>('home');

  const [profileEntryOrigin, setProfileEntryOrigin] =
    useState<'home' | 'more'>('more');


  /*
   * --------------------------------------------------
   * PROFILE
   * --------------------------------------------------
   */

  const [profileName, setProfileName] =
    useState('Alex Mercer');


  /*
   * --------------------------------------------------
   * LOGIN
   * --------------------------------------------------
   */

  const handleLogin = () => {
    setIsAuthenticated(true);
    setScreen('home');
  };


  /*
   * --------------------------------------------------
   * LOGOUT
   * --------------------------------------------------
   */

  const handleLogout = () => {
    setIsAuthenticated(false);
    setScreen('home');
  };


  /*
   * --------------------------------------------------
   * ADD TASK
   * --------------------------------------------------
   *
   * The task is now saved through AppContext.
   *
   * AppContext → SQLite
   *
   * --------------------------------------------------
   */

  const handleAddTask = async (
    newTask: Task
  ) => {

    await addTask(
      newTask.title,
      newTask.description,
      newTask.priority,
      newTask.deadline
    );

    setScreen(taskEntryOrigin);
  };


  /*
   * --------------------------------------------------
   * TOGGLE TASK
   * --------------------------------------------------
   *
   * The completion state is now saved to SQLite.
   *
   * --------------------------------------------------
   */

  const handleToggleTask = async (
    taskId: number
  ) => {

    await completeTask(taskId);

  };


  /*
   * --------------------------------------------------
   * DELETE TASK
   * --------------------------------------------------
   */

  const handleDeleteTask = async (
    taskId: number
  ) => {

    await deleteTask(taskId);

  };


  /*
   * --------------------------------------------------
   * LOGIN GATE
   * --------------------------------------------------
   */

  if (!isAuthenticated) {

    return (
      <View style={styles.container}>

        <LoginScreen
          onLogin={handleLogin}
        />

      </View>
    );
  }


  /*
   * --------------------------------------------------
   * MAIN APPLICATION
   * --------------------------------------------------
   */

  return (
    <View style={styles.container}>

      {/* ==================================================
          HOME
          ================================================== */}

      {screen === 'home' && (

        <HomeScreen

          tasks={tasks}

          onAddTask={() => {
            setTaskEntryOrigin('home');
            setScreen('addTask');
          }}

          onToggleTask={handleToggleTask}

          onGoToTasks={() =>
            setScreen('tasks')
          }

          onGoToSchedule={() =>
            setScreen('schedule')
          }

          onGoMore={() =>
            setScreen('more')
          }

          onGoProfile={() => {
            setProfileEntryOrigin('home');
            setScreen('profile')
          }}

        />

      )}


      {/* ==================================================
          TASKS
          ================================================== */}

      {screen === 'tasks' && (

        <TasksScreen

          tasks={tasks}

          onToggleTask={handleToggleTask}

          onDeleteTask={handleDeleteTask}

          onAddTask={() => {
            setTaskEntryOrigin('tasks');
            setScreen('addTask');
          }}

          onGoHome={() =>
            setScreen('home')
          }

          onGoSchedule={() =>
            setScreen('schedule')
          }

          onGoMore={() =>
            setScreen('more')
          }

        />

      )}


      {/* ==================================================
          ADD TASK
          ================================================== */}

      {screen === 'addTask' && (

        <AddTaskScreen

          onBack={() =>
            setScreen(taskEntryOrigin)
          }

          onSaveTask={handleAddTask}

        />

      )}


      {/* ==================================================
          SCHEDULE
          ================================================== */}

      {screen === 'schedule' && (

        <ScheduleScreen

          onGoHome={() =>
            setScreen('home')
          }

          onGoTasks={() =>
            setScreen('tasks')
          }

          onGoMore={() =>
            setScreen('more')
          }

        />

      )}


      {/* ==================================================
          MORE
          ================================================== */}

      {screen === 'more' && (

        <MoreScreen

          onGoHome={() =>
            setScreen('home')
          }

          onGoTasks={() =>
            setScreen('tasks')
          }

          onGoSchedule={() =>
            setScreen('schedule')
          }

          onGoProfile={() => {
            setProfileEntryOrigin('more');
            setScreen('profile')
          }}

          onGoSettings={() =>
            setScreen('settings')
          }

          onLogout={handleLogout}

        />

      )}


      {/* ==================================================
          PROFILE
          ================================================== */}

      {screen === 'profile' && (

        <ProfileScreen

          name={profileName}

          onGoBack={() =>
            setScreen(profileEntryOrigin)
          }

        />

      )}


      {/* ==================================================
          SETTINGS
          ================================================== */}

      {screen === 'settings' && (

        <SettingsScreen

          name={profileName}

          onChangeName={setProfileName}

          onGoBack={() =>
            setScreen('more')
          }

        />

      )}

    </View>
  );
}


// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

});