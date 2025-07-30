// src/navigation/RootNavigator.tsx
import React from 'react';
import { Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen   from '../../HomeScreen';
import SignUp       from '../../SignUp';
import Dashboard    from '../../Dashboard';
import ConfirmCode  from '../ConfirmCode';


export type RootStackParamList = {
  Home:         undefined;
  SignUp:       undefined;            
  Dashboard:    undefined;
  ConfirmCode:  { username: string };
};

// ─── helpers ─────────────────────────────────────────────────────────
const { width } = Dimensions.get('window');
const isTablet  = width >= 768;
const scale     = (s: number) => Math.round((width / 375) * s);

// ─── stack ───────────────────────────────────────────────────────────
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle:  { backgroundColor: '#6426A9' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold', fontSize: scale(18) },
      }}
    >
      {/* Home ------------------------------------------------ */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: '',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Dashboard')}
              style={{
                marginRight: isTablet ? 24 : 16,
                padding:     isTablet ? scale(8) : 12,
                justifyContent: 'center',
                alignItems:     'center',
                minWidth:  44,
                minHeight: 44,
              }}
            >
              <Ionicons name="home" size={isTablet ? 32 : 28} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />

      {/* Sign‑up -------------------------------------------- */}
      <Stack.Screen name="SignUp"      component={SignUp}      options={{ title: '' }} />

      {/* Dashboard ------------------------------------------ */}
      <Stack.Screen name="Dashboard"   component={Dashboard}   options={{ title: '' }} />

      {/* Confirm code --------------------------------------- */}
      <Stack.Screen name="ConfirmCode" component={ConfirmCode} options={{ title: '' }} />
    </Stack.Navigator>
  );
}
