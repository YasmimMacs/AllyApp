import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  saveProfilePhoto, 
  loadProfilePhoto, 
  clearProfilePhoto 
} from '../storage/profile';
import { 
  requestLocationPermission, 
  getAndStoreCurrentLocation, 
  shareLocation 
} from '../storage/location';

/**
 * Example component demonstrating the new features
 * This is for reference and testing purposes
 */
export function FeatureExamples() {
  const handleProfilePhotoExample = async () => {
    try {
      // Example: Save a profile photo
      const exampleUri = 'https://example.com/photo.jpg';
      await saveProfilePhoto(exampleUri);
      Alert.alert('Success', 'Profile photo saved successfully!');
      
      // Example: Load the profile photo
      const loadedUri = await loadProfilePhoto();
      if (loadedUri) {
        Alert.alert('Loaded Photo', `Photo URI: ${loadedUri}`);
      }
      
      // Example: Clear the profile photo
      await clearProfilePhoto();
      Alert.alert('Cleared', 'Profile photo cleared successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to handle profile photo example');
    }
  };

  const handleLocationExample = async () => {
    try {
      // Example: Request location permission
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        Alert.alert('Permission Granted', 'Location permission granted!');
        
        // Example: Get and store current location
        const location = await getAndStoreCurrentLocation();
        if (location) {
          Alert.alert('Location Stored', `Lat: ${location.lat}, Lng: ${location.lng}`);
          
          // Example: Share location
          await shareLocation(location.lat, location.lng);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to handle location example');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feature Examples</Text>
      
      <View style={styles.exampleSection}>
        <Text style={styles.sectionTitle}>Profile Photo Features</Text>
        <View style={styles.exampleItem}>
          <Ionicons name="camera" size={24} color="#6426A9" />
          <Text style={styles.exampleText}>Profile photo storage and retrieval</Text>
        </View>
        <Text style={styles.exampleDescription}>
          Demonstrates saving, loading, and clearing profile photos using AsyncStorage.
          Photos persist across app sessions and provide fallback to placeholder icons.
        </Text>
      </View>

      <View style={styles.exampleSection}>
        <Text style={styles.sectionTitle}>Location Sharing Features</Text>
        <View style={styles.exampleItem}>
          <Ionicons name="location" size={24} color="#6426A9" />
          <Text style={styles.exampleText}>Location permission and sharing</Text>
        </View>
        <Text style={styles.exampleDescription}>
          Shows location permission handling, current location retrieval, and
          sharing via Google Maps integration. All data stored locally for privacy.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.exampleButton} onTouchEnd={handleProfilePhotoExample}>
          <Text style={styles.buttonText}>Test Profile Photo</Text>
        </View>
        
        <View style={styles.exampleButton} onTouchEnd={handleLocationExample}>
          <Text style={styles.buttonText}>Test Location</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  exampleSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8,
  },
  exampleDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  exampleButton: {
    backgroundColor: '#6426A9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
