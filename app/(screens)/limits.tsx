// app/screens/limits.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedGradientView } from '@/components/themed-gradient-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

// Компоненты
import LimitModal from '@/components/limits/LimitModal';

// Хуки и сервисы
import { useSpendingLimits } from '@/hooks/useSpendingLimits';
import { useCategories } from '@/hooks/useCategories';
import { SpendingLimit, CreateLimitData, UpdateLimitData } from '@/services/limitService';

export default function LimitsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  
  const { categories: allCategories } = useCategories();
  const { categoriesWithLimits, loading, error, limitInfo, premiumStatus, actions } = useSpendingLimits();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLimit, setEditingLimit] = useState<SpendingLimit | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Используем реальный премиум статус
  const isPremium = premiumStatus.isPremium;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await actions.refresh();
    setRefreshing(false);
  }, [actions]);

  // Категории без установленных лимитов
  const availableCategories = allCategories.filter(category => 
    !categoriesWithLimits.some(catWithLimit => 
      catWithLimit.id === category.id && catWithLimit.spending_limit
    )
  );

  const handleCreateLimit = async (data: CreateLimitData) => {
    try {
      await actions.createLimit(data);
      Alert.alert('Успех', 'Лимит успешно создан');
    } catch (err: any) {
      Alert.alert('Ошибка', err.message);
    }
  };

  const handleUpdateLimit = async (data: UpdateLimitData) => {
    if (!editingLimit) return;
    
    try {
      await actions.updateLimit(editingLimit.id, data);
      setEditingLimit(null);
      Alert.alert('Успех', 'Лимит обновлен');
    } catch (err: any) {
      Alert.alert('Ошибка', err.message);
    }
  };

  const handleDeleteLimit = (limit: SpendingLimit) => {
    Alert.alert(
      'Удалить лимит',
      'Вы уверены, что хотите удалить этот лимит?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await actions.deleteLimit(limit.id);
              Alert.alert('Успех', 'Лимит удален');
            } catch (err: any) {
              Alert.alert('Ошибка', err.message);
            }
          },
        },
      ]
    );
  };

  const handleEditLimit = (limit: SpendingLimit) => {
    setEditingLimit(limit);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingLimit(null);
  };

  const getProgressPercentage = (current: number, limit: number) => {
    return Math.min(100, (current / limit) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return '#FF3B30';
    if (percentage >= 80) return '#FF9500';
    return '#4ECDC4';
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const canCreateLimit = isPremium || limitInfo.current < limitInfo.limit;

  if (loading && !refreshing && categoriesWithLimits.length === 0) {
    return (
      <ThemedGradientView style={styles.container}>
        <Stack.Screen 
          options={{ 
            headerShown: true,
            title: 'Лимиты расходов',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={colors.text} style={{ marginLeft: 16 }} />
              </TouchableOpacity>
            ),
          }} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Загрузка лимитов...
          </Text>
        </View>
      </ThemedGradientView>
    );
  }

  return (
    <ThemedGradientView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Лимиты расходов',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} style={{ marginLeft: 16 }} />
            </TouchableOpacity>
          ),
        }} 
      />

      {/* Информация о лимите лимитов */}
      <View style={[styles.limitCard, { backgroundColor: colors.card }]}>
        <View style={styles.limitHeader}>
          <Text style={[styles.limitTitle, { color: colors.text }]}>
            Лимиты расходов
          </Text>
          {!isPremium && (
            <TouchableOpacity 
              style={[styles.premiumButton, { backgroundColor: colors.tint }]}
              onPress={() => router.push('/premium')}
            >
              <Text style={styles.premiumButtonText}>Премиум</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.limitProgress}>
          <View 
            style={[
              styles.limitProgressBar,
              { 
                backgroundColor: colors.tint,
                width: `${Math.min(100, (limitInfo.current / limitInfo.limit) * 100)}%`
              }
            ]} 
          />
        </View>
        
        <Text style={[styles.limitText, { color: colors.icon }]}>
          {limitInfo.current} из {isPremium ? '∞' : limitInfo.limit} лимитов
        </Text>
        
        {!canCreateLimit && (
          <Text style={[styles.limitWarning, { color: '#FF3B30' }]}>
            Достигнут лимит на установку лимитов. Обновите до премиум для создания большего количества.
          </Text>
        )}
      </View>

      {/* Список лимитов */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.limitsList}>
          {categoriesWithLimits.map((category) => {
            if (!category.spending_limit) return null;
            
            const limit = category.spending_limit;
            const progressPercentage = getProgressPercentage(category.current_spent || 0, limit.amount);
            const progressColor = getProgressColor(progressPercentage);
            const isExceeded = category.is_exceeded;

            return (
              <View 
                key={limit.id} 
                style={[
                  styles.limitCard, 
                  { backgroundColor: colors.card },
                  isExceeded && { borderColor: '#FF3B30', borderWidth: 1 }
                ]}
              >
                <View style={styles.limitHeader}>
                  <View style={styles.categoryInfo}>
                    <View 
                      style={[
                        styles.categoryColor,
                        { backgroundColor: category.color }
                      ]}
                    />
                    <View style={styles.categoryText}>
                      <Text style={[styles.categoryName, { color: colors.text }]}>
                        {category.name}
                      </Text>
                      <Text style={[styles.periodText, { color: colors.icon }]}>
                        Лимит расходов в месяц
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.amountContainer}>
                    <Text style={[styles.amountText, { color: colors.text }]}>
                      {formatAmount(category.current_spent || 0)} / {formatAmount(limit.amount)} ₽
                    </Text>
                    {isExceeded && (
                      <View style={styles.exceededBadge}>
                        <Ionicons name="warning" size={12} color="#FFFFFF" />
                        <Text style={styles.exceededText}>Превышен</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Прогресс бар */}
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { backgroundColor: colors.background + '80' }]}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          backgroundColor: progressColor,
                          width: `${progressPercentage}%`
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.progressText, { color: colors.icon }]}>
                    {progressPercentage.toFixed(0)}%
                  </Text>
                </View>

                {/* Дополнительная информация */}
                <View style={styles.spentInfo}>
                  <Text style={[styles.spentText, { color: colors.icon }]}>
                    Потрачено в этом месяце: {formatAmount(category.current_spent || 0)} ₽
                  </Text>
                  {isExceeded && (
                    <Text style={[styles.exceededWarning, { color: '#FF3B30' }]}>
                      Превышение: {formatAmount((category.current_spent || 0) - limit.amount)} ₽
                    </Text>
                  )}
                </View>

                {/* Действия */}
                <View style={styles.limitActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditLimit(limit)}
                  >
                    <Ionicons name="create-outline" size={20} color={colors.icon} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteLimit(limit)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
          
          {/* Пустое состояние */}
          {categoriesWithLimits.filter(cat => cat.spending_limit).length === 0 && !loading && (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.icon + '20' }]}>
                <Text style={[styles.emptyIconText, { color: colors.icon }]}>🎯</Text>
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Лимитов пока нет
              </Text>
              <Text style={[styles.emptyText, { color: colors.icon }]}>
                Установите лимиты для контроля расходов по категориям
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Кнопка добавления */}
      {canCreateLimit && availableCategories.length > 0 && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.tint }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Модальное окно */}
      <LimitModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onCreate={handleCreateLimit}
        onUpdate={handleUpdateLimit}
        limit={editingLimit}
        categories={editingLimit ? allCategories : availableCategories}
        isEdit={!!editingLimit}
      />
    </ThemedGradientView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  limitCard: {
    marginHorizontal: 16,
    marginVertical: 2, // Уменьшено с 16
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  limitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8, // Уменьшено с 12
  },
  limitTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  premiumButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  premiumButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  limitProgress: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    marginBottom: 6, // Уменьшено с 8
    overflow: 'hidden',
  },
  limitProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  limitText: {
    fontSize: 14,
    marginBottom: 2, // Уменьшено с 4
  },
  limitWarning: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  limitsList: {
    paddingHorizontal: 16,
    paddingVertical: 8, // Уменьшено с 16
    gap: 12, // Уменьшено с 16
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  periodText: {
    fontSize: 12,
    opacity: 0.7,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exceededBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  exceededText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6, // Уменьшено с 8
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 30,
  },
  spentInfo: {
    marginBottom: 8, // Уменьшено с 12
  },
  spentText: {
    fontSize: 12,
    marginBottom: 2, // Уменьшено с 4
  },
  exceededWarning: {
    fontSize: 12,
    fontWeight: '600',
  },
  limitActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40, // Уменьшено с 60
  },
  emptyIcon: {
    width: 60, // Уменьшено с 80
    height: 60, // Уменьшено с 80
    borderRadius: 30, // Уменьшено с 40
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16, // Уменьшено с 20
  },
  emptyIconText: {
    fontSize: 30, // Уменьшено с 40
  },
  emptyTitle: {
    fontSize: 18, // Уменьшено с 20
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6, // Уменьшено с 8
  },
  emptyText: {
    fontSize: 14, // Уменьшено с 16
    textAlign: 'center',
    lineHeight: 20, // Уменьшено с 22
    opacity: 0.6,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});