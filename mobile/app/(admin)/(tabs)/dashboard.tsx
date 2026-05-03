import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Pressable, Text } from 'react-native';
import { router , useNavigation } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatCard } from '@/components/admin/StatCard';
import { GlassCard } from '@/components/admin/GlassCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { dashboardApi } from '@/services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerNavigationProp } from '@react-navigation/drawer';

const { height } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const OperationCard = ({ title, icon, color, route, delay, fullWidth }: any) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View 
      entering={FadeInDown.duration(600).delay(delay)} 
      style={[styles.opCardWrapper, fullWidth && { width: '100%' }]}
    >
      <AnimatedPressable
        style={[style, { flex: 1 }]}
        onPressIn={() => scale.value = withSpring(0.95)}
        onPressOut={() => scale.value = withSpring(1)}
        onPress={() => router.push(route)}
      >
        <GlassCard accentColor={color} borderRadius={16} contentStyle={styles.opCardContent}>
          <View style={[styles.opIconContainer, { backgroundColor: `${color}20` }]}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
          <Text style={[styles.opCardTitle, { color: theme.text }]}>{title}</Text>
        </GlassCard>
      </AnimatedPressable>
    </Animated.View>
  );
};

export default function AdminDashboard() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.stats()
      .then(setStats)
      .catch(() => setStats({ learners: 0, instructors: 0, vehicles: 0, bookings: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Hero Section */}
        <Animated.View entering={FadeInDown.duration(600)}>
          <LinearGradient
            colors={['#1E3A5F', '#0A0F1E']}
            style={[styles.hero, { paddingTop: insets.top + 20 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuIcon}>
                  <Ionicons name="menu" size={32} color="#FFFFFF" />
                </TouchableOpacity>
                <View>
                  <Text style={styles.heroTitle}>Admin Dashboard</Text>
                  <Text style={styles.heroDate}>{currentDate}</Text>
                </View>
              </View>
              <View style={styles.avatarBubble}>
                <Text style={styles.avatarText}>AD</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: 30 }} />
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsScrollContent}
            >
              <StatCard 
                title="Total Learners" 
                value={stats?.learners ?? 0} 
                iconName="people" 
                accentColor={theme.primary}
                trend="up"
                trendValue="+5%"
              />
              <StatCard 
                title="Active Instructors" 
                value={stats?.instructors ?? 0} 
                iconName="person-circle" 
                accentColor={theme.secondary}
              />
              <StatCard 
                title="Active Vehicles" 
                value={stats?.vehicles ?? 0} 
                iconName="car-sport" 
                accentColor={theme.success}
              />
              <StatCard 
                title="Pending Bookings" 
                value={stats?.bookings ?? 0} 
                iconName="calendar" 
                accentColor="#F59E0B"
                trend="down"
              />
            </ScrollView>
          )}
        </Animated.View>

        {/* Operations Grid */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Operations</Text>
        </Animated.View>
        <View style={styles.operationsGrid}>
          <OperationCard title="Learners" icon="people" color={theme.primary} route="/(admin)/learners" delay={300} />
          <OperationCard title="Instructors" icon="school" color={theme.success} route="/(admin)/instructors" delay={350} />
          <OperationCard title="Vehicles" icon="car-sport" color="#F59E0B" route="/(admin)/vehicles" delay={400} />
          <OperationCard title="Maintenance" icon="build" color="#EF4444" route="/(admin)/(tabs)/maintenance" delay={450} />
          <OperationCard title="Bookings" icon="calendar" color={theme.secondary} route="/(admin)/(tabs)/bookings" delay={500} />
          <OperationCard title="Payments" icon="card" color={theme.primary} route="/(admin)/(tabs)/payments" delay={550} />
          <OperationCard title="Courses" icon="book" color={theme.success} route="/(admin)/courses" delay={600} fullWidth />
        </View>

        {/* Recent Activity Feed */}
        <Animated.View entering={FadeInDown.duration(600).delay(700)} style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(800)}>
          {[1, 2, 3].map((item, index) => (
            <GlassCard key={index} borderRadius={12} contentStyle={styles.activityCardContent} style={{ marginBottom: 8 }}>
              <View style={[styles.activityIcon, { backgroundColor: `${theme.primary}20` }]}>
                <Ionicons name="calendar-outline" size={20} color={theme.primary} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={[styles.activityTitle, { color: theme.text }]}>New Booking Request</Text>
                <Text style={[styles.activityTime, { color: theme.muted }]}>2 hours ago • Kamal Perera</Text>
              </View>
              <StatusBadge status="Pending" />
            </GlassCard>
          ))}
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  hero: {
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIcon: {
    marginRight: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  avatarBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  statsScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  operationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  opCardWrapper: {
    width: '48%',
  },
  opCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  opIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  opCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  activityCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderWidth: 0,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '500',
  },
});
