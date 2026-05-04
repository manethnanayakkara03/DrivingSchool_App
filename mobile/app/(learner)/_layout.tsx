import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LearnerLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].secondary,
        headerShown: false,
        tabBarButton: HapticTab,
        // Tell the navigator NOT to consume safe area insets itself
        // so each screen's own SafeAreaView handles the top spacing.
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}
      // Prevent the Tab navigator from consuming top insets on all platforms
      safeAreaInsets={{ top: 0 }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'All Courses',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="car" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-courses"
        options={{
          title: 'My Courses',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="wallet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}
