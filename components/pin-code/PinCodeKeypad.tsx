// components/pin-code/PinCodeKeypad.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import PinCodeKeypadButton from './PinCodeKeypadButton';

interface PinCodeKeypadProps {
  onNumberPress: (number: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

const PinCodeKeypad: React.FC<PinCodeKeypadProps> = ({ 
  onNumberPress, 
  onBackspace, 
  onClear 
}) => {
  return (
    <View style={styles.keypad}>
      <View style={styles.keypadRow}>
        {['1', '2', '3'].map(number => (
          <PinCodeKeypadButton
            key={number}
            value={number}
            onPress={onNumberPress}
          />
        ))}
      </View>

      <View style={styles.keypadRow}>
        {['4', '5', '6'].map(number => (
          <PinCodeKeypadButton
            key={number}
            value={number}
            onPress={onNumberPress}
          />
        ))}
      </View>

      <View style={styles.keypadRow}>
        {['7', '8', '9'].map(number => (
          <PinCodeKeypadButton
            key={number}
            value={number}
            onPress={onNumberPress}
          />
        ))}
      </View>

      <View style={styles.keypadRow}>
        <PinCodeKeypadButton
          value="C"
          onPress={onClear}
        />
        <PinCodeKeypadButton
          value="0"
          onPress={onNumberPress}
        />
        <PinCodeKeypadButton
          value="backspace"
          onPress={onBackspace}
          isIcon
          iconName="backspace-outline"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  keypad: {
    marginHorizontal: 20,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});

export default PinCodeKeypad;