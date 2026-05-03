import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (['active', 'completed', 'paid', 'confirmed', 'good'].includes(s)) return theme.success;
    if (['inactive', 'cancelled', 'poor', 'overdue'].includes(s)) return '#EF4444'; // Red
    if (['pending', 'in progress', 'under maintenance', 'fair'].includes(s)) return '#F59E0B'; // Amber
    if (['draft'].includes(s)) return theme.muted;
    return theme.primary;
  };

  const color = getStatusColor(status);

  return (
    <View style={[styles.badge, { backgroundColor: `${color}20`, borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
