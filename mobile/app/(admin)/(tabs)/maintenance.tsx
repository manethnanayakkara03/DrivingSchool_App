import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '@/components/admin/SectionHeader';
import { GlassCard } from '@/components/admin/GlassCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { AdminFAB } from '@/components/admin/AdminFAB';
import { MaintenanceForm } from '@/components/admin/forms/MaintenanceForm';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';

export default function MaintenancePage() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All'); // All, Pending, In Progress, Completed
  
  const [formVisible, setFormVisible] = useState(false);

  const fetchRecords = async () => {
    try {
      // Mock data
      setMaintenanceRecords([
        { id: '1', vehicle: 'WP CAA-1234', model: 'Toyota Prius', type: 'Service', date: '2023-11-20', status: 'Pending', notes: 'Regular 10,000km service' },
        { id: '2', vehicle: 'WP CAR-5678', model: 'Suzuki Alto', type: 'Repair', date: '2023-11-18', status: 'In Progress', notes: 'Brake pad replacement' },
        { id: '3', vehicle: 'WP CBE-9012', model: 'Honda Fit', type: 'Inspection', date: '2023-11-10', status: 'Completed', notes: 'Annual eco test and fitness' },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  const handleFormSubmit = (data: any) => {
    setMaintenanceRecords(prev => [{ ...data, id: Math.random().toString(), model: 'Unknown Model' }, ...prev]);
    setFormVisible(false);
  };

  const markAsComplete = (id: string) => {
    setMaintenanceRecords(prev => prev.map(m => m.id === id ? { ...m, status: 'Completed' } : m));
  };

  const filteredRecords = maintenanceRecords.filter(m => filter === 'All' || m.status === filter);

  const renderFilterTab = (label: string) => (
    <TouchableOpacity
      style={[
        styles.filterTab,
        { backgroundColor: filter === label ? theme.primary : theme.card, borderColor: theme.glassBorder },
      ]}
      onPress={() => setFilter(label)}
    >
      <Text style={[styles.filterText, { color: filter === label ? '#FFF' : theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );

  const getAccentColor = (status: string) => {
    if (status === 'Completed') return theme.success;
    if (status === 'Pending') return '#EF4444'; // Red
    return '#F59E0B'; // Amber
  };

  const renderItem = ({ item }: { item: any }) => (
    <GlassCard borderRadius={16} contentStyle={styles.cardContent} accentColor={getAccentColor(item.status)}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <View style={[styles.iconBox, { backgroundColor: `${theme.primary}20` }]}>
            <Ionicons name="build" size={24} color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.vehicleReg, { color: theme.text }]}>{item.vehicle}</Text>
            <Text style={[styles.vehicleModel, { color: theme.muted }]}>{item.model}</Text>
          </View>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailCol}>
          <Text style={[styles.detailLabel, { color: theme.muted }]}>Type</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>{item.type}</Text>
        </View>
        <View style={styles.detailCol}>
          <Text style={[styles.detailLabel, { color: theme.muted }]}>Date Sent</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>{item.date}</Text>
        </View>
      </View>

      {item.notes ? (
        <View style={[styles.notesBox, { backgroundColor: theme.background }]}>
          <Text style={[styles.notesText, { color: theme.muted }]}>"{item.notes}"</Text>
        </View>
      ) : null}

      {item.status !== 'Completed' && (
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={[styles.completeBtn, { backgroundColor: theme.success }]} 
            onPress={() => markAsComplete(item.id)}
          >
            <Ionicons name="checkmark-circle" size={18} color="#FFF" />
            <Text style={styles.completeText}>Mark as Complete</Text>
          </TouchableOpacity>
        </View>
      )}
    </GlassCard>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <SectionHeader 
          title="Maintenance" 
          subtitle="Track vehicle service records"
          showMenuButton={true}
          onMenuPress={() => navigation.openDrawer()}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterTab('All')}
          {renderFilterTab('Pending')}
          {renderFilterTab('In Progress')}
          {renderFilterTab('Completed')}
          <View style={{ width: 20 }} />
        </ScrollView>
      </View>

      <FlatList
        data={filteredRecords}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState 
              icon="build-outline" 
              title="No Records Found" 
              message="There are no maintenance records matching your criteria." 
            />
          ) : null
        }
      />

      <AdminFAB onPress={() => setFormVisible(true)} />

      {formVisible && (
        <MaintenanceForm 
          visible={formVisible}
          onClose={() => setFormVisible(false)}
          onSubmit={handleFormSubmit}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
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
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleReg: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  vehicleModel: {
    fontSize: 14,
  },
  detailsGrid: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 20,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  notesBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  notesText: {
    fontStyle: 'italic',
    fontSize: 13,
  },
  actionsRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 16,
    alignItems: 'flex-end',
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  completeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
