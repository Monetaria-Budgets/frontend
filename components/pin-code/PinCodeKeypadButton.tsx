// components/pin-code/PinCodeKeypadButton.tsx
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface PinCodeKeypadButtonProps {
  value: string;
  onPress: (value: string) => void;
  isIcon?: boolean;
  iconName?: string;
}

const PinCodeKeypadButton: React.FC<PinCodeKeypadButtonProps> = ({ 
  value, 
  onPress, 
  isIcon = false,
  iconName 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.keypadButton,
        { 
          backgroundColor: pressed ? colors.border : colors.card,
          transform: [{ scale: pressed ? 0.95 : 1 }] 
        }
      ]}
      onPress={() => onPress(value)}
    >
      {isIcon ? (
        <Ionicons name={iconName as any} size={24} color={colors.text} />
      ) : (
        <Text style={[styles.keypadNumber, { color: colors.text }]}>{value}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  keypadButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  keypadNumber: {
    fontSize: 24,
    fontWeight: '400',
  },
});

export default PinCodeKeypadButton;