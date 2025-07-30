import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, StatusBar, SafeAreaView, ScrollView, Animated, Pressable, TextInput, TouchableWithoutFeedback } from 'react-native';
import { RouteProp, useRoute, } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { signUp } from 'aws-amplify/auth';
import { RootStackParamList } from 'navigation/RootNavigator';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState,useEffect } from "react";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const isSmallDevice = screenWidth < 375;

// Responsive scaling functions
const scale = (size: number): number => {
  const baseWidth = 375;
  const scaleFactor = screenWidth / baseWidth;
  return Math.round(size * scaleFactor);
};

const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

export default function SignUp() {
  const allyScaleAnim = React.useRef(new Animated.Value(1)).current;
  const [firstName, setFirstName] = React.useState('');
  const [surname, setSurname] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [contact, setContact] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [firstNameError, setFirstNameError] = React.useState('');
  const [surnameError, setSurnameError] = React.useState('');
  const [dobError, setDobError] = React.useState('');
  const [genderError, setGenderError] = React.useState('');
  const [contactError, setContactError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [confirmPasswordError, setConfirmPasswordError] = React.useState('');
  const [isButtonHovered, setIsButtonHovered] = React.useState(false);
  // DateTimePicker state
  const [date, setDate] = React.useState(new Date());
  const [showPicker, setShowPicker] = React.useState(false);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 10;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?!]/.test(password);
    
    return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  };

  const handleAllyPressIn = () => {
    Animated.spring(allyScaleAnim, {
      toValue: 1.18,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };
  const handleAllyPressOut = () => {
    Animated.spring(allyScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  type Nav = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<Nav>();
  const handleSignUp = async() => {
    navigation.navigate('ConfirmCode', { username: contact });
    // Reset all errors
    setFirstNameError('');
    setSurnameError('');
    setDobError('');
    setGenderError('');
    setContactError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validate each field
    let hasErrors = false;

    if (!firstName.trim()) {
      setFirstNameError('Enter First name');
      hasErrors = true;
    }

    if (!surname.trim()) {
      setSurnameError('Enter Surname');
      hasErrors = true;
    }

    if (!dob.trim()) {
      setDobError('Enter Date of birth (DD/MM/YYYY)');
      hasErrors = true;
    }

    if (!gender) {
      setGenderError('Select a Gender');
      hasErrors = true;
    }

    if (!contact.trim()) {
      setContactError('Enter Mobile number or email');
      hasErrors = true;
    }

    if (!password.trim()) {
      setPasswordError('Enter New password');
      hasErrors = true;
    } else if (!validatePassword(password)) {
      setPasswordError('Password needs minimum 8 characters, 1 uppercase, 1 lowercase, 1 number and a special character (@#$%^&*()_+-=[]{}|;:,.<>?!)');
      hasErrors = true;
    } else {
      setPasswordError(''); // Clear error if password meets requirements
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Enter Confirm password');
      hasErrors = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      setPasswordError('Passwords do not match');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }
/* ─── SIGN‑UP with Amplify ─── */
  try {
  const result = await signUp({
    username: contact,           // email or phone
    password,
    options: {
    userAttributes: {
      email:         contact.includes('@') ? contact : undefined,
      phone_number: !contact.includes('@') ? contact : undefined,
      given_name:    firstName,
      family_name:   surname,
      birthdate:     dob,        // expects DD/MM/YYYY if that's what you stor
      gender,
    },
    autoSignIn: { enabled: true },
  },
});
console.log('signUp result →', result);
  alert('Check your e‑mail/SMS for the confirmation code!');
  navigation.navigate('ConfirmCode', { username: contact });
  return;
} catch (err: any) {
  alert(err.message || 'Sign‑up failed');
}
};

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios'); // keep open on iOS, close on Android
    if (selectedDate) {
      setDate(selectedDate);
      // Format date as DD/MM/YYYY
      const formatted = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth()+1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;
      setDob(formatted);
      setShowPicker(false);   // fecha o picker ✔
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>
            <Pressable
              onPressIn={handleAllyPressIn}
              onPressOut={handleAllyPressOut}
              onHoverIn={handleAllyPressIn}
              onHoverOut={handleAllyPressOut}
              style={{ alignSelf: 'center' }}
            >
              <Animated.Text style={[styles.allyWordLarge, { transform: [{ scale: allyScaleAnim }] }]}>Ally</Animated.Text>
            </Pressable>
          </Text>
          <Text style={styles.signupSubtitle}>Create a new Account</Text>
          <View style={styles.signupForm}>
            <View style={styles.nameRow}>
              <View style={styles.nameInputContainer}>
                <TextInput
                  style={[styles.input, styles.nameInput]}
                  placeholder="First name"
                  placeholderTextColor="#999"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                {firstNameError ? <Text style={styles.errorText}>{firstNameError}</Text> : null}
              </View>
              <View style={styles.nameInputContainer}>
                <TextInput
                  style={[styles.input, styles.nameInput, { marginRight: 0 }]}
                  placeholder="Surname"
                  placeholderTextColor="#999"
                  value={surname}
                  onChangeText={setSurname}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                {surnameError ? <Text style={styles.errorText}>{surnameError}</Text> : null}
              </View>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Date of birth (DD/MM/YYYY)"
              placeholderTextColor="#999"
              value={dob}
              onChangeText={setDob}
              autoCapitalize="none"
              autoCorrect={false}
              onPressIn={() => setShowPicker(true)}
            />
            {dobError ? <Text style={styles.errorText}>{dobError}</Text> : null}
            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
            <View style={styles.genderContainer}>
              <Text style={styles.genderLabel}>Gender:</Text>
              <View style={styles.genderOptions}>
                <Pressable
                  style={[
                    styles.genderOption,
                    gender === 'Masculine' && styles.genderOptionSelected
                  ]}
                  onPress={() => setGender('Masculine')}
                >
                  <Text style={[
                    styles.genderOptionText,
                    gender === 'Masculine' && styles.genderOptionTextSelected
                  ]}>Masculine</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.genderOption,
                    gender === 'Feminine' && styles.genderOptionSelected
                  ]}
                  onPress={() => setGender('Feminine')}
                >
                  <Text style={[
                    styles.genderOptionText,
                    gender === 'Feminine' && styles.genderOptionTextSelected
                  ]}>Feminine</Text>
                </Pressable>
              </View>
            </View>
            {genderError ? <Text style={styles.errorText}>{genderError}</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Mobile number or email"
              placeholderTextColor="#999"
              value={contact}
              onChangeText={setContact}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            {contactError ? <Text style={styles.errorText}>{contactError}</Text> : null}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="New password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={true}
              />
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={true}
              />
            </View>
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
            <Pressable
              onPress={handleSignUp}
              onHoverIn={() => setIsButtonHovered(true)}
              onHoverOut={() => setIsButtonHovered(false)}
              style={({ pressed }) => [styles.signupButton, pressed && { opacity: 0.9 }]}
            >
              <Text style={[
                styles.signupButtonText,
                isButtonHovered && { color: '#cccccc' }
              ]}>Sign up</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footbar}>
        <Text style={styles.footbarText}>© 2025 Ally</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fae7f7',
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: isTablet ? 60 : 20,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    textAlign: 'center',
    marginTop: isTablet ? 32 : 24,
    marginBottom: isTablet ? 32 : 24,
  },
  allyWordLarge: {
    fontSize: isTablet ? 90 : 56,
    fontWeight: 'bold',
    color: '#6426A9',
    lineHeight: isTablet ? 100 : 64,
    letterSpacing: 2,
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: isTablet ? 60 : 40,
  },
  avatarContainer: {
    width: isTablet ? 120 : 80,
    height: isTablet ? 120 : 80,
    borderRadius: isTablet ? 60 : 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isTablet ? 24 : 16,
  },
  avatarText: {
    fontSize: isTablet ? 48 : 32,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  welcomeText: {
    fontSize: isTablet ? 36 : moderateScale(24),
    fontWeight: 'bold' as const,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: isTablet ? 8 : 4,
  },
  subtitle: {
    fontSize: isTablet ? 20 : moderateScale(16),
    color: '#666666',
    textAlign: 'center',
  },
  infoSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: isTablet ? 24 : moderateScale(18),
    fontWeight: 600 as const,
    color: '#1A1A1A',
    marginBottom: isTablet ? 24 : 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: isTablet ? 16 : 12,
    padding: isTablet ? 24 : 16,
    marginBottom: isTablet ? 16 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    fontSize: isTablet ? 16 : moderateScale(14),
    color: '#666666',
    marginBottom: isTablet ? 8 : 4,
  },
  infoValue: {
    fontSize: isTablet ? 18 : moderateScale(16),
    fontWeight: 600 as const,
    color: '#1A1A1A',
  },
  footbar: {
    width: '100%',
    backgroundColor: '#6426A9',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  footbarText: {
    color: '#fff',
    fontSize: isTablet ? 15 : 12,
    fontWeight: '500',
    letterSpacing: 1,
  },
  signupSubtitle: {
    color: '#6426A9',
    fontSize: isTablet ? 22 : 15,
    textAlign: 'center',
    marginBottom: isTablet ? 32 : 20,
    fontWeight: '500',
    letterSpacing: 1,
  },
  signupForm: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    padding: isTablet ? 24 : 16,
    shadowColor: '#6426A9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: isTablet ? 10 : 8,
    paddingHorizontal: isTablet ? 18 : 12,
    fontSize: isTablet ? 15 : 13,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0d6ef',
    color: '#6426A9',
  },
  signupButton: {
    backgroundColor: '#002a2d',
    borderRadius: 8,
    paddingVertical: isTablet ? 12 : 8,
    paddingHorizontal: isTablet ? 40 : 32, // increased horizontal padding
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#002a2d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'center',
  },
  signupButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: isTablet ? 16 : 13,
    letterSpacing: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nameInputContainer: {
    flex: 1,
  },
  nameInput: {
    flex: 0.48,
    marginRight: 6,
    paddingVertical: isTablet ? 10 : 8,
    paddingHorizontal: isTablet ? 12 : 8,
    fontSize: isTablet ? 15 : 13,
    width: '100%',
    marginBottom: 12, // match the regular input margin
    marginHorizontal: 3,
  },
  genderContainer: {
    width: '100%',
    marginBottom: 12,
  },
  genderLabel: {
    fontSize: isTablet ? 15 : 13,
    color: '#6426A9',
    fontWeight: '500',
    marginBottom: 8,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: isTablet ? 10 : 8,
    paddingHorizontal: isTablet ? 12 : 8,
    borderWidth: 1,
    borderColor: '#e0d6ef',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  genderOptionSelected: {
    backgroundColor: '#6426A9',
    borderColor: '#6426A9',
  },
  genderOptionText: {
    fontSize: isTablet ? 15 : 13,
    color: '#999',
    fontWeight: '500',
  },
  genderOptionTextSelected: {
    color: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0d6ef',
    marginBottom: 12,
    height: isTablet ? 56 : 48,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: isTablet ? 18 : 12,
    fontSize: isTablet ? 15 : 13,
    color: '#6426A9',
    height: '100%',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: isTablet ? 12 : 10,
    marginTop: 4,
    marginBottom: 8,
    marginLeft: 4,
  },
}); 