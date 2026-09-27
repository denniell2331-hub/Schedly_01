import React, { useState } from 'react';

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { useApp } from '../context/AppContext';
import FlashcardModal from '../components/FlashcardModal';
import { useFlashcard } from '../hooks/useFlashcard';

type SettingsScreenProps = {
  onGoBack: () => void;
  name: string;
  onChangeName: (name: string) => void;
};

type ModalType =
  | 'name'
  | 'email'
  | 'password'
  | null;

export default function SettingsScreen({
  onGoBack,
  name,
  onChangeName,
}: SettingsScreenProps) {

  // ==================================================
  // APP THEME
  // ==================================================

  const {
    theme,
    isDarkMode,
    toggleDarkMode,
  } = useApp();


  // ==================================================
  // SETTINGS STATE
  // ==================================================

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  const [language, setLanguage] =
    useState('English');


  // ==================================================
  // MODAL STATE
  // ==================================================

  const [activeModal, setActiveModal] =
    useState<ModalType>(null);

  const [inputValue, setInputValue] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [showLanguageModal, setShowLanguageModal] =
    useState(false);

  const {
    flashcard,
    showFlashcard,
    closeFlashcard,
  } = useFlashcard();


  // ==================================================
  // OPEN NAME EDITOR
  // ==================================================

  const openNameEditor = () => {
    setInputValue(name);
    setActiveModal('name');
  };


  // ==================================================
  // OPEN EMAIL EDITOR
  // ==================================================

  const openEmailEditor = () => {
    setInputValue('alex@example.com');
    setActiveModal('email');
  };


  // ==================================================
  // OPEN PASSWORD EDITOR
  // ==================================================

  const openPasswordEditor = () => {
    setInputValue('');
    setActiveModal('password');
  };


  // ==================================================
  // CLOSE MODAL
  // ==================================================

  const closeModal = () => {
    setActiveModal(null);
    setInputValue('');
    setShowPassword(false);
  };


  // ==================================================
  // SAVE MODAL
  // ==================================================

  const saveModal = () => {

    if (!inputValue.trim()) {
      showFlashcard({
        title: 'Value Required',
        message: 'Please enter a value before saving.',
        tone: 'warning',
      });

      return;
    }


    if (activeModal === 'name') {

      onChangeName(inputValue.trim());

      showFlashcard({
        title: 'Name Updated',
        message: 'Your name has been updated successfully.',
        tone: 'success',
      });
    }


    if (activeModal === 'email') {

      showFlashcard({
        title: 'Email Updated',
        message: 'Your email has been updated successfully.',
        tone: 'success',
      });
    }


    if (activeModal === 'password') {

      showFlashcard({
        title: 'Password Updated',
        message: 'Your password has been updated successfully.',
        tone: 'success',
      });
    }


    closeModal();
  };


  // ==================================================
  // LANGUAGE
  // ==================================================

  const selectLanguage = (
    selectedLanguage: string
  ) => {

    setLanguage(selectedLanguage);
    setShowLanguageModal(false);
  };


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >

      {/* ==================================================
          HEADER
          ================================================== */}

      <View style={styles.header}>

        <Pressable
          style={styles.backButton}
          onPress={onGoBack}
          hitSlop={8}
        >

          <Ionicons
            name="arrow-back"
            size={22}
            color={theme.text}
          />

        </Pressable>


        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.text,
            },
          ]}
        >
          Settings
        </Text>


        <View style={styles.headerSpacer} />

      </View>


      {/* ==================================================
          CONTENT
          ================================================== */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >

        {/* ACCOUNT */}

        <Text
          style={[
            styles.sectionLabel,
            {
              color: theme.textMuted,
            },
          ]}
        >
          Account
        </Text>


        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor:
                theme.card,
              borderColor:
                theme.border,
            },
          ]}
        >

          {/* CHANGE NAME */}

          <Pressable
            style={styles.settingRow}
            onPress={openNameEditor}
          >

            <View
              style={[
                styles.settingIcon,
                {
                  backgroundColor:
                    theme.primaryLight,
                },
              ]}
            >

              <Ionicons
                name="person-outline"
                size={20}
                color={theme.primary}
              />

            </View>


            <View style={styles.settingContent}>

              <Text
                style={[
                  styles.settingTitle,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Change Name
              </Text>


              <Text
                style={[
                  styles.settingValue,
                  {
                    color:
                      theme.textSecondary,
                  },
                ]}
              >
                {name}
              </Text>

            </View>


            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.textMuted}
            />

          </Pressable>


          <View
            style={[
              styles.rowDivider,
              {
                backgroundColor:
                  theme.border,
              },
            ]}
          />


          {/* EMAIL */}

          <Pressable
            style={styles.settingRow}
            onPress={openEmailEditor}
          >

            <View
              style={[
                styles.settingIcon,
                {
                  backgroundColor:
                    theme.primaryLight,
                },
              ]}
            >

              <Ionicons
                name="mail-outline"
                size={20}
                color={theme.primary}
              />

            </View>


            <View style={styles.settingContent}>

              <Text
                style={[
                  styles.settingTitle,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Email
              </Text>


              <Text
                style={[
                  styles.settingValue,
                  {
                    color:
                      theme.textSecondary,
                  },
                ]}
              >
                alex@example.com
              </Text>

            </View>


            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.textMuted}
            />

          </Pressable>


          <View
            style={[
              styles.rowDivider,
              {
                backgroundColor:
                  theme.border,
              },
            ]}
          />


          {/* PASSWORD */}

          <Pressable
            style={styles.settingRow}
            onPress={openPasswordEditor}
          >

            <View
              style={[
                styles.settingIcon,
                {
                  backgroundColor:
                    theme.primaryLight,
                },
              ]}
            >

              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.primary}
              />

            </View>


            <View style={styles.settingContent}>

              <Text
                style={[
                  styles.settingTitle,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Password
              </Text>


              <Text
                style={[
                  styles.settingValue,
                  {
                    color:
                      theme.textSecondary,
                  },
                ]}
              >
                ••••••••
              </Text>

            </View>


            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.textMuted}
            />

          </Pressable>

        </View>


        {/* ==================================================
            APP PREFERENCES
            ================================================== */}

        <Text
          style={[
            styles.sectionLabel,
            styles.preferencesLabel,
            {
              color: theme.textMuted,
            },
          ]}
        >
          App Preferences
        </Text>


        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor:
                theme.card,
              borderColor:
                theme.border,
            },
          ]}
        >

          {/* NOTIFICATIONS */}

          <View style={styles.settingRow}>

            <View
              style={[
                styles.settingIcon,
                {
                  backgroundColor:
                    theme.primaryLight,
                },
              ]}
            >

              <Ionicons
                name="notifications-outline"
                size={20}
                color={theme.primary}
              />

            </View>


            <View style={styles.settingContent}>

              <Text
                style={[
                  styles.settingTitle,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Notifications
              </Text>


              <Text
                style={[
                  styles.settingDescription,
                  {
                    color:
                      theme.textSecondary,
                  },
                ]}
              >
                Receive reminders and task updates
              </Text>

            </View>


            <Switch
              value={notificationsEnabled}
              onValueChange={
                setNotificationsEnabled
              }
              trackColor={{
                false: theme.border,
                true: theme.primary,
              }}
              thumbColor="#FFFFFF"
            />

          </View>


          <View
            style={[
              styles.rowDivider,
              {
                backgroundColor:
                  theme.border,
              },
            ]}
          />


          {/* DARK MODE */}

          <View style={styles.settingRow}>

            <View
              style={[
                styles.settingIcon,
                {
                  backgroundColor:
                    theme.primaryLight,
                },
              ]}
            >

              <Ionicons
                name={
                  isDarkMode
                    ? 'moon'
                    : 'moon-outline'
                }
                size={20}
                color={theme.primary}
              />

            </View>


            <View style={styles.settingContent}>

              <Text
                style={[
                  styles.settingTitle,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Dark Mode
              </Text>


              <Text
                style={[
                  styles.settingDescription,
                  {
                    color:
                      theme.textSecondary,
                  },
                ]}
              >
                Change the appearance of Schedly
              </Text>

            </View>


            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{
                false: theme.border,
                true: theme.primary,
              }}
              thumbColor="#FFFFFF"
            />

          </View>


          <View
            style={[
              styles.rowDivider,
              {
                backgroundColor:
                  theme.border,
              },
            ]}
          />


          {/* LANGUAGE */}

          <Pressable
            style={styles.settingRow}
            onPress={() =>
              setShowLanguageModal(true)
            }
          >

            <View
              style={[
                styles.settingIcon,
                {
                  backgroundColor:
                    theme.primaryLight,
                },
              ]}
            >

              <Ionicons
                name="language-outline"
                size={20}
                color={theme.primary}
              />

            </View>


            <View style={styles.settingContent}>

              <Text
                style={[
                  styles.settingTitle,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Language
              </Text>


              <Text
                style={[
                  styles.settingValue,
                  {
                    color:
                      theme.textSecondary,
                  },
                ]}
              >
                {language}
              </Text>

            </View>


            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.textMuted}
            />

          </Pressable>

        </View>


        {/* ==================================================
            INFORMATION CARD
            ================================================== */}

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor:
                theme.primaryLight,
            },
          ]}
        >

          <View
            style={[
              styles.infoIcon,
              {
                backgroundColor:
                  theme.card,
              },
            ]}
          >

            <Ionicons
              name="information-circle-outline"
              size={22}
              color={theme.primary}
            />

          </View>


          <View style={styles.infoContent}>

            <Text
              style={[
                styles.infoTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Schedly Settings
            </Text>


            <Text
              style={[
                styles.infoText,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              Customize your account and application
              preferences to make Schedly work the
              way you prefer.
            </Text>

          </View>

        </View>


        {/* VERSION */}

        <Text
          style={[
            styles.versionText,
            {
              color: theme.textMuted,
            },
          ]}
        >
          Schedly • Version 1.0.0
        </Text>


        <View style={styles.bottomSpace} />

      </ScrollView>

      <FlashcardModal
        flashcard={flashcard}
        onClose={closeFlashcard}
      />


      {/* ==================================================
          EDIT MODAL
          ================================================== */}

      <Modal
        visible={activeModal !== null}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >

        <View style={styles.modalOverlay}>

          <View
            style={[
              styles.modalCard,
              {
                backgroundColor:
                  theme.card,
              },
            ]}
          >

            <Text
              style={[
                styles.modalTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              {activeModal === 'name' &&
                'Change Name'}

              {activeModal === 'email' &&
                'Change Email'}

              {activeModal === 'password' &&
                'Change Password'}
            </Text>


            <Text
              style={[
                styles.modalSubtitle,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              {activeModal === 'name' &&
                'Enter the name you want to use in Schedly.'}

              {activeModal === 'email' &&
                'Enter your new email address.'}

              {activeModal === 'password' &&
                'Enter your new password.'}
            </Text>


            <View
              style={[
                styles.modalInputWrapper,
                {
                  backgroundColor:
                    theme.inputBackground,
                  borderColor:
                    theme.inputBorder,
                },
              ]}
            >

              {activeModal === 'name' && (
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={theme.primary}
                  style={styles.modalInputIcon}
                />
              )}


              {activeModal === 'email' && (
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={theme.primary}
                  style={styles.modalInputIcon}
                />
              )}


              {activeModal === 'password' && (
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={theme.primary}
                  style={styles.modalInputIcon}
                />
              )}


              <TextInput
                style={[
                  styles.modalInput,
                  {
                    color: theme.text,
                  },
                ]}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={
                  activeModal === 'name'
                    ? 'Enter your name'
                    : activeModal === 'email'
                    ? 'Enter your email'
                    : 'Enter your password'
                }
                placeholderTextColor={
                  theme.textMuted
                }
                autoCapitalize={
                  activeModal === 'email'
                    ? 'none'
                    : 'words'
                }
                keyboardType={
                  activeModal === 'email'
                    ? 'email-address'
                    : 'default'
                }
                secureTextEntry={
                  activeModal === 'password' &&
                  !showPassword
                }
              />


              {activeModal === 'password' && (
                <Pressable
                  style={styles.modalEyeButton}
                  onPress={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  hitSlop={8}
                >

                  <Ionicons
                    name={
                      showPassword
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={20}
                    color={theme.textMuted}
                  />

                </Pressable>
              )}

            </View>


            <View style={styles.modalActions}>

              <Pressable
                style={[
                  styles.modalCancelButton,
                  {
                    backgroundColor:
                      theme.cardSecondary,
                    borderColor:
                      theme.border,
                  },
                ]}
                onPress={closeModal}
              >

                <Text
                  style={[
                    styles.modalCancelButtonText,
                    {
                      color:
                        theme.textSecondary,
                    },
                  ]}
                >
                  Cancel
                </Text>

              </Pressable>


              <Pressable
                style={[
                  styles.modalSaveButton,
                  {
                    backgroundColor:
                      theme.primary,
                  },
                ]}
                onPress={saveModal}
              >

                <Text
                  style={styles.modalSaveButtonText}
                >
                  Save
                </Text>

              </Pressable>

            </View>

          </View>

        </View>

      </Modal>


      {/* ==================================================
          LANGUAGE MODAL
          ================================================== */}

      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowLanguageModal(false)
        }
      >

        <View style={styles.modalOverlay}>

          <View
            style={[
              styles.languageModal,
              {
                backgroundColor:
                  theme.card,
              },
            ]}
          >

            <Text
              style={[
                styles.modalTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Language
            </Text>


            <Text
              style={[
                styles.modalSubtitle,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              Select your preferred language.
            </Text>


            {/* ENGLISH */}

            <Pressable
              style={[
                styles.languageOption,
                {
                  backgroundColor:
                    theme.cardSecondary,
                  borderColor:
                    theme.border,
                },
                language === 'English' && {
                  backgroundColor:
                    theme.primaryLight,
                  borderColor:
                    theme.primary,
                },
              ]}
              onPress={() =>
                selectLanguage('English')
              }
            >

              <View
                style={[
                  styles.languageIcon,
                  {
                    backgroundColor:
                      theme.card,
                  },
                ]}
              >

                <Ionicons
                  name="language-outline"
                  size={20}
                  color={theme.primary}
                />

              </View>


              <Text
                style={[
                  styles.languageText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                English
              </Text>


              {language === 'English' && (
                <Ionicons
                  name="checkmark-circle"
                  size={21}
                  color={theme.primary}
                />
              )}

            </Pressable>


            {/* FILIPINO */}

            <Pressable
              style={[
                styles.languageOption,
                {
                  backgroundColor:
                    theme.cardSecondary,
                  borderColor:
                    theme.border,
                },
                language === 'Filipino' && {
                  backgroundColor:
                    theme.primaryLight,
                  borderColor:
                    theme.primary,
                },
              ]}
              onPress={() =>
                selectLanguage('Filipino')
              }
            >

              <View
                style={[
                  styles.languageIcon,
                  {
                    backgroundColor:
                      theme.card,
                  },
                ]}
              >

                <Ionicons
                  name="language-outline"
                  size={20}
                  color={theme.primary}
                />

              </View>


              <Text
                style={[
                  styles.languageText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Filipino
              </Text>


              {language === 'Filipino' && (
                <Ionicons
                  name="checkmark-circle"
                  size={21}
                  color={theme.primary}
                />
              )}

            </Pressable>


            {/* CANCEL */}

            <Pressable
              style={[
                styles.modalCloseButton,
                {
                  backgroundColor:
                    theme.primary,
                },
              ]}
              onPress={() =>
                setShowLanguageModal(false)
              }
            >

              <Text
                style={styles.modalCloseText}
              >
                Cancel
              </Text>

            </Pressable>

          </View>

        </View>

      </Modal>

    </View>
  );
}


// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },


  // ==================================================
  // HEADER
  // ==================================================

  header: {
    height: 62,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },

  headerSpacer: {
    width: 40,
  },


  // ==================================================
  // SCROLL
  // ==================================================

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },


  // ==================================================
  // SECTIONS
  // ==================================================

  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginLeft: 3,
    marginBottom: 9,
  },

  preferencesLabel: {
    marginTop: 24,
  },


  // ==================================================
  // SETTINGS CARD
  // ==================================================

  settingsCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },

  settingRow: {
    minHeight: 70,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  settingContent: {
    flex: 1,
    paddingRight: 8,
  },

  settingTitle: {
    fontSize: 13,
    fontWeight: '700',
  },

  settingValue: {
    fontSize: 10.5,
    marginTop: 3,
  },

  settingDescription: {
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 3,
  },

  rowDivider: {
    height: 1,
    marginLeft: 68,
  },


  // ==================================================
  // INFORMATION CARD
  // ==================================================

  infoCard: {
    marginTop: 22,
    padding: 15,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 3,
  },

  infoText: {
    fontSize: 10.5,
    lineHeight: 16,
  },


  // ==================================================
  // VERSION
  // ==================================================

  versionText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 18,
  },

  bottomSpace: {
    height: 20,
  },


  // ==================================================
  // MODAL
  // ==================================================

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },

  modalCard: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },

  modalSubtitle: {
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 5,
    marginBottom: 17,
  },

  modalInputWrapper: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  modalInputIcon: {
    marginLeft: 13,
    marginRight: 9,
  },

  modalInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    paddingHorizontal: 2,
  },

  modalEyeButton: {
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 17,
  },

  modalCancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalCancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },

  modalSaveButton: {
    flex: 1,
    height: 46,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalSaveButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },


  // ==================================================
  // LANGUAGE MODAL
  // ==================================================

  languageModal: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
  },

  languageOption: {
    minHeight: 56,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 9,
    borderWidth: 1,
  },

  languageIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  languageText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },

  modalCloseButton: {
    height: 46,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },

  modalCloseText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

});