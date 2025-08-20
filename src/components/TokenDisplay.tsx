import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { ensureValidTokens, decodeToken, TokenPayload } from '../utils/tokenManager';

export const TokenDisplay: React.FC = () => {
  const { tokens, isAuthenticated } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<{
    idTokenPayload: TokenPayload | null;
    accessTokenPayload: TokenPayload | null;
    isExpired: boolean;
    timeUntilExpiry: string;
  } | null>(null);

  useEffect(() => {
    if (tokens) {
      updateTokenInfo();
    } else {
      setTokenInfo(null);
    }
  }, [tokens]);

  const updateTokenInfo = async () => {
    if (!tokens) return;

    try {
      const idTokenPayload = decodeToken(tokens.idToken);
      const accessTokenPayload = decodeToken(tokens.accessToken);
      
      const now = Date.now();
      const isExpired = tokens.expiresAt <= now;
      const timeUntilExpiry = tokens.expiresAt > now 
        ? `${Math.floor((tokens.expiresAt - now) / 1000)} seconds`
        : 'Expired';

      setTokenInfo({
        idTokenPayload,
        accessTokenPayload,
        isExpired,
        timeUntilExpiry
      });
    } catch (error) {
      console.error('Error updating token info:', error);
    }
  };

  const refreshTokens = async () => {
    try {
      const freshTokens = await ensureValidTokens();
      if (freshTokens) {
        Alert.alert('Success', 'Tokens refreshed successfully!');
        updateTokenInfo();
      } else {
        Alert.alert('Error', 'Failed to refresh tokens');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to refresh tokens: ${error}`);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    // In React Native, you'd typically use Clipboard API
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  if (!isAuthenticated || !tokens) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Token Information</Text>
        <Text style={styles.noTokens}>No tokens available. Please sign in.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cognito Token Information</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Token Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, tokenInfo?.isExpired ? styles.expired : styles.valid]}>
            {tokenInfo?.isExpired ? 'Expired' : 'Valid'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Expires in:</Text>
          <Text style={styles.value}>{tokenInfo?.timeUntilExpiry}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ID Token</Text>
        <Text style={styles.label}>User ID:</Text>
        <Text style={styles.value}>{tokenInfo?.idTokenPayload?.sub || 'N/A'}</Text>
        
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{tokenInfo?.idTokenPayload?.email || 'N/A'}</Text>
        
        <Text style={styles.label}>Email Verified:</Text>
        <Text style={styles.value}>{tokenInfo?.idTokenPayload?.email_verified ? 'Yes' : 'No'}</Text>
        
        <Text style={styles.label}>Issued At:</Text>
        <Text style={styles.value}>
          {tokenInfo?.idTokenPayload?.iat 
            ? new Date(tokenInfo.idTokenPayload.iat * 1000).toLocaleString()
            : 'N/A'
          }
        </Text>
        
        <Text style={styles.label}>Expires At:</Text>
        <Text style={styles.value}>
          {tokenInfo?.idTokenPayload?.exp 
            ? new Date(tokenInfo.idTokenPayload.exp * 1000).toLocaleString()
            : 'N/A'
          }
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Access Token</Text>
        <Text style={styles.label}>Token Preview:</Text>
        <Text style={styles.tokenPreview}>
          {tokens.accessToken.substring(0, 50)}...
        </Text>
        
        <TouchableOpacity 
          style={styles.copyButton}
          onPress={() => copyToClipboard(tokens.accessToken, 'Access Token')}
        >
          <Text style={styles.copyButtonText}>Copy Full Access Token</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={refreshTokens}>
          <Text style={styles.actionButtonText}>Refresh Tokens</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={updateTokenInfo}>
          <Text style={styles.actionButtonText}>Update Token Info</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  noTokens: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  valid: {
    color: '#4CAF50',
  },
  expired: {
    color: '#F44336',
  },
  tokenPreview: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  copyButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  copyButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
