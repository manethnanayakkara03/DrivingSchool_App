import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ActivityIndicator, FlatList, Alert } from 'react-native';
import { instructorsApi, adminApi, learnersApi } from '@/services/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '../FormInput';
import { LinearGradient } from 'expo-linear-gradient';

interface BookingFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export const BookingForm: React.FC<BookingFormProps> = ({ visible, onClose, onSubmit, initialData }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [formData, setFormData] = useState({
    learnerId: '',
    learnerName: '',
    courseTitle: '',
    instructorName: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    examType: 'Practical',
    venue: '',
    passmark: '75',
    status: 'Pending',
  });

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [fetchingData, setFetchingData] = useState(false);
  const [studentPickerVisible, setStudentPickerVisible] = useState(false);
  const [instructorPickerVisible, setInstructorPickerVisible] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setFormData({
          ...formData,
          ...initialData,
        });
      } else {
        setFormData({
          learnerId: '',
          learnerName: '',
          courseTitle: '',
          instructorName: '',
          date: new Date().toISOString().split('T')[0],
          time: '10:00 AM',
          examType: 'Practical',
          venue: '',
          passmark: '75',
          status: 'Pending',
        });
      }
      fetchData();
    }
  }, [visible, initialData]);

  const fetchData = async () => {
    try {
      setFetchingData(true);
      const [enrollments, pending, allLearners, instructorsData] = await Promise.all([
        adminApi.getEnrolledStudents().catch(() => []),
        adminApi.getPendingEnrollments().catch(() => []),
        learnersApi.list().catch(() => []),
        instructorsApi.list().catch(() => [])
      ]);

      // Combine and unify student data from all sources
      const unifiedStudents = [
        ...(enrollments || []),
        ...(pending || []),
        ...(allLearners || [])
      ].reduce((acc: any[], curr: any) => {
        // Handle different field names between models
        const id = curr.learnerId || curr.idCode || curr._id;
        const name = curr.learnerName || curr.name;
        
        if (id && name && !acc.find(s => (s.learnerId || s.idCode || s._id) === id)) {
          acc.push({
            ...curr,
            learnerId: id,
            learnerName: name,
            courseTitle: curr.courseTitle || curr.course || 'General'
          });
        }
        return acc;
      }, []);

      setStudents(unifiedStudents);
      setInstructors(instructorsData || []);
    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setFetchingData(false);
    }
  };

  const validate = () => {
    let newErrors: any = {};
    if (!formData.learnerName) newErrors.learnerName = 'Student is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.venue) newErrors.venue = 'Venue is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setLoading(true);
      try {
        await onSubmit(formData);
      } catch (error: any) {
        console.error(error);
        Alert.alert('Form Error', error.message || 'Failed to process form');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderPicker = (label: string, value: string, options: string[], onSelect: (val: string) => void) => (
    <View style={styles.pickerContainer}>
      <Text style={[styles.pickerLabel, { color: theme.text }]}>{label}</Text>
      <View style={styles.pickerRow}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.pickerOption,
              { backgroundColor: theme.background, borderColor: value === opt ? theme.primary : theme.glassBorder },
              value === opt && { backgroundColor: `${theme.primary}20` }
            ]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[styles.pickerText, { color: value === opt ? theme.primary : theme.text }]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={styles.modalOverlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.glassBorder }]}>
          <View style={[styles.header, { borderBottomColor: theme.glassBorder }]}>
            <Text style={[styles.title, { color: theme.text }]}>{initialData ? 'Edit Booking' : 'New Booking'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Student Selector */}
            <Text style={[styles.pickerLabel, { color: theme.text }]}>Select Student</Text>
            <TouchableOpacity 
              style={[
                styles.dropdownTrigger, 
                { backgroundColor: theme.background, borderColor: errors.learnerName ? '#EF4444' : theme.glassBorder }
              ]}
              onPress={() => setStudentPickerVisible(true)}
            >
              <View style={styles.dropdownContent}>
                <Ionicons name="person-outline" size={20} color={theme.icon} style={{ marginRight: 10 }} />
                <Text style={{ color: formData.learnerName ? theme.text : theme.muted, fontSize: 16 }}>
                  {formData.learnerName || 'Tap to select student'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color={theme.muted} />
            </TouchableOpacity>
            {errors.learnerName && <Text style={styles.errorText}>{errors.learnerName}</Text>}
            
            {formData.learnerId && (
              <Text style={{ fontSize: 12, color: theme.muted, marginTop: 4, marginLeft: 4 }}>
                ID: {formData.learnerId} | Course: {formData.courseTitle}
              </Text>
            )}
            <View style={{ height: 16 }} />

            {/* Instructor Selector */}
            <Text style={[styles.pickerLabel, { color: theme.text }]}>Select Instructor</Text>
            <TouchableOpacity 
              style={[
                styles.dropdownTrigger, 
                { backgroundColor: theme.background, borderColor: theme.glassBorder }
              ]}
              onPress={() => setInstructorPickerVisible(true)}
            >
              <View style={styles.dropdownContent}>
                <Ionicons name="school-outline" size={20} color={theme.icon} style={{ marginRight: 10 }} />
                <Text style={{ color: formData.instructorName ? theme.text : theme.muted, fontSize: 16 }}>
                  {formData.instructorName || 'Tap to select instructor'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color={theme.muted} />
            </TouchableOpacity>
            <View style={{ height: 16 }} />

            {renderPicker('Exam Type', formData.examType, ['Written', 'Practical', 'Trial'], (v) => setFormData({...formData, examType: v}))}

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <FormInput
                  label="Date"
                  placeholder="YYYY-MM-DD"
                  icon="calendar-outline"
                  value={formData.date}
                  onChangeText={(t) => setFormData({...formData, date: t})}
                  error={errors.date}
                />
              </View>
              <View style={{ width: 16 }} />
              <View style={{ flex: 1 }}>
                <FormInput
                  label="Time"
                  placeholder="10:00 AM"
                  icon="time-outline"
                  value={formData.time}
                  onChangeText={(t) => setFormData({...formData, time: t})}
                  error={errors.time}
                />
              </View>
            </View>

            <FormInput
              label="Venue"
              placeholder="e.g. DMT Werahera"
              icon="location-outline"
              value={formData.venue}
              onChangeText={(t) => setFormData({...formData, venue: t})}
              error={errors.venue}
            />

            <FormInput
              label="Passmark"
              placeholder="e.g. 75"
              icon="star-outline"
              keyboardType="numeric"
              value={formData.passmark}
              onChangeText={(t) => setFormData({...formData, passmark: t})}
            />

            {renderPicker('Status', formData.status, ['Pending', 'Confirmed', 'Cancelled'], (v) => setFormData({...formData, status: v}))}

            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.glassBorder }]}>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
              <LinearGradient
                colors={[theme.primary, theme.secondary]}
                style={styles.gradientBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Save Booking</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Student Picker Overlay */}
        {studentPickerVisible && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.card, zIndex: 9999, paddingTop: Platform.OS === 'ios' ? 50 : 20 }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: theme.glassBorder }]}>
              <Text style={[styles.pickerTitle, { color: theme.text }]}>Select Student</Text>
              <TouchableOpacity onPress={() => setStudentPickerVisible(false)} style={{ padding: 8 }}>
                <Ionicons name="close" size={28} color={theme.icon} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={students}
              keyExtractor={(item, index) => (item._id || item.id || index).toString()}
              contentContainerStyle={{ paddingBottom: 40 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.itemRow, { borderBottomColor: theme.glassBorder }]}
                  onPress={() => {
                    setFormData(prev => ({
                      ...prev,
                      learnerId: item.learnerId || item.idCode || item._id,
                      learnerName: item.learnerName || item.name,
                      courseTitle: item.courseTitle || 'General'
                    }));
                    setStudentPickerVisible(false);
                  }}
                >
                  <View>
                    <Text style={[styles.itemMainText, { color: theme.text }]}>{item.learnerName || item.name}</Text>
                    <Text style={[styles.itemSubText, { color: theme.muted }]}>
                      {item.courseTitle || 'No active course'} | {item.learnerId || item.idCode || 'ID Pending'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.muted} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Ionicons name="people-outline" size={48} color={theme.muted} />
                  <Text style={{ marginTop: 12, color: theme.muted, textAlign: 'center' }}>No students found in the system</Text>
                </View>
              }
            />
          </View>
        )}

        {/* Instructor Picker Overlay */}
        {instructorPickerVisible && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.card, zIndex: 9999, paddingTop: Platform.OS === 'ios' ? 50 : 20 }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: theme.glassBorder }]}>
              <Text style={[styles.pickerTitle, { color: theme.text }]}>Select Instructor</Text>
              <TouchableOpacity onPress={() => setInstructorPickerVisible(false)} style={{ padding: 8 }}>
                <Ionicons name="close" size={28} color={theme.icon} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={instructors}
              keyExtractor={(item, index) => (item._id || item.id || index).toString()}
              contentContainerStyle={{ paddingBottom: 40 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.itemRow, { borderBottomColor: theme.glassBorder }]}
                  onPress={() => {
                    setFormData(prev => ({
                      ...prev,
                      instructorName: item.name
                    }));
                    setInstructorPickerVisible(false);
                  }}
                >
                  <View>
                    <Text style={[styles.itemMainText, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.itemSubText, { color: theme.muted }]}>{item.specialty || 'Instructor'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.muted} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{ padding: 40, textAlign: 'center', color: theme.muted }}>No instructors found</Text>}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formScroll: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: '30%'
  },
  pickerText: {
    fontWeight: '600',
    fontSize: 13,
  },
  dropdownTrigger: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  itemMainText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemSubText: {
    fontSize: 13,
    marginTop: 2
  }
});
