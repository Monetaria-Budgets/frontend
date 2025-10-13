import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ViewProps } from 'react-native';

export function ThemedGradientView({ children, style }: ViewProps) {
  const colorScheme = useColorScheme();

  const lightGradient = ['#FFFFFF', '#F0F9FF'] as const;
  const darkGradient = ['#121212', '#0A0F1A'] as const;

  return (
    <LinearGradient
      colors={colorScheme === 'dark' ? darkGradient : lightGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </LinearGradient>
  );
}