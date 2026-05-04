import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassView } from '@/components/GlassView';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { learnerApi, getUser, setUser, clearToken, clearUser } from '@/services/api';
import { router } from 'expo-router';


// ── Sub-component for Input Fields ──
// Defined outside to prevent re-creation on every render (which causes focus loss)
const Field = ({
  label, value, onChange, icon, placeholder, theme, colorScheme, error, keyboard = 'default'
}: {
  label: string; value: string; onChange: (t: string) => void;
  icon: any; placeholder: string; theme: any; colorScheme: string; error?: string; keyboard?: any;
}) => (
  <View style={styles.fieldWrap}>
    <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
    <View style={[
      styles.fieldBox, 
      { 
        borderColor: error ? '#EF4444' : theme.secondary + '30', 
        backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' 
      }
    ]}>
      <Ionicons name={icon} size={18} color={error ? '#EF4444' : theme.icon} style={styles.fieldIcon} />
      <TextInput
        style={[styles.fieldInput, { color: theme.text }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.icon + '70'}
        keyboardType={keyboard}
      />
    </View>
    {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
  </View>
);

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const user = getUser();

  const [name, setName]       = useState(user?.name    || '');
  const [nic, setNic]         = useState(user?.nic     || '');
  const [phone, setPhone]     = useState(user?.phone   || '');
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const validate = (field: string, val: string) => {
    let err = '';
    if (field === 'name') {
      if (!val.trim()) err = 'Name is required';
      else if (val.length < 3) err = 'Name must be at least 3 characters';
    }
    if (field === 'nic') {
      const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
      if (!val.trim()) err = 'NIC is required';
      else if (!nicRegex.test(val)) err = 'Invalid NIC format (9 digits + V/X or 12 digits)';
    }
    if (field === 'phone') {
      const phoneRegex = /^0[0-9]{9}$/;
      if (!val.trim()) err = 'Phone number is required';
      else if (!phoneRegex.test(val)) err = 'Invalid phone number (must be 10 digits starting with 0)';
    }
    if (field === 'address') {
      if (!val.trim()) err = 'Address is required';
    }

    setErrors(prev => ({ ...prev, [field]: err }));
    return !err;
  };

  const handleUpdate = async () => {
    const isNameValid = validate('name', name);
    const isNicValid = validate('nic', nic);
    const isPhoneValid = validate('phone', phone);
    const isAddressValid = validate('address', address);

    if (!isNameValid || !isNicValid || !isPhoneValid || !isAddressValid) {
      Alert.alert('Validation Error', 'Please correct the errors before saving.');
      return;
    }

    if (!user?.id) return;
    setLoading(true);
    try {
      const updated = await learnerApi.updateProfile(user.id, { name, nic, phone, address });
      setUser(updated);
      Alert.alert('Saved!', 'Your profile has been updated.');
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: () => { clearToken(); clearUser(); router.replace('/'); }
      }
    ]);
  };

  const hasErrors = Object.values(errors).some(e => e !== '') || !name || !nic || !phone || !address;

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={[theme.secondary + '18', theme.background]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* ── Header ── */}
            <Animated.View entering={FadeInDown.duration(700)} style={styles.header}>
              <View style={styles.headerRow}>
                <View style={[styles.headerIconBox, { backgroundColor: theme.secondary + '18' }]}>
                  <Ionicons name="settings" size={22} color={theme.secondary} />
                </View>
                <View style={styles.headerTextBlock}>
                  <ThemedText style={styles.title}>Profile</ThemedText>
                  <ThemedText style={styles.subtitle}>Manage your personal and account details</ThemedText>
                </View>
              </View>
              <View style={[styles.headerDivider, { backgroundColor: theme.secondary + '20' }]} />
            </Animated.View>

            {/* ── Avatar Block ── */}
            <Animated.View entering={FadeInDown.delay(100).duration(700)} style={styles.avatarBlock}>
              <LinearGradient colors={[theme.secondary, theme.primary]} style={styles.avatarCircle}>
                <Ionicons name="person" size={38} color="#fff" />
              </LinearGradient>
              <View style={styles.avatarInfo}>
                <ThemedText style={styles.avatarName}>{user?.name || 'Learner'}</ThemedText>
                <View style={styles.rolePill}>
                  <ThemedText style={styles.rolePillText}>LEARNER</ThemedText>
                </View>
              </View>
            </Animated.View>

            {/* ── Personal Details ── */}
            <Animated.View entering={FadeInDown.delay(200).duration(700)}>
              <View style={styles.sectionHead}>
                <Ionicons name="person-circle-outline" size={20} color={theme.secondary} />
                <ThemedText style={styles.sectionTitle}>Personal Details</ThemedText>
              </View>

              <Field 
                label="Full Name" 
                value={name} 
                onChange={(t) => { setName(t); validate('name', t); }} 
                icon="person-outline" 
                placeholder="John Doe" 
                theme={theme} 
                colorScheme={colorScheme} 
                error={errors.name}
              />
              <Field 
                label="NIC Number" 
                value={nic} 
                onChange={(t) => { setNic(t); validate('nic', t); }} 
                icon="card-outline" 
                placeholder="123456789V" 
                theme={theme} 
                colorScheme={colorScheme} 
                error={errors.nic}
              />
              <Field 
                label="Phone" 
                value={phone} 
                onChange={(t) => { setPhone(t); validate('phone', t); }} 
                icon="call-outline" 
                placeholder="071 234 5678" 
                keyboard="phone-pad" 
                theme={theme} 
                colorScheme={colorScheme} 
                error={errors.phone}
              />
              <Field 
                label="Home Address" 
                value={address} 
                onChange={(t) => { setAddress(t); validate('address', t); }} 
                icon="home-outline" 
                placeholder="123 Main St, Colombo" 
                theme={theme} 
                colorScheme={colorScheme} 
                error={errors.address}
              />
            </Animated.View>

            {/* ── Account ── */}
            <Animated.View entering={FadeInDown.delay(300).duration(700)}>
              <View style={styles.sectionHead}>
                <Ionicons name="mail-outline" size={20} color={theme.secondary} />
                <ThemedText style={styles.sectionTitle}>Account</ThemedText>
              </View>

              <View style={styles.readOnly}>
                <ThemedText style={styles.readOnlyLabel}>Email Address</ThemedText>
                <ThemedText style={styles.readOnlyValue}>{user?.email}</ThemedText>
                <ThemedText style={styles.readOnlyHint}>Email address cannot be changed.</ThemedText>
              </View>
            </Animated.View>

            {/* ── Actions ── */}
            <Animated.View entering={FadeInDown.delay(400).duration(700)}>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: hasErrors ? theme.muted : theme.secondary }]}
                onPress={handleUpdate}
                disabled={loading || hasErrors}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <ThemedText style={styles.saveBtnText}>Save Changes</ThemedText>
                      <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
                    </>
                }
              </TouchableOpacity>

              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <ThemedText style={styles.logoutText}>Sign Out</ThemedText>
              </TouchableOpacity>
            </Animated.View>

            <View style={{ height: 110 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },

  header: { marginBottom: 22, paddingTop: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerIconBox: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  headerTextBlock: { flex: 1 },
  headerDivider: { height: 2, borderRadius: 1, marginTop: 16 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, opacity: 0.5, marginTop: 3, lineHeight: 18 },

  avatarBlock: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 28, paddingBottom: 22,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
  },
  avatarInfo: { marginLeft: 16 },
  avatarName: { fontSize: 19, fontWeight: '900' },
  rolePill: {
    backgroundColor: 'rgba(139,92,246,0.12)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, marginTop: 5,
  },
  rolePillText: { fontSize: 11, fontWeight: '800', color: '#8B5CF6', letterSpacing: 0.5 },

  sectionHead: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginLeft: 8 },

  fieldWrap: { marginBottom: 18 },
  fieldLabel: { fontSize: 13, fontWeight: '700', opacity: 0.7, marginBottom: 8, marginLeft: 2 },
  fieldBox: {
    flexDirection: 'row', alignItems: 'center',
    height: 56, borderRadius: 16,
    borderWidth: 1.5, paddingHorizontal: 16,
  },
  fieldIcon: { marginRight: 12 },
  fieldInput: { flex: 1, fontSize: 15, fontWeight: '600' },
  errorText: { color: '#EF4444', fontSize: 11, marginTop: 4, marginLeft: 4, fontWeight: '600' },

  readOnly: {
    padding: 18, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginBottom: 36,
  },
  readOnlyLabel: { fontSize: 12, opacity: 0.5, fontWeight: '700', marginBottom: 4 },
  readOnlyValue: { fontSize: 16, fontWeight: '700', opacity: 0.6 },
  readOnlyHint: { fontSize: 11, opacity: 0.35, marginTop: 6, fontStyle: 'italic' },

  saveBtn: {
    height: 56, borderRadius: 18,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, elevation: 4,
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 52, borderRadius: 16,
    borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.2)',
  },
  logoutText: { color: '#EF4444', fontWeight: '700', marginLeft: 10 },
});
