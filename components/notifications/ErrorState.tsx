import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/theme';

interface ErrorStateProps {
  colors: typeof Colors.light | typeof Colors.dark;
  onClose: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ colors, onClose }) => (
  <View style={[styles.container, { backgroundColor: colors.background }]}>
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={64} color={colors.error} />
      <Text style={[styles.errorText, { color: colors.text }]}>
        Уведомление не найдено
      </Text>
      <Pressable 
        style={({ pressed }) => [
          styles.backButton, 
          { backgroundColor: colors.tint, opacity: pressed ? 0.8 : 1 }
        ]}
        onPress={onClose}
      >
        <Text style={styles.backButtonText}>Закрыть</Text>
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});