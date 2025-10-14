// app/(tabs)/history/components/OperationItem.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Operation } from '@/services/operationService';
import Ionicons from '@expo/vector-icons/Ionicons';

interface OperationItemProps {
  operation: Operation;
  isFirst?: boolean;
  isLast?: boolean;
}

export const OperationItem = ({ operation, isFirst = false, isLast = false }: OperationItemProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isIncome = operation.operation === 'income';

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

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      'Продукты': 'cart',
      'Транспорт': 'car',
      'Еда': 'restaurant',
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
    };
    return iconMap[category] || 'cash';
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'Продукты': '#4CAF50',
      'Транспорт': '#2196F3',
      'Еда': '#FF9800',
      'Зарплата': '#4CAF50',
      'Развлечения': '#9C27B0',
      'Здоровье': '#F44336',
      'Одежда': '#E91E63',
      'Коммунальные': '#607D8B',
      'Образование': '#009688',
      'Подарки': '#FF5722',
      'Инвестиции': '#4CAF50',
    };
    return colorMap[category] || (isIncome ? '#4CAF50' : '#F44336');
  };

  const categoryColor = getCategoryColor(operation.category);

  const getItemStyles = (): ViewStyle[] => {
    const style: ViewStyle[] = [
      styles.operationItem,
      { 
        backgroundColor: colors.card,
        borderColor: colors.border,
      }
    ];

    // Добавляем скругления в зависимости от позиции
    if (isFirst && isLast) {
      style.push({ borderRadius: 12 });
    } else if (isFirst) {
      style.push({ 
        borderTopLeftRadius: 12, 
        borderTopRightRadius: 12 
      });
    } else if (isLast) {
      style.push({ 
        borderBottomLeftRadius: 12, 
        borderBottomRightRadius: 12 
      });
    }

    // Добавляем бордер если это единственный элемент
    if (isFirst && isLast) {
      style.push({ borderWidth: 1 });
    } else if (isFirst) {
      style.push({ 
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 0
      });
    } else if (isLast) {
      style.push({ 
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 0
      });
    } else {
      style.push({ 
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 0,
        borderBottomWidth: 0
      });
    }

    return style;
  };

  return (
    <View style={getItemStyles()}>
      {/* Добавляем разделитель если не последний элемент */}
      {!isLast && (
        <View style={[
          styles.divider,
          { backgroundColor: colors.border }
        ]} />
      )}
      
      <View style={styles.operationContent}>
        <View style={styles.operationLeft}>
          <View style={[
            styles.categoryIcon,
            { 
              backgroundColor: categoryColor + '15',
            }
          ]}>
            <Ionicons 
              name={getCategoryIcon(operation.category) as any} 
              size={20} 
              color={categoryColor} 
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
            { color: isIncome ? '#4CAF50' : '#F44336' }
          ]}>
            {isIncome ? '+' : '−'}{operation.amount.toLocaleString('ru-RU')} ₽
          </Text>
          <Text style={[styles.timeText, { color: colors.icon }]}>
            {formatTime(operation.created_at)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  operationItem: {
    position: 'relative',
    // Убрали marginHorizontal - теперь айтемы на всю ширину контейнера
  },
  operationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  divider: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
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