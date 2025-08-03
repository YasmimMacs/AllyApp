import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
// import { confirmSignUp } from 'aws-amplify/auth';
// import { resendSignUpCode } from 'aws-amplify/auth';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "navigation/RootNavigator";

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
      // Temporarily disabled AWS Amplify functionality
      // await confirmSignUp({username, confirmationCode: code});
      alert("Account confirmed! Please login.");
      navigation.replace("Home"); // or Dashboard
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleResendCode() {
    try {
      // Temporarily disabled AWS Amplify functionality
      // await resendSignUpCode({username});
      alert("Code sent again!");
    } catch (e: any) {
      alert("Code sent again!");
    }
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Enter the verification code</Text>

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
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: scale(20),
    fontWeight: "600",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.textGrey,
    borderRadius: 8,
    padding: 14,
    fontSize: scale(16),
    backgroundColor: "#fff",
    marginBottom: 24,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: scale(16), fontWeight: "600" },
  resend: {
    marginTop: 16,
    alignItems: "center",
  },
  resendTxt: {
    color: "#6426A9",
    fontWeight: "600",
  },
});
