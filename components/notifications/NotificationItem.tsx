import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface NotificationItemProps {
  notification: any;
  onPress: (notification: any) => void;
  onDelete: (notificationId: number) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onDelete,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const NOTIFICATION_TYPES: { [key: string]: string } = {
    'subscription_expiring': 'Истечение подписки',
    'system_update': 'Обновление системы', 
    'budget_exceeded': 'Превышение бюджета',
    'promo': 'Специальное предложение',
  };

  const NOTIFICATION_ICONS: { [key: string]: keyof typeof Ionicons.glyphMap } = {
    'subscription_expiring': 'calendar',
    'system_update': 'construct',
    'budget_exceeded': 'warning',
    'promo': 'pricetag',
  };

  const NOTIFICATION_COLORS: { [key: string]: string } = {
    'subscription_expiring': '#FF6B6B',
    'system_update': '#4ECDC4',
    'budget_exceeded': '#FFD166',
    'promo': '#9B5DE5',
  };

  const getTypeDisplayName = (typeName: string) => {
    return NOTIFICATION_TYPES[typeName] || typeName;
  };

  const getTypeIcon = (typeName: string): keyof typeof Ionicons.glyphMap => {
    return NOTIFICATION_ICONS[typeName] || 'notifications';
  };

  const getTypeColor = (typeName: string) => {
    return NOTIFICATION_COLORS[typeName] || colors.tint;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} д назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  };

  const typeColor = getTypeColor(notification.type_name);
  const displayName = getTypeDisplayName(notification.type_name);
  const isUnread = notification.is_read === 0;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.notificationItem,
        { 
          backgroundColor: colors.card,
          borderLeftColor: isUnread ? typeColor : 'transparent',
          transform: [{ scale: pressed ? 0.98 : 1 }],
        }
      ]}
      onPress={() => onPress(notification)}
    >
      <View style={[styles.iconContainer, { backgroundColor: typeColor }]}>
        <Ionicons 
          name={getTypeIcon(notification.type_name)} 
          size={20} 
          color="white" 
        />
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationType, { color: typeColor }]}>
            {displayName}
          </Text>
          <Text style={[styles.notificationDate, { color: colors.textSecondary }]}>
            {formatDate(notification.created_at)}
          </Text>
        </View>
        
        <Text 
          style={[
            styles.notificationMessage, 
            { color: colors.text },
            isUnread && styles.unreadMessage
          ]}
          numberOfLines={3}
        >
          {notification.message}
        </Text>
        
        <View style={styles.notificationFooter}>
          <View style={styles.timeInfo}>
            <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              {new Date(notification.created_at).toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
          {isUnread && (
            <View style={[styles.unreadBadge, { backgroundColor: typeColor }]} />
          )}
        </View>
      </View>
      
      <Pressable
        style={({ pressed }) => [
          styles.deleteButton,
          { opacity: pressed ? 0.5 : 1 }
        ]}
        onPress={() => onDelete(notification.id)}
        hitSlop={10}
      >
        <Ionicons name="close" size={18} color={colors.textSecondary} />
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
    gap: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationType: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  notificationDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  notificationMessage: {
    fontSize: 16,
    lineHeight: 22,
  },
  unreadMessage: {
    fontWeight: '600',
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
    marginTop: 2,
  },
});