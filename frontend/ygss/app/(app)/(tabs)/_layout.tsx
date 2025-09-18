// app/(app)/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

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
        listeners={{ focus: () => router.replace("/(app)/(tabs)/home") }}

      />
      <Tabs.Screen
        name="dc"
        options={{
          tabBarLabel: "DC",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="compass-outline" size={size} color={focused ? "skyblue" : color} />
          ),
        }}
        listeners={{ focus: () => router.replace("/(app)/(tabs)/dc/dc1") }}

      />
      <Tabs.Screen
        name="irp"
        options={{
          tabBarLabel: "IRP",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="search" size={size} color={focused ? "skyblue" : color} />
          ),
        }}
        listeners={{ focus: () => router.replace("/(app)/(tabs)/irp") }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: "마이페이지",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="person" size={size} color={focused ? "skyblue" : color} />
          ),
        }}
        listeners={{ focus: () => router.replace("/(app)/(tabs)/mypage") }}

      />

      {/* ⛔️ 탭바에서 숨길 라우트들 */}
      <Tabs.Screen name="dc/index" options={{ href: null }} />
      <Tabs.Screen name="dc/dc1" options={{ href: null }} />
      <Tabs.Screen name="dc/dc2" options={{ href: null }} />
      <Tabs.Screen name="dc/dc3" options={{ href: null }} />
      <Tabs.Screen name="dc/dc4" options={{ href: null }} />

    </Tabs>
  );
}
