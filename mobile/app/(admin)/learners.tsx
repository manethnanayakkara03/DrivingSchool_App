import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput, RefreshControl, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '@/components/admin/SectionHeader';
import { GlassCard } from '@/components/admin/GlassCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { LinearGradient } from 'expo-linear-gradient';
import { learnersApi } from '@/services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';

export default function LearnersPage() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const [learners, setLearners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Delete state
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [learnerToDelete, setLearnerToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLearners = async () => {
    try {
      setLoading(true);
      const data = await learnersApi.list();
      setLearners(data);
    } catch (error: any) {
      console.error('Fetch learners error:', error);
      Alert.alert('Error', error.message || 'Failed to fetch learners');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLearners();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLearners();
  };

  const handleDeletePrompt = (learner: any) => {
    setLearnerToDelete(learner);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!learnerToDelete) return;
    
    try {
      setIsDeleting(true);
      await learnersApi.remove(learnerToDelete._id || learnerToDelete.id);
      setLearners(prev => prev.filter(l => (l._id || l.id) !== (learnerToDelete._id || learnerToDelete.id)));
      setDeleteDialogVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete learner');
    } finally {
      setIsDeleting(false);
      setLearnerToDelete(null);
    }
  };

  const filteredLearners = learners.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.nic && l.nic.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderItem = ({ item }: { item: any }) => (
    <GlassCard borderRadius={16} contentStyle={styles.cardContent} accentColor={item.status === 'Active' ? theme.success : '#EF4444'}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarRow}>
          <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </LinearGradient>
          <View>
            <Text style={[styles.learnerName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.learnerNic, { color: theme.muted }]}>{item.nic || 'No NIC'}</Text>
          </View>
        </View>
        <StatusBadge status={item.status || 'Active'} />
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="call-outline" size={16} color={theme.icon} />
          <Text style={[styles.detailText, { color: theme.muted }]}>{item.phone || 'No phone'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="mail-outline" size={16} color={theme.icon} />
          <Text style={[styles.detailText, { color: theme.muted }]}>{item.email || 'No email'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={theme.icon} />
          <Text style={[styles.detailText, { color: theme.muted }]}>
            Joined: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeletePrompt(item)}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <SectionHeader 
          title="Learners" 
          subtitle="Manage all registered students"
          showMenuButton={true}
          onMenuPress={() => navigation.openDrawer()}
        />
        <View style={[styles.countBadge, { backgroundColor: `${theme.primary}20` }]}>
          <Text style={[styles.countText, { color: theme.primary }]}>{learners.length} Total</Text>
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

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredLearners}
          keyExtractor={item => item._id || item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
          ListEmptyComponent={
            <EmptyState 
              icon="people-outline" 
              title="No Learners Found" 
              message="There are no learners matching your search criteria." 
            />
          }
        />
      )}

      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Delete Learner"
        message={`Are you sure you want to delete ${learnerToDelete?.name}? This will permanently remove their record from the database.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogVisible(false)}
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
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
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  learnerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  learnerNic: {
    fontSize: 14,
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
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
