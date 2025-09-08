import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "홈",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="home" size={size} color={focused ? "skyblue" : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dc"
        options={{
          tabBarLabel: "DC",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="compass-outline" size={size} color={focused ? "skyblue" : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="irp"
        options={{
          tabBarLabel: "IRP",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="search" size={size} color={focused ? "skyblue" : color} />
          ),
        }} />
      <Tabs.Screen
        name="mypage"
        options={{
          tabBarLabel: "마이페이지",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="person" size={size} color={focused ? "skyblue" : color} />
          ),
        }} />
    </Tabs>
  );
}
