import React, { useState, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, Platform, ActivityIndicator, FlatList,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassView } from '@/components/GlassView';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { apiForType, instructorsApi, vehiclesApi } from '@/services/api';

// ─── field config per type ───────────────────────────────────────────────────
const typeConfig: Record<string, { prefix: string; fields: { key: string; label: string; placeholder: string }[] }> = {
  learners: {
    prefix: 'DS',
    fields: [
      { key: 'name',            label: 'Full Name',          placeholder: 'Enter learner name'     },
      { key: 'nic',             label: 'NIC',                placeholder: 'e.g. 200012345678'      },
      { key: 'phone',           label: 'Phone',              placeholder: '07x xxxxxxx'            },
      { key: 'email',           label: 'Email',              placeholder: 'student@example.com'    },
      { key: 'course',          label: 'Course / Package',   placeholder: 'Full Package…'          },
      { key: 'licenseCategory', label: 'License Category',   placeholder: 'B1, B, A'               },
    ],
  },
  instructors: {
    prefix: 'INS',
    fields: [
      { key: 'name',       label: 'Full Name',   placeholder: 'Enter instructor name'   },
      { key: 'nic',        label: 'NIC',         placeholder: 'e.g. 751234567V'         },
      { key: 'phone',      label: 'Phone',       placeholder: '07x xxxxxxx'             },
      { key: 'email',      label: 'Email',       placeholder: 'instructor@example.com'  },
      { key: 'experience', label: 'Experience',  placeholder: 'e.g. 5 Years'            },
      { key: 'specialty',  label: 'Specialty',   placeholder: 'Manual, Auto, Heavy'     },
    ],
  },
  vehicles: {
    prefix: 'VH',
    fields: [
      { key: 'name',            label: 'Vehicle Name',              placeholder: 'e.g. Toyota Vitz'          },
      { key: 'nic',             label: 'Plate Number',              placeholder: 'WP ABC-1234'               },
      { key: 'phone',           label: 'Fuel Type',                 placeholder: 'Petrol / Hybrid / Diesel'  },
      { key: 'course',          label: 'Transmission',              placeholder: 'Manual / Auto'             },
      { key: 'insuranceExpiry', label: 'Insurance Expiry',          placeholder: 'YYYY-MM-DD'                },
      { key: 'revenueLicense',  label: 'Revenue License Expiry',    placeholder: 'YYYY-MM-DD'                },
    ],
  },
  bookings: {
    prefix: 'BK',
    fields: [
      { key: 'studentName',  label: 'Student Name',  placeholder: 'Full name'       },
      { key: 'studentPhone', label: 'Student Phone', placeholder: '07xxxxxxxx'      },
      { key: 'instructorId', label: 'Instructor',    placeholder: '— Select Instructor —' },
      { key: 'vehicleId',    label: 'Vehicle',       placeholder: '— Select Vehicle —'    },
      { key: 'date',         label: 'Date',          placeholder: 'YYYY-MM-DD'      },
      { key: 'startTime',    label: 'Start Time',    placeholder: 'HH:MM'           },
      { key: 'endTime',      label: 'End Time',      placeholder: 'HH:MM'           },
      { key: 'notes',        label: 'Notes',         placeholder: 'Optional notes...' },
    ],
  },
  payments: {
    prefix: 'PAY',
    fields: [
      { key: 'studentName', label: 'Student Name',     placeholder: 'Enter student name'  },
      { key: 'course',      label: 'Course',           placeholder: 'Full Package…'       },
      { key: 'totalFee',    label: 'Total Fee (LKR)',  placeholder: 'e.g. 100000'         },
      { key: 'amountPaid',  label: 'Amount Paid (LKR)', placeholder: 'e.g. 50000'         },
      { key: 'balance',     label: 'Balance (LKR)',    placeholder: 'Auto-calculated'     },
      { key: 'method',      label: 'Payment Method',   placeholder: 'Cash, Bank, Card'    },
      { key: 'date',        label: 'Payment Date',     placeholder: 'mm/dd/yyyy'          },
      { key: 'status',      label: 'Status',           placeholder: 'Paid / Pending'      },
    ],
  },
  maintenance: {
    prefix: 'MT',
    fields: [
      { key: 'vehicleId',       label: 'Vehicle ID',           placeholder: '— Select a Vehicle —' },
      { key: 'serviceDate',     label: 'Service Date',         placeholder: 'mm/dd/yyyy'         },
      { key: 'serviceType',     label: 'Service Type',         placeholder: 'Oil change'         },
      { key: 'nextServiceDate', label: 'Next Service Date',    placeholder: 'mm/dd/yyyy'         },
      { key: 'description',     label: 'Description of Repair', placeholder: 'Detailed description...' },
      { key: 'cost',            label: 'Cost of Service (LKR)', placeholder: 'e.g. 15000'         },
      { key: 'maintainerName',  label: 'Maintainer Name',      placeholder: 'Mechanic Name'      },
    ],
  },
};

const AVATAR_COLORS = ['#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444','#6366F1','#EC4899'];

const seedData: Record<string, any[]> = {
  learners: [
    { id:'1', name:'Johan',         idCode:'DS-2617', nic:'20022220',     phone:'0777908097', email:'johan@example.com',    course:'Full Package',   licenseCategory:'B1', progress:12, totalLessons:20, status:'Active', color:'#3B82F6', image:null },
    { id:'2', name:'Kaveesha',      idCode:'DS-2616', nic:'200118728755', phone:'0762312432', email:'kaveesha@example.com', course:'Combo Package',  licenseCategory:'B',  progress:0,  totalLessons:20, status:'Active', color:'#10B981', image:null },
    { id:'3', name:'Binara Dilshan',idCode:'DS-2615', nic:'200032736222', phone:'0727765525', email:'binara@example.com',   course:'Course 1',       licenseCategory:'B1', progress:3,  totalLessons:10, status:'Active', color:'#F59E0B', image:null },
  ],
  instructors: [
    { id:'1', name:'Mr. Jayasinghe', idCode:'INS-01', nic:'751234567V', phone:'0712345678', email:'jay@arampath.com', experience:'15 Years', specialty:'Manual & Auto', course:'Senior Instructor', progress:15, totalLessons:15, status:'Active', color:'#8B5CF6', image:null },
  ],
  vehicles: [
    { id:'1', name:'Toyota Vitz', idCode:'VH-001', nic:'WP ABC-1234', phone:'Petrol', course:'Manual', insuranceExpiry:'2025-12-31', revenueLicense:'2025-06-30', progress:80, totalLessons:100, status:'Active', color:'#6366F1', image:null },
  ],
};

// ─── sub-components ──────────────────────────────────────────────────────────
type FormFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  theme: any;
  isDropdown?: boolean;
  isTextarea?: boolean;
  isReadOnly?: boolean;
  options?: any[];
};

function FormField({ label, placeholder, value, onChange, theme, isDropdown, isTextarea, isReadOnly, options }: FormFieldProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  if (isDropdown) {
    const selectedOption = options?.find(opt => opt.id === value);
    const displayValue = selectedOption?.name || selectedOption?.studentName || placeholder;

    return (
      <View style={{ marginBottom: 16 }}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <TouchableOpacity
          onPress={() => setShowDropdown(true)}
          style={[styles.dropdownButton, { borderColor: theme.glassBorder }]}
        >
          <ThemedText style={{ color: value ? theme.text : theme.icon, fontSize: 16 }}>
            {displayValue}
          </ThemedText>
          <Ionicons name="chevron-down" size={20} color={theme.icon} />
        </TouchableOpacity>

        <Modal
          visible={showDropdown}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDropdown(false)}
        >
          <TouchableOpacity
            style={styles.dropdownOverlay}
            activeOpacity={1}
            onPress={() => setShowDropdown(false)}
          >
            <View style={[styles.dropdownMenu, { backgroundColor: theme.background }]}>
              <View style={styles.dropdownHeader}>
                <ThemedText style={styles.dropdownTitle}>{label}</ThemedText>
                <TouchableOpacity onPress={() => setShowDropdown(false)}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={[{ id: '', name: placeholder }, ...options!]}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      value === item.id && { backgroundColor: theme.primary + '20' },
                    ]}
                    onPress={() => {
                      onChange(item.id);
                      setShowDropdown(false);
                    }}
                  >
                    <ThemedText style={{ fontSize: 16 }}>
                      {item.name || item.studentName || placeholder}
                    </ThemedText>
                    {value === item.id && <Ionicons name="checkmark" size={20} color={theme.primary} />}
                  </TouchableOpacity>
                )}
                scrollEnabled
                nestedScrollEnabled
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  if (isTextarea) {
    return (
      <View style={{ marginBottom: 16 }}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <TextInput
          style={[styles.textarea, { color: theme.text, borderColor: theme.glassBorder }]}
          placeholder={placeholder}
          placeholderTextColor={theme.icon}
          value={value}
          onChangeText={onChange}
          multiline
          numberOfLines={4}
        />
      </View>
    );
  }

  if (isReadOnly) {
    return (
      <View style={{ marginBottom: 16 }}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <View style={[styles.readOnlyInput, { borderColor: theme.glassBorder, backgroundColor: theme.primary + '08' }]}>
          <ThemedText style={{ color: theme.text, fontSize: 16 }}>{value || '—'}</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        style={[styles.input, { color: theme.text, borderColor: theme.glassBorder }]}
        placeholder={placeholder}
        placeholderTextColor={theme.icon}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRowModal}>
      <ThemedText style={styles.detailLabelModal}>{label}</ThemedText>
      <ThemedText style={styles.detailValueModal}>{value || '—'}</ThemedText>
    </View>
  );
}

// ─── main component ──────────────────────────────────────────────────────────
export default function ManagementScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const config = typeConfig[type as string] ?? typeConfig.learners;
  const title  = type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Items';
  const api    = apiForType[type as string];

  const [dataList,   setDataList]   = useState<any[]>([]);
  const [fetching,   setFetching]   = useState(true);
  const [saving,     setSaving]     = useState(false);

  // ── add modal
  const [showAdd,   setShowAdd]   = useState(false);
  const [formVals,  setFormVals]  = useState<Record<string,string>>({});
  const [addImage,  setAddImage]  = useState<string|null>(null);

  // ── view modal
  const [showView,  setShowView]  = useState(false);
  const [viewItem,  setViewItem]  = useState<any>(null);

  // ── edit modal
  const [showEdit,  setShowEdit]  = useState(false);
  const [editItem,  setEditItem]  = useState<any>(null);
  const [editVals,  setEditVals]  = useState<Record<string,string>>({});
  const [editImage, setEditImage] = useState<string|null>(null);

  // ── dropdown options for bookings and maintenance
  const [instructorsList, setInstructorsList] = useState<any[]>([]);
  const [vehiclesList, setVehiclesList] = useState<any[]>([]);

  const setField = (k: string, v: string) => {
    setFormVals(p => {
      const updated = {...p, [k]: v};
      // Auto-calculate balance for payments
      if (type === 'payments' && (k === 'totalFee' || k === 'amountPaid')) {
        const totalFee = parseFloat(updated.totalFee || '0');
        const amountPaid = parseFloat(updated.amountPaid || '0');
        if (!isNaN(totalFee) && !isNaN(amountPaid)) {
          updated.balance = Math.max(0, totalFee - amountPaid).toFixed(2);
        }
      }
      return updated;
    });
  };

  const setEditField = (k: string, v: string) => {
    setEditVals(p => {
      const updated = {...p, [k]: v};
      // Auto-calculate balance for payments
      if (type === 'payments' && (k === 'totalFee' || k === 'amountPaid')) {
        const totalFee = parseFloat(updated.totalFee || '0');
        const amountPaid = parseFloat(updated.amountPaid || '0');
        if (!isNaN(totalFee) && !isNaN(amountPaid)) {
          updated.balance = Math.max(0, totalFee - amountPaid).toFixed(2);
        }
      }
      return updated;
    });
  };

  // ── fetch list on mount
  const fetchList = useCallback(async () => {
    if (!api) return;
    try {
      setFetching(true);
      const items = await api.list();
      setDataList(items);
      
      // Load instructors and vehicles for booking/maintenance dropdowns
      if (type === 'bookings' || type === 'maintenance') {
        try {
          if (type === 'bookings') {
            const [inst, veh] = await Promise.all([
              instructorsApi.list(),
              vehiclesApi.list(),
            ]);
            setInstructorsList(inst);
            setVehiclesList(veh);
          } else if (type === 'maintenance') {
            const veh = await vehiclesApi.list();
            setVehiclesList(veh);
          }
        } catch {
          // Fallback to empty
        }
      }
    } catch {
      // fall back to empty — backend may not be running
    } finally {
      setFetching(false);
    }
  }, [api, type]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const pickImage = async (setter: (u: string) => void) => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1,1], quality: 0.8,
    });
    if (!res.canceled) setter(res.assets[0].uri);
  };

  // ── ADD
  const openAdd = () => { setFormVals({}); setAddImage(null); setShowAdd(true); };

  const handleAdd = async () => {
    // Type-specific validation
    if (type === 'bookings') {
      const studentName = formVals['studentName']?.trim();
      const studentPhone = formVals['studentPhone']?.trim();
      const instructorId = formVals['instructorId']?.trim();
      const vehicleId = formVals['vehicleId']?.trim();
      const date = formVals['date']?.trim();
      const startTime = formVals['startTime']?.trim();
      const endTime = formVals['endTime']?.trim();

      if (!studentName) { Alert.alert('Error', 'Please enter student name'); return; }
      if (!studentPhone) { Alert.alert('Error', 'Please enter student phone'); return; }
      if (!/^07\d{8}$/.test(studentPhone)) { Alert.alert('Error', 'Phone must start with 07 and have exactly 10 digits'); return; }
      if (!instructorId) { Alert.alert('Error', 'Please select an instructor'); return; }
      if (!vehicleId) { Alert.alert('Error', 'Please select a vehicle'); return; }
      if (!date) { Alert.alert('Error', 'Please select a date'); return; }
      if (!startTime) { Alert.alert('Error', 'Please set start time'); return; }
      if (!endTime) { Alert.alert('Error', 'Please set end time'); return; }
    } else if (type === 'maintenance') {
      const vehicleId = formVals['vehicleId']?.trim();
      const serviceDate = formVals['serviceDate']?.trim();
      const serviceType = formVals['serviceType']?.trim();
      const nextServiceDate = formVals['nextServiceDate']?.trim();
      const description = formVals['description']?.trim();
      const cost = formVals['cost']?.trim();
      const maintainerName = formVals['maintainerName']?.trim();

      if (!vehicleId) { Alert.alert('Error', 'Please select a vehicle'); return; }
      if (!serviceDate) { Alert.alert('Error', 'Please select service date'); return; }
      if (!serviceType) { Alert.alert('Error', 'Please enter service type'); return; }
      if (!nextServiceDate) { Alert.alert('Error', 'Please select next service date'); return; }
      if (!description) { Alert.alert('Error', 'Please enter description'); return; }
      if (!cost) { Alert.alert('Error', 'Please enter cost'); return; }
      if (!/^\d+(\.\d{1,2})?$/.test(cost)) { Alert.alert('Error', 'Cost must be a valid number'); return; }
      if (!maintainerName) { Alert.alert('Error', 'Please enter maintainer name'); return; }
    } else if (type === 'payments') {
      const studentName = formVals['studentName']?.trim();
      const course = formVals['course']?.trim();
      const totalFee = formVals['totalFee']?.trim();
      const amountPaid = formVals['amountPaid']?.trim();
      const method = formVals['method']?.trim();
      const date = formVals['date']?.trim();
      const status = formVals['status']?.trim();

      if (!studentName) { Alert.alert('Error', 'Please enter student name'); return; }
      if (!course) { Alert.alert('Error', 'Please enter course'); return; }
      if (!totalFee) { Alert.alert('Error', 'Please enter total fee'); return; }
      if (!/^\d+(\.\d{1,2})?$/.test(totalFee)) { Alert.alert('Error', 'Total fee must be a valid number'); return; }
      if (!amountPaid) { Alert.alert('Error', 'Please enter amount paid'); return; }
      if (!/^\d+(\.\d{1,2})?$/.test(amountPaid)) { Alert.alert('Error', 'Amount paid must be a valid number'); return; }
      if (parseFloat(amountPaid) > parseFloat(totalFee)) { Alert.alert('Error', 'Amount paid cannot exceed total fee'); return; }
      if (!method) { Alert.alert('Error', 'Please enter payment method'); return; }
      if (!date) { Alert.alert('Error', 'Please enter payment date'); return; }
      if (!status) { Alert.alert('Error', 'Please enter payment status'); return; }
    } else {
      const nameVal = formVals['name']?.trim();
      if (!nameVal) { Alert.alert('Error', 'Please enter a name'); return; }
    }

    setSaving(true);
    try {
      const payload: any = { image: addImage };
      config.fields.forEach(f => { payload[f.key] = formVals[f.key] ?? ''; });
      const created = await api.create(payload);
      setDataList(prev => [created, ...prev]);
      setShowAdd(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  // ── VIEW
  const openView = (item: any) => { setViewItem(item); setShowView(true); };

  // ── EDIT
  const openEdit = (item: any) => {
    setEditItem(item);
    const vals: Record<string,string> = {};
    config.fields.forEach(f => { vals[f.key] = item[f.key] ?? ''; });
    setEditVals(vals);
    setEditImage(item.image ?? null);
    setShowEdit(true);
  };

  const handleEdit = async () => {
    // Type-specific validation
    if (type === 'bookings') {
      const studentName = editVals['studentName']?.trim();
      const studentPhone = editVals['studentPhone']?.trim();
      const instructorId = editVals['instructorId']?.trim();
      const vehicleId = editVals['vehicleId']?.trim();
      const date = editVals['date']?.trim();
      const startTime = editVals['startTime']?.trim();
      const endTime = editVals['endTime']?.trim();

      if (!studentName) { Alert.alert('Error', 'Please enter student name'); return; }
      if (!studentPhone) { Alert.alert('Error', 'Please enter student phone'); return; }
      if (!/^07\d{8}$/.test(studentPhone)) { Alert.alert('Error', 'Phone must start with 07 and have exactly 10 digits'); return; }
      if (!instructorId) { Alert.alert('Error', 'Please select an instructor'); return; }
      if (!vehicleId) { Alert.alert('Error', 'Please select a vehicle'); return; }
      if (!date) { Alert.alert('Error', 'Please select a date'); return; }
      if (!startTime) { Alert.alert('Error', 'Please set start time'); return; }
      if (!endTime) { Alert.alert('Error', 'Please set end time'); return; }
    } else if (type === 'maintenance') {
      const vehicleId = editVals['vehicleId']?.trim();
      const serviceDate = editVals['serviceDate']?.trim();
      const serviceType = editVals['serviceType']?.trim();
      const nextServiceDate = editVals['nextServiceDate']?.trim();
      const description = editVals['description']?.trim();
      const cost = editVals['cost']?.trim();
      const maintainerName = editVals['maintainerName']?.trim();

      if (!vehicleId) { Alert.alert('Error', 'Please select a vehicle'); return; }
      if (!serviceDate) { Alert.alert('Error', 'Please select service date'); return; }
      if (!serviceType) { Alert.alert('Error', 'Please enter service type'); return; }
      if (!nextServiceDate) { Alert.alert('Error', 'Please select next service date'); return; }
      if (!description) { Alert.alert('Error', 'Please enter description'); return; }
      if (!cost) { Alert.alert('Error', 'Please enter cost'); return; }
      if (!/^\d+(\.\d{1,2})?$/.test(cost)) { Alert.alert('Error', 'Cost must be a valid number'); return; }
      if (!maintainerName) { Alert.alert('Error', 'Please enter maintainer name'); return; }
    } else if (type === 'payments') {
      const studentName = editVals['studentName']?.trim();
      const course = editVals['course']?.trim();
      const totalFee = editVals['totalFee']?.trim();
      const amountPaid = editVals['amountPaid']?.trim();
      const method = editVals['method']?.trim();
      const date = editVals['date']?.trim();
      const status = editVals['status']?.trim();

      if (!studentName) { Alert.alert('Error', 'Please enter student name'); return; }
      if (!course) { Alert.alert('Error', 'Please enter course'); return; }
      if (!totalFee) { Alert.alert('Error', 'Please enter total fee'); return; }
      if (!/^\d+(\.\d{1,2})?$/.test(totalFee)) { Alert.alert('Error', 'Total fee must be a valid number'); return; }
      if (!amountPaid) { Alert.alert('Error', 'Please enter amount paid'); return; }
      if (!/^\d+(\.\d{1,2})?$/.test(amountPaid)) { Alert.alert('Error', 'Amount paid must be a valid number'); return; }
      if (parseFloat(amountPaid) > parseFloat(totalFee)) { Alert.alert('Error', 'Amount paid cannot exceed total fee'); return; }
      if (!method) { Alert.alert('Error', 'Please enter payment method'); return; }
      if (!date) { Alert.alert('Error', 'Please enter payment date'); return; }
      if (!status) { Alert.alert('Error', 'Please enter payment status'); return; }
    } else {
      if (!editVals['name']?.trim()) { Alert.alert('Error','Name cannot be empty'); return; }
    }
    
    setSaving(true);
    try {
      const payload = { ...editVals, image: editImage };
      const updated = await api.update(editItem._id || editItem.id, payload);
      setDataList(prev => prev.map(it => (it._id || it.id) === (editItem._id || editItem.id) ? updated : it));
      setShowEdit(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update');
    } finally {
      setSaving(false);
    }
  };

  // ── DELETE (Alert.alert buttons don't work on Expo Web — use window.confirm there)
  const handleDelete = (item: any) => {
    const doDelete = async () => {
      try {
        await api.remove(item._id || item.id);
        setDataList(prev => prev.filter(i => (i._id || i.id) !== (item._id || item.id)));
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Could not delete');
      }
    };
    if (Platform.OS === 'web') {
      // @ts-ignore
      if (window.confirm(`Delete "${item.name}"? This cannot be undone.`)) doDelete();
    } else {
      Alert.alert('Delete Record', `Delete "${item.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  // ─── render ────────────────────────────────────────────────────────────────
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title, headerTransparent: true, headerBlurEffect: colorScheme }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.pageTitle}>Manage {title}</ThemedText>
        <ThemedText style={styles.subtitle}>View and manage your {type} here.</ThemedText>

        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={openAdd}>
          <Ionicons name="add" size={24} color="#fff" />
          <ThemedText style={styles.addButtonText}>Add New {title.slice(0,-1)}</ThemedText>
        </TouchableOpacity>

        {/* LIST */}
        {fetching ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : dataList.length === 0 ? (
          <GlassView style={{ padding: 30, alignItems: 'center' }} intensity={15}>
            <Ionicons name="folder-open-outline" size={48} color={theme.icon} />
            <ThemedText style={{ marginTop: 12, opacity: 0.5 }}>No records yet. Tap "Add" to get started.</ThemedText>
          </GlassView>
        ) : (
          <View style={styles.list}>
            {dataList.map((item: any) => (
            <GlassView key={item.id} style={styles.listItem} intensity={20}>
              {/* Header row */}
              <View style={styles.itemMainRow}>
                <View style={[styles.avatarContainer, { backgroundColor: item.color || theme.primary }]}>
                  {item.image
                    ? <Image source={{ uri: item.image }} style={styles.avatarImage} contentFit="cover" />
                    : <ThemedText style={styles.avatarText}>{item.name?.charAt(0)}</ThemedText>}
                </View>
                <View style={styles.itemIdentity}>
                  <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                  <ThemedText style={styles.itemSubText}>{item.idCode} • NIC: {item.nic}</ThemedText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? '#DCFCE7' : '#FEF3C7' }]}>
                  <ThemedText style={[styles.statusText, { color: item.status === 'Active' ? '#166534' : '#92400E' }]}>
                    {item.status}
                  </ThemedText>
                </View>
              </View>

              {/* Detail row */}
              <View style={styles.itemDetailRow}>
                <View style={styles.detailColumn}>
                  <ThemedText style={styles.detailLabel}>CONTACT</ThemedText>
                  <ThemedText style={styles.detailValue}>{item.phone}</ThemedText>
                </View>
                <View style={styles.detailColumn}>
                  <ThemedText style={styles.detailLabel}>COURSE</ThemedText>
                  <ThemedText style={styles.detailValue}>{item.course}</ThemedText>
                </View>
              </View>

              {/* Progress */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <ThemedText style={styles.detailLabel}>PROGRESS</ThemedText>
                  <ThemedText style={styles.progressValue}>{item.progress}/{item.totalLessons}</ThemedText>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, {
                    width: `${Math.min((item.progress / item.totalLessons) * 100, 100)}%`,
                    backgroundColor: theme.primary
                  }]} />
                </View>
              </View>

              {/* Action buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionIconButton} onPress={() => openView(item)}>
                  <Ionicons name="eye-outline" size={20} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionIconButton} onPress={() => openEdit(item)}>
                  <Ionicons name="create-outline" size={20} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionIconButton, { backgroundColor: '#FEE2E2' }]} onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </GlassView>
          ))}
        </View>
      )}
      </ScrollView>

      {/* ── ADD MODAL ─────────────────────────────────────────────────────── */}
      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <GlassView style={styles.modalContent} intensity={40}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Add New {title.slice(0,-1)}</ThemedText>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage(setAddImage)}>
              {addImage
                ? <Image source={{ uri: addImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
                : <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera-outline" size={36} color={theme.icon} />
                    <ThemedText style={{ fontSize:12, color:theme.icon, marginTop:6 }}>Add Photo</ThemedText>
                  </View>}
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
              {config.fields.map(f => {
                let isDropdown = false;
                let isTextarea = false;
                let isReadOnly = false;
                let options = [];
                
                // Bookings dropdowns
                if (type === 'bookings' && f.key === 'instructorId') {
                  isDropdown = true;
                  options = instructorsList;
                } else if (type === 'bookings' && f.key === 'vehicleId') {
                  isDropdown = true;
                  options = vehiclesList;
                }
                
                // Maintenance dropdowns and textarea
                if (type === 'maintenance' && f.key === 'vehicleId') {
                  isDropdown = true;
                  options = vehiclesList;
                } else if (type === 'maintenance' && f.key === 'description') {
                  isTextarea = true;
                }
                
                // Payments: balance is read-only (auto-calculated)
                if (type === 'payments' && f.key === 'balance') {
                  isReadOnly = true;
                }
                
                return (
                  <FormField 
                    key={f.key} 
                    label={f.label} 
                    placeholder={f.placeholder}
                    value={formVals[f.key] ?? ''} 
                    onChange={(v: string) => setField(f.key, v)} 
                    theme={theme}
                    isDropdown={isDropdown}
                    isTextarea={isTextarea}
                    isReadOnly={isReadOnly}
                    options={options}
                  />
                );
              })}
            </ScrollView>

            <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.primary }]} onPress={handleAdd}>
              <ThemedText style={styles.submitButtonText}>Confirm & Add</ThemedText>
            </TouchableOpacity>
          </GlassView>
        </View>
      </Modal>

      {/* ── VIEW MODAL ────────────────────────────────────────────────────── */}
      <Modal visible={showView} animationType="slide" transparent onRequestClose={() => setShowView(false)}>
        <View style={styles.modalOverlay}>
          <GlassView style={styles.modalContent} intensity={40}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Record Details</ThemedText>
              <TouchableOpacity onPress={() => setShowView(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {viewItem && (
              <>
                {/* Avatar / image */}
                <View style={styles.viewAvatarWrap}>
                  <View style={[styles.viewAvatar, { backgroundColor: viewItem.color || theme.primary }]}>
                    {viewItem.image
                      ? <Image source={{ uri: viewItem.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
                      : <ThemedText style={styles.viewAvatarText}>{viewItem.name?.charAt(0)}</ThemedText>}
                  </View>
                  <ThemedText style={styles.viewName}>{viewItem.name}</ThemedText>
                  <View style={[styles.statusBadge, { backgroundColor: viewItem.status === 'Active' ? '#DCFCE7' : '#FEF3C7', alignSelf:'center' }]}>
                    <ThemedText style={[styles.statusText, { color: viewItem.status === 'Active' ? '#166534' : '#92400E' }]}>
                      {viewItem.status}
                    </ThemedText>
                  </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
                  <DetailRow label="ID Code"  value={viewItem.idCode} />
                  {config.fields.filter(f => f.key !== 'name').map(f => (
                    <DetailRow key={f.key} label={f.label} value={viewItem[f.key]} />
                  ))}
                  <DetailRow label="Progress" value={`${viewItem.progress} / ${viewItem.totalLessons} lessons`} />
                </ScrollView>

                <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.primary }]} onPress={() => { setShowView(false); openEdit(viewItem); }}>
                  <ThemedText style={styles.submitButtonText}>Edit This Record</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </GlassView>
        </View>
      </Modal>

      {/* ── EDIT MODAL ────────────────────────────────────────────────────── */}
      <Modal visible={showEdit} animationType="slide" transparent onRequestClose={() => setShowEdit(false)}>
        <View style={styles.modalOverlay}>
          <GlassView style={styles.modalContent} intensity={40}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Edit Record</ThemedText>
              <TouchableOpacity onPress={() => setShowEdit(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage(setEditImage)}>
              {editImage
                ? <Image source={{ uri: editImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
                : <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera-outline" size={36} color={theme.icon} />
                    <ThemedText style={{ fontSize:12, color:theme.icon, marginTop:6 }}>Change Photo</ThemedText>
                  </View>}
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
              {config.fields.map(f => {
                let isDropdown = false;
                let isTextarea = false;
                let isReadOnly = false;
                let options = [];
                
                // Bookings dropdowns
                if (type === 'bookings' && f.key === 'instructorId') {
                  isDropdown = true;
                  options = instructorsList;
                } else if (type === 'bookings' && f.key === 'vehicleId') {
                  isDropdown = true;
                  options = vehiclesList;
                }
                
                // Maintenance dropdowns and textarea
                if (type === 'maintenance' && f.key === 'vehicleId') {
                  isDropdown = true;
                  options = vehiclesList;
                } else if (type === 'maintenance' && f.key === 'description') {
                  isTextarea = true;
                }
                
                // Payments: balance is read-only (auto-calculated)
                if (type === 'payments' && f.key === 'balance') {
                  isReadOnly = true;
                }
                
                return (
                  <FormField 
                    key={f.key} 
                    label={f.label} 
                    placeholder={f.placeholder}
                    value={editVals[f.key] ?? ''} 
                    onChange={(v: string) => setEditField(f.key, v)} 
                    theme={theme}
                    isDropdown={isDropdown}
                    isTextarea={isTextarea}
                    isReadOnly={isReadOnly}
                    options={options}
                  />
                );
              })}
            </ScrollView>

            <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.primary }]} onPress={handleEdit}>
              <ThemedText style={styles.submitButtonText}>Save Changes</ThemedText>
            </TouchableOpacity>
          </GlassView>
        </View>
      </Modal>
    </ThemedView>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:       { flex:1 },
  scrollContent:   { paddingTop:120, paddingHorizontal:20, paddingBottom:40 },
  pageTitle:       { fontSize:32, fontWeight:'800' },
  subtitle:        { fontSize:16, opacity:0.6, marginTop:4, marginBottom:30 },

  addButton:       { flexDirection:'row', alignItems:'center', justifyContent:'center', paddingVertical:14, borderRadius:16, gap:8, marginBottom:30 },
  addButtonText:   { color:'#fff', fontSize:16, fontWeight:'700' },

  list:            { gap:16 },
  listItem:        { padding:16, marginBottom:8 },

  itemMainRow:     { flexDirection:'row', alignItems:'center', marginBottom:16 },
  avatarContainer: { width:44, height:44, borderRadius:12, justifyContent:'center', alignItems:'center', marginRight:12, overflow:'hidden' },
  avatarImage:     { width:'100%', height:'100%' },
  avatarText:      { color:'#fff', fontSize:18, fontWeight:'700' },
  itemIdentity:    { flex:1 },
  itemName:        { fontSize:17, fontWeight:'700' },
  itemSubText:     { fontSize:12, opacity:0.5, marginTop:2 },

  statusBadge:     { paddingHorizontal:10, paddingVertical:4, borderRadius:8 },
  statusText:      { fontSize:11, fontWeight:'700' },

  itemDetailRow:   { flexDirection:'row', justifyContent:'space-between', marginBottom:16, paddingTop:12, borderTopWidth:1, borderTopColor:'rgba(255,255,255,0.05)' },
  detailColumn:    { flex:1 },
  detailLabel:     { fontSize:10, fontWeight:'700', opacity:0.4, letterSpacing:0.5, marginBottom:4 },
  detailValue:     { fontSize:14, fontWeight:'600' },

  progressSection: { marginBottom:16 },
  progressHeader:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:6 },
  progressValue:   { fontSize:12, fontWeight:'700' },
  progressBarBg:   { height:6, backgroundColor:'rgba(255,255,255,0.1)', borderRadius:3, overflow:'hidden' },
  progressBarFill: { height:'100%', borderRadius:3 },

  actionRow:       { flexDirection:'row', justifyContent:'flex-end', gap:12 },
  actionIconButton:{ width:36, height:36, borderRadius:10, backgroundColor:'rgba(255,255,255,0.1)', justifyContent:'center', alignItems:'center' },

  // modals
  modalOverlay:    { flex:1, justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.55)' },
  modalContent:    { borderTopLeftRadius:30, borderTopRightRadius:30, padding:24, paddingBottom: Platform.OS === 'ios' ? 44 : 32 },
  modalHeader:     { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:24 },
  modalTitle:      { fontSize:20, fontWeight:'800' },

  imagePicker:     { width:90, height:90, borderRadius:45, backgroundColor:'rgba(255,255,255,0.1)', alignSelf:'center', justifyContent:'center', alignItems:'center', overflow:'hidden', borderWidth:1, borderColor:'rgba(255,255,255,0.2)', marginBottom:20 },
  imagePlaceholder:{ alignItems:'center' },

  submitButton:    { height:54, borderRadius:16, justifyContent:'center', alignItems:'center', marginTop:16 },
  submitButtonText:{ color:'#fff', fontSize:17, fontWeight:'700' },

  // form
  label:           { fontSize:14, fontWeight:'600', marginBottom:8, opacity:0.8 },
  input:           { height:52, borderWidth:1, borderRadius:14, paddingHorizontal:16, fontSize:16, backgroundColor:'rgba(255,255,255,0.05)', marginBottom:4 },
  textarea:        { height:120, borderWidth:1, borderRadius:14, paddingHorizontal:16, paddingVertical:12, fontSize:16, backgroundColor:'rgba(255,255,255,0.05)', textAlignVertical:'top', marginBottom:4 },
  dropdownButton:  { height:52, borderWidth:1, borderRadius:14, paddingHorizontal:16, fontSize:16, backgroundColor:'rgba(255,255,255,0.05)', justifyContent:'space-between', alignItems:'center', flexDirection:'row', marginBottom:4 },
  readOnlyInput:   { height:52, borderWidth:1, borderRadius:14, paddingHorizontal:16, fontSize:16, justifyContent:'center', marginBottom:4 },

  // dropdown
  dropdownOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' },
  dropdownMenu:    { maxHeight:'70%', borderRadius:20, width:'85%', paddingHorizontal:20, paddingVertical:20 },
  dropdownHeader:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16, paddingBottom:12, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.1)' },
  dropdownTitle:   { fontSize:18, fontWeight:'700' },
  dropdownItem:    { paddingVertical:14, paddingHorizontal:12, borderRadius:10, flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },

  // view modal
  viewAvatarWrap:  { alignItems:'center', marginBottom:20 },
  viewAvatar:      { width:80, height:80, borderRadius:24, justifyContent:'center', alignItems:'center', overflow:'hidden', marginBottom:12 },
  viewAvatarText:  { color:'#fff', fontSize:32, fontWeight:'800' },
  viewName:        { fontSize:22, fontWeight:'800', marginBottom:8 },

  detailRowModal:  { flexDirection:'row', justifyContent:'space-between', paddingVertical:10, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.06)' },
  detailLabelModal:{ fontSize:13, opacity:0.5, fontWeight:'600' },
  detailValueModal:{ fontSize:13, fontWeight:'700', maxWidth:'55%', textAlign:'right' },
});
