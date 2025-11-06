import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface EmptyStateProps {
  futureNotificationsCount: number;
  onRefresh: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  futureNotificationsCount,
  onRefresh,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.card }]}>
        <Ionicons name="notifications-off" size={52} color={colors.textSecondary} />
      </View>
      
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
        Нет уведомлений
      </Text>
      
      <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
        {futureNotificationsCount > 0 
          ? `У вас есть ${futureNotificationsCount} запланированных уведомлений`
          : 'Здесь появятся ваши уведомления и важные обновления'
        }
      </Text>
      
      <Pressable 
        style={({ pressed }) => [
          styles.refreshButton, 
          { 
            backgroundColor: colors.tint,
            opacity: pressed ? 0.8 : 1 
          }
        ]}
        onPress={onRefresh}
      >
        <Ionicons name="refresh" size={20} color="white" />
        <Text style={styles.refreshButtonText}>Обновить</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 20,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});