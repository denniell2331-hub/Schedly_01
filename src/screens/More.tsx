import React from 'react';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { useApp } from '../context/AppContext';

import type {
  AppTheme,
} from '../theme/theme';


// ======================================================
// PROPS
// ======================================================

type MoreScreenProps = {
  onGoHome: () => void;
  onGoTasks: () => void;
  onGoSchedule: () => void;
  onGoProfile: () => void;
  onGoSettings: () => void;
  onLogout: () => void;
};


// ======================================================
// SCREEN
// ======================================================

export default function MoreScreen({
  onGoHome,
  onGoTasks,
  onGoSchedule,
  onGoProfile,
  onGoSettings,
  onLogout,
}: MoreScreenProps) {

  // ====================================================
  // THEME
  // ====================================================

  const { theme } = useApp();

  const styles = createStyles(theme);


  // ====================================================
  // LOGOUT CONFIRMATION
  // ====================================================

  const handleLogout = () => {

    Alert.alert(
      'See you later!',

      'Your Schedly journey isn’t going anywhere. Your tasks and schedule will be waiting for you when you return.',

      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Log Out',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };


  // ====================================================
  // HELP & SUPPORT
  // ====================================================

  const handleHelpSupport = () => {

    Alert.alert(
      'Help & Support',

      'Need a little help with Schedly?\n\nYou can use this section for assistance with your tasks, schedule, profile, and app settings.\n\nMore support features will be available in a future update.',

      [
        {
          text: 'Got It',
          style: 'default',
        },
      ]
    );
  };


  // ====================================================
  // ABOUT
  // ====================================================

  const handleAbout = () => {

    Alert.alert(
      'About Schedly',

      'Schedly\n\nA student productivity application designed to help you manage your tasks, schedules, and academic activities in one place.\n\nVersion 1.0.0',

      [
        {
          text: 'Close',
          style: 'default',
        },
      ]
    );
  };


  // ====================================================
  // UI
  // ====================================================

  return (
    <View style={styles.container}>

      {/* ==================================================
          HEADER
          ================================================== */}

      <View style={styles.header}>

        <Text style={styles.headerTitle}>
          More
        </Text>

        <Text style={styles.headerSubtitle}>
          Manage your Schedly account
        </Text>

      </View>


      {/* ==================================================
          MAIN CONTENT
          ================================================== */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ==================================================
            ACCOUNT
            ================================================== */}

        <Text style={styles.sectionTitle}>
          Account
        </Text>


        {/* ==================================================
            PROFILE
            ================================================== */}

        <Pressable
          style={({ pressed }) => [
            styles.menuCard,
            pressed && styles.menuCardPressed,
          ]}
          onPress={onGoProfile}
        >

          <View style={styles.iconBox}>

            <Ionicons
              name="person-outline"
              size={22}
              color={theme.primary}
            />

          </View>


          <View style={styles.menuContent}>

            <Text style={styles.menuTitle}>
              Profile
            </Text>

            <Text style={styles.menuDescription}>
              View and manage your personal information
            </Text>

          </View>


          <Ionicons
            name="chevron-forward"
            size={19}
            color={theme.textMuted}
          />

        </Pressable>


        {/* ==================================================
            SETTINGS
            ================================================== */}

        <Pressable
          style={({ pressed }) => [
            styles.menuCard,
            pressed && styles.menuCardPressed,
          ]}
          onPress={onGoSettings}
        >

          <View style={styles.iconBox}>

            <Ionicons
              name="settings-outline"
              size={22}
              color={theme.primary}
            />

          </View>


          <View style={styles.menuContent}>

            <Text style={styles.menuTitle}>
              Settings
            </Text>

            <Text style={styles.menuDescription}>
              Manage your preferences and account settings
            </Text>

          </View>


          <Ionicons
            name="chevron-forward"
            size={19}
            color={theme.textMuted}
          />

        </Pressable>


        {/* ==================================================
            SUPPORT
            ================================================== */}

        <Text
          style={[
            styles.sectionTitle,
            styles.supportSectionTitle,
          ]}
        >
          Support
        </Text>


        {/* ==================================================
            HELP & SUPPORT
            ================================================== */}

        <Pressable
          style={({ pressed }) => [
            styles.menuCard,
            pressed && styles.menuCardPressed,
          ]}
          onPress={handleHelpSupport}
        >

          <View style={styles.iconBox}>

            <Ionicons
              name="help-circle-outline"
              size={22}
              color={theme.primary}
            />

          </View>


          <View style={styles.menuContent}>

            <Text style={styles.menuTitle}>
              Help & Support
            </Text>

            <Text style={styles.menuDescription}>
              Get help with using Schedly
            </Text>

          </View>


          <Ionicons
            name="chevron-forward"
            size={19}
            color={theme.textMuted}
          />

        </Pressable>


        {/* ==================================================
            ABOUT
            ================================================== */}

        <Pressable
          style={({ pressed }) => [
            styles.menuCard,
            pressed && styles.menuCardPressed,
          ]}
          onPress={handleAbout}
        >

          <View style={styles.iconBox}>

            <Ionicons
              name="information-circle-outline"
              size={22}
              color={theme.primary}
            />

          </View>


          <View style={styles.menuContent}>

            <Text style={styles.menuTitle}>
              About
            </Text>

            <Text style={styles.menuDescription}>
              Learn more about Schedly
            </Text>

          </View>


          <Ionicons
            name="chevron-forward"
            size={19}
            color={theme.textMuted}
          />

        </Pressable>


        {/* ==================================================
            MOTIVATION CARD
            ================================================== */}

        <View style={styles.motivationCard}>

          <View style={styles.motivationIcon}>

            <Ionicons
              name="sparkles-outline"
              size={23}
              color={theme.warning}
            />

          </View>


          <View style={styles.motivationContent}>

            <Text style={styles.motivationTitle}>
              Keep going!
            </Text>

            <Text style={styles.motivationText}>
              Stay organized, keep track of your tasks,
              and make the most of your academic journey.
            </Text>

          </View>

        </View>


        {/* ==================================================
            LOGOUT CARD
            ================================================== */}

        <View style={styles.logoutCard}>

          {/* LOGOUT HEADER */}

          <View style={styles.logoutHeader}>

            <View style={styles.logoutIconBox}>

              <Ionicons
                name="log-out-outline"
                size={22}
                color={theme.danger}
              />

            </View>


            <View style={styles.logoutContent}>

              <Text style={styles.logoutTitle}>
                Log Out
              </Text>

              <Text style={styles.logoutDescription}>
                Finished for now? Your tasks and schedule
                will be waiting when you come back.
              </Text>

            </View>

          </View>


          {/* LOGOUT BUTTON */}

          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
            onPress={handleLogout}
          >

            <Ionicons
              name="log-out-outline"
              size={19}
              color={theme.danger}
            />

            <Text style={styles.logoutText}>
              Log Me Out
            </Text>

          </Pressable>

        </View>


        {/* ==================================================
            VERSION
            ================================================== */}

        <Text style={styles.versionText}>
          Schedly • Version 1.0.0
        </Text>


        <View style={styles.bottomSpace} />

      </ScrollView>


      {/* ==================================================
          BOTTOM NAVIGATION
          ================================================== */}

      <View style={styles.bottomNav}>

        {/* HOME */}

        <Pressable
          style={styles.navItem}
          onPress={onGoHome}
        >

          <Ionicons
            name="home-outline"
            size={22}
            color={theme.tabInactive}
          />

          <Text style={styles.navText}>
            Home
          </Text>

        </Pressable>


        {/* TASKS */}

        <Pressable
          style={styles.navItem}
          onPress={onGoTasks}
        >

          <Ionicons
            name="checkmark-circle-outline"
            size={22}
            color={theme.tabInactive}
          />

          <Text style={styles.navText}>
            Tasks
          </Text>

        </Pressable>


        {/* SCHEDULE */}

        <Pressable
          style={styles.navItem}
          onPress={onGoSchedule}
        >

          <Ionicons
            name="calendar-outline"
            size={22}
            color={theme.tabInactive}
          />

          <Text style={styles.navText}>
            Schedule
          </Text>

        </Pressable>


        {/* MORE - ACTIVE */}

        <Pressable
          style={[
            styles.navItem,
            styles.activeNavItem,
          ]}
        >

          <Ionicons
            name="ellipsis-horizontal"
            size={22}
            color={theme.primary}
          />

          <Text
            style={[
              styles.navText,
              styles.activeNavText,
            ]}
          >
            More
          </Text>

        </Pressable>

      </View>

    </View>
  );
}


// ======================================================
// STYLES
// ======================================================

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({

    // ==================================================
    // MAIN CONTAINER
    // ==================================================

    container: {
      flex: 1,
      backgroundColor: theme.background,
    },


    // ==================================================
    // HEADER
    // ==================================================

    header: {
      paddingHorizontal: 22,
      paddingTop: 54,
      paddingBottom: 20,
    },

    headerTitle: {
      fontSize: 27,
      fontWeight: '800',
      color: theme.text,
    },

    headerSubtitle: {
      fontSize: 12.5,
      color: theme.textSecondary,
      marginTop: 5,
    },


    // ==================================================
    // SCROLL VIEW
    // ==================================================

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 25,
    },


    // ==================================================
    // SECTION TITLES
    // ==================================================

    sectionTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 9,
      marginLeft: 3,
    },

    supportSectionTitle: {
      marginTop: 17,
    },


    // ==================================================
    // MENU CARDS
    // ==================================================

    menuCard: {
      minHeight: 76,
      backgroundColor: theme.card,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },

    menuCardPressed: {
      backgroundColor: theme.cardSecondary,
    },

    iconBox: {
      width: 45,
      height: 45,
      borderRadius: 14,
      backgroundColor: theme.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    menuContent: {
      flex: 1,
    },

    menuTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
    },

    menuDescription: {
      fontSize: 10.5,
      lineHeight: 15,
      color: theme.textSecondary,
      marginTop: 3,
      paddingRight: 5,
    },


    // ==================================================
    // MOTIVATION CARD
    // ==================================================

    motivationCard: {
      marginTop: 13,
      padding: 16,
      borderRadius: 18,
      backgroundColor: theme.motivationBackground,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
    },

    motivationIcon: {
      width: 45,
      height: 45,
      borderRadius: 14,
      backgroundColor: theme.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    motivationContent: {
      flex: 1,
    },

    motivationTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.motivationText,
      marginBottom: 3,
    },

    motivationText: {
      fontSize: 10.5,
      lineHeight: 16,
      color: theme.motivationSecondary,
    },


    // ==================================================
    // LOGOUT CARD
    // ==================================================

    logoutCard: {
      marginTop: 18,
      padding: 16,
      backgroundColor: theme.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
    },

    logoutHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    logoutIconBox: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: theme.logoutBackground,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    logoutContent: {
      flex: 1,
    },

    logoutTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.text,
    },

    logoutDescription: {
      fontSize: 10.5,
      lineHeight: 16,
      color: theme.textSecondary,
      marginTop: 3,
    },


    // ==================================================
    // LOGOUT BUTTON
    // ==================================================

    logoutButton: {
      height: 48,
      borderRadius: 13,
      backgroundColor: theme.logoutBackground,
      borderWidth: 1,
      borderColor: theme.logoutBorder,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 15,
    },

    logoutButtonPressed: {
      backgroundColor: theme.logoutBorder,
    },

    logoutText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: theme.danger,
    },


    // ==================================================
    // VERSION
    // ==================================================

    versionText: {
      textAlign: 'center',
      fontSize: 10,
      color: theme.textMuted,
      marginTop: 18,
    },

    bottomSpace: {
      height: 15,
    },


    // ==================================================
    // BOTTOM NAVIGATION
    // ==================================================

    bottomNav: {
      height: 76,
      backgroundColor: theme.tabBar,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: 8,
      paddingBottom: 5,
    },

    navItem: {
      minWidth: 65,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 6,
    },

    activeNavItem: {
      backgroundColor: theme.primaryLight,
      borderRadius: 13,
    },

    navText: {
      fontSize: 10,
      color: theme.tabInactive,
      marginTop: 3,
      fontWeight: '600',
    },

    activeNavText: {
      color: theme.primary,
      fontWeight: '700',
    },

  });