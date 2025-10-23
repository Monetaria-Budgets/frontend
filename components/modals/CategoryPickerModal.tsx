// components/modals/CategoryPickerModal.tsx
import { View, Text, Pressable, StyleSheet, Modal, Animated, PanResponder, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useState, useEffect, useRef } from 'react';

interface CategoryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCategorySelect: (category: string) => void;
  selectedCategory: string;
  userCategories: any[];
  categoriesWithLimits?: any[];
}

export default function CategoryPickerModal({ 
  visible, 
  onClose, 
  onCategorySelect, 
  selectedCategory, 
  userCategories,
  categoriesWithLimits = []
}: CategoryPickerModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      panY.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleCategoryPress = (categoryName: string) => {
    onCategorySelect(categoryName);
  };

  const translateY = panY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, 300],
    extrapolate: 'clamp',
  });

  // Получаем информацию о лимите для категории
  const getCategoryLimitInfo = (categoryName: string) => {
    const categoryWithLimit = categoriesWithLimits.find(cat => cat.name === categoryName);
    if (!categoryWithLimit || !categoryWithLimit.spending_limit) return null;

    const currentSpent = categoryWithLimit.current_spent || 0;
    const limitAmount = categoryWithLimit.spending_limit.amount;
    const remaining = limitAmount - currentSpent;
    const percentage = (currentSpent / limitAmount) * 100;

    return {
      currentSpent,
      limitAmount,
      remaining,
      percentage,
      isExceeded: currentSpent > limitAmount
    };
  };

  // Функция для получения цвета статуса лимита
  const getLimitStatusColor = (percentage: number, isExceeded: boolean) => {
    if (isExceeded) return '#FF3B30';
    if (percentage >= 80) return '#FF9500';
    if (percentage >= 50) return '#FFCC00';
    return '#34C759';
  };

  // Форматирование валюты
  const formatCurrency = (value: number) => {
    return value.toLocaleString('ru-RU') + '₽';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: fadeAnim }
          ]}
        >
          <Pressable 
            style={styles.overlayPressable}
            onPress={handleClose}
          />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.modalContent, 
            { 
              backgroundColor: colors.background,
              transform: [{ translateY }]
            }
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>
          
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Выберите категорию
            </Text>
            <Pressable onPress={handleClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={22} color={colors.icon} />
            </Pressable>
          </View>

          <ScrollView 
            style={styles.categoriesList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {userCategories.map((category) => {
              const limitInfo = getCategoryLimitInfo(category.name);
              const isSelected = selectedCategory === category.name;
              
              return (
                <Pressable
                  key={category.id}
                  style={({ pressed }) => [
                    styles.categoryItem,
                    { 
                      backgroundColor: colors.card,
                      borderColor: isSelected ? colors.tint : 'transparent',
                      transform: [{ scale: pressed ? 0.98 : 1 }]
                    }
                  ]}
                  onPress={() => handleCategoryPress(category.name)}
                >
                  <View style={styles.categoryMain}>
                    <View style={styles.categoryLeft}>
                      <View 
                        style={[
                          styles.categoryColor,
                          { backgroundColor: category.color || colors.tint }
                        ]} 
                      />
                      <View style={styles.categoryInfo}>
                        <Text style={[styles.categoryName, { color: colors.text }]}>
                          {category.name}
                        </Text>
                        {limitInfo && (
                          <View style={styles.limitProgress}>
                            <View style={styles.progressBar}>
                              <View 
                                style={[
                                  styles.progressFill,
                                  { 
                                    backgroundColor: getLimitStatusColor(limitInfo.percentage, limitInfo.isExceeded),
                                    width: `${Math.min(100, limitInfo.percentage)}%`
                                  }
                                ]} 
                              />
                            </View>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.categoryRight}>
                      {/* Статус лимита */}
                      {limitInfo && (
                        <View style={styles.limitStatus}>
                          <Text 
                            style={[
                              styles.limitText,
                              { color: getLimitStatusColor(limitInfo.percentage, limitInfo.isExceeded) }
                            ]}
                          >
                            {formatCurrency(limitInfo.currentSpent)} / {formatCurrency(limitInfo.limitAmount)}
                          </Text>
                        </View>
                      )}

                      {/* Иконка выбора */}
                      {isSelected && (
                        <View style={[styles.selectedIcon, { backgroundColor: colors.tint }]}>
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}

            {userCategories.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="pricetags-outline" size={48} color={colors.icon} />
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  Нет категорий
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.icon }]}>
                  Создайте категории в настройках
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayPressable: {
    flex: 1,
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '85%',
  },
  dragHandleContainer: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 8,
  },
  categoriesList: {
    flex: 1,
  },
  categoriesContent: {
    padding: 16,
    gap: 12,
  },
  categoryItem: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  categoryInfo: {
    flex: 1,
    gap: 6,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  limitProgress: {
    width: '100%',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  limitStatus: {
    alignItems: 'flex-end',
  },
  limitText: {
    fontSize: 12,
    fontWeight: '600',
  },
  selectedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
  },
});