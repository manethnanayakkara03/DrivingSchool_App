import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Switch, Image } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '@/components/admin/SectionHeader';
import { GlassCard } from '@/components/admin/GlassCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { clearToken, clearUser } from '@/services/api';
import { Alert } from 'react-native';

export default function AdminSettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();

  // Settings State
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');
  const [biometrics, setBiometrics] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: () => {
            clearToken();
            clearUser();
            router.replace('/');
          }
        }
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, value, onValueChange, type = 'chevron', color = theme.primary }: any) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={() => type === 'chevron' && console.log(`Navigating to ${title}`)}
    >
      <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: theme.muted }]}>{subtitle}</Text>}
      </View>
      {type === 'switch' ? (
        <Switch 
          value={value} 
          onValueChange={onValueChange}
          trackColor={{ false: '#767577', true: theme.primary }}
          thumbColor={value ? '#FFF' : '#f4f3f4'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={theme.icon} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerPadding}>
        <SectionHeader 
          title="Settings" 
          subtitle="Configure system and profile"
          showMenuButton={true}
          onMenuPress={() => navigation.openDrawer()}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.avatarGlow}>
            <View style={[styles.avatarContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.avatarText, { color: theme.primary }]}>AD</Text>
            </View>
          </LinearGradient>
          <View style={styles.profileInfo}>
            <Text style={[styles.adminName, { color: theme.text }]}>Admin User</Text>
            <Text style={[styles.adminRole, { color: theme.muted }]}>Super Administrator</Text>
          </View>
          <TouchableOpacity style={[styles.editProfileBtn, { borderColor: theme.glassBorder }]}>
            <Text style={[styles.editProfileText, { color: theme.primary }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* System Preferences */}
        <Text style={[styles.sectionLabel, { color: theme.muted }]}>PREFERENCES</Text>
        <GlassCard borderRadius={20} contentStyle={styles.glassContent}>
          <SettingItem 
            icon="notifications-outline" 
            title="Push Notifications" 
            subtitle="Get alerts for new bookings"
            type="switch"
            value={notifications}
            onValueChange={setNotifications}
            color="#3B82F6"
          />
          <View style={[styles.divider, { backgroundColor: theme.glassBorder }]} />
          <SettingItem 
            icon="moon-outline" 
            title="Dark Mode" 
            subtitle="Toggle appearance theme"
            type="switch"
            value={darkMode}
            onValueChange={setDarkMode}
            color="#A855F7"
          />
          <View style={[styles.divider, { backgroundColor: theme.glassBorder }]} />
          <SettingItem 
            icon="finger-print-outline" 
            title="Biometric Login" 
            subtitle="Secure access with FaceID"
            type="switch"
            value={biometrics}
            onValueChange={setBiometrics}
            color="#10B981"
          />
        </GlassCard>

        {/* School Configuration */}
        <Text style={[styles.sectionLabel, { color: theme.muted }]}>SCHOOL SETUP</Text>
        <GlassCard borderRadius={20} contentStyle={styles.glassContent}>
          <SettingItem 
            icon="business-outline" 
            title="School Profile" 
            subtitle="Name, address, and registration"
            color="#F59E0B"
          />
          <View style={[styles.divider, { backgroundColor: theme.glassBorder }]} />
          <SettingItem 
            icon="time-outline" 
            title="Working Hours" 
            subtitle="Define school operational times"
            color="#06B6D4"
          />
          <View style={[styles.divider, { backgroundColor: theme.glassBorder }]} />
          <SettingItem 
            icon="wallet-outline" 
            title="Payment Gateways" 
            subtitle="Manage Stripe and bank settings"
            color="#10B981"
          />
        </GlassCard>

        {/* Support & Legal */}
        <Text style={[styles.sectionLabel, { color: theme.muted }]}>ABOUT</Text>
        <GlassCard borderRadius={20} contentStyle={styles.glassContent}>
          <SettingItem icon="help-circle-outline" title="Help Center" color="#64748B" />
          <View style={[styles.divider, { backgroundColor: theme.glassBorder }]} />
          <SettingItem icon="shield-checkmark-outline" title="Privacy Policy" color="#64748B" />
          <View style={[styles.divider, { backgroundColor: theme.glassBorder }]} />
          <SettingItem icon="information-circle-outline" title="Version" subtitle="2.1.0-build.admin" color="#64748B" type="none" />
        </GlassCard>

        {/* Danger Zone */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out Account</Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerPadding: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatarGlow: {
    width: 90,
    height: 90,
    borderRadius: 45,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  adminName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  adminRole: {
    fontSize: 14,
    fontWeight: '600',
  },
  editProfileBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  editProfileText: {
    fontWeight: '700',
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 12,
    marginLeft: 4,
  },
  glassContent: {
    padding: 8,
    borderWidth: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginHorizontal: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

