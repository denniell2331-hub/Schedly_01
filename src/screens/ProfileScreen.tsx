import React, { useState } from 'react';

import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

type ProfileScreenProps = {
  name: string;
  onGoBack: () => void;
};

type ProfileData = {
  studentId: string;
  email: string;
  course: string;
  yearLevel: string;
  photo: any;
};

export default function ProfileScreen({
  name,
  onGoBack,
}: ProfileScreenProps) {
  const [profile, setProfile] =
    useState<ProfileData>({
      studentId: '2026-0001',
      email: 'alex@example.com',
      course: 'BS Information Technology',
      yearLevel: '3rd Year',

      // Default profile picture
      photo: require('../../assets/mark1.webp'),
    });

  const [isEditing, setIsEditing] =
    useState(false);

  const [editStudentId, setEditStudentId] =
    useState(profile.studentId);

  const [editEmail, setEditEmail] =
    useState(profile.email);

  const [editCourse, setEditCourse] =
    useState(profile.course);

  const [editYearLevel, setEditYearLevel] =
    useState(profile.yearLevel);

  const [showPhotoOptions, setShowPhotoOptions] =
    useState(false);

  const startEditing = () => {
    setEditStudentId(profile.studentId);
    setEditEmail(profile.email);
    setEditCourse(profile.course);
    setEditYearLevel(profile.yearLevel);

    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditStudentId(profile.studentId);
    setEditEmail(profile.email);
    setEditCourse(profile.course);
    setEditYearLevel(profile.yearLevel);

    setIsEditing(false);
  };

  const saveProfile = () => {
    if (!editStudentId.trim()) {
      Alert.alert(
        'Student ID Required',
        'Please enter your student ID.'
      );
      return;
    }

    if (!editEmail.trim()) {
      Alert.alert(
        'Email Required',
        'Please enter your email address.'
      );
      return;
    }

    if (!editCourse.trim()) {
      Alert.alert(
        'Course Required',
        'Please enter your course.'
      );
      return;
    }

    if (!editYearLevel.trim()) {
      Alert.alert(
        'Year Level Required',
        'Please enter your year level.'
      );
      return;
    }

    setProfile((current) => ({
      ...current,
      studentId: editStudentId.trim(),
      email: editEmail.trim(),
      course: editCourse.trim(),
      yearLevel: editYearLevel.trim(),
    }));

    setIsEditing(false);

    Alert.alert(
      'Profile Updated',
      'Your profile information has been updated.'
    );
  };

  const choosePhoto = async () => {
    setShowPhotoOptions(false);

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow Schedly to access your photos so you can select a profile picture.'
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

    if (
      !result.canceled &&
      result.assets &&
      result.assets.length > 0
    ) {
      setProfile((current) => ({
        ...current,
        photo: {
          uri: result.assets[0].uri,
        },
      }));
    }
  };

  const removePhoto = () => {
    setShowPhotoOptions(false);

    Alert.alert(
      'Remove Profile Photo',
      'Are you sure you want to remove your profile photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setProfile((current) => ({
              ...current,
              photo: null,
            }));
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={onGoBack}
          hitSlop={8}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#142B55"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Profile
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.photoWrapper}>
            {profile.photo ? (
              <Image
                source={profile.photo}
                style={styles.profilePhoto}
              />
            ) : (
              <View
                style={styles.defaultPhoto}
              >
                <Ionicons
                  name="person"
                  size={48}
                  color="#8AA4C2"
                />
              </View>
            )}

            <Pressable
              style={styles.cameraButton}
              onPress={() =>
                setShowPhotoOptions(true)
              }
              hitSlop={5}
            >
              <Ionicons
                name="camera"
                size={16}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          <Text style={styles.profileName}>
            {name}
          </Text>

          <Text style={styles.profileCourse}>
            {profile.course}
          </Text>

          <View style={styles.yearBadge}>
            <Text style={styles.yearBadgeText}>
              {profile.yearLevel}
            </Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          {!isEditing && (
            <Pressable
              style={styles.editButton}
              onPress={startEditing}
            >
              <Ionicons
                name="create-outline"
                size={17}
                color="#1261D6"
              />

              <Text style={styles.editButtonText}>
                Edit
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.infoCard}>
          {/* Name */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="person-outline"
                size={19}
                color="#1261D6"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Full Name
              </Text>

              <Text style={styles.infoValue}>
                {name}
              </Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* Student ID */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="card-outline"
                size={19}
                color="#1261D6"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Student ID
              </Text>

              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={editStudentId}
                  onChangeText={setEditStudentId}
                  placeholder="Enter student ID"
                  placeholderTextColor="#9AAEC5"
                />
              ) : (
                <Text style={styles.infoValue}>
                  {profile.studentId}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* Email */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="mail-outline"
                size={19}
                color="#1261D6"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Email
              </Text>

              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Enter email"
                  placeholderTextColor="#9AAEC5"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.infoValue}>
                  {profile.email}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* Course */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="school-outline"
                size={19}
                color="#1261D6"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Course
              </Text>

              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={editCourse}
                  onChangeText={setEditCourse}
                  placeholder="Enter course"
                  placeholderTextColor="#9AAEC5"
                />
              ) : (
                <Text style={styles.infoValue}>
                  {profile.course}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* Year Level */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="calendar-outline"
                size={19}
                color="#1261D6"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Year Level
              </Text>

              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={editYearLevel}
                  onChangeText={setEditYearLevel}
                  placeholder="Enter year level"
                  placeholderTextColor="#9AAEC5"
                />
              ) : (
                <Text style={styles.infoValue}>
                  {profile.yearLevel}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Edit Actions */}
        {isEditing && (
          <View style={styles.editActions}>
            <Pressable
              style={styles.cancelButton}
              onPress={cancelEditing}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={styles.saveButton}
              onPress={saveProfile}
            >
              <Ionicons
                name="checkmark"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.saveButtonText}>
                Save Changes
              </Text>
            </Pressable>
          </View>
        )}

        {/* Account Information */}
        <View style={styles.accountCard}>
          <View style={styles.accountIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color="#1261D6"
            />
          </View>

          <View style={styles.accountContent}>
            <Text style={styles.accountTitle}>
              Account Information
            </Text>

            <Text style={styles.accountText}>
              Your personal information is used to
              personalize your Schedly experience.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Photo Options Modal */}
      <Modal
        visible={showPhotoOptions}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowPhotoOptions(false)
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setShowPhotoOptions(false)
          }
        >
          <Pressable
            style={styles.photoModal}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <Text style={styles.modalTitle}>
              Profile Photo
            </Text>

            <Text style={styles.modalSubtitle}>
              Choose an option
            </Text>

            <Pressable
              style={styles.modalOption}
              onPress={choosePhoto}
            >
              <View style={styles.modalOptionIcon}>
                <Ionicons
                  name="image-outline"
                  size={21}
                  color="#1261D6"
                />
              </View>

              <Text style={styles.modalOptionText}>
                Choose from Gallery
              </Text>
            </Pressable>

            {profile.photo && (
              <Pressable
                style={styles.modalOption}
                onPress={removePhoto}
              >
                <View
                  style={[
                    styles.modalOptionIcon,
                    styles.removeIcon,
                  ]}
                >
                  <Ionicons
                    name="trash-outline"
                    size={21}
                    color="#D94B5B"
                  />
                </View>

                <Text
                  style={[
                    styles.modalOptionText,
                    styles.removeText,
                  ]}
                >
                  Remove Photo
                </Text>
              </Pressable>
            )}

            <Pressable
              style={styles.modalCancel}
              onPress={() =>
                setShowPhotoOptions(false)
              }
            >
              <Text style={styles.modalCancelText}>
                Cancel
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FAFF',
  },

  header: {
    height: 62,
    paddingHorizontal: 18,
    backgroundColor: '#F5FAFF',
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
    color: '#142B55',
  },

  headerSpacer: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 30,
  },

  profileHeader: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 28,
  },

  photoWrapper: {
    position: 'relative',
    marginBottom: 14,
  },

  profilePhoto: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },

  defaultPhoto: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#EAF4FF',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1261D6',
    borderWidth: 3,
    borderColor: '#F5FAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#142B55',
    textAlign: 'center',
  },

  profileCourse: {
    fontSize: 12.5,
    color: '#6B84A4',
    marginTop: 5,
    textAlign: 'center',
  },

  yearBadge: {
    marginTop: 9,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#EAF4FF',
  },

  yearBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1261D6',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#142B55',
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  editButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1261D6',
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5EEF7',
    overflow: 'hidden',
  },

  infoRow: {
    minHeight: 70,
    paddingHorizontal: 15,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 10.5,
    color: '#8AA0BA',
    marginBottom: 3,
  },

  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#172B55',
  },

  editInput: {
    minHeight: 36,
    borderWidth: 1,
    borderColor: '#D5E2EF',
    borderRadius: 9,
    backgroundColor: '#F9FBFE',
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    color: '#172B55',
  },

  rowDivider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginLeft: 67,
  },

  editActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D5E2EF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#607895',
  },

  saveButton: {
    flex: 1.4,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1261D6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  saveButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  accountCard: {
    marginTop: 22,
    padding: 15,
    borderRadius: 16,
    backgroundColor: '#EAF4FF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  accountIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  accountContent: {
    flex: 1,
  },

  accountTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#17325E',
    marginBottom: 3,
  },

  accountText: {
    fontSize: 10.5,
    lineHeight: 16,
    color: '#6682A4',
  },

  bottomSpace: {
    height: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 43, 85, 0.35)',
    justifyContent: 'flex-end',
  },

  photoModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 28,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#142B55',
  },

  modalSubtitle: {
    fontSize: 12,
    color: '#7B91AB',
    marginTop: 4,
    marginBottom: 17,
  },

  modalOption: {
    height: 55,
    borderRadius: 13,
    backgroundColor: '#F5FAFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 9,
  },

  modalOptionIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#EAF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  modalOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#172B55',
  },

  removeIcon: {
    backgroundColor: '#FFF0F2',
  },

  removeText: {
    color: '#D94B5B',
  },

  modalCancel: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#142B55',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },

  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});