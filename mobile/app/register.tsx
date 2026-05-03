import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassView } from '@/components/GlassView';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withTiming, FadeOut, FadeIn } from 'react-native-reanimated';
import { authApi, setToken, setUser } from '@/services/api';

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  const [step, setStep] = useState(1);
  
  // Step 1: Personal Info
  const [name, setName] = useState('');
  const [nic, setNic] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Step 2: Account Info
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const buttonScale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const onPressIn = () => { buttonScale.value = withTiming(0.95, { duration: 100 }); };
  const onPressOut = () => { buttonScale.value = withTiming(1, { duration: 100 }); };

  const handleNext = () => {
    if (!name || !nic || !phone || !address) {
      setError('Please fill in all personal details');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all account details');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const res = await authApi.register(name.trim(), email.trim(), password, {
        nic: nic.trim(),
        phone: phone.trim(),
        address: address.trim()
      });
      console.log('Registration successful:', res);
      setToken(res.token);
      setUser(res.user);
      Alert.alert('Success', 'Registration successful! Welcome to Arampath Driving School.', [
        { text: 'OK', onPress: () => router.replace('/(learner)/home') }
      ]);
    } catch (err: any) {
      console.error('Registration error detailed:', err);
      const msg = err.message || 'Registration failed';
      setError(msg);
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={[theme.secondary + '20', theme.background, theme.background]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => step === 2 ? setStep(1) : router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>

          {/* Logo Section */}
          <Animated.View entering={FadeInDown.duration(800).delay(200)} style={styles.logoSection}>
            <LinearGradient
              colors={[theme.secondary, theme.primary]}
              style={styles.logoGradient}
            >
              <Ionicons name={step === 1 ? "person-add" : "lock-closed"} size={40} color="#fff" />
            </LinearGradient>
            
            <ThemedText style={styles.title}>
              {step === 1 ? 'Personal Info' : 'Account Security'}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {step === 1 ? 'Step 1 of 2: Let us know you' : 'Step 2 of 2: Secure your account'}
            </ThemedText>
          </Animated.View>

          {/* Form Section */}
          <Animated.View 
            key={step} 
            entering={FadeIn.duration(400)} 
            exiting={FadeOut.duration(400)}
            style={styles.formSection}
          >
            {step === 1 ? (
              <>
                <ThemedText style={styles.label}>Full Name</ThemedText>
                <GlassView 
                  style={[styles.inputContainer, { backgroundColor: colorScheme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }]} 
                  intensity={Platform.OS === 'ios' ? 20 : 0}
                  contentStyle={styles.inputGlassContent}
                >
                  <Ionicons name="person-outline" size={20} color={theme.icon} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="John Doe"
                    placeholderTextColor={theme.icon}
                    value={name}
                    onChangeText={setName}
                  />
                </GlassView>

                <ThemedText style={[styles.label, { marginTop: 16 }]}>NIC Number</ThemedText>
                <GlassView 
                  style={[styles.inputContainer, { backgroundColor: colorScheme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }]} 
                  intensity={Platform.OS === 'ios' ? 20 : 0}
                  contentStyle={styles.inputGlassContent}
                >
                  <Ionicons name="card-outline" size={20} color={theme.icon} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="123456789V"
                    placeholderTextColor={theme.icon}
                    value={nic}
                    onChangeText={setNic}
                    autoCapitalize="characters"
                  />
                </GlassView>

                <ThemedText style={[styles.label, { marginTop: 16 }]}>Phone Number</ThemedText>
                <GlassView 
                  style={[styles.inputContainer, { backgroundColor: colorScheme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }]} 
                  intensity={Platform.OS === 'ios' ? 20 : 0}
                  contentStyle={styles.inputGlassContent}
                >
                  <Ionicons name="call-outline" size={20} color={theme.icon} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="071 234 5678"
                    placeholderTextColor={theme.icon}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </GlassView>

                <ThemedText style={[styles.label, { marginTop: 16 }]}>Home Address</ThemedText>
                <GlassView 
                  style={[styles.inputContainer, { backgroundColor: colorScheme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }]} 
                  intensity={Platform.OS === 'ios' ? 20 : 0}
                  contentStyle={styles.inputGlassContent}
                >
                  <Ionicons name="home-outline" size={20} color={theme.icon} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="No. 123, Street, City"
                    placeholderTextColor={theme.icon}
                    value={address}
                    onChangeText={setAddress}
                    multiline
                  />
                </GlassView>
              </>
            ) : (
              <>
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

                <ThemedText style={[styles.label, { marginTop: 16 }]}>Password</ThemedText>
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

                <ThemedText style={[styles.label, { marginTop: 16 }]}>Confirm Password</ThemedText>
                <GlassView 
                  style={[styles.inputContainer, { backgroundColor: colorScheme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }]} 
                  intensity={Platform.OS === 'ios' ? 20 : 0}
                  contentStyle={styles.inputGlassContent}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color={theme.icon} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="••••••••"
                    placeholderTextColor={theme.icon}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </GlassView>
              </>
            )}

            {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

            <TouchableOpacity 
              onPress={step === 1 ? handleNext : handleRegister}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={loading}
              activeOpacity={0.8}
              style={{ width: '100%', marginTop: 24 }}
            >
              <Animated.View style={[
                styles.registerButton, 
                { backgroundColor: loading ? theme.secondary + '99' : theme.secondary }, 
                animatedButtonStyle
              ]}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <ThemedText style={styles.registerButtonText}>
                      {step === 1 ? 'Next' : 'Register'}
                    </ThemedText>
                    <Ionicons 
                      name={step === 1 ? "arrow-forward" : "person-add-outline"} 
                      size={20} 
                      color="#fff" 
                      style={{ marginLeft: 8 }} 
                    />
                  </>
                )}
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>Already have an account? </ThemedText>
              <TouchableOpacity onPress={() => router.replace('/index')}>
                <ThemedText style={[styles.footerLink, { color: theme.secondary }]}>Sign In</ThemedText>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
    lineHeight: 46,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 4,
  },
  formSection: {
    width: '100%',
    maxWidth: 400,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
    opacity: 0.9,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
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
  registerButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
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
    marginTop: 24,
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
