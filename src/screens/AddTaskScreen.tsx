import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';

import { useState } from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import type { Task } from '../types/task';
import { useApp } from '../context/AppContext';
import type { AppTheme } from '../theme/theme';
import FlashcardModal from '../components/FlashcardModal';
import { useFlashcard } from '../hooks/useFlashcard';

type AddTaskScreenProps = {
  onBack: () => void;
  onSaveTask: (task: Task) => void;
};

export default function AddTaskScreen({
  onBack,
  onSaveTask,
}: AddTaskScreenProps) {
  /* =====================================================
     APP THEME
  ===================================================== */

  const { theme } = useApp();

  const {
    flashcard,
    showFlashcard,
    closeFlashcard,
  } = useFlashcard();

  const styles = createStyles(theme);

  /* =====================================================
     PRIORITY COLORS
  ===================================================== */

  const priorityColors = {
    high: {
      icon: theme.danger,
      text: theme.danger,
      background: theme.danger + '18',
      border: theme.danger + '55',
    },

    medium: {
      icon: theme.warning,
      text: theme.warning,
      background: theme.warning + '18',
      border: theme.warning + '55',
    },

    low: {
      icon: theme.success,
      text: theme.success,
      background: theme.success + '18',
      border: theme.success + '55',
    },
  };

  /* =====================================================
     FORM STATE
  ===================================================== */

  const [title, setTitle] = useState('');

  const [description, setDescription] =
    useState('');

  const [priority, setPriority] = useState<
    'High' | 'Medium' | 'Low'
  >('Medium');

  /*
   * SQLite will receive an actual date:
   *
   * YYYY-MM-DD
   *
   * Example:
   * 2026-09-26
   */
  const [deadline, setDeadline] =
    useState('');

  /* =====================================================
     CALENDAR STATE
  ===================================================== */

  const today = new Date();

  const [calendarVisible, setCalendarVisible] =
    useState(false);

  /*
   * This controls which month the mini calendar
   * is currently displaying.
   */
  const [calendarMonth, setCalendarMonth] =
    useState(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );

  /* =====================================================
     DATE HELPERS
  ===================================================== */

  const padNumber = (value: number) => {
    return value.toString().padStart(2, '0');
  };

  const formatDateForStorage = (
    date: Date
  ) => {
    return `${date.getFullYear()}-${padNumber(
      date.getMonth() + 1
    )}-${padNumber(date.getDate())}`;
  };

  const formatDateForDisplay = (
    dateString: string
  ) => {
    if (!dateString) {
      return 'Select date';
    }

    const parts = dateString.split('-');

    if (parts.length !== 3) {
      return dateString;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    const date = new Date(
      year,
      month - 1,
      day
    );

    return date.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    );
  };

  const isSameDate = (
    first: Date,
    second: Date
  ) => {
    return (
      first.getFullYear() ===
        second.getFullYear() &&
      first.getMonth() ===
        second.getMonth() &&
      first.getDate() ===
        second.getDate()
    );
  };

  /* =====================================================
     QUICK DATE SELECTION
  ===================================================== */

  const selectToday = () => {
    const selectedDate = new Date();

    setDeadline(
      formatDateForStorage(selectedDate)
    );

    setCalendarMonth(
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
      )
    );

    setCalendarVisible(false);
  };

  const selectTomorrow = () => {
    const selectedDate = new Date();

    selectedDate.setDate(
      selectedDate.getDate() + 1
    );

    setDeadline(
      formatDateForStorage(selectedDate)
    );

    setCalendarMonth(
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
      )
    );

    setCalendarVisible(false);
  };

  /* =====================================================
     CALENDAR NAVIGATION
  ===================================================== */

  const goToPreviousMonth = () => {
    setCalendarMonth(
      new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth() - 1,
        1
      )
    );
  };

  const goToNextMonth = () => {
    setCalendarMonth(
      new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth() + 1,
        1
      )
    );
  };

  /* =====================================================
     CALENDAR GENERATION
  ===================================================== */

  const getCalendarDays = () => {
    const year =
      calendarMonth.getFullYear();

    const month =
      calendarMonth.getMonth();

    const firstDayOfMonth =
      new Date(year, month, 1);

    const lastDayOfMonth =
      new Date(year, month + 1, 0);

    /*
     * JavaScript:
     *
     * Sunday = 0
     * Monday = 1
     * ...
     * Saturday = 6
     *
     * We want Monday as the first column.
     */
    const firstDayIndex =
      (firstDayOfMonth.getDay() + 6) % 7;

    const daysInMonth =
      lastDayOfMonth.getDate();

    const days: (
      | Date
      | null
    )[] = [];

    /*
     * Empty spaces before the first day.
     */
    for (
      let i = 0;
      i < firstDayIndex;
      i++
    ) {
      days.push(null);
    }

    /*
     * Actual days.
     */
    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      days.push(
        new Date(
          year,
          month,
          day
        )
      );
    }

    return days;
  };

  const calendarDays =
    getCalendarDays();

  /* =====================================================
     CALENDAR DATE SELECTION
  ===================================================== */

  const handleCalendarDateSelect = (
    selectedDate: Date
  ) => {
    setDeadline(
      formatDateForStorage(selectedDate)
    );

    setCalendarVisible(false);
  };

  /* =====================================================
     SAVE TASK
  ===================================================== */

  const handleSaveTask = () => {
    /* TITLE VALIDATION */

    if (!title.trim()) {
      showFlashcard({
        title: 'Task Title Required',
        message: 'Please enter a title for your task.',
        tone: 'warning',
      });

      return;
    }

    /* DEADLINE VALIDATION */

    if (!deadline) {
      showFlashcard({
        title: 'Deadline Required',
        message: 'Please select a deadline.',
        tone: 'warning',
      });

      return;
    }

    /* CREATE NEW TASK */

    const newTask: Task = {
      id: Date.now(),

      title: title.trim(),

      description: description.trim(),

      priority,

      deadline,

      completed: false,
    };

    /* SEND TO APP */

    onSaveTask(newTask);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle={
          theme.background === '#07152F'
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={
          theme.background
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-back"
              size={30}
              color={theme.text}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Add Task
          </Text>

          <View
            style={styles.headerSpacer}
          />
        </View>

        {/* =================================================
            ILLUSTRATION
        ================================================= */}

        <View
          style={
            styles.illustrationContainer
          }
        >
          <View
            style={
              styles.illustrationBackground
            }
          >
            <View
              style={styles.document}
            >
              <View
                style={styles.documentTop}
              />

              <View
                style={styles.documentLine}
              />

              <View
                style={
                  styles.documentLineSmall
                }
              />

              <View
                style={styles.documentLine}
              />
            </View>

            <View
              style={styles.plusCircle}
            >
              <Ionicons
                name="add"
                size={28}
                color="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* =================================================
            INTRO
        ================================================= */}

        <Text style={styles.introTitle}>
          Create a new task
        </Text>

        <Text
          style={styles.introSubtitle}
        >
          Add details to stay organized
        </Text>

        {/* =================================================
            TITLE
        ================================================= */}

        <Text style={styles.label}>
          Task Title
        </Text>

        <View
          style={styles.inputContainer}
        >
          <Ionicons
            name="document-text-outline"
            size={23}
            color={theme.primary}
          />

          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Math Assignment"
            placeholderTextColor={
              theme.textMuted
            }
            returnKeyType="next"
          />
        </View>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <Text style={styles.label}>
          Description (optional)
        </Text>

        <View
          style={[
            styles.inputContainer,
            styles.descriptionContainer,
          ]}
        >
          <Ionicons
            name="document-text-outline"
            size={23}
            color={theme.primary}
            style={
              styles.descriptionIcon
            }
          />

          <TextInput
            style={[
              styles.input,
              styles.descriptionInput,
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Do problems 1–10"
            placeholderTextColor={
              theme.textMuted
            }
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* =================================================
            PRIORITY
        ================================================= */}

        <Text style={styles.label}>
          Priority
        </Text>

        <View
          style={styles.priorityContainer}
        >
          {/* =================================================
              HIGH
          ================================================= */}

          <Pressable
            onPress={() =>
              setPriority('High')
            }
            style={[
              styles.priorityButton,
              {
                backgroundColor:
                  priorityColors.high
                    .background,
                borderColor:
                  priorityColors.high
                    .border,
              },
              priority === 'High' &&
                styles.selectedPriority,
            ]}
          >
            <Ionicons
              name="alert-circle"
              size={21}
              color={
                priorityColors.high.icon
              }
            />

            <Text
              style={[
                styles.priorityText,
                {
                  color:
                    priorityColors.high
                      .text,
                },
              ]}
            >
              High
            </Text>
          </Pressable>

          {/* =================================================
              MEDIUM
          ================================================= */}

          <Pressable
            onPress={() =>
              setPriority('Medium')
            }
            style={[
              styles.priorityButton,
              {
                backgroundColor:
                  priorityColors.medium
                    .background,
                borderColor:
                  priorityColors.medium
                    .border,
              },
              priority === 'Medium' &&
                styles.selectedPriority,
            ]}
          >
            <Ionicons
              name="remove-circle"
              size={21}
              color={
                priorityColors.medium.icon
              }
            />

            <Text
              style={[
                styles.priorityText,
                {
                  color:
                    priorityColors.medium
                      .text,
                },
              ]}
            >
              Medium
            </Text>
          </Pressable>

          {/* =================================================
              LOW
          ================================================= */}

          <Pressable
            onPress={() =>
              setPriority('Low')
            }
            style={[
              styles.priorityButton,
              {
                backgroundColor:
                  priorityColors.low
                    .background,
                borderColor:
                  priorityColors.low
                    .border,
              },
              priority === 'Low' &&
                styles.selectedPriority,
            ]}
          >
            <Ionicons
              name="leaf"
              size={21}
              color={
                priorityColors.low.icon
              }
            />

            <Text
              style={[
                styles.priorityText,
                {
                  color:
                    priorityColors.low
                      .text,
                },
              ]}
            >
              Low
            </Text>
          </Pressable>
        </View>

        {/* =================================================
            DEADLINE
        ================================================= */}

        <Text style={styles.label}>
          Deadline
        </Text>

        {/* =================================================
            DATE INPUT
        ================================================= */}

        <Pressable
          style={[
            styles.deadlineButton,
            deadline &&
              styles.deadlineButtonSelected,
          ]}
          onPress={() =>
            setCalendarVisible(
              !calendarVisible
            )
          }
        >
          <Ionicons
            name="calendar-outline"
            size={24}
            color={theme.primary}
          />

          <Text
            style={[
              styles.deadlineText,
              deadline &&
                styles.selectedDeadlineText,
            ]}
          >
            {deadline
              ? formatDateForDisplay(
                  deadline
                )
              : 'Select date'}
          </Text>

          <Ionicons
            name={
              calendarVisible
                ? 'chevron-up'
                : 'chevron-down'
            }
            size={22}
            color={theme.primary}
          />
        </Pressable>

        {/* =================================================
            QUICK DATE BUTTONS
        ================================================= */}

        <View
          style={
            styles.quickDateContainer
          }
        >
          <Pressable
            onPress={selectToday}
            style={[
              styles.quickDateButton,
              deadline ===
                formatDateForStorage(
                  today
                ) &&
                styles.quickDateButtonSelected,
            ]}
          >
            <Ionicons
              name="today-outline"
              size={18}
              color={
                deadline ===
                formatDateForStorage(
                  today
                )
                  ? '#FFFFFF'
                  : theme.primary
              }
            />

            <Text
              style={[
                styles.quickDateText,
                deadline ===
                  formatDateForStorage(
                    today
                  ) &&
                  styles.quickDateTextSelected,
              ]}
            >
              Today
            </Text>
          </Pressable>

          <Pressable
            onPress={selectTomorrow}
            style={[
              styles.quickDateButton,
              (() => {
                const tomorrow =
                  new Date();

                tomorrow.setDate(
                  tomorrow.getDate() + 1
                );

                return (
                  deadline ===
                    formatDateForStorage(
                      tomorrow
                    ) &&
                  styles.quickDateButtonSelected
                );
              })(),
            ]}
          >
            <Ionicons
              name="arrow-forward-circle-outline"
              size={18}
              color={
                (() => {
                  const tomorrow =
                    new Date();

                  tomorrow.setDate(
                    tomorrow.getDate() + 1
                  );

                  return deadline ===
                    formatDateForStorage(
                      tomorrow
                    )
                    ? '#FFFFFF'
                    : theme.primary;
                })()
              }
            />

            <Text
              style={[
                styles.quickDateText,
                (() => {
                  const tomorrow =
                    new Date();

                  tomorrow.setDate(
                    tomorrow.getDate() + 1
                  );

                  return (
                    deadline ===
                      formatDateForStorage(
                        tomorrow
                      ) &&
                    styles.quickDateTextSelected
                  );
                })(),
              ]}
            >
              Tomorrow
            </Text>
          </Pressable>
        </View>

        {/* =================================================
            MINI CALENDAR
        ================================================= */}

        {calendarVisible && (
          <View
            style={styles.calendarContainer}
          >
            {/* =================================================
                CALENDAR HEADER
            ================================================= */}

            <View
              style={styles.calendarHeader}
            >
              <Pressable
                onPress={
                  goToPreviousMonth
                }
                style={
                  styles.calendarArrow
                }
              >
                <Ionicons
                  name="chevron-back"
                  size={21}
                  color={theme.primary}
                />
              </Pressable>

              <Text
                style={
                  styles.calendarMonthTitle
                }
              >
                {calendarMonth.toLocaleDateString(
                  'en-US',
                  {
                    month: 'long',
                    year: 'numeric',
                  }
                )}
              </Text>

              <Pressable
                onPress={goToNextMonth}
                style={
                  styles.calendarArrow
                }
              >
                <Ionicons
                  name="chevron-forward"
                  size={21}
                  color={theme.primary}
                />
              </Pressable>
            </View>

            {/* =================================================
                WEEKDAYS
            ================================================= */}

            <View
              style={styles.weekRow}
            >
              {[
                'Mon',
                'Tue',
                'Wed',
                'Thu',
                'Fri',
                'Sat',
                'Sun',
              ].map((day) => (
                <View
                  key={day}
                  style={
                    styles.weekDayCell
                  }
                >
                  <Text
                    style={
                      styles.weekDayText
                    }
                  >
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* =================================================
                CALENDAR DAYS
            ================================================= */}

            <View
              style={styles.daysGrid}
            >
              {calendarDays.map(
                (date, index) => {
                  if (!date) {
                    return (
                      <View
                        key={`empty-${index}`}
                        style={
                          styles.dayCell
                        }
                      />
                    );
                  }

                  const dateString =
                    formatDateForStorage(
                      date
                    );

                  const isSelected =
                    deadline ===
                    dateString;

                  const isToday =
                    isSameDate(
                      date,
                      today
                    );

                  return (
                    <Pressable
                      key={dateString}
                      onPress={() =>
                        handleCalendarDateSelect(
                          date
                        )
                      }
                      style={[
                        styles.dayCell,
                        isSelected &&
                          styles.selectedDayCell,
                        !isSelected &&
                          isToday &&
                          styles.todayDayCell,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isSelected &&
                            styles.selectedDayText,
                          !isSelected &&
                            isToday &&
                            styles.todayDayText,
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>

            {/* =================================================
                TODAY SHORTCUT
            ================================================= */}

            <View
              style={
                styles.calendarFooter
              }
            >
              <Pressable
                onPress={selectToday}
                style={
                  styles.calendarTodayButton
                }
              >
                <Text
                  style={
                    styles.calendarTodayText
                  }
                >
                  Go to Today
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* =================================================
            SAVE
        ================================================= */}

        <Pressable
          style={styles.saveButton}
          onPress={handleSaveTask}
        >
          <Text
            style={styles.saveButtonText}
          >
            Save Task
          </Text>
        </Pressable>
      </ScrollView>

      <FlashcardModal
        flashcard={flashcard}
        onClose={closeFlashcard}
      />
    </View>
  );
}

/* =====================================================
   STYLES
===================================================== */

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    /* =================================================
       SCREEN
    ================================================= */

    screen: {
      flex: 1,
      backgroundColor:
        theme.background,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 30,
      paddingBottom: 30,
    },

    /* =================================================
       HEADER
    ================================================= */

    header: {
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    backButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },

    headerTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.text,
    },

    headerSpacer: {
      width: 44,
    },

    /* =================================================
       ILLUSTRATION
    ================================================= */

    illustrationContainer: {
      height: 118,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },

    illustrationBackground: {
      width: 150,
      height: 100,
      borderRadius: 50,
      backgroundColor:
        theme.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },

    document: {
      width: 58,
      height: 72,
      backgroundColor: theme.card,
      borderRadius: 7,
      borderWidth: 2,
      borderColor:
        theme.inputBorder,
      padding: 10,
      transform: [
        {
          rotate: '-7deg',
        },
      ],
    },

    documentTop: {
      width: '100%',
      height: 8,
      borderRadius: 4,
      backgroundColor:
        theme.primary,
      marginBottom: 9,
    },

    documentLine: {
      width: '85%',
      height: 4,
      borderRadius: 3,
      backgroundColor:
        theme.textMuted,
      marginBottom: 7,
    },

    documentLineSmall: {
      width: '60%',
      height: 4,
      borderRadius: 3,
      backgroundColor:
        theme.textMuted,
      marginBottom: 7,
    },

    plusCircle: {
      position: 'absolute',
      right: 31,
      bottom: 12,
      width: 39,
      height: 39,
      borderRadius: 20,
      backgroundColor:
        theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
    },

    /* =================================================
       INTRO
    ================================================= */

    introTitle: {
      fontSize: 20,
      fontWeight: '800',
      textAlign: 'center',
      color: theme.text,
      marginTop: 3,
    },

    introSubtitle: {
      fontSize: 14,
      textAlign: 'center',
      color: theme.textSecondary,
      marginTop: 4,
      marginBottom: 22,
    },

    /* =================================================
       LABEL
    ================================================= */

    label: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 7,
      marginTop: 2,
    },

    /* =================================================
       INPUT
    ================================================= */

    inputContainer: {
      width: '100%',
      height: 51,
      backgroundColor:
        theme.inputBackground,
      borderWidth: 1,
      borderColor:
        theme.inputBorder,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 13,
      marginBottom: 17,
    },

    input: {
      flex: 1,
      height: '100%',
      fontSize: 14,
      color: theme.text,
      marginLeft: 10,
    },

    /* =================================================
       DESCRIPTION
    ================================================= */

    descriptionContainer: {
      height: 84,
      alignItems: 'flex-start',
      paddingTop: 12,
    },

    descriptionIcon: {
      marginTop: 1,
    },

    descriptionInput: {
      height: 65,
      paddingTop: 0,
    },

    /* =================================================
       PRIORITY
    ================================================= */

    priorityContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent:
        'space-between',
      marginBottom: 18,
    },

    priorityButton: {
      width: '31.5%',
      height: 66,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },

    selectedPriority: {
      borderWidth: 2,
      borderColor: theme.primary,
    },

    priorityText: {
      fontSize: 13,
      fontWeight: '700',
      marginTop: 3,
    },

    /* =================================================
       DEADLINE INPUT
    ================================================= */

    deadlineButton: {
      width: '100%',
      height: 51,
      backgroundColor:
        theme.inputBackground,
      borderWidth: 1,
      borderColor:
        theme.inputBorder,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 13,
      marginBottom: 10,
    },

    deadlineButtonSelected: {
      borderColor: theme.primary,
    },

    deadlineText: {
      flex: 1,
      fontSize: 14,
      color: theme.textSecondary,
      marginLeft: 10,
    },

    selectedDeadlineText: {
      color: theme.text,
      fontWeight: '600',
    },

    /* =================================================
       QUICK DATE BUTTONS
    ================================================= */

    quickDateContainer: {
      width: '100%',
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
    },

    quickDateButton: {
      flex: 1,
      height: 42,
      borderRadius: 10,
      borderWidth: 1,
      borderColor:
        theme.inputBorder,
      backgroundColor:
        theme.primaryLight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
    },

    quickDateButtonSelected: {
      backgroundColor:
        theme.primary,
      borderColor:
        theme.primary,
    },

    quickDateText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.primary,
    },

    quickDateTextSelected: {
      color: '#FFFFFF',
    },

    /* =================================================
       CALENDAR
    ================================================= */

    calendarContainer: {
      width: '100%',
      backgroundColor:
        theme.card,
      borderWidth: 1,
      borderColor:
        theme.inputBorder,
      borderRadius: 16,
      padding: 14,
      marginBottom: 16,

      shadowColor: theme.shadow,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity:
        theme.background === '#07152F'
          ? 0.25
          : 0.08,
      shadowRadius: 8,
      elevation: 3,
    },

    calendarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 12,
    },

    calendarMonthTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text,
    },

    calendarArrow: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor:
        theme.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* =================================================
       WEEKDAYS
    ================================================= */

    weekRow: {
      flexDirection: 'row',
      marginBottom: 5,
    },

    weekDayCell: {
      flex: 1,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },

    weekDayText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textMuted,
    },

    /* =================================================
       CALENDAR DAYS
    ================================================= */

    daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },

    dayCell: {
      width: '14.2857%',
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
    },

    dayText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text,
    },

    selectedDayCell: {
      backgroundColor:
        theme.primary,
    },

    selectedDayText: {
      color: '#FFFFFF',
      fontWeight: '800',
    },

    todayDayCell: {
      borderWidth: 1.5,
      borderColor:
        theme.primary,
    },

    todayDayText: {
      color: theme.primary,
      fontWeight: '800',
    },

    /* =================================================
       CALENDAR FOOTER
    ================================================= */

    calendarFooter: {
      marginTop: 8,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor:
        theme.border,
      alignItems: 'center',
    },

    calendarTodayButton: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 8,
      backgroundColor:
        theme.primaryLight,
    },

    calendarTodayText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.primary,
    },

    /* =================================================
       SAVE
    ================================================= */

    saveButton: {
      width: '100%',
      height: 53,
      borderRadius: 15,
      backgroundColor:
        theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      elevation: 3,
    },

    saveButtonText: {
      fontSize: 17,
      fontWeight: '800',
      color: '#FFFFFF',
    },
  });
}