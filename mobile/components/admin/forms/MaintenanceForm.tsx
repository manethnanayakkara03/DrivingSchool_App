import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ActivityIndicator, FlatList } from 'react-native';
import { vehiclesApi } from '@/services/api';
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
    vehicleModel: '',
    type: 'Service',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    cost: '',
    status: 'Pending',
  });

  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [fetchingVehicles, setFetchingVehicles] = useState(false);
  const [vehiclePickerVisible, setVehiclePickerVisible] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (visible) {
      fetchVehicles();
    }
  }, [visible]);

  const fetchVehicles = async () => {
    try {
      setFetchingVehicles(true);
      const data = await vehiclesApi.list();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setFetchingVehicles(false);
    }
  };

  const validateField = (name: string, value: any) => {
    let error = '';
    const trimmedValue = value?.toString().trim() || '';

    switch (name) {
      case 'vehicle':
        if (!trimmedValue) error = 'Vehicle selection is required';
        break;
      case 'vehicleModel':
        if (!trimmedValue) error = 'Vehicle model is required';
        else if (trimmedValue.length < 2) error = 'Model name too short (min 2 chars)';
        else if (trimmedValue.length > 50) error = 'Model name too long (max 50 chars)';
        break;
      case 'type':
        if (!trimmedValue) error = 'Maintenance type is required';
        break;
      case 'date':
        if (!trimmedValue) {
          error = 'Date is required';
        } else {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(trimmedValue)) {
            error = 'Invalid format (YYYY-MM-DD)';
          } else {
            const date = new Date(trimmedValue);
            const now = new Date();
            
            // Basic validity check
            if (isNaN(date.getTime())) {
              error = 'Invalid date';
            } else {
              // Range check
              const minDate = new Date();
              minDate.setFullYear(now.getFullYear() - 5); // 5 years ago
              const maxDate = new Date();
              maxDate.setFullYear(now.getFullYear() + 1); // 1 year ahead
              
              if (date < minDate) {
                error = 'Date cannot be more than 5 years in the past';
              } else if (date > maxDate) {
                error = 'Date cannot be more than 1 year in the future';
              }
            }
          }
        }
        break;
      case 'cost':
        if (!trimmedValue) {
          error = 'Cost is required';
        } else {
          const costNum = parseFloat(trimmedValue);
          if (isNaN(costNum)) {
            error = 'Please enter a valid number';
          } else if (costNum <= 0) {
            error = 'Cost must be greater than 0';
          } else if (costNum > 1000000) {
            error = 'Cost cannot exceed 1,000,000 LKR';
          }
        }
        break;
      case 'notes':
        if (!trimmedValue) {
          error = 'Description is required';
        } else if (trimmedValue.length < 10) {
          error = 'Description too short (min 10 chars)';
        } else if (trimmedValue.length > 500) {
          error = 'Description too long (max 500 chars)';
        }
        break;
    }
    return error;
  };

  const updateField = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev: any) => ({ ...prev, [name]: error }));
  };

  const validate = () => {
    const fields = ['vehicle', 'vehicleModel', 'type', 'date', 'cost', 'notes'];
    const newErrors: any = {};
    let isValid = true;

    fields.forEach(field => {
      const error = validateField(field, (formData as any)[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setLoading(true);
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderPicker = (label: string, value: string, options: string[], onSelect: (val: string) => void, error?: string) => (
    <View style={styles.pickerContainer}>
      <Text style={[styles.pickerLabel, { color: theme.text }]}>{label}</Text>
      <View style={styles.pickerRow}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.pickerOption,
              { backgroundColor: theme.background, borderColor: value === opt ? theme.primary : (error ? '#EF4444' : theme.glassBorder) },
              value === opt && { backgroundColor: `${theme.primary}20` }
            ]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[styles.pickerText, { color: value === opt ? theme.primary : theme.text }]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
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
            <Text style={[styles.pickerLabel, { color: theme.text }]}>Select Vehicle</Text>
            <TouchableOpacity 
              style={[
                styles.dropdownTrigger, 
                { backgroundColor: theme.background, borderColor: errors.vehicle ? '#EF4444' : theme.glassBorder }
              ]}
              onPress={() => setVehiclePickerVisible(true)}
            >
              <View style={styles.dropdownContent}>
                <Ionicons name="car-outline" size={20} color={theme.icon} style={{ marginRight: 10 }} />
                <Text style={{ color: formData.vehicle ? theme.text : theme.muted, fontSize: 16 }}>
                  {formData.vehicle || 'Tap to select vehicle'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color={theme.muted} />
            </TouchableOpacity>
            {errors.vehicle && <Text style={styles.errorText}>{errors.vehicle}</Text>}
            <View style={{ height: 16 }} />

            <FormInput
              label="Vehicle Model"
              placeholder="e.g. Toyota Prius"
              icon="information-circle-outline"
              value={formData.vehicleModel}
              onChangeText={(t) => updateField('vehicleModel', t)}
              error={errors.vehicleModel}
            />

            {renderPicker('Maintenance Type', formData.type, ['Service', 'Repair', 'Inspection'], (v) => updateField('type', v), errors.type)}

            <FormInput
              label="Date"
              placeholder="YYYY-MM-DD"
              icon="calendar-outline"
              value={formData.date}
              onChangeText={(t) => updateField('date', t)}
              error={errors.date}
            />

            <FormInput
              label="Cost (LKR)"
              placeholder="e.g. 15000"
              icon="cash-outline"
              keyboardType="numeric"
              value={formData.cost}
              onChangeText={(t) => updateField('cost', t)}
              error={errors.cost}
            />

            <FormInput
              label="Description / Notes"
              placeholder="Enter details..."
              icon="document-text-outline"
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top' }}
              value={formData.notes}
              onChangeText={(t) => updateField('notes', t)}
              error={errors.notes}
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

      {/* Vehicle Selection Modal */}
      <Modal visible={vehiclePickerVisible} transparent animationType="fade">
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerModal, { backgroundColor: theme.card, borderColor: theme.glassBorder }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: theme.glassBorder }]}>
              <Text style={[styles.pickerTitle, { color: theme.text }]}>Select Vehicle</Text>
              <TouchableOpacity onPress={() => setVehiclePickerVisible(false)}>
                <Ionicons name="close" size={24} color={theme.icon} />
              </TouchableOpacity>
            </View>

            {fetchingVehicles ? (
              <ActivityIndicator style={{ padding: 40 }} color={theme.primary} />
            ) : (
              <FlatList
                data={vehicles}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.vehicleItem, { borderBottomColor: theme.glassBorder }]}
                    onPress={() => {
                      setFormData({
                        ...formData,
                        vehicle: item.registrationNumber,
                        vehicleModel: `${item.maker} ${item.model}`
                      });
                      // Reset errors for these fields when auto-selected
                      setErrors((prev: any) => ({ 
                        ...prev, 
                        vehicle: '', 
                        vehicleModel: '' 
                      }));
                      setVehiclePickerVisible(false);
                    }}
                  >
                    <View style={styles.vehicleInfo}>
                      <Text style={[styles.vehicleRegText, { color: theme.text }]}>{item.registrationNumber}</Text>
                      <Text style={[styles.vehicleModelText, { color: theme.muted }]}>{item.maker} {item.model}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.muted} />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <Text style={{ color: theme.muted }}>No vehicles found</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
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
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  pickerModal: {
    maxHeight: '70%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
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
  vehicleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleRegText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  vehicleModelText: {
    fontSize: 13,
  },
});
