// app/(tabs)/history/components/OperationItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Operation } from '@/services/operationService';
import Ionicons from '@expo/vector-icons/Ionicons';

interface OperationItemProps {
  operation: Operation;
}

export const OperationItem = ({ operation }: OperationItemProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isIncome = operation.operation === 'income';

  // Иконки для категорий из БД
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      'Продукты': 'cart-outline',
      'Транспорт': 'car-outline',
      'Еда': 'restaurant-outline',
      'Остальное': 'bag-outline',
      'Зарплата': 'card-outline',
      'Развлечения': 'film-outline',
      'Здоровье': 'medkit-outline',
      'Одежда': 'shirt-outline',
      'Коммунальные': 'home-outline',
      'Образование': 'school-outline',
      'Подарки': 'gift-outline',
      'Инвестиции': 'trending-up-outline',
    };
    return iconMap[category] || 'cash-outline';
  };

  return (
    <View style={[styles.operationItem, { 
      backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
    }]}>
      <View style={styles.operationLeft}>
        <View style={[styles.categoryIcon, { 
          backgroundColor: isIncome ? '#4CAF5020' : '#F4433620' 
        }]}>
          <Ionicons 
            name={getCategoryIcon(operation.category) as any} 
            size={20} 
            color={isIncome ? '#4CAF50' : '#F44336'} 
          />
        </View>
        <View style={styles.operationInfo}>
          <Text style={[styles.categoryText, { color: colors.text }]}>
            {operation.category}
          </Text>
          {operation.description ? (
            <Text 
              style={[styles.descriptionText, { color: colors.icon }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {operation.description}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.operationRight}>
        <Text style={[
          styles.amountText,
          { color: isIncome ? '#4CAF50' : colors.text }
        ]}>
          {isIncome ? '+' : ''}{operation.amount.toLocaleString('ru-RU')} ₽
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  operationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operationInfo: {
    flex: 1,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: 14,
    opacity: 0.7,
  },
  operationRight: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
});