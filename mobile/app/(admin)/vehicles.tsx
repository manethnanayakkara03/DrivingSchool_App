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
import { VehicleForm } from '@/components/admin/forms/VehicleForm';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';

export default function VehiclesPage() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All'); // All, Active, Maintenance
  
  // Modals state
  const [formVisible, setFormVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [maintenanceDialogVisible, setMaintenanceDialogVisible] = useState(false);

  const fetchVehicles = async () => {
    try {
      // Mock data for UI redesign
      setVehicles([
        { id: '1', registrationNumber: 'WP CAA-1234', make: 'Toyota', model: 'Prius', year: 2018, transmission: 'Automatic', fuelType: 'Hybrid', assignedInstructor: 'Sarath Kumara', status: 'Active', condition: 'Good' },
        { id: '2', registrationNumber: 'WP CAR-5678', make: 'Suzuki', model: 'Alto', year: 2020, transmission: 'Manual', fuelType: 'Petrol', assignedInstructor: 'Nishantha Silva', status: 'Under Maintenance', condition: 'Fair' },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVehicles();
  };

  const handleEdit = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setFormVisible(true);
  };

  const handleDeletePrompt = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setDeleteDialogVisible(true);
  };

  const handleMaintenancePrompt = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setMaintenanceDialogVisible(true);
  };

  const confirmDelete = () => {
    setVehicles(prev => prev.filter(v => v.id !== selectedVehicle.id));
    setDeleteDialogVisible(false);
  };

  const confirmMaintenance = () => {
    setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? { ...v, status: 'Under Maintenance' } : v));
    setMaintenanceDialogVisible(false);
  };

  const handleFormSubmit = (data: any) => {
    if (selectedVehicle) {
      // Edit
      setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? { ...v, ...data } : v));
    } else {
      // Add
      setVehicles(prev => [{ ...data, id: Math.random().toString() }, ...prev]);
    }
    setFormVisible(false);
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.make.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.model.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFilter = true;
    if (filter === 'Active') matchesFilter = v.status === 'Active';
    if (filter === 'Maintenance') matchesFilter = v.status === 'Under Maintenance';
    
    return matchesSearch && matchesFilter;
  });

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
    if (status === 'Active') return theme.success;
    if (status === 'Under Maintenance') return '#F59E0B';
    return '#EF4444';
  };

  const renderItem = ({ item }: { item: any }) => (
    <GlassCard borderRadius={16} contentStyle={styles.cardContent} accentColor={getAccentColor(item.status)}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <View style={[styles.iconBox, { backgroundColor: `${theme.primary}20` }]}>
            <Ionicons name="car-sport" size={24} color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.regNumber, { color: theme.text }]}>{item.registrationNumber}</Text>
            <Text style={[styles.makeModel, { color: theme.muted }]}>{item.make} {item.model} • {item.year}</Text>
          </View>
        </View>
      </View>

      <View style={styles.badgesRow}>
        <StatusBadge status={item.status} />
        <StatusBadge status={item.condition} />
      </View>

      <View style={styles.tagsRow}>
        <View style={[styles.tagPill, { backgroundColor: theme.background }]}>
          <Text style={[styles.tagText, { color: theme.text }]}>{item.transmission}</Text>
        </View>
        <View style={[styles.tagPill, { backgroundColor: theme.background }]}>
          <Text style={[styles.tagText, { color: theme.text }]}>{item.fuelType}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="person-outline" size={16} color={theme.icon} />
          <Text style={[styles.detailText, { color: theme.muted }]}>Instructor: {item.assignedInstructor || 'Unassigned'}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleMaintenancePrompt(item)}>
          <Ionicons name="build" size={18} color="#F59E0B" />
          <Text style={[styles.actionText, { color: '#F59E0B' }]}>Maintenance</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item)}>
          <Ionicons name="pencil" size={18} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeletePrompt(item)}>
          <Ionicons name="trash" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </GlassCard>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <SectionHeader 
          title="Vehicles" 
          subtitle="Manage your training fleet"
          showMenuButton={true}
          onMenuPress={() => navigation.openDrawer()}
        />
        <View style={[styles.countBadge, { backgroundColor: `${theme.primary}20` }]}>
          <Text style={[styles.countText, { color: theme.primary }]}>{vehicles.length} Total</Text>
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.glass, borderColor: theme.glassBorder }]}>
        <Ionicons name="search" size={20} color={theme.icon} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search reg number, make, model..."
          placeholderTextColor={theme.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        {renderFilterTab('All')}
        {renderFilterTab('Active')}
        {renderFilterTab('Maintenance')}
      </View>

      <FlatList
        data={filteredVehicles}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState 
              icon="car-sport-outline" 
              title="No Vehicles Found" 
              message="There are no vehicles matching your criteria." 
            />
          ) : null
        }
      />

      <AdminFAB 
        onPress={() => {
          setSelectedVehicle(null);
          setFormVisible(true);
        }} 
      />

      {formVisible && (
        <VehicleForm 
          visible={formVisible}
          onClose={() => setFormVisible(false)}
          onSubmit={handleFormSubmit}
          initialData={selectedVehicle}
        />
      )}

      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Delete Vehicle"
        message={`Are you sure you want to delete ${selectedVehicle?.registrationNumber}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogVisible(false)}
        confirmLabel="Delete"
        isDestructive={true}
      />

      <ConfirmDialog
        visible={maintenanceDialogVisible}
        title="Send to Maintenance"
        message={`Mark ${selectedVehicle?.registrationNumber} as Under Maintenance?`}
        onConfirm={confirmMaintenance}
        onCancel={() => setMaintenanceDialogVisible(false)}
        confirmLabel="Confirm"
        isDestructive={false}
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
    marginBottom: 12,
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
  regNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  makeModel: {
    fontSize: 14,
    fontWeight: '500',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
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
    alignItems: 'center',
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
