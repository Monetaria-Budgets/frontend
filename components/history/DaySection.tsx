// app/(tabs)/history/components/DaySection.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Operation } from '@/services/operationService';
import { Category } from '@/services/categoryService';
import { OperationItem } from './OperationItem';

interface DaySectionProps {
  date: string;
  operations: Operation[];
  categories: Category[];
  onOperationUpdated: () => void;
  showSwipeHint?: boolean;
}

export const DaySection = ({ 
  date, 
  operations, 
  categories,
  onOperationUpdated,
  showSwipeHint = false 
}: DaySectionProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // 🔥 ФИКС: Правильное определение "Сегодня", "Вчера" с учетом часового пояса
  const formatDate = (dateStr: string) => {
    try {
      // Создаем дату из строки (учитываем разные форматы)
      let operationDate: Date;
      
      if (dateStr.includes('T')) {
        // ISO format: 2024-10-21T10:30:00
        operationDate = new Date(dateStr);
      } else if (dateStr.includes(' ')) {
        // SQL format: 2024-10-21 10:30:00
        operationDate = new Date(dateStr.replace(' ', 'T'));
      } else {
        // Only date: 2024-10-21
        operationDate = new Date(dateStr + 'T00:00:00');
      }
      
      // Проверяем валидность даты
      if (isNaN(operationDate.getTime())) {
        console.warn('Invalid date:', dateStr);
        return 'Неизвестная дата';
      }
      
      // 🔥 ВАЖНО: Получаем текущую дату в локальном часовом поясе
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Приводим дату операции к локальной дате (без времени)
      const operationLocalDate = new Date(
        operationDate.getFullYear(), 
        operationDate.getMonth(), 
        operationDate.getDate()
      );
      
      // Сравниваем даты
      if (operationLocalDate.getTime() === today.getTime()) {
        return 'Сегодня';
      } else if (operationLocalDate.getTime() === yesterday.getTime()) {
        return 'Вчера';
      } else {
        const day = operationDate.getDate();
        const month = operationDate.toLocaleDateString('ru-RU', { 
          month: 'long'
        });
        const weekday = operationDate.toLocaleDateString('ru-RU', { 
          weekday: 'long'
        });
        
        const currentYear = new Date().getFullYear();
        const operationYear = operationDate.getFullYear();
        
        if (operationYear === currentYear) {
          return `${day} ${month}, ${weekday}`;
        } else {
          return `${day} ${month} ${operationYear}, ${weekday}`;
        }
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Неизвестная дата';
    }
  };

  const getDayTotal = (ops: Operation[]) => {
    return ops.reduce((total, op) => {
      return op.operation === 'income' ? total + op.amount : total - op.amount;
    }, 0);
  };

  const dayTotal = getDayTotal(operations);
  const isPositiveDay = dayTotal >= 0;

  return (
    <View style={styles.daySection}>
      <View style={styles.dayHeader}>
        <View style={styles.dayHeaderLeft}>
          <Text style={[styles.dayDateText, { color: colors.text }]}>
            {formatDate(date)}
          </Text>
          <Text style={[styles.operationsCount, { color: colors.icon }]}>
            {operations.length} {operations.length === 1 ? 'операция' : 
             operations.length > 1 && operations.length < 5 ? 'операции' : 'операций'}
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
      
      <View style={styles.operationsContainer}>
        {operations.map((operation, index) => (
          <OperationItem 
            key={operation.id} 
            operation={operation}
            categories={categories}
            isFirst={index === 0}
            isLast={index === operations.length - 1}
            onOperationUpdated={onOperationUpdated}
            // 🔥 ПЕРЕДАЕМ ХИНТ ТОЛЬКО ПЕРВОЙ ОПЕРАЦИИ ПЕРВОГО ДНЯ
            showSwipeHint={showSwipeHint && index === 0}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  daySection: {
    marginBottom: 20,
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
  operationsContainer: {
  },
});