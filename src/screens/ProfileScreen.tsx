import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfilePhoto } from '../hooks/useProfilePhoto';

const { width: screenWidth } = Dimensions.get('window');
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

export default function ProfileScreen() {
  const { photoUri, loading, pickFromLibrary, takePhoto } = useProfilePhoto();

  const showImagePickerOptions = () => {
    Alert.alert(
      'Profile Photo',
      'Choose how you want to add a profile photo',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickFromLibrary },
      ]
    );
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
              <Pressable 
                style={styles.profilePhotoContainer} 
                onPress={showImagePickerOptions}
                disabled={loading}
                testID="avatar-image"
              >
                {photoUri ? (
                  <Image 
                    source={{ uri: photoUri }} 
                    style={styles.profilePhoto}
                    testID="avatar-image"
                  />
                ) : (
                  <View style={styles.profilePhotoPlaceholder}>
                    <Ionicons name="person" size={40} color="#6426A9" />
                  </View>
                )}
                <View style={styles.cameraIcon}>
                  <Ionicons 
                    name="camera" 
                    size={16} 
                    color="#fff" 
                    testID="avatar-camera-button"
                  />
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

          {/* Profile Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Details</Text>
            <View style={styles.detailsCard}>
              <View style={styles.detailItem}>
                <Ionicons name="call" size={24} color="#6426A9" />
                <View style={styles.detailText}>
                  <Text style={styles.detailTitle}>Phone</Text>
                  <Text style={styles.detailValue}>+1 (555) 123-4567</Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="location" size={24} color="#6426A9" />
                <View style={styles.detailText}>
                  <Text style={styles.detailTitle}>Location</Text>
                  <Text style={styles.detailValue}>New York, NY</Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="calendar" size={24} color="#6426A9" />
                <View style={styles.detailText}>
                  <Text style={styles.detailTitle}>Member Since</Text>
                  <Text style={styles.detailValue}>January 2024</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Emergency Contacts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <View style={styles.contactsCard}>
              <Pressable style={styles.contactItem}>
                <View style={styles.contactAvatar}>
                  <Ionicons name="person" size={24} color="#6426A9" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>John Doe</Text>
                  <Text style={styles.contactRelation}>Spouse</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8B8B8B" />
              </Pressable>
              
              <Pressable style={styles.contactItem}>
                <View style={styles.contactAvatar}>
                  <Ionicons name="person" size={24} color="#6426A9" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>Jane Smith</Text>
                  <Text style={styles.contactRelation}>Sister</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8B8B8B" />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
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
    borderWidth: 3,
    borderColor: '#6426A9',
  },
  profilePhotoPlaceholder: {
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
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailText: {
    marginLeft: 12,
    flex: 1,
  },
  detailTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  contactsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    marginLeft: 12,
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  contactRelation: {
    fontSize: 14,
    color: '#6B7280',
  },
});
