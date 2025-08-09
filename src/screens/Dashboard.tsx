import React, { useState } from 'react';
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
  Modal, 
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
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

export default function Dashboard() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    setShowLogout(false);
    navigation.navigate('Auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.welcomeSubtext}>Your safety journey continues</Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <Pressable 
                style={styles.actionCard}
                onPress={() => alert('Share Location feature coming soon!')}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="location" size={24} color="#6426A9" />
                </View>
                <Text style={styles.actionTitle}>Share Location</Text>
                <Text style={styles.actionSubtitle}>Let friends know where you are</Text>
              </Pressable>
              
              <Pressable style={styles.actionCard}>
                <View style={styles.actionIcon}>
                  <Ionicons name="shield-checkmark" size={24} color="#6426A9" />
                </View>
                <Text style={styles.actionTitle}>Safety Check</Text>
                <Text style={styles.actionSubtitle}>Verify your surroundings</Text>
              </Pressable>
              
              <Pressable style={styles.actionCard}>
                <View style={styles.actionIcon}>
                  <Ionicons name="people" size={24} color="#6426A9" />
                </View>
                <Text style={styles.actionTitle}>Buddy System</Text>
                <Text style={styles.actionSubtitle}>Connect with travel buddies</Text>
              </Pressable>
              
              <Pressable style={styles.actionCard}>
                <View style={styles.actionIcon}>
                  <Ionicons name="alert-circle" size={24} color="#6426A9" />
                </View>
                <Text style={styles.actionTitle}>Emergency</Text>
                <Text style={styles.actionSubtitle}>Quick emergency access</Text>
              </Pressable>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Safety check completed</Text>
                  <Text style={styles.activityTime}>2 hours ago</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="location" size={20} color="#3B82F6" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Location shared with Sarah</Text>
                  <Text style={styles.activityTime}>4 hours ago</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="people" size={20} color="#8B5CF6" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Connected with travel buddy</Text>
                  <Text style={styles.activityTime}>Yesterday</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Safety Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Safety Tip of the Day</Text>
            <View style={styles.tipCard}>
              <Ionicons name="bulb" size={24} color="#F59E0B" style={styles.tipIcon} />
              <Text style={styles.tipText}>
                Always share your location with trusted contacts when traveling alone, 
                especially at night or in unfamiliar areas.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <Modal
        visible={showLogout}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogout(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowLogout(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.logoutBox}>
                <Text style={styles.logoutTitle}>Sign Out</Text>
                <Text style={styles.logoutMessage}>Are you sure you want to sign out?</Text>
                <View style={styles.logoutButtons}>
                  <Pressable style={styles.cancelButton} onPress={() => setShowLogout(false)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Sign Out</Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: isTablet ? 24 : 16,
    paddingVertical: 20,
  },
  welcomeSection: {
    marginBottom: 32,
    paddingTop: 16,
  },
  welcomeText: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: '700',
    color: '#6426A9',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: isTablet ? 18 : 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoutBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  logoutMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  logoutButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  logoutButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#6426A9',
    marginLeft: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
  },
});
