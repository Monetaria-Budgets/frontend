// components/pin-code/PinCodeDots.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface PinCodeDotsProps {
  pinLength: number;
  maxLength: number;
}

const PinCodeDots: React.FC<PinCodeDotsProps> = ({ pinLength, maxLength }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.pinDotsContainer}>
      {Array.from({ length: maxLength }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.pinDot,
            {
              backgroundColor: index < pinLength ? colors.tint : 'transparent',
              borderColor: colors.tint,
            }
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 12,
    borderWidth: 2,
  },
});

export default PinCodeDots;