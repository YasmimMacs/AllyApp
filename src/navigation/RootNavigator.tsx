// src/navigation/RootNavigator.tsx
import React from "react";
import { Dimensions, TouchableOpacity, Platform, StatusBar, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../contexts/AuthContext";

import HomeScreen from "../screens/HomeScreen";
import SignUp from "../screens/SignUp";
import Dashboard from "../screens/Dashboard";
import ConfirmCode from "../ConfirmCode";
import FeaturesScreen from "../screens/Features";
import CommunityScreen from "../screens/Community";
import MapScreen from "../screens/Map";
import SettingsScreen from "../screens/Settings";
import ItemsScreen from '../screens/ItemsScreen';
import PasswordRecover from "../screens/PasswordRecover";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  SignUp: undefined;
  ConfirmCode: { username: string };
  Items: undefined;
  PasswordRecover: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Map: undefined;
  Community: undefined;
  Buddy: undefined;
  Toolkit: undefined;
  Settings: undefined;
};

// ─── helpers ─────────────────────────────────────────────────────────
const { width } = Dimensions.get("window");
const isTablet = width >= 768;
const scale = (s: number) => Math.round((width / 375) * s);

// ─── stack ───────────────────────────────────────────────────────────
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main Tab Navigator
function MainTabNavigator() {
  return (
    <View style={{ 
      flex: 1, 
      paddingBottom: Platform.OS === 'android' ? 72 : 0 
    }}>
      <Tab.Navigator
      screenOptions={({ route }) => ({
                 tabBarIcon: ({ focused, color, size }) => {
           let iconName: keyof typeof Ionicons.glyphMap;

           if (route.name === 'Home') {
             iconName = focused ? 'home' : 'home-outline';
           } else if (route.name === 'Map') {
             iconName = focused ? 'map' : 'map-outline';
           } else if (route.name === 'Community') {
             iconName = focused ? 'people' : 'people-outline';
           } else if (route.name === 'Buddy') {
             iconName = focused ? 'person' : 'person-outline';
           } else if (route.name === 'Toolkit') {
             iconName = focused ? 'briefcase' : 'briefcase-outline';
           } else if (route.name === 'Settings') {
             iconName = focused ? 'settings' : 'settings-outline';
           } else {
             iconName = 'help-outline';
           }

           return <Ionicons name={iconName} size={size} color={color} />;
         },
        tabBarActiveTintColor: '#6426A9',
        tabBarInactiveTintColor: '#8B8B8B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
                     borderTopWidth: 0,
                    paddingBottom: Platform.OS === 'android' ? 6 : 3,
          paddingTop: 0,
          height: Platform.OS === 'android' ? 44 : 40,
          
          elevation: Platform.OS === 'android' ? 12 : 8,
          position: 'absolute',
          bottom: Platform.OS === 'android' ? -20 : 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        },
                 tabBarLabelStyle: {
           fontSize: Platform.OS === 'android' ? 10 : 11,
           fontWeight: '500',
           marginTop: Platform.OS === 'android' ? -2 : 0,
         },
                 tabBarItemStyle: {
           paddingHorizontal: 8,
           paddingVertical: Platform.OS === 'android' ? 2 : 0,
           marginTop: Platform.OS === 'android' ? -4 : 0,
         },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={Dashboard}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityScreen}
      />
  
  
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
      />

          </Tab.Navigator>
    </View>
    );
  }

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return null; // You can create a proper loading component here
  }

  // Set status bar for Android
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(false);
      StatusBar.setBackgroundColor('#FFFFFF');
      StatusBar.setBarStyle('dark-content');
    }
  }, []);

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? "Main" : "Auth"}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Auth Stack - Only show when NOT authenticated */}
      {!isAuthenticated && (
        <>
          <Stack.Screen
            name="Auth"
            component={HomeScreen}
          />

          <Stack.Screen 
            name="SignUp" 
            component={SignUp} 
          />

          <Stack.Screen
            name="ConfirmCode"
            component={ConfirmCode}
            options={{ 
              title: "Verify Code",
              headerShown: true,
            }}
          />

          <Stack.Screen
            name="PasswordRecover"
            component={PasswordRecover}
            options={{ 
              headerShown: false,
            }}
          />
        </>
      )}

      <Stack.Screen
        name="Items"
        component={ItemsScreen}
        options={{ title: 'Items' }}
      />
  
      {/* Main App Stack - Only show when authenticated */}
      {isAuthenticated && (
        <Stack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{
            headerShown: false,
          }}
        />
      )}
    </Stack.Navigator>
  );
}
