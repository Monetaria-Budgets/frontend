import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface LogoutButtonProps {
  onPress: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onPress }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.logoutButton,
        { 
          backgroundColor: colorScheme === 'dark' ? 'rgba(255,59,48,0.2)' : 'rgba(255,59,48,0.1)',
          borderColor: colorScheme === 'dark' ? 'rgba(255,59,48,0.3)' : 'rgba(255,59,48,0.2)',
          transform: [{ scale: pressed ? 0.95 : 1 }]
        }
      ]}
      onPress={onPress}
    >
      <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
      <Text style={styles.logoutText}>Выйти из аккаунта</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    gap: 8,
    marginBottom: 20,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});