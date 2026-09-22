import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';

import { useState } from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import { useApp } from '../context/AppContext';

import type { AppTheme } from '../theme/theme';


// ======================================================
// TYPES
// ======================================================

type ScheduleScreenProps = {
  onGoHome: () => void;
  onGoTasks: () => void;
  onGoMore: () => void;
};

type IconName = keyof typeof Ionicons.glyphMap;

type StudyBlockColor =
  | 'blue'
  | 'purple'
  | 'green'
  | 'orange';

type StudyBlock = {
  id: number;
  time: string;
  subject: string;
  description: string;
  color: StudyBlockColor;
  icon: IconName;
};


// ======================================================
// AVAILABLE STUDY ICONS
// ======================================================

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

  // Planning / Productivity
  'calendar-outline',
  'time-outline',
  'timer-outline',
  'checkbox-outline',
  'checkmark-circle-outline',
  'bookmark-outline',
  'star-outline',
  'flag-outline',

  // Creative / Activities
  'color-palette-outline',
  'musical-notes-outline',
  'mic-outline',
  'videocam-outline',

  // Other
  'people-outline',
  'bulb-outline',
];


// ======================================================
// INITIAL STUDY BLOCKS
// ======================================================

const initialStudyBlocks: StudyBlock[] = [

  {
    id: 1,
    time: '8:00 AM – 9:00 AM',
    subject: 'Math',
    description: 'Study chapter 3',
    color: 'blue',
    icon: 'calculator-outline',
  },

  {
    id: 2,
    time: '10:00 AM – 11:00 AM',
    subject: 'English',
    description: 'Read and review',
    color: 'purple',
    icon: 'book-outline',
  },

  {
    id: 3,
    time: '1:00 PM – 2:00 PM',
    subject: 'Science',
    description: 'Lab report research',
    color: 'green',
    icon: 'flask-outline',
  },

  {
    id: 4,
    time: '3:00 PM – 4:00 PM',
    subject: 'History',
    description: 'Prepare outline',
    color: 'orange',
    icon: 'library-outline',
  },
];


// ======================================================
// MAIN SCREEN
// ======================================================

export default function ScheduleScreen({
  onGoHome,
  onGoTasks,
  onGoMore,
}: ScheduleScreenProps) {

  // ====================================================
  // APP THEME
  // ====================================================

  const {
    theme,
  } = useApp();

  const styles = createStyles(theme);


  // ====================================================
  // VIEW STATE
  // ====================================================

  const [selectedView, setSelectedView] =
    useState<'Day' | 'Week'>('Day');


  // ====================================================
  // STUDY BLOCKS
  // ====================================================

  const [studyBlocks, setStudyBlocks] =
    useState<StudyBlock[]>(initialStudyBlocks);


  // ====================================================
  // ADD STUDY BLOCK MODAL
  // ====================================================

  const [showAddModal, setShowAddModal] =
    useState(false);


  // ====================================================
  // FORM STATE
  // ====================================================

  const [subject, setSubject] =
    useState('');

  const [startTime, setStartTime] =
    useState('');

  const [endTime, setEndTime] =
    useState('');

  const [description, setDescription] =
    useState('');


  const [selectedIcon, setSelectedIcon] =
    useState<IconName>('school-outline');


  // ====================================================
  // FORM HELPERS
  // ====================================================

  const resetForm = () => {

    setSubject('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setSelectedIcon('school-outline');
  };


  const handleOpenAddBlock = () => {

    resetForm();

    setShowAddModal(true);
  };


  // ====================================================
  // SUBJECT ICON SUGGESTION
  // ====================================================

  const handleSubjectChange = (
    value: string
  ) => {

    setSubject(value);

    const suggestedIcon =
      getIconForSubject(value);

    if (value.trim()) {
      setSelectedIcon(suggestedIcon);
    }
  };


  // ====================================================
  // ADD STUDY BLOCK
  // ====================================================

  const handleAddStudyBlock = () => {

    if (!subject.trim()) {

      Alert.alert(
        'Missing Subject',
        'Please enter a subject.'
      );

      return;
    }


    if (!startTime.trim()) {

      Alert.alert(
        'Missing Start Time',
        'Please enter a start time.'
      );

      return;
    }


    if (!endTime.trim()) {

      Alert.alert(
        'Missing End Time',
        'Please enter an end time.'
      );

      return;
    }


    if (!description.trim()) {

      Alert.alert(
        'Missing Description',
        'Please enter a short description.'
      );

      return;
    }


    const newStudyBlock: StudyBlock = {

      id: Date.now(),

      time:
        `${startTime.trim()} – ${endTime.trim()}`,

      subject:
        subject.trim(),

      description:
        description.trim(),

      color:
        getNextColor(studyBlocks.length),

      icon:
        selectedIcon,
    };


    setStudyBlocks(
      (currentBlocks) => [
        ...currentBlocks,
        newStudyBlock,
      ]
    );


    resetForm();

    setShowAddModal(false);


    Alert.alert(
      'Study Block Added',
      `${newStudyBlock.subject} has been added to your schedule.`
    );
  };


  // ====================================================
  // RENDER
  // ====================================================

  return (
    <View style={styles.container}>

      {/* ==================================================
          STATUS BAR
          ================================================== */}

      <StatusBar
        barStyle={
          theme.background === '#07152F'
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={theme.background}
      />


      {/* ==================================================
          MAIN SCROLL CONTENT
          ================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* ==================================================
            HEADER
            ================================================== */}

        <View style={styles.header}>

          <Text style={styles.headerTitle}>
            Study Schedule
          </Text>


          <Pressable
            style={
              styles.headerCalendarButton
            }
            onPress={() => {

              Alert.alert(
                'Calendar',
                'Calendar selection will be added next.'
              );

            }}
          >

            <Ionicons
              name="calendar-outline"
              size={25}
              color={theme.primary}
            />

          </Pressable>

        </View>


        {/* ==================================================
            DAY / WEEK SELECTOR
            ================================================== */}

        <View style={styles.viewSelector}>

          {/* DAY */}

          <Pressable
            style={[
              styles.viewButton,

              selectedView === 'Day' &&
                styles.selectedViewButton,
            ]}
            onPress={() =>
              setSelectedView('Day')
            }
          >

            <Text
              style={[
                styles.viewButtonText,

                selectedView === 'Day' &&
                  styles.selectedViewButtonText,
              ]}
            >
              Day
            </Text>

          </Pressable>


          {/* WEEK */}

          <Pressable
            style={[
              styles.viewButton,

              selectedView === 'Week' &&
                styles.selectedViewButton,
            ]}
            onPress={() =>
              setSelectedView('Week')
            }
          >

            <Text
              style={[
                styles.viewButtonText,

                selectedView === 'Week' &&
                  styles.selectedViewButtonText,
              ]}
            >
              Week
            </Text>

          </Pressable>

        </View>


        {/* ==================================================
            DATE NAVIGATION
            ================================================== */}

        <View style={styles.dateNavigation}>

          {/* PREVIOUS */}

          <Pressable
            style={styles.arrowButton}
            onPress={() => {

              Alert.alert(
                'Previous Day',
                'Previous date navigation will be added next.'
              );

            }}
          >

            <Ionicons
              name="chevron-back"
              size={27}
              color={theme.text}
            />

          </Pressable>


          {/* DATE */}

          <View style={styles.dateCenter}>

            <View style={styles.dateRow}>

              <Ionicons
                name="calendar-outline"
                size={27}
                color={theme.primary}
              />

              <Text style={styles.dateText}>
                Apr 23, 2025
              </Text>

            </View>


            <Text style={styles.dayText}>
              Wednesday
            </Text>

          </View>


          {/* NEXT */}

          <Pressable
            style={styles.arrowButton}
            onPress={() => {

              Alert.alert(
                'Next Day',
                'Next date navigation will be added next.'
              );

            }}
          >

            <Ionicons
              name="chevron-forward"
              size={27}
              color={theme.text}
            />

          </Pressable>

        </View>


        {/* ==================================================
            STUDY SCHEDULE
            ================================================== */}

        <View style={styles.scheduleContainer}>

          {studyBlocks.map((block) => (

            <StudyBlockCard
              key={block.id}
              block={block}
              theme={theme}
            />

          ))}

        </View>


        {/* ==================================================
            ADD STUDY BLOCK
            ================================================== */}

        <Pressable
          style={styles.addStudyButton}
          onPress={handleOpenAddBlock}
        >

          <Ionicons
            name="add"
            size={25}
            color="#FFFFFF"
          />

          <Text style={styles.addStudyButtonText}>
            Add Study Block
          </Text>

        </Pressable>

      </ScrollView>


      {/* ==================================================
          BOTTOM NAVIGATION
          ================================================== */}

      <View style={styles.bottomNavigation}>

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

          <Text style={styles.bottomLabel}>
            Home
          </Text>

        </Pressable>


        {/* TASKS */}

        <Pressable
          style={styles.bottomItem}
          onPress={onGoTasks}
        >

          <Ionicons
            name="checkbox-outline"
            size={23}
            color={theme.tabInactive}
          />

          <Text style={styles.bottomLabel}>
            Tasks
          </Text>

        </Pressable>


        {/* SCHEDULE - ACTIVE */}

        <Pressable
          style={styles.bottomItem}
        >

          <Ionicons
            name="calendar"
            size={23}
            color={theme.primary}
          />

          <Text
            style={[
              styles.bottomLabel,
              styles.activeLabel,
            ]}
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

          <Text style={styles.bottomLabel}>
            More
          </Text>

        </Pressable>

      </View>


      {/* ==================================================
          ADD STUDY BLOCK MODAL
          ================================================== */}

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() =>
          setShowAddModal(false)
        }
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalContainer}>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >

              {/* ==================================================
                  MODAL HEADER
                  ================================================== */}

              <View style={styles.modalHeader}>

                <View>

                  <Text style={styles.modalTitle}>
                    Add Study Block
                  </Text>

                  <Text
                    style={styles.modalSubtitle}
                  >
                    Plan your next study session
                  </Text>

                </View>


                <Pressable
                  style={styles.closeButton}
                  onPress={() =>
                    setShowAddModal(false)
                  }
                >

                  <Ionicons
                    name="close"
                    size={25}
                    color={theme.textSecondary}
                  />

                </Pressable>

              </View>


              {/* ==================================================
                  SUBJECT
                  ================================================== */}

              <Text style={styles.inputLabel}>
                Subject
              </Text>

              <TextInput
                style={styles.input}
                placeholder="e.g. Mathematics"
                placeholderTextColor={
                  theme.textMuted
                }
                value={subject}
                onChangeText={
                  handleSubjectChange
                }
              />


              {/* ==================================================
                  TIME
                  ================================================== */}

              <View style={styles.timeRow}>

                {/* START TIME */}

                <View
                  style={
                    styles.timeInputContainer
                  }
                >

                  <Text style={styles.inputLabel}>
                    Start Time
                  </Text>

                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 5:00 PM"
                    placeholderTextColor={
                      theme.textMuted
                    }
                    value={startTime}
                    onChangeText={
                      setStartTime
                    }
                  />

                </View>


                {/* END TIME */}

                <View
                  style={
                    styles.timeInputContainer
                  }
                >

                  <Text style={styles.inputLabel}>
                    End Time
                  </Text>

                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 6:00 PM"
                    placeholderTextColor={
                      theme.textMuted
                    }
                    value={endTime}
                    onChangeText={
                      setEndTime
                    }
                  />

                </View>

              </View>


              {/* ==================================================
                  DESCRIPTION
                  ================================================== */}

              <Text style={styles.inputLabel}>
                Description
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.descriptionInput,
                ]}
                placeholder="What will you study?"
                placeholderTextColor={
                  theme.textMuted
                }
                value={description}
                onChangeText={
                  setDescription
                }
                multiline
                textAlignVertical="top"
              />


              {/* ==================================================
                  ICON PICKER
                  ================================================== */}

              <View
                style={
                  styles.iconPickerHeader
                }
              >

                <View>

                  <Text style={styles.inputLabel}>
                    Choose an Icon
                  </Text>

                  <Text
                    style={
                      styles.iconPickerSubtitle
                    }
                  >
                    Select an icon for your study block
                  </Text>

                </View>


                {/* SELECTED ICON */}

                <View
                  style={
                    styles.selectedIconPreview
                  }
                >

                  <Ionicons
                    name={selectedIcon}
                    size={22}
                    color={theme.primary}
                  />

                </View>

              </View>


              {/* ==================================================
                  ICON GRID
                  ================================================== */}

              <View style={styles.iconGrid}>

                {taskIcons.map((icon) => {

                  const isSelected =
                    selectedIcon === icon;

                  return (
                    <Pressable
                      key={icon}
                      style={[
                        styles.iconButton,

                        isSelected &&
                          styles.selectedIconButton,
                      ]}
                      onPress={() =>
                        setSelectedIcon(icon)
                      }
                    >

                      <Ionicons
                        name={icon}
                        size={24}
                        color={
                          isSelected
                            ? theme.primary
                            : theme.textSecondary
                        }
                      />

                    </Pressable>
                  );

                })}

              </View>


              {/* ==================================================
                  MODAL BUTTONS
                  ================================================== */}

              <View
                style={styles.modalButtons}
              >

                {/* CANCEL */}

                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {

                    resetForm();

                    setShowAddModal(false);

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


                {/* SAVE */}

                <Pressable
                  style={styles.saveButton}
                  onPress={
                    handleAddStudyBlock
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
                    Add Study Block
                  </Text>

                </Pressable>

              </View>

            </ScrollView>

          </View>

        </View>

      </Modal>

    </View>
  );
}


// ======================================================
// STUDY BLOCK CARD
// ======================================================

type StudyBlockCardProps = {
  block: StudyBlock;
  theme: AppTheme;
};


function StudyBlockCard({
  block,
  theme,
}: StudyBlockCardProps) {

  // ====================================================
  // LIGHT / DARK STUDY CARD COLORS
  // ====================================================

  const blockStyles = theme.background === '#07152F'

    ? {

        blue: {
          background: '#102D52',
          icon: '#2F8BFF',
          time: '#9ABCE5',
          dot: '#2F8BFF',
        },

        purple: {
          background: '#2A2148',
          icon: '#B48CFF',
          time: '#C2A9EA',
          dot: '#B48CFF',
        },

        green: {
          background: '#12382B',
          icon: '#24D994',
          time: '#9BD8BE',
          dot: '#24D994',
        },

        orange: {
          background: '#40311B',
          icon: '#FFD34E',
          time: '#D8BE78',
          dot: '#FFD34E',
        },

      }

    : {

        blue: {
          background: '#E7F4FF',
          icon: '#1261D6',
          time: '#587BA5',
          dot: '#1261D6',
        },

        purple: {
          background: '#F0E7FF',
          icon: '#7637D8',
          time: '#7251A2',
          dot: '#7637D8',
        },

        green: {
          background: '#E3F8EA',
          icon: '#20A65A',
          time: '#4D8565',
          dot: '#20A65A',
        },

        orange: {
          background: '#FFF2D2',
          icon: '#E99A00',
          time: '#8D7444',
          dot: '#E99A00',
        },

      };


  const currentStyle =
    blockStyles[block.color];


  const styles = createStyles(theme);


  return (
    <View style={styles.studyRow}>

      {/* ==================================================
          TIMELINE DOT
          ================================================== */}

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


      {/* ==================================================
          STUDY CARD
          ================================================== */}

      <View
        style={[
          styles.studyCard,

          {
            backgroundColor:
              currentStyle.background,
          },
        ]}
      >

        <View
          style={
            styles.studyIconContainer
          }
        >

          <Ionicons
            name={block.icon}
            size={30}
            color={currentStyle.icon}
          />

        </View>


        <View style={styles.studyInfo}>

          <Text
            style={[
              styles.studyTime,

              {
                color:
                  currentStyle.time,
              },
            ]}
          >
            {block.time}
          </Text>


          <Text
            style={styles.studySubject}
          >
            {block.subject}
          </Text>


          <Text
            style={styles.studyDescription}
          >
            {block.description}
          </Text>

        </View>

      </View>

    </View>
  );
}


// ======================================================
// HELPER: NEXT COLOR
// ======================================================

function getNextColor(
  currentLength: number
): StudyBlockColor {

  const colors: StudyBlockColor[] = [
    'blue',
    'purple',
    'green',
    'orange',
  ];

  return colors[
    currentLength % colors.length
  ];
}


// ======================================================
// HELPER: SUBJECT ICON
// ======================================================

function getIconForSubject(
  subject: string
): IconName {

  const lowerSubject =
    subject.toLowerCase();


  if (
    lowerSubject.includes('math') ||
    lowerSubject.includes('calculus') ||
    lowerSubject.includes('algebra') ||
    lowerSubject.includes('statistics')
  ) {

    return 'calculator-outline';
  }


  if (
    lowerSubject.includes('english') ||
    lowerSubject.includes('language') ||
    lowerSubject.includes('literature') ||
    lowerSubject.includes('reading')
  ) {

    return 'book-outline';
  }


  if (
    lowerSubject.includes('science') ||
    lowerSubject.includes('biology') ||
    lowerSubject.includes('chemistry') ||
    lowerSubject.includes('physics')
  ) {

    return 'flask-outline';
  }


  if (
    lowerSubject.includes('history') ||
    lowerSubject.includes('social')
  ) {

    return 'library-outline';
  }


  if (
    lowerSubject.includes('programming') ||
    lowerSubject.includes('coding') ||
    lowerSubject.includes('computer') ||
    lowerSubject.includes('it')
  ) {

    return 'laptop-outline';
  }


  if (
    lowerSubject.includes('art') ||
    lowerSubject.includes('design')
  ) {

    return 'color-palette-outline';
  }


  if (
    lowerSubject.includes('music')
  ) {

    return 'musical-notes-outline';
  }


  if (
    lowerSubject.includes('presentation') ||
    lowerSubject.includes('report')
  ) {

    return 'mic-outline';
  }


  if (
    lowerSubject.includes('project') ||
    lowerSubject.includes('group')
  ) {

    return 'people-outline';
  }


  return 'school-outline';
}


// ======================================================
// STYLES
// ======================================================

const createStyles = (
  theme: AppTheme
) =>
  StyleSheet.create({

    // ==================================================
    // MAIN CONTAINER
    // ==================================================

    container: {
      flex: 1,
      backgroundColor:
        theme.background,
    },


    // ==================================================
    // SCROLL CONTENT
    // ==================================================

    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 30,
      paddingBottom: 105,
    },


    // ==================================================
    // HEADER
    // ==================================================

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 18,
    },

    headerTitle: {
      fontSize: 27,
      fontWeight: '800',
      color: theme.text,
    },

    headerCalendarButton: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
    },


    // ==================================================
    // DAY / WEEK SELECTOR
    // ==================================================

    viewSelector: {
      height: 43,
      backgroundColor:
        theme.cardSecondary,
      borderRadius: 13,
      flexDirection: 'row',
      padding: 3,
      marginBottom: 17,
      borderWidth: 1,
      borderColor: theme.border,
    },

    viewButton: {
      flex: 1,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },

    selectedViewButton: {
      backgroundColor:
        theme.primary,
    },

    viewButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.textSecondary,
    },

    selectedViewButtonText: {
      color: '#FFFFFF',
    },


    // ==================================================
    // DATE NAVIGATION
    // ==================================================

    dateNavigation: {
      height: 65,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },

    arrowButton: {
      width: 35,
      height: 45,
      alignItems: 'center',
      justifyContent: 'center',
    },

    dateCenter: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    dateText: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.text,
      marginLeft: 9,
    },

    dayText: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },


    // ==================================================
    // SCHEDULE
    // ==================================================

    scheduleContainer: {
      marginTop: 2,
    },

    studyRow: {
      minHeight: 90,
      flexDirection: 'row',
      alignItems: 'center',
    },

    timelineDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 3,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 4,
    },

    timelineDotInner: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },

    studyCard: {
      flex: 1,
      minHeight: 86,
      borderRadius: 14,
      paddingHorizontal: 13,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor:
        theme.border,
    },

    studyIconContainer: {
      width: 43,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 7,
    },

    studyInfo: {
      flex: 1,
    },

    studyTime: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 3,
    },

    studySubject: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 1,
    },

    studyDescription: {
      fontSize: 12.5,
      color: theme.textSecondary,
    },


    // ==================================================
    // ADD STUDY BUTTON
    // ==================================================

    addStudyButton: {
      height: 54,
      backgroundColor:
        theme.primary,
      borderRadius: 17,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
      elevation: 2,
    },

    addStudyButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      marginLeft: 7,
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
      backgroundColor:
        theme.tabBar,
      borderTopWidth: 1,
      borderTopColor:
        theme.border,
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
      color:
        theme.tabInactive,
      marginTop: 3,
    },

    activeLabel: {
      color:
        theme.primary,
      fontWeight: '700',
    },


    // ==================================================
    // MODAL OVERLAY
    // ==================================================

    modalOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(0, 0, 0, 0.55)',
      justifyContent: 'flex-end',
    },


    // ==================================================
    // MODAL CONTAINER
    // ==================================================

    modalContainer: {
      maxHeight: '92%',
      backgroundColor:
        theme.card,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 30,
      borderWidth: 1,
      borderColor:
        theme.border,
    },


    // ==================================================
    // MODAL HEADER
    // ==================================================

    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 18,
    },

    modalTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.text,
    },

    modalSubtitle: {
      fontSize: 12,
      color:
        theme.textSecondary,
      marginTop: 3,
    },

    closeButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor:
        theme.cardSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },


    // ==================================================
    // INPUTS
    // ==================================================

    inputLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 7,
    },

    input: {
      height: 48,
      borderWidth: 1,
      borderColor:
        theme.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 13,
      fontSize: 14,
      color: theme.text,
      backgroundColor:
        theme.inputBackground,
      marginBottom: 14,
    },

    timeRow: {
      flexDirection: 'row',
      gap: 10,
    },

    timeInputContainer: {
      flex: 1,
    },

    descriptionInput: {
      height: 75,
      paddingTop: 12,
    },


    // ==================================================
    // ICON PICKER
    // ==================================================

    iconPickerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 3,
      marginBottom: 10,
    },

    iconPickerSubtitle: {
      fontSize: 11,
      color:
        theme.textMuted,
      marginTop: -4,
    },

    selectedIconPreview: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor:
        theme.primaryLight,
      borderWidth: 1.5,
      borderColor:
        theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    iconGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 9,
      marginBottom: 17,
    },

    iconButton: {
      width: 47,
      height: 47,
      borderRadius: 13,
      backgroundColor:
        theme.cardSecondary,
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


    // ==================================================
    // MODAL BUTTONS
    // ==================================================

    modalButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 3,
      gap: 10,
    },

    cancelButton: {
      height: 52,
      flex: 0.8,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        theme.inputBorder,
      backgroundColor:
        theme.cardSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    cancelButtonText: {
      color:
        theme.textSecondary,
      fontSize: 14,
      fontWeight: '700',
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
    },

    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
      marginLeft: 6,
    },

  });