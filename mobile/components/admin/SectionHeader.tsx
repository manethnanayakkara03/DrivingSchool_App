import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  showMenuButton?: boolean;
  onMenuPress?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  iconName,
  showMenuButton,
  onMenuPress,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        {showMenuButton && (
          <Pressable onPress={onMenuPress} style={styles.menuButton}>
            <Ionicons name="menu" size={28} color={theme.text} />
          </Pressable>
        )}
        {iconName && (
          <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}20` }]}>
            <Ionicons name={iconName} size={24} color={theme.primary} />
          </View>
        )}
        <View>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>}
        </View>
      </View>
      {actionLabel && onActionPress && (
        <Pressable onPress={onActionPress} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
          <Text style={[styles.actionText, { color: theme.primary }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    marginRight: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
