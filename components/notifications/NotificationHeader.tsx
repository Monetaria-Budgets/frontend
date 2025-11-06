import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface NotificationHeaderProps {
  unreadCount: number;
  totalCount: number;
  onMarkAllAsRead: () => void;
  onDeleteAll: () => void;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  unreadCount,
  totalCount,
  onMarkAllAsRead,
  onDeleteAll,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.header}>
      <View style={styles.headerMain}>
        <View style={styles.titleContainer}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>
            Уведомления
          </Text>
          {totalCount > 0 && (
            <View style={[styles.counter, { backgroundColor: colors.tint }]}>
              <Text style={styles.counterText}>{totalCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.stats}>
          {unreadCount > 0 && (
            <View style={styles.unreadStats}>
              <View style={[styles.unreadDot, { backgroundColor: colors.tint }]} />
              <Text style={[styles.unreadText, { color: colors.tint }]}>
                {unreadCount} непрочитанных
              </Text>
            </View>
          )}
        </View>
      </View>

      {totalCount > 0 && (
        <View style={styles.actions}>
          {unreadCount > 0 && (
            <Pressable 
              onPress={onMarkAllAsRead}
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Ionicons name="checkmark-done-outline" size={20} color={colors.tint} />
              <Text style={[styles.actionText, { color: colors.tint }]}>
                Прочитать все
              </Text>
            </Pressable>
          )}
          
          <Pressable 
            onPress={onDeleteAll}
            style={({ pressed }) => [
              styles.actionButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            <Text style={[styles.actionText, { color: '#FF6B6B' }]}>
              Очистить все
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 16,
  },
  headerMain: {
    gap: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  counter: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 28,
    alignItems: 'center',
  },
  counterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  unreadText: {
    fontSize: 15,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});