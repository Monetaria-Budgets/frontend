// components/home/RecentOperations.tsx - ПЕРЕДЕЛАННЫЙ ПОД СТИЛЬ ИСТОРИИ
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Operation } from '@/services/operationService';
import { Category } from '@/services/categoryService';

interface RecentOperationsProps {
  operations: Operation[];
  categories: Category[];
}

const RecentOperations: React.FC<RecentOperationsProps> = ({ operations, categories }) => {
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

  // 🔥 ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ЦВЕТА КАТЕГОРИИ ИЗ БЭКА
  const getCategoryColor = (categoryName: string, type: string): string => {
    if (type === 'income') return '#4CAF50';
    
    // Ищем категорию в списке из бэка
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || '#666666';
  };

  // Группируем операции по дате (как в истории)
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

  if (operations.length === 0) {
    return null;
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {/* Хедер как в истории */}
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

      {/* Список операций с разбивкой по дням КАК В ИСТОРИИ */}
      <View style={styles.operationsContainer}>
        {sortedDates.map((date, dateIndex) => {
          const dateOperations = groupedOperations[date];
          const dayTotal = dateOperations.reduce((total, op) => {
            return op.operation === 'income' ? total + op.amount : total - op.amount;
          }, 0);
          const isPositiveDay = dayTotal >= 0;

          return (
            <View 
              key={date} 
              style={[
                styles.daySection,
                dateIndex === sortedDates.length - 1 && styles.lastDaySection
              ]}
            >
              {/* Заголовок дня как в истории */}
              <View style={styles.dayHeader}>
                <View style={styles.dayHeaderLeft}>
                  <Text style={[styles.dayDateText, { color: colors.text }]}>
                    {getRelativeDate(date)}
                  </Text>
                  <Text style={[styles.operationsCount, { color: colors.icon }]}>
                    {dateOperations.length} {dateOperations.length === 1 ? 'операция' : 
                     dateOperations.length > 1 && dateOperations.length < 5 ? 'операции' : 'операций'}
                  </Text>
                </View>
                <View style={[
                  styles.dayTotalBadge,
                  { 
                    backgroundColor: isPositiveDay ? '#4CAF5015' : '#F4433615',
                    borderColor: isPositiveDay ? '#4CAF5030' : '#F4433630'
                  }
                ]}>
                  <Text style={[
                    styles.dayTotalText,
                    { color: isPositiveDay ? '#4CAF50' : '#F44336' }
                  ]}>
                    {isPositiveDay ? '+' : ''}{dayTotal.toLocaleString('ru-RU')} ₽
                  </Text>
                </View>
              </View>
              
              {/* Операции за день как в истории */}
              <View style={styles.operationsList}>
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
                      {/* Цветная полоска сбоку как в истории */}
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
                          {/* Цветной круг категории как в истории */}
                          <View 
                            style={[
                              styles.categoryColorDot, 
                              { backgroundColor: categoryColor }
                            ]} 
                          />
                          
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
          );
        })}
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
  daySection: {
    marginBottom: 20,
  },
  lastDaySection: {
    marginBottom: 0,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  dayHeaderLeft: {
    flex: 1,
  },
  dayDateText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  operationsCount: {
    fontSize: 13,
    opacity: 0.7,
  },
  dayTotalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 12,
    borderWidth: 1,
  },
  dayTotalText: {
    fontSize: 14,
    fontWeight: '700',
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginLeft: 3,
  },
  operationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
    opacity: 0.6,
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