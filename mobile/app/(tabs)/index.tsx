import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassView } from '@/components/GlassView';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LandingPage() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={[theme.primary + '20', 'transparent']}
          style={styles.heroGradient}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={[styles.logoIcon, { backgroundColor: theme.primary }]}>
                <Ionicons name="car-sport" size={20} color="#fff" />
              </View>
              <ThemedText style={styles.logoText}>Arampath</ThemedText>
            </View>
            <TouchableOpacity 
              style={styles.signInButton}
              onPress={() => router.push('/login')}
            >
              <ThemedText style={[styles.signInText, { color: theme.primary }]}>Sign In</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.heroContent}>
            <ThemedText style={styles.heroTitle}>
              Drive with {'\n'}
              <ThemedText style={[styles.heroTitle, { color: theme.primary }]}>Perfection.</ThemedText>
            </ThemedText>
            
            <ThemedText style={styles.heroDescription}>
              The most advanced driving school platform in the region. 
              Combining expert coaching with cutting-edge management tools.
            </ThemedText>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/(tabs)/explore')}
              >
                <ThemedText style={styles.buttonText}>Start Journey</ThemedText>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton}>
                <Ionicons name="play-circle-outline" size={24} color={theme.text} />
                <ThemedText style={[styles.secondaryButtonText, { color: theme.text }]}>Learn More</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Image / Card */}
          <GlassView style={styles.heroCard} intensity={40}>
            <Image
              source="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1000&auto=format&fit=crop"
              style={styles.heroImage}
              contentFit="cover"
            />
            <View style={styles.statsOverlay}>
              <GlassView style={styles.statBadge} intensity={80}>
                <ThemedText style={styles.statValue}>98%</ThemedText>
                <ThemedText style={styles.statLabel}>Success Rate</ThemedText>
              </GlassView>
            </View>
          </GlassView>
        </LinearGradient>

        {/* Why Choose Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Why Choose Arampath {'\n'}
            <ThemedText style={[styles.sectionTitle, { color: theme.secondary }]}>Driving School System?</ThemedText>
          </ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            We provide everything you need to become a confident, safe driver.
          </ThemedText>

          <View style={styles.featuresGrid}>
            <FeatureCard 
              icon="calendar" 
              title="Easy Booking" 
              desc="Book your lessons anytime through our online dashboard."
              theme={theme}
            />
            <FeatureCard 
              icon="people" 
              title="Expert Instructors" 
              desc="Learn from certified professionals with years of experience."
              theme={theme}
            />
            <FeatureCard 
              icon="shield-checkmark" 
              title="Safe Learning" 
              desc="Modern vehicles equipped with dual controls for your safety."
              theme={theme}
            />
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function FeatureCard({ icon, title, desc, theme }: any) {
  return (
    <GlassView style={styles.featureCard} intensity={20}>
      <View style={[styles.featureIconContainer, { backgroundColor: theme.primary + '15' }]}>
        <Ionicons name={icon} size={24} color={theme.primary} />
      </View>
      <ThemedText style={styles.featureTitle}>{title}</ThemedText>
      <ThemedText style={styles.featureDesc}>{desc}</ThemedText>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
  },
  signInButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  signInText: {
    fontWeight: '600',
  },
  heroContent: {
    marginBottom: 30,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 56,
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.7,
    marginBottom: 32,
    maxWidth: '90%',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  heroCard: {
    width: '100%',
    height: 250,
    marginTop: 20,
    padding: 0,
    marginBottom: -60, // Overlap with next section
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  statsOverlay: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  statBadge: {
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    opacity: 0.8,
    textTransform: 'uppercase',
  },
  section: {
    marginTop: 80,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
    marginBottom: 40,
  },
  featuresGrid: {
    gap: 20,
  },
  featureCard: {
    padding: 24,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.6,
  },
});
