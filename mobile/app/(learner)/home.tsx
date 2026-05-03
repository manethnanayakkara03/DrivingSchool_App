import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Dimensions, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassView } from '@/components/GlassView';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { learnerApi, getUser } from '@/services/api';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function LearnerHomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const user = getUser();

  const [loading, setLoading] = useState(true);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      const courses = await learnerApi.getMyCourses(user.id);
      setMyCourses(courses);
    } catch (err) {
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={[theme.secondary + '18', theme.background]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.secondary} />}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <Animated.View entering={FadeInDown.duration(700)} style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.accentBar, { backgroundColor: theme.secondary }]} />
              <View>
                <ThemedText style={styles.greetingText}>Good Day,</ThemedText>
                <ThemedText style={styles.userName}>{user?.name || 'Learner'}</ThemedText>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/(learner)/settings')}
              style={styles.avatarWrap}
            >
              <LinearGradient colors={[theme.secondary, theme.primary]} style={styles.avatarGradient}>
                <Ionicons name="person" size={24} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Stats Row ── */}
          <Animated.View entering={FadeInUp.delay(150).duration(700)} style={styles.statsRow}>
            <GlassView style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: theme.secondary + '20' }]}>
                <Ionicons name="car" size={22} color={theme.secondary} />
              </View>
              <ThemedText style={styles.statValue}>{myCourses.length}</ThemedText>
              <ThemedText style={styles.statLabel}>Enrolled</ThemedText>
            </GlassView>
            <GlassView style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="time" size={22} color="#10B981" />
              </View>
              <ThemedText style={styles.statValue}>--</ThemedText>
              <ThemedText style={styles.statLabel}>Next Class</ThemedText>
            </GlassView>
          </Animated.View>

          {/* ── Section Title ── */}
          <View style={styles.sectionRow}>
            <ThemedText style={styles.sectionTitle}>My Courses</ThemedText>
            <TouchableOpacity onPress={() => router.push('/(learner)/courses')}>
              <ThemedText style={[styles.seeAll, { color: theme.secondary }]}>Explore +</ThemedText>
            </TouchableOpacity>
          </View>

          {/* ── Course List ── */}
          {loading ? (
            <ActivityIndicator size="large" color={theme.secondary} style={{ marginTop: 40 }} />
          ) : myCourses.length > 0 ? (
            myCourses.map((enrollment, i) => (
              <Animated.View key={enrollment.id} entering={FadeInDown.delay(300 + i * 100)}>
                <GlassView style={styles.courseCard}>
                  <View style={styles.courseTop}>
                    <View style={[styles.courseIcon, { backgroundColor: theme.secondary + '18' }]}>
                      <Ionicons name="school" size={24} color={theme.secondary} />
                    </View>
                    <View style={styles.courseInfo}>
                      <ThemedText style={styles.courseName}>{enrollment.courseTitle}</ThemedText>
                      <View style={styles.statusRow}>
                        <View style={[styles.dot, {
                          backgroundColor: enrollment.status === 'completed' ? '#10B981' : theme.secondary
                        }]} />
                        <ThemedText style={styles.statusText}>{enrollment.status?.toUpperCase()}</ThemedText>
                      </View>
                    </View>
                  </View>

                  <View style={styles.progressWrap}>
                    <View style={styles.progressMeta}>
                      <ThemedText style={styles.progressLabel}>Completion</ThemedText>
                      <ThemedText style={[styles.progressPct, { color: theme.secondary }]}>
                        {enrollment.progress || 0}%
                      </ThemedText>
                    </View>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, {
                        width: `${enrollment.progress || 0}%`,
                        backgroundColor: theme.secondary
                      }]} />
                    </View>
                  </View>

                  {enrollment.paymentStatus === 'pending' && (
                    <TouchableOpacity
                      style={[styles.payBtn, { backgroundColor: theme.secondary }]}
                      onPress={() => router.push({
                        pathname: '/(learner)/payments',
                        params: { enrollmentId: enrollment.id }
                      })}
                    >
                      <ThemedText style={styles.payBtnText}>Settle Payment</ThemedText>
                      <Ionicons name="chevron-forward" size={16} color="#fff" />
                    </TouchableOpacity>
                  )}
                </GlassView>
              </Animated.View>
            ))
          ) : (
            <Animated.View entering={FadeInDown.delay(300)}>
              <GlassView style={styles.emptyBox}>
                <Ionicons name="map-outline" size={56} color={theme.icon} style={{ opacity: 0.25 }} />
                <ThemedText style={styles.emptyTitle}>Your Journey Awaits</ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  No courses enrolled yet. Start your driving journey today!
                </ThemedText>
                <TouchableOpacity
                  style={[styles.cta, { backgroundColor: theme.secondary }]}
                  onPress={() => router.push('/(learner)/courses')}
                >
                  <ThemedText style={styles.ctaText}>Browse Courses</ThemedText>
                </TouchableOpacity>
              </GlassView>
            </Animated.View>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accentBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  greetingText: { fontSize: 13, opacity: 0.5, fontWeight: '600', marginBottom: 2, letterSpacing: 0.3 },
  userName: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  avatarWrap: {
    width: 48, height: 48, borderRadius: 16, overflow: 'hidden',
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8,
  },
  avatarGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 22,
    alignItems: 'flex-start',
  },
  statIcon: {
    width: 40, height: 40, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 11, opacity: 0.45, fontWeight: '600', marginTop: 2 },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  seeAll: { fontSize: 13, fontWeight: '700' },

  courseCard: { padding: 20, borderRadius: 26, marginBottom: 18 },
  courseTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  courseIcon: {
    width: 50, height: 50, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  courseInfo: { flex: 1 },
  courseName: { fontSize: 17, fontWeight: '800' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: '800', opacity: 0.5, letterSpacing: 0.5 },
  progressWrap: { marginBottom: 6 },
  progressMeta: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8,
  },
  progressLabel: { fontSize: 12, opacity: 0.55 },
  progressPct: { fontSize: 13, fontWeight: '800' },
  progressTrack: {
    height: 9, borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.06)', overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  payBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 48, borderRadius: 14, marginTop: 14,
  },
  payBtnText: { color: '#fff', fontWeight: '800', marginRight: 6 },

  emptyBox: { padding: 40, borderRadius: 28, alignItems: 'center', marginTop: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '900', marginTop: 18, textAlign: 'center' },
  emptySubtext: {
    fontSize: 14, opacity: 0.55, textAlign: 'center',
    marginTop: 10, lineHeight: 21,
  },
  cta: {
    paddingHorizontal: 28, height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginTop: 26,
  },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
