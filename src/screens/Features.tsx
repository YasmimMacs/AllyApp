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
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/RootNavigator";

type FeaturesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Auth"
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

interface FeatureCard {
  id: string;
  title: string;
  icon: string;
  color: string;
  screen: string;
}

export default function FeaturesScreen() {
  const navigation = useNavigation<FeaturesScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [userName] = useState("Sarah");

  const features: FeatureCard[] = [
    {
      id: "map",
      title: "Safety Map",
      icon: "map",
      color: "#6426A9",
      screen: "Map",
    },
    {
      id: "buddy",
      title: "Find a Buddy",
      icon: "people",
      color: "#6426A9",
      screen: "Buddy",
    },
    {
      id: "community",
      title: "Community",
      icon: "chatbubbles",
      color: "#6426A9",
      screen: "Community",
    },
    {
      id: "toolkit",
      title: "Toolkit",
      icon: "shield",
      color: "#EF4444",
      screen: "Toolkit",
    },
  ];

  const handleFeaturePress = (feature: FeatureCard) => {
    if (feature.screen === "Community") {
      navigation.navigate("Main");
    } else if (feature.screen === "Map") {
      navigation.navigate("Main");
    } else if (feature.screen === "Buddy") {
      navigation.navigate("Main");
    } else if (feature.screen === "Toolkit") {
      navigation.navigate("Main");
    } else {
      // For other screens, navigate to Main as fallback
      navigation.navigate("Main");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi, {userName} 👋</Text>
        </View>

        {/* Safety Updates Alert */}
        <View style={styles.alertContainer}>
          <View style={styles.alertContent}>
            <Ionicons name="warning" size={20} color="#EA580C" />
            <Text style={styles.alertText}>3 safety updates near you</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#6426A9"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for places or routes..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={styles.featureCard}
              onPress={() => handleFeaturePress(feature)}
            >
              <View style={styles.featureContent}>
                <Ionicons
                  name={feature.icon as any}
                  size={32}
                  color={feature.color}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureTitle}>{feature.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Auth")}
          >
            <Ionicons name="log-out" size={20} color="#FFFFFF" />
            <Text style={styles.loginButtonText}>Logout</Text>
          </TouchableOpacity>
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
    paddingTop: 60, // Add top padding to move content down
  },
  header: {
    paddingTop: 40, // Increase top padding
    paddingBottom: 16,
  },
  greeting: {
    fontSize: moderateScale(24),
    fontWeight: "600",
    color: "#6426A9",
  },
  alertContainer: {
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    borderRadius: 8,
    padding: 16,
    marginBottom: 32, // Increase bottom margin
  },
  alertContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertText: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#92400E",
    marginLeft: 8,
  },
  searchContainer: {
    marginBottom: 32, // Increase bottom margin
  },
  searchInputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 44,
    fontSize: moderateScale(14),
    color: "#374151",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32, // Increase bottom margin
  },
  featureCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  featureContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  featureIcon: {
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#6426A9",
    textAlign: "center",
  },
  actionButtonsContainer: {
    marginTop: 32, // Increase top margin
    marginBottom: 60, // Increase bottom margin
  },
  joinCommunityButton: {
    backgroundColor: "#6426A9",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#6426A9",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  joinCommunityButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16),
    fontWeight: "600",
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16),
    fontWeight: "600",
    marginLeft: 8,
  },
  featuresButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  featuresButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16),
    fontWeight: "600",
    marginLeft: 8,
  },
});
