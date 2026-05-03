import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';

interface GlassViewProps extends ViewProps {
  intensity?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const GlassView: React.FC<GlassViewProps> = ({ 
  children, 
  intensity = 50, 
  borderRadius = 20,
  style,
  ...props 
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { borderRadius }, style]} {...props}>
      <BlurView 
        intensity={intensity} 
        tint={colorScheme}
        style={[StyleSheet.absoluteFill, { borderRadius }]} 
        pointerEvents="none"
      />
      <View style={[styles.content, { borderColor: theme.glassBorder, borderRadius, zIndex: 1 }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  content: {
    borderWidth: 1,
    padding: 16,
  },
});
