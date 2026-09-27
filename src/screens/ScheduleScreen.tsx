import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';

import { useApp } from '../context/AppContext';
import type { AppTheme } from '../theme/theme';

import {
  getAcademicEvents,
  insertAcademicEvent,
  deleteAcademicEvent,
  type AcademicEventRecord,
  type AcademicEventType,
  type AcademicEventColor,
} from '../database/scheduleDatabase';
import FlashcardModal from '../components/FlashcardModal';
import { useFlashcard } from '../hooks/useFlashcard';


/* =====================================================
   NOTIFICATION HANDLER
===================================================== */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


/* =====================================================
   TYPES
===================================================== */

type ScheduleScreenProps = {
  onGoHome: () => void;
  onGoTasks: () => void;
  onGoMore: () => void;
};

type EventType = AcademicEventType;

type IconName = keyof typeof Ionicons.glyphMap;

type AcademicEvent = {
  id: number;
  eventType: EventType;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  color: AcademicEventColor;
  icon: IconName;
};

type Reminder = {
  id: number;
  eventId: number;
  eventType: EventType;
  subject: string;
  date: string;
  daysBefore: number;
};


/* =====================================================
   ACTIVITY TYPES
===================================================== */

const eventTypes: {
  type: EventType;
  icon: IconName;
}[] = [
  {
    type: 'Quiz',
    icon: 'help-circle-outline',
  },
  {
    type: 'Exam',
    icon: 'document-text-outline',
  },
  {
    type: 'PIT',
    icon: 'school-outline',
  },
  {
    type: 'Assignment',
    icon: 'create-outline',
  },
  {
    type: 'Project',
    icon: 'folder-outline',
  },
  {
    type: 'Others',
    icon: 'ellipsis-horizontal-circle-outline',
  },
];


/* =====================================================
   AVAILABLE ICONS
===================================================== */

const taskIcons: IconName[] = [
  // Academic
  'school-outline',
  'calculator-outline',
  'book-outline',
  'flask-outline',
  'library-outline',
  'create-outline',
  'document-text-outline',
  'document-outline',
  'laptop-outline',
  'desktop-outline',

  // Planning
  'calendar-outline',
  'time-outline',
  'timer-outline',
  'checkbox-outline',
  'checkmark-circle-outline',
  'bookmark-outline',
  'star-outline',
  'flag-outline',

  // Creative
  'color-palette-outline',
  'musical-notes-outline',
  'mic-outline',
  'videocam-outline',

  // Other
  'people-outline',
  'bulb-outline',
];


/* =====================================================
   INITIAL EVENTS
===================================================== */

const initialAcademicEvents: AcademicEvent[] = [
  {
    id: 1,
    eventType: 'Exam',
    subject: 'Math',
    date: '2026-10-15',
    startTime: '07:00 PM',
    endTime: '09:00 PM',
    description: 'Review chapters 1–5',
    color: 'blue',
    icon: 'calculator-outline',
  },

  {
    id: 2,
    eventType: 'Quiz',
    subject: 'English',
    date: '2026-10-18',
    startTime: '06:00 PM',
    endTime: '07:00 PM',
    description: 'Read and review notes',
    color: 'purple',
    icon: 'book-outline',
  },
];


/* =====================================================
   MAIN SCREEN
===================================================== */

export default function ScheduleScreen({
  onGoHome,
  onGoTasks,
  onGoMore,
}: ScheduleScreenProps) {

  const { theme } = useApp();

  const styles = createStyles(theme);

  const {
    flashcard,
    showFlashcard,
    closeFlashcard,
  } = useFlashcard();


  /* ===================================================
     DATE
  =================================================== */

  const today = new Date();

  const [selectedDate, setSelectedDate] =
    useState<Date>(today);

  const [calendarMonth, setCalendarMonth] =
    useState<Date>(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );


  /* ===================================================
     VIEW
  =================================================== */

  const [selectedView, setSelectedView] =
    useState<'Day' | 'Week'>('Day');


  /* ===================================================
     SQLITE EVENTS
  =================================================== */

  const [academicEvents, setAcademicEvents] =
    useState<AcademicEvent[]>([]);

  const [databaseLoading, setDatabaseLoading] =
    useState(true);


  /* ===================================================
     REMINDERS
  =================================================== */

  const [reminders, setReminders] =
    useState<Reminder[]>([]);


  /* ===================================================
     ADD ACTIVITY MODAL
  =================================================== */

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [showActivityDatePicker, setShowActivityDatePicker] =
    useState(false);


  /* ===================================================
     FORM
  =================================================== */

  const [eventType, setEventType] =
    useState<EventType>('Quiz');

  const [subject, setSubject] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [selectedIcon, setSelectedIcon] =
    useState<IconName>(
      'school-outline'
    );


  /* ===================================================
     TIME PICKER
  =================================================== */

  const [startHour, setStartHour] =
    useState(7);

  const [startMinute, setStartMinute] =
    useState(0);

  const [startPeriod, setStartPeriod] =
    useState<'AM' | 'PM'>('PM');


  const [endHour, setEndHour] =
    useState(9);

  const [endMinute, setEndMinute] =
    useState(0);

  const [endPeriod, setEndPeriod] =
    useState<'AM' | 'PM'>('PM');


  /* ===================================================
     LOAD SQLITE
  =================================================== */

  useEffect(() => {

    async function loadEvents() {

      try {

        setDatabaseLoading(true);

        const savedEvents =
          await getAcademicEvents();


        /*
         * If this is the first run and the table
         * is empty, insert the original sample
         * activities into SQLite.
         */

        if (
          savedEvents.length === 0
        ) {

          for (
            const event of
            initialAcademicEvents
          ) {

            await insertAcademicEvent(
              event
            );
          }


          setAcademicEvents(
            initialAcademicEvents
          );

        } else {

          setAcademicEvents(
            savedEvents.map(
              convertDatabaseEvent
            )
          );
        }

      } catch (error) {

        console.error(
          'Failed to load academic events:',
          error
        );

        showFlashcard({
          title: 'Schedule Unavailable',
          message: 'Unable to load your academic schedule.',
          tone: 'danger',
        });

      } finally {

        setDatabaseLoading(false);
      }
    }


    loadEvents();

  }, []);


  /* ===================================================
     GENERATE REMINDERS
  =================================================== */

  useEffect(() => {

    const generatedReminders: Reminder[] = [];


    academicEvents.forEach(
      (event) => {

        let reminderDays: number[] =
          [];


        if (
          event.eventType === 'Quiz'
        ) {

          reminderDays = [
            3,
            2,
            1,
          ];

        } else if (
          event.eventType === 'Exam'
        ) {

          reminderDays = [
            7,
            3,
            1,
          ];
        }


        reminderDays.forEach(
          (daysBefore) => {

            generatedReminders.push({
              id:
                event.id * 100 +
                daysBefore,

              eventId:
                event.id,

              eventType:
                event.eventType,

              subject:
                event.subject,

              date:
                event.date,

              daysBefore,
            });
          }
        );
      }
    );


    setReminders(
      generatedReminders
    );

  }, [academicEvents]);


  /* ===================================================
     FORM RESET
  =================================================== */

  const resetForm = () => {

    setEventType('Quiz');

    setSubject('');

    setDescription('');

    setShowActivityDatePicker(false);

    setSelectedIcon(
      'school-outline'
    );


    setStartHour(7);

    setStartMinute(0);

    setStartPeriod('PM');


    setEndHour(9);

    setEndMinute(0);

    setEndPeriod('PM');
  };


  /* ===================================================
     OPEN ADD MODAL
  =================================================== */

  const handleOpenAddActivity = () => {

    resetForm();

    setShowAddModal(true);
  };


  /* ===================================================
     SUBJECT ICON SUGGESTION
  =================================================== */

  const handleSubjectChange = (
    value: string
  ) => {

    setSubject(value);


    if (
      value.trim().length === 0
    ) {
      return;
    }


    setSelectedIcon(
      getIconForSubject(value)
    );
  };


  /* ===================================================
     ADD ACADEMIC EVENT
  =================================================== */

  const handleAddAcademicEvent =
    async () => {

      if (!subject.trim()) {

        showFlashcard({
          title: 'Activity Name Required',
          message: 'Please enter the subject or activity name.',
          tone: 'warning',
        });

        return;
      }


      const formattedStartTime =
        formatTime(
          startHour,
          startMinute,
          startPeriod
        );


      const formattedEndTime =
        formatTime(
          endHour,
          endMinute,
          endPeriod
        );


      const newEvent: AcademicEvent = {

        id: Date.now(),

        eventType,

        subject:
          subject.trim(),

        date:
          formatDateForStorage(
            selectedDate
          ),

        startTime:
          formattedStartTime,

        endTime:
          formattedEndTime,

        description:
          description.trim(),

        color:
          getNextColor(
            academicEvents.length
          ),

        icon:
          selectedIcon,
      };


      try {

        /*
         * FIRST save the event to SQLite.
         */

        await insertAcademicEvent(
          newEvent
        );


        /*
         * THEN update the visible UI.
         */

        setAcademicEvents(
          (currentEvents) => [
            ...currentEvents,
            newEvent,
          ]
        );


        /*
         * Schedule OS reminders.
         */

        await scheduleNotificationsForEvent(
          newEvent
        );


        resetForm();

        setShowAddModal(false);


        showFlashcard({
          title: 'Activity Added',
          message: `${newEvent.subject} has been added to your schedule.`,
          tone: 'success',
        });

      } catch (error) {

        console.error(
          'Failed to save academic event:',
          error
        );

        showFlashcard({
          title: 'Save Error',
          message: 'The academic activity could not be saved.',
          tone: 'danger',
        });
      }
    };


  /* ===================================================
     DELETE EVENT
  =================================================== */

  const handleDeleteEvent = (
    event: AcademicEvent
  ) => {

    showFlashcard({
      title: 'Delete Activity?',
      message: `"${event.subject}" will be permanently removed from your schedule.`,
      tone: 'danger',
      primaryLabel: 'Delete',
      secondaryLabel: 'Cancel',
      onPrimary: async () => {

            try {

              await deleteAcademicEvent(
                event.id
              );


              setAcademicEvents(
                (currentEvents) =>
                  currentEvents.filter(
                    (currentEvent) =>
                      currentEvent.id !==
                      event.id
                  )
              );

            } catch (error) {

              console.error(
                'Failed to delete event:',
                error
              );

              showFlashcard({
                title: 'Delete Error',
                message: 'Unable to delete the activity.',
                tone: 'danger',
              });
            }
      },
    });
  };


  /* ===================================================
     CURRENT DAY EVENTS
  =================================================== */

  const selectedDateString =
    formatDateForStorage(
      selectedDate
    );


  const dayEvents =
    academicEvents
      .filter(
        (event) =>
          event.date ===
          selectedDateString
      )
      .sort(
        compareEventsByTime
      );


  /* ===================================================
     WEEK EVENTS
  =================================================== */

  const weekDates =
    getWeekDates(
      selectedDate
    );


  const weekEvents =
    academicEvents
      .filter(
        (event) =>
          weekDates.some(
            (date) =>
              formatDateForStorage(
                date
              ) === event.date
          )
      )
      .sort(
        compareEventsByDateAndTime
      );


  /* ===================================================
     DISPLAY EVENTS
  =================================================== */

  const displayedEvents =
    selectedView === 'Day'
      ? dayEvents
      : weekEvents;

  const displayedEventIds = new Set(
    displayedEvents.map(
      (event) => event.id
    )
  );

  const todayString =
    formatDateForStorage(today);

  const upcomingEvents = academicEvents
    .filter(
      (event) =>
        event.date >= todayString &&
        !displayedEventIds.has(event.id)
    )
    .sort(
      compareEventsByDateAndTime
    );


  /* ===================================================
     CALENDAR DAYS
  =================================================== */

  const calendarDays =
    useMemo(
      () =>
        buildCalendarDays(
          calendarMonth
        ),
      [calendarMonth]
    );


  /* ===================================================
     RENDER
  =================================================== */

  return (
    <View style={styles.container}>

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
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>

          <View
            style={styles.headerTop}
          >

            <Text
              style={styles.headerTitle}
            >
              Study Schedule
            </Text>

          </View>


        </View>


        {/* =================================================
            VIEW SELECTOR
        ================================================= */}

        <View
          style={
            styles.viewSelectorContainer
          }
        >

          <Pressable
            style={[
              styles.viewSelectorButton,

              selectedView === 'Day' &&
                styles.selectedViewButton,
            ]}
            onPress={() =>
              setSelectedView('Day')
            }
          >

            <Text
              style={[
                styles.viewSelectorText,

                selectedView === 'Day' &&
                  styles.selectedViewText,
              ]}
            >
              Day
            </Text>

          </Pressable>


          <Pressable
            style={[
              styles.viewSelectorButton,

              selectedView === 'Week' &&
                styles.selectedViewButton,
            ]}
            onPress={() =>
              setSelectedView('Week')
            }
          >

            <Text
              style={[
                styles.viewSelectorText,

                selectedView === 'Week' &&
                  styles.selectedViewText,
              ]}
            >
              Week
            </Text>

          </Pressable>

        </View>


        {/* =================================================
            CALENDAR
        ================================================= */}

        <View
          style={
            styles.calendarCard
          }
        >

          <View
            style={
              styles.calendarHeader
            }
          >

            <Pressable
              style={
                styles.calendarArrow
              }
              onPress={() => {

                setCalendarMonth(
                  new Date(
                    calendarMonth.getFullYear(),
                    calendarMonth.getMonth() - 1,
                    1
                  )
                );

              }}
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
              {getMonthName(
                calendarMonth
              )}{' '}
              {calendarMonth.getFullYear()}
            </Text>


            <Pressable
              style={
                styles.calendarArrow
              }
              onPress={() => {

                setCalendarMonth(
                  new Date(
                    calendarMonth.getFullYear(),
                    calendarMonth.getMonth() + 1,
                    1
                  )
                );

              }}
            >

              <Ionicons
                name="chevron-forward"
                size={21}
                color={theme.primary}
              />

            </Pressable>

          </View>


          {/* WEEKDAY LABELS */}

          <View
            style={
              styles.weekdayRow
            }
          >

            {[
              'S',
              'M',
              'T',
              'W',
              'T',
              'F',
              'S',
            ].map(
              (
                day,
                index
              ) => (

                <Text
                  key={`${day}-${index}`}
                  style={
                    styles.weekdayText
                  }
                >
                  {day}
                </Text>

              )
            )}

          </View>


          {/* CALENDAR GRID */}

          <View
            style={
              styles.calendarGrid
            }
          >

            {calendarDays.map(
              (
                date,
                index
              ) => {

                if (!date) {

                  return (
                    <View
                      key={`empty-${index}`}
                      style={
                        styles.calendarDay
                      }
                    />
                  );
                }


                const isSelected =
                  isSameDate(
                    date,
                    selectedDate
                  );


                const isToday =
                  isSameDate(
                    date,
                    today
                  );


                const hasEvent =
                  academicEvents.some(
                    (event) =>
                      event.date ===
                      formatDateForStorage(
                        date
                      )
                  );


                return (

                  <Pressable
                    key={
                      formatDateForStorage(
                        date
                      )
                    }
                    style={[
                      styles.calendarDay,

                      isSelected &&
                        styles.selectedCalendarDay,

                      isToday &&
                        !isSelected &&
                        styles.todayCalendarDay,
                    ]}
                    onPress={() => {

                      setSelectedDate(
                        date
                      );

                      setCalendarMonth(
                        new Date(
                          date.getFullYear(),
                          date.getMonth(),
                          1
                        )
                      );

                    }}
                  >

                    <Text
                      style={[
                        styles.calendarDayText,

                        isSelected &&
                          styles.selectedCalendarDayText,

                        isToday &&
                          !isSelected &&
                          styles.todayCalendarDayText,
                      ]}
                    >
                      {date.getDate()}
                    </Text>


                    {hasEvent && (

                      <View
                        style={
                          styles.eventDot
                        }
                      />

                    )}

                  </Pressable>

                );
              }
            )}

          </View>

        </View>


        {/* =================================================
            SELECTED DATE
        ================================================= */}

        <View
          style={
            styles.selectedDateHeader
          }
        >

          <View>

            <Text
              style={
                styles.selectedDateTitle
              }
            >
              {formatDisplayDate(
                selectedDate
              )}
            </Text>


            <Text
              style={
                styles.selectedDateSubtitle
              }
            >
              {selectedView === 'Day'
                ? 'Academic activities'
                : 'Weekly academic activities'}
            </Text>

          </View>


          <View
            style={
              styles.eventCountBadge
            }
          >

            <Text
              style={
                styles.eventCountText
              }
            >
              {displayedEvents.length}
            </Text>

          </View>

        </View>


        {/* =================================================
            EVENTS
        ================================================= */}

        {databaseLoading ? (

          <View
            style={
              styles.emptyCard
            }
          >

            <Ionicons
              name="sync-outline"
              size={38}
              color={theme.primary}
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              Loading schedule...
            </Text>

          </View>

        ) : displayedEvents.length === 0 ? (

          <View
            style={
              styles.emptyCard
            }
          >

            <View
              style={
                styles.emptyIconCircle
              }
            >

              <Ionicons
                name="calendar-outline"
                size={34}
                color={theme.primary}
              />

            </View>


            <Text
              style={
                styles.emptyTitle
              }
            >
              No academic activity
            </Text>


            <Text
              style={
                styles.emptyText
              }
            >
              There are no scheduled activities
              for this {selectedView === 'Day'
                ? 'day'
                : 'week'}.
            </Text>


          </View>

        ) : (

          <View>

            {displayedEvents.map(
              (event) => (

                <AcademicEventCard
                  key={event.id}
                  event={event}
                  theme={theme}
                  onDelete={() =>
                    handleDeleteEvent(
                      event
                    )
                  }
                />

              )
            )}

          </View>

        )}


        {/* =================================================
            UPCOMING ACTIVITIES
        ================================================= */}

        {!databaseLoading &&
          upcomingEvents.length > 0 && (
            <View style={styles.upcomingSection}>
              <View style={styles.upcomingHeader}>
                <View>
                  <Text
                    style={styles.upcomingTitle}
                  >
                    Upcoming Activities
                  </Text>

                  <Text
                    style={styles.upcomingSubtitle}
                  >
                    Sorted from soonest to latest
                  </Text>
                </View>

                <View
                  style={styles.upcomingCountBadge}
                >
                  <Text
                    style={styles.upcomingCountText}
                  >
                    {upcomingEvents.length}
                  </Text>
                </View>
              </View>

              {upcomingEvents.map(
                (event) => (
                  <AcademicEventCard
                    key={`upcoming-${event.id}`}
                    event={event}
                    theme={theme}
                    onDelete={() =>
                      handleDeleteEvent(event)
                    }
                  />
                )
              )}
            </View>
          )}


        {/* =================================================
            REMINDER INFORMATION
        ================================================= */}

        <View
          style={
            styles.reminderInfoCard
          }
        >

          <View
            style={
              styles.reminderIconCircle
            }
          >

            <Ionicons
              name="notifications-outline"
              size={22}
              color={theme.primary}
            />

          </View>


          <View
            style={
              styles.reminderInfoText
            }
          >

            <Text
              style={
                styles.reminderInfoTitle
              }
            >
              Activity reminders
            </Text>


            <Text
              style={
                styles.reminderInfoDescription
              }
            >
              Quiz reminders are sent 3, 2,
              and 1 day before. Exam reminders
              are sent 7, 3, and 1 day before.
            </Text>

          </View>

        </View>


        {/* =================================================
            BOTTOM SPACE
        ================================================= */}

        <View
          style={
            styles.bottomSpace
          }
        />

      </ScrollView>

      {/* =====================================================
          FLOATING ADD ACTIVITY BUTTON
      ===================================================== */}

      <Pressable
        style={styles.floatingAddButton}
        onPress={handleOpenAddActivity}
        accessibilityRole="button"
        accessibilityLabel="Add activity"
      >
        <Ionicons
          name="add"
          size={22}
          color="#FFFFFF"
        />
        <Text style={styles.floatingAddButtonText}>
          Add Activity
        </Text>
      </Pressable>

      <FlashcardModal
        flashcard={flashcard}
        onClose={closeFlashcard}
      />


      {/* =================================================
          ADD ACTIVITY MODAL
      ================================================= */}

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowAddModal(false)
        }
      >

        <View
          style={
            styles.modalOverlay
          }
        >

          <View
            style={
              styles.modalContainer
            }
          >

            {/* MODAL HEADER */}

            <View
              style={
                styles.modalHeader
              }
            >

              <View>

                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Add Academic Activity
                </Text>


                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Add an activity to your schedule
                </Text>

              </View>


              <Pressable
                style={
                  styles.modalCloseButton
                }
                onPress={() => {

                  resetForm();

                  setShowAddModal(
                    false
                  );

                }}
              >

                <Ionicons
                  name="close"
                  size={24}
                  color={theme.text}
                />

              </Pressable>

            </View>


            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={
                styles.modalScrollContent
              }
            >

              {/* =================================================
                  ACTIVITY TYPE
              ================================================= */}

              <Text
                style={
                  styles.formLabel
                }
              >
                Activity Type
              </Text>


              <View
                style={
                  styles.eventTypeGrid
                }
              >

                {eventTypes.map(
                  (item) => {

                    const selected =
                      eventType ===
                      item.type;


                    return (

                      <Pressable
                        key={item.type}
                        style={[
                          styles.eventTypeButton,

                          selected &&
                            styles.selectedEventTypeButton,
                        ]}
                        onPress={() =>
                          setEventType(
                            item.type
                          )
                        }
                      >

                        <Ionicons
                          name={
                            item.icon
                          }
                          size={20}
                          color={
                            selected
                              ? '#FFFFFF'
                              : theme.primary
                          }
                        />


                        <Text
                          style={[
                            styles.eventTypeText,

                            selected &&
                              styles.selectedEventTypeText,
                          ]}
                        >
                          {item.type}
                        </Text>

                      </Pressable>

                    );
                  }
                )}

              </View>


              {/* =================================================
                  SUBJECT
              ================================================= */}

              <Text
                style={
                  styles.formLabel
                }
              >
                Subject / Activity Name
              </Text>


              <View
                style={
                  styles.inputContainer
                }
              >

                <Ionicons
                  name="book-outline"
                  size={21}
                  color={theme.primary}
                />


                <TextInput
                  style={
                    styles.input
                  }
                  value={subject}
                  onChangeText={
                    handleSubjectChange
                  }
                  placeholder="e.g. Mathematics"
                  placeholderTextColor={
                    theme.textMuted
                  }
                />

              </View>


              {/* =================================================
                  DATE
              ================================================= */}

              <Text
                style={
                  styles.formLabel
                }
              >
                {eventType} Date
              </Text>


              <Pressable
                style={
                  styles.dateButton
                }
                onPress={() => {

                  setCalendarMonth(
                    new Date(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth(),
                      1
                    )
                  );

                  setShowActivityDatePicker(
                    (current) => !current
                  );
                }}
              >

                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color={theme.primary}
                />


                <Text
                  style={
                    styles.dateButtonText
                  }
                >
                  {formatDisplayDate(
                    selectedDate
                  )}
                </Text>


                <Ionicons
                  name={
                    showActivityDatePicker
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={20}
                  color={theme.primary}
                />

              </Pressable>


              {showActivityDatePicker && (
                <View
                  style={
                    styles.activityDateCalendar
                  }
                >

                  <View
                    style={
                      styles.activityDateCalendarHeader
                    }
                  >

                    <Pressable
                      style={
                        styles.activityDateCalendarArrow
                      }
                      onPress={() => {
                        setCalendarMonth(
                          new Date(
                            calendarMonth.getFullYear(),
                            calendarMonth.getMonth() - 1,
                            1
                          )
                        );
                      }}
                    >
                      <Ionicons
                        name="chevron-back"
                        size={18}
                        color={theme.primary}
                      />
                    </Pressable>


                    <Text
                      style={
                        styles.activityDateCalendarMonth
                      }
                    >
                      {getMonthName(
                        calendarMonth
                      )}{' '}
                      {calendarMonth.getFullYear()}
                    </Text>


                    <Pressable
                      style={
                        styles.activityDateCalendarArrow
                      }
                      onPress={() => {
                        setCalendarMonth(
                          new Date(
                            calendarMonth.getFullYear(),
                            calendarMonth.getMonth() + 1,
                            1
                          )
                        );
                      }}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={theme.primary}
                      />
                    </Pressable>

                  </View>


                  <View
                    style={
                      styles.activityDateWeekdayRow
                    }
                  >
                    {[
                      'S',
                      'M',
                      'T',
                      'W',
                      'T',
                      'F',
                      'S',
                    ].map((day, index) => (
                      <Text
                        key={`${day}-${index}`}
                        style={
                          styles.activityDateWeekdayText
                        }
                      >
                        {day}
                      </Text>
                    ))}
                  </View>


                  <View
                    style={
                      styles.activityDateGrid
                    }
                  >
                    {calendarDays.map(
                      (date, index) => {
                        if (!date) {
                          return (
                            <View
                              key={`activity-empty-${index}`}
                              style={
                                styles.activityDateDay
                              }
                            />
                          );
                        }

                        const isSelected =
                          isSameDate(
                            date,
                            selectedDate
                          );

                        const isToday =
                          isSameDate(
                            date,
                            today
                          );

                        const hasEvent =
                          academicEvents.some(
                            (event) =>
                              event.date ===
                              formatDateForStorage(
                                date
                              )
                          );

                        return (
                          <Pressable
                            key={
                              formatDateForStorage(
                                date
                              )
                            }
                            style={[
                              styles.activityDateDay,
                              isSelected &&
                                styles.activityDateSelectedDay,
                              isToday &&
                                !isSelected &&
                                styles.activityDateTodayDay,
                            ]}
                            onPress={() => {
                              setSelectedDate(date);
                              setCalendarMonth(
                                new Date(
                                  date.getFullYear(),
                                  date.getMonth(),
                                  1
                                )
                              );
                              setShowActivityDatePicker(
                                false
                              );
                            }}
                          >
                            <Text
                              style={[
                                styles.activityDateDayText,
                                isSelected &&
                                  styles.activityDateSelectedDayText,
                                isToday &&
                                  !isSelected &&
                                  styles.activityDateTodayDayText,
                              ]}
                            >
                              {date.getDate()}
                            </Text>

                            {hasEvent && (
                              <View
                                style={
                                  styles.activityDateEventDot
                                }
                              />
                            )}
                          </Pressable>
                        );
                      }
                    )}
                  </View>

                </View>
              )}


              <Text
                style={
                  styles.helperText
                }
              >
                Tap the calendar field to choose the date.
              </Text>


              {/* =================================================
                  START TIME
              ================================================= */}

              <TimePicker
                label="Start Time"
                hour={startHour}
                minute={startMinute}
                period={startPeriod}
                onHourChange={
                  setStartHour
                }
                onMinuteChange={
                  setStartMinute
                }
                onPeriodChange={
                  setStartPeriod
                }
                theme={theme}
              />


              {/* =================================================
                  END TIME
              ================================================= */}

              <TimePicker
                label="End Time"
                hour={endHour}
                minute={endMinute}
                period={endPeriod}
                onHourChange={
                  setEndHour
                }
                onMinuteChange={
                  setEndMinute
                }
                onPeriodChange={
                  setEndPeriod
                }
                theme={theme}
              />


              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <Text
                style={
                  styles.formLabel
                }
              >
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
                  size={21}
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
                  onChangeText={
                    setDescription
                  }
                  placeholder="e.g. Review chapters 1–5"
                  placeholderTextColor={
                    theme.textMuted
                  }
                  multiline
                  textAlignVertical="top"
                />

              </View>


              {/* =================================================
                  ICON PICKER
              ================================================= */}

              <Text
                style={
                  styles.formLabel
                }
              >
                Choose an Icon
              </Text>


              <Text
                style={
                  styles.iconHelperText
                }
              >
                Choose an icon that represents
                this activity.
              </Text>


              <View
                style={
                  styles.iconGrid
                }
              >

                {taskIcons.map(
                  (icon) => {

                    const selected =
                      selectedIcon ===
                      icon;


                    return (

                      <Pressable
                        key={icon}
                        style={[
                          styles.iconButton,

                          selected &&
                            styles.selectedIconButton,
                        ]}
                        onPress={() =>
                          setSelectedIcon(
                            icon
                          )
                        }
                      >

                        <Ionicons
                          name={icon}
                          size={23}
                          color={
                            selected
                              ? theme.primary
                              : theme.textSecondary
                          }
                        />

                      </Pressable>

                    );
                  }
                )}

              </View>


              {/* =================================================
                  REMINDER INFORMATION
              ================================================= */}

              <View
                style={
                  styles.reminderFormCard
                }
              >

                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={theme.primary}
                />


                <View
                  style={
                    styles.reminderFormText
                  }
                >

                  <Text
                    style={
                      styles.reminderFormTitle
                    }
                  >
                    Reminder
                  </Text>


                  <Text
                    style={
                      styles.reminderFormDescription
                    }
                  >
                    {getReminderDescription(
                      eventType
                    )}
                  </Text>

                </View>

              </View>


              {/* =================================================
                  BUTTONS
              ================================================= */}

              <View
                style={
                  styles.modalButtons
                }
              >

                <Pressable
                  style={
                    styles.cancelButton
                  }
                  onPress={() => {

                    resetForm();

                    setShowAddModal(
                      false
                    );

                  }}
                >

                  <Text
                    style={
                      styles.cancelButtonText
                    }
                  >
                    Cancel
                  </Text>

                </Pressable>


                <Pressable
                  style={
                    styles.saveButton
                  }
                  onPress={
                    handleAddAcademicEvent
                  }
                >

                  <Ionicons
                    name="checkmark"
                    size={20}
                    color="#FFFFFF"
                  />


                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    Add Activity
                  </Text>

                </Pressable>

              </View>

            </ScrollView>

          </View>

        </View>

      </Modal>


      {/* =================================================
          BOTTOM NAVIGATION
      ================================================= */}

      <View
        style={
          styles.bottomNavigation
        }
      >

        {/* HOME */}

        <Pressable
          style={
            styles.bottomItem
          }
          onPress={onGoHome}
        >

          <Ionicons
            name="home-outline"
            size={23}
            color={theme.tabInactive}
          />

          <Text
            style={
              styles.bottomLabel
            }
          >
            Home
          </Text>

        </Pressable>


        {/* TASKS */}

        <Pressable
          style={
            styles.bottomItem
          }
          onPress={onGoTasks}
        >

          <Ionicons
            name="checkbox-outline"
            size={23}
            color={theme.tabInactive}
          />

          <Text
            style={
              styles.bottomLabel
            }
          >
            Tasks
          </Text>

        </Pressable>


        {/* SCHEDULE */}

        <Pressable
          style={
            styles.bottomItem
          }
        >

          <Ionicons
            name="calendar"
            size={23}
            color={theme.primary}
          />

          <Text
            style={[
              styles.bottomLabel,
              styles.activeBottomLabel,
            ]}
          >
            Schedule
          </Text>

        </Pressable>


        {/* MORE */}

        <Pressable
          style={
            styles.bottomItem
          }
          onPress={onGoMore}
        >

          <Ionicons
            name="ellipsis-horizontal"
            size={23}
            color={theme.tabInactive}
          />

          <Text
            style={
              styles.bottomLabel
            }
          >
            More
          </Text>

        </Pressable>

      </View>

    </View>
  );
}


/* =====================================================
   TIME PICKER
===================================================== */

type TimePickerProps = {
  label: string;
  hour: number;
  minute: number;
  period: 'AM' | 'PM';
  onHourChange: (
    hour: number
  ) => void;
  onMinuteChange: (
    minute: number
  ) => void;
  onPeriodChange: (
    period: 'AM' | 'PM'
  ) => void;
  theme: AppTheme;
};


function TimePicker({
  label,
  hour,
  minute,
  period,
  onHourChange,
  onMinuteChange,
  onPeriodChange,
  theme,
}: TimePickerProps) {

  const styles =
    createStyles(theme);


  const increaseHour = () => {

    onHourChange(
      hour === 12
        ? 1
        : hour + 1
    );
  };


  const decreaseHour = () => {

    onHourChange(
      hour === 1
        ? 12
        : hour - 1
    );
  };


  const increaseMinute = () => {

    onMinuteChange(
      minute === 55
        ? 0
        : minute + 5
    );
  };


  const decreaseMinute = () => {

    onMinuteChange(
      minute === 0
        ? 55
        : minute - 5
    );
  };


  return (

    <View
      style={
        styles.timePickerContainer
      }
    >

      <Text
        style={
          styles.formLabel
        }
      >
        {label}
      </Text>


      <View
        style={
          styles.timePickerBox
        }
      >

        {/* HOUR */}

        <View
          style={
            styles.timeColumn
          }
        >

          <Pressable
            style={
              styles.timeArrowButton
            }
            onPress={
              increaseHour
            }
          >

            <Ionicons
              name="chevron-up"
              size={19}
              color={theme.primary}
            />

          </Pressable>


          <Text
            style={
              styles.timeValue
            }
          >
            {String(hour).padStart(
              2,
              '0'
            )}
          </Text>


          <Pressable
            style={
              styles.timeArrowButton
            }
            onPress={
              decreaseHour
            }
          >

            <Ionicons
              name="chevron-down"
              size={19}
              color={theme.primary}
            />

          </Pressable>

        </View>


        <Text
          style={
            styles.timeColon
          }
        >
          :
        </Text>


        {/* MINUTE */}

        <View
          style={
            styles.timeColumn
          }
        >

          <Pressable
            style={
              styles.timeArrowButton
            }
            onPress={
              increaseMinute
            }
          >

            <Ionicons
              name="chevron-up"
              size={19}
              color={theme.primary}
            />

          </Pressable>


          <Text
            style={
              styles.timeValue
            }
          >
            {String(
              minute
            ).padStart(
              2,
              '0'
            )}
          </Text>


          <Pressable
            style={
              styles.timeArrowButton
            }
            onPress={
              decreaseMinute
            }
          >

            <Ionicons
              name="chevron-down"
              size={19}
              color={theme.primary}
            />

          </Pressable>

        </View>


        {/* AM / PM */}

        <View
          style={
            styles.periodColumn
          }
        >

          <Pressable
            style={[
              styles.periodButton,

              period === 'AM' &&
                styles.selectedPeriodButton,
            ]}
            onPress={() =>
              onPeriodChange('AM')
            }
          >

            <Text
              style={[
                styles.periodButtonText,

                period === 'AM' &&
                  styles.selectedPeriodButtonText,
              ]}
            >
              AM
            </Text>

          </Pressable>


          <Pressable
            style={[
              styles.periodButton,

              period === 'PM' &&
                styles.selectedPeriodButton,
            ]}
            onPress={() =>
              onPeriodChange('PM')
            }
          >

            <Text
              style={[
                styles.periodButtonText,

                period === 'PM' &&
                  styles.selectedPeriodButtonText,
              ]}
            >
              PM
            </Text>

          </Pressable>

        </View>

      </View>

    </View>
  );
}


/* =====================================================
   ACADEMIC EVENT CARD
===================================================== */

type AcademicEventCardProps = {
  event: AcademicEvent;
  theme: AppTheme;
  onDelete: () => void;
};


function AcademicEventCard({
  event,
  theme,
  onDelete,
}: AcademicEventCardProps) {

  const styles =
    createStyles(theme);


  const colors = {
    blue: {
      background:
        theme.background === '#07152F'
          ? '#173A69'
          : '#E7F4FF',

      icon:
        theme.background === '#07152F'
          ? '#65A8FF'
          : '#1261D6',

      time:
        theme.background === '#07152F'
          ? '#AFCBEB'
          : '#587BA5',

      dot:
        theme.background === '#07152F'
          ? '#65A8FF'
          : '#1261D6',
    },

    purple: {
      background:
        theme.background === '#07152F'
          ? '#332552'
          : '#F0E7FF',

      icon:
        theme.background === '#07152F'
          ? '#C19BFF'
          : '#7637D8',

      time:
        theme.background === '#07152F'
          ? '#C9B8E7'
          : '#7251A2',

      dot:
        theme.background === '#07152F'
          ? '#C19BFF'
          : '#7637D8',
    },

    green: {
      background:
        theme.background === '#07152F'
          ? '#193E32'
          : '#E3F8EA',

      icon:
        theme.background === '#07152F'
          ? '#5BE5A5'
          : '#20A65A',

      time:
        theme.background === '#07152F'
          ? '#A8D5BD'
          : '#4D8565',

      dot:
        theme.background === '#07152F'
          ? '#5BE5A5'
          : '#20A65A',
    },

    orange: {
      background:
        theme.background === '#07152F'
          ? '#493B1B'
          : '#FFF2D2',

      icon:
        theme.background === '#07152F'
          ? '#FFD75C'
          : '#E99A00',

      time:
        theme.background === '#07152F'
          ? '#D7C58D'
          : '#8D7444',

      dot:
        theme.background === '#07152F'
          ? '#FFD75C'
          : '#E99A00',
    },
  };


  const currentStyle =
    colors[event.color];


  return (

    <View
      style={
        styles.eventRow
      }
    >

      {/* TIMELINE */}

      <View
        style={
          styles.timelineContainer
        }
      >

        <View
          style={[
            styles.timelineDot,
            {
              borderColor:
                currentStyle.dot,
            },
          ]}
        >

          <View
            style={[
              styles.timelineDotInner,
              {
                backgroundColor:
                  currentStyle.dot,
              },
            ]}
          />

        </View>

      </View>


      {/* CARD */}

      <View
        style={[
          styles.eventCard,

          {
            backgroundColor:
              currentStyle.background,
          },
        ]}
      >

        <View
          style={
            styles.eventIconContainer
          }
        >

          <Ionicons
            name={event.icon}
            size={30}
            color={
              currentStyle.icon
            }
          />

        </View>


        <View
          style={
            styles.eventInfo
          }
        >

          <View
            style={
              styles.eventTopRow
            }
          >

            <Text
              style={[
                styles.eventTime,
                {
                  color:
                    currentStyle.time,
                },
              ]}
            >
              {event.startTime}
              {' – '}
              {event.endTime}
            </Text>


            <View
              style={
                styles.eventTypeBadge
              }
            >

              <Text
                style={
                  styles.eventTypeBadgeText
                }
              >
                {event.eventType}
              </Text>

            </View>

          </View>


          <Text
            style={
              styles.eventSubject
            }
          >
            {event.subject}
          </Text>


          {event.description.trim() !== '' && (
            <Text
              style={
                styles.eventDescription
              }
            >
              {event.description}
            </Text>
          )}


          {event.date !== '' && (

            <Text
              style={
                styles.eventDateText
              }
            >
              {formatDisplayDateFromString(
                event.date
              )}
            </Text>

          )}

        </View>


        <Pressable
          style={
            styles.eventDeleteButton
          }
          onPress={
            onDelete
          }
        >

          <Ionicons
            name="trash-outline"
            size={19}
            color={theme.textMuted}
          />

        </Pressable>

      </View>

    </View>
  );
}


/* =====================================================
   DATABASE CONVERTER
===================================================== */

function convertDatabaseEvent(
  event: AcademicEventRecord
): AcademicEvent {

  return {

    id:
      event.id,

    eventType:
      event.eventType,

    subject:
      event.subject,

    date:
      event.date,

    startTime:
      event.startTime,

    endTime:
      event.endTime,

    description:
      event.description,

    color:
      event.color,

    icon:
      event.icon as IconName,
  };
}


/* =====================================================
   FORMAT TIME
===================================================== */

function formatTime(
  hour: number,
  minute: number,
  period: 'AM' | 'PM'
): string {

  return (
    `${String(hour).padStart(
      2,
      '0'
    )}:` +
    `${String(minute).padStart(
      2,
      '0'
    )} ${period}`
  );
}


/* =====================================================
   FORMAT DATE FOR SQLITE
===================================================== */

function formatDateForStorage(
  date: Date
): string {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, '0');

  const day =
    String(
      date.getDate()
    ).padStart(2, '0');


  return `${year}-${month}-${day}`;
}


/* =====================================================
   DISPLAY DATE
===================================================== */

function formatDisplayDate(
  date: Date
): string {

  return date.toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );
}


function formatDisplayDateFromString(
  dateString: string
): string {

  const parts =
    dateString.split('-');


  if (parts.length !== 3) {
    return dateString;
  }


  const date =
    new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    );


  return formatDisplayDate(
    date
  );
}


/* =====================================================
   MONTH NAME
===================================================== */

function getMonthName(
  date: Date
): string {

  return date.toLocaleDateString(
    'en-US',
    {
      month: 'long',
    }
  );
}


/* =====================================================
   SAME DATE
===================================================== */

function isSameDate(
  first: Date,
  second: Date
): boolean {

  return (
    first.getFullYear() ===
      second.getFullYear() &&

    first.getMonth() ===
      second.getMonth() &&

    first.getDate() ===
      second.getDate()
  );
}


/* =====================================================
   CALENDAR
===================================================== */

function buildCalendarDays(
  month: Date
): (Date | null)[] {

  const year =
    month.getFullYear();

  const monthIndex =
    month.getMonth();


  const firstDay =
    new Date(
      year,
      monthIndex,
      1
    ).getDay();


  const daysInMonth =
    new Date(
      year,
      monthIndex + 1,
      0
    ).getDate();


  const days:
    (Date | null)[] =
    [];


  for (
    let i = 0;
    i < firstDay;
    i++
  ) {

    days.push(null);
  }


  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    days.push(
      new Date(
        year,
        monthIndex,
        day
      )
    );
  }


  while (
    days.length % 7 !== 0
  ) {

    days.push(null);
  }


  return days;
}


/* =====================================================
   WEEK DATES
===================================================== */

function getWeekDates(
  date: Date
): Date[] {

  const start =
    new Date(date);


  start.setDate(
    date.getDate() -
      date.getDay()
  );


  return Array.from(
    { length: 7 },
    (_, index) => {

      const current =
        new Date(start);

      current.setDate(
        start.getDate() +
          index
      );

      return current;
    }
  );
}


/* =====================================================
   EVENT SORTING
===================================================== */

function compareEventsByTime(
  a: AcademicEvent,
  b: AcademicEvent
): number {

  return (
    timeToMinutes(
      a.startTime
    ) -
    timeToMinutes(
      b.startTime
    )
  );
}


function compareEventsByDateAndTime(
  a: AcademicEvent,
  b: AcademicEvent
): number {

  if (
    a.date !== b.date
  ) {

    return a.date.localeCompare(
      b.date
    );
  }


  return compareEventsByTime(
    a,
    b
  );
}


/* =====================================================
   TIME TO MINUTES
===================================================== */

function timeToMinutes(
  time: string
): number {

  const match =
    time.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    );


  if (!match) {
    return 0;
  }


  let hour =
    Number(match[1]);

  const minute =
    Number(match[2]);

  const period =
    match[3].toUpperCase();


  if (
    period === 'AM' &&
    hour === 12
  ) {

    hour = 0;
  }


  if (
    period === 'PM' &&
    hour !== 12
  ) {

    hour += 12;
  }


  return (
    hour * 60 +
    minute
  );
}


/* =====================================================
   COLOR
===================================================== */

function getNextColor(
  currentLength: number
): AcademicEventColor {

  const colors:
    AcademicEventColor[] = [
      'blue',
      'purple',
      'green',
      'orange',
    ];


  return colors[
    currentLength %
      colors.length
  ];
}


/* =====================================================
   ICON SUGGESTION
===================================================== */

function getIconForSubject(
  subject: string
): IconName {

  const value =
    subject.toLowerCase();


  if (
    value.includes('math') ||
    value.includes('algebra') ||
    value.includes('calculus') ||
    value.includes('statistics')
  ) {

    return 'calculator-outline';
  }


  if (
    value.includes('english') ||
    value.includes('literature') ||
    value.includes('reading')
  ) {

    return 'book-outline';
  }


  if (
    value.includes('science') ||
    value.includes('chemistry') ||
    value.includes('biology') ||
    value.includes('physics')
  ) {

    return 'flask-outline';
  }


  if (
    value.includes('history') ||
    value.includes('social')
  ) {

    return 'library-outline';
  }


  if (
    value.includes('program') ||
    value.includes('coding') ||
    value.includes('computer') ||
    value.includes('it') ||
    value.includes('information technology')
  ) {

    return 'laptop-outline';
  }


  if (
    value.includes('project')
  ) {

    return 'folder-outline';
  }


  if (
    value.includes('assignment') ||
    value.includes('essay') ||
    value.includes('writing')
  ) {

    return 'create-outline';
  }


  if (
    value.includes('presentation')
  ) {

    return 'mic-outline';
  }


  return 'school-outline';
}


/* =====================================================
   REMINDER DESCRIPTION
===================================================== */

function getReminderDescription(
  eventType: EventType
): string {

  if (
    eventType === 'Quiz'
  ) {

    return (
      'You will be reminded 3 days, ' +
      '2 days, and 1 day before the quiz.'
    );
  }


  if (
    eventType === 'Exam'
  ) {

    return (
      'You will be reminded 7 days, ' +
      '3 days, and 1 day before the exam.'
    );
  }


  return (
    'This activity will be added to your ' +
    'schedule without automatic deadline reminders.'
  );
}


/* =====================================================
   SCHEDULE NOTIFICATIONS
===================================================== */

async function scheduleNotificationsForEvent(
  event: AcademicEvent
): Promise<void> {

  let reminderDays:
    number[] = [];


  if (
    event.eventType === 'Quiz'
  ) {

    reminderDays = [
      3,
      2,
      1,
    ];

  } else if (
    event.eventType === 'Exam'
  ) {

    reminderDays = [
      7,
      3,
      1,
    ];
  }


  if (
    reminderDays.length === 0
  ) {

    return;
  }


  const permission =
    await Notifications.getPermissionsAsync();


  let finalPermission =
    permission;


  if (
    finalPermission.status !==
    'granted'
  ) {

    finalPermission =
      await Notifications.requestPermissionsAsync();
  }


  if (
    finalPermission.status !==
    'granted'
  ) {

    return;
  }


  const eventDate =
    parseDateTime(
      event.date,
      event.startTime
    );


  for (
    const daysBefore
      of reminderDays
  ) {

    const reminderDate =
      new Date(eventDate);


    reminderDate.setDate(
      reminderDate.getDate() -
        daysBefore
    );


    /*
     * Don't schedule notifications
     * that are already in the past.
     */

    if (
      reminderDate.getTime() <=
      Date.now()
    ) {

      continue;
    }


    await Notifications.scheduleNotificationAsync({

      content: {

        title:
          `${event.eventType} Reminder`,

        body:
          `${event.subject} is in ${daysBefore} ` +
          `${daysBefore === 1 ? 'day' : 'days'}.`,

        data: {
          eventId:
            event.id,

          eventType:
            event.eventType,
        },

      },

      trigger: {
        type:
          Notifications
            .SchedulableTriggerInputTypes
            .DATE,

        date:
          reminderDate,
      },

    });
  }
}


/* =====================================================
   PARSE DATE + TIME
===================================================== */

function parseDateTime(
  dateString: string,
  timeString: string
): Date {

  const dateParts =
    dateString.split('-');


  const date =
    new Date(
      Number(dateParts[0]),
      Number(dateParts[1]) - 1,
      Number(dateParts[2])
    );


  const match =
    timeString.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    );


  if (!match) {

    date.setHours(
      9,
      0,
      0,
      0
    );

    return date;
  }


  let hour =
    Number(match[1]);

  const minute =
    Number(match[2]);

  const period =
    match[3].toUpperCase();


  if (
    period === 'AM' &&
    hour === 12
  ) {

    hour = 0;
  }


  if (
    period === 'PM' &&
    hour !== 12
  ) {

    hour += 12;
  }


  date.setHours(
    hour,
    minute,
    0,
    0
  );


  return date;
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
      backgroundColor:
        theme.background,
    },

    scrollContent: {
      paddingBottom: 140,
    },


    /* =================================================
       HEADER
    ================================================= */

    header: {
      backgroundColor:
        theme.background,

      paddingHorizontal: 18,

      paddingTop: 40,

      paddingBottom: 4,
    },

    headerTop: {
      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },

    headerTitle: {
      fontSize: 24,

      fontWeight: '800',

      color: theme.text,
    },

    headerSubtitle: {
      display: 'none',
    },

    /* =================================================
       VIEW SELECTOR
    ================================================= */

    viewSelectorContainer: {
      height: 48,

      marginHorizontal: 18,

      marginTop: 8,

      backgroundColor:
        theme.primaryLight,

      borderRadius: 12,

      padding: 3,

      flexDirection: 'row',
    },

    viewSelectorButton: {
      flex: 1,

      borderRadius: 9,

      alignItems: 'center',

      justifyContent: 'center',
    },

    selectedViewButton: {
      backgroundColor:
        theme.primary,
    },

    viewSelectorText: {
      fontSize: 13,

      fontWeight: '600',

      color:
        theme.textSecondary,
    },

    selectedViewText: {
      color: '#FFFFFF',

      fontWeight: '700',
    },


    /* =================================================
       CALENDAR
    ================================================= */

    calendarCard: {
      backgroundColor:
        theme.card,

      marginHorizontal: 18,

      marginTop: 14,

      borderRadius: 18,

      padding: 15,

      borderWidth: 1,

      borderColor:
        theme.border,

      elevation: 1,
    },

    calendarHeader: {
      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      marginBottom: 13,
    },

    calendarArrow: {
      width: 38,

      height: 38,

      borderRadius: 12,

      backgroundColor:
        theme.primaryLight,

      alignItems: 'center',

      justifyContent: 'center',
    },

    calendarMonthTitle: {
      fontSize: 16,

      fontWeight: '800',

      color: theme.text,
    },

    weekdayRow: {
      flexDirection: 'row',

      marginBottom: 4,
    },

    weekdayText: {
      width: '14.2857%',

      textAlign: 'center',

      fontSize: 11,

      fontWeight: '700',

      color:
        theme.textMuted,
    },

    calendarGrid: {
      flexDirection: 'row',

      flexWrap: 'wrap',
    },

    calendarDay: {
      width: '14.2857%',

      height: 42,

      alignItems: 'center',

      justifyContent: 'center',

      position: 'relative',
    },

    calendarDayText: {
      fontSize: 13,

      color: theme.text,

      fontWeight: '600',
    },

    selectedCalendarDay: {
      width: '14.2857%',

      height: 42,

      borderRadius: 12,

      backgroundColor:
        theme.primary,
    },

    selectedCalendarDayText: {
      color: '#FFFFFF',

      fontWeight: '800',
    },

    todayCalendarDay: {
      borderRadius: 12,

      backgroundColor:
        theme.primaryLight,
    },

    todayCalendarDayText: {
      color: theme.primary,

      fontWeight: '800',
    },

    eventDot: {
      position: 'absolute',

      bottom: 4,

      width: 5,

      height: 5,

      borderRadius: 3,

      backgroundColor:
        theme.primary,
    },


    /* =================================================
       SELECTED DATE
    ================================================= */

    selectedDateHeader: {
      marginHorizontal: 18,

      marginTop: 22,

      marginBottom: 12,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },

    selectedDateTitle: {
      fontSize: 19,

      fontWeight: '800',

      color: theme.text,
    },

    selectedDateSubtitle: {
      fontSize: 12,

      color:
        theme.textSecondary,

      marginTop: 3,
    },

    eventCountBadge: {
      minWidth: 34,

      height: 34,

      paddingHorizontal: 9,

      borderRadius: 17,

      backgroundColor:
        theme.primaryLight,

      alignItems: 'center',

      justifyContent: 'center',
    },

    eventCountText: {
      color: theme.primary,

      fontSize: 13,

      fontWeight: '800',
    },


    /* =================================================
       EVENT CARD
    ================================================= */

    eventRow: {
      flexDirection: 'row',

      marginHorizontal: 18,

      marginBottom: 11,
    },

    timelineContainer: {
      width: 22,

      alignItems: 'center',

      paddingTop: 20,
    },

    timelineDot: {
      width: 15,

      height: 15,

      borderRadius: 8,

      borderWidth: 2,

      alignItems: 'center',

      justifyContent: 'center',

      backgroundColor:
        theme.background,
    },

    timelineDotInner: {
      width: 5,

      height: 5,

      borderRadius: 3,
    },

    eventCard: {
      flex: 1,

      minHeight: 105,

      borderRadius: 17,

      padding: 13,

      flexDirection: 'row',

      alignItems: 'center',
    },

    eventIconContainer: {
      width: 51,

      height: 51,

      borderRadius: 15,

      backgroundColor:
        'rgba(255,255,255,0.55)',

      alignItems: 'center',

      justifyContent: 'center',

      marginRight: 11,
    },

    eventInfo: {
      flex: 1,

      minWidth: 0,
    },

    eventTopRow: {
      flexDirection: 'row',

      alignItems: 'center',

      marginBottom: 3,
    },

    eventTime: {
      fontSize: 11,

      fontWeight: '700',

      flex: 1,
    },

    eventTypeBadge: {
      paddingHorizontal: 7,

      paddingVertical: 3,

      borderRadius: 7,

      backgroundColor:
        'rgba(255,255,255,0.65)',

      marginLeft: 5,
    },

    eventTypeBadgeText: {
      fontSize: 9,

      fontWeight: '800',

      color:
        theme.textSecondary,
    },

    eventSubject: {
      fontSize: 16,

      fontWeight: '800',

      color: theme.text,

      marginBottom: 3,
    },

    eventDescription: {
      fontSize: 11.5,

      color:
        theme.textSecondary,

      lineHeight: 16,
    },

    eventDateText: {
      fontSize: 10,

      color:
        theme.textMuted,

      marginTop: 5,
    },

    eventDeleteButton: {
      width: 34,

      height: 34,

      alignItems: 'center',

      justifyContent: 'center',

      marginLeft: 3,
    },


    /* =================================================
       EMPTY STATE
    ================================================= */

    emptyCard: {
      marginHorizontal: 18,

      backgroundColor:
        theme.card,

      borderRadius: 18,

      paddingVertical: 35,

      paddingHorizontal: 25,

      alignItems: 'center',

      borderWidth: 1,

      borderColor:
        theme.border,
    },

    emptyIconCircle: {
      width: 65,

      height: 65,

      borderRadius: 33,

      backgroundColor:
        theme.primaryLight,

      alignItems: 'center',

      justifyContent: 'center',

      marginBottom: 12,
    },

    emptyTitle: {
      fontSize: 16,

      fontWeight: '800',

      color: theme.text,

      marginTop: 9,
    },

    emptyText: {
      fontSize: 12,

      lineHeight: 18,

      textAlign: 'center',

      color:
        theme.textSecondary,

      marginTop: 5,

      maxWidth: 280,
    },

    floatingAddButton: {
      position: 'absolute',
      right: 18,
      bottom: 82,
      height: 50,
      paddingHorizontal: 18,
      borderRadius: 25,
      backgroundColor: theme.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      elevation: 5,
    },

    floatingAddButtonText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
    },

    upcomingSection: {
      marginTop: 24,
    },

    upcomingHeader: {
      marginHorizontal: 18,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    upcomingTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
    },

    upcomingSubtitle: {
      marginTop: 3,
      fontSize: 11.5,
      color: theme.textSecondary,
    },

    upcomingCountBadge: {
      minWidth: 34,
      height: 34,
      paddingHorizontal: 9,
      borderRadius: 17,
      backgroundColor: theme.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },

    upcomingCountText: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.primary,
    },


    /* =================================================
       REMINDER INFO
    ================================================= */

    reminderInfoCard: {
      marginHorizontal: 18,

      marginTop: 17,

      backgroundColor:
        theme.card,

      borderRadius: 16,

      padding: 14,

      flexDirection: 'row',

      borderWidth: 1,

      borderColor:
        theme.border,
    },

    reminderIconCircle: {
      width: 42,

      height: 42,

      borderRadius: 21,

      backgroundColor:
        theme.primaryLight,

      alignItems: 'center',

      justifyContent: 'center',

      marginRight: 11,
    },

    reminderInfoText: {
      flex: 1,
    },

    reminderInfoTitle: {
      fontSize: 13,

      fontWeight: '800',

      color: theme.text,
    },

    reminderInfoDescription: {
      fontSize: 11,

      lineHeight: 16,

      color:
        theme.textSecondary,

      marginTop: 3,
    },


    /* =================================================
       MODAL
    ================================================= */

    modalOverlay: {
      flex: 1,

      backgroundColor:
        'rgba(0,0,0,0.45)',

      justifyContent: 'flex-end',
    },

    modalContainer: {
      backgroundColor:
        theme.background,

      borderTopLeftRadius: 26,

      borderTopRightRadius: 26,

      maxHeight: '94%',

      paddingTop: 18,
    },

    modalHeader: {
      paddingHorizontal: 19,

      paddingBottom: 14,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      borderBottomWidth: 1,

      borderBottomColor:
        theme.border,
    },

    modalTitle: {
      fontSize: 21,

      fontWeight: '800',

      color: theme.text,
    },

    modalSubtitle: {
      fontSize: 11.5,

      color:
        theme.textSecondary,

      marginTop: 3,
    },

    modalCloseButton: {
      width: 39,

      height: 39,

      borderRadius: 12,

      backgroundColor:
        theme.card,

      alignItems: 'center',

      justifyContent: 'center',

      borderWidth: 1,

      borderColor:
        theme.border,
    },

    modalScrollContent: {
      paddingHorizontal: 18,

      paddingTop: 17,

      paddingBottom: 30,
    },


    /* =================================================
       FORM
    ================================================= */

    formLabel: {
      fontSize: 13,

      fontWeight: '800',

      color: theme.text,

      marginBottom: 8,

      marginTop: 14,
    },

    inputContainer: {
      minHeight: 51,

      borderRadius: 14,

      backgroundColor:
        theme.inputBackground,

      borderWidth: 1,

      borderColor:
        theme.inputBorder,

      flexDirection: 'row',

      alignItems: 'center',

      paddingHorizontal: 13,
    },

    input: {
      flex: 1,

      minHeight: 49,

      fontSize: 13.5,

      color: theme.text,

      marginLeft: 9,
    },

    descriptionContainer: {
      alignItems: 'flex-start',

      paddingTop: 11,

      minHeight: 105,
    },

    descriptionIcon: {
      marginTop: 3,
    },

    descriptionInput: {
      minHeight: 82,

      textAlignVertical: 'top',

    },

    helperText: {
      fontSize: 10.5,

      lineHeight: 15,

      color:
        theme.textMuted,

      marginTop: 5,
    },

    iconHelperText: {
      fontSize: 11,

      color:
        theme.textSecondary,

      marginTop: -3,

      marginBottom: 8,
    },


    /* =================================================
       ACTIVITY TYPE
    ================================================= */

    eventTypeGrid: {
      flexDirection: 'row',

      flexWrap: 'wrap',

      gap: 8,
    },

    eventTypeButton: {
      width: '31.8%',

      minHeight: 55,

      borderRadius: 13,

      backgroundColor:
        theme.card,

      borderWidth: 1,

      borderColor:
        theme.border,

      alignItems: 'center',

      justifyContent: 'center',

      paddingHorizontal: 3,
    },

    selectedEventTypeButton: {
      backgroundColor:
        theme.primary,

      borderColor:
        theme.primary,
    },

    eventTypeText: {
      fontSize: 10.5,

      fontWeight: '700',

      color:
        theme.textSecondary,

      marginTop: 4,

      textAlign: 'center',
    },

    selectedEventTypeText: {
      color: '#FFFFFF',
    },


    /* =================================================
       DATE
    ================================================= */

    dateButton: {
      height: 51,

      borderRadius: 14,

      backgroundColor:
        theme.inputBackground,

      borderWidth: 1,

      borderColor:
        theme.inputBorder,

      flexDirection: 'row',

      alignItems: 'center',

      paddingHorizontal: 13,
    },

    dateButtonText: {
      flex: 1,

      fontSize: 13.5,

      color: theme.text,

      fontWeight: '600',

      marginLeft: 9,
    },


    /* =================================================
       ACTIVITY DATE CALENDAR
    ================================================= */

    activityDateCalendar: {
      marginTop: 8,

      backgroundColor:
        theme.card,

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        theme.border,

      padding: 12,
    },

    activityDateCalendarHeader: {
      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      marginBottom: 10,
    },

    activityDateCalendarArrow: {
      width: 34,

      height: 34,

      borderRadius: 10,

      backgroundColor:
        theme.primaryLight,

      alignItems: 'center',

      justifyContent: 'center',
    },

    activityDateCalendarMonth: {
      fontSize: 14,

      fontWeight: '800',

      color: theme.text,
    },

    activityDateWeekdayRow: {
      flexDirection: 'row',

      marginBottom: 3,
    },

    activityDateWeekdayText: {
      width: '14.2857%',

      textAlign: 'center',

      fontSize: 10,

      fontWeight: '700',

      color:
        theme.textMuted,
    },

    activityDateGrid: {
      flexDirection: 'row',

      flexWrap: 'wrap',
    },

    activityDateDay: {
      width: '14.2857%',

      height: 38,

      alignItems: 'center',

      justifyContent: 'center',

      position: 'relative',

      borderRadius: 10,
    },

    activityDateDayText: {
      fontSize: 12.5,

      color: theme.text,

      fontWeight: '600',
    },

    activityDateSelectedDay: {
      backgroundColor:
        theme.primary,
    },

    activityDateSelectedDayText: {
      color: '#FFFFFF',

      fontWeight: '800',
    },

    activityDateTodayDay: {
      backgroundColor:
        theme.primaryLight,
    },

    activityDateTodayDayText: {
      color: theme.primary,

      fontWeight: '800',
    },

    activityDateEventDot: {
      position: 'absolute',

      bottom: 3,

      width: 4,

      height: 4,

      borderRadius: 2,

      backgroundColor:
        theme.primary,
    },


    /* =================================================
       TIME PICKER
    ================================================= */

    timePickerContainer: {
      marginTop: 2,
    },

    timePickerBox: {
      height: 116,

      backgroundColor:
        theme.card,

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        theme.border,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',
    },

    timeColumn: {
      width: 55,

      height: 106,

      alignItems: 'center',

      justifyContent: 'space-between',

      paddingVertical: 3,
    },

    timeArrowButton: {
      width: 45,

      height: 31,

      borderRadius: 9,

      backgroundColor:
        theme.primaryLight,

      alignItems: 'center',

      justifyContent: 'center',
    },

    timeValue: {
      fontSize: 20,

      fontWeight: '800',

      color: theme.text,
    },

    timeColon: {
      fontSize: 21,

      fontWeight: '800',

      color: theme.text,

      marginHorizontal: 3,

      marginTop: 1,
    },

    periodColumn: {
      marginLeft: 14,

      gap: 7,
    },

    periodButton: {
      width: 59,

      height: 41,

      borderRadius: 10,

      backgroundColor:
        theme.cardSecondary,

      borderWidth: 1,

      borderColor:
        theme.border,

      alignItems: 'center',

      justifyContent: 'center',
    },

    selectedPeriodButton: {
      backgroundColor:
        theme.primary,

      borderColor:
        theme.primary,
    },

    periodButtonText: {
      fontSize: 12,

      fontWeight: '800',

      color:
        theme.textSecondary,
    },

    selectedPeriodButtonText: {
      color: '#FFFFFF',
    },


    /* =================================================
       ICON PICKER
    ================================================= */

    iconGrid: {
      flexDirection: 'row',

      flexWrap: 'wrap',

      gap: 8,
    },

    iconButton: {
      width: 48,

      height: 48,

      borderRadius: 12,

      backgroundColor:
        theme.card,

      borderWidth: 1,

      borderColor:
        theme.border,

      alignItems: 'center',

      justifyContent: 'center',
    },

    selectedIconButton: {
      backgroundColor:
        theme.primaryLight,

      borderWidth: 2,

      borderColor:
        theme.primary,
    },


    /* =================================================
       REMINDER FORM
    ================================================= */

    reminderFormCard: {
      marginTop: 18,

      padding: 13,

      borderRadius: 14,

      backgroundColor:
        theme.primaryLight,

      flexDirection: 'row',

      alignItems: 'flex-start',
    },

    reminderFormText: {
      flex: 1,

      marginLeft: 10,
    },

    reminderFormTitle: {
      fontSize: 13,

      fontWeight: '800',

      color: theme.text,
    },

    reminderFormDescription: {
      fontSize: 11,

      lineHeight: 16,

      color:
        theme.textSecondary,

      marginTop: 3,
    },


    /* =================================================
       MODAL BUTTONS
    ================================================= */

    modalButtons: {
      flexDirection: 'row',

      marginTop: 20,

      gap: 10,
    },

    cancelButton: {
      height: 52,

      flex: 0.85,

      borderRadius: 14,

      backgroundColor:
        theme.card,

      borderWidth: 1,

      borderColor:
        theme.border,

      alignItems: 'center',

      justifyContent: 'center',
    },

    cancelButtonText: {
      fontSize: 13,

      fontWeight: '700',

      color:
        theme.textSecondary,
    },

    saveButton: {
      height: 52,

      flex: 1.5,

      borderRadius: 14,

      backgroundColor:
        theme.primary,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 6,
    },

    saveButtonText: {
      color: '#FFFFFF',

      fontSize: 13,

      fontWeight: '800',
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

      backgroundColor:
        theme.tabBar,

      borderTopWidth: 1,

      borderTopColor:
        theme.border,

      flexDirection: 'row',

      justifyContent:
        'space-around',

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

      color:
        theme.tabInactive,

      marginTop: 3,
    },

    activeBottomLabel: {
      color:
        theme.primary,

      fontWeight: '700',
    },

    bottomSpace: {
      height: 25,
    },

  });