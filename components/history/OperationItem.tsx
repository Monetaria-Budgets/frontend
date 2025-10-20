// app/(tabs)/history/components/OperationItem.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable, Alert, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Operation } from '@/services/operationService';
import { Category } from '@/services/categoryService';
import Ionicons from '@expo/vector-icons/Ionicons';
import { operationService } from '@/services/operationService';
import { EditOperationModal } from './EditOperationModal';

interface OperationItemProps {
  operation: Operation;
  categories: Category[];
  isFirst?: boolean;
  isLast?: boolean;
  onOperationUpdated: () => void;
}

export const OperationItem = ({ 
  operation, 
  categories,
  isFirst = false, 
  isLast = false,
  onOperationUpdated 
}: OperationItemProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isIncome = operation.operation === 'income';

  const [showEditModal, setShowEditModal] = useState(false);
  const swipeableRef = useRef<Swipeable>(null);

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

  const getCategoryColor = (): string => {
    if (isIncome) {
      return '#4CAF50';
    }
    const categoryData = categories.find(cat => cat.name === operation.category);
    return categoryData?.color || '#666666';
  };

  const categoryColor = getCategoryColor();

  const getItemStyles = (): ViewStyle[] => {
    const style: ViewStyle[] = [
      styles.operationItem,
      { 
        backgroundColor: colors.card,
        borderColor: colors.border,
      }
    ];

    // Скругления для айтема
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

    // Бордеры
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

  const handleEdit = () => {
    swipeableRef.current?.close();
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    try {
      await operationService.deleteOperation(operation.id);
      onOperationUpdated();
    } catch (error: any) {
      console.error('Error deleting operation:', error);
      Alert.alert('Ошибка', error.message || 'Ошибка при удалении операции');
    }
  };

  const confirmDelete = () => {
    swipeableRef.current?.close();
    Alert.alert(
      'Удалить операцию?',
      `Вы уверены, что хотите удалить операцию "${operation.category}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: handleDelete }
      ]
    );
  };

  // 🔥 ПРАВИЛЬНЫЕ ССЫЛКИ НА МОДАЛКИ + СПОКОЙНЫЙ ЖЕЛТЫЙ
  const renderLeftActions = (progress: any, dragX: any) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });

    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={[
        styles.leftAction,
        { 
          borderTopLeftRadius: isFirst ? 12 : 0,
          borderBottomLeftRadius: isLast ? 12 : 0,
          borderTopRightRadius: isFirst ? 12 : 0, 
          borderBottomRightRadius: isLast ? 12 : 0,
        }
      ]}>
        <Animated.View style={[
          styles.actionContent,
          { 
            transform: [{ scale }],
            opacity 
          }
        ]}>
          <Ionicons name="pencil" size={24} color="#fff" />
          <Text style={styles.actionText}>Изменить</Text>
        </Animated.View>
      </View>
    );
  };

  const renderRightActions = (progress: any, dragX: any) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });

    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={[
        styles.rightAction,
        { 
          // 🔥 ЗАКРУГЛЕНИЯ КАК У АЙТЕМА:
          borderTopRightRadius: isFirst ? 12 : 0,
          borderBottomRightRadius: isLast ? 12 : 0,
          borderTopLeftRadius: isFirst ? 12 : 0, 
          borderBottomLeftRadius: isLast ? 12 : 0,
        }
      ]}>
        <Animated.View style={[
          styles.actionContent,
          { 
            transform: [{ scale }],
            opacity 
          }
        ]}>
          <Ionicons name="trash" size={24} color="#fff" />
          <Text style={styles.actionText}>Удалить</Text>
        </Animated.View>
      </View>
    );
  };

  const OperationContent = () => (
    <View style={getItemStyles()}>
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
              backgroundColor: isIncome ? '#4CAF5010' : categoryColor + '10'
            }
          ]}>
            <Ionicons 
              name={isIncome ? "cash-outline" : "card-outline"} 
              size={20} 
              color={isIncome ? '#4CAF50' : categoryColor} 
            />
          </View>
          
          <View style={styles.operationInfo}>
            <Text style={[
              styles.categoryText, 
              { color: colors.text }
            ]}>
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
            ) : (
              <Text style={[styles.descriptionText, { color: colors.icon }]}>
                {isIncome ? 'Пополнение' : 'Расход'}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.operationRight}>
          {isIncome ? (
            <View style={styles.incomeBadge}>
              <Text style={styles.incomeBadgeText}>
                +{operation.amount.toLocaleString('ru-RU')} ₽
              </Text>
            </View>
          ) : (
            <Text style={[
              styles.amountText,
              { color: colors.text }
            ]}>
              −{operation.amount.toLocaleString('ru-RU')} ₽
            </Text>
          )}
          <Text style={[styles.timeText, { color: colors.icon }]}>
            {formatTime(operation.created_at)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <View style={styles.swipeableWrapper}>
        <Swipeable
          ref={swipeableRef}
          renderLeftActions={renderLeftActions}
          renderRightActions={renderRightActions}
          // 🔥 ПРАВИЛЬНЫЕ ССЫЛКИ:
          onSwipeableLeftOpen={handleEdit} // Свайп вправо → Изменить
          onSwipeableRightOpen={confirmDelete} // Свайп влево → Удалить
          leftThreshold={60}
          rightThreshold={60}
          friction={2}
          containerStyle={styles.swipeableContainer}
        >
          <OperationContent />
        </Swipeable>
      </View>

      <EditOperationModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        operation={operation}
        categories={categories}
        onOperationUpdated={onOperationUpdated}
      />
    </>
  );
};

const styles = StyleSheet.create({
  swipeableWrapper: {
    marginHorizontal: 16,
    marginBottom: 0,
  },
  swipeableContainer: {
    // Без ограничений
  },
  operationItem: {
    position: 'relative',
  },
  operationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    opacity: 0.6,
  },
  operationRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  incomeBadge: {
    backgroundColor: '#4CAF5015',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4CAF5030',
  },
  incomeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 13,
    opacity: 0.6,
    fontWeight: '500',
  },
  // 🔥 КНОПКИ СО СПОКОЙНЫМ ЖЕЛТЫМ
  leftAction: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFB74D', // 🔥 СПОКОЙНЫЙ ЖЕЛТЫЙ
  },
  rightAction: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EF5350',
  },
  actionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});