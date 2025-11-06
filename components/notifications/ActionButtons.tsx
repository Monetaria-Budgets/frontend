import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/theme';

interface ActionButtonsProps {
  notification: any;
  colors: typeof Colors.light | typeof Colors.dark;
  onClose: () => void;
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

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  notification,
  colors,
  onClose,
}) => {
  const router = useRouter();

  const getTypeColor = (typeName: string) => {
    return NOTIFICATION_COLORS[typeName] || colors.tint;
  };

  const getActionConfig = () => {
    switch (notification.type_name) {
      case 'subscription_expiring':
        return {
          primaryText: 'Управление подпиской',
          route: '/premium' as const,
          icon: 'card-outline' as const,
        };
      case 'budget_exceeded':
        return {
          primaryText: 'Посмотреть статистику',
          route: '/statistics' as const,
          icon: 'stats-chart-outline' as const,
        };
      case 'promo':
        return {
          primaryText: 'Изучить предложение',
          route: '/' as const,
          icon: 'pricetag-outline' as const,
        };
      case 'finance':
        return {
          primaryText: 'Открыть финансы',
          route: '/' as const,
          icon: 'cash-outline' as const,
        };
      case 'security':
        return {
          primaryText: 'Настройки безопасности',
          route: '/' as const,
          icon: 'shield-checkmark-outline' as const,
        };
      default:
        return {
          primaryText: 'Понятно',
          route: '' as const,
          icon: 'checkmark-outline' as const,
        };
    }
  };

  const handlePrimaryAction = () => {
    const config = getActionConfig();
    
    // Сначала закрываем модалку
    onClose();
    
    // Затем навигируем если есть маршрут
    if (config.route) {
      // Ждем немного чтобы анимация закрытия модалки завершилась
      setTimeout(() => {
        router.push(config.route);
      }, 300);
    }
  };

  const typeColor = getTypeColor(notification.type_name);
  const actionConfig = getActionConfig();

  return (
    <View style={styles.actionsContainer}>
      <Pressable 
        style={({ pressed }) => [
          styles.primaryButton,
          { 
            backgroundColor: typeColor,
            opacity: pressed ? 0.8 : 1,
            shadowColor: typeColor,
          }
        ]}
        onPress={handlePrimaryAction}
      >
        <Ionicons name={actionConfig.icon} size={18} color="white" />
        <Text style={styles.primaryButtonText}>
          {actionConfig.primaryText}
        </Text>
      </Pressable>

      <Pressable 
        style={({ pressed }) => [
          styles.secondaryButton,
          { 
            borderColor: colors.border,
            opacity: pressed ? 0.7 : 1
          }
        ]}
        onPress={onClose}
      >
        <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
          Закрыть
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    gap: 10,
    marginTop: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});