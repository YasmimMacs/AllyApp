import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  Image,
  Animated,
  Pressable,
  TextInput,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "./src/navigation/RootNavigator";
import { useNavigation } from "@react-navigation/native";

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

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

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const loginButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const allyScaleAnim = useRef(new Animated.Value(1)).current;

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginButtonHovered, setIsLoginButtonHovered] = useState(false);
  const [isCreateAccountButtonHovered, setIsCreateAccountButtonHovered] =
    useState(false);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.18,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handleButtonPressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1.12,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handleLoginButtonPressIn = () => {
    Animated.spring(loginButtonScaleAnim, {
      toValue: 1.12,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handleLoginButtonPressOut = () => {
    Animated.spring(loginButtonScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
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

  const handleLogin = () => {
    // Navigate to Features screen when login button is clicked
    navigation.navigate("Features");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          <Pressable
            onPressIn={handleAllyPressIn}
            onPressOut={handleAllyPressOut}
            onHoverIn={handleAllyPressIn}
            onHoverOut={handleAllyPressOut}
            style={{ alignSelf: "center" }}
          >
            <Animated.Text
              style={[
                styles.allyWordLarge,
                { transform: [{ scale: allyScaleAnim }] },
              ]}
            >
              Ally
            </Animated.Text>
          </Pressable>
        </Text>
        <Text style={styles.subtitle}>
          Your Trusted Companion for safe travel
        </Text>

        {/* Login Section */}
        <View style={styles.loginSection}>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            onPress={handleLogin}
            onHoverIn={() => setIsLoginButtonHovered(true)}
            onHoverOut={() => setIsLoginButtonHovered(false)}
            style={({ pressed }) => [
              styles.loginButton,
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text
              style={[
                styles.loginButtonText,
                isLoginButtonHovered && { color: "#cccccc" },
              ]}
            >
              Log In
            </Text>
          </Pressable>
          <Text style={styles.forgotPassword}>Forgotten password?</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            onHoverIn={() => setIsCreateAccountButtonHovered(true)}
            onHoverOut={() => setIsCreateAccountButtonHovered(false)}
            onPress={() => navigation.navigate("SignUp")}
            style={({ pressed }) => [
              styles.customButton,
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text
              style={[
                styles.customButtonText,
                isCreateAccountButtonHovered && { color: "#cccccc" },
              ]}
            >
              Create new Account
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Features")}
            style={({ pressed }) => [
              styles.featuresButton,
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={styles.featuresButtonText}>Explore Features</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.footbar}>
        <Text style={styles.footbarText}>© 2025 Ally</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fae7f7",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: isTablet ? 60 : 20,
    paddingVertical: 40,
  },
  compassContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: isTablet ? 32 : 24, // more space below
    alignSelf: "center",
  },
  compassCircle: {
    backgroundColor: "#6426A9",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: "relative",
  },
  cardinal: {
    color: "#fff",
    fontWeight: "bold",
    position: "absolute",
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 2,
  },
  north: {
    top: 4,
    left: "50%",
    marginLeft: -10,
  },
  east: {
    right: 4,
    top: "50%",
    marginTop: -10,
  },
  south: {
    bottom: 4,
    left: "50%",
    marginLeft: -10,
  },
  west: {
    left: 4,
    top: "50%",
    marginTop: -10,
  },
  needle: {
    position: "absolute",
    width: 4,
    backgroundColor: "red",
    borderRadius: 2,
    zIndex: 2,
  },
  needleBase: {
    position: "absolute",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#6426A9",
    zIndex: 3,
  },
  compassImage: {
    width: isTablet ? 120 : 90,
    height: isTablet ? 120 : 90,
    alignSelf: "center",
    marginBottom: isTablet ? 32 : 24,
  },
  title: {
    fontSize: isTablet ? 48 : moderateScale(32),
    fontWeight: "bold" as const,
    color: "#6426A9",
    textAlign: "center",
    marginBottom: isTablet ? 16 : 8,
    lineHeight: isTablet ? 56 : moderateScale(40),
  },
  allyWord: {
    fontSize: isTablet ? 64 : 40,
    fontWeight: "bold",
    color: "#6426A9",
    lineHeight: isTablet ? 72 : 48,
  },
  allyWordLarge: {
    fontSize: isTablet ? 90 : 56,
    fontWeight: "bold",
    color: "#6426A9",
    lineHeight: isTablet ? 100 : 64,
    letterSpacing: 2,
    textAlign: "center",
  },
  subtitle: {
    fontSize: isTablet ? 24 : moderateScale(18),
    color: "#666666",
    textAlign: "center",
    marginBottom: isTablet ? 60 : 40,
    lineHeight: isTablet ? 32 : moderateScale(24),
    marginTop: isTablet ? 32 : 24, // added margin to move subtitle down
  },
  buttonContainer: {
    width: isTablet ? 300 : "100%",
    maxWidth: 400,
    paddingHorizontal: isSmallDevice ? 20 : 0,
  },
  animatedButton: {
    borderRadius: 8,
    overflow: "hidden",
  },
  customButton: {
    backgroundColor: "#002a2d",
    borderRadius: 8,
    paddingVertical: isTablet ? 12 : 8,
    paddingHorizontal: isTablet ? 24 : 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: isTablet ? 36 : 28,
    marginBottom: isTablet ? 64 : 48, // increased margin below for more separation from footbar
    shadowColor: "#002a2d",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: "center",
  },
  customButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: isTablet ? 16 : 13,
    letterSpacing: 1,
  },
  featuresButton: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingVertical: isTablet ? 12 : 8,
    paddingHorizontal: isTablet ? 24 : 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: "center",
  },
  featuresButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: isTablet ? 16 : 13,
    letterSpacing: 1,
  },
  loginSection: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    marginBottom: isTablet ? 32 : 24,
    marginTop: isTablet ? 16 : 8,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    padding: isTablet ? 24 : 16,
    shadowColor: "#6426A9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: isTablet ? 14 : 10,
    paddingHorizontal: isTablet ? 18 : 12,
    fontSize: isTablet ? 18 : 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0d6ef",
    color: "#6426A9",
  },
  loginButton: {
    backgroundColor: "#6426A9",
    borderRadius: 8,
    paddingVertical: isTablet ? 14 : 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    shadowColor: "#6426A9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 1,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: isTablet ? 18 : 16,
    letterSpacing: 1,
  },
  forgotPassword: {
    color: "#6426A9",
    fontSize: isTablet ? 13 : 11,
    textAlign: "center",
    marginTop: 8,
    textDecorationLine: "underline",
    fontWeight: "500",
    alignSelf: "center",
  },
  footbar: {
    width: "100%",
    backgroundColor: "#6426A9",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    marginTop: isTablet ? 36 : 24, // added top margin
  },
  footbarText: {
    color: "#fff",
    fontSize: isTablet ? 15 : 12,
    fontWeight: "500",
    letterSpacing: 1,
  },
});
