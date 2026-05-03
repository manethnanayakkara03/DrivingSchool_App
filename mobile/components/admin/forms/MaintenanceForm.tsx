import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '../FormInput';
import { LinearGradient } from 'expo-linear-gradient';

interface MaintenanceFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ visible, onClose, onSubmit }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [formData, setFormData] = useState({
    vehicle: '',
    type: 'Service',
    date: new Date().toISOString().split('T')[0], // simple date default
    notes: '',
    estimatedCost: '',
    status: 'Pending',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    let newErrors: any = {};
    if (!formData.vehicle) newErrors.vehicle = 'Vehicle selection is required';
    if (!formData.date) newErrors.date = 'Date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setLoading(true);
      setTimeout(() => {
        onSubmit(formData);
        setLoading(false);
      }, 1000);
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
            <Text style={[styles.title, { color: theme.text }]}>Log Maintenance</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <FormInput
              label="Select Vehicle"
              placeholder="e.g. WP CAA-1234"
              icon="car-outline"
              value={formData.vehicle}
              onChangeText={(t) => setFormData({...formData, vehicle: t})}
              error={errors.vehicle}
            />

            {renderPicker('Maintenance Type', formData.type, ['Service', 'Repair', 'Inspection'], (v) => setFormData({...formData, type: v}))}

            <FormInput
              label="Date"
              placeholder="YYYY-MM-DD"
              icon="calendar-outline"
              value={formData.date}
              onChangeText={(t) => setFormData({...formData, date: t})}
              error={errors.date}
            />

            <FormInput
              label="Estimated Cost (LKR)"
              placeholder="e.g. 15000"
              icon="cash-outline"
              keyboardType="numeric"
              value={formData.estimatedCost}
              onChangeText={(t) => setFormData({...formData, estimatedCost: t})}
            />

            <FormInput
              label="Description / Notes"
              placeholder="Enter details..."
              icon="document-text-outline"
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top' }}
              value={formData.notes}
              onChangeText={(t) => setFormData({...formData, notes: t})}
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
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Submit</Text>}
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
    height: '85%',
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
