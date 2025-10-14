// app/(tabs)/history/components/DaySection.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Operation } from '@/services/operationService';
import { OperationItem } from './OperationItem';

interface DaySectionProps {
  date: string;
  operations: Operation[];
}

export const DaySection = ({ date, operations }: DaySectionProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const formatDate = (dateStr: string) => {
    const operationDate = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = operationDate.toDateString() === today.toDateString();
    const isYesterday = operationDate.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return 'Сегодня';
    } else if (isYesterday) {
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
            {operations.length} операций
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
            isFirst={index === 0}
            isLast={index === operations.length - 1}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  daySection: {
    marginBottom: 20,
    paddingHorizontal: 16, // Добавили паддинг для всего дня
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 0, // Убрали паддинг, так как он теперь у контейнера
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