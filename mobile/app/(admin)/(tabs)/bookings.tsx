import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput, RefreshControl, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SectionHeader } from '@/components/admin/SectionHeader';
import { GlassCard } from '@/components/admin/GlassCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { bookingsApi, adminApi } from '@/services/api';
import { BookingForm } from '@/components/admin/forms/BookingForm';


export default function BookingsPage() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const [bookings, setBookings] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All'); // All, Pending, Confirmed, Cancelled, Unscheduled, Learners

  // Form State
  const [formVisible, setFormVisible] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const [bookingsData, enrollmentsData] = await Promise.all([
        bookingsApi.list().catch(() => []),
        adminApi.getEnrolledStudents().catch(() => [])
      ]);
      
      // Ensure all items have a consistent id field
      const mappedBookings = (Array.isArray(bookingsData) ? bookingsData : []).map(b => ({
        ...b,
        id: b._id || b.id
      }));

      setBookings(mappedBookings);
      setEnrollments(enrollmentsData || []);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to fetch bookings');
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

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await bookingsApi.update(id, { status: newStatus });
      fetchBookings();
      Alert.alert('Success', `Booking ${newStatus.toLowerCase()} successfully`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update booking');
    }
  };

  const handleCreateBooking = async (data: any) => {
    try {
      setSubmitting(true);
      const bookingId = editingBooking?.id || editingBooking?._id;
      
      if (bookingId) {
        await bookingsApi.update(bookingId, data);
        Alert.alert('Success', 'Booking updated successfully');
      } else {
        // This is a new booking (even if pre-filled from an enrollment)
        await bookingsApi.create(data);
        Alert.alert('Success', 'Booking created successfully');
      }
      setFormVisible(false);
      setEditingBooking(null);
      fetchBookings();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save booking');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteBooking = (id: string) => {
    Alert.alert(
      'Delete Booking',
      'Are you sure you want to delete this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await bookingsApi.remove(id);
              fetchBookings();
              Alert.alert('Deleted', 'Booking removed successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete booking');
            }
          }
        }
      ]
    );
  };

  const openEditForm = (booking: any) => {
    setEditingBooking(booking);
    setFormVisible(true);
  };

  const displayData = (() => {
    if (filter === 'Learners') {
      return enrollments.map(e => ({
        ...e,
        id: e._id || e.id,
        learnerName: e.learnerName,
        courseTitle: e.courseTitle,
        date: 'Enrolled',
        time: 'No Classes Yet',
        status: 'Enrolled',
        isEnrollment: true
      }));
    }
    
    if (filter === 'All') {
      return bookings;
    }

    return bookings;
  })();

  const filteredBookings = displayData.filter(b => {
    const name = b.learnerName || b.learner || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'All') return matchesSearch;
    if (filter === 'Learners') return matchesSearch;
    if (filter === 'Unscheduled') return matchesSearch && b.date === 'Not Set';
    
    return matchesSearch && b.status === filter;
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
    if (status === 'Enrolled') return theme.primary;
    return '#F59E0B'; // Pending
  };

  const renderItem = ({ item }: { item: any }) => {
    const name = item.learnerName || item.learner || 'Unknown';
    
    return (
      <GlassCard borderRadius={16} contentStyle={styles.cardContent} accentColor={getAccentColor(item.status)}>
        <View style={styles.cardHeader}>
          <View style={styles.learnerRow}>
            <View style={[styles.avatar, { backgroundColor: `${theme.primary}20` }]}>
              <Text style={[styles.avatarText, { color: theme.primary }]}>{name.charAt(0)}</Text>
            </View>
            <Text style={[styles.learnerName, { color: theme.text }]}>{name}</Text>
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
            <Ionicons name="book-outline" size={14} color={theme.muted} />
            <Text style={[styles.infoText, { color: theme.muted }]}>{item.courseTitle || 'General'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={14} color={theme.muted} />
            <Text style={[styles.infoText, { color: theme.muted }]}>{item.instructorName || item.instructor || 'Not Assigned'}</Text>
          </View>
          {item.examType && (
            <View style={styles.infoRow}>
              <Ionicons name="ribbon-outline" size={14} color={theme.muted} />
              <Text style={[styles.infoText, { color: theme.muted }]}>{item.examType} (Pass: {item.passmark || '--'})</Text>
            </View>
          )}
          {item.venue && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color={theme.muted} />
              <Text style={[styles.infoText, { color: theme.muted }]}>{item.venue}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsRow}>
          {!item.isEnrollment && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: theme.primary + '15' }]} 
              onPress={() => openEditForm(item)}
            >
              <Ionicons name="create-outline" size={18} color={theme.primary} />
              <Text style={[styles.actionBtnText, { color: theme.primary }]}>Edit</Text>
            </TouchableOpacity>
          )}
          
          {!item.isEnrollment && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#EF444415' }]} 
              onPress={() => deleteBooking(item.id || item._id)}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Delete</Text>
            </TouchableOpacity>
          )}

          {item.status === 'Pending' && !item.isEnrollment && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: theme.success + '15' }]} 
              onPress={() => updateStatus(item.id || item._id, 'Confirmed')}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={theme.success} />
              <Text style={[styles.actionBtnText, { color: theme.success }]}>Confirm</Text>
            </TouchableOpacity>
          )}
        </View>

      {item.isEnrollment && (
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: theme.primary + '15' }]} 
            onPress={() => openEditForm({
              learnerId: item.learnerId,
              learnerName: item.learnerName,
              courseTitle: item.courseTitle,
              status: 'Pending'
            })}
          >
            <Ionicons name="calendar-outline" size={18} color={theme.primary} />
            <Text style={[styles.actionBtnText, { color: theme.primary }]}>Schedule Lesson</Text>
          </TouchableOpacity>
        </View>
      )}
    </GlassCard>
  );
};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <SectionHeader 
          title="Bookings" 
          subtitle="Manage driving lesson schedules"
          showMenuButton={true}
          onMenuPress={() => navigation.openDrawer()}
          rightComponent={
            <TouchableOpacity 
              style={[styles.addBtn, { backgroundColor: theme.primary }]}
              onPress={() => {
                setEditingBooking(null);
                setFormVisible(true);
              }}
            >
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          }
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

      <TouchableOpacity 
        style={styles.mainAddBtn}
        onPress={() => {
          setEditingBooking(null);
          setFormVisible(true);
        }}
      >
        <LinearGradient
          colors={[theme.primary, theme.secondary]}
          style={styles.mainAddGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="add-circle" size={24} color="#FFF" />
          <Text style={styles.mainAddText}>Create a Booking</Text>
        </LinearGradient>
      </TouchableOpacity>

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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
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
          <TouchableOpacity
            style={[
              styles.filterTab,
              { backgroundColor: filter === 'Unscheduled' ? theme.primary : theme.card, borderColor: filter === 'Unscheduled' ? theme.primary : theme.glassBorder },
            ]}
            onPress={() => setFilter('Unscheduled')}
          >
            <Text style={[styles.filterText, { color: filter === 'Unscheduled' ? '#FFF' : theme.text }]}>Unscheduled</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              { backgroundColor: filter === 'Learners' ? theme.primary : theme.card, borderColor: theme.glassBorder },
            ]}
            onPress={() => setFilter('Learners')}
          >
            <Text style={[styles.filterText, { color: filter === 'Learners' ? '#FFF' : theme.text }]}>All Students</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item, index) => item.id || item._id || index.toString()}
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

      <BookingForm
        visible={formVisible}
        initialData={editingBooking}
        onClose={() => {
          setFormVisible(false);
          setEditingBooking(null);
        }}
        onSubmit={handleCreateBooking}
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
    paddingHorizontal: 20,
    marginBottom: 16,
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
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  mainAddBtn: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  mainAddGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  mainAddText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

