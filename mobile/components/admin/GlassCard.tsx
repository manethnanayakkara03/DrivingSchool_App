import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  accentColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  intensity = 50,
  borderRadius = 16,
  style,
  contentStyle,
  accentColor,
  ...props
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { borderRadius }, style]} {...props}>
      <BlurView
        intensity={intensity}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
        pointerEvents="none"
      />
      <View style={[
        styles.content,
        {
          borderColor: theme.glassBorder,
          backgroundColor: theme.glass,
          borderRadius,
          borderLeftWidth: accentColor ? 4 : 1,
          borderLeftColor: accentColor || theme.glassBorder,
        },
        contentStyle
      ]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
    marginBottom: 12, // Default gap
  },
  content: {
    borderWidth: 1,
    padding: 16,
    zIndex: 1,
  },
});
