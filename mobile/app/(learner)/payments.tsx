import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassView } from '@/components/GlassView';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { learnerApi, getUser } from '@/services/api';
import { useLocalSearchParams } from 'expo-router';

export default function PaymentsScreen() {
  const { enrollmentId } = useLocalSearchParams<{ enrollmentId?: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const user = getUser();

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const fetchPayments = async () => {
    if (!user?.id) return;
    try {
      const data = await learnerApi.getMyPayments(user.id);
      setPayments(data);
    } catch (err) {
      console.error('Fetch payments error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handlePay = async (eId: string, amount: number) => {
    setPaying(true);
    try {
      await learnerApi.pay(eId, amount, 'Credit Card');
      Alert.alert('Success!', 'Payment processed successfully.');
      fetchPayments();
    } catch (err: any) {
      Alert.alert('Payment Failed', err.message || 'Could not process payment');
    } finally {
      setPaying(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={[theme.secondary + '18', theme.background]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* ── Header ── */}
          <Animated.View entering={FadeInDown.duration(700)} style={styles.header}>
            <View style={styles.headerRow}>
              <View style={[styles.headerIconBox, { backgroundColor: theme.secondary + '18' }]}>
                <Ionicons name="wallet" size={22} color={theme.secondary} />
              </View>
              <View style={styles.headerTextBlock}>
                <ThemedText style={styles.title}>Billing</ThemedText>
                <ThemedText style={styles.subtitle}>Manage fees and view payment history</ThemedText>
              </View>
            </View>
            <View style={[styles.headerDivider, { backgroundColor: theme.secondary + '20' }]} />
          </Animated.View>

          {/* ── Pending payment banner ── */}
          {enrollmentId && (
            <Animated.View entering={FadeInDown.delay(200)}>
              <GlassView style={[styles.pendingCard, { borderColor: theme.secondary + '60' }]}>
                <View style={styles.pendingTop}>
                  <Ionicons name="alert-circle" size={22} color={theme.secondary} />
                  <ThemedText style={styles.pendingTitle}>Payment Due</ThemedText>
                </View>
                <ThemedText style={styles.pendingSubtext}>
                  A course fee is outstanding. Please pay to continue your enrollment.
                </ThemedText>
                <TouchableOpacity
                  style={[styles.payNowBtn, { backgroundColor: theme.secondary }]}
                  onPress={() => handlePay(enrollmentId as string, 15000)}
                  disabled={paying}
                >
                  {paying
                    ? <ActivityIndicator color="#fff" />
                    : <ThemedText style={styles.payNowText}>Pay LKR 15,000</ThemedText>
                  }
                </TouchableOpacity>
              </GlassView>
            </Animated.View>
          )}

          {/* ── History ── */}
          <ThemedText style={styles.sectionTitle}>Transaction History</ThemedText>

          {loading ? (
            <ActivityIndicator size="large" color={theme.secondary} style={{ marginTop: 40 }} />
          ) : payments.length === 0 ? (
            <GlassView style={styles.emptyBox}>
              <Ionicons name="card-outline" size={50} color={theme.icon} style={{ opacity: 0.25 }} />
              <ThemedText style={styles.emptyText}>No transactions found.</ThemedText>
            </GlassView>
          ) : (
            payments.map((payment, i) => (
              <Animated.View key={payment.id} entering={FadeInDown.delay(250 + i * 80)}>
                <GlassView style={styles.txRow}>
                  <View style={[styles.txIcon, { backgroundColor: theme.secondary + '18' }]}>
                    <Ionicons name="receipt-outline" size={22} color={theme.secondary} />
                  </View>
                  <View style={styles.txInfo}>
                    <ThemedText style={styles.txName}>{payment.courseTitle || 'Driving Course'}</ThemedText>
                    <ThemedText style={styles.txDate}>
                      {new Date(payment.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </ThemedText>
                  </View>
                  <View style={styles.txRight}>
                    <ThemedText style={styles.txAmount}>
                      LKR {Number(payment.amount || 0).toLocaleString()}
                    </ThemedText>
                    <View style={styles.paidBadge}>
                      <ThemedText style={styles.paidText}>PAID</ThemedText>
                    </View>
                  </View>
                </GlassView>
              </Animated.View>
            ))
          )}

          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },

  header: { marginBottom: 22, paddingTop: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerIconBox: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  headerTextBlock: { flex: 1 },
  headerDivider: { height: 2, borderRadius: 1, marginTop: 16 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, opacity: 0.5, marginTop: 3, lineHeight: 18 },

  pendingCard: {
    padding: 20, borderRadius: 22, marginBottom: 24,
    borderWidth: 1.5,
  },
  pendingTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  pendingTitle: { fontSize: 16, fontWeight: '800', marginLeft: 10 },
  pendingSubtext: { fontSize: 13, opacity: 0.6, lineHeight: 19, marginBottom: 16 },
  payNowBtn: {
    height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  payNowText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 14 },

  txRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 20, marginBottom: 14,
  },
  txIcon: {
    width: 46, height: 46, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  txInfo: { flex: 1 },
  txName: { fontSize: 15, fontWeight: '700' },
  txDate: { fontSize: 12, opacity: 0.45, marginTop: 3 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: 15, fontWeight: '800' },
  paidBadge: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, marginTop: 4,
  },
  paidText: { fontSize: 10, fontWeight: '900', color: '#10B981' },

  emptyBox: { padding: 50, borderRadius: 28, alignItems: 'center', marginTop: 10 },
  emptyText: { fontSize: 15, opacity: 0.4, marginTop: 14, textAlign: 'center' },
});
