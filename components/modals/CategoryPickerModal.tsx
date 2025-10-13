// components/modals/CategoryPickerModal.tsx
import { View, Text, Pressable, StyleSheet, Modal, ScrollView, Animated, PanResponder, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useState, useEffect, useRef } from 'react';
import { operationService } from '@/services/operationService';

interface CategoryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCategorySelect: (category: string) => void;
  selectedCategory: string;
}

interface Category {
  id: number;
  name: string;
}

export default function CategoryPickerModal({
  visible,
  onClose,
  onCategorySelect,
  selectedCategory
}: CategoryPickerModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [tempCategory, setTempCategory] = useState(selectedCategory);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) panY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.timing(panY, { toValue: 300, duration: 300, useNativeDriver: true }),
          ]).start(() => {
            panY.setValue(0);
            onClose();
          });
        } else {
          Animated.spring(panY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  // 🆕 Сначала показываем дефолтные категории, потом загружаем пользовательские
  useEffect(() => {
    if (visible) {
      // Сразу показываем дефолтные категории
      setCategories(operationService.getDefaultCategories());
      // Затем загружаем все категории
      loadAllCategories();
    }
  }, [visible]);

  const loadAllCategories = async () => {
    try {
      setIsLoading(true);
      const allCategories = await operationService.getCategories();
      setCategories(allCategories);
    } catch (error: any) {
      console.warn('Error loading categories, using defaults:', error.message);
      // Уже показываем дефолтные, так что просто логируем ошибку
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setTempCategory(selectedCategory);
      fadeAnim.setValue(0);
      panY.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, selectedCategory]);

  const handleCategoryPress = (categoryName: string) => setTempCategory(categoryName);

  const handleSave = () => {
    Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
    }).start(() => {
        onCategorySelect(tempCategory);
        onClose();
    });
  };

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleCancel = () => {
    setTempCategory(selectedCategory);
    handleClose();
  };

  const translateY = panY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, 300],
    extrapolate: 'clamp',
  });

  // Функция для получения иконки по названию категории
  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Еда': 'fast-food',
      'Транспорт': 'car',
      'Жилье': 'home',
      'Магазины': 'cart',
      'Здоровье': 'medical',
      'Развлечения': 'game-controller',
      'Одежда': 'shirt',
      'Техника': 'phone-portrait',
      'Путешествия': 'airplane',
      'Образование': 'school',
      'Коммуналка': 'bulb',
      'Подписки': 'tv',
      'Зарплата': 'cash',
      'Премия': 'trophy',
      'Подработка': 'briefcase',
      'Другое': 'ellipsis-horizontal',
    };
    return icons[category] || 'pricetag';
  };

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={handleCancel}>
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <Pressable style={styles.overlayPressable} onPress={handleCancel} />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalContent,
            { backgroundColor: colors.background, transform: [{ translateY }], opacity: fadeAnim }
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
            <Pressable onPress={handleCancel} style={styles.modalCloseButton}>
              <Ionicons name="close" size={22} color={colors.icon} />
            </Pressable>
          </View>

          <ScrollView style={styles.categoriesList} showsVerticalScrollIndicator={false}>
            {categories.map((category) => (
              <Pressable
                key={category.id}
                style={({ pressed }) => [
                  styles.categoryItem,
                  {
                    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    transform: [{ scale: pressed ? 0.98 : 1 }]
                  },
                  tempCategory === category.name && [styles.categoryItemSelected, { backgroundColor: colors.tint }]
                ]}
                onPress={() => handleCategoryPress(category.name)}
              >
                <View style={styles.categoryContent}>
                  <Ionicons 
                    name={getCategoryIcon(category.name) as any} 
                    size={20} 
                    color={tempCategory === category.name ? '#fff' : colors.icon} 
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      { color: tempCategory === category.name ? '#fff' : colors.text },
                      tempCategory === category.name && styles.categoryTextSelected
                    ]}
                  >
                    {category.name}
                  </Text>
                </View>
                {tempCategory === category.name && <Ionicons name="checkmark" size={20} color="#fff" />}
              </Pressable>
            ))}
            
            {isLoading && (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, { color: colors.text }]}>
                  Загрузка дополнительных категорий...
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <Pressable
              style={[styles.modalButton, { backgroundColor: 'rgba(122, 122, 122, 0.1)' }]}
              onPress={handleCancel}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Отмена</Text>
            </Pressable>
            <Pressable 
              style={[
                styles.modalButton, 
                { backgroundColor: colors.tint },
                !tempCategory && { opacity: 0.5 }
              ]} 
              onPress={handleSave}
              disabled={!tempCategory}
            >
              <Text style={styles.modalButtonText}>Готово</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1 },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  overlayPressable: { flex: 1 },
  modalContent: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    paddingBottom: 30, 
    maxHeight: '80%' 
  },
  dragHandleContainer: { 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    alignItems: 'center' 
  },
  dragHandle: { 
    width: 40, 
    height: 4, 
    backgroundColor: 'rgba(0,0,0,0.2)', 
    borderRadius: 2 
  },
  modalHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 16,
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(0,0,0,0.1)' 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '600' 
  },
  modalCloseButton: { 
    padding: 8 
  },
  categoriesList: { 
    paddingHorizontal: 20, 
    marginVertical: 16, 
    maxHeight: 400 
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
  categoryItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 16, 
    paddingHorizontal: 16, 
    borderRadius: 12, 
    marginBottom: 8 
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryItemSelected: { 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 4, 
    elevation: 4 
  },
  categoryText: { 
    fontSize: 16, 
    fontWeight: '500' 
  },
  categoryTextSelected: { 
    fontWeight: '600' 
  },
  modalActions: { 
    flexDirection: 'row', 
    gap: 12, 
    paddingHorizontal: 20, 
    paddingTop: 10 
  },
  modalButton: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  modalButtonText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: 'white' 
  },
});