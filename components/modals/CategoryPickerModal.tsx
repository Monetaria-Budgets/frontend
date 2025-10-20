// components/modals/CategoryPickerModal.tsx
import { View, Text, Pressable, StyleSheet, Modal, ScrollView, Animated, PanResponder } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';

interface CategoryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCategorySelect: (category: string) => void;
  selectedCategory: string;
  userCategories: any[]; // Категории передаются из основной модалки
}

export default function CategoryPickerModal({
  visible,
  onClose,
  onCategorySelect,
  selectedCategory,
  userCategories = [] // Дефолтное значение
}: CategoryPickerModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [tempCategory, setTempCategory] = useState(selectedCategory);

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

  const handleManageCategories = () => {
    handleClose();
    setTimeout(() => {
      router.push('/categories');
    }, 300);
  };

  const translateY = panY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, 300],
    extrapolate: 'clamp',
  });

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
            <View style={[styles.dragHandle, { backgroundColor: colors.icon }]} />
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
            {userCategories.map((category) => (
              <Pressable
                key={category.id}
                style={({ pressed }) => [
                  styles.categoryItem,
                  {
                    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    transform: [{ scale: pressed ? 0.98 : 1 }]
                  },
                  tempCategory === category.name && [styles.categoryItemSelected, { backgroundColor: colors.tint + '20' }]
                ]}
                onPress={() => handleCategoryPress(category.name)}
              >
                <View style={styles.categoryContent}>
                  <View 
                    style={[
                      styles.categoryColor,
                      { backgroundColor: category.color }
                    ]} 
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      { color: colors.text },
                      tempCategory === category.name && styles.categoryTextSelected
                    ]}
                  >
                    {category.name}
                  </Text>
                </View>
                {tempCategory === category.name && (
                  <Ionicons name="checkmark" size={20} color={colors.tint} />
                )}
              </Pressable>
            ))}
            
            {userCategories.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="pricetag-outline" size={48} color={colors.icon} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Категорий пока нет
                </Text>
                <Text style={[styles.emptyText, { color: colors.icon }]}>
                  Создайте категории для удобного отслеживания расходов
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <Pressable
              style={[styles.manageButton, { backgroundColor: 'rgba(122, 122, 122, 0.1)' }]}
              onPress={handleManageCategories}
            >
              <Ionicons name="settings-outline" size={18} color={colors.text} />
              <Text style={[styles.manageButtonText, { color: colors.text }]}>
                Управление категориями
              </Text>
            </Pressable>
            
            <View style={styles.confirmActions}>
              <Pressable
                style={[styles.confirmButton, { backgroundColor: 'rgba(122, 122, 122, 0.1)' }]}
                onPress={handleCancel}
              >
                <Text style={[styles.confirmButtonText, { color: colors.text }]}>Отмена</Text>
              </Pressable>
              <Pressable 
                style={[
                  styles.confirmButton, 
                  { backgroundColor: colors.tint },
                  (!tempCategory || userCategories.length === 0) && { opacity: 0.5 }
                ]} 
                onPress={handleSave}
                disabled={!tempCategory || userCategories.length === 0}
              >
                <Text style={styles.confirmButtonText}>Выбрать</Text>
              </Pressable>
            </View>
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
  dragHandleContainer: { paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' },
  dragHandle: { width: 40, height: 4, borderRadius: 2, opacity: 0.3 },
  modalHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 16,
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(0,0,0,0.1)' 
  },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalCloseButton: { padding: 8 },
  categoriesList: { paddingHorizontal: 20, marginVertical: 16, maxHeight: 400 },
  categoryItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 16, 
    paddingHorizontal: 16, 
    borderRadius: 12, 
    marginBottom: 8 
  },
  categoryContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  categoryColor: { width: 20, height: 20, borderRadius: 10 },
  categoryItemSelected: { borderWidth: 2, borderColor: 'rgba(74, 144, 226, 0.3)' },
  categoryText: { fontSize: 16, fontWeight: '500' },
  categoryTextSelected: { fontWeight: '600', color: '#4A90E2' },
  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20, opacity: 0.7 },
  modalActions: { paddingHorizontal: 20, gap: 12 },
  manageButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  manageButtonText: { fontSize: 16, fontWeight: '500' },
  confirmActions: { flexDirection: 'row', gap: 12 },
  confirmButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  confirmButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
});