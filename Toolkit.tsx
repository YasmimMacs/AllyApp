import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "./src/navigation/RootNavigator";

type ToolkitScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Toolkit"
>;

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isTablet = screenWidth >= 768;

// Responsive scaling functions
const scale = (size: number): number => {
  const baseWidth = 375;
  const scaleFactor = screenWidth / baseWidth;
  return Math.round(size * scaleFactor);
};

const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

interface ToolItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  action: () => void;
}

export default function ToolkitScreen() {
  const navigation = useNavigation<ToolkitScreenNavigationProp>();

  const handleSOS = () => {
    Alert.alert(
      "SOS Emergency",
      "Emergency services will be contacted immediately. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call Emergency",
          style: "destructive",
          onPress: () => {
            Alert.alert("Emergency", "Calling emergency services...");
          },
        },
      ]
    );
  };

  const handleShareLocation = () => {
    Alert.alert(
      "Share Location",
      "Sharing your live location with trusted contacts..."
    );
  };

  const handleFakeCall = () => {
    Alert.alert("Fake Call", "Simulating an incoming call...");
  };

  const handleQuickContact = () => {
    Alert.alert("Quick Contact", "Calling your emergency contact...");
  };

  const handleSafetyTips = () => {
    Alert.alert("Safety Tips", "Opening safety tips and guidelines...");
  };

  const handleEmergencyContacts = () => {
    Alert.alert(
      "Emergency Contacts",
      "Opening your emergency contacts list..."
    );
  };

  const tools: ToolItem[] = [
    {
      id: "share-location",
      title: "Share Live Location",
      subtitle: "Let trusted contacts track you",
      icon: "location",
      color: "#3B82F6",
      action: handleShareLocation,
    },
    {
      id: "fake-call",
      title: "Fake Call",
      subtitle: "Simulate an incoming call",
      icon: "call",
      color: "#10B981",
      action: handleFakeCall,
    },
    {
      id: "quick-contact",
      title: "Quick Contact",
      subtitle: "Reach trusted person instantly",
      icon: "people",
      color: "#6426A9",
      action: handleQuickContact,
    },
    {
      id: "safety-tips",
      title: "Safety Tips",
      subtitle: "Emergency guidelines and tips",
      icon: "bulb",
      color: "#F59E0B",
      action: handleSafetyTips,
    },
    {
      id: "emergency-contacts",
      title: "Emergency Contacts",
      subtitle: "Manage your emergency contacts",
      icon: "person",
      color: "#EF4444",
      action: handleEmergencyContacts,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#6426A9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Safety Toolkit</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* SOS Button */}
        <View style={styles.sosContainer}>
          <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>
          <Text style={styles.sosSubtext}>
            In an emergency, tap SOS for instant help.
          </Text>
        </View>

        {/* Tools Grid */}
        <View style={styles.toolsContainer}>
          <Text style={styles.toolsTitle}>Safety Tools</Text>

          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCard}
              onPress={tool.action}
            >
              <View style={styles.toolContent}>
                <View
                  style={[styles.toolIcon, { backgroundColor: tool.color }]}
                >
                  <Ionicons name={tool.icon as any} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.toolInfo}>
                  <Text style={styles.toolTitle}>{tool.title}</Text>
                  <Text style={styles.toolSubtitle}>{tool.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency Info */}
        <View style={styles.emergencyInfoContainer}>
          <Ionicons name="warning" size={20} color="#EF4444" />
          <Text style={styles.emergencyInfoText}>
            Keep this toolkit easily accessible. In case of emergency, stay calm
            and use these tools.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: "600",
    color: "#6426A9",
  },
  headerSpacer: {
    width: 40,
  },
  sosContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  sosButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  sosText: {
    fontSize: moderateScale(24),
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  sosSubtext: {
    fontSize: moderateScale(14),
    color: "#6426A9",
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 20,
  },
  toolsContainer: {
    marginBottom: 32,
  },
  toolsTitle: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    color: "#6426A9",
    marginBottom: 16,
  },
  toolCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toolContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: moderateScale(16),
    fontWeight: "500",
    color: "#6426A9",
    marginBottom: 4,
  },
  toolSubtitle: {
    fontSize: moderateScale(14),
    color: "#6B7280",
  },
  emergencyInfoContainer: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 60,
  },
  emergencyInfoText: {
    fontSize: moderateScale(14),
    color: "#991B1B",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
