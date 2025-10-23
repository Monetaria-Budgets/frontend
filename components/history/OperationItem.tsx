// app/(tabs)/history/components/OperationItem.tsx
import React, { useState, useRef, useEffect } from 'react';
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
  showSwipeHint?: boolean;
}

export const OperationItem = ({ 
  operation, 
  categories,
  isFirst = false, 
  isLast = false,
  onOperationUpdated,
  showSwipeHint = false
}: OperationItemProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isIncome = operation.operation === 'income';

  const [showEditModal, setShowEditModal] = useState(false);
  const [isShowingHint, setIsShowingHint] = useState(false);
  const swipeableRef = useRef<Swipeable>(null);
  const hintAnim = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(0)).current;

  // 🔥 ПОКАЗ ХИНТА ПРИ КАЖДОМ ЗАХОДЕ В ИСТОРИЮ
  useEffect(() => {
    if (showSwipeHint && !isShowingHint) {
      const timer = setTimeout(() => {
        showSwipeHintAnimation();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint]);

  const showSwipeHintAnimation = () => {
    setIsShowingHint(true);
    
    // 🔥 УЛУЧШЕННАЯ АНИМАЦИЯ С ПЛАВНЫМ ПОЯВЛЕНИЕМ
    Animated.parallel([
      Animated.timing(hintAnim, {
        toValue: 60, // УМЕНЬШИЛ СДВИГ ДЛЯ БОЛЕЕ АККУРАТНОГО ВИДА
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(hintOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Держим открытым 1.5 секунды
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(hintAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(hintOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start(() => {
          setIsShowingHint(false);
        });
      }, 1500);
    });
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
          <Ionicons name="trash" size={24} color="#fff" />
          <Text style={styles.actionText}>Удалить</Text>
        </Animated.View>
      </View>
    );
  };

  const OperationContent = () => (
    <Animated.View 
      style={[
        getItemStyles(),
        isShowingHint && { 
          transform: [{ translateX: hintAnim }],
          shadowColor: colors.tint,
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }
      ]}
    >
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

      {/* 🔥 СТИЛЬНЫЙ ХИНТ */}
      {isShowingHint && (
        <Animated.View 
          style={[
            styles.hintContainer,
            { 
              opacity: hintOpacity,
              backgroundColor: colors.tint
            }
          ]}
        >
          <View style={styles.hintContent}>
            <View style={styles.hintLeft}>
              <View style={[
                styles.hintIcon,
                { backgroundColor: '#FFB74D' }
              ]}>
                <Ionicons name="arrow-back" size={16} color="#FFF" />
              </View>
              <Text style={[
                styles.hintText,
                { color: colorScheme === 'dark' ? '#FFD54F' : '#E65100' }
              ]}>
                Сдвиньте для редактирования
              </Text>
            </View>
            
            <View style={styles.hintRight}>
              <Text style={[
                styles.hintText,
                { color: colorScheme === 'dark' ? '#EF9A9A' : '#D32F2F' }
              ]}>
                Удалить
              </Text>
              <View style={[
                styles.hintIcon,
                { backgroundColor: '#EF5350' }
              ]}>
                <Ionicons name="arrow-forward" size={16} color="#FFF" />
              </View>
            </View>
          </View>
          
          {/* 🔥 ИНДИКАТОР ПРОГРЕССА */}
          <Animated.View 
            style={[
              styles.hintProgress,
              { 
                backgroundColor: colors.tint,
                transform: [{
                  scaleX: hintAnim.interpolate({
                    inputRange: [0, 60],
                    outputRange: [0, 1],
                  })
                }]
              }
            ]} 
          />
        </Animated.View>
      )}
    </Animated.View>
  );

  return (
    <>
      <View style={styles.swipeableWrapper}>
        <Swipeable
          ref={swipeableRef}
          renderLeftActions={renderLeftActions}
          renderRightActions={renderRightActions}
          onSwipeableLeftOpen={handleEdit}
          onSwipeableRightOpen={confirmDelete}
          leftThreshold={40}
          rightThreshold={40}
          friction={2}
          overshootLeft={false}
          overshootRight={false}
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
  operationItem: {
    position: 'relative',
    overflow: 'hidden',
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
  leftAction: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFB74D',
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
  // 🔥 СТИЛЬНЫЙ ХИНТ
  hintContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#FFB74D',
  },
  hintContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hintLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hintRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hintIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    fontSize: 13,
    fontWeight: '600',
  },
  hintProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    transformOrigin: 'left',
  },
});