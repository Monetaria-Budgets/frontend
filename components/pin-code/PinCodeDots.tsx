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
    marginBottom: 30,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 10,
    borderWidth: 2,
  },
});

export default PinCodeDots;