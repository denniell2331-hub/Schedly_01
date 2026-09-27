import { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Image,
  Modal,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import type { Task } from '../types/task';
import { useApp } from '../context/AppContext';
import type { AppTheme } from '../theme/theme';

/* =========================================================
   TYPES
========================================================= */

type HomeAcademicEvent = {
  id: string | number;
  eventType:
    | 'Quiz'
    | 'Exam'
    | 'PIT'
    | 'Assignment'
    | 'Project'
    | 'Others';
  subject: string;
  date: string;
  startTime?: string;
};

type HomeNotification = {
  key: string;
  title: string;
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: 'task' | 'quiz';
  sortDate: number;
};

type HomeScreenProps = {
  tasks: Task[];

  /*
    Optional schedule events.

    HomeScreen can receive the academic activities
    from ScheduleScreen through this prop.

    If it is not supplied, the app will still work.
  */
  scheduleEvents?: HomeAcademicEvent[];

  onAddTask: () => void;
  onToggleTask: (taskId: number) => void;
  onGoToTasks: () => void;
  onGoToSchedule: () => void;
  onGoMore: () => void;
  onGoProfile: () => void;
};

/* =========================================================
   CONSTANTS
========================================================= */

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/*
  A quiz becomes a Home notification when it is
  scheduled today or within the next 7 days.
*/
const QUIZ_NOTIFICATION_DAYS = 7;

/* =========================================================
   HOME SCREEN
========================================================= */

export default function HomeScreen({
  tasks,
  scheduleEvents = [],
  onAddTask,
  onToggleTask,
  onGoToTasks,
  onGoToSchedule,
  onGoMore,
  onGoProfile,
}: HomeScreenProps) {
  /* =====================================================
     APP THEME
  ===================================================== */

  const { theme } = useApp();

  const styles = createStyles(theme);

  /* =====================================================
     STATES
  ===================================================== */

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showMenu, setShowMenu] =
    useState(false);

  /*
    Stores notification keys that the user has already seen.

    This means:
    - opening the bell removes the red dot;
    - a newly detected notification gets a new key;
    - the red dot can appear again for new notifications.
  */
  const [
    seenNotificationKeys,
    setSeenNotificationKeys,
  ] = useState<string[]>([]);

  /* =====================================================
     PRIORITY ORDER

     Lower number = higher priority.

     High   = 1
     Medium = 2
     Low    = 3
  ===================================================== */

  const priorityOrder: Record<
    Task['priority'],
    number
  > = {
    High: 1,
    Medium: 2,
    Low: 3,
  };

  /* =====================================================
     TASK CALCULATIONS
  ===================================================== */

  const pendingTasks = tasks
    .filter((task) => !task.completed)
    .sort(
      (a, b) =>
        priorityOrder[a.priority] -
        priorityOrder[b.priority]
    );

  const completedTasks = tasks.filter(
    (task) => task.completed
  );

  const totalTasks = tasks.length;

  const completedCount =
    completedTasks.length;

  const progress =
    totalTasks === 0
      ? 0
      : completedCount / totalTasks;

  /*
    Only show the first three unfinished
    tasks after priority sorting.
  */

  const visibleTasks =
    pendingTasks.slice(0, 3);

  /* =====================================================
     NOTIFICATION CALCULATIONS
  ===================================================== */

  const today = startOfToday();

  const notifications: HomeNotification[] = [];

  /* =====================================================
     OVERDUE TASK NOTIFICATIONS
  ===================================================== */

  tasks.forEach((task) => {
    if (task.completed) {
      return;
    }

    const deadlineDate =
      parseTaskDeadline(task.deadline);

    if (!deadlineDate) {
      return;
    }

    if (deadlineDate.getTime() < Date.now()) {
      notifications.push({
        key: `overdue-task-${task.id}-${task.deadline}`,

        title: 'Overdue task',

        message: `"${task.title}" has passed its deadline.`,

        icon: 'alert-circle-outline',

        type: 'task',

        sortDate: deadlineDate.getTime(),
      });
    }
  });

  /* =====================================================
     UPCOMING QUIZ NOTIFICATIONS
  ===================================================== */

  scheduleEvents.forEach((event) => {
    if (event.eventType !== 'Quiz') {
      return;
    }

    const quizDate =
      parseDateOnly(event.date);

    if (!quizDate) {
      return;
    }

    const difference =
      quizDate.getTime() -
      today.getTime();

    const daysUntil =
      Math.round(
        difference / DAY_IN_MS
      );

    /*
      Only show quizzes that are:
      - today
      - or within the next 7 days
    */

    if (
      daysUntil >= 0 &&
      daysUntil <=
        QUIZ_NOTIFICATION_DAYS
    ) {
      let message = '';

      if (daysUntil === 0) {
        message = `"${event.subject}" has a quiz scheduled today.`;
      } else if (daysUntil === 1) {
        message = `"${event.subject}" has a quiz tomorrow.`;
      } else {
        message = `"${event.subject}" has a quiz in ${daysUntil} days.`;
      }

      notifications.push({
        key: `quiz-${event.id}-${event.date}`,

        title: 'Upcoming quiz',

        message,

        icon: 'help-circle-outline',

        type: 'quiz',

        sortDate: quizDate.getTime(),
      });
    }
  });

  /* =====================================================
     SORT NOTIFICATIONS
  ===================================================== */

  notifications.sort(
    (a, b) => {
      /*
        Overdue tasks first.
        Then upcoming quizzes by date.
      */

      if (
        a.type === 'task' &&
        b.type === 'quiz'
      ) {
        return -1;
      }

      if (
        a.type === 'quiz' &&
        b.type === 'task'
      ) {
        return 1;
      }

      return (
        a.sortDate -
        b.sortDate
      );
    }
  );

  /* =====================================================
     UNREAD NOTIFICATIONS
  ===================================================== */

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !seenNotificationKeys.includes(
          notification.key
        )
    );

  const hasUnreadNotifications =
    unreadNotifications.length > 0;

  /* =====================================================
     OPEN NOTIFICATIONS
  ===================================================== */

  const openNotifications = () => {
    setShowNotifications(true);

    /*
      Mark all currently displayed notifications
      as seen.
    */

    const currentKeys =
      notifications.map(
        (notification) =>
          notification.key
      );

    setSeenNotificationKeys(
      (currentSeen) =>
        Array.from(
          new Set([
            ...currentSeen,
            ...currentKeys,
          ])
        )
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.primary}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>
          <View style={styles.headerTop}>
            {/* MENU */}

            <Pressable
              style={styles.headerIconButton}
              onPress={() => setShowMenu(true)}
              accessibilityRole="button"
              accessibilityLabel="Open navigation menu"
            >
              <Ionicons
                name="menu-outline"
                size={28}
                color="#FFFFFF"
              />
            </Pressable>

            {/* RIGHT SIDE */}

            <View style={styles.headerRight}>
              {/* NOTIFICATION BELL */}

              <Pressable
                style={styles.headerIconButton}
                onPress={openNotifications}
              >
                <Ionicons
                  name={
                    hasUnreadNotifications
                      ? 'notifications'
                      : 'notifications-outline'
                  }
                  size={25}
                  color="#FFFFFF"
                />

                {hasUnreadNotifications && (
                  <View
                    style={
                      styles.notificationDot
                    }
                  />
                )}
              </Pressable>

              {/* AVATAR */}

              <Pressable
                onPress={onGoProfile}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Open profile"
              >
                <Image
                  source={require('../../assets/mark1.webp')}
                  style={styles.avatar}
                />
              </Pressable>
            </View>
          </View>

          {/* GREETING */}

          <View
            style={styles.greetingContainer}
          >
            <Text style={styles.goodMorning}>
              Good morning,
            </Text>

            <Text style={styles.greetingName}>
              Alex! 👋
            </Text>

            <Text
              style={styles.greetingSubtitle}
            >
              Stay productive today
            </Text>
          </View>
        </View>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <View style={styles.content}>
          {/* =================================================
              QUOTE CARD
          ================================================= */}

          <View style={styles.quoteCard}>
            <View
              style={styles.quoteTextContainer}
            >
              <Text style={styles.quoteText}>
                Small steps
              </Text>

              <Text style={styles.quoteText}>
                make big results.
              </Text>
            </View>

            <View style={styles.plantContainer}>
              <Ionicons
                name="leaf-outline"
                size={58}
                color={
                  theme.background ===
                  '#07152F'
                    ? '#5FA98D'
                    : '#73BFA0'
                }
              />

              <View style={styles.plantPot}>
                <View
                  style={styles.plantPotTop}
                />

                <View
                  style={styles.plantPotBody}
                />
              </View>
            </View>
          </View>

          {/* =================================================
              PROGRESS CARD
          ================================================= */}

          <View style={styles.progressCard}>
            <View
              style={
                styles.progressCircleContainer
              }
            >
              <View
                style={styles.progressCircleOuter}
              >
                <View
                  style={[
                    styles.progressCircleInner,
                    {
                      borderTopColor:
                        progress > 0
                          ? theme.primary
                          : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={
                      styles.progressNumber
                    }
                  >
                    {completedCount}
                  </Text>

                  <Text
                    style={
                      styles.progressSlash
                    }
                  >
                    /
                  </Text>

                  <Text
                    style={
                      styles.progressTotal
                    }
                  >
                    {totalTasks}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.progressInfo}>
              <Text
                style={styles.progressTitle}
              >
                Today’s Progress
              </Text>

              <Text
                style={styles.progressSubtitle}
              >
                {completedCount} of {totalTasks}{' '}
                tasks completed
              </Text>

              <View
                style={
                  styles.progressBarBackground
                }
              >
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${progress * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* =================================================
              TODAY'S TASKS HEADER
          ================================================= */}

          <View style={styles.sectionHeader}>
            <Text
              style={styles.sectionTitle}
            >
              Today’s Tasks
            </Text>

            <Pressable
              onPress={onGoToTasks}
            >
              <Text style={styles.seeAll}>
                See All
              </Text>
            </Pressable>
          </View>

          {/* =================================================
              TODAY'S TASKS

              Sorted:
              HIGH
              MEDIUM
              LOW
          ================================================= */}

          {visibleTasks.length > 0 ? (
            visibleTasks.map((task) => {
              const priorityColors =
                getPriorityColors(
                  task.priority,
                  theme
                );

              return (
                <Pressable
                  key={task.id}
                  style={styles.taskCard}
                  onPress={() =>
                    setSelectedTask(task)
                  }
                >
                  {/* =================================================
                      COMPLETION CIRCLE
                  ================================================= */}

                  <Pressable
                    style={[
                      styles.taskCircle,
                      task.completed &&
                        styles.completedTaskCircle,
                    ]}
                    onPress={() => {
                      onToggleTask(task.id);
                    }}
                    hitSlop={6}
                  >
                    {task.completed && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color="#FFFFFF"
                      />
                    )}
                  </Pressable>

                  {/* =================================================
                      TASK INFORMATION
                  ================================================= */}

                  <View
                    style={styles.taskInfo}
                  >
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

                    <View
                      style={styles.taskMeta}
                    >
                      <Text
                        style={
                          styles.taskDeadline
                        }
                      >
                        {task.deadline}
                      </Text>

                      {/* PRIORITY BADGE */}

                      <View
                        style={[
                          styles.priorityBadge,
                          {
                            backgroundColor:
                              priorityColors.background,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityText,
                            {
                              color:
                                priorityColors.text,
                            },
                          ]}
                        >
                          {task.priority}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* =================================================
                      DETAILS ARROW
                  ================================================= */}

                  <Pressable
                    style={styles.taskArrowButton}
                    onPress={() =>
                      setSelectedTask(task)
                    }
                    hitSlop={8}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={21}
                      color={theme.textMuted}
                    />
                  </Pressable>
                </Pressable>
              );
            })
          ) : (
            /* =================================================
               EMPTY STATE
            ================================================= */

            <View
              style={styles.emptyTasks}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={42}
                color={theme.primary}
              />

              <Text
                style={styles.emptyTasksTitle}
              >
                All tasks completed!
              </Text>

              <Text
                style={styles.emptyTasksText}
              >
                Great job. You're all caught up.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* =====================================================
          QUICK NAVIGATION MENU
      ===================================================== */}

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <View style={styles.menuOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowMenu(false)}
            accessibilityRole="button"
            accessibilityLabel="Close navigation menu"
          />

          <View style={styles.menuDrawer}>
            <View style={styles.menuHeader}>
              <View>
                <Text style={styles.menuEyebrow}>
                  SCHEDLY
                </Text>
                <Text style={styles.menuTitle}>
                  Quick navigation
                </Text>
              </View>

              <Pressable
                style={styles.menuCloseButton}
                onPress={() => setShowMenu(false)}
                accessibilityRole="button"
                accessibilityLabel="Close navigation menu"
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={theme.textSecondary}
                />
              </Pressable>
            </View>

            <View style={styles.menuDivider} />

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onGoToTasks();
              }}
              accessibilityRole="button"
            >
              <View style={styles.menuItemIcon}>
                <Ionicons
                  name="checkbox-outline"
                  size={22}
                  color={theme.primary}
                />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>
                  Tasks
                </Text>
                <Text style={styles.menuItemDescription}>
                  View and update your task list
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.textMuted}
              />
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onGoToSchedule();
              }}
              accessibilityRole="button"
            >
              <View style={styles.menuItemIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color={theme.primary}
                />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>
                  Study Schedule
                </Text>
                <Text style={styles.menuItemDescription}>
                  Plan quizzes, exams, and activities
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.textMuted}
              />
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onGoMore();
              }}
              accessibilityRole="button"
            >
              <View style={styles.menuItemIcon}>
                <Ionicons
                  name="ellipsis-horizontal"
                  size={22}
                  color={theme.primary}
                />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>
                  More
                </Text>
                <Text style={styles.menuItemDescription}>
                  Profile, settings, and support
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.textMuted}
              />
            </Pressable>

            <View style={styles.menuFooter}>
              <Text style={styles.menuFooterText}>
                Stay organized, one step at a time.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          TASK DETAIL FLASHCARD
      ===================================================== */}

      <Modal
        visible={selectedTask !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() =>
          setSelectedTask(null)
        }
      >
        <View style={styles.modalOverlay}>
          {/* BACKDROP */}

          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() =>
              setSelectedTask(null)
            }
          />

          {/* FLASHCARD */}

          {selectedTask && (
            <View style={styles.detailCard}>
              {/* =================================================
                  DETAIL HEADER
              ================================================= */}

              <View
                style={styles.detailHeader}
              >
                <View
                  style={
                    styles.detailHeaderTitleContainer
                  }
                >
                  <Text
                    style={styles.detailLabel}
                  >
                    TASK DETAILS
                  </Text>

                  <Text
                    style={styles.detailTitle}
                  >
                    {selectedTask.title}
                  </Text>
                </View>

                <Pressable
                  style={styles.closeButton}
                  onPress={() =>
                    setSelectedTask(null)
                  }
                  hitSlop={8}
                >
                  <Ionicons
                    name="close"
                    size={23}
                    color={theme.textSecondary}
                  />
                </Pressable>
              </View>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <View
                style={styles.detailSection}
              >
                <Text
                  style={
                    styles.detailSectionLabel
                  }
                >
                  Description
                </Text>

                <Text
                  style={styles.detailDescription}
                >
                  {selectedTask.description?.trim()
                    ? selectedTask.description
                    : 'No description added for this task.'}
                </Text>
              </View>

              {/* =================================================
                  DEADLINE + PRIORITY
              ================================================= */}

              <View
                style={styles.detailMetaRow}
              >
                {/* DEADLINE */}

                <View
                  style={styles.detailMetaItem}
                >
                  <View
                    style={
                      styles.detailIconContainer
                    }
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={theme.primary}
                    />
                  </View>

                  <View>
                    <Text
                      style={
                        styles.detailMetaLabel
                      }
                    >
                      Deadline
                    </Text>

                    <Text
                      style={
                        styles.detailMetaValue
                      }
                    >
                      {selectedTask.deadline}
                    </Text>
                  </View>
                </View>

                {/* PRIORITY */}

                <View
                  style={styles.detailMetaItem}
                >
                  <View
                    style={
                      styles.detailIconContainer
                    }
                  >
                    <Ionicons
                      name="flag-outline"
                      size={18}
                      color={
                        getPriorityColors(
                          selectedTask.priority,
                          theme
                        ).text
                      }
                    />
                  </View>

                  <View>
                    <Text
                      style={
                        styles.detailMetaLabel
                      }
                    >
                      Priority
                    </Text>

                    <View
                      style={[
                        styles.detailPriorityBadge,
                        {
                          backgroundColor:
                            getPriorityColors(
                              selectedTask.priority,
                              theme
                            ).background,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.detailPriorityText,
                          {
                            color:
                              getPriorityColors(
                                selectedTask.priority,
                                theme
                              ).text,
                          },
                        ]}
                      >
                        {selectedTask.priority}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* =================================================
                  COMPLETION STATUS
              ================================================= */}

              <View
                style={styles.statusContainer}
              >
                <View
                  style={[
                    styles.statusIcon,
                    {
                      backgroundColor:
                        selectedTask.completed
                          ? theme.success
                          : theme.primaryLight,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      selectedTask.completed
                        ? 'checkmark'
                        : 'time-outline'
                    }
                    size={18}
                    color={
                      selectedTask.completed
                        ? '#FFFFFF'
                        : theme.primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.statusTextContainer
                  }
                >
                  <Text
                    style={styles.statusTitle}
                  >
                    {selectedTask.completed
                      ? 'Completed'
                      : 'Not completed'}
                  </Text>

                  <Text
                    style={
                      styles.statusSubtitle
                    }
                  >
                    {selectedTask.completed
                      ? 'This task has been completed.'
                      : 'Tap the circle on the task card to mark it complete.'}
                  </Text>
                </View>
              </View>

              {/* =================================================
                  CLOSE BUTTON
              ================================================= */}

              <Pressable
                style={
                  styles.detailCloseButton
                }
                onPress={() =>
                  setSelectedTask(null)
                }
              >
                <Text
                  style={
                    styles.detailCloseButtonText
                  }
                >
                  Close
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>

      {/* =====================================================
          NOTIFICATIONS MODAL
      ===================================================== */}

      <Modal
        visible={showNotifications}
        transparent={true}
        animationType="fade"
        onRequestClose={() =>
          setShowNotifications(false)
        }
      >
        <View
          style={
            styles.notificationModalOverlay
          }
        >
          {/* BACKDROP */}

          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() =>
              setShowNotifications(false)
            }
          />

          {/* NOTIFICATION CARD */}

          <View
            style={
              styles.notificationCard
            }
          >
            {/* HEADER */}

            <View
              style={
                styles.notificationHeader
              }
            >
              <View
                style={
                  styles.notificationHeaderText
                }
              >
                <Text
                  style={
                    styles.notificationTitle
                  }
                >
                  Notifications
                </Text>

                <Text
                  style={
                    styles.notificationSubtitle
                  }
                >
                  Your latest schedule alerts
                </Text>
              </View>

              <Pressable
                style={
                  styles.notificationCloseButton
                }
                onPress={() =>
                  setShowNotifications(false)
                }
                hitSlop={8}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color={theme.textSecondary}
                />
              </Pressable>
            </View>

            {/* NOTIFICATION LIST */}

            {notifications.length > 0 ? (
              <ScrollView
                style={
                  styles.notificationList
                }
                showsVerticalScrollIndicator={
                  false
              }
              >
                {notifications.map(
                  (notification) => {
                    const isTask =
                      notification.type ===
                      'task';

                    return (
                      <View
                        key={
                          notification.key
                        }
                        style={
                          styles.notificationItem
                        }
                      >
                        <View
                          style={[
                            styles.notificationIcon,
                            {
                              backgroundColor:
                                isTask
                                  ? theme.logoutBackground
                                  : theme.primaryLight,
                            },
                          ]}
                        >
                          <Ionicons
                            name={
                              notification.icon
                            }
                            size={21}
                            color={
                              isTask
                                ? theme.danger
                                : theme.primary
                            }
                          />
                        </View>

                        <View
                          style={
                            styles.notificationContent
                          }
                        >
                          <Text
                            style={
                              styles.notificationItemTitle
                            }
                          >
                            {
                              notification.title
                            }
                          </Text>

                          <Text
                            style={
                              styles.notificationItemText
                            }
                          >
                            {
                              notification.message
                            }
                          </Text>
                        </View>
                      </View>
                    );
                  }
                )}
              </ScrollView>
            ) : (
              /* EMPTY NOTIFICATION STATE */

              <View
                style={
                  styles.notificationEmpty
                }
              >
                <View
                  style={
                    styles.notificationEmptyIcon
                  }
                >
                  <Ionicons
                    name="checkmark"
                    size={28}
                    color={theme.success}
                  />
                </View>

                <Text
                  style={
                    styles.notificationEmptyTitle
                  }
                >
                  You're all caught up
                </Text>

                <Text
                  style={
                    styles.notificationEmptyText
                  }
                >
                  There are no new schedule or task
                  notifications right now.
                </Text>
              </View>
            )}

            {/* CLOSE BUTTON */}

            <Pressable
              style={
                styles.notificationDoneButton
              }
              onPress={() =>
                setShowNotifications(false)
              }
            >
              <Text
                style={
                  styles.notificationDoneButtonText
                }
              >
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          FLOATING ADD TASK BUTTON
      ===================================================== */}

      <Pressable
        style={styles.floatingButton}
        onPress={onAddTask}
      >
        <Ionicons
          name="add"
          size={32}
          color="#FFFFFF"
        />
      </Pressable>

      {/* =====================================================
          BOTTOM NAVIGATION
      ===================================================== */}

      <View
        style={styles.bottomNavigation}
      >
        {/* HOME */}

        <Pressable
          style={styles.bottomItem}
        >
          <Ionicons
            name="home"
            size={23}
            color={theme.primary}
          />

          <Text
            style={[
              styles.bottomLabel,
              styles.activeLabel,
            ]}
          >
            Home
          </Text>
        </Pressable>

        {/* TASKS */}

        <Pressable
          style={styles.bottomItem}
          onPress={onGoToTasks}
        >
          <Ionicons
            name="checkbox-outline"
            size={23}
            color={theme.tabInactive}
          />

          <Text
            style={styles.bottomLabel}
          >
            Tasks
          </Text>
        </Pressable>

        {/* SCHEDULE */}

        <Pressable
          style={styles.bottomItem}
          onPress={onGoToSchedule}
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

/* =========================================================
   DATE HELPERS
========================================================= */

/*
  Creates today's date at midnight.

  Using local time here avoids the common JavaScript
  timezone problem caused by:

  new Date("2026-09-26")
*/
function startOfToday(): Date {
  const date = new Date();

  date.setHours(
    0,
    0,
    0,
    0
  );

  return date;
}

/*
  Parses a YYYY-MM-DD date without UTC conversion.

  Example:

  "2026-09-26"

  becomes:

  September 26, 2026 at local midnight.
*/
function parseDateOnly(
  value: string
): Date | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      value.trim()
    );

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(
    year,
    month - 1,
    day
  );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/*
  Parses task deadlines.

  Your AddTaskScreen stores dates as:

  YYYY-MM-DD

  But this helper also supports dates such as:

  Sep 26, 2026
  2026-09-26T18:00:00.000Z
*/
function parseTaskDeadline(
  deadline: string
): Date | null {
  const trimmed =
    deadline.trim();

  if (!trimmed) {
    return null;
  }

  /* YYYY-MM-DD */

  const dateOnly =
    parseDateOnly(trimmed);

  if (dateOnly) {
    /*
      A date-only task is considered overdue
      after the entire deadline day has passed.
    */

    dateOnly.setHours(
      23,
      59,
      59,
      999
    );

    return dateOnly;
  }

  /* Other JavaScript-compatible date strings */

  const parsed =
    new Date(trimmed);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return null;
  }

  return parsed;
}

/* =========================================================
   PRIORITY COLORS
========================================================= */

function getPriorityColors(
  priority: Task['priority'],
  theme: AppTheme
) {
  if (priority === 'High') {
    return {
      background:
        theme.background === '#07152F'
          ? '#47222B'
          : '#FFE3E6',

      text:
        theme.background === '#07152F'
          ? '#FF7C8A'
          : '#E24B5A',
    };
  }

  if (priority === 'Medium') {
    return {
      background:
        theme.background === '#07152F'
          ? '#493B1B'
          : '#FFF0C8',

      text:
        theme.background === '#07152F'
          ? '#FFD75C'
          : '#A47714',
    };
  }

  return {
    background:
      theme.background === '#07152F'
        ? '#193E32'
        : '#DDF7E8',

    text:
      theme.background === '#07152F'
        ? '#5BE5A5'
        : '#35A66B',
  };
}

/* =========================================================
   STYLES
========================================================= */

const createStyles = (
  theme: AppTheme
) =>
  StyleSheet.create({
    /* =====================================================
       SCREEN
    ===================================================== */

    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    scrollContent: {
      paddingBottom: 110,
    },

    /* =====================================================
       HEADER
    ===================================================== */

    header: {
      backgroundColor: theme.primary,
      paddingHorizontal: 18,
      paddingTop: 45,
      paddingBottom: 27,
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
    },

    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    headerIconButton: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },

    menuOverlay: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: 'rgba(0, 0, 0, 0.38)',
    },

    menuDrawer: {
      width: '82%',
      maxWidth: 330,
      height: '100%',
      paddingHorizontal: 20,
      paddingTop: 54,
      paddingBottom: 24,
      backgroundColor: theme.card,
      borderRightWidth: 1,
      borderRightColor: theme.border,
    },

    menuHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    menuEyebrow: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.primary,
    },

    menuTitle: {
      marginTop: 5,
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
    },

    menuCloseButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.cardSecondary,
    },

    menuDivider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 20,
    },

    menuItem: {
      minHeight: 72,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 10,
      marginBottom: 9,
      borderRadius: 14,
      backgroundColor: theme.cardSecondary,
    },

    menuItemIcon: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 11,
      borderRadius: 13,
      backgroundColor: theme.primaryLight,
    },

    menuItemContent: {
      flex: 1,
      marginRight: 6,
    },

    menuItemTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
    },

    menuItemDescription: {
      marginTop: 4,
      fontSize: 11,
      lineHeight: 15,
      color: theme.textSecondary,
    },

    menuFooter: {
      marginTop: 'auto',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },

    menuFooterText: {
      fontSize: 12,
      color: theme.textMuted,
    },

    notificationDot: {
      position: 'absolute',
      top: 8,
      right: 7,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FF4F5E',
      borderWidth: 1.5,
      borderColor: theme.primary,
    },

    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginLeft: 8,
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },

    greetingContainer: {
      marginTop: 20,
    },

    goodMorning: {
      fontSize: 15,
      color: '#DCEBFF',
      marginBottom: 2,
    },

    greetingName: {
      fontSize: 28,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    greetingSubtitle: {
      fontSize: 14,
      color: '#DCEBFF',
      marginTop: 4,
    },

    /* =====================================================
       MAIN CONTENT
    ===================================================== */

    content: {
      paddingHorizontal: 18,
      paddingTop: 18,
    },

    /* =====================================================
       QUOTE CARD
    ===================================================== */

    quoteCard: {
      height: 125,
      backgroundColor:
        theme.motivationBackground,
      borderRadius: 19,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      overflow: 'hidden',
    },

    quoteTextContainer: {
      flex: 1,
    },

    quoteText: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.motivationText,
      lineHeight: 27,
    },

    plantContainer: {
      width: 100,
      height: 100,
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: 5,
    },

    plantPot: {
      alignItems: 'center',
      marginTop: -10,
    },

    plantPotTop: {
      width: 34,
      height: 6,
      borderRadius: 3,
      backgroundColor:
        theme.background === '#07152F'
          ? '#A96F49'
          : '#D89A68',
    },

    plantPotBody: {
      width: 28,
      height: 25,
      backgroundColor:
        theme.background === '#07152F'
          ? '#B9825D'
          : '#E9B080',
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
    },

    /* =====================================================
       PROGRESS CARD
    ===================================================== */

    progressCard: {
      backgroundColor: theme.card,
      borderRadius: 19,
      marginTop: 15,
      padding: 17,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 1,
    },

    progressCircleContainer: {
      width: 75,
      height: 75,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },

    progressCircleOuter: {
      width: 68,
      height: 68,
      borderRadius: 34,
      borderWidth: 7,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    progressCircleInner: {
      width: 54,
      height: 54,
      borderRadius: 27,
      borderWidth: 4,
      borderColor: 'transparent',
      borderTopColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },

    progressNumber: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
    },

    progressSlash: {
      fontSize: 13,
      color: theme.textMuted,
      marginHorizontal: 1,
    },

    progressTotal: {
      fontSize: 13,
      color: theme.textMuted,
      fontWeight: '600',
    },

    progressInfo: {
      flex: 1,
    },

    progressTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.text,
    },

    progressSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
      marginBottom: 10,
    },

    progressBarBackground: {
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.border,
      overflow: 'hidden',
    },

    progressBar: {
      height: '100%',
      backgroundColor: theme.primary,
      borderRadius: 4,
    },

    /* =====================================================
       SECTION HEADER
    ===================================================== */

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 23,
      marginBottom: 12,
    },

    sectionTitle: {
      fontSize: 19,
      fontWeight: '800',
      color: theme.text,
    },

    seeAll: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.primary,
    },

    /* =====================================================
       TASK CARD
    ===================================================== */

    taskCard: {
      minHeight: 75,
      backgroundColor: theme.card,
      borderRadius: 16,
      marginBottom: 10,
      paddingHorizontal: 13,
      paddingVertical: 11,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 1,
    },

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

    completedTaskCircle: {
      backgroundColor: theme.primary,
    },

    taskInfo: {
      flex: 1,
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

    taskMeta: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    taskDeadline: {
      fontSize: 12,
      color: theme.textSecondary,
      marginRight: 8,
    },

    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },

    priorityText: {
      fontSize: 10,
      fontWeight: '700',
    },

    /* =====================================================
       TASK ARROW
    ===================================================== */

    taskArrowButton: {
      width: 34,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* =====================================================
       EMPTY TASKS
    ===================================================== */

    emptyTasks: {
      backgroundColor: theme.card,
      borderRadius: 16,
      paddingVertical: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },

    emptyTasksTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
      marginTop: 8,
    },

    emptyTasksText: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
    },

    /* =====================================================
       TASK DETAIL MODAL
    ===================================================== */

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.48)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },

    detailCard: {
      width: '100%',
      maxWidth: 430,
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 22,
      elevation: 8,
      shadowColor: theme.shadow,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.2,
      shadowRadius: 15,
    },

    detailHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },

    detailHeaderTitleContainer: {
      flex: 1,
      paddingRight: 15,
    },

    detailLabel: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.2,
      color: theme.primary,
      marginBottom: 5,
    },

    detailTitle: {
      fontSize: 23,
      lineHeight: 29,
      fontWeight: '800',
      color: theme.text,
    },

    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },

    detailSection: {
      marginTop: 22,
    },

    detailSectionLabel: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.textSecondary,
      marginBottom: 7,
    },

    detailDescription: {
      fontSize: 14,
      lineHeight: 21,
      color: theme.text,
    },

    detailMetaRow: {
      flexDirection: 'row',
      marginTop: 22,
      paddingTop: 18,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },

    detailMetaItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },

    detailIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 9,
    },

    detailMetaLabel: {
      fontSize: 10,
      color: theme.textMuted,
      marginBottom: 3,
    },

    detailMetaValue: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text,
    },

    detailPriorityBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 6,
    },

    detailPriorityText: {
      fontSize: 10,
      fontWeight: '800',
    },

    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
      padding: 12,
      borderRadius: 14,
      backgroundColor: theme.cardSecondary,
      borderWidth: 1,
      borderColor: theme.border,
    },

    statusIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },

    statusTextContainer: {
      flex: 1,
    },

    statusTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.text,
    },

    statusSubtitle: {
      fontSize: 10.5,
      lineHeight: 15,
      color: theme.textSecondary,
      marginTop: 2,
    },

    detailCloseButton: {
      height: 47,
      borderRadius: 13,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
    },

    detailCloseButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },

    /* =====================================================
       NOTIFICATION MODAL
    ===================================================== */

    notificationModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.48)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
    },

    notificationCard: {
      width: '100%',
      maxWidth: 430,
      maxHeight: '78%',
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 20,
      elevation: 8,
      shadowColor: theme.shadow,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.2,
      shadowRadius: 15,
    },

    notificationHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },

    notificationHeaderText: {
      flex: 1,
      paddingRight: 12,
    },

    notificationTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.text,
    },

    notificationSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
    },

    notificationCloseButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },

    notificationList: {
      marginTop: 8,
    },

    notificationItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 13,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },

    notificationIcon: {
      width: 43,
      height: 43,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    notificationContent: {
      flex: 1,
      paddingTop: 1,
    },

    notificationItemTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 4,
    },

    notificationItemText: {
      fontSize: 12,
      lineHeight: 18,
      color: theme.textSecondary,
    },

    notificationEmpty: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      paddingVertical: 42,
    },

    notificationEmptyIcon: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor:
        theme.background === '#07152F'
          ? '#193E32'
          : '#DDF7E8',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },

    notificationEmptyTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
    },

    notificationEmptyText: {
      fontSize: 12,
      lineHeight: 18,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 6,
    },

    notificationDoneButton: {
      height: 46,
      borderRadius: 13,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 15,
    },

    notificationDoneButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },

    /* =====================================================
       FLOATING ADD BUTTON
    ===================================================== */

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

    /* =====================================================
       BOTTOM NAVIGATION
    ===================================================== */

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