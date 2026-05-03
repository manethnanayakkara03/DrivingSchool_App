import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '@/components/admin/SectionHeader';
import { GlassCard } from '@/components/admin/GlassCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';

export default function BookingsPage() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All'); // All, Pending, Confirmed, Cancelled

  const fetchBookings = async () => {
    try {
      // Mock data
      setBookings([
        { id: '1', learner: 'Kamal Perera', instructor: 'Sarath Kumara', vehicle: 'WP CAA-1234', date: '2023-11-25', time: '10:00 AM', duration: '2 Hours', status: 'Pending' },
        { id: '2', learner: 'Nimal Silva', instructor: 'Nishantha Silva', vehicle: 'WP CAR-5678', date: '2023-11-26', time: '02:00 PM', duration: '1 Hour', status: 'Confirmed' },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const updateStatus = (id: string, newStatus: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.learner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'All' || b.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    cancelled: bookings.filter(b => b.status === 'Cancelled').length,
  };

  const getAccentColor = (status: string) => {
    if (status === 'Confirmed') return theme.success;
    if (status === 'Cancelled') return '#EF4444';
    return '#F59E0B'; // Pending
  };

  const renderItem = ({ item }: { item: any }) => (
    <GlassCard borderRadius={16} contentStyle={styles.cardContent} accentColor={getAccentColor(item.status)}>
      <View style={styles.cardHeader}>
        <View style={styles.learnerRow}>
          <View style={[styles.avatar, { backgroundColor: `${theme.primary}20` }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>{item.learner.charAt(0)}</Text>
          </View>
          <Text style={[styles.learnerName, { color: theme.text }]}>{item.learner}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.dateTimeContainer}>
        <View style={styles.dateTimeItem}>
          <Ionicons name="calendar-outline" size={16} color={theme.icon} />
          <Text style={[styles.dateTimeText, { color: theme.text }]}>{item.date}</Text>
        </View>
        <View style={styles.dateTimeItem}>
          <Ionicons name="time-outline" size={16} color={theme.icon} />
          <Text style={[styles.dateTimeText, { color: theme.text }]}>{item.time} ({item.duration})</Text>
        </View>
      </View>

      <View style={[styles.infoBox, { backgroundColor: theme.background }]}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={14} color={theme.muted} />
          <Text style={[styles.infoText, { color: theme.muted }]}>{item.instructor}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="car-outline" size={14} color={theme.muted} />
          <Text style={[styles.infoText, { color: theme.muted }]}>{item.vehicle}</Text>
        </View>
      </View>

      {item.status === 'Pending' && (
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.cancelBtn]} 
            onPress={() => updateStatus(item.id, 'Cancelled')}
          >
            <Text style={styles.cancelText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.confirmBtn, { backgroundColor: theme.success }]} 
            onPress={() => updateStatus(item.id, 'Confirmed')}
          >
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      )}
    </GlassCard>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <SectionHeader 
          title="Bookings" 
          subtitle="Manage driving lesson schedules"
          showMenuButton={true}
          onMenuPress={() => navigation.openDrawer()}
        />
      </View>

      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: theme.muted }]}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.pending}</Text>
          <Text style={[styles.statLabel, { color: theme.muted }]}>Pending</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.success }]}>{stats.confirmed}</Text>
          <Text style={[styles.statLabel, { color: theme.muted }]}>Confirmed</Text>
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.glass, borderColor: theme.glassBorder }]}>
        <Ionicons name="search" size={20} color={theme.icon} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search by learner name..."
          placeholderTextColor={theme.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            { backgroundColor: filter === 'All' ? theme.primary : theme.card, borderColor: theme.glassBorder },
          ]}
          onPress={() => setFilter('All')}
        >
          <Text style={[styles.filterText, { color: filter === 'All' ? '#FFF' : theme.text }]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            { backgroundColor: filter === 'Pending' ? '#F59E0B' : theme.card, borderColor: filter === 'Pending' ? '#F59E0B' : theme.glassBorder },
          ]}
          onPress={() => setFilter('Pending')}
        >
          <Text style={[styles.filterText, { color: filter === 'Pending' ? '#FFF' : theme.text }]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            { backgroundColor: filter === 'Confirmed' ? theme.success : theme.card, borderColor: filter === 'Confirmed' ? theme.success : theme.glassBorder },
          ]}
          onPress={() => setFilter('Confirmed')}
        >
          <Text style={[styles.filterText, { color: filter === 'Confirmed' ? '#FFF' : theme.text }]}>Confirmed</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState 
              icon="calendar-outline" 
              title="No Bookings Found" 
              message="There are no bookings matching your criteria." 
            />
          ) : null
        }
      />
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
  statsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    paddingBottom: 40,
  },
  cardContent: {
    padding: 16,
    borderWidth: 0, 
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  learnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  learnerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoBox: {
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  cancelText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  confirmBtn: {
  },
  confirmText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
