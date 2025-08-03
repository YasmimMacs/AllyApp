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
import { RootStackParamList } from "./src/navigation/RootNavigator";

type BuddyScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Buddy"
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

interface Buddy {
  id: string;
  name: string;
  distance: string;
  active: string;
  avatar: string;
}

export default function BuddyScreen() {
  const navigation = useNavigation<BuddyScreenNavigationProp>();
  const [showPostModal, setShowPostModal] = useState(false);
  const [postRequest, setPostRequest] = useState("");

  const availableBuddies: Buddy[] = [
    {
      id: "1",
      name: "Emma",
      distance: "0.3 mi",
      active: "2 min ago",
      avatar: "E",
    },
    {
      id: "2",
      name: "Lisa",
      distance: "0.5 mi",
      active: "5 min ago",
      avatar: "L",
    },
    {
      id: "3",
      name: "Maya",
      distance: "0.8 mi",
      active: "10 min ago",
      avatar: "M",
    },
  ];

  const handlePostRequest = () => {
    setShowPostModal(true);
  };

  const handleSubmitRequest = () => {
    if (postRequest.trim()) {
      Alert.alert(
        "Request Posted",
        "Your buddy request has been posted successfully!"
      );
      setPostRequest("");
      setShowPostModal(false);
    } else {
      Alert.alert("Error", "Please enter a request message");
    }
  };

  const handleChatWithBuddy = (buddy: Buddy) => {
    Alert.alert("Chat", `Starting chat with ${buddy.name}`);
  };

  const handleSeeNearbyBuddies = () => {
    Alert.alert("Nearby Buddies", "Showing nearby buddies on map");
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#6426A9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find a Buddy</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.postRequestButton}
            onPress={handlePostRequest}
          >
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.postRequestButtonText}>Post Request</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nearbyBuddiesButton}
            onPress={handleSeeNearbyBuddies}
          >
            <Ionicons name="location" size={20} color="#6426A9" />
            <Text style={styles.nearbyBuddiesButtonText}>
              See Nearby Buddies
            </Text>
          </TouchableOpacity>
        </View>

        {/* Available Buddies */}
        <View style={styles.buddiesContainer}>
          <Text style={styles.buddiesTitle}>Available Buddies</Text>

          {availableBuddies.map((buddy) => (
            <View key={buddy.id} style={styles.buddyCard}>
              <View style={styles.buddyInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{buddy.avatar}</Text>
                </View>
                <View style={styles.buddyDetails}>
                  <Text style={styles.buddyName}>{buddy.name}</Text>
                  <Text style={styles.buddyMeta}>
                    {buddy.distance} • {buddy.active}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => handleChatWithBuddy(buddy)}
              >
                <Ionicons name="chatbubble" size={16} color="#FFFFFF" />
                <Text style={styles.chatButtonText}>Chat</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Safety Tip */}
        <View style={styles.safetyTipContainer}>
          <Ionicons name="bulb" size={20} color="#3B82F6" />
          <Text style={styles.safetyTipText}>
            Always meet in public, well-lit areas.
          </Text>
        </View>
      </ScrollView>

      {/* Post Request Modal */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPostModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post Buddy Request</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPostModal(false)}
              >
                <Ionicons name="close" size={24} color="#6426A9" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>
                What kind of buddy do you need?
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., Walking buddy for evening commute from downtown"
                placeholderTextColor="#9CA3AF"
                value={postRequest}
                onChangeText={setPostRequest}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPostModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitRequest}
              >
                <Text style={styles.submitButtonText}>Post Request</Text>
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
  actionButtonsContainer: {
    marginBottom: 32,
  },
  postRequestButton: {
    backgroundColor: "#6426A9",
    borderRadius: 25,
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
  postRequestButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16),
    fontWeight: "600",
    marginLeft: 8,
  },
  nearbyBuddiesButton: {
    borderWidth: 1,
    borderColor: "#6426A9",
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  nearbyBuddiesButtonText: {
    color: "#6426A9",
    fontSize: moderateScale(16),
    fontWeight: "600",
    marginLeft: 8,
  },
  buddiesContainer: {
    marginBottom: 32,
  },
  buddiesTitle: {
    fontSize: moderateScale(16),
    fontWeight: "500",
    color: "#6426A9",
    marginBottom: 16,
  },
  buddyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buddyInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#6426A9",
  },
  buddyDetails: {
    flex: 1,
  },
  buddyName: {
    fontSize: moderateScale(16),
    fontWeight: "500",
    color: "#6426A9",
  },
  buddyMeta: {
    fontSize: moderateScale(14),
    color: "#6B7280",
    marginTop: 2,
  },
  chatButton: {
    backgroundColor: "#6426A9",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  chatButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(14),
    fontWeight: "500",
    marginLeft: 4,
  },
  safetyTipContainer: {
    backgroundColor: "#DBEAFE",
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  safetyTipText: {
    fontSize: moderateScale(14),
    color: "#1E40AF",
    marginLeft: 8,
    flex: 1,
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
    paddingBottom: 20,
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
  modalLabel: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
    fontSize: moderateScale(14),
    color: "#374151",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 100,
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#6B7280",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#6426A9",
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
