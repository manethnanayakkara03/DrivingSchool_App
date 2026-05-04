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
import { instructorApi, getUser } from '@/services/api';
import { router } from 'expo-router';

export default function InstructorHomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const user = getUser();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (!user?.name) { 
      console.warn('⚠️ No user name found for instructor');
      setLoading(false); 
      return; 
    }
    try {
      console.log('📡 Fetching data for instructor:', user.name);
      const [coursesData, studentsData] = await Promise.all([
        instructorApi.getMyCourses(user.name),
        instructorApi.getMyStudents(user.name)
      ]);
      setCourses(coursesData);
      setStudents(studentsData);
    } catch (err) {
      console.error('Fetch instructor data error:', err);
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
        colors={[theme.primary + '18', theme.background]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(700)} style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.accentBar, { backgroundColor: theme.primary }]} />
              <View>
                <ThemedText style={styles.greetingText}>Welcome Back,</ThemedText>
                <ThemedText style={styles.userName}>{user?.name || 'Instructor'}</ThemedText>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/(instructor)/settings')}
              style={styles.avatarWrap}
            >
              <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.avatarGradient}>
                <Ionicons name="person" size={24} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Stats Row */}
          <Animated.View entering={FadeInUp.delay(150).duration(700)} style={styles.statsRow}>
            <GlassView style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="people" size={22} color={theme.primary} />
              </View>
              <ThemedText style={styles.statValue}>{students.length}</ThemedText>
              <ThemedText style={styles.statLabel}>Total Students</ThemedText>
            </GlassView>
            <GlassView style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="book" size={22} color="#10B981" />
              </View>
              <ThemedText style={styles.statValue}>{courses.length}</ThemedText>
              <ThemedText style={styles.statLabel}>Active Courses</ThemedText>
            </GlassView>
          </Animated.View>

          {/* Assigned Courses Section */}
          <View style={styles.sectionRow}>
            <ThemedText style={styles.sectionTitle}>My Courses</ThemedText>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
          ) : courses.length > 0 ? (
            courses.map((course, i) => {
              const courseStudents = students.filter(s => s.courseTitle === course.title);
              const completedCount = courseStudents.filter(s => s.status === 'completed').length;
              const progress = courseStudents.length > 0 ? (completedCount / courseStudents.length) * 100 : 0;

              return (
                <Animated.View key={course._id || i} entering={FadeInDown.delay(300 + i * 100)}>
                  <GlassView style={styles.courseCard}>
                    <View style={styles.courseTop}>
                      <View style={[styles.courseIcon, { backgroundColor: theme.primary + '18' }]}>
                        <Ionicons name="school" size={24} color={theme.primary} />
                      </View>
                      <View style={styles.courseInfo}>
                        <ThemedText style={styles.courseName}>{course.title}</ThemedText>
                        <ThemedText style={styles.statusText}>{courseStudents.length} Students Enrolled</ThemedText>
                      </View>
                    </View>

                    <View style={styles.progressWrap}>
                      <View style={styles.progressMeta}>
                        <ThemedText style={styles.progressLabel}>Overall Completion</ThemedText>
                        <ThemedText style={[styles.progressPct, { color: theme.primary }]}>
                          {Math.round(progress)}%
                        </ThemedText>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, {
                          width: `${progress}%`,
                          backgroundColor: theme.primary
                        }]} />
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.manageBtn, { backgroundColor: theme.primary }]}
                      onPress={() => router.push('/(instructor)/students')}
                    >
                      <ThemedText style={styles.manageBtnText}>Manage Students</ThemedText>
                      <Ionicons name="chevron-forward" size={16} color="#fff" />
                    </TouchableOpacity>
                  </GlassView>
                </Animated.View>
              );
            })
          ) : (
            <GlassView style={styles.emptyBox}>
              <Ionicons name="document-text-outline" size={56} color={theme.icon} style={{ opacity: 0.25 }} />
              <ThemedText style={styles.emptyTitle}>No Courses Assigned</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                You haven't been assigned to any courses yet. Please contact the administrator.
              </ThemedText>
            </GlassView>
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
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  accentBar: { width: 4, height: 40, borderRadius: 2, marginRight: 12 },
  greetingText: { fontSize: 13, opacity: 0.5, fontWeight: '600', marginBottom: 2, letterSpacing: 0.3 },
  userName: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  avatarWrap: {
    width: 48, height: 48, borderRadius: 16, overflow: 'hidden',
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8,
  },
  avatarGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 12 },
  statCard: { flex: 1, padding: 16, borderRadius: 22, alignItems: 'flex-start' },
  statIcon: { width: 40, height: 40, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 11, opacity: 0.45, fontWeight: '600', marginTop: 2 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  courseCard: { padding: 20, borderRadius: 26, marginBottom: 18 },
  courseTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  courseIcon: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  courseInfo: { flex: 1 },
  courseName: { fontSize: 17, fontWeight: '800' },
  statusText: { fontSize: 12, opacity: 0.5, marginTop: 2 },
  progressWrap: { marginBottom: 6 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 12, opacity: 0.55 },
  progressPct: { fontSize: 13, fontWeight: '800' },
  progressTrack: { height: 9, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  manageBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 14, marginTop: 14 },
  manageBtnText: { color: '#fff', fontWeight: '800', marginRight: 6 },
  emptyBox: { padding: 40, borderRadius: 28, alignItems: 'center', marginTop: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '900', marginTop: 18, textAlign: 'center' },
  emptySubtext: { fontSize: 14, opacity: 0.55, textAlign: 'center', marginTop: 10, lineHeight: 21 },
});
