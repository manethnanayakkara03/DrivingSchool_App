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
import { resourceApi } from '@/services/api';

interface Payment {
  id: string;
  idCode: string;
  studentName: string;
  course: string;
  totalFee: string;
  amountPaid: string;
  balance: string;
  method: string;
  date: string;
  status: string;
  createdAt: string;
  color: string;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

export default function PaymentsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayments = useCallback(async () => {
    try {
      const data = await resourceApi('payments').list();
      const enhancedData = (data || []).map((item: any, idx: number) => {
        const totalFee = parseFloat(item.totalFee || '0');
        const amountPaid = parseFloat(item.amountPaid || '0');
        const balance = (totalFee - amountPaid).toFixed(2);
        return {
          ...item,
          balance: balance,
          color: COLORS[idx % COLORS.length],
        };
      });
      setPayments(enhancedData);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setPayments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const handleDelete = (payment: Payment) => {
    const confirmDelete = async () => {
      try {
        await resourceApi('payments').remove(payment.id);
        setPayments(prev => prev.filter(p => p.id !== payment.id));
        Alert.alert('Success', 'Payment record deleted successfully');
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to delete payment');
      }
    };

    if (Platform.OS === 'web') {
      // @ts-ignore
      if (window.confirm(`Delete payment for ${payment.studentName}?`)) confirmDelete();
    } else {
      Alert.alert('Delete Payment', `Delete payment record for ${payment.studentName}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete },
      ]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'overdue':
        return '#EF4444';
      default:
        return '#6B7280';
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
          <ThemedText style={styles.title}>Payments</ThemedText>
          <ThemedText style={styles.subtitle}>Payment records</ThemedText>
        </View>
        <View style={[styles.badge, { backgroundColor: theme.primary }]}>
          <ThemedText style={styles.badgeText}>{payments.length}</ThemedText>
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
            <ThemedText style={styles.emptyText}>Loading payments...</ThemedText>
          </View>
        ) : payments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cash-outline" size={48} color={theme.icon} />
            <ThemedText style={styles.emptyText}>No payments yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>Create your first payment record to get started</ThemedText>
          </View>
        ) : (
          payments.map((payment, idx) => (
            <GlassView key={payment.id} style={[styles.paymentCard, { borderLeftColor: payment.color }]}>
              {/* Header Row */}
              <View style={styles.paymentHeader}>
                <View style={styles.paymentTitleSection}>
                  <View style={[styles.colorBadge, { backgroundColor: payment.color }]} />
                  <View style={styles.titleContent}>
                    <ThemedText style={styles.paymentId}>{payment.idCode}</ThemedText>
                    <ThemedText style={styles.studentName}>{payment.studentName}</ThemedText>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDelete(payment)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {/* Details Grid */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Ionicons name="book-outline" size={16} color={theme.icon} />
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Course</ThemedText>
                    <ThemedText style={styles.detailValue}>{payment.course}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="cash-outline" size={16} color={theme.icon} />
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Total Fee</ThemedText>
                    <ThemedText style={styles.detailValue}>Rs. {payment.totalFee}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={theme.icon} />
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Amount Paid</ThemedText>
                    <ThemedText style={styles.detailValue}>Rs. {payment.amountPaid}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="swap-horizontal-outline" size={16} color={theme.icon} />
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Balance</ThemedText>
                    <ThemedText style={[styles.detailValue, { color: parseFloat(payment.balance) > 0 ? '#EF4444' : '#10B981' }]}>
                      Rs. {payment.balance}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="card-outline" size={16} color={theme.icon} />
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Method</ThemedText>
                    <ThemedText style={styles.detailValue}>{payment.method}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={16} color={theme.icon} />
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Date</ThemedText>
                    <ThemedText style={styles.detailValue}>{payment.date}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="flag-outline" size={16} color={theme.icon} />
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Status</ThemedText>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) + '20' }]}>
                      <ThemedText style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                        {payment.status}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>
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
  paymentCard: {
    marginBottom: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentTitleSection: {
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
  paymentId: {
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
