import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNotification } from '@/contexts/NotificationContext';
import { Colors } from '@/constants/theme';

interface ModalHeaderProps {
  notification: any;
  onClose: () => void;
}

const NOTIFICATION_TYPES: { [key: string]: string } = {
  'subscription_expiring': 'Истечение подписки',
  'system_update': 'Обновление системы', 
  'budget_exceeded': 'Превышение бюджета',
  'promo': 'Специальное предложение',
  'system': 'Системное уведомление',
  'security': 'Безопасность',
  'finance': 'Финансы',
};

const NOTIFICATION_ICONS: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  'subscription_expiring': 'calendar',
  'system_update': 'construct',
  'budget_exceeded': 'warning',
  'promo': 'pricetag',
  'system': 'notifications',
  'security': 'shield-checkmark',
  'finance': 'cash',
};

const NOTIFICATION_COLORS: { [key: string]: string } = {
  'subscription_expiring': Colors.light.error,
  'system_update': Colors.light.info,
  'budget_exceeded': Colors.light.warning,
  'promo': '#9B5DE5',
  'system': Colors.light.tint,
  'security': '#8B5CF6',
  'finance': '#10B981',
};

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  notification,
  onClose,
}) => {
  const { deleteNotification } = useNotification();
  const [isDeleting, setIsDeleting] = useState(false);

  const getTypeDisplayName = (typeName: string) => {
    return NOTIFICATION_TYPES[typeName] || typeName;
  };

  const getTypeIcon = (typeName: string): keyof typeof Ionicons.glyphMap => {
    return NOTIFICATION_ICONS[typeName] || 'notifications';
  };

  const getTypeColor = (typeName: string) => {
    return NOTIFICATION_COLORS[typeName] || Colors.light.tint;
  };

  const handleDelete = async () => {
    Alert.alert(
      'Удалить уведомление',
      'Вы уверены, что хотите удалить это уведомление?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteNotification(notification.id);
              onClose();
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить уведомление');
            } finally {
              setIsDeleting(false);
            }
          }
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${notification.message}\n\nОтправлено из Monetaria`,
        title: 'Уведомление из Monetaria',
      });
    } catch (error) {
      console.error('Ошибка при попытке поделиться:', error);
    }
  };

  const typeColor = getTypeColor(notification.type_name);
  const displayName = getTypeDisplayName(notification.type_name);

  return (
    <LinearGradient
      colors={[typeColor, typeColor + 'DD']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        {/* Левая часть - кнопка назад */}
        <Pressable 
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
          onPress={onClose}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </Pressable>
        
        {/* Центральная часть - заголовок */}
        <View style={styles.headerCenter}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={getTypeIcon(notification.type_name)} 
              size={18} 
              color={typeColor} 
            />
          </View>
          <Text 
            style={styles.headerTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayName}
          </Text>
        </View>

        {/* Правая часть - действия */}
        <View style={styles.headerActions}>
          <Pressable 
            style={({ pressed }) => [
              styles.actionButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={18} color="white" />
          </Pressable>
          
          <Pressable 
            style={({ pressed }) => [
              styles.actionButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="trash-outline" size={18} color="white" />
            )}
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 50, // Уменьшили высоту
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40, // Фиксированная высота для всего хедера
  },
  backButton: {
    padding: 6,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
    width: 80, // Фиксированная ширина для действий
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 6,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});