import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '../FormInput';
import { LinearGradient } from 'expo-linear-gradient';

interface CourseFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export const CourseForm: React.FC<CourseFormProps> = ({ visible, onClose, onSubmit, initialData }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    durationValue: initialData?.durationValue?.toString() || '',
    durationUnit: initialData?.durationUnit || 'Days',
    price: initialData?.price?.toString() || '',
    instructor: initialData?.instructor || '',
    maxLearners: initialData?.maxLearners?.toString() || '',
    status: initialData?.status || 'Active',
    topics: initialData?.topics || [],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [newTopic, setNewTopic] = useState('');

  const validate = () => {
    let newErrors: any = {};
    if (!formData.name) newErrors.name = 'Course name is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.durationValue) newErrors.durationValue = 'Duration is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setLoading(true);
      setTimeout(() => {
        // Construct full duration string
        const finalData = {
          ...formData,
          duration: `${formData.durationValue} ${formData.durationUnit}`,
        };
        onSubmit(finalData);
        setLoading(false);
      }, 1000);
    }
  };

  const addTopic = () => {
    if (newTopic.trim()) {
      setFormData(prev => ({ ...prev, topics: [...prev.topics, newTopic.trim()] }));
      setNewTopic('');
    }
  };

  const removeTopic = (index: number) => {
    setFormData(prev => ({ ...prev, topics: prev.topics.filter((_: string, i: number) => i !== index) }));
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
              label="Course Name"
              placeholder="e.g. Basic Driving Package"
              icon="book-outline"
              value={formData.name}
              onChangeText={(t) => setFormData({...formData, name: t})}
              error={errors.name}
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

            <FormInput
              label="Assign Instructor (Optional)"
              placeholder="e.g. Sarath Kumara"
              icon="person-outline"
              value={formData.instructor}
              onChangeText={(t) => setFormData({...formData, instructor: t})}
            />

            {renderPicker('Status', formData.status, ['Active', 'Draft', 'Archived'], (v) => setFormData({...formData, status: v}))}

            {/* Dynamic Topics List */}
            <View style={styles.topicsContainer}>
              <Text style={[styles.pickerLabel, { color: theme.text }]}>Included Lessons / Topics</Text>
              
              {formData.topics.map((topic: string, index: number) => (
                <View key={index} style={[styles.topicItem, { backgroundColor: theme.background, borderColor: theme.glassBorder }]}>
                  <Text style={[styles.topicText, { color: theme.text }]}>{topic}</Text>
                  <TouchableOpacity onPress={() => removeTopic(index)}>
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.addTopicRow}>
                <FormInput
                  label=""
                  placeholder="Add a new topic..."
                  value={newTopic}
                  onChangeText={setNewTopic}
                  style={{ height: 44 }}
                  onSubmitEditing={addTopic}
                />
                <TouchableOpacity style={[styles.addTopicBtn, { backgroundColor: theme.primary }]} onPress={addTopic}>
                  <Ionicons name="add" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>

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
  topicsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  topicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  topicText: {
    flex: 1,
  },
  addTopicRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  addTopicBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 26, // align with input
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
