// components/pin-code/PinCodeHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface PinCodeHeaderProps {
  title: string;
  subtitle: string;
  icon?: string;
}

const PinCodeHeader: React.FC<PinCodeHeaderProps> = ({ 
  title, 
  subtitle, 
  icon = "lock-closed" 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.header}>
      <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
        <Ionicons 
          name={icon as any}
          size={32} 
          color={colors.tint} 
        />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>
        {subtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.7,
  },
});

export default PinCodeHeader;