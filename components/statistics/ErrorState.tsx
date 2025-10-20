// components/statistics/ErrorState.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onClearError: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, onClearError }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <View style={styles.errorContent}>
        <View style={[styles.errorIcon, { backgroundColor: colors.tint + '20' }]}>
          <Ionicons name="warning" size={40} color={colors.tint} />
        </View>
        
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          Ошибка загрузки
        </Text>
        
        <Text style={[styles.errorMessage, { color: colors.icon }]}>
          {error}
        </Text>

        <View style={styles.buttons}>
          <Pressable
            style={[styles.retryButton, { backgroundColor: colors.tint }]}
            onPress={onRetry}
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.retryButtonText}>Повторить</Text>
          </Pressable>

          <Pressable
            style={[styles.cancelButton, { borderColor: colors.border }]}
            onPress={onClearError}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>
              Отмена
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorContent: {
    alignItems: 'center',
    width: '100%',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    opacity: 0.8,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorState;