import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme.web';

interface PremiumButtonProps {
  onPress: () => void;
  loading?: boolean;
  isPremium?: boolean;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  onPress,
  loading = false,
  isPremium = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (isPremium) {
    return (
      <View style={[styles.button, styles.premiumActive]}>
        <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
        <Text style={styles.premiumActiveText}>
          Premium активен
        </Text>
      </View>
    );
  }
  

  return (
    <Pressable 
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.buttonContainer,
        { opacity: pressed ? 0.9 : 1 }
      ]}
    >
      <LinearGradient
        colors={[colors.tint, '#764ba2']}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Ionicons name="diamond" size={20} color="white" />
            <Text style={styles.buttonText}>
              Активировать Premium
            </Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 16,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  premiumActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#22C55E20',
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  premiumActiveText: {
    color: '#22C55E',
    fontSize: 18,
    fontWeight: '700',
  },
});