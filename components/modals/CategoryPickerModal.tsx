import { View, Text, Pressable, StyleSheet, Modal, ScrollView, Animated, PanResponder } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useState, useEffect, useRef } from 'react';

interface CategoryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCategorySelect: (category: string) => void;
  selectedCategory: string;
}

const expenseCategories = [
  { id: '1', name: '🍔 Еда', icon: 'fast-food' },
  { id: '2', name: '🚗 Транспорт', icon: 'car' },
  { id: '3', name: '🏠 Жилье', icon: 'home' },
  { id: '4', name: '🛒 Магазины', icon: 'cart' },
  { id: '5', name: '💊 Здоровье', icon: 'medical' },
  { id: '6', name: '🎮 Развлечения', icon: 'game-controller' },
  { id: '7', name: '👕 Одежда', icon: 'shirt' },
  { id: '8', name: '📱 Техника', icon: 'phone-portrait' },
  { id: '9', name: '✈️ Путешествия', icon: 'airplane' },
  { id: '10', name: '🎓 Образование', icon: 'school' },
  { id: '11', name: '💡 Коммуналка', icon: 'bulb' },
  { id: '12', name: '📺 Подписки', icon: 'tv' },
];

export default function CategoryPickerModal({
  visible,
  onClose,
  onCategorySelect,
  selectedCategory
}: CategoryPickerModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
          // Свайп вниз — анимация исчезания + съезжание
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
        onCategorySelect(tempCategory); // вызываем после анимации
        onClose();
    });
  };


  const handleClose = () => {
    // Плавное исчезание при обычном закрытии
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>Выберите категорию</Text>
            <Pressable onPress={handleCancel} style={styles.modalCloseButton}>
              <Ionicons name="close" size={22} color={colors.icon} />
            </Pressable>
          </View>

          <ScrollView style={styles.categoriesList} showsVerticalScrollIndicator={false}>
            {expenseCategories.map((category) => (
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
                <Text
                  style={[
                    styles.categoryText,
                    { color: colors.text },
                    tempCategory === category.name && styles.categoryTextSelected
                  ]}
                >
                  {category.name}
                </Text>
                {tempCategory === category.name && <Ionicons name="checkmark" size={20} color="#fff" />}
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.modalActions}>
            <Pressable
              style={[styles.modalButton, { backgroundColor: 'rgba(122, 122, 122, 0.1)' }]}
              onPress={handleCancel}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Отмена</Text>
            </Pressable>
            <Pressable style={[styles.modalButton, { backgroundColor: colors.tint }]} onPress={handleSave}>
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
  modalContent: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30, maxHeight: '80%' },
  dragHandleContainer: { paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' },
  dragHandle: { width: 40, height: 4, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 2 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalCloseButton: { padding: 8 },
  categoriesList: { paddingHorizontal: 20, marginVertical: 16, maxHeight: 400 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8 },
  categoryItemSelected: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  categoryText: { fontSize: 16, fontWeight: '500' },
  categoryTextSelected: { color: '#fff', fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 10 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
});
