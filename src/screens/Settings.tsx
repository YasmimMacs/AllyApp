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
  Alert,
  Switch,
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

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showLogout, setShowLogout] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    setShowLogout(false);
    navigation.navigate('Auth');
  };

  const handleProfilePhoto = () => {
    Alert.alert('Profile Photo', 'Upload new profile photo');
  };

  const handleEmergencyContacts = () => {
    Alert.alert('Emergency Contacts', 'Manage your emergency contacts');
  };

  const handlePrivacySettings = () => {
    Alert.alert('Privacy Settings', 'Configure your privacy preferences');
  };

  const handleSafetyPreferences = () => {
    Alert.alert('Safety Preferences', 'Customize your safety settings');
  };

  const handleHelpSupport = () => {
    Alert.alert('Help & Support', 'Get help and contact support');
  };

  const handleAboutApp = () => {
    Alert.alert('About Ally', 'Version 1.0.0\nYour trusted safety companion');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          
          {/* Profile Section */}
          <View style={styles.section}>
            
            <View style={styles.profileCard}>
              <Pressable style={styles.profilePhotoContainer} onPress={handleProfilePhoto}>
                <View style={styles.profilePhoto}>
                  <Ionicons name="person" size={40} color="#6426A9" />
                </View>
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </Pressable>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>Sarah Johnson</Text>
                <Text style={styles.profileEmail}>sarah.johnson@email.com</Text>
                <Pressable style={styles.editProfileButton}>
                  <Text style={styles.editProfileText}>Edit Profile</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Safety Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Safety Settings</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="location" size={24} color="#6426A9" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Location Sharing</Text>
                    <Text style={styles.settingSubtitle}>Share location with trusted contacts</Text>
                  </View>
                </View>
                <Switch
                  value={locationSharing}
                  onValueChange={setLocationSharing}
                  trackColor={{ false: '#E5E5E5', true: '#6426A9' }}
                  thumbColor={locationSharing ? '#fff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="notifications" size={24} color="#6426A9" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Push Notifications</Text>
                    <Text style={styles.settingSubtitle}>Receive safety alerts and updates</Text>
                  </View>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#E5E5E5', true: '#6426A9' }}
                  thumbColor={notifications ? '#fff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="alert-circle" size={24} color="#6426A9" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Emergency Alerts</Text>
                    <Text style={styles.settingSubtitle}>Get notified of nearby incidents</Text>
                  </View>
                </View>
                <Switch
                  value={emergencyAlerts}
                  onValueChange={setEmergencyAlerts}
                  trackColor={{ false: '#E5E5E5', true: '#6426A9' }}
                  thumbColor={emergencyAlerts ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsCard}>
              <Pressable style={styles.actionItem} onPress={handleEmergencyContacts}>
                <Ionicons name="people" size={24} color="#6426A9" />
                <Text style={styles.actionTitle}>Emergency Contacts</Text>
                <Ionicons name="chevron-forward" size={20} color="#8B8B8B" />
              </Pressable>

              <Pressable style={styles.actionItem} onPress={handlePrivacySettings}>
                <Ionicons name="shield-checkmark" size={24} color="#6426A9" />
                <Text style={styles.actionTitle}>Privacy Settings</Text>
                <Ionicons name="chevron-forward" size={20} color="#8B8B8B" />
              </Pressable>

              <Pressable style={styles.actionItem} onPress={handleSafetyPreferences}>
                <Ionicons name="settings" size={24} color="#6426A9" />
                <Text style={styles.actionTitle}>Safety Preferences</Text>
                <Ionicons name="chevron-forward" size={20} color="#8B8B8B" />
              </Pressable>
            </View>
          </View>

          {/* Support & About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support & About</Text>
            <View style={styles.supportCard}>
              <Pressable style={styles.actionItem} onPress={handleHelpSupport}>
                <Ionicons name="help-circle" size={24} color="#6426A9" />
                <Text style={styles.actionTitle}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={20} color="#8B8B8B" />
              </Pressable>

              <Pressable style={styles.actionItem} onPress={handleAboutApp}>
                <Ionicons name="information-circle" size={24} color="#6426A9" />
                <Text style={styles.actionTitle}>About Ally</Text>
                <Ionicons name="chevron-forward" size={20} color="#8B8B8B" />
              </Pressable>
            </View>
          </View>

          {/* Logout Section */}
          <View style={styles.section}>
            <Pressable style={styles.logoutButton} onPress={() => setShowLogout(true)}>
              <Ionicons name="log-out" size={24} color="#DC2626" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </Pressable>
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
                  <Pressable style={styles.confirmLogoutButton} onPress={handleLogout}>
                    <Text style={styles.confirmLogoutButtonText}>Sign Out</Text>
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
  header: {
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '600',
    color: '#6426A9',
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
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  profilePhotoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#6426A9',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6426A9',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  editProfileButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#6426A9',
  },
  editProfileText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
  },
  supportCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#DC2626',
    marginLeft: 8,
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
  confirmLogoutButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    marginLeft: 8,
  },
  confirmLogoutButtonText: {
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
  },
});
