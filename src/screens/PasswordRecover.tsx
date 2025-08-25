import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Pressable,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { RootStackParamList } from "../navigation/RootNavigator";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
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

type Nav = NativeStackNavigationProp<RootStackParamList, "PasswordRecover">;

export default function PasswordRecover() {
  const navigation = useNavigation<Nav>();
  
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetRequested, setIsResetRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?!]/.test(password);

    return (
      minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar
    );
  };



  const handleRequestReset = async () => {
    // Reset errors
    setEmailError("");
    
    if (!email.trim()) {
      setEmailError("Enter your email address");
      return;
    }
    
    if (!email.includes("@")) {
      setEmailError("Enter a valid email address");
      return;
    }

    setIsLoading(true);
    
    try {
      await resetPassword({ username: email.trim().toLowerCase() });
      setIsResetRequested(true);
      Alert.alert(
        "Reset Code Sent",
        "A 6-digit verification code has been sent to your email. Please check your inbox and enter the code below."
      );
    } catch (error: any) {
      console.error("Password reset request error:", error);
      
      let errorMessage = "Failed to send reset code: ";
      
      if (error.name === 'UserNotFoundException') {
        errorMessage += "No account found with this email address.";
      } else if (error.name === 'LimitExceededException') {
        errorMessage += "Too many attempts. Please try again later.";
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Unknown error occurred. Please try again.";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    // Reset errors
    setCodeError("");
    setPasswordError("");
    setConfirmPasswordError("");
    
    let hasErrors = false;

    if (!code.trim()) {
      setCodeError("Enter the verification code");
      hasErrors = true;
    }

    if (!newPassword.trim()) {
      setPasswordError("Enter new password");
      hasErrors = true;
    } else if (!validatePassword(newPassword)) {
      setPasswordError(
        "Password needs minimum 8 characters, 1 uppercase, 1 lowercase, 1 number and a special character (@#$%^&*()_+-=[]{}|;:,.<>?!)"
      );
      hasErrors = true;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Confirm your new password");
      hasErrors = true;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    setIsLoading(true);
    
    try {
      await confirmResetPassword({
        username: email.trim().toLowerCase(),
        confirmationCode: code.trim(),
        newPassword: newPassword
      });
      
      Alert.alert(
        "Password Updated",
        "Your password has been successfully updated. You can now sign in with your new password.",
        [
          {
            text: "Sign In",
            onPress: () => navigation.navigate("Auth")
          }
        ]
      );
    } catch (error: any) {
      console.error("Password reset confirmation error:", error);
      
      let errorMessage = "Failed to update password: ";
      
      if (error.name === 'CodeMismatchException') {
        errorMessage += "Invalid verification code. Please check the code and try again.";
      } else if (error.name === 'ExpiredCodeException') {
        errorMessage += "Verification code has expired. Please request a new one.";
      } else if (error.name === 'InvalidPasswordException') {
        errorMessage += "Password does not meet requirements.";
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Unknown error occurred. Please try again.";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          
          
          <View style={styles.form}>
            {/* Title */}
            <Text style={styles.formTitle}>Reset Password</Text>
            
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!isResetRequested}
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            {/* Request Reset Button */}
            {!isResetRequested && (
              <Pressable
                onPress={handleRequestReset}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && { opacity: 0.9 },
                  isLoading && { opacity: 0.6 },
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? "Sending..." : "Send Reset Code"}
                </Text>
              </Pressable>
            )}

            {/* Reset Code and New Password Section */}
            {isResetRequested && (
              <>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="6-digit verification code"
                    placeholderTextColor="#999"
                    value={code}
                    onChangeText={setCode}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  {codeError ? (
                    <Text style={styles.errorText}>{codeError}</Text>
                  ) : null}
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="New password"
                    placeholderTextColor="#999"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                  />
                  {passwordError ? (
                    <Text style={styles.errorText}>{passwordError}</Text>
                  ) : null}
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                  />
                  {confirmPasswordError ? (
                    <Text style={styles.errorText}>{confirmPasswordError}</Text>
                  ) : null}
                </View>

                <Pressable
                  onPress={handleConfirmReset}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && { opacity: 0.9 },
                    isLoading && { opacity: 0.6 },
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? "Updating..." : "Update Password"}
                  </Text>
                </Pressable>
              </>
            )}

            {/* Back to Login Button */}
            <Pressable
              onPress={() => navigation.navigate("Auth")}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.secondaryButtonText}>
                Back to Login
              </Text>
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
    backgroundColor: "#fae7f7",
    paddingTop: Platform.OS === "ios" ? 0 : StatusBar.currentHeight || 0,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: isTablet ? 60 : 20,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    padding: isTablet ? 24 : 16,
    shadowColor: "#6426A9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  formTitle: {
    color: "#6426A9",
    fontSize: isTablet ? 24 : 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: isTablet ? 24 : 20,
    marginTop: isTablet ? 24 : 20,
    letterSpacing: 1,
  },


  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: isTablet ? 10 : 8,
    paddingHorizontal: isTablet ? 18 : 12,
    fontSize: isTablet ? 15 : 13,
    borderWidth: 1,
    borderColor: "#e0d6ef",
    color: "#6426A9",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: isTablet ? 12 : 10,
    marginTop: 4,
    marginLeft: 4,
  },
  primaryButton: {
    backgroundColor: "#6426A9",
    borderRadius: 8,
    paddingVertical: isTablet ? 12 : 8,
    paddingHorizontal: isTablet ? 60 : 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#6426A9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: "center",
    minWidth: 280,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: isTablet ? 16 : 13,
    letterSpacing: 1,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: isTablet ? 12 : 8,
    paddingHorizontal: isTablet ? 60 : 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#6426A9",
    shadowColor: "#6426A9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: "center",
    minWidth: 280,
  },
  secondaryButtonText: {
    color: "#6426A9",
    fontWeight: "600",
    fontSize: isTablet ? 16 : 13,
    letterSpacing: 1,
  },
  footbar: {
    width: "100%",
    backgroundColor: "transparent",
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: Platform.OS === 'android' ? 20 : 0,
    left: 0,
    marginTop: isTablet ? 48 : 32,
  },
  footbarText: {
    color: "#6426A9",
    fontSize: isTablet ? 15 : 12,
    fontWeight: "500",
    letterSpacing: 1,
  },
});
