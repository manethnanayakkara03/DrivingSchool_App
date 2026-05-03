import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function InstructorLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].secondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}
      safeAreaInsets={{ top: 0 }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="grid" color={color} />,
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: 'Students',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="people" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
