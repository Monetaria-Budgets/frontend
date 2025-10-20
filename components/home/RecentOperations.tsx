// components/home/RecentOperations.tsx - ФИНАЛЬНАЯ ВЕРСИЯ
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Operation } from '@/services/operationService';

interface RecentOperationsProps {
  operations: Operation[];
}

const RecentOperations: React.FC<RecentOperationsProps> = ({ operations }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const formatAmount = (amount: number, type: string) => {
    const sign = type === 'income' ? '+' : '–';
    return `${sign} ${amount.toLocaleString('ru-RU')} ₽`;
  };

  const getRelativeDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Сегодня';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Вчера';
      } else {
        return date.toLocaleDateString('ru-RU', { 
          day: 'numeric', 
          month: 'long',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch (error) {
      return 'Неизвестно';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      return '--:--';
    }
  };

  // Иконки категорий
  const getCategoryIcon = (category: string, type: string) => {
    if (type === 'income') return 'trending-up';
    
    const iconMap: { [key: string]: string } = {
      'Продукты': 'cart',
      'Транспорт': 'car',
      'Еда вне дома': 'restaurant',
      'Кафе и рестораны': 'cafe',
      'Остальное': 'bag-handle',
      'Зарплата': 'card',
      'Развлечения': 'film',
      'Здоровье': 'medkit',
      'Одежда': 'shirt',
      'Коммунальные': 'home',
      'Образование': 'school',
      'Подарки': 'gift',
      'Инвестиции': 'trending-up',
      'Жилье': 'business',
      'Магазины': 'storefront',
      'Техника': 'hardware-chip',
      'Путешествия': 'airplane',
      'Подписки': 'newspaper',
      'Красота': 'sparkles',
      'Спорт': 'barbell',
      'Такси': 'car-sport',
      'Супермаркет': 'basket',
    };
    return iconMap[category] || 'cash';
  };

  const getCategoryColor = (category: string, type: string) => {
    if (type === 'income') return '#34C759';
    
    const colorMap: { [key: string]: string } = {
      'Продукты': '#4CAF50',
      'Транспорт': '#2196F3',
      'Еда вне дома': '#FF9800',
      'Кафе и рестораны': '#FF5722',
      'Зарплата': '#4CAF50',
      'Развлечения': '#9C27B0',
      'Здоровье': '#F44336',
      'Одежда': '#E91E63',
      'Коммунальные': '#607D8B',
      'Образование': '#009688',
      'Подарки': '#FF5722',
      'Инвестиции': '#4CAF50',
      'Жилье': '#795548',
      'Магазины': '#FF9800',
      'Техника': '#2196F3',
      'Путешествия': '#3F51B5',
      'Подписки': '#9C27B0',
      'Красота': '#E91E63',
      'Спорт': '#4CAF50',
      'Такси': '#2196F3',
      'Супермаркет': '#8BC34A',
    };
    return colorMap[category] || '#FF6B6B';
  };

  // Группируем операции по дате
  const groupedOperations = operations.reduce((acc, operation) => {
    const dateKey = new Date(operation.created_at).toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(operation);
    return acc;
  }, {} as { [key: string]: Operation[] });

  const sortedDates = Object.keys(groupedOperations).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Берем операции из последних дней, пока не наберем 10
  let operationsCount = 0;
  const displayOperations: { date: string; operations: Operation[] }[] = [];

  for (const date of sortedDates) {
    if (operationsCount >= 10) break;
    
    const dateOperations = groupedOperations[date];
    const operationsToTake = Math.min(dateOperations.length, 10 - operationsCount);
    
    displayOperations.push({
      date,
      operations: dateOperations.slice(0, operationsToTake)
    });
    
    operationsCount += operationsToTake;
  }

  if (operations.length === 0) {
    return null;
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {/* Простой хедер */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Последние операции
        </Text>
        <Pressable 
          onPress={() => router.push('/(tabs)/history')}
          style={({ pressed }) => [
            styles.moreButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
        >
          <Text style={[styles.moreText, { color: colors.tint }]}>
            Все
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.tint} />
        </Pressable>
      </View>

      {/* Список операций с разбивкой по дням */}
      <View style={styles.operationsContainer}>
        {displayOperations.map(({ date, operations: dateOperations }, dateIndex) => (
          <View 
            key={date} 
            style={[
              styles.dateSection,
              dateIndex === displayOperations.length - 1 && styles.lastDateSection
            ]}
          >
            {/* Заголовок дня */}
            <Text style={[styles.dateText, { color: colors.text }]}>
              {getRelativeDate(date)}
            </Text>
            
            {/* Операции за день */}
            <View style={[styles.operationsList, { borderRadius: 12, overflow: 'hidden' }]}>
              {dateOperations.map((operation, index) => {
                const categoryColor = getCategoryColor(operation.category, operation.operation);
                const isFirst = index === 0;
                const isLast = index === dateOperations.length - 1;
                
                return (
                  <View 
                    key={operation.id} 
                    style={[
                      styles.operationItem,
                      { 
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                      isFirst && styles.firstOperationItem,
                      isLast && styles.lastOperationItem,
                    ]}
                  >
                    {/* Цветная полоска сбоку - теперь внутри контента */}
                    <View 
                      style={[
                        styles.operationTypeIndicator,
                        { 
                          backgroundColor: operation.operation === 'income' ? '#34C759' : '#FF3B30',
                          borderTopLeftRadius: isFirst ? 12 : 0,
                          borderBottomLeftRadius: isLast ? 12 : 0,
                        }
                      ]} 
                    />
                    
                    <View style={styles.operationContent}>
                      <View style={styles.operationLeft}>
                        <View 
                          style={[
                            styles.categoryIcon, 
                            { 
                              backgroundColor: categoryColor + '15',
                            }
                          ]}
                        >
                          <Ionicons 
                            name={getCategoryIcon(operation.category, operation.operation) as any} 
                            size={20} 
                            color={categoryColor} 
                          />
                        </View>
                        <View style={styles.operationInfo}>
                          <Text style={[styles.categoryText, { color: colors.text }]}>
                            {operation.category}
                          </Text>
                          {operation.description ? (
                            <Text style={[styles.descriptionText, { color: colors.icon }]}>
                              {operation.description}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      
                      <View style={styles.operationRight}>
                        <Text 
                          style={[
                            styles.amountText,
                            { 
                              color: operation.operation === 'income' ? '#34C759' : '#FF3B30'
                            }
                          ]}
                        >
                          {formatAmount(operation.amount, operation.operation)}
                        </Text>
                        <Text style={[styles.timeText, { color: colors.icon }]}>
                          {formatTime(operation.created_at)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginTop: 16,
    marginHorizontal: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  moreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  operationsContainer: {
    paddingHorizontal: 0,
  },
  dateSection: {
    marginBottom: 16,
  },
  lastDateSection: {
    marginBottom: 0,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 20,
    opacity: 0.8,
  },
  operationsList: {
    marginHorizontal: 0,
  },
  operationItem: {
    position: 'relative',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    marginHorizontal: 0,
  },
  firstOperationItem: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastOperationItem: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomWidth: 1,
  },
  operationTypeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  operationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginLeft: 3,
  },
  operationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  operationInfo: {
    flex: 1,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: 14,
    opacity: 0.7,
  },
  operationRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 13,
    opacity: 0.6,
    fontWeight: '500',
  },
});

export default RecentOperations;