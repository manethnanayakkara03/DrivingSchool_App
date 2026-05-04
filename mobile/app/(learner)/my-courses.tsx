import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Dimensions, Alert
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
import { learnerApi, getUser } from '@/services/api';

const { width } = Dimensions.get('window');

export default function MyCoursesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const user = getUser();

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('active'); // 'active' or 'completed'

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    if (!user?.id) return;
    try {
      const data = await learnerApi.getMyCourses(user.id);
      setCourses(data);
    } catch (err) {
      console.error('Fetch my courses error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyCourses();
  };

  const handleCancel = (id: string, title: string) => {
    Alert.alert(
      'Cancel Course',
      `Are you sure you want to cancel your enrollment in "${title}"? This will also remove any scheduled sessions.`,
      [
        { text: 'No, Keep it', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await learnerApi.cancelEnrollment(id);
              Alert.alert('Success', 'Enrollment cancelled successfully.');
              fetchMyCourses();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel enrollment');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return '#10B981'; // Green
      case 'in-progress': return '#3B82F6'; // Blue
      case 'completed': return '#8B5CF6'; // Purple
      case 'pending_approval': return '#F59E0B'; // Amber
      default: return theme.icon;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'enrolled': return 'Enrolled';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'pending_approval': return 'Pending Approval';
      default: return status;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={[theme.secondary + '18', theme.background]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.secondary} />
          }
        >

          {/* ── Header ── */}
          <Animated.View entering={FadeInDown.duration(700)} style={styles.header}>
            <View style={styles.headerRow}>
              <View style={[styles.headerIconBox, { backgroundColor: theme.secondary + '18' }]}>
                <Ionicons name="library" size={22} color={theme.secondary} />
              </View>
              <View style={styles.headerTextBlock}>
                <ThemedText style={styles.title}>My Courses</ThemedText>
                <ThemedText style={styles.subtitle}>Track your learning progress and sessions</ThemedText>
              </View>
            </View>
            <View style={[styles.headerDivider, { backgroundColor: theme.secondary + '20' }]} />
          </Animated.View>

          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, tab === 'active' && { backgroundColor: theme.secondary, borderColor: theme.secondary }]} 
              onPress={() => setTab('active')}
            >
              <ThemedText style={[styles.tabText, tab === 'active' && { color: '#fff' }]}>Active</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, tab === 'completed' && { backgroundColor: theme.secondary, borderColor: theme.secondary }]} 
              onPress={() => setTab('completed')}
            >
              <ThemedText style={[styles.tabText, tab === 'completed' && { color: '#fff' }]}>Completed</ThemedText>
            </TouchableOpacity>
          </View>

          {loading && !refreshing ? (
            <ActivityIndicator size="large" color={theme.secondary} style={{ marginTop: 60 }} />
          ) : courses.length === 0 ? (
            <Animated.View entering={FadeInDown.delay(200)}>
              <GlassView style={styles.emptyBox}>
                <Ionicons name="book-outline" size={60} color={theme.icon} style={{ opacity: 0.2 }} />
                <ThemedText style={styles.emptyTitle}>No Courses Yet</ThemedText>
                <ThemedText style={styles.emptyText}>
                  You haven't enrolled in any courses yet. Explore our catalog and start your journey!
                </ThemedText>
              </GlassView>
            </Animated.View>
          ) : (
            courses.filter(e => tab === 'active' ? e.status !== 'completed' : e.status === 'completed').map((enrollment, i) => (
              <Animated.View key={enrollment.id} entering={FadeInDown.delay(150 + i * 100)}>
                <GlassView style={styles.courseCard}>
                  {/* Card Top */}
                  <View style={styles.cardTop}>
                    <View style={[styles.iconBox, { backgroundColor: theme.secondary + '12' }]}>
                      <Ionicons name="car-sport" size={26} color={theme.secondary} />
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: getStatusColor(enrollment.status) + '15' }]}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(enrollment.status) }]} />
                      <ThemedText style={[styles.statusText, { color: getStatusColor(enrollment.status) }]}>
                        {getStatusLabel(enrollment.status)}
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedText style={styles.courseName}>{enrollment.courseTitle}</ThemedText>
                  
                  {/* Progress Section */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <ThemedText style={styles.progressLabel}>Progress</ThemedText>
                      <ThemedText style={styles.progressValue}>{enrollment.progress || 0}%</ThemedText>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: theme.icon + '15' }]}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { 
                            backgroundColor: theme.secondary,
                            width: `${enrollment.progress || 0}%` 
                          }
                        ]} 
                      />
                    </View>
                  </View>

                  {/* Actions */}
                  {enrollment.status !== 'completed' && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity 
                        style={[styles.cancelBtn, { borderColor: '#EF444450' }]}
                        onPress={() => handleCancel(enrollment.id, enrollment.courseTitle)}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
                          <Ionicons name="trash-outline" size={18} color="#EF4444" />
                          <ThemedText style={{ color: '#EF4444', fontWeight: '700', marginLeft: 8 }}>Cancel Course</ThemedText>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                </GlassView>
              </Animated.View>
            ))
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
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, gap: 10 },
  tab: { flex: 1, height: 40, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '700', opacity: 0.8 },

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

  courseCard: { padding: 20, borderRadius: 28, marginBottom: 20 },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  iconBox: {
    width: 52, height: 52, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  courseName: { fontSize: 20, fontWeight: '800', marginBottom: 20 },

  progressSection: { marginBottom: 24 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, opacity: 0.5, fontWeight: '600' },
  progressValue: { fontSize: 13, fontWeight: '700' },
  progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },

  actionRow: { flexDirection: 'row', marginTop: 8 },
  cancelBtn: {
    flex: 1, height: 50, borderRadius: 16, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  emptyBox: { padding: 40, borderRadius: 32, alignItems: 'center', marginTop: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginTop: 20 },
  emptyText: { fontSize: 14, opacity: 0.5, marginTop: 10, textAlign: 'center', lineHeight: 22 },
});
