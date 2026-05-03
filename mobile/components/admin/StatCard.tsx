import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  title: string;
  value: string | number;
  iconName: keyof typeof Ionicons.glyphMap;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  iconName,
  trend,
  trendValue,
  accentColor,
  style,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const accent = accentColor || theme.accent;

  const getTrendColor = () => {
    if (trend === 'up') return theme.success;
    if (trend === 'down') return '#EF4444'; // Red
    return theme.muted;
  };

  const getTrendIcon = () => {
    if (trend === 'up') return 'trending-up';
    if (trend === 'down') return 'trending-down';
    return 'remove';
  };

  return (
    <GlassCard style={[styles.container, style]} accentColor={accent} borderRadius={16}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${accent}20` }]}>
          <Ionicons name={iconName} size={20} color={accent} />
        </View>
        {trend && (
          <View style={[styles.trendContainer, { backgroundColor: `${getTrendColor()}20` }]}>
            <Ionicons name={getTrendIcon() as any} size={12} color={getTrendColor()} />
            {trendValue && <Text style={[styles.trendText, { color: getTrendColor() }]}>{trendValue}</Text>}
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
        <Text style={[styles.title, { color: theme.muted }]}>{title}</Text>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    gap: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
  },
});
