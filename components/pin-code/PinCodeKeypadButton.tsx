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
          backgroundColor: pressed ? colors.tint + '20' : 'transparent',
          borderColor: colors.tint,
          transform: [{ scale: pressed ? 0.95 : 1 }] 
        }
      ]}
      onPress={() => onPress(value)}
    >
      {isIcon ? (
        <Ionicons name={iconName as any} size={28} color={colors.tint} />
      ) : (
        <Text style={[styles.keypadNumber, { color: colors.tint }]}>{value}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  keypadButton: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  keypadNumber: {
    fontSize: 28,
    fontWeight: '400',
  },
});

export default PinCodeKeypadButton;