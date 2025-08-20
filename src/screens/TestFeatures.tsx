import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  saveProfilePhoto, 
  loadProfilePhoto, 
  clearProfilePhoto 
} from '../storage/profile';
import { 
  requestLocationPermission, 
  getAndStoreCurrentLocation, 
  loadLastKnownLocation,
  clearStoredLocation,
  shareLocation 
} from '../storage/location';

export default function TestFeatures() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testProfilePhoto = async () => {
    try {
      addResult('Testing profile photo functionality...');
      
      // Test saving
      const testUri = 'https://via.placeholder.com/150';
      await saveProfilePhoto(testUri);
      addResult('✅ Profile photo saved successfully');
      
      // Test loading
      const loadedUri = await loadProfilePhoto();
      if (loadedUri === testUri) {
        addResult('✅ Profile photo loaded successfully');
      } else {
        addResult('❌ Profile photo loading failed');
      }
      
      // Test clearing
      await clearProfilePhoto();
      const clearedUri = await loadProfilePhoto();
      if (clearedUri === null) {
        addResult('✅ Profile photo cleared successfully');
      } else {
        addResult('❌ Profile photo clearing failed');
      }
      
    } catch (error) {
      addResult(`❌ Profile photo test failed: ${error}`);
    }
  };

  const testLocationFeatures = async () => {
    try {
      addResult('Testing location features...');
      
      // Test permission request
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        addResult('✅ Location permission granted');
        
        // Test getting and storing location
        const location = await getAndStoreCurrentLocation();
        if (location) {
          addResult(`✅ Location stored: ${location.lat}, ${location.lng}`);
          
          // Test loading stored location
          const storedLocation = await loadLastKnownLocation();
          if (storedLocation) {
            addResult('✅ Stored location loaded successfully');
          } else {
            addResult('❌ Stored location loading failed');
          }
          
          // Test sharing location
          try {
            await shareLocation(location.lat, location.lng);
            addResult('✅ Location sharing test completed');
          } catch (shareError) {
            addResult(`⚠️ Location sharing test: ${shareError}`);
          }
          
        } else {
          addResult('❌ Failed to get current location');
        }
      } else {
        addResult('⚠️ Location permission denied');
      }
      
    } catch (error) {
      addResult(`❌ Location test failed: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runAllTests = async () => {
    setTestResults([]);
    addResult('Starting all tests...');
    
    await testProfilePhoto();
    await testLocationFeatures();
    
    addResult('All tests completed!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Feature Test Suite</Text>
          <Text style={styles.subtitle}>Test Profile Photo & Location Features</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable style={styles.testButton} onPress={runAllTests}>
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.buttonText}>Run All Tests</Text>
          </Pressable>
          
          <Pressable style={styles.testButton} onPress={testProfilePhoto}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.buttonText}>Test Profile Photo</Text>
          </Pressable>
          
          <Pressable style={styles.testButton} onPress={testLocationFeatures}>
            <Ionicons name="location" size={20} color="#fff" />
            <Text style={styles.buttonText}>Test Location</Text>
          </Pressable>
          
          <Pressable style={styles.clearButton} onPress={clearResults}>
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.buttonText}>Clear Results</Text>
          </Pressable>
        </View>

        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          {testResults.length === 0 ? (
            <Text style={styles.noResults}>No tests run yet. Tap a test button above.</Text>
          ) : (
            testResults.map((result, index) => (
              <Text key={index} style={styles.resultText}>
                {result}
              </Text>
            ))
          )}
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  testButton: {
    backgroundColor: '#6426A9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  clearButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  noResults: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  resultText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
});
