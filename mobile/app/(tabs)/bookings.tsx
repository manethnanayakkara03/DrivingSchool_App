import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassView } from '@/components/GlassView';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { bookingsApi } from '@/services/api';

interface Booking {
  id: string;
  idCode: string;
  studentName: string;
  studentPhone: string;
  instructorId: string;
  vehicleId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
  createdAt: string;
  color: string;
}

export default function BookingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const data = await bookingsApi.list();
      setBookings(data || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleDelete = (booking: Booking) => {
    const confirmDelete = async () => {
      try {
        await bookingsApi.remove(booking.id);
        setBookings(prev => prev.filter(b => b.id !== booking.id));
        Alert.alert('Success', 'Booking deleted successfully');
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to delete booking');
      }
    };

    if (Platform.OS === 'web') {
      // @ts-ignore
      if (window.confirm(`Delete booking for ${booking.studentName}?`)) confirmDelete();
    } else {
      Alert.alert('Delete Booking', `Delete booking for ${booking.studentName}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete },
      ]);
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
          <ThemedText style={styles.title}>Bookings</ThemedText>
          <ThemedText style={styles.subtitle}>Manage driving lessons</ThemedText>
        </View>
        <View style={[styles.badge, { backgroundColor: theme.primary }]}>
          <ThemedText style={styles.badgeText}>{bookings.length}</ThemedText>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="hourglass-outline" size={48} color={theme.icon} />
            <ThemedText style={styles.emptyText}>Loading bookings...</ThemedText>
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={theme.icon} />
            <ThemedText style={styles.emptyText}>No bookings yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>Create your first booking to get started</ThemedText>
          </View>
        ) : (
          bookings.map((booking, idx) => (
            <GlassView key={booking.id} style={[styles.bookingCard, { borderLeftColor: booking.color }]}>
              {/* Header Row */}
              <View style={styles.bookingHeader}>
                <View style={styles.bookingTitleSection}>
                  <View style={[styles.colorBadge, { backgroundColor: booking.color }]} />
                  <View style={styles.titleContent}>
                    <ThemedText style={styles.bookingId}>{booking.idCode}</ThemedText>
                    <ThemedText style={styles.studentName}>{booking.studentName}</ThemedText>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDelete(booking)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {/* Details Grid */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Ionicons name="call-outline" size={16} color={theme.icon} />
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Phone</ThemedText>
                    <ThemedText style={styles.detailValue}>{booking.studentPhone}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={16} color={theme.icon} />
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Date</ThemedText>
                    <ThemedText style={styles.detailValue}>{booking.date}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={16} color={theme.icon} />
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Time</ThemedText>
                    <ThemedText style={styles.detailValue}>{booking.startTime} - {booking.endTime}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="person-outline" size={16} color={theme.icon} />
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Instructor</ThemedText>
                    <ThemedText style={styles.detailValue}>{booking.instructorId}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="car-outline" size={16} color={theme.icon} />
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Vehicle</ThemedText>
                    <ThemedText style={styles.detailValue}>{booking.vehicleId}</ThemedText>
                  </View>
                </View>
              </View>

              {/* Notes */}
              {booking.notes && (
                <View style={[styles.notesSection, { backgroundColor: theme.primary + '10' }]}>
                  <ThemedText style={styles.notesLabel}>Notes</ThemedText>
                  <ThemedText style={styles.notesText}>{booking.notes}</ThemedText>
                </View>
              )}
            </GlassView>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 8,
  },
  bookingCard: {
    marginBottom: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingTitleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  colorBadge: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 12,
    marginTop: 4,
  },
  titleContent: {
    flex: 1,
  },
  bookingId: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
  },
  detailsGrid: {
    marginVertical: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesSection: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.7,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
