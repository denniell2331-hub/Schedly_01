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

import { initialTasks } from './src/data/initialData';
import type { Task } from './src/types/task';

import { AppProvider } from './src/context/AppContext';


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


  /*
   * --------------------------------------------------
   * PROFILE
   * --------------------------------------------------
   */

  const [profileName, setProfileName] =
    useState('Alex Mercer');


  /*
   * --------------------------------------------------
   * TASKS
   * --------------------------------------------------
   *
   * NOTE:
   * Your existing task system is kept exactly as it
   * currently works.
   *
   * We are not removing it yet.
   *
   * --------------------------------------------------
   */

  const [tasks, setTasks] =
    useState<Task[]>(initialTasks);


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
   */

  const handleAddTask = (newTask: Task) => {

    setTasks((currentTasks) => [
      newTask,
      ...currentTasks,
    ]);

    setScreen('home');
  };


  /*
   * --------------------------------------------------
   * TOGGLE TASK
   * --------------------------------------------------
   */

  const handleToggleTask = (taskId: number) => {

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      )
    );
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

          onAddTask={() =>
            setScreen('addTask')
          }

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
        />

      )}


      {/* ==================================================
          TASKS
          ================================================== */}

      {screen === 'tasks' && (

        <TasksScreen
          tasks={tasks}

          onToggleTask={handleToggleTask}

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
            setScreen('home')
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

          onGoProfile={() =>
            setScreen('profile')
          }

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
            setScreen('more')
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