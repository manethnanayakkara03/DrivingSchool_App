import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput, RefreshControl, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '@/components/admin/SectionHeader';
import { GlassCard } from '@/components/admin/GlassCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { paymentsApi } from '@/services/api';
import { Alert } from 'react-native';

export default function PaymentsPage() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All'); // All, Paid, Pending, Overdue

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentsApi.list();
      setPayments(data);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const markAsPaid = async (id: string) => {
    try {
      await paymentsApi.update(id, { status: 'Paid' });
      fetchPayments();
      Alert.alert('Success', 'Payment marked as paid');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update payment');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Payment',
      'Are you sure you want to delete this payment record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await paymentsApi.remove(id);
              fetchPayments();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete payment');
            }
          }
        }
      ]
    );
  };

  const filteredPayments = payments.filter(p => {
    const name = p.studentName || p.learner || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'All' || p.status === filter;
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
    if (status === 'Paid') return theme.success;
    if (status === 'Overdue') return '#EF4444';
    return '#F59E0B'; // Pending
  };

  const formatCurrency = (amount: number) => `LKR ${amount.toLocaleString()}`;

  const renderItem = ({ item }: { item: any }) => {
    const name = item.studentName || item.learner || 'Unknown';
    const amount = parseFloat(item.amountPaid || item.amount || '0');
    
    return (
      <GlassCard borderRadius={16} contentStyle={styles.cardContent} accentColor={getAccentColor(item.status)}>
        <View style={styles.cardHeader}>
          <View style={styles.learnerRow}>
            <View style={[styles.avatar, { backgroundColor: `${theme.primary}20` }]}>
              <Text style={[styles.avatarText, { color: theme.primary }]}>{name.charAt(0)}</Text>
            </View>
            <View>
              <Text style={[styles.learnerName, { color: theme.text }]}>{name}</Text>
              <Text style={[styles.courseText, { color: theme.muted, fontSize: 12 }]}>{item.course || 'General'}</Text>
              <Text style={[styles.dateText, { color: theme.muted }]}>{item.date}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.amountText, { color: theme.text }]}>{formatCurrency(amount)}</Text>
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={{ marginTop: 8 }}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.methodContainer}>
            <Ionicons 
              name={item.method === 'Cash' ? 'cash-outline' : item.method === 'Card' ? 'card-outline' : 'globe-outline'} 
              size={16} 
              color={theme.icon} 
            />
            <Text style={[styles.methodText, { color: theme.muted }]}>{item.method}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        {item.status !== 'Paid' && (
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={[styles.payBtn, { backgroundColor: theme.success }]} 
              onPress={() => markAsPaid(item._id)}
            >
              <Ionicons name="checkmark-circle" size={18} color="#FFF" />
              <Text style={styles.payText}>Mark as Paid</Text>
            </TouchableOpacity>
          </View>
        )}
      </GlassCard>
    );
  };

  const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amountPaid || p.amount || '0'), 0);
  const completedRevenue = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + parseFloat(p.amountPaid || p.amount || '0'), 0);
  const pendingRevenue = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + parseFloat(p.amountPaid || p.amount || '0'), 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <SectionHeader 
          title="Payments" 
          subtitle="Revenue and transaction history"
          showMenuButton={true}
          onMenuPress={() => navigation.openDrawer()}
        />
      </View>

      <View style={styles.summaryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryScroll}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Total Revenue</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalRevenue)}</Text>
            <Ionicons name="trending-up" size={24} color="rgba(255,255,255,0.3)" style={styles.summaryIcon} />
          </LinearGradient>
          
          <LinearGradient colors={['#10B981', '#059669']} style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Completed</Text>
            <Text style={styles.summaryValue}>{formatCurrency(completedRevenue)}</Text>
            <Ionicons name="checkmark-circle" size={24} color="rgba(255,255,255,0.3)" style={styles.summaryIcon} />
          </LinearGradient>
 
          <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Pending</Text>
            <Text style={styles.summaryValue}>{formatCurrency(pendingRevenue)}</Text>
            <Ionicons name="time" size={24} color="rgba(255,255,255,0.3)" style={styles.summaryIcon} />
          </LinearGradient>
        </ScrollView>
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterTab('All')}
          {renderFilterTab('Paid')}
          {renderFilterTab('Pending')}
          {renderFilterTab('Overdue')}
        </ScrollView>
      </View>

      <FlatList
        data={filteredPayments}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState 
              icon="cash-outline" 
              title="No Payments Found" 
              message="There are no payments matching your criteria." 
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
  summaryContainer: {
    marginBottom: 16,
  },
  summaryScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  summaryCard: {
    width: 150,
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  summaryTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryIcon: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    fontSize: 60,
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
    marginRight: 8,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  learnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  methodText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 16,
    marginTop: 16,
    alignItems: 'flex-end',
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  payText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
