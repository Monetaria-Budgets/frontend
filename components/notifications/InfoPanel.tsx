import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/theme';

interface InfoPanelProps {
  notification: any;
  colors: typeof Colors.light | typeof Colors.dark;
}

const NOTIFICATION_COLORS: { [key: string]: string } = {
  'subscription_expiring': Colors.light.error,
  'system_update': Colors.light.info,
  'budget_exceeded': Colors.light.warning,
  'promo': '#9B5DE5',
  'system': Colors.light.tint,
  'security': '#8B5CF6',
  'finance': '#10B981',
};

const NOTIFICATION_TYPES: { [key: string]: string } = {
  'subscription_expiring': 'Истечение подписки',
  'system_update': 'Обновление системы', 
  'budget_exceeded': 'Превышение бюджета',
  'promo': 'Специальное предложение',
  'system': 'Системное уведомление',
  'security': 'Безопасность',
  'finance': 'Финансы',
};

export const InfoPanel: React.FC<InfoPanelProps> = ({
  notification,
  colors,
}) => {
  const getTypeColor = (typeName: string) => {
    return NOTIFICATION_COLORS[typeName] || colors.tint;
  };

  const getTypeDisplayName = (typeName: string) => {
    return NOTIFICATION_TYPES[typeName] || typeName;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      // Если меньше суток - показываем время
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      // Если больше суток - показываем дату
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const typeColor = getTypeColor(notification.type_name);
  const displayName = getTypeDisplayName(notification.type_name);

  const infoItems = [
    {
      icon: 'time-outline' as const,
      label: 'Время получения',
      value: formatDate(notification.created_at),
    },
    ...(notification.scheduled_at ? [{
      icon: 'calendar-outline' as const,
      label: 'Запланировано на',
      value: formatDate(notification.scheduled_at),
    }] : []),
    {
      icon: 'notifications-outline' as const,
      label: 'Тип уведомления',
      value: displayName,
    },
    {
      icon: 'checkmark-done-outline' as const,
      label: 'Статус',
      value: notification.is_read === 1 ? 'Прочитано' : 'Непрочитано',
    },
  ];

  return (
    <View style={[styles.infoPanel, { backgroundColor: colors.card }]}>
      <Text style={[styles.infoTitle, { color: colors.text }]}>
        Детали уведомления
      </Text>
      
      <View style={styles.infoGrid}>
        {infoItems.map((item, index) => (
          <View key={index} style={styles.infoItem}>
            <View style={[styles.infoIcon, { backgroundColor: typeColor + '20' }]}>
              <Ionicons name={item.icon} size={16} color={typeColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {item.label}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {item.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoPanel: {
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
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 14,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
});