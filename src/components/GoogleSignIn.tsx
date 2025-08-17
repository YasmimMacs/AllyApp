import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signInWithRedirect } from 'aws-amplify/auth';
import { useAuth } from '../contexts/AuthContext';

interface GoogleSignInProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const GoogleSignIn: React.FC<GoogleSignInProps> = ({ onSuccess, onError }) => {
  const { signIn } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      // For now, this will use the federated sign-in with Google
      // You'll need to configure Google OAuth in your AWS Cognito User Pool
      await signInWithRedirect({ provider: 'Google' });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert('Sign In Error', 'Failed to sign in with Google. Please try again.');
      
      if (onError) {
        onError(error as Error);
      }
    }
  };

  return (
    <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
      <Ionicons name="logo-google" size={24} color="#FFFFFF" />
      <Text style={styles.googleButtonText}>Continue with Google</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
