import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '../FormInput';
import { LinearGradient } from 'expo-linear-gradient';
import { instructorsApi } from '@/services/api';

interface CourseFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export const CourseForm: React.FC<CourseFormProps> = ({ visible, onClose, onSubmit, initialData }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  // Helper to parse duration string (e.g. "30 Days")
  const parseDuration = (dur: string) => {
    if (!dur) return { value: '', unit: 'Days' };
    const parts = dur.split(' ');
    return {
      value: parts[0] || '',
      unit: parts[1] || 'Days'
    };
  };

  const initialDuration = parseDuration(initialData?.duration);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    durationValue: initialDuration.value,
    durationUnit: initialDuration.unit,
    price: initialData?.price?.toString() || '',
    assignedInstructor: initialData?.assignedInstructor || '',
    maxLearners: initialData?.maxLearners?.toString() || '50',
    status: initialData?.status || 'Active',
    type: initialData?.type || 'manual',
    totalTasks: initialData?.totalTasks?.toString() || '10',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [instructors, setInstructors] = useState<any[]>([]);
  const [fetchingInstructors, setFetchingInstructors] = useState(false);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setFetchingInstructors(true);
        const data = await instructorsApi.list();
        setInstructors(data);
      } catch (err) {
        console.error('Fetch instructors error:', err);
      } finally {
        setFetchingInstructors(false);
      }
    };
    fetchInstructors();
  }, []);

  const validate = () => {
    let newErrors: any = {};
    if (!formData.title) newErrors.title = 'Course title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.durationValue) newErrors.durationValue = 'Duration is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setLoading(true);
      // Construct final object
      const finalData = {
        ...formData,
        price: Number(formData.price),
        maxLearners: Number(formData.maxLearners),
        totalTasks: Number(formData.totalTasks),
        duration: `${formData.durationValue} ${formData.durationUnit}`,
      };
      
      // Remove helper fields not needed in backend
      delete (finalData as any).durationValue;
      delete (finalData as any).durationUnit;

      try {
        await onSubmit(finalData);
      } catch (err) {
        console.error('Form submit error:', err);
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
            <Text style={[styles.title, { color: theme.text }]}>{initialData ? 'Edit Course' : 'Create Course'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <FormInput
              label="Course Title"
              placeholder="e.g. Basic Driving Package"
              icon="book-outline"
              value={formData.title}
              onChangeText={(t) => setFormData({...formData, title: t})}
              error={errors.title}
            />

            <FormInput
              label="Description"
              placeholder="Enter course details..."
              icon="document-text-outline"
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top' }}
              value={formData.description}
              onChangeText={(t) => setFormData({...formData, description: t})}
              error={errors.description}
            />
            
            <View style={styles.row}>
              <View style={[styles.half, { width: '40%' }]}>
                <FormInput
                  label="Duration"
                  placeholder="e.g. 30"
                  keyboardType="numeric"
                  value={formData.durationValue}
                  onChangeText={(t) => setFormData({...formData, durationValue: t})}
                  error={errors.durationValue}
                />
              </View>
              <View style={[styles.half, { width: '55%', marginTop: -5 }]}>
                {renderPicker('Unit', formData.durationUnit, ['Days', 'Weeks', 'Months'], (v) => setFormData({...formData, durationUnit: v}))}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <FormInput
                  label="Price (LKR)"
                  placeholder="e.g. 25000"
                  icon="cash-outline"
                  keyboardType="numeric"
                  value={formData.price}
                  onChangeText={(t) => setFormData({...formData, price: t})}
                  error={errors.price}
                />
              </View>
              <View style={styles.half}>
                <FormInput
                  label="Max Learners"
                  placeholder="e.g. 50"
                  icon="people-outline"
                  keyboardType="numeric"
                  value={formData.maxLearners}
                  onChangeText={(t) => setFormData({...formData, maxLearners: t})}
                />
              </View>
            </View>

            {fetchingInstructors ? (
              <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 10 }} />
            ) : (
              renderPicker(
                'Assign Instructor (Optional)', 
                formData.assignedInstructor, 
                ['None', ...instructors.map(ins => ins.name)], 
                (v) => setFormData({...formData, assignedInstructor: v === 'None' ? '' : v})
              )
            )}

            {renderPicker('Transmission Type', formData.type, ['manual', 'auto', 'both'], (v) => setFormData({...formData, type: v}))}

            <FormInput
              label="Total Lessons / Tasks"
              placeholder="e.g. 15"
              icon="list-outline"
              keyboardType="numeric"
              value={formData.totalTasks}
              onChangeText={(t) => setFormData({...formData, totalTasks: t})}
            />

            {renderPicker('Status', formData.status, ['Active', 'Draft', 'Archived'], (v) => setFormData({...formData, status: v}))}

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
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>{initialData ? 'Save Changes' : 'Create Course'}</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
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
    height: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
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
    justifyContent: 'space-between',
  },
  half: {
    width: '48%',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
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
  },
  pickerText: {
    fontWeight: '600',
    fontSize: 13,
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
});
