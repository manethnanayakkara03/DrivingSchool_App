import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface FormInputProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  icon,
  error,
  style,
  ...props
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <View style={[
        styles.inputContainer,
        { 
          backgroundColor: theme.background,
          borderColor: error ? '#EF4444' : theme.glassBorder,
        }
      ]}>
        {icon && (
          <Ionicons name={icon} size={20} color={theme.icon} style={styles.icon} />
        )}
        <TextInput
          style={[styles.input, { color: theme.text }, style]}
          placeholderTextColor={theme.muted}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444', // Red
    fontSize: 12,
    marginTop: 4,
  },
});
