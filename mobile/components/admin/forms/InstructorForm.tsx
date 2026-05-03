import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '../FormInput';
import { LinearGradient } from 'expo-linear-gradient';

interface InstructorFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export const InstructorForm: React.FC<InstructorFormProps> = ({ visible, onClose, onSubmit, initialData }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    nic: initialData?.nic || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    password: '',
    licenseType: initialData?.licenseType || initialData?.licenceType || 'Dual',
    experience: initialData?.experience?.toString() || '',
    specialization: initialData?.specialization || '',
    salary: initialData?.salary || initialData?.monthlySalary || '',
    status: initialData?.status || 'Active',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    let newErrors: any = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.nic) newErrors.nic = 'NIC is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!initialData && !formData.password) newErrors.password = 'Password is required for new instructors';
    if (!formData.experience) newErrors.experience = 'Experience is required';
    if (!formData.salary) newErrors.salary = 'Salary is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setLoading(true);
      try {
        await onSubmit(formData);
      } catch (err) {
        console.error(err);
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
            <Text style={[styles.title, { color: theme.text }]}>{initialData ? 'Edit Instructor' : 'Add Instructor'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <FormInput
              label="Full Name"
              placeholder="e.g. Nimal Perera"
              icon="person-outline"
              value={formData.name}
              onChangeText={(t) => setFormData({...formData, name: t})}
              error={errors.name}
            />
            <FormInput
              label="NIC"
              placeholder="e.g. 951234567V"
              icon="id-card-outline"
              value={formData.nic}
              onChangeText={(t) => setFormData({...formData, nic: t})}
              error={errors.nic}
            />
            <FormInput
              label="Phone Number"
              placeholder="e.g. 0771234567"
              icon="call-outline"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(t) => setFormData({...formData, phone: t})}
              error={errors.phone}
            />
            <FormInput
              label="Email Address"
              placeholder="e.g. nimal@example.com"
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(t) => setFormData({...formData, email: t})}
              error={errors.email}
            />
            
            {!initialData && (
              <FormInput
                label="Temporary Password"
                placeholder="Required for login"
                icon="lock-closed-outline"
                secureTextEntry
                value={formData.password}
                onChangeText={(t) => setFormData({...formData, password: t})}
                error={errors.password}
              />
            )}

            {renderPicker('License Type', formData.licenseType, ['Manual', 'Auto', 'Dual'], (v) => setFormData({...formData, licenseType: v}))}

            <View style={styles.row}>
              <View style={styles.half}>
                <FormInput
                  label="Experience (Yrs)"
                  placeholder="e.g. 5"
                  icon="time-outline"
                  keyboardType="numeric"
                  value={formData.experience}
                  onChangeText={(t) => setFormData({...formData, experience: t})}
                  error={errors.experience}
                />
              </View>
              <View style={styles.half}>
                <FormInput
                  label="Monthly Salary"
                  placeholder="e.g. 50000"
                  icon="cash-outline"
                  keyboardType="numeric"
                  value={formData.salary}
                  onChangeText={(t) => setFormData({...formData, salary: t})}
                  error={errors.salary}
                />
              </View>
            </View>

            <FormInput
              label="Specialization"
              placeholder="e.g. Highway, Night Driving"
              icon="star-outline"
              value={formData.specialization}
              onChangeText={(t) => setFormData({...formData, specialization: t})}
            />

            {renderPicker('Status', formData.status, ['Active', 'Inactive'], (v) => setFormData({...formData, status: v}))}

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
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>{initialData ? 'Save Changes' : 'Create Instructor'}</Text>}
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
    gap: 12,
  },
  pickerOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  pickerText: {
    fontWeight: '600',
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
