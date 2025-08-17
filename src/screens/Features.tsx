import React, { useState, useEffect } from "react";
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
  Alert,
} from "react-native";
import { RefreshControl } from "react-native";
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
  description: string;
  status: "active" | "inactive" | "maintenance";
  userCount?: number;
}

export default function FeaturesScreen() {
  const navigation = useNavigation<FeaturesScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [userName] = useState("Sarah");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categories = ["All", "Safety", "Community", "Navigation", "Emergency"];

  const features: FeatureCard[] = [
    {
      id: "map",
      title: "Safety Map",
      icon: "map",
      color: "#6426A9",
      screen: "Map",
      description: "Real-time safety zones and live location tracking",
      status: "active",
      userCount: 1247,
    },
    {
      id: "buddy",
      title: "Find a Buddy",
      icon: "people",
      color: "#6426A9",
      screen: "Buddy",
      description: "Connect with nearby users for safe travel",
      status: "active",
      userCount: 892,
    },
    {
      id: "community",
      title: "Community",
      icon: "chatbubbles",
      color: "#6426A9",
      screen: "Community",
      description: "Share safety updates and connect with neighbors",
      status: "active",
      userCount: 2156,
    },
    {
      id: "toolkit",
      title: "Safety Toolkit",
      icon: "shield",
      color: "#EF4444",
      screen: "Toolkit",
      description: "Emergency contacts and safety resources",
      status: "active",
      userCount: 567,
    },
    {
      id: "alerts",
      title: "Safety Alerts",
      icon: "notifications",
      color: "#F59E0B",
      screen: "Alerts",
      description: "Real-time safety notifications in your area",
      status: "active",
      userCount: 1893,
    },
    {
      id: "routes",
      title: "Safe Routes",
      icon: "navigate",
      color: "#10B981",
      screen: "Routes",
      description: "Find the safest path to your destination",
      status: "maintenance",
      userCount: 445,
    },
  ];

  const filteredFeatures = features.filter(feature => {
    if (selectedCategory === "All") return true;
    if (selectedCategory === "Safety" && ["map", "toolkit", "alerts", "routes"].includes(feature.id)) return true;
    if (selectedCategory === "Community" && ["community", "buddy"].includes(feature.id)) return true;
    if (selectedCategory === "Navigation" && ["map", "routes"].includes(feature.id)) return true;
    if (selectedCategory === "Emergency" && ["toolkit", "alerts"].includes(feature.id)) return true;
    return false;
  });

  const searchFilteredFeatures = filteredFeatures.filter(feature =>
    feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFeaturePress = (feature: FeatureCard) => {
    if (feature.status === "maintenance") {
      Alert.alert(
        "Feature Unavailable",
        "This feature is currently under maintenance. Please check back later.",
        [{ text: "OK" }]
      );
      return;
    }

    if (feature.screen === "Map") {
      navigation.navigate("Main");
    } else if (feature.screen === "Community") {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10B981";
      case "inactive":
        return "#6B7280";
      case "maintenance":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      case "maintenance":
        return "Maintenance";
      default:
        return "Unknown";
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleEmergencyContact = () => {
    Alert.alert(
      "Emergency Contact",
      "Emergency contact functionality will be implemented here",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi, {userName} 👋</Text>
          <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyContact}>
            <Ionicons name="warning" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Safety Updates Alert */}
        <View style={styles.alertContainer}>
          <View style={styles.alertContent}>
            <Ionicons name="warning" size={20} color="#EA580C" />
            <Text style={styles.alertText}>3 safety updates near you</Text>
            <TouchableOpacity style={styles.alertButton}>
              <Text style={styles.alertButtonText}>View</Text>
            </TouchableOpacity>
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

        {/* Category Filter */}
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryBadge,
                  selectedCategory === category && styles.categoryBadgeActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          {searchFilteredFeatures.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={[
                styles.featureCard,
                feature.status === "maintenance" && styles.featureCardDisabled
              ]}
              onPress={() => handleFeaturePress(feature)}
              disabled={feature.status === "maintenance"}
            >
              <View style={styles.featureHeader}>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(feature.status) }]} />
                <Text style={styles.statusText}>{getStatusText(feature.status)}</Text>
              </View>
              
              <View style={styles.featureContent}>
                <Ionicons
                  name={feature.icon as any}
                  size={32}
                  color={feature.color}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
                
                {feature.userCount && (
                  <View style={styles.userCountContainer}>
                    <Ionicons name="people" size={16} color="#6B7280" />
                    <Text style={styles.userCountText}>{feature.userCount.toLocaleString()} users</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="location" size={24} color="#6426A9" />
              <Text style={styles.quickActionText}>Share Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="shield-checkmark" size={24} color="#10B981" />
              <Text style={styles.quickActionText}>Safety Check</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="call" size={24} color="#EF4444" />
              <Text style={styles.quickActionText}>Emergency</Text>
            </TouchableOpacity>
          </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: moderateScale(24),
    fontWeight: "600",
    color: "#6426A9",
  },
  emergencyButton: {
    backgroundColor: "#EF4444",
    borderRadius: 20,
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
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
  alertButton: {
    marginLeft: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#F59E0B",
    borderRadius: 6,
  },
  alertButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(12),
    fontWeight: "600",
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
  categoryContainer: {
    marginBottom: 32, // Increase bottom margin
    paddingBottom: 10,
  },
  categoryBadge: {
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  categoryBadgeActive: {
    backgroundColor: "#6426A9",
    borderColor: "#6426A9",
  },
  categoryText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#4B5563",
  },
  categoryTextActive: {
    color: "#FFFFFF",
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
  featureCardDisabled: {
    opacity: 0.6,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#6B7280",
  },
  featureContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  featureIcon: {
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#6426A9",
    textAlign: "center",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 12,
  },
  userCountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userCountText: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    marginLeft: 4,
  },
  quickActionsContainer: {
    marginBottom: 32, // Increase bottom margin
  },
  quickActionsTitle: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    color: "#6426A9",
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionButton: {
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  quickActionText: {
    fontSize: moderateScale(12),
    color: "#6426A9",
    marginTop: 8,
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
