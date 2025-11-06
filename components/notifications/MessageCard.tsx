import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors } from '@/constants/theme';

interface MessageCardProps {
  notification: any;
  colors: typeof Colors.light | typeof Colors.dark;
}

const NOTIFICATION_COLORS: { [key: string]: string } = {
  'subscription_expiring': Colors.light.error,
  'system_update': Colors.light.info,
  'budget_exceeded': Colors.light.warning,
  'promo': '#9B5DE5',
};

export const MessageCard: React.FC<MessageCardProps> = ({
  notification,
  colors,
}) => {
  const getTypeColor = (typeName: string) => {
    return NOTIFICATION_COLORS[typeName] || colors.tint;
  };

  const typeColor = getTypeColor(notification.type_name);

  return (
    <View style={[styles.messageCard, { backgroundColor: colors.card }]}>
      <View style={styles.messageHeader}>
        <Text style={[styles.messageTitle, { color: colors.text }]}>
          Сообщение
        </Text>
        <View style={[styles.statusBadge, { 
          backgroundColor: notification.is_read === 1 ? colors.success : typeColor 
        }]}>
          <Text style={styles.statusText}>
            {notification.is_read === 1 ? 'Прочитано' : 'Новое'}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.messageText, { color: colors.text }]}>
        {notification.message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
});