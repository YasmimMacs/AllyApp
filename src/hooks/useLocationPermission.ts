import { useState, useEffect, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as Location from 'expo-location';

export type LocationPermissionStatus = 
  | 'unavailable'
  | 'denied'
  | 'blocked'
  | 'granted'
  | 'limited';

export interface LocationPermissionResult {
  status: LocationPermissionStatus;
  requestPermission: () => Promise<void>;
  openSettings: () => Promise<void>;
  isLoading: boolean;
}

export const useLocationPermission = (): LocationPermissionResult => {
  const [status, setStatus] = useState<LocationPermissionStatus>('unavailable');
  const [isLoading, setIsLoading] = useState(true);

  // Check current permission status
  const checkPermissionStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const permission = await Location.getForegroundPermissionsAsync();
      
      if (permission.granted) {
        setStatus('granted');
      } else if (permission.canAskAgain === false) {
        setStatus('blocked');
      } else if (permission.status === 'denied') {
        setStatus('denied');
      } else {
        setStatus('unavailable');
      }
    } catch (error) {
      console.error('Error in checkPermissionStatus:', error);
      setStatus('unavailable');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const permission = await Location.requestForegroundPermissionsAsync();
      
      if (permission.granted) {
        setStatus('granted');
      } else if (permission.canAskAgain === false) {
        setStatus('blocked');
      } else {
        setStatus('denied');
      }
    } catch (error) {
      console.error('Error in requestPermission:', error);
      setStatus('denied');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Open device settings
  const openSettings = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('Error opening settings:', error);
      Alert.alert(
        'Settings',
        'Please open your device settings and enable location permissions for this app.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  // Check permission status on mount
  useEffect(() => {
    checkPermissionStatus();
  }, [checkPermissionStatus]);

  return {
    status,
    requestPermission,
    openSettings,
    isLoading,
  };
};
