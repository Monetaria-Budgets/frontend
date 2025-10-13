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
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const operationDate = new Date(dateStr);
    
    if (operationDate.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (operationDate.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      const day = operationDate.getDate();
      const month = operationDate.toLocaleDateString('ru-RU', { month: 'long' });
      const weekday = operationDate.toLocaleDateString('ru-RU', { weekday: 'short' });
      return `${day} ${month}, ${weekday}`;
    }
  };

  return (
    <View style={styles.daySection}>
      <View style={styles.dayHeader}>
        <Text style={[styles.dayDateText, { color: colors.text }]}>
          {formatDate(date)}
        </Text>
      </View>
      
      <View style={styles.operationsContainer}>
        {operations.map((operation) => (
          <OperationItem key={operation.id} operation={operation} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  daySection: {
    marginBottom: 24,
  },
  dayHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  dayDateText: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
  },
  operationsContainer: {
    gap: 1,
  },
});