import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Linking, Alert } from 'react-native';

const LOCATION_KEY = 'location.lastKnown';

export interface StoredLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

/**
 * Request location permission with clear rationale
 * @returns Promise<boolean> - true if permission granted, false otherwise
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status === 'granted') {
      return true;
    } else {
      // Show friendly alert with option to open settings
      Alert.alert(
        'Location Permission Required',
        'To share your location, we need access to your device location. Please enable location access in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => Linking.openSettings() 
          }
        ]
      );
      return false;
    }
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

/**
 * Get current location and store it
 * @returns Promise with coordinates or null if failed
 */
export const getAndStoreCurrentLocation = async (): Promise<{ lat: number; lng: number } | null> => {
  try {
    // Check permission first
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return null;
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5000,
      distanceInterval: 10,
    });

    const coordinates = {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };

    // Store location with timestamp
    const locationData: StoredLocation = {
      ...coordinates,
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(locationData));
    
    return coordinates;
  } catch (error) {
    console.error('Error getting current location:', error);
    Alert.alert(
      'Location Error',
      'Unable to get your current location. Please check your GPS settings and try again.'
    );
    return null;
  }
};

/**
 * Load last known location from storage
 * @returns Promise with stored location or null if none exists
 */
export const loadLastKnownLocation = async (): Promise<{ lat: number; lng: number } | null> => {
  try {
    const storedLocation = await AsyncStorage.getItem(LOCATION_KEY);
    if (storedLocation) {
      const locationData: StoredLocation = JSON.parse(storedLocation);
      return {
        lat: locationData.lat,
        lng: locationData.lng,
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading last known location:', error);
    return null;
  }
};

/**
 * Clear stored location data
 */
export const clearStoredLocation = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(LOCATION_KEY);
  } catch (error) {
    console.error('Error clearing stored location:', error);
    throw new Error('Failed to clear stored location');
  }
};

/**
 * Share location via maps link
 * @param lat - Latitude coordinate
 * @param lng - Longitude coordinate
 */
export const shareLocation = async (lat: number, lng: number): Promise<void> => {
  try {
    const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
    const message = `My current location: ${mapsUrl}`;
    
    // Use Share API if available, otherwise open maps directly
    const canOpen = await Linking.canOpenURL(mapsUrl);
    if (canOpen) {
      await Linking.openURL(mapsUrl);
    } else {
      Alert.alert('Error', 'Unable to open maps application');
    }
  } catch (error) {
    console.error('Error sharing location:', error);
    Alert.alert('Error', 'Unable to share location');
  }
};
