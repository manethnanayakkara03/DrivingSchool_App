import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/haptic-tab';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DrawerToggleButton } from '@react-navigation/drawer';

export default function AdminTabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.icon,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: theme.card, // Dark tab bar (#111827)
          borderTopWidth: 1,
          borderTopColor: theme.glassBorder,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        }
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          headerShown: false,
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="grid" color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="maintenance"
        options={{
          title: 'Maintenance',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="build" color={color} />,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="card" color={color} />,
        }}
      />
    </Tabs>
  );
}
