import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassView } from '@/components/GlassView';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [schoolName, setSchoolName] = useState('Arampath Driving School');
  const [email, setEmail] = useState('contact@arampath.com');
  const [logo, setLogo] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setLogo(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    Alert.alert('Success', 'Settings updated successfully!');
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Settings',
        headerTransparent: true,
        headerBlurEffect: colorScheme,
      }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.pageTitle}>System Settings</ThemedText>
        
        <GlassView style={styles.section} intensity={15}>
          <ThemedText style={styles.sectionTitle}>School Information</ThemedText>
          
          <TouchableOpacity style={styles.logoPicker} onPress={pickLogo}>
            {logo ? (
              <Image source={{ uri: logo }} style={styles.logoImage} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="business" size={40} color={theme.primary} />
                <ThemedText style={{ fontSize: 12, marginTop: 8 }}>Upload Logo</ThemedText>
              </View>
            )}
          </TouchableOpacity>

          <SettingField label="Driving School Name" value={schoolName} onChange={setSchoolName} theme={theme} />
          <SettingField label="Contact Email" value={email} onChange={setEmail} theme={theme} />
        </GlassView>

        <GlassView style={[styles.section, { marginTop: 20 }]} intensity={15}>
          <ThemedText style={styles.sectionTitle}>App Preferences</ThemedText>
          
          <View style={styles.switchRow}>
            <ThemedText style={styles.settingLabel}>Push Notifications</ThemedText>
            <Switch 
              value={notifications} 
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: theme.primary }}
            />
          </View>

          <View style={[styles.switchRow, { marginTop: 20 }]}>
            <ThemedText style={styles.settingLabel}>Dark Mode (Auto)</ThemedText>
            <Switch value={true} disabled />
          </View>
        </GlassView>

        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSave}
        >
          <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

function SettingField({ label, value, onChange, theme }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <ThemedText style={styles.settingLabel}>{label}</ThemedText>
      <TextInput
        style={[styles.input, { color: theme.text, borderColor: theme.glassBorder }]}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 120,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 30,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    color: '#8B5CF6',
  },
  logoPicker: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
