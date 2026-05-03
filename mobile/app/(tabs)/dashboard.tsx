import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, ActivityIndicator, Alert, Linking } from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassView } from '@/components/GlassView';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { dashboardApi, reportApi, clearToken, BASE_URL, getToken } from '@/services/api';

const { width } = Dimensions.get('window');

type Stats = { learners: number; instructors: number; vehicles: number; bookings: number; revenue: number };

export default function AdminDashboard() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    dashboardApi.stats()
      .then(setStats)
      .catch(() => setStats({ learners: 0, instructors: 0, vehicles: 0, bookings: 0, revenue: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const handleSignOut = () => {
    clearToken();
    router.replace('/login');
  };

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      const token = getToken();
      if (!token) {
        Alert.alert('Error', 'Not authenticated. Please log in again.');
        return;
      }

      // Generate report URL with token
      const reportUrl = `${BASE_URL}/api/report/download`;
      
      // For mobile, try to open in browser
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const urlWithToken = `${reportUrl}?token=${token}`;
        try {
          await Linking.openURL(urlWithToken);
          Alert.alert('Success', 'Report opened in browser. Use print option to save as PDF.');
        } catch (err) {
          Alert.alert('Error', 'Could not open report. Please try again.');
        }
      } else {
        // For web, fetch and trigger download
        const res = await reportApi.download();
        if (res.success) {
          Alert.alert('Success', 'Report generated successfully!');
        }
      }
    } catch (err: any) {
      console.error('Report generation error:', err);
      Alert.alert('Error', err.message || 'Failed to generate report');
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: false,
      }} />
      
      <LinearGradient
        colors={[theme.primary + '10', 'transparent']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.brandText}>DriveEase</ThemedText>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.badge} />
            <Ionicons name="notifications-outline" size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <ThemedText style={styles.avatarText}>A</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeTextContainer}>
            <View style={styles.welcomeHeader}>
              <View style={[styles.welcomeAvatar, { backgroundColor: theme.primary }]}>
                <ThemedText style={styles.welcomeAvatarText}>A</ThemedText>
              </View>
              <View>
                <View style={styles.adminBadgeRow}>
                  <ThemedText style={styles.welcomeTitle}>Good afternoon, Admin</ThemedText>
                  <View style={[styles.adminBadge, { backgroundColor: theme.primary + '20' }]}>
                    <ThemedText style={[styles.adminBadgeText, { color: theme.primary }]}>Admin</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.welcomeSubtitle}>Here's what's happening at your driving school today.</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={[styles.generateReportBtn, { backgroundColor: theme.primary, opacity: reportLoading ? 0.6 : 1 }]}
            onPress={handleGenerateReport}
            disabled={reportLoading}
          >
            {reportLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="document-text-outline" size={18} color="#fff" />
                <ThemedText style={styles.btnText}>Generate Report</ThemedText>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.signOutBtn, { backgroundColor: '#FEE2E2' }]}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <ThemedText style={[styles.btnText, { color: '#EF4444' }]}>Sign Out</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: 30 }} />
        ) : (
        <View style={styles.statsGrid}>
          <AdminStatCard 
            label="Total Students" 
            value={String(stats?.learners ?? 0)} 
            icon="people" 
            color="#3B82F6" 
            theme={theme}
            onPress={() => router.push('/manage/learners')}
          />
          <AdminStatCard 
            label="Instructors" 
            value={String(stats?.instructors ?? 0)} 
            icon="school" 
            color="#10B981" 
            theme={theme}
            onPress={() => router.push('/manage/instructors')}
          />
          <AdminStatCard 
            label="Active Vehicles" 
            value={String(stats?.vehicles ?? 0)} 
            icon="car" 
            color="#F59E0B" 
            theme={theme}
            onPress={() => router.push('/manage/vehicles')}
          />
          <AdminStatCard 
            label="Monthly Revenue" 
            value={`LKR ${((stats?.revenue ?? 0) / 1000).toFixed(1)}K`} 
            icon="card" 
            color="#8B5CF6" 
            theme={theme}
            onPress={() => router.push('/manage/payments')}
          />
          <AdminStatCard 
            label="Bookings" 
            value={String(stats?.bookings ?? 0)} 
            icon="calendar" 
            color="#EF4444" 
            theme={theme}
            onPress={() => router.push('/manage/bookings')}
          />
        </View>
        )}

        {/* Charts Simulation Section */}
        <View style={styles.chartSection}>
          <GlassView style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <ThemedText style={styles.chartTitle}>Enrollment Trend</ThemedText>
              <View style={[styles.chartFilter, { backgroundColor: theme.primary + '10' }]}>
                <ThemedText style={[styles.chartFilterText, { color: theme.primary }]}>Last 7 months</ThemedText>
              </View>
            </View>
            {/* Simulated Chart */}
            <View style={styles.chartPlaceholder}>
              <View style={styles.chartLine} />
              <View style={[styles.chartPoint, { backgroundColor: theme.primary, left: '60%', top: '20%' }]} />
              <View style={styles.chartLabels}>
                {['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map(m => (
                  <ThemedText key={m} style={styles.chartLabelText}>{m}</ThemedText>
                ))}
              </View>
            </View>
          </GlassView>

          <GlassView style={[styles.chartCard, { marginTop: 20 }]}>
            <ThemedText style={styles.chartTitle}>Student Status</ThemedText>
            <View style={styles.donutPlaceholder}>
              <View style={[styles.donutCircle, { borderColor: '#10B981', borderTopColor: '#F59E0B' }]} />
              <View style={styles.donutInfo}>
                <ThemedText style={styles.donutValue}>85%</ThemedText>
                <ThemedText style={styles.donutLabel}>Active</ThemedText>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <ThemedText style={styles.legendText}>Active</ThemedText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                <ThemedText style={styles.legendText}>Pending</ThemedText>
              </View>
            </View>
          </GlassView>
        </View>

        {/* Footer Navigation (application format) */}
        <View style={styles.operationsSection}>
          <ThemedText style={styles.sectionTitle}>Operations</ThemedText>
          <View style={styles.navGrid}>
            <NavIcon icon="people" label="Learners" theme={theme} onPress={() => router.push('/manage/learners')} />
            <NavIcon icon="school" label="Instructors" theme={theme} onPress={() => router.push('/manage/instructors')} />
            <NavIcon icon="car" label="Vehicles" theme={theme} onPress={() => router.push('/manage/vehicles')} />
            <NavIcon icon="construct" label="Maintenance" theme={theme} onPress={() => router.push('/manage/maintenance')} />
          </View>
          <View style={[styles.navGrid, { marginTop: 16 }]}>
            <NavIcon icon="calendar" label="Bookings" theme={theme} onPress={() => router.push('/manage/bookings')} />
            <NavIcon icon="cash" label="Payments" theme={theme} onPress={() => router.push('/manage/payments')} />
            <NavIcon icon="settings" label="Settings" theme={theme} onPress={() => router.push('/manage/settings')} />
            <View style={{ width: '22%' }} /> {/* Spacer */}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function AdminStatCard({ label, value, icon, color, theme, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress}>
      <GlassView style={styles.statCard} intensity={20}>
        <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View>
          <ThemedText style={styles.statValue}>{value}</ThemedText>
          <ThemedText style={styles.statLabel}>{label}</ThemedText>
        </View>
      </GlassView>
    </TouchableOpacity>
  );
}

function NavIcon({ icon, label, theme, onPress }: any) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <GlassView style={styles.navIconContainer} intensity={15}>
        <Ionicons name={icon} size={24} color={theme.primary} />
      </GlassView>
      <ThemedText style={styles.navLabel}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    zIndex: 1,
  },
  profileButton: {
    marginLeft: 4,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  welcomeRow: {
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  welcomeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  adminBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  adminBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  welcomeSubtitle: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  generateReportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  statsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  chartSection: {
    marginBottom: 30,
  },
  chartCard: {
    padding: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  chartFilter: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chartFilterText: {
    fontSize: 10,
    fontWeight: '600',
  },
  chartPlaceholder: {
    height: 150,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  chartLine: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  chartPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  chartLabelText: {
    fontSize: 10,
    opacity: 0.5,
  },
  donutPlaceholder: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  donutCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 15,
    borderColor: '#eee',
  },
  donutInfo: {
    position: 'absolute',
    alignItems: 'center',
  },
  donutValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  donutLabel: {
    fontSize: 10,
    opacity: 0.6,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    opacity: 0.7,
  },
  operationsSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  navGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navItem: {
    alignItems: 'center',
    width: '22%',
  },
  navIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.8,
  },
});
