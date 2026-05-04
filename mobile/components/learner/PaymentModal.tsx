import React, { useState } from 'react';
import {
  Modal, View, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, Image,
  Dimensions
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { GlassView } from '@/components/GlassView';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { FormInput } from '@/components/admin/FormInput';
import { uploadApi } from '@/services/api';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';


const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  course: any;
  onComplete: (paymentData: any) => Promise<void>;
}

export function PaymentModal({ visible, onClose, course, onComplete }: PaymentModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [loading, setLoading] = useState(false);
  const [slipImage, setSlipImage] = useState<string | null>(null);

  // Card details state
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    holderName: '',
  });

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSlipImage(result.assets[0].uri);
    }
  };

  const handleComplete = async () => {
    if (paymentMethod === 'card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.holderName) {
        Alert.alert('Error', 'Please fill all card details');
        return;
      }
    } else {
      if (!slipImage) {
        Alert.alert('Error', 'Please upload your payment slip');
        return;
      }
    }

    setLoading(true);
    try {
      let finalSlipUrl = slipImage;
      
      // If we have a local slip image, upload it to Cloudinary first
      if (paymentMethod === 'cash' && slipImage && !slipImage.startsWith('http')) {
        const uploadRes = await uploadApi.uploadImage(slipImage);
        finalSlipUrl = uploadRes.url;
      }

      await onComplete({
        method: paymentMethod,
        ...(paymentMethod === 'card' ? { cardDetails } : { slipImage: finalSlipUrl }),
      });

      // Reset state for next time
      setCardDetails({ number: '', expiry: '', cvv: '', holderName: '' });
      setSlipImage(null);
      setPaymentMethod('card');
    } catch (err: any) {
      Alert.alert('Payment Failed', err.message || 'Error processing payment');
    } finally {
      setLoading(false);
    }
  };

  if (!course) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        
        <Animated.View entering={FadeInUp} style={styles.modalContent}>
          <GlassView style={styles.glassContainer}>
            <View style={styles.header}>
              <View>
                <ThemedText style={styles.headerTitle}>Course Enrollment</ThemedText>
                <ThemedText style={styles.headerSubtitle}>Secure Payment Gateway</ThemedText>
              </View>
              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.text + '10' }]}>
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              {/* Course Summary */}
              <View style={[styles.courseInfo, { backgroundColor: theme.secondary + '15' }]}>
                <View style={styles.courseHeader}>
                  <View style={[styles.courseIconBox, { backgroundColor: theme.secondary + '20' }]}>
                    <Ionicons name="car-sport" size={24} color={theme.secondary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <ThemedText style={styles.courseTitle}>{course.title}</ThemedText>
                    <ThemedText style={styles.coursePrice}>LKR {Number(course.price).toLocaleString()}</ThemedText>
                  </View>
                </View>
              </View>

              {/* Method Selection */}
              <ThemedText style={styles.sectionLabel}>Select Payment Method</ThemedText>
              <View style={styles.methodToggle}>
                <TouchableOpacity
                  style={[
                    styles.methodBtn,
                    paymentMethod === 'card' && { backgroundColor: theme.secondary, borderColor: theme.secondary },
                    { borderColor: theme.secondary + '40' }
                  ]}
                  onPress={() => setPaymentMethod('card')}
                >
                  <Ionicons name="card" size={20} color={paymentMethod === 'card' ? '#fff' : theme.secondary} />
                  <ThemedText style={[styles.methodBtnText, paymentMethod === 'card' && { color: '#fff' }]}>Card</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.methodBtn,
                    paymentMethod === 'cash' && { backgroundColor: theme.secondary, borderColor: theme.secondary },
                    { borderColor: theme.secondary + '40' }
                  ]}
                  onPress={() => setPaymentMethod('cash')}
                >
                  <Ionicons name="cash" size={20} color={paymentMethod === 'cash' ? '#fff' : theme.secondary} />
                  <ThemedText style={[styles.methodBtnText, paymentMethod === 'cash' && { color: '#fff' }]}>Cash / Slip</ThemedText>
                </TouchableOpacity>
              </View>

              {/* Dynamic Form Area */}
              <Animated.View layout={Layout.springify()} style={styles.formArea}>
                {paymentMethod === 'card' ? (
                  <Animated.View entering={FadeInDown} key="card-form">
                    <FormInput
                      label="Cardholder Name"
                      placeholder="John Doe"
                      icon="person-outline"
                      value={cardDetails.holderName}
                      onChangeText={(val) => setCardDetails(prev => ({ ...prev, holderName: val }))}
                    />
                    <FormInput
                      label="Card Number"
                      placeholder="0000 0000 0000 0000"
                      icon="card-outline"
                      keyboardType="numeric"
                      maxLength={19}
                      value={cardDetails.number}
                      onChangeText={(val) => setCardDetails(prev => ({ ...prev, number: val }))}
                    />
                    <View style={styles.row}>
                      <View style={{ flex: 1.2, marginRight: 12 }}>
                        <FormInput
                          label="Expiry Date"
                          placeholder="MM/YY"
                          icon="calendar-outline"
                          maxLength={5}
                          value={cardDetails.expiry}
                          onChangeText={(val) => setCardDetails(prev => ({ ...prev, expiry: val }))}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <FormInput
                          label="CVV"
                          placeholder="123"
                          icon="lock-closed-outline"
                          keyboardType="numeric"
                          maxLength={3}
                          secureTextEntry
                          value={cardDetails.cvv}
                          onChangeText={(val) => setCardDetails(prev => ({ ...prev, cvv: val }))}
                        />
                      </View>
                    </View>
                  </Animated.View>
                ) : (
                  <Animated.View entering={FadeInDown} key="cash-form" style={styles.cashContainer}>
                    <ThemedText style={styles.cashInstruction}>
                      Please deposit the course fee to the following bank account and upload the slip below.
                    </ThemedText>
                    <View style={[styles.bankDetails, { backgroundColor: theme.background + '80', borderColor: theme.secondary + '20' }]}>
                      <View style={styles.bankRow}>
                        <ThemedText style={styles.bankLabel}>Bank:</ThemedText>
                        <ThemedText style={styles.bankValue}>Commercial Bank</ThemedText>
                      </View>
                      <View style={styles.bankRow}>
                        <ThemedText style={styles.bankLabel}>Name:</ThemedText>
                        <ThemedText style={styles.bankValue}>Driving School (Pvt) Ltd</ThemedText>
                      </View>
                      <View style={styles.bankRow}>
                        <ThemedText style={styles.bankLabel}>Account:</ThemedText>
                        <ThemedText style={[styles.bankValue, { color: theme.secondary }]}>1000 2345 6789</ThemedText>
                      </View>
                    </View>

                    <TouchableOpacity 
                      style={[styles.uploadArea, { borderColor: theme.secondary + '30' }]} 
                      onPress={handlePickImage}
                    >
                      {slipImage ? (
                        <View style={styles.slipContainer}>
                          <Image source={{ uri: slipImage }} style={styles.slipPreview} />
                          <View style={styles.changeOverlay}>
                            <Ionicons name="camera" size={20} color="#fff" />
                            <ThemedText style={styles.changeText}>Change Slip</ThemedText>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.uploadPlaceholder}>
                          <View style={[styles.uploadIconCircle, { backgroundColor: theme.secondary + '15' }]}>
                            <Ionicons name="cloud-upload" size={32} color={theme.secondary} />
                          </View>
                          <ThemedText style={styles.uploadText}>Upload Payment Slip</ThemedText>
                          <ThemedText style={styles.uploadSubtext}>JPG, PNG or PDF (Max 5MB)</ThemedText>
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </Animated.View>

              <TouchableOpacity
                style={[styles.payBtn, { backgroundColor: theme.secondary }]}
                onPress={handleComplete}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <ThemedText style={styles.payBtnText}>
                      {paymentMethod === 'card' ? 'Pay & Enroll' : 'Complete Enrollment'}
                    </ThemedText>
                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </GlassView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  glassContainer: {
    borderRadius: 36,
    overflow: 'hidden',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 2,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    paddingBottom: 8,
  },
  courseInfo: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  coursePrice: {
    fontSize: 15,
    fontWeight: '700',
    opacity: 0.7,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 14,
    marginLeft: 4,
  },
  methodToggle: {
    flexDirection: 'row',
    marginBottom: 26,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodBtnText: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 10,
  },
  formArea: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
  },
  cashContainer: {
    paddingTop: 4,
  },
  cashInstruction: {
    fontSize: 14,
    opacity: 0.6,
    lineHeight: 21,
    marginBottom: 18,
  },
  bankDetails: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bankLabel: {
    fontSize: 14,
    opacity: 0.5,
    fontWeight: '600',
  },
  bankValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  uploadArea: {
    height: 180,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 15,
    fontWeight: '700',
    opacity: 0.8,
  },
  uploadSubtext: {
    fontSize: 12,
    opacity: 0.4,
    marginTop: 4,
  },
  slipContainer: {
    width: '100%',
    height: '100%',
  },
  slipPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  payBtn: {
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  payBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 17,
  },
});
