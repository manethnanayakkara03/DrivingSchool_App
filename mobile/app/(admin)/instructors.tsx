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
import { InstructorForm } from '@/components/admin/forms/InstructorForm';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { instructorsApi, instructorApi } from '@/services/api';
import { Alert } from 'react-native';

export default function InstructorsPage() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Active, Inactive
  
  // Modals state
  const [formVisible, setFormVisible] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const data = await instructorsApi.list();
      setInstructors(data);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to fetch instructors');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInstructors();
  };

  const handleEdit = (instructor: any) => {
    setSelectedInstructor(instructor);
    setFormVisible(true);
  };

  const handleDeletePrompt = (instructor: any) => {
    setSelectedInstructor(instructor);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedInstructor) return;
    try {
      await instructorsApi.remove(selectedInstructor._id);
      setInstructors(prev => prev.filter(i => i._id !== selectedInstructor._id));
      setDeleteDialogVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete instructor');
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      // Map frontend field names to backend names
      const payload = {
        ...data,
        licenceType: data.licenseType, // frontend licenseType -> backend licenceType
        monthlySalary: data.salary,   // frontend salary -> backend monthlySalary
      };

      if (selectedInstructor) {
        // Edit
        const updated = await instructorsApi.update(selectedInstructor._id, payload);
        setInstructors(prev => prev.map(i => i._id === selectedInstructor._id ? updated : i));
      } else {
        // Add
        await instructorApi.createAccount(payload);
        fetchInstructors(); // Refresh list to get the new instructor
      }
      setFormVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save instructor');
    }
  };

  const filteredInstructors = instructors.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.nic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderFilterTab = (label: string) => (
    <TouchableOpacity
      style={[
        styles.filterTab,
        { backgroundColor: statusFilter === label ? theme.primary : theme.card, borderColor: theme.glassBorder },
      ]}
      onPress={() => setStatusFilter(label)}
    >
      <Text style={[styles.filterText, { color: statusFilter === label ? '#FFF' : theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: any }) => (
    <GlassCard borderRadius={16} contentStyle={styles.cardContent} accentColor={item.status === 'Active' ? theme.success : '#EF4444'}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarRow}>
          <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </LinearGradient>
          <View>
            <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.nic, { color: theme.muted }]}>{item.nic}</Text>
          </View>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.badgesRow}>
        <View style={[styles.tagPill, { backgroundColor: `${theme.accent}20` }]}>
          <Text style={[styles.tagText, { color: theme.accent }]}>{item.specialization}</Text>
        </View>
        <View style={[styles.tagPill, { backgroundColor: `${theme.primary}20` }]}>
          <Text style={[styles.tagText, { color: theme.primary }]}>{item.licenceType || item.licenseType} License</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="call-outline" size={16} color={theme.icon} />
          <Text style={[styles.detailText, { color: theme.muted }]}>{item.phone}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="mail-outline" size={16} color={theme.icon} />
          <Text style={[styles.detailText, { color: theme.muted }]}>{item.email}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
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
          title="Instructors" 
          subtitle="Manage your driving school staff"
          showMenuButton={true}
          onMenuPress={() => navigation.openDrawer()}
        />
        <View style={[styles.countBadge, { backgroundColor: `${theme.primary}20` }]}>
          <Text style={[styles.countText, { color: theme.primary }]}>{instructors.length} Total</Text>
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.glass, borderColor: theme.glassBorder }]}>
        <Ionicons name="search" size={20} color={theme.icon} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search by name or NIC..."
          placeholderTextColor={theme.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        {renderFilterTab('All')}
        {renderFilterTab('Active')}
        {renderFilterTab('Inactive')}
      </View>

      <FlatList
        data={filteredInstructors}
        keyExtractor={item => item._id || item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState 
              icon="school-outline" 
              title="No Instructors Found" 
              message="There are no instructors matching your search." 
            />
          ) : null
        }
      />

      <AdminFAB 
        onPress={() => {
          setSelectedInstructor(null);
          setFormVisible(true);
        }} 
      />

      {formVisible && (
        <InstructorForm 
          visible={formVisible}
          onClose={() => setFormVisible(false)}
          onSubmit={handleFormSubmit}
          initialData={selectedInstructor}
        />
      )}

      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Delete Instructor"
        message={`Are you sure you want to delete ${selectedInstructor?.name}? This action cannot be undone.`}
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
    marginBottom: 12,
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontWeight: '600',
    fontSize: 14,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  nic: {
    fontSize: 14,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
    gap: 16,
    justifyContent: 'flex-end',
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
