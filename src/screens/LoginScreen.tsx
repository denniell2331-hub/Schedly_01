import React, { useState } from 'react';

import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import FlashcardModal from '../components/FlashcardModal';
import { useFlashcard } from '../hooks/useFlashcard';

type LoginScreenProps = {
  onLogin: () => void;
  onSignUp?: () => void;
  onForgotPassword?: () => void;
};

export default function LoginScreen({
  onLogin,
  onSignUp,
  onForgotPassword,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoggingIn, setIsLoggingIn] =
    useState(false);

  const {
    flashcard,
    showFlashcard,
    closeFlashcard,
  } = useFlashcard();

  const handleLogin = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      showFlashcard({
        title: 'Email Required',
        message: 'Please enter your email address.',
        tone: 'warning',
      });
      return;
    }

    if (!password) {
      showFlashcard({
        title: 'Password Required',
        message: 'Please enter your password.',
        tone: 'warning',
      });
      return;
    }

    setIsLoggingIn(true);

    setTimeout(() => {
      setIsLoggingIn(false);
      onLogin();
    }, 500);
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
      return;
    }

    showFlashcard({
      title: 'Forgot Password',
      message: 'Password recovery will be available when the authentication system is connected.',
      tone: 'info',
    });
  };

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
      return;
    }

    showFlashcard({
      title: 'Create Account',
      message: 'Account registration will be available soon.',
      tone: 'info',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* Schedly Logo */}
        {/* 
          The logo is intentionally tappable as a
          hidden testing shortcut. There is no visible
          indication that it can be tapped.
        */}
        <View style={styles.logoSection}>
          <Pressable
            onPress={onLogin}
            hitSlop={15}
          >
            <Image
              source={require('../../assets/schedly.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Welcome Back!
          </Text>

          <Text style={styles.welcomeSubtitle}>
            Sign in to continue managing your
            tasks and schedule.
          </Text>
        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Email
            </Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={21}
                color="#1261D6"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#9AAEC5"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Password */}
          <View
            style={[
              styles.inputGroup,
              styles.passwordGroup,
            ]}
          >
            <Text style={styles.inputLabel}>
              Password
            </Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={21}
                color="#1261D6"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#9AAEC5"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              <Pressable
                style={styles.eyeButton}
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
                  size={21}
                  color="#6F87A5"
                />
              </Pressable>
            </View>
          </View>

          {/* Forgot Password */}
          <Pressable
            style={styles.forgotButton}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotText}>
              Forgot Password?
            </Text>
          </Pressable>

          {/* Login Button */}
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed &&
                styles.loginButtonPressed,
              isLoggingIn &&
                styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <Text style={styles.loginButtonText}>
                Logging In...
              </Text>
            ) : (
              <>
                <Text
                  style={styles.loginButtonText}
                >
                  Log In
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={19}
                  color="#FFFFFF"
                />
              </>
            )}
          </Pressable>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />

          <Text style={styles.dividerText}>
            or
          </Text>

          <View style={styles.dividerLine} />
        </View>

        {/* Sign Up */}
        <View style={styles.signupSection}>
          <Text style={styles.signupQuestion}>
            Don't have an account?
          </Text>

          <Pressable
            onPress={handleSignUp}
            hitSlop={8}
          >
            <Text style={styles.signupText}>
              Sign Up
            </Text>
          </Pressable>
        </View>

        {/* Information Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="calendar-outline"
              size={22}
              color="#1261D6"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Stay organized with Schedly
            </Text>

            <Text style={styles.infoText}>
              Manage your tasks, schedules, and
              academic activities in one place.
            </Text>
          </View>
        </View>

        {/* Version */}
        <Text style={styles.versionText}>
          Schedly • Version 1.0.0
        </Text>

        <View style={styles.bottomSpace} />

      </ScrollView>

      <FlashcardModal
        flashcard={flashcard}
        onClose={closeFlashcard}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FAFF',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 54,
    paddingBottom: 25,
  },

  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 27,
  },

  logo: {
    width: 180,
    height: 90,
  },

  welcomeSection: {
    alignItems: 'center',
    marginBottom: 22,
  },

  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#142B55',
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  welcomeSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B84A4',
    textAlign: 'center',
    marginTop: 7,
    maxWidth: 310,
  },

  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5EEF7',
    padding: 18,
  },

  inputGroup: {
    width: '100%',
  },

  passwordGroup: {
    marginTop: 17,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#172B55',
    marginBottom: 7,
    marginLeft: 2,
  },

  inputWrapper: {
    height: 51,
    borderWidth: 1,
    borderColor: '#D5E2EF',
    borderRadius: 12,
    backgroundColor: '#F9FBFE',
    flexDirection: 'row',
    alignItems: 'center',
  },

  inputIcon: {
    marginLeft: 13,
    marginRight: 9,
  },

  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 2,
    fontSize: 14,
    color: '#172B55',
  },

  eyeButton: {
    width: 45,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 11,
    paddingVertical: 3,
  },

  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1261D6',
  },

  loginButton: {
    height: 51,
    borderRadius: 12,
    backgroundColor: '#1261D6',
    marginTop: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  loginButtonPressed: {
    backgroundColor: '#0E55BF',
  },

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loginButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
    paddingHorizontal: 8,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DCE7F2',
  },

  dividerText: {
    fontSize: 11,
    color: '#9AAEC5',
    marginHorizontal: 13,
  },

  signupSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },

  signupQuestion: {
    fontSize: 12.5,
    color: '#6B84A4',
  },

  signupText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1261D6',
  },

  infoCard: {
    marginTop: 27,
    padding: 14,
    borderRadius: 15,
    backgroundColor: '#EAF4FF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
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
    color: '#17325E',
    marginBottom: 3,
  },

  infoText: {
    fontSize: 10.5,
    lineHeight: 16,
    color: '#6682A4',
  },

  versionText: {
    fontSize: 10,
    color: '#A0B1C6',
    textAlign: 'center',
    marginTop: 18,
  },

  bottomSpace: {
    height: 15,
  },
});