import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CustomDrawerContent(props: any) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <DrawerContentScrollView 
      {...props} 
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      <View style={styles.drawerHeader}>
        <LinearGradient
          colors={[theme.primary, theme.secondary]}
          style={styles.avatarContainer}
        >
          <Text style={styles.avatarText}>AD</Text>
        </LinearGradient>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.text }]}>Admin User</Text>
          <View style={[styles.roleBadge, { backgroundColor: `${theme.primary}20` }]}>
            <Text style={[styles.roleText, { color: theme.primary }]}>Super Admin</Text>
          </View>
        </View>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function AdminDrawerLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerActiveBackgroundColor: theme.primary + '20',
          drawerActiveTintColor: theme.primary,
          drawerInactiveTintColor: theme.icon,
          drawerStyle: {
            backgroundColor: theme.background,
            width: 280,
          },
          drawerLabelStyle: {
            fontSize: 16,
            fontWeight: '600',
            marginLeft: -10,
          },
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            drawerLabel: 'Dashboard',
            title: 'Dashboard',
            drawerIcon: ({ color }) => <Ionicons name="grid" size={24} color={color} />,
          }}
        />
        <Drawer.Screen
          name="learners"
          options={{
            drawerLabel: 'Learners',
            title: 'Manage Learners',
            drawerIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />,
          }}
        />
        <Drawer.Screen
          name="instructors"
          options={{
            drawerLabel: 'Instructors',
            title: 'Manage Instructors',
            drawerIcon: ({ color }) => <Ionicons name="school" size={24} color={color} />,
          }}
        />
        <Drawer.Screen
          name="vehicles"
          options={{
            drawerLabel: 'Vehicles',
            title: 'Manage Vehicles',
            drawerIcon: ({ color }) => <Ionicons name="car-sport" size={24} color={color} />,
          }}
        />
        <Drawer.Screen
          name="courses"
          options={{
            drawerLabel: 'Courses',
            title: 'Manage Courses',
            drawerIcon: ({ color }) => <Ionicons name="book" size={24} color={color} />,
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: 'Settings',
            title: 'Admin Settings',
            drawerIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginBottom: 10,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
