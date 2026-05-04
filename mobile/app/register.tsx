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

  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    nic: '',
    phone: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validateField = (field: string, value: string) => {
    let errorMsg = '';
    switch (field) {
      case 'name':
        if (!value) errorMsg = 'Full name is required';
        else if (value.trim().length < 3) errorMsg = 'Name must be at least 3 characters';
        break;
      case 'nic':
        const nicRegexOld = /^[0-9]{9}[vVxX]$/;
        const nicRegexNew = /^[0-9]{12}$/;
        if (!value) errorMsg = 'NIC number is required';
        else if (!nicRegexOld.test(value) && !nicRegexNew.test(value)) errorMsg = 'Invalid NIC format (9 digits + V/X or 12 digits)';
        break;
      case 'phone':
        const phoneRegex = /^0[0-9]{9}$/;
        if (!value) errorMsg = 'Phone number is required';
        else if (!phoneRegex.test(value)) errorMsg = 'Invalid phone number (e.g. 07XXXXXXXX)';
        break;
      case 'address':
        if (!value) errorMsg = 'Address is required';
        else if (value.trim().length < 5) errorMsg = 'Address is too short';
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) errorMsg = 'Email is required';
        else if (!emailRegex.test(value)) errorMsg = 'Invalid email address';
        break;
      case 'password':
        if (!value) errorMsg = 'Password is required';
        else if (value.length < 8) errorMsg = 'Password must be at least 8 characters';
        break;
      case 'confirmPassword':
        if (!value) errorMsg = 'Please confirm your password';
        else if (value !== password) errorMsg = 'Passwords do not match';
        break;
    }
    setFieldErrors(prev => ({ ...prev, [field]: errorMsg }));
    return errorMsg;
  };

  const isStep1Valid = name && nic && phone && address && 
    !fieldErrors.name && !fieldErrors.nic && !fieldErrors.phone && !fieldErrors.address;
  
  const isStep2Valid = email && password && confirmPassword && 
    !fieldErrors.email && !fieldErrors.password && !fieldErrors.confirmPassword;

  const buttonScale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const onPressIn = () => { buttonScale.value = withTiming(0.95, { duration: 100 }); };
  const onPressOut = () => { buttonScale.value = withTiming(1, { duration: 100 }); };

  const handleNext = () => {
    const nameErr = validateField('name', name);
    const nicErr = validateField('nic', nic);
    const phoneErr = validateField('phone', phone);
    const addressErr = validateField('address', address);

    if (nameErr || nicErr || phoneErr || addressErr) {
      setError('Please fix the errors before continuing');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleRegister = async () => {
    const emailErr = validateField('email', email);
    const passwordErr = validateField('password', password);
    const confirmErr = validateField('confirmPassword', confirmPassword);

    if (emailErr || passwordErr || confirmErr) {
      setError('Please fix the errors before registering');
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
                  contentStyle={[styles.inputGlassContent, fieldErrors.name ? { borderColor: '#EF4444' } : {}]}
                >
                  <Ionicons name="person-outline" size={20} color={fieldErrors.name ? '#EF4444' : theme.icon} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="John Doe"
                    placeholderTextColor={theme.icon}
                    value={name}
                    onChangeText={(val) => {
                      setName(val);
                      validateField('name', val);
                    }}
                  />
                </GlassView>
                {fieldErrors.name ? <ThemedText style={styles.fieldErrorText}>{fieldErrors.name}</ThemedText> : null}

                <ThemedText style={[styles.label, { marginTop: 16 }]}>NIC Number</ThemedText>
                <GlassView 
                  style={[styles.inputContainer, { backgroundColor: colorScheme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }]} 
                  intensity={Platform.OS === 'ios' ? 20 : 0}
                  contentStyle={[styles.inputGlassContent, fieldErrors.nic ? { borderColor: '#EF4444' } : {}]}
                >
                  <Ionicons name="card-outline" size={20} color={fieldErrors.nic ? '#EF4444' : theme.icon} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="123456789V"
                    placeholderTextColor={theme.icon}
                    value={nic}
                    onChangeText={(val) => {
                      setNic(val);
                      validateField('nic', val);
                    }}
                    autoCapitalize="characters"
                  />
                </GlassView>
                {fieldErrors.nic ? <ThemedText style={styles.fieldErrorText}>{fieldErrors.nic}</ThemedText> : null}

                <ThemedText style={[styles.label, { marginTop: 16 }]}>Phone Number</ThemedText>
                <GlassView 
                  style={[styles.inputContainer, { backgroundColor: colorScheme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }]} 
                  intensity={Platform.OS === 'ios' ? 20 : 0}
                  contentStyle={[styles.inputGlassContent, fieldErrors.phone ? { borderColor: '#EF4444' } : {}]}
                >
                  <Ionicons name="call-outline" size={20} color={fieldErrors.phone ? '#EF4444' : theme.icon} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="071 234 5678"
                    placeholderTextColor={theme.icon}
                    value={phone}
                    onChangeText={(val) => {
                      setPhone(val);
                      validateField('phone', val);
                    }}
                    keyboardType="phone-pad"
                  />
                </GlassView>
                {fieldErrors.phone ? <ThemedText style={styles.fieldErrorText}>{fieldErrors.phone}</ThemedText> : null}

                <ThemedText style={[styles.label, { marginTop: 16 }]}>Home Address</ThemedText>
                <GlassView 
                  style={[styles.inputContainer, { backgroundColor: colorScheme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }]} 
                  intensity={Platform.OS === 'ios' ? 20 : 0}
                  contentStyle={[styles.inputGlassContent, fieldErrors.address ? { borderColor: '#EF4444' } : {}]}
                >
                  <Ionicons name="home-outline" size={20} color={fieldErrors.address ? '#EF4444' : theme.icon} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="No. 123, Street, City"
                    placeholderTextColor={theme.icon}
                    value={address}
                    onChangeText={(val) => {
                      setAddress(val);
                      validateField('address', val);
                    }}
                    multiline
                  />
                </GlassView>
                {fieldErrors.address ? <ThemedText style={styles.fieldErrorText}>{fieldErrors.address}</ThemedText> : null}
              </>
            ) : (
              <>
                <ThemedText style={styles.label}>Email Address</ThemedText>
                <GlassView 
                  style={[styles.inputContainer, { backgroundColor: colorScheme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }]} 
                  intensity={Platform.OS === 'ios' ? 20 : 0}
                  contentStyle={[styles.inputGlassContent, fieldErrors.email ? { borderColor: '#EF4444' } : {}]}
                >
                  <Ionicons name="mail-outline" size={20} color={fieldErrors.email ? '#EF4444' : theme.icon} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="email@example.com"
                    placeholderTextColor={theme.icon}
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      validateField('email', val);
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </GlassView>
                {fieldErrors.email ? <ThemedText style={styles.fieldErrorText}>{fieldErrors.email}</ThemedText> : null}

                <ThemedText style={[styles.label, { marginTop: 16 }]}>Password</ThemedText>
                <GlassView 
                  style={[styles.inputContainer, { backgroundColor: colorScheme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }]} 
                  intensity={Platform.OS === 'ios' ? 20 : 0}
                  contentStyle={[styles.inputGlassContent, fieldErrors.password ? { borderColor: '#EF4444' } : {}]}
                >
                  <Ionicons name="lock-closed-outline" size={20} color={fieldErrors.password ? '#EF4444' : theme.icon} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="••••••••"
                    placeholderTextColor={theme.icon}
                    value={password}
                    onChangeText={(val) => {
                      setPassword(val);
                      validateField('password', val);
                    }}
                    secureTextEntry
                  />
                </GlassView>
                {fieldErrors.password ? <ThemedText style={styles.fieldErrorText}>{fieldErrors.password}</ThemedText> : null}

                <ThemedText style={[styles.label, { marginTop: 16 }]}>Confirm Password</ThemedText>
                <GlassView 
                  style={[styles.inputContainer, { backgroundColor: colorScheme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }]} 
                  intensity={Platform.OS === 'ios' ? 20 : 0}
                  contentStyle={[styles.inputGlassContent, fieldErrors.confirmPassword ? { borderColor: '#EF4444' } : {}]}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color={fieldErrors.confirmPassword ? '#EF4444' : theme.icon} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="••••••••"
                    placeholderTextColor={theme.icon}
                    value={confirmPassword}
                    onChangeText={(val) => {
                      setConfirmPassword(val);
                      validateField('confirmPassword', val);
                    }}
                    secureTextEntry
                  />
                </GlassView>
                {fieldErrors.confirmPassword ? <ThemedText style={styles.fieldErrorText}>{fieldErrors.confirmPassword}</ThemedText> : null}
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
                { backgroundColor: (loading || (step === 1 ? !isStep1Valid : !isStep2Valid)) ? theme.secondary + '66' : theme.secondary }, 
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
  fieldErrorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
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
