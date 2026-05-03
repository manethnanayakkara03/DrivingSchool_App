import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '../FormInput';
import { LinearGradient } from 'expo-linear-gradient';

interface VehicleFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({ visible, onClose, onSubmit, initialData }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [formData, setFormData] = useState({
    registrationNumber: initialData?.registrationNumber || '',
    maker: initialData?.maker || '',
    model: initialData?.model || '',
    year: initialData?.year?.toString() || '',
    transmission: initialData?.transmission || 'Manual',
    fuelType: initialData?.fuelType || 'Petrol',
    assignedInstructor: initialData?.assignedInstructor || '',
    status: initialData?.status || 'Active',
    condition: initialData?.condition || 'Good',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    let newErrors: any = {};
    if (!formData.registrationNumber) newErrors.registrationNumber = 'Reg number is required';
    if (!formData.maker) newErrors.maker = 'Make is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.year) newErrors.year = 'Year is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setLoading(true);
      try {
        await onSubmit(formData);
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
            <Text style={[styles.title, { color: theme.text }]}>{initialData ? 'Edit Vehicle' : 'Add Vehicle'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <FormInput
              label="Registration Number"
              placeholder="e.g. WP CAA-1234"
              icon="car-sport-outline"
              value={formData.registrationNumber}
              onChangeText={(t) => setFormData({...formData, registrationNumber: t})}
              error={errors.registrationNumber}
            />
            
            <View style={styles.row}>
              <View style={styles.half}>
                <FormInput
                  label="Make"
                  placeholder="e.g. Toyota"
                  value={formData.maker}
                  onChangeText={(t) => setFormData({...formData, maker: t})}
                  error={errors.maker}
                />
              </View>
              <View style={styles.half}>
                <FormInput
                  label="Model"
                  placeholder="e.g. Prius"
                  value={formData.model}
                  onChangeText={(t) => setFormData({...formData, model: t})}
                  error={errors.model}
                />
              </View>
            </View>

            <FormInput
              label="Year"
              placeholder="e.g. 2018"
              icon="calendar-outline"
              keyboardType="numeric"
              value={formData.year}
              onChangeText={(t) => setFormData({...formData, year: t})}
              error={errors.year}
            />

            {renderPicker('Transmission', formData.transmission, ['Manual', 'Automatic'], (v) => setFormData({...formData, transmission: v}))}
            {renderPicker('Fuel Type', formData.fuelType, ['Petrol', 'Diesel', 'Electric', 'Hybrid'], (v) => setFormData({...formData, fuelType: v}))}
            {renderPicker('Condition', formData.condition, ['Good', 'Fair', 'Poor'], (v) => setFormData({...formData, condition: v}))}
            {renderPicker('Status', formData.status, ['Active', 'Inactive', 'Under Maintenance'], (v) => setFormData({...formData, status: v}))}

            <FormInput
              label="Assigned Instructor"
              placeholder="e.g. Sarath Kumara"
              icon="person-outline"
              value={formData.assignedInstructor}
              onChangeText={(t) => setFormData({...formData, assignedInstructor: t})}
            />

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
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>{initialData ? 'Save Changes' : 'Add Vehicle'}</Text>}
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
    marginBottom: 8,
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
