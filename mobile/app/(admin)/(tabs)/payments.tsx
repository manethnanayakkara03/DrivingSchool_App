import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput, RefreshControl, Text, TouchableOpacity, ScrollView, Modal, Image, Dimensions, ActivityIndicator } from 'react-native';
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
import { paymentsApi, adminApi } from '@/services/api';

import { Alert } from 'react-native';

export default function PaymentsPage() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All'); // All, Paid, Pending, Awaiting Approval
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);


  const fetchPayments = async () => {
    try {
      setLoading(true);
      const [paymentsData, pendingData] = await Promise.all([
        paymentsApi.list().catch(() => []),
        adminApi.getPendingEnrollments().catch(() => [])
      ]);
      
      const mappedPending = (pendingData || []).map((p: any) => ({
        ...p,
        _id: p._id || p.id,
        learner: p.learnerName,
        course: p.courseTitle,
        amount: p.price,
        status: 'Awaiting Approval',
        method: p.paymentMethod,
        date: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        isEnrollment: true
      }));

      const mappedPayments = (Array.isArray(paymentsData) ? paymentsData : []).map((p: any) => ({
        ...p,
        date: p.date || (p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A')
      }));

      setPayments([...mappedPending, ...mappedPayments]);
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

  const approveEnrollment = async (id: string) => {
    try {
      await adminApi.approveEnrollment(id);
      fetchPayments();
      Alert.alert('Success', 'Enrollment approved successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to approve enrollment');
    }
  };


  const handleDelete = (id: string, isEnrollment?: boolean) => {
    if (isEnrollment) {
      Alert.alert('Action Required', 'Please approve or reject this enrollment instead of deleting the record directly.');
      return;
    }

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
    if (status === 'Awaiting Approval') return theme.primary;
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
            <TouchableOpacity onPress={() => handleDelete(item._id, item.isEnrollment)} style={{ marginTop: 8 }}>
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

        {(item.paymentDetails?.slipImage || item.slipImage) && (
          <TouchableOpacity 
            style={[styles.slipPreviewBox, { backgroundColor: theme.background + '80' }]}
            onPress={() => {
              setSelectedSlip(item.paymentDetails?.slipImage || item.slipImage);
              setModalVisible(true);
            }}
          >
            <Ionicons name="image-outline" size={20} color={theme.primary} />
            <Text style={[styles.slipText, { color: theme.text }]}>View Bank Slip</Text>
          </TouchableOpacity>
        )}

        {item.status === 'Awaiting Approval' && (
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={[styles.payBtn, { backgroundColor: theme.primary }]} 
              onPress={() => approveEnrollment(item._id)}
            >
              <Ionicons name="checkmark-done-circle" size={18} color="#FFF" />
              <Text style={styles.payText}>Approve Enrollment</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'Pending' && !item.isEnrollment && (
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
  const pendingRevenue = payments.filter(p => p.status === 'Pending' || p.status === 'Awaiting Approval').reduce((sum, p) => sum + parseFloat(p.amountPaid || p.amount || '0'), 0);

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
            <Ionicons name="trending-up" size={60} color="rgba(255,255,255,0.3)" style={styles.summaryIcon} />
          </LinearGradient>
          
          <LinearGradient colors={['#10B981', '#059669']} style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Completed</Text>
            <Text style={styles.summaryValue}>{formatCurrency(completedRevenue)}</Text>
            <Ionicons name="checkmark-circle" size={60} color="rgba(255,255,255,0.3)" style={styles.summaryIcon} />
          </LinearGradient>
 
          <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Pending</Text>
            <Text style={styles.summaryValue}>{formatCurrency(pendingRevenue)}</Text>
            <Ionicons name="time" size={60} color="rgba(255,255,255,0.3)" style={styles.summaryIcon} />
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
          {renderFilterTab('Awaiting Approval')}
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

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Payment Slip</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.imageContainer}>
              {selectedSlip ? (
                <>
                  {imageLoading && (
                    <ActivityIndicator style={styles.loader} size="large" color={theme.primary} />
                  )}
                  <Image 
                    source={{ uri: selectedSlip }} 
                    style={styles.fullImage}
                    resizeMode="contain"
                    onLoadStart={() => setImageLoading(true)}
                    onLoadEnd={() => setImageLoading(false)}
                  />
                </>
              ) : (
                <Text style={{ color: theme.muted }}>No image available</Text>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.closeBtn, { backgroundColor: theme.primary }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Close Preview</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  courseText: {
    fontSize: 12,
    fontWeight: '500',
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
  slipPreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.1)',
  },
  slipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 24,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageContainer: {
    width: '100%',
    height: Dimensions.get('window').height * 0.6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  loader: {
    position: 'absolute',
    zIndex: 1,
  },
  closeBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

