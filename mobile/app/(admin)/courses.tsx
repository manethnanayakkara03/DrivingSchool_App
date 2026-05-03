import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '@/components/admin/SectionHeader';
import { GlassCard } from '@/components/admin/GlassCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { AdminFAB } from '@/components/admin/AdminFAB';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CourseForm } from '@/components/admin/forms/CourseForm';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';

export default function CoursesPage() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [formVisible, setFormVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const fetchCourses = async () => {
    try {
      // Mock data
      setCourses([
        { id: '1', name: 'Beginner Driving Course', duration: '30 Days', durationValue: '30', durationUnit: 'Days', price: 25000, instructor: 'Sarath Kumara', enrolled: 45, maxLearners: 50, status: 'Active', topics: ['Basic Controls', 'Road Signs'] },
        { id: '2', name: 'Advanced Highway Driving', duration: '2 Weeks', durationValue: '2', durationUnit: 'Weeks', price: 15000, instructor: 'Nishantha Silva', enrolled: 12, maxLearners: 20, status: 'Draft', topics: ['Highway Entry', 'High Speed Control'] },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const handleEdit = (course: any) => {
    setSelectedCourse(course);
    setFormVisible(true);
  };

  const handleDeletePrompt = (course: any) => {
    setSelectedCourse(course);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = () => {
    setCourses(prev => prev.filter(c => c.id !== selectedCourse.id));
    setDeleteDialogVisible(false);
  };

  const handleFormSubmit = (data: any) => {
    if (selectedCourse) {
      // Edit
      setCourses(prev => prev.map(c => c.id === selectedCourse.id ? { ...c, ...data } : c));
    } else {
      // Add
      setCourses(prev => [{ ...data, id: Math.random().toString(), enrolled: 0 }, ...prev]);
    }
    setFormVisible(false);
  };

  const filteredCourses = courses.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getAccentColor = (status: string) => {
    if (status === 'Active') return theme.success;
    if (status === 'Draft') return theme.muted;
    return '#EF4444'; // Archived
  };

  const formatCurrency = (amount: number) => `LKR ${amount.toLocaleString()}`;

  const renderItem = ({ item }: { item: any }) => (
    <GlassCard borderRadius={16} contentStyle={styles.cardContent} accentColor={getAccentColor(item.status)}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Text style={[styles.courseName, { color: theme.text }]}>{item.name}</Text>
          <StatusBadge status={item.status} />
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoCol}>
          <Ionicons name="time-outline" size={16} color={theme.primary} />
          <Text style={[styles.infoText, { color: theme.text }]}>{item.duration}</Text>
        </View>
        <View style={styles.infoCol}>
          <Ionicons name="cash-outline" size={16} color={theme.success} />
          <Text style={[styles.infoText, { color: theme.text }]}>{formatCurrency(item.price)}</Text>
        </View>
      </View>

      <View style={styles.instructorContainer}>
        <Text style={[styles.instructorLabel, { color: theme.muted }]}>Assigned Instructor</Text>
        <View style={styles.instructorRow}>
          <View style={[styles.avatarSmall, { backgroundColor: `${theme.primary}20` }]}>
            <Text style={[styles.avatarSmallText, { color: theme.primary }]}>{item.instructor ? item.instructor.charAt(0) : '?'}</Text>
          </View>
          <Text style={[styles.instructorName, { color: theme.text }]}>{item.instructor || 'Unassigned'}</Text>
        </View>
      </View>

      <View style={[styles.enrollmentBox, { backgroundColor: theme.background }]}>
        <Text style={[styles.enrollmentLabel, { color: theme.muted }]}>Enrollment</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${(item.enrolled / item.maxLearners) * 100}%`, backgroundColor: theme.primary }]} />
        </View>
        <Text style={[styles.enrollmentCount, { color: theme.text }]}>{item.enrolled} / {item.maxLearners} Learners</Text>
      </View>

      <View style={styles.actionsRow}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item)}>
          <Ionicons name="pencil" size={18} color={theme.primary} />
          <Text style={[styles.actionText, { color: theme.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeletePrompt(item)}>
          <Ionicons name="trash" size={18} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <SectionHeader 
          title="Courses" 
          subtitle="Manage training packages"
          showMenuButton={true}
          onMenuPress={() => navigation.openDrawer()}
        />
        <View style={[styles.countBadge, { backgroundColor: `${theme.primary}20` }]}>
          <Text style={[styles.countText, { color: theme.primary }]}>{courses.length} Total</Text>
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.glass, borderColor: theme.glassBorder }]}>
        <Ionicons name="search" size={20} color={theme.icon} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search courses..."
          placeholderTextColor={theme.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredCourses}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState 
              icon="book-outline" 
              title="No Courses Found" 
              message="There are no courses matching your search." 
            />
          ) : null
        }
      />

      <AdminFAB 
        onPress={() => {
          setSelectedCourse(null);
          setFormVisible(true);
        }} 
      />

      {formVisible && (
        <CourseForm 
          visible={formVisible}
          onClose={() => setFormVisible(false)}
          onSubmit={handleFormSubmit}
          initialData={selectedCourse}
        />
      )}

      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Delete Course"
        message={`Are you sure you want to delete ${selectedCourse?.name}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogVisible(false)}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // padding for FAB
  },
  cardContent: {
    padding: 16,
    borderWidth: 0, 
  },
  cardHeader: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  infoCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  infoText: {
    fontWeight: '600',
    fontSize: 14,
  },
  instructorContainer: {
    marginBottom: 16,
  },
  instructorLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmallText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  instructorName: {
    fontWeight: '600',
  },
  enrollmentBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  enrollmentLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  enrollmentCount: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
