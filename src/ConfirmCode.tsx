import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";


import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from './navigation/RootNavigator';

/* palette + helpers reused */
const { width: screenWidth } = Dimensions.get("window");
const scale = (s: number) => Math.round((screenWidth / 375) * s);
const COLORS = { primary: "#6426A9", bgLight: "#F6DDF8", textGrey: "#999" };

// Fix type error: ensure 'ConfirmCode' is a valid key and username param exists
type Props = NativeStackScreenProps<RootStackParamList, "ConfirmCode">;

export default function ConfirmCode({ route, navigation }: Props) {
  // Defensive: fallback if params is undefined or username missing
  const username = (route.params as any)?.username ?? "";
  const [code, setCode] = useState("");

  async function handleConfirm() {
    try {
      await confirmSignUp({ username, confirmationCode: code });
      alert("Account confirmed! Please login with your credentials.");
      navigation.replace("Auth"); // Navigate to Auth (HomeScreen) where user can login
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleResendCode() {
    try {
      await resendSignUpCode({username});
      alert("Verification code sent again! Check your email.");
    } catch (e: any) {
      alert("Failed to resend code: " + e.message);
    }
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Enter the verification code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to {username}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="6‑digit code"
          placeholderTextColor={COLORS.textGrey}
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
        />

        <TouchableOpacity style={styles.button} onPress={handleConfirm}>
          <Text style={styles.buttonText}>Confirm Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resend} onPress={handleResendCode}>
          <Text style={styles.resendTxt}>Resend code</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footbar}>
        <Text style={styles.footbarText}>© 2025 Ally</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fae7f7",
    justifyContent: "center",
    padding: 24,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#6426A9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  title: {
    fontSize: scale(20),
    fontWeight: "600",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: scale(14),
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0d6ef",
    borderRadius: 8,
    padding: 14,
    fontSize: scale(16),
    backgroundColor: "#fff",
    marginBottom: 24,
    color: "#6426A9",
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    paddingHorizontal: 48,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 280,
    alignSelf: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: { color: "#fff", fontSize: scale(16), fontWeight: "600" },
  resend: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 48,
    minWidth: 280,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  resendTxt: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: scale(16),
  },
  footbar: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 40 : 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footbarText: {
    fontSize: scale(12),
    color: COLORS.textGrey,
  },
});
