import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useNotification } from '@/contexts/NotificationContext';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function NotificationDetailModal() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { notifications, markAsRead, deleteNotification } = useNotification();
  
  const [notification, setNotification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundNotification = notifications.find((n: any) => n.id === parseInt(id as string));
    setNotification(foundNotification);
    setLoading(false);

    // Помечаем как прочитанное при открытии
    if (foundNotification && foundNotification.is_read === 0) {
      markAsRead(foundNotification.id);
    }
  }, [id, notifications]);

  const handleDelete = () => {
    if (!notification) return;
    
    Alert.alert(
      'Удалить уведомление',
      'Вы уверены, что хотите удалить это уведомление?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: () => {
            deleteNotification(notification.id);
            router.back();
          }
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Сегодня в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Вчера в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getTypeDisplayName = (typeName: string) => {
    const typeMap: { [key: string]: string } = {
      'subscription_expiring': 'Истечение подписки',
      'system_update': 'Обновление системы',
      'budget_exceeded': 'Превышение бюджета',
      'promo': 'Специальное предложение',
    };
    return typeMap[typeName] || typeName;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Загрузка...
          </Text>
        </View>
      </View>
    );
  }

  if (!notification) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Уведомление не найдено
          </Text>
          <Pressable 
            style={[styles.backButton, { backgroundColor: colors.tint }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Вернуться назад</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Заголовок уведомления */}
        <View style={styles.titleSection}>
          <View style={[styles.typeBadge, { backgroundColor: colors.tint + '20' }]}>
            <Text style={[styles.typeText, { color: colors.tint }]}>
              {getTypeDisplayName(notification.type_name)}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {formatDate(notification.created_at)}
          </Text>
        </View>

        {/* Сообщение */}
        <View style={[styles.messageCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.messageText, { color: colors.text }]}>
            {notification.message}
          </Text>
        </View>

        {/* Простая информация */}
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons 
                name={notification.source === 'email' ? 'mail-outline' : 'notifications-outline'} 
                size={16} 
                color={colors.textSecondary} 
              />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {notification.source === 'email' ? 'Email' : 'Push'} •{' '}
                {notification.is_read === 1 ? 'Прочитано' : 'Новое'}
              </Text>
            </View>
          </View>
        </View>

        {/* Кнопка удаления */}
        <Pressable 
          style={[styles.deleteButton, { backgroundColor: colors.error + '15' }]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={[styles.deleteButtonText, { color: colors.error }]}>
            Удалить уведомление
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  messageCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});