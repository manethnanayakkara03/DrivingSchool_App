import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassView } from '@/components/GlassView';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { authApi, setToken, setUser } from '@/services/api';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter email and password'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email.trim(), password);
      setToken(res.token);
      setUser(res.user);
      
      if (res.user.role === 'admin') {
        router.replace('/(tabs)/dashboard');
      } else if (res.user.role === 'instructor') {
        router.replace('/(instructor)/home');
      } else {
        router.replace('/(learner)/home');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMsg = err.message || 'Login failed. Please try again.';
      if (errorMsg.includes('fetch') || errorMsg.includes('Failed to fetch')) {
        setError('Cannot connect to server. Make sure backend is running on port 5000.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const buttonScale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const onPressIn = () => { buttonScale.value = withTiming(0.95, { duration: 100 }); };
  const onPressOut = () => { buttonScale.value = withTiming(1, { duration: 100 }); };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={[theme.primary + '20', theme.background, theme.background]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo Section */}
          <Animated.View entering={FadeInDown.duration(800).delay(200)} style={styles.logoSection}>
            <LinearGradient
              colors={[theme.primary, theme.secondary]}
              style={styles.logoGradient}
            >
              <Ionicons name="car-sport" size={40} color="#fff" />
            </LinearGradient>
            
            <ThemedText style={styles.title}>DriveEase</ThemedText>
            <ThemedText style={styles.subtitle}>Your journey to mastery starts here</ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(400)} style={styles.formSection}>
            <ThemedText style={styles.label}>Email Address</ThemedText>
            <GlassView 
              style={[styles.inputContainer, { backgroundColor: colorScheme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }]} 
              intensity={Platform.OS === 'ios' ? 20 : 0}
              contentStyle={styles.inputGlassContent}
            >
              <Ionicons name="mail-outline" size={20} color={theme.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="email@example.com"
                placeholderTextColor={theme.icon}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </GlassView>

            <ThemedText style={[styles.label, { marginTop: 20 }]}>Password</ThemedText>
            <GlassView 
              style={[styles.inputContainer, { backgroundColor: colorScheme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }]} 
              intensity={Platform.OS === 'ios' ? 20 : 0}
              contentStyle={styles.inputGlassContent}
            >
              <Ionicons name="lock-closed-outline" size={20} color={theme.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="••••••••"
                placeholderTextColor={theme.icon}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </GlassView>

            {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

            <TouchableOpacity 
              onPress={handleLogin}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={loading}
              activeOpacity={0.8}
              style={{ width: '100%' }}
            >
              <Animated.View style={[styles.loginButton, { backgroundColor: loading ? theme.primary + '99' : theme.primary }, animatedButtonStyle]}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <ThemedText style={styles.loginButtonText}>Sign In</ThemedText>
                      <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                    </>}
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>Don't have an account? </ThemedText>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <ThemedText style={[styles.footerLink, { color: theme.primary }]}>Register Now</ThemedText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoGradient: {
    width: 90,
    height: 90,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 8,
  },
  formSection: {
    width: '100%',
    maxWidth: 400,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    marginLeft: 4,
    opacity: 0.9,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 18,
    marginBottom: 4,
  },
  inputGlassContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    paddingHorizontal: 16,
    flex: 1,
    height: '100%',
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  loginButton: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 15,
    opacity: 0.6,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '700',
  },
});
