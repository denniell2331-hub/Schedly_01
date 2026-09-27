import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  StatusBar,
  Modal,
} from 'react-native';

import { useMemo, useState } from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import type { Task } from '../types/task';
import { useApp } from '../context/AppContext';
import type { AppTheme } from '../theme/theme';
import FlashcardModal from '../components/FlashcardModal';
import { useFlashcard } from '../hooks/useFlashcard';

type TasksScreenProps = {
  tasks: Task[];
  onToggleTask: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  onAddTask: () => void;
  onGoHome: () => void;
  onGoSchedule: () => void;
  onGoMore: () => void;
};

export default function TasksScreen({
  tasks,
  onToggleTask,
  onDeleteTask,
  onAddTask,
  onGoHome,
  onGoSchedule,
  onGoMore,
}: TasksScreenProps) {
  // ==================================================
  // THEME
  // ==================================================

  const { theme } = useApp();

  const styles = createStyles(theme);

  const {
    flashcard,
    showFlashcard,
    closeFlashcard,
  } = useFlashcard();

  // ==================================================
  // STATE
  // ==================================================

  const [selectedTab, setSelectedTab] = useState<
    'All' | 'Pending' | 'Completed'
  >('All');

  const [searchText, setSearchText] =
    useState('');

  const [taskToDelete, setTaskToDelete] =
    useState<Task | null>(null);

  // ==================================================
  // PRIORITY ORDER
  //
  // High   = 1
  // Medium = 2
  // Low    = 3
  // ==================================================

  const priorityOrder: Record<
    Task['priority'],
    number
  > = {
    High: 1,
    Medium: 2,
    Low: 3,
  };

  // ==================================================
  // FILTER + SORT TASKS
  // ==================================================

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // ==================================================
    // FILTER BY TAB
    // ==================================================

    if (selectedTab === 'Pending') {
      result = result.filter(
        (task) => !task.completed
      );
    }

    if (selectedTab === 'Completed') {
      result = result.filter(
        (task) => task.completed
      );
    }

    // ==================================================
    // SEARCH
    // ==================================================

    if (searchText.trim()) {
      const search = searchText
        .trim()
        .toLowerCase();

      result = result.filter((task) =>
        task.title
          .toLowerCase()
          .includes(search)
      );
    }

    // ==================================================
    // SORT BY PRIORITY
    //
    // High → Medium → Low
    // ==================================================

    result.sort(
      (a, b) =>
        priorityOrder[a.priority] -
        priorityOrder[b.priority]
    );

    return result;
  }, [
    tasks,
    selectedTab,
    searchText,
  ]);

  // ==================================================
  // TASK MENU
  // ==================================================

  const handleTaskMenu = (
    task: Task
  ) => {
    showFlashcard({
      title: task.title,
      message: 'Choose an action for this task.',
      tone: 'info',
      primaryLabel: task.completed
        ? 'Mark as Pending'
        : 'Mark as Completed',
      secondaryLabel: 'Cancel',
      onPrimary: () => onToggleTask(task.id),
    });
  };

  const handleDeleteTask = (
    task: Task
  ) => {
    setTaskToDelete(task);
  };

  const confirmDeleteTask = () => {
    if (!taskToDelete) {
      return;
    }

    onDeleteTask(taskToDelete.id);
    setTaskToDelete(null);
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={
          theme.background === '#07152F'
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={theme.background}
      />

      {/* ==================================================
          HEADER
          ================================================== */}

      <View style={styles.header}>
        <Text style={styles.title}>
          Tasks
        </Text>
      </View>

      {/* ==================================================
          SEARCH
          ================================================== */}

      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={22}
          color={theme.primary}
        />

        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search tasks..."
          placeholderTextColor={
            theme.textMuted
          }
          returnKeyType="search"
        />

        <Pressable
          style={styles.filterButton}
          onPress={() => {
            showFlashcard({
              title: 'Filter Tasks',
              message: 'Use the All, Pending, or Completed tabs to filter your tasks.',
              tone: 'info',
            });
          }}
        >
          <Ionicons
            name="options-outline"
            size={25}
            color={theme.primary}
          />
        </Pressable>
      </View>

      {/* ==================================================
          TABS
          ================================================== */}

      <View style={styles.tabsContainer}>
        <TabButton
          title="All"
          selected={
            selectedTab === 'All'
          }
          onPress={() =>
            setSelectedTab('All')
          }
          theme={theme}
        />

        <TabButton
          title="Pending"
          selected={
            selectedTab === 'Pending'
          }
          onPress={() =>
            setSelectedTab('Pending')
          }
          theme={theme}
        />

        <TabButton
          title="Completed"
          selected={
            selectedTab === 'Completed'
          }
          onPress={() =>
            setSelectedTab('Completed')
          }
          theme={theme}
        />
      </View>

      {/* ==================================================
          TASK LIST
          
          SORT ORDER:
          HIGH
          MEDIUM
          LOW
          ================================================== */}

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) =>
          item.id.toString()
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View
            style={styles.emptyContainer}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={50}
              color={theme.primary}
            />

            <Text
              style={styles.emptyTitle}
            >
              No tasks found
            </Text>

            <Text
              style={
                styles.emptyDescription
              }
            >
              {searchText
                ? 'Try a different search.'
                : selectedTab ===
                  'Completed'
                ? 'You have no completed tasks yet.'
                : 'You have no pending tasks.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggle={() =>
              onToggleTask(item.id)
            }
            onDelete={() =>
              handleDeleteTask(item)
            }
            onMenu={() =>
              handleTaskMenu(item)
            }
            theme={theme}
          />
        )}
      />

      <FlashcardModal
        flashcard={flashcard}
        onClose={closeFlashcard}
      />

      {/* ==================================================
          DELETE CONFIRMATION FLASHCARD
          ================================================== */}

      <Modal
        visible={taskToDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setTaskToDelete(null)}
      >
        <View style={styles.deleteModalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setTaskToDelete(null)}
            accessibilityRole="button"
            accessibilityLabel="Cancel delete"
          />

          <View style={styles.deleteCard}>
            <View style={styles.deleteIconCircle}>
              <Ionicons
                name="trash-outline"
                size={25}
                color={theme.danger}
              />
            </View>

            <Text style={styles.deleteTitle}>
              Delete this task?
            </Text>

            <Text style={styles.deleteMessage}>
              {taskToDelete
                ? `"${taskToDelete.title}" will be permanently removed from your task list.`
                : ''}
            </Text>

            <View style={styles.deleteActions}>
              <Pressable
                style={styles.deleteCancelButton}
                onPress={() => setTaskToDelete(null)}
              >
                <Text style={styles.deleteCancelText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={styles.deleteConfirmButton}
                onPress={confirmDeleteTask}
              >
                <Ionicons
                  name="trash-outline"
                  size={17}
                  color="#FFFFFF"
                />
                <Text style={styles.deleteConfirmText}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          FLOATING ADD TASK BUTTON
      ===================================================== */}

      <Pressable
        style={styles.floatingButton}
        onPress={onAddTask}
        accessibilityRole="button"
        accessibilityLabel="Add task"
      >
        <Ionicons
          name="add"
          size={32}
          color="#FFFFFF"
        />
      </Pressable>

      {/* ==================================================
          BOTTOM NAVIGATION
          ================================================== */}

      <View
        style={styles.bottomNavigation}
      >
        {/* HOME */}

        <Pressable
          style={styles.bottomItem}
          onPress={onGoHome}
        >
          <Ionicons
            name="home-outline"
            size={23}
            color={theme.tabInactive}
          />

          <Text
            style={styles.bottomLabel}
          >
            Home
          </Text>
        </Pressable>

        {/* TASKS - ACTIVE */}

        <Pressable
          style={styles.bottomItem}
        >
          <Ionicons
            name="checkbox"
            size={23}
            color={theme.primary}
          />

          <Text
            style={[
              styles.bottomLabel,
              styles.activeLabel,
            ]}
          >
            Tasks
          </Text>
        </Pressable>

        {/* SCHEDULE */}

        <Pressable
          style={styles.bottomItem}
          onPress={onGoSchedule}
        >
          <Ionicons
            name="calendar-outline"
            size={23}
            color={theme.tabInactive}
          />

          <Text
            style={styles.bottomLabel}
          >
            Schedule
          </Text>
        </Pressable>

        {/* MORE */}

        <Pressable
          style={styles.bottomItem}
          onPress={onGoMore}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={23}
            color={theme.tabInactive}
          />

          <Text
            style={styles.bottomLabel}
          >
            More
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ======================================================
// TAB BUTTON
// ======================================================

type TabButtonProps = {
  title: string;
  selected: boolean;
  onPress: () => void;
  theme: AppTheme;
};

function TabButton({
  title,
  selected,
  onPress,
  theme,
}: TabButtonProps) {
  const styles = createStyles(theme);

  return (
    <Pressable
      style={[
        styles.tabButton,
        selected &&
          styles.selectedTab,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.tabText,
          selected &&
            styles.selectedTabText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

// ======================================================
// TASK CARD
// ======================================================

type TaskCardProps = {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onMenu: () => void;
  theme: AppTheme;
};

function TaskCard({
  task,
  onToggle,
  onDelete,
  onMenu,
  theme,
}: TaskCardProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.taskCard}>
      {/* ==================================================
          CHECK CIRCLE
          ================================================== */}

      <Pressable
        style={[
          styles.taskCircle,
          task.completed &&
            styles.completedCircle,
        ]}
        onPress={onToggle}
      >
        {task.completed && (
          <Ionicons
            name="checkmark"
            size={17}
            color="#FFFFFF"
          />
        )}
      </Pressable>

      {/* ==================================================
          TASK INFORMATION
          ================================================== */}

      <View style={styles.taskInfo}>
        <Text
          style={[
            styles.taskTitle,
            task.completed &&
              styles.completedTaskTitle,
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>

        <Text
          style={styles.taskDeadline}
        >
          {task.deadline}
        </Text>
      </View>

      {/* ==================================================
          PRIORITY
          ================================================== */}

      <View
        style={[
          styles.priorityBadge,

          task.priority === 'High' &&
            styles.highPriority,

          task.priority === 'Medium' &&
            styles.mediumPriority,

          task.priority === 'Low' &&
            styles.lowPriority,
        ]}
      >
        <Text
          style={[
            styles.priorityText,

            task.priority === 'High' &&
              styles.highPriorityText,

            task.priority === 'Medium' &&
              styles.mediumPriorityText,

            task.priority === 'Low' &&
              styles.lowPriorityText,
          ]}
        >
          {task.priority}
        </Text>
      </View>

      {/* ==================================================
          DELETE
          ================================================== */}

      <Pressable
        style={styles.deleteButton}
        onPress={onDelete}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${task.title}`}
      >
        <Ionicons
          name="trash-outline"
          size={20}
          color={theme.danger}
        />
      </Pressable>

      {/* ==================================================
          MENU
          ================================================== */}

      <Pressable
        style={styles.menuButton}
        onPress={onMenu}
      >
        <Ionicons
          name="ellipsis-horizontal"
          size={21}
          color={theme.primary}
        />
      </Pressable>
    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const createStyles = (
  theme: AppTheme
) =>
  StyleSheet.create({
    // ==================================================
    // CONTAINER
    // ==================================================

    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    // ==================================================
    // HEADER
    // ==================================================

    header: {
      paddingHorizontal: 18,
      paddingTop: 48,
      paddingBottom: 18,
    },

    title: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.text,
    },

    // ==================================================
    // SEARCH
    // ==================================================

    searchContainer: {
      height: 52,
      marginHorizontal: 18,
      backgroundColor:
        theme.inputBackground,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
    },

    searchInput: {
      flex: 1,
      height: '100%',
      fontSize: 14,
      color: theme.text,
      marginLeft: 9,
    },

    filterButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // ==================================================
    // TABS
    // ==================================================

    tabsContainer: {
      height: 59,
      marginHorizontal: 18,
      marginTop: 12,
      backgroundColor:
        theme.cardSecondary,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 4,
      borderWidth: 1,
      borderColor: theme.border,
    },

    tabButton: {
      flex: 1,
      height: 51,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },

    selectedTab: {
      backgroundColor: theme.primary,
    },

    tabText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
    },

    selectedTabText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },

    // ==================================================
    // LIST
    // ==================================================

    list: {
      paddingHorizontal: 18,
      paddingTop: 17,
      paddingBottom: 95,
    },

    // ==================================================
    // TASK CARD
    // ==================================================

    taskCard: {
      minHeight: 87,
      backgroundColor: theme.card,
      borderRadius: 16,
      marginBottom: 12,
      paddingHorizontal: 12,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      elevation: 1,
    },

    // ==================================================
    // TASK CHECK CIRCLE
    // ==================================================

    taskCircle: {
      width: 25,
      height: 25,
      borderRadius: 13,
      borderWidth: 2,
      borderColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    completedCircle: {
      backgroundColor: theme.primary,
    },

    // ==================================================
    // TASK INFORMATION
    // ==================================================

    taskInfo: {
      flex: 1,
      justifyContent: 'center',
      marginRight: 7,
    },

    taskTitle: {
      fontSize: 14.5,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 5,
    },

    completedTaskTitle: {
      color: theme.textMuted,
      textDecorationLine: 'line-through',
    },

    taskDeadline: {
      fontSize: 13,
      color: theme.textSecondary,
    },

    // ==================================================
    // PRIORITY BADGE
    // ==================================================

    priorityBadge: {
      minWidth: 55,
      paddingHorizontal: 9,
      paddingVertical: 7,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 6,
    },

    priorityText: {
      fontSize: 11.5,
      fontWeight: '700',
    },

    // HIGH

    highPriority: {
      backgroundColor:
        theme.danger + '22',
    },

    highPriorityText: {
      color: theme.danger,
    },

    // MEDIUM

    mediumPriority: {
      backgroundColor:
        theme.warning + '22',
    },

    mediumPriorityText: {
      color: theme.warning,
    },

    // LOW

    lowPriority: {
      backgroundColor:
        theme.success + '22',
    },

    lowPriorityText: {
      color: theme.success,
    },

    // ==================================================
    // MENU BUTTON
    // ==================================================

    menuButton: {
      width: 28,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },

    deleteButton: {
      width: 32,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 2,
    },

    // ==================================================
    // DELETE CONFIRMATION
    // ==================================================

    deleteModalOverlay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      backgroundColor: 'rgba(20, 43, 85, 0.42)',
    },

    deleteCard: {
      width: '100%',
      maxWidth: 360,
      alignItems: 'center',
      paddingHorizontal: 22,
      paddingTop: 26,
      paddingBottom: 20,
      borderRadius: 22,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      elevation: 8,
      shadowColor: theme.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: {
        width: 0,
        height: 8,
      },
    },

    deleteIconCircle: {
      width: 58,
      height: 58,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 29,
      backgroundColor: theme.logoutBackground,
      borderWidth: 1,
      borderColor: theme.logoutBorder,
    },

    deleteTitle: {
      marginTop: 17,
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
    },

    deleteMessage: {
      marginTop: 8,
      fontSize: 13,
      lineHeight: 19,
      color: theme.textSecondary,
      textAlign: 'center',
    },

    deleteActions: {
      width: '100%',
      flexDirection: 'row',
      gap: 10,
      marginTop: 22,
    },

    deleteCancelButton: {
      flex: 1,
      height: 46,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.cardSecondary,
    },

    deleteCancelText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.textSecondary,
    },

    deleteConfirmButton: {
      flex: 1,
      height: 46,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 12,
      backgroundColor: theme.danger,
    },

    deleteConfirmText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    // ==================================================
    // FLOATING ADD BUTTON
    // ==================================================

    floatingButton: {
      position: 'absolute',
      right: 20,
      bottom: 82,
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 5,
    },

    // ==================================================
    // EMPTY STATE
    // ==================================================

    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 70,
      paddingHorizontal: 30,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginTop: 12,
    },

    emptyDescription: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 5,
    },

    // ==================================================
    // BOTTOM NAVIGATION
    // ==================================================

    bottomNavigation: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 70,
      backgroundColor: theme.tabBar,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },

    bottomItem: {
      width: 75,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },

    bottomLabel: {
      fontSize: 10.5,
      color: theme.tabInactive,
      marginTop: 3,
    },

    activeLabel: {
      color: theme.primary,
      fontWeight: '700',
    },
  });