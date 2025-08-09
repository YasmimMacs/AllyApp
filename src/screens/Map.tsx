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
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/RootNavigator";

type MapScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  keyof RootStackParamList
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

interface SafetyZone {
  id: string;
  name: string;
  type: "safe" | "caution" | "unsafe";
  safetyScore: number;
  lighting: string;
  crowdLevel: string;
  position: { left: number; top: number };
  recentReports: Array<{
    text: string;
    user: string;
    time: string;
    type: "positive" | "warning" | "negative";
  }>;
  tips: string[];
}

export default function MapScreen() {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState<SafetyZone | null>(null);
  const [showZoneDetails, setShowZoneDetails] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filters = ["All", "Lighting", "Crowd Level", "Reports", "Safe Places"];

  const safetyZones: SafetyZone[] = [
    {
      id: "1",
      name: "Downtown Plaza",
      type: "safe",
      safetyScore: 9,
      lighting: "Excellent",
      crowdLevel: "Moderate",
      position: { left: 120, top: 100 },
      recentReports: [
        {
          text: "Well-lit area with good visibility",
          user: "Sarah M.",
          time: "2h ago",
          type: "positive",
        },
        {
          text: "Security cameras present",
          user: "Community",
          time: "1d ago",
          type: "positive",
        },
      ],
      tips: [
        "Stay in well-lit areas",
        "Be aware of your surroundings",
        "Trust your instincts",
      ],
    },
    {
      id: "2",
      name: "Park Street",
      type: "caution",
      safetyScore: 6,
      lighting: "Fair",
      crowdLevel: "Low",
      position: { left: 250, top: 150 },
      recentReports: [
        {
          text: "Poor lighting after sunset",
          user: "Anonymous",
          time: "3h ago",
          type: "warning",
        },
        {
          text: "Limited foot traffic",
          user: "Community",
          time: "2d ago",
          type: "warning",
        },
      ],
      tips: [
        "Avoid walking alone at night",
        "Use main streets when possible",
        "Carry a flashlight",
      ],
    },
    {
      id: "3",
      name: "Industrial Area",
      type: "unsafe",
      safetyScore: 3,
      lighting: "Poor",
      crowdLevel: "Very Low",
      position: { left: 80, top: 250 },
      recentReports: [
        {
          text: "Multiple safety incidents reported",
          user: "Community",
          time: "1d ago",
          type: "negative",
        },
        {
          text: "No street lighting",
          user: "Anonymous",
          time: "2d ago",
          type: "negative",
        },
      ],
      tips: [
        "Avoid this area completely",
        "Use alternative routes",
        "Report any suspicious activity",
      ],
    },
  ];

  const getZoneColor = (type: string) => {
    switch (type) {
      case "safe":
        return "#10B981";
      case "caution":
        return "#F59E0B";
      case "unsafe":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getZoneIcon = (type: string) => {
    switch (type) {
      case "safe":
        return "checkmark-circle";
      case "caution":
        return "warning";
      case "unsafe":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const handleZonePress = (zone: SafetyZone) => {
    setSelectedZone(zone);
    setShowZoneDetails(true);
  };

  const handleReportIssue = () => {
    Alert.alert(
      "Report Issue",
      "Report functionality will be implemented here"
    );
  };

  const handleGetDirections = () => {
    Alert.alert(
      "Get Directions",
      "Navigation functionality will be implemented here"
    );
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
          <Text style={styles.headerTitle}>Safety Map</Text>
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
              placeholder="Search location or address..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterBadge,
                  selectedFilter === filter && styles.filterBadgeActive,
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter && styles.filterTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Map Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
            <Text style={styles.legendText}>Safe</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
            <Text style={styles.legendText}>Caution</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
            <Text style={styles.legendText}>Unsafe</Text>
          </View>
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          <View style={styles.mapBackground}>
            {/* Map content would go here - simplified for now */}
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map" size={48} color="#6426A9" />
              <Text style={styles.mapPlaceholderText}>Interactive Map</Text>
              <Text style={styles.mapPlaceholderSubtext}>
                Map integration will be implemented here
              </Text>
            </View>

            {/* Safety Zone Markers */}
            {safetyZones.map((zone) => (
              <TouchableOpacity
                key={zone.id}
                style={[
                  styles.zoneMarker,
                  {
                    backgroundColor: getZoneColor(zone.type),
                    left: zone.position.left,
                    top: zone.position.top,
                  },
                ]}
                onPress={() => handleZonePress(zone)}
              >
                <Ionicons
                  name={getZoneIcon(zone.type) as any}
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            ))}

            {/* Current Location Marker */}
            <View style={styles.currentLocationMarker}>
              <View style={styles.currentLocationDot} />
              <View style={styles.currentLocationPulse} />
            </View>

            {/* Report Button */}
            <TouchableOpacity style={styles.reportButton}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Bar */}
        <View style={styles.statusBar}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.statusText}>You are in a safe area</Text>
        </View>
      </ScrollView>

      {/* Zone Details Modal */}
      <Modal
        visible={showZoneDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowZoneDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedZone?.name}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowZoneDetails(false)}
              >
                <Ionicons name="close" size={24} color="#6426A9" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Safety Score */}
              <View style={styles.safetyScoreContainer}>
                <Text style={styles.safetyScoreLabel}>Safety Score</Text>
                <Text
                  style={[
                    styles.safetyScoreValue,
                    {
                      color:
                        (selectedZone?.safetyScore || 0) >= 8
                          ? "#10B981"
                          : (selectedZone?.safetyScore || 0) >= 6
                          ? "#F59E0B"
                          : "#EF4444",
                    },
                  ]}
                >
                  {selectedZone?.safetyScore}/10
                </Text>
              </View>

              {/* Quick Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Lighting</Text>
                  <Text style={styles.statValue}>{selectedZone?.lighting}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Crowd Level</Text>
                  <Text style={styles.statValue}>
                    {selectedZone?.crowdLevel}
                  </Text>
                </View>
              </View>

              {/* Recent Reports */}
              <View style={styles.reportsContainer}>
                <Text style={styles.reportsTitle}>Recent Reports</Text>
                {selectedZone?.recentReports.map((report, index) => (
                  <View key={index} style={styles.reportItem}>
                    <Text style={styles.reportText}>{report.text}</Text>
                    <Text style={styles.reportMeta}>
                      {report.user} • {report.time}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Safety Tips */}
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Safety Tips</Text>
                {selectedZone?.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.actionButtonOutline}
                onPress={handleReportIssue}
              >
                <Text style={styles.actionButtonOutlineText}>Report Issue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleGetDirections}
              >
                <Text style={styles.actionButtonText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: "600",
    color: "#6426A9",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: 12,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
    fontSize: moderateScale(14),
    color: "#374151",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterBadgeActive: {
    backgroundColor: "#6426A9",
    borderColor: "#6426A9",
  },
  filterText: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: moderateScale(12),
    color: "#6426A9",
  },
  mapContainer: {
    marginBottom: 16,
  },
  mapBackground: {
    width: "100%",
    height: 300,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  mapPlaceholderText: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#6426A9",
    marginTop: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    marginTop: 4,
  },
  zoneMarker: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  currentLocationMarker: {
    position: "absolute",
    bottom: 24,
    right: 24,
  },
  currentLocationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#6426A9",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  currentLocationPulse: {
    position: "absolute",
    top: -4,
    left: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#6426A9",
    opacity: 0.3,
  },
  reportButton: {
    position: "absolute",
    bottom: 24,
    left: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#6426A9",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1FAE5",
    borderWidth: 1,
    borderColor: "#10B981",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  statusText: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#065F46",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    color: "#6426A9",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  safetyScoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  safetyScoreLabel: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#6426A9",
  },
  safetyScoreValue: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: moderateScale(12),
    color: "#6B7280",
  },
  statValue: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#374151",
    marginTop: 4,
  },
  reportsContainer: {
    marginBottom: 16,
  },
  reportsTitle: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#6426A9",
    marginBottom: 8,
  },
  reportItem: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reportText: {
    fontSize: moderateScale(14),
    color: "#374151",
  },
  reportMeta: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    marginTop: 4,
  },
  tipsContainer: {
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#6426A9",
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  tipBullet: {
    fontSize: moderateScale(14),
    color: "#6426A9",
    marginRight: 8,
  },
  tipText: {
    fontSize: moderateScale(14),
    color: "#374151",
    flex: 1,
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  actionButtonOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#6426A9",
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: "center",
  },
  actionButtonOutlineText: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#6426A9",
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#6426A9",
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
