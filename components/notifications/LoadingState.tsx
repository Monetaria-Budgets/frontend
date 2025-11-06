import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Colors } from '@/constants/theme';

interface LoadingStateProps {
  colors: typeof Colors.light | typeof Colors.dark;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ colors }) => (
  <View style={[styles.container, { backgroundColor: colors.background }]}>
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.tint} />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
        Загружаем уведомление...
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
});