import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, TextInput, Alert, Keyboard, TouchableWithoutFeedback
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
import { instructorApi, getUser } from '@/services/api';

export default function InstructorStudentsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const user = getUser();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('active'); // 'active' or 'completed'

  // Status Update Modal State
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newProgress, setNewProgress] = useState(0);
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    if (!user?.name) { setLoading(false); return; }
    try {
      const data = await instructorApi.getMyStudents(user.name);
      setStudents(data);
    } catch (err) {
      console.error('Fetch students error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleUpdateStatus = (student: any) => {
    setSelectedStudent(student);
    setNewStatus(student.status);
    setNewProgress(student.progress || 0);
    setModalVisible(true);
  };

  const saveStatus = async () => {
    if (!selectedStudent) return;
    setUpdating(true);
    try {
      await instructorApi.updateEnrollmentStatus(selectedStudent._id || selectedStudent.id, {
        status: newStatus,
        progress: newProgress
      });
      Keyboard.dismiss();
      setModalVisible(false);
      fetchData();
      Alert.alert('Success', 'Student status updated successfully');
    } catch (err) {
      console.error('Update status error:', err);
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const searchLower = search.toLowerCase();
    const name = (s.learnerName || '').toLowerCase();
    const id = (s.learnerId || '').toLowerCase();
    const course = (s.courseTitle || '').toLowerCase();
    
    const matchesSearch = name.includes(searchLower) || id.includes(searchLower) || course.includes(searchLower);
    const matchesTab = tab === 'active' ? s.status !== 'completed' : s.status === 'completed';

    return matchesSearch && matchesTab;
  });

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={[theme.primary + '12', theme.background]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>My Students</ThemedText>
          <ThemedText style={styles.subtitle}>Manage enrollments and progress</ThemedText>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, tab === 'active' && { backgroundColor: theme.primary, borderColor: theme.primary }]} 
            onPress={() => setTab('active')}
          >
            <ThemedText style={[styles.tabText, tab === 'active' && { color: '#fff' }]}>Active</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, tab === 'completed' && { backgroundColor: theme.primary, borderColor: theme.primary }]} 
            onPress={() => setTab('completed')}
          >
            <ThemedText style={[styles.tabText, tab === 'completed' && { color: '#fff' }]}>Completed</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <GlassView style={styles.searchBox}>
            <Ionicons name="search" size={20} color={theme.icon} style={{ marginRight: 10 }} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search students or courses..."
              placeholderTextColor={theme.icon + '80'}
              value={search}
              onChangeText={setSearch}
            />
          </GlassView>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
          ) : filteredStudents.length > 0 ? (
            filteredStudents.map((student, i) => (
              <Animated.View key={student.id || student._id} entering={FadeInDown.delay(i * 50)}>
                <GlassView style={styles.studentCard}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
                      <ThemedText style={[styles.avatarText, { color: theme.primary }]}>
                        {(student.learnerName || student.learnerId || '??').substring(0, 2).toUpperCase()}
                      </ThemedText>
                    </View>
                    <View style={styles.studentInfo}>
                      <ThemedText style={styles.studentName}>{student.learnerName || 'Unknown Student'}</ThemedText>
                      <ThemedText style={styles.courseName}>{student.courseTitle}</ThemedText>
                    </View>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: student.status === 'completed' ? '#10B98120' : theme.primary + '20' 
                    }]}>
                      <ThemedText style={[styles.statusBadgeText, { 
                        color: student.status === 'completed' ? '#10B981' : theme.primary 
                      }]}>
                        {student.status?.toUpperCase()}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressRow}>
                      <ThemedText style={styles.progressLabel}>Progress</ThemedText>
                      <ThemedText style={styles.progressValue}>{student.progress || 0}%</ThemedText>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { 
                        width: `${student.progress || 0}%`, 
                        backgroundColor: theme.primary 
                      }]} />
                    </View>
                  </View>

                  {student.status !== 'completed' ? (
                    <TouchableOpacity 
                      style={[styles.updateBtn, { borderColor: theme.primary + '40' }]}
                      onPress={() => handleUpdateStatus(student)}
                    >
                      <ThemedText style={[styles.updateBtnText, { color: theme.primary }]}>Update Status</ThemedText>
                      <Ionicons name="create-outline" size={16} color={theme.primary} />
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.completedBanner, { backgroundColor: '#10B98115' }]}>
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                      <ThemedText style={[styles.completedText, { color: '#10B981' }]}>Course Completed</ThemedText>
                    </View>
                  )}
                </GlassView>
              </Animated.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={60} color={theme.icon} style={{ opacity: 0.3 }} />
              <ThemedText style={styles.emptyText}>No students found</ThemedText>
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Update Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <GlassView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Update Progress</ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ThemedText style={styles.modalLabel}>Status</ThemedText>
            <View style={styles.statusOptions}>
              {['enrolled', 'in-progress', 'completed'].map(s => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusOption,
                    { borderColor: theme.primary + '30' },
                    newStatus === s && { backgroundColor: theme.primary, borderColor: theme.primary }
                  ]}
                  onPress={() => setNewStatus(s)}
                >
                  <ThemedText style={[
                    styles.statusOptionText,
                    newStatus === s && { color: '#fff' }
                  ]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText style={styles.modalLabel}>Progress ({newProgress}%)</ThemedText>
            <View style={styles.progressInputContainer}>
              <TextInput
                style={[styles.progressInput, { color: theme.text, borderColor: theme.primary + '30' }]}
                keyboardType="numeric"
                value={newProgress.toString()}
                onChangeText={(val) => {
                  const n = parseInt(val) || 0;
                  setNewProgress(Math.min(100, Math.max(0, n)));
                }}
              />
              <View style={styles.progressSliderBg}>
                <View style={[styles.progressSliderFill, { width: `${newProgress}%`, backgroundColor: theme.primary }]} />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
              onPress={saveStatus}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.saveBtnText}>Save Changes</ThemedText>
              )}
            </TouchableOpacity>
          </GlassView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, gap: 10 },
  tab: { flex: 1, height: 40, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '700', opacity: 0.8 },
  header: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 14, opacity: 0.6, marginTop: 4 },
  searchContainer: { paddingHorizontal: 20, marginBottom: 20 },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 50, borderRadius: 15 },
  searchInput: { flex: 1, fontSize: 16 },
  scrollContent: { paddingHorizontal: 20 },
  studentCard: { padding: 16, borderRadius: 22, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '800' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '800' },
  courseName: { fontSize: 13, opacity: 0.5, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusBadgeText: { fontSize: 10, fontWeight: '900' },
  progressContainer: { marginBottom: 15 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 12, opacity: 0.6 },
  progressValue: { fontSize: 12, fontWeight: '800' },
  progressBar: { height: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  updateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40, borderRadius: 12, borderWidth: 1, gap: 8 },
  updateBtnText: { fontSize: 14, fontWeight: '700' },
  completedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40, borderRadius: 12, gap: 8 },
  completedText: { fontSize: 14, fontWeight: '800' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, opacity: 0.5, marginTop: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', padding: 24, borderRadius: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 22, fontWeight: '900' },
  modalLabel: { fontSize: 14, fontWeight: '700', marginBottom: 12, opacity: 0.8 },
  statusOptions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, gap: 8 },
  statusOption: { flex: 1, height: 45, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  statusOptionText: { fontSize: 12, fontWeight: '700', opacity: 0.8 },
  progressInputContainer: { marginBottom: 30 },
  progressInput: { height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 15, fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 15 },
  progressSliderBg: { height: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' },
  progressSliderFill: { height: '100%', borderRadius: 3 },
  saveBtn: { height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
