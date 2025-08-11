// src/navigation/RootNavigator.tsx
import React from "react";
import { Dimensions, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";
import SignUp from "../screens/SignUp";
import Dashboard from "../screens/Dashboard";
import ConfirmCode from "../ConfirmCode";
import FeaturesScreen from "../screens/Features";
import CommunityScreen from "../screens/Community";
import MapScreen from "../screens/Map";
import SettingsScreen from "../screens/Settings";
import ItemsScreen from '../screens/ItemsScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  SignUp: undefined;
  ConfirmCode: { username: string };
  Items: undefined;
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
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          paddingBottom: 8,
          paddingTop: 4,
          height: 65,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarItemStyle: {
          paddingHorizontal: 8,
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
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Auth"
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Auth Stack */}
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
        name="Items"
        component={ItemsScreen}
        options={{ title: 'Items' }}
      />
  
      {/* Main App Stack */}
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
