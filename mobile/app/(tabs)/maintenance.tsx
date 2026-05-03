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

interface Maintenance {
  id: string;
  idCode: string;
  vehicleId: string;
  serviceDate: string;
  serviceType: string;
  nextServiceDate: string;
  description: string;
  cost: string;
  maintainerName: string;
  createdAt: string;
  color: string;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

export default function MaintenanceScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMaintenance = useCallback(async () => {
    try {
      const data = await resourceApi('maintenance').list();
      const enhancedData = (data || []).map((item: any, idx: number) => ({
        ...item,
        color: COLORS[idx % COLORS.length],
      }));
      setMaintenance(enhancedData);
    } catch (err) {
      console.error('Failed to fetch maintenance:', err);
      setMaintenance([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMaintenance();
  }, [fetchMaintenance]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMaintenance();
  };

  const handleDelete = (item: Maintenance) => {
    const confirmDelete = async () => {
      try {
        await resourceApi('maintenance').remove(item.id);
        setMaintenance(prev => prev.filter(m => m.id !== item.id));
        Alert.alert('Success', 'Maintenance record deleted successfully');
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to delete maintenance record');
      }
    };

    if (Platform.OS === 'web') {
      // @ts-ignore
      if (window.confirm(`Delete maintenance record for ${item.vehicleId}?`)) confirmDelete();
    } else {
      Alert.alert('Delete Record', `Delete maintenance record for ${item.vehicleId}?`, [
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
          <ThemedText style={styles.title}>Maintenance</ThemedText>
          <ThemedText style={styles.subtitle}>Service records</ThemedText>
        </View>
        <View style={[styles.badge, { backgroundColor: theme.primary }]}>
          <ThemedText style={styles.badgeText}>{maintenance.length}</ThemedText>
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
            <ThemedText style={styles.emptyText}>Loading records...</ThemedText>
          </View>
        ) : maintenance.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="settings-outline" size={48} color={theme.icon} />
            <ThemedText style={styles.emptyText}>No maintenance records</ThemedText>
            <ThemedText style={styles.emptySubtext}>Create your first service record to get started</ThemedText>
          </View>
        ) : (
          maintenance.map((item, idx) => (
            <GlassView key={item.id} style={[styles.maintenanceCard, { borderLeftColor: item.color }]}>
              {/* Header Row */}
              <View style={styles.maintenanceHeader}>
                <View style={styles.maintenanceTitleSection}>
                  <View style={[styles.colorBadge, { backgroundColor: item.color }]} />
                  <View style={styles.titleContent}>
                    <ThemedText style={styles.maintenanceId}>{item.idCode}</ThemedText>
                    <ThemedText style={styles.vehicleId}>{item.vehicleId}</ThemedText>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {/* Details Grid */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Ionicons name="build-outline" size={16} color={theme.icon} />
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Service Type</ThemedText>
                    <ThemedText style={styles.detailValue}>{item.serviceType}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={16} color={theme.icon} />
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Service Date</ThemedText>
                    <ThemedText style={styles.detailValue}>{item.serviceDate}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="checkmark-done-outline" size={16} color={theme.icon} />
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Next Service</ThemedText>
                    <ThemedText style={styles.detailValue}>{item.nextServiceDate}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="person-outline" size={16} color={theme.icon} />
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Maintainer</ThemedText>
                    <ThemedText style={styles.detailValue}>{item.maintainerName}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="cash-outline" size={16} color={theme.icon} />
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Cost</ThemedText>
                    <ThemedText style={styles.detailValue}>Rs. {item.cost}</ThemedText>
                  </View>
                </View>
              </View>

              {/* Description */}
              {item.description && (
                <View style={[styles.descriptionSection, { backgroundColor: theme.primary + '10' }]}>
                  <ThemedText style={styles.descriptionLabel}>Description</ThemedText>
                  <ThemedText style={styles.descriptionText}>{item.description}</ThemedText>
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
  maintenanceCard: {
    marginBottom: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  maintenanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  maintenanceTitleSection: {
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
  maintenanceId: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  vehicleId: {
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
  descriptionSection: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.7,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
