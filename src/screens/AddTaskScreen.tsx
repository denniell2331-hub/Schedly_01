import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';

import { useState } from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import type { Task } from '../types/task';
import { useApp } from '../context/AppContext';
import type { AppTheme } from '../theme/theme';

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

  const [deadline, setDeadline] =
    useState('');

  /* =====================================================
     SAVE TASK
  ===================================================== */

  const handleSaveTask = () => {
    /* TITLE VALIDATION */

    if (!title.trim()) {
      Alert.alert(
        'Task Title Required',
        'Please enter a title for your task.'
      );

      return;
    }

    /* DEADLINE VALIDATION */

    if (!deadline) {
      Alert.alert(
        'Deadline Required',
        'Please select a deadline.'
      );

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
     DEADLINE
  ===================================================== */

  const handleDeadlineSelect = () => {
    Alert.alert(
      'Select Deadline',
      'Choose a deadline for your task.',
      [
        {
          text: 'Today',
          onPress: () => setDeadline('Today'),
        },

        {
          text: 'Tomorrow',
          onPress: () =>
            setDeadline('Tomorrow'),
        },

        {
          text: 'Friday',
          onPress: () => setDeadline('Friday'),
        },

        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
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
        backgroundColor={theme.background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
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

          <View style={styles.headerSpacer} />
        </View>

        {/* =================================================
            ILLUSTRATION
        ================================================= */}

        <View
          style={styles.illustrationContainer}
        >
          <View
            style={styles.illustrationBackground}
          >
            <View style={styles.document}>
              <View
                style={styles.documentTop}
              />

              <View
                style={styles.documentLine}
              />

              <View
                style={styles.documentLineSmall}
              />

              <View
                style={styles.documentLine}
              />
            </View>

            <View style={styles.plusCircle}>
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

        <Text style={styles.introSubtitle}>
          Add details to stay organized
        </Text>

        {/* =================================================
            TITLE
        ================================================= */}

        <Text style={styles.label}>
          Task Title
        </Text>

        <View style={styles.inputContainer}>
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
            style={styles.descriptionIcon}
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

        <View style={styles.priorityContainer}>
          {/* =================================================
              HIGH
          ================================================= */}

          <Pressable
            onPress={() => setPriority('High')}
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
                    priorityColors.high.text,
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
                    priorityColors.medium.text,
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
            onPress={() => setPriority('Low')}
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
                    priorityColors.low.text,
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

        <Pressable
          style={styles.deadlineButton}
          onPress={handleDeadlineSelect}
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
            {deadline || 'Select date'}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={theme.primary}
          />
        </Pressable>

        {/* =================================================
            SAVE
        ================================================= */}

        <Pressable
          style={styles.saveButton}
          onPress={handleSaveTask}
        >
          <Text style={styles.saveButtonText}>
            Save Task
          </Text>
        </Pressable>
      </ScrollView>
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
      backgroundColor: theme.background,
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

      justifyContent: 'space-between',
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

      borderColor: theme.inputBorder,

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

      backgroundColor: theme.primary,

      marginBottom: 9,
    },

    documentLine: {
      width: '85%',
      height: 4,

      borderRadius: 3,

      backgroundColor: theme.textMuted,

      marginBottom: 7,
    },

    documentLineSmall: {
      width: '60%',
      height: 4,

      borderRadius: 3,

      backgroundColor: theme.textMuted,

      marginBottom: 7,
    },

    plusCircle: {
      position: 'absolute',

      right: 31,
      bottom: 12,

      width: 39,
      height: 39,

      borderRadius: 20,

      backgroundColor: theme.primary,

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

      borderColor: theme.inputBorder,

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

      justifyContent: 'space-between',

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
       DEADLINE
    ================================================= */

    deadlineButton: {
      width: '100%',

      height: 51,

      backgroundColor:
        theme.inputBackground,

      borderWidth: 1,

      borderColor: theme.inputBorder,

      borderRadius: 12,

      flexDirection: 'row',

      alignItems: 'center',

      paddingHorizontal: 13,

      marginBottom: 14,
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
       SAVE
    ================================================= */

    saveButton: {
      width: '100%',

      height: 53,

      borderRadius: 15,

      backgroundColor: theme.primary,

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