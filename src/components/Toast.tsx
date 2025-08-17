import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToastProps {
  message: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  duration?: number;
  onClose?: () => void;
  visible: boolean;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 4000,
  onClose,
  visible,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Slide in and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case 'error':
        return { backgroundColor: '#FEE2E2', borderColor: '#EF4444' };
      case 'warning':
        return { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' };
      case 'success':
        return { backgroundColor: '#D1FAE5', borderColor: '#10B981' };
      default:
        return { backgroundColor: '#E0E7FF', borderColor: '#6366F1' };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'success':
        return 'checkmark-circle';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'success':
        return '#10B981';
      default:
        return '#6366F1';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getToastStyle(),
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={getIcon() as any} size={20} color={getIconColor()} />
        <Text style={[styles.message, { color: getIconColor() }]}>
          {message}
        </Text>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={getIconColor()} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
});
