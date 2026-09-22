import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Image,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import type { Task } from '../types/task';
import { useApp } from '../context/AppContext';
import type { AppTheme } from '../theme/theme';

type HomeScreenProps = {
  tasks: Task[];
  onAddTask: () => void;
  onToggleTask: (taskId: number) => void;
  onGoToTasks: () => void;
  onGoToSchedule: () => void;
  onGoMore: () => void;
};

export default function HomeScreen({
  tasks,
  onAddTask,
  onToggleTask,
  onGoToTasks,
  onGoToSchedule,
  onGoMore,
}: HomeScreenProps) {
  /* =====================================================
     APP THEME
  ===================================================== */

  const { theme } = useApp();

  const styles = createStyles(theme);

  /* =====================================================
     TASK CALCULATIONS
  ===================================================== */

  const pendingTasks = tasks.filter(
    (task) => !task.completed
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

  const visibleTasks =
    pendingTasks.slice(0, 3);

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={
          theme.background === '#07152F'
            ? 'light-content'
            : 'light-content'
        }
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
              onPress={() => {}}
            >
              <Ionicons
                name="menu-outline"
                size={28}
                color="#FFFFFF"
              />
            </Pressable>

            {/* RIGHT SIDE */}

            <View style={styles.headerRight}>
              <Pressable
                style={styles.headerIconButton}
                onPress={() => {}}
              >
                <Ionicons
                  name="notifications-outline"
                  size={25}
                  color="#FFFFFF"
                />

                <View
                  style={styles.notificationDot}
                />
              </Pressable>

              <Image
                source={require('../../assets/mark1.webp')}
                style={styles.avatar}
              />
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
              TASKS
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
                    onToggleTask(task.id)
                  }
                >
                  {/* CHECK CIRCLE */}

                  <View
                    style={[
                      styles.taskCircle,
                      task.completed &&
                        styles.completedTaskCircle,
                    ]}
                  >
                    {task.completed && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color="#FFFFFF"
                      />
                    )}
                  </View>

                  {/* TASK INFORMATION */}

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

                      {/* PRIORITY */}

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
                                priorityColors
                                  .text,
                            },
                          ]}
                        >
                          {task.priority}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* ARROW */}

                  <Ionicons
                    name="chevron-forward"
                    size={21}
                    color={theme.textMuted}
                  />
                </Pressable>
              );
            })
          ) : (
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

      {/* =================================================
          FLOATING ADD BUTTON
      ================================================= */}

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

      {/* =================================================
          BOTTOM NAVIGATION
      ================================================= */}

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

/* =====================================================
   PRIORITY COLORS
===================================================== */

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

/* =====================================================
   STYLES
===================================================== */

const createStyles = (
  theme: AppTheme
) =>
  StyleSheet.create({
    /* =================================================
       SCREEN
    ================================================= */

    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    scrollContent: {
      paddingBottom: 110,
    },

    /* =================================================
       HEADER
    ================================================= */

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

    /* =================================================
       MAIN CONTENT
    ================================================= */

    content: {
      paddingHorizontal: 18,
      paddingTop: 18,
    },

    /* =================================================
       QUOTE CARD
    ================================================= */

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

    /* =================================================
       PROGRESS CARD
    ================================================= */

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

    /* =================================================
       SECTION
    ================================================= */

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

    /* =================================================
       TASK CARD
    ================================================= */

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

    /* =================================================
       EMPTY TASKS
    ================================================= */

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

    /* =================================================
       FLOATING BUTTON
    ================================================= */

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

    /* =================================================
       BOTTOM NAVIGATION
    ================================================= */

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