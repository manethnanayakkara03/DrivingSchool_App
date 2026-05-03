import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Dimensions
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
import { PaymentModal } from '@/components/learner/PaymentModal';


export default function CoursesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const user = getUser();

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);


  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const data = await learnerApi.getCourses();
      setCourses(data);
    } catch (err) {
      console.error('Fetch courses error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = (course: any) => {
    if (!user?.id) { Alert.alert('Error', 'Please login to enroll'); return; }
    setSelectedCourse(course);
    setPaymentVisible(true);
  };

  const handlePaymentComplete = async (paymentData: any) => {
    if (!user?.id || !selectedCourse) return;
    
    setEnrolling(selectedCourse.id);
    try {
      // paymentData contains method, cardDetails or slipImage
      // We can send this to the backend
      await learnerApi.enroll(user.id, selectedCourse.id, paymentData);
      
      Alert.alert(
        'Success!', 
        paymentData.method === 'card' 
          ? 'Payment successful and course enrolled.' 
          : 'Enrollment requested. Once your slip is verified, you can start the course.',
        [{ text: 'Great', onPress: () => setPaymentVisible(false) }]
      );
    } catch (err: any) {
      Alert.alert('Enrollment Failed', err.message || 'Could not complete enrollment');
      throw err; // So the modal knows it failed
    } finally {
      setEnrolling(null);
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
                <Ionicons name="car-sport" size={22} color={theme.secondary} />
              </View>
              <View style={styles.headerTextBlock}>
                <ThemedText style={styles.title}>Course Catalog</ThemedText>
                <ThemedText style={styles.subtitle}>Pick a course and start your driving journey</ThemedText>
              </View>
            </View>
            <View style={[styles.headerDivider, { backgroundColor: theme.secondary + '20' }]} />
          </Animated.View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.secondary} style={{ marginTop: 60 }} />
          ) : courses.length === 0 ? (
            <GlassView style={styles.emptyBox}>
              <Ionicons name="car-outline" size={50} color={theme.icon} style={{ opacity: 0.25 }} />
              <ThemedText style={styles.emptyText}>No courses available yet.</ThemedText>
            </GlassView>
          ) : (
            courses.map((course, i) => (
              <Animated.View key={course.id} entering={FadeInDown.delay(150 + i * 100)}>
                <GlassView style={styles.courseCard}>
                  {/* Card Top */}
                  <View style={styles.cardTop}>
                    <View style={[styles.iconBox, { backgroundColor: theme.secondary + '1A' }]}>
                      <Ionicons name="car-sport" size={28} color={theme.secondary} />
                    </View>
                    <View style={styles.pricePill}>
                      <ThemedText style={styles.priceText}>
                        LKR {Number(course.price || 0).toLocaleString()}
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedText style={styles.courseName}>{course.title}</ThemedText>
                  <ThemedText style={styles.courseDesc}>{course.description}</ThemedText>

                  {/* Features */}
                  <View style={styles.featureRow}>
                    <View style={styles.featureChip}>
                      <Ionicons name="time-outline" size={14} color={theme.icon} />
                      <ThemedText style={styles.featureText}>{course.duration || 'Flexible'}</ThemedText>
                    </View>
                    <View style={styles.featureChip}>
                      <Ionicons name="ribbon-outline" size={14} color={theme.icon} />
                      <ThemedText style={styles.featureText}>Certificate</ThemedText>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.enrollBtn, { backgroundColor: theme.secondary }]}
                    onPress={() => handleEnroll(course)}
                    disabled={enrolling === course.id}
                  >

                    {enrolling === course.id
                      ? <ActivityIndicator color="#fff" />
                      : <>
                          <ThemedText style={styles.enrollBtnText}>Enroll Now</ThemedText>
                          <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 8 }} />
                        </>
                    }
                  </TouchableOpacity>
                </GlassView>
              </Animated.View>
            ))
          )}

          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>

      <PaymentModal
        visible={paymentVisible}
        onClose={() => setPaymentVisible(false)}
        course={selectedCourse}
        onComplete={handlePaymentComplete}
      />
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

  courseCard: { padding: 20, borderRadius: 24, marginBottom: 16 },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 18,
  },
  iconBox: {
    width: 58, height: 58, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  pricePill: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12,
  },
  priceText: { color: '#10B981', fontWeight: '800', fontSize: 14 },
  courseName: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  courseDesc: { fontSize: 14, opacity: 0.6, lineHeight: 21, marginBottom: 18 },

  featureRow: { flexDirection: 'row', marginBottom: 22 },
  featureChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 10, marginRight: 10,
  },
  featureText: { fontSize: 12, fontWeight: '600', opacity: 0.65, marginLeft: 5 },

  enrollBtn: {
    height: 52, borderRadius: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    elevation: 3,
  },
  enrollBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  emptyBox: { padding: 50, borderRadius: 28, alignItems: 'center', marginTop: 20 },
  emptyText: { fontSize: 15, opacity: 0.4, marginTop: 14, textAlign: 'center' },
});
