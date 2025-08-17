import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocationPermissionStatus } from '../hooks/useLocationPermission';

interface LocationPermissionBannerProps {
  status: LocationPermissionStatus;
  onRequestPermission: () => Promise<void>;
  onOpenSettings: () => Promise<void>;
  isLoading?: boolean;
}

export const LocationPermissionBanner: React.FC<LocationPermissionBannerProps> = ({
  status,
  onRequestPermission,
  onOpenSettings,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6426A9" />
          <Text style={styles.loadingText}>Checking location permissions...</Text>
        </View>
      </View>
    );
  }

  if (status === 'granted') {
    return null; // Don't show banner when permission is granted
  }

  const getBannerContent = () => {
    switch (status) {
      case 'denied':
        return {
          icon: 'location-outline',
          title: 'Location Permission Needed',
          message: 'We need your permission to access location and show safety info for your area.',
          buttonText: 'Allow Location',
          buttonAction: onRequestPermission,
          backgroundColor: '#FEF3C7',
          borderColor: '#F59E0B',
          iconColor: '#F59E0B',
        };
      
      case 'blocked':
        return {
          icon: 'settings-outline',
          title: 'Location Access Turned Off',
          message: 'Location access is turned off in Settings. Please enable it to use safety features.',
          buttonText: 'Open Settings',
          buttonAction: onOpenSettings,
          backgroundColor: '#FEE2E2',
          borderColor: '#EF4444',
          iconColor: '#EF4444',
        };
      
      case 'unavailable':
        return {
          icon: 'warning-outline',
          title: 'Location Unavailable',
          message: 'Location services are not available on this device.',
          buttonText: 'Try Again',
          buttonAction: onRequestPermission,
          backgroundColor: '#F3F4F6',
          borderColor: '#6B7280',
          iconColor: '#6B7280',
        };
      
      default:
        return null;
    }
  };

  const content = getBannerContent();
  if (!content) return null;

  return (
    <View style={[styles.container, { backgroundColor: content.backgroundColor, borderColor: content.borderColor }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={content.icon as any} size={24} color={content.iconColor} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: content.borderColor }]}>
            {content.title}
          </Text>
          <Text style={styles.message}>
            {content.message}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: content.borderColor }]}
          onPress={content.buttonAction}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {content.buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
