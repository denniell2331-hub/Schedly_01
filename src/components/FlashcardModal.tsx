import React from 'react';

import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { useApp } from '../context/AppContext';
import type { AppTheme } from '../theme/theme';

export type FlashcardTone =
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

export type FlashcardConfig = {
  title: string;
  message: string;
  tone?: FlashcardTone;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
};

type FlashcardModalProps = {
  flashcard: FlashcardConfig | null;
  onClose: () => void;
};

const toneIcons: Record<
  FlashcardTone,
  keyof typeof Ionicons.glyphMap
> = {
  info: 'information-circle-outline',
  success: 'checkmark-circle-outline',
  warning: 'alert-circle-outline',
  danger: 'trash-outline',
};

export default function FlashcardModal({
  flashcard,
  onClose,
}: FlashcardModalProps) {
  const { theme } = useApp();
  const styles = createStyles(theme);
  const tone = flashcard?.tone ?? 'info';
  const toneStyle = styles[`${tone}Tone`];

  if (!flashcard) {
    return null;
  }

  const handlePrimary = () => {
    flashcard.onPrimary?.();
    onClose();
  };

  const handleSecondary = () => {
    flashcard.onSecondary?.();
    onClose();
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close message"
        />

        <View style={styles.card}>
          <View style={[styles.iconCircle, toneStyle]}>
            <Ionicons
              name={toneIcons[tone]}
              size={27}
              color={styles[tone].color}
            />
          </View>

          <Text style={styles.title}>
            {flashcard.title}
          </Text>

          <Text style={styles.message}>
            {flashcard.message}
          </Text>

          <View style={styles.actions}>
            {flashcard.secondaryLabel && (
              <Pressable
                style={styles.secondaryButton}
                onPress={handleSecondary}
              >
                <Text style={styles.secondaryText}>
                  {flashcard.secondaryLabel}
                </Text>
              </Pressable>
            )}

            <Pressable
              style={[
                styles.primaryButton,
                tone === 'danger' &&
                  styles.dangerButton,
                !flashcard.secondaryLabel &&
                  styles.singleButton,
              ]}
              onPress={handlePrimary}
            >
              <Text style={styles.primaryText}>
                {flashcard.primaryLabel ?? 'Done'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      backgroundColor: 'rgba(20, 43, 85, 0.42)',
    },

    card: {
      width: '100%',
      maxWidth: 370,
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

    iconCircle: {
      width: 60,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 30,
      borderWidth: 1,
    },

    infoTone: {
      backgroundColor: theme.primaryLight,
      borderColor: theme.primary,
    },

    successTone: {
      backgroundColor: theme.success + '18',
      borderColor: theme.success + '55',
    },

    warningTone: {
      backgroundColor: theme.motivationBackground,
      borderColor: theme.warning + '66',
    },

    dangerTone: {
      backgroundColor: theme.logoutBackground,
      borderColor: theme.logoutBorder,
    },

    info: {
      color: theme.primary,
    },

    success: {
      color: theme.success,
    },

    warning: {
      color: theme.warning,
    },

    danger: {
      color: theme.danger,
    },

    title: {
      marginTop: 17,
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
    },

    message: {
      marginTop: 8,
      fontSize: 13,
      lineHeight: 19,
      color: theme.textSecondary,
      textAlign: 'center',
    },

    actions: {
      width: '100%',
      flexDirection: 'row',
      gap: 10,
      marginTop: 22,
    },

    secondaryButton: {
      flex: 1,
      minHeight: 46,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.cardSecondary,
    },

    secondaryText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.textSecondary,
    },

    primaryButton: {
      flex: 1,
      minHeight: 46,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: theme.primary,
    },

    dangerButton: {
      backgroundColor: theme.danger,
    },

    singleButton: {
      flex: 1,
    },

    primaryText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
