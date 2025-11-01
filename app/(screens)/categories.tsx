// app/screens/categories.tsx - ПОЛНАЯ ВЕРСИЯ
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
import CategoryModal from '@/components/categories/CategoryModal';

// Хуки и сервисы
import { useCategories } from '@/contexts/CategoriesContext';
import { Category, CreateCategoryData, UpdateCategoryData } from '@/services/categoryService';
import { categoryService } from '@/services/categoryService';
import { operationService } from '@/services/operationService';

export default function CategoriesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  
  const { categories, loading, error, limit, premiumStatus, actions } = useCategories();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await actions.refresh();
    setRefreshing(false);
  }, [actions]);

  const handleCreateCategory = async (data: CreateCategoryData) => {
    try {
      await actions.createCategory(data);
    } catch (err: any) {
      Alert.alert('Ошибка', err.message);
    }
  };

  const handleUpdateCategory = async (data: UpdateCategoryData) => {
    if (!editingCategory) return;
    
    try {
      await actions.updateCategory(editingCategory.id, data);
      setEditingCategory(null);
    } catch (err: any) {
      Alert.alert('Ошибка', err.message);
    }
  };

  // Обновленная функция удаления с проверкой операций
  const handleDeleteCategory = async (category: Category) => {
    try {
      // Проверяем есть ли операции с этой категорией
      const operations = await categoryService.getCategoryOperations(category.id);
      
      if (operations.length > 0) {
        Alert.alert(
          'Удалить категорию?',
          `С категорией "${category.name}" связано ${operations.length} операций. Что вы хотите сделать?`,
          [
            { text: 'Отмена', style: 'cancel' },
            {
              text: 'Удалить все операции',
              style: 'destructive',
              onPress: async () => {
                try {
                  // Удаляем все операции категории
                  for (const operation of operations) {
                    await operationService.deleteOperation(operation.id);
                  }
                  // Затем удаляем категорию
                  await actions.deleteCategory(category.id);
                  Alert.alert('Успех', 'Категория и все связанные операции удалены');
                } catch (err: any) {
                  Alert.alert('Ошибка', err.message);
                }
              },
            },
          ]
        );
      } else {
        // Если операций нет - просто удаляем
        Alert.alert(
          'Удалить категорию?',
          `Вы уверены, что хотите удалить категорию "${category.name}"?`,
          [
            { text: 'Отмена', style: 'cancel' },
            {
              text: 'Удалить',
              style: 'destructive',
              onPress: async () => {
                try {
                  await actions.deleteCategory(category.id);
                } catch (err: any) {
                  Alert.alert('Ошибка', err.message);
                }
              },
            },
          ]
        );
      }
    } catch (err: any) {
      Alert.alert('Ошибка', 'Не удалось проверить операции категории');
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingCategory(null);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const canCreateCategory = premiumStatus.hasActivePremium || limit.current < limit.limit;

  if (loading && !refreshing && categories.length === 0) {
    return (
      <ThemedGradientView style={styles.container}>
        <Stack.Screen 
          options={{ 
            headerShown: true,
            title: 'Мои категории',
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
            Загрузка категорий...
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
          title: 'Мои категории',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} style={{ marginLeft: 16 }} />
            </TouchableOpacity>
          ),
        }} 
      />

      {/* Информация о лимите */}
      <View style={[styles.limitCard, { backgroundColor: colors.card }]}>
        <View style={styles.limitHeader}>
          <Text style={[styles.limitTitle, { color: colors.text }]}>
            Лимит категорий
          </Text>
          {!premiumStatus.hasActivePremium && (
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
                width: `${Math.min(100, (limit.current / limit.limit) * 100)}%`
              }
            ]} 
          />
        </View>
        
        <Text style={[styles.limitText, { color: colors.icon }]}>
          {limit.current} из {premiumStatus.hasActivePremium ? '∞' : limit.limit} категорий 
        </Text>
        
        {!canCreateCategory && (
          <Text style={[styles.limitWarning, { color: '#FF3B30' }]}>
            Достигнут лимит категорий. Обновите до премиум для создания большего количества.
          </Text>
        )}
      </View>

      {/* Список категорий */}
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
        <View style={styles.categoriesList}>
          {categories.map((category) => (
            <View 
              key={category.id} 
              style={[styles.categoryCard, { backgroundColor: colors.card }]}
            >
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
                  <Text style={[styles.categorySpent, { color: colors.icon }]}>
                    Потрачено в этом месяце: {formatAmount(category.current_month_spent || 0)} ₽
                  </Text>
                </View>
              </View>
              
              <View style={styles.categoryActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEditCategory(category)}
                >
                  <Ionicons name="create-outline" size={20} color={colors.icon} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDeleteCategory(category)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {categories.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.icon + '20' }]}>
                <Text style={[styles.emptyIconText, { color: colors.icon }]}>🏷️</Text>
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Категорий пока нет
              </Text>
              <Text style={[styles.emptyText, { color: colors.icon }]}>
                Создайте свою первую категорию для отслеживания расходов
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Кнопка добавления */}
      {canCreateCategory && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.tint }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Модальное окно */}
      <CategoryModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onCreate={handleCreateCategory}
        onUpdate={handleUpdateCategory}
        category={editingCategory}
        isEdit={!!editingCategory}
      />
    </ThemedGradientView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    margin: 16,
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
    alignItems: 'center',
    marginBottom: 12,
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
    marginBottom: 8,
    overflow: 'hidden',
  },
  limitProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  limitText: {
    fontSize: 14,
    marginBottom: 4,
  },
  limitWarning: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  categoriesList: {
    padding: 16,
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  categorySpent: {
    fontSize: 12,
    opacity: 0.7,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIconText: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
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