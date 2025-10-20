// components/categories/CategoryModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Category, CreateCategoryData, UpdateCategoryData } from '@/services/categoryService';

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  category?: Category | null;
  isEdit?: boolean;
  onCreate?: (data: CreateCategoryData) => Promise<void>;
  onUpdate?: (data: UpdateCategoryData) => Promise<void>;
}

// Предопределенные цвета для выбора
const COLOR_PRESETS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#FFA726', '#66BB6A', '#AB47BC', '#26C6DA', '#FFCA28',
  '#42A5F5', '#7E57C2', '#26A69A', '#D4E157', '#FF7043'
];

const CategoryModal: React.FC<CategoryModalProps> = ({
  visible,
  onClose,
  category,
  isEdit = false,
  onCreate,
  onUpdate,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4ECDC4');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Сбрасываем форму при открытии/закрытии
  useEffect(() => {
    if (visible) {
      if (isEdit && category) {
        setName(category.name);
        setSelectedColor(category.color || '#4ECDC4');
      } else {
        setName('');
        setSelectedColor('#4ECDC4');
      }
      setShowColorPicker(false);
    }
  }, [visible, isEdit, category]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Введите название категории');
      return;
    }

    if (name.trim().length > 20) {
      Alert.alert('Ошибка', 'Название не должно превышать 20 символов');
      return;
    }

    try {
      setLoading(true);
      
      if (!isEdit && onCreate) {
        // Создание новой категории
        await onCreate({
          name: name.trim(),
          color: selectedColor,
        });
      } else if (isEdit && onUpdate) {
        // Редактирование существующей категории
        const updateData: UpdateCategoryData = {};
        
        if (name.trim() !== category?.name) {
          updateData.name = name.trim();
        }
        if (selectedColor !== category?.color) {
          updateData.color = selectedColor;
        }
        
        // Если есть изменения - сохраняем
        if (Object.keys(updateData).length > 0) {
          await onUpdate(updateData);
        }
      }
      
      onClose();
    } catch (error) {
      // Ошибка обрабатывается в родительском компоненте
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setShowColorPicker(false);
  };

  // Если открыт ColorPicker - показываем только его
  if (showColorPicker) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity 
                    style={styles.backButton}
                    onPress={handleClose} 
                    disabled={loading}
                    >
                    <Ionicons name="close-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
            
                <View style={styles.headerCenter}>
                    <Text style={[styles.title, { color: colors.text }]}>
                    {isEdit ? 'Редактировать' : 'Новая категория'}
                    </Text>
                </View>
            
                <View style={styles.headerRight}>
                    <TouchableOpacity 
                    style={[
                        styles.saveButton, 
                        { 
                        backgroundColor: name.trim() ? colors.tint : colors.border,
                        opacity: name.trim() ? 1 : 0.5
                        }
                    ]}
                    onPress={handleSave} 
                    disabled={loading || !name.trim()}
                    >
                    <Text style={styles.saveButtonText}>
                        {loading ? '...' : 'Сохранить'}
                    </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => setShowColorPicker(false)} 
                    disabled={loading}
                    >
                    <Ionicons name="arrow-back-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
            
                <View style={styles.headerCenter}>
                    <Text style={[styles.title, { color: colors.text }]}>
                    Выбор цвета
                    </Text>
                </View>
            
                <View style={styles.headerRight}>
                    <TouchableOpacity 
                    style={styles.doneButton}
                    onPress={() => setShowColorPicker(false)}
                    >
                    <Text style={[styles.doneButtonText, { color: colors.tint }]}>
                        Готово
                    </Text>
                    </TouchableOpacity>
                </View>
            </View>

          <ScrollView style={styles.colorPickerContainer} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginHorizontal: 16, marginTop: 16 }]}>
              Выберите цвет категории
            </Text>
            
            <View style={styles.colorGrid}>
              {COLOR_PRESETS.map((color, index) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { 
                      backgroundColor: color,
                      borderColor: selectedColor === color ? colors.tint : 'transparent'
                    }
                  ]}
                  onPress={() => handleColorSelect(color)}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.selectedColorPreview, { margin: 16 }]}>
              <Text style={[styles.selectedColorText, { color: colors.text }]}>
                Выбранный цвет:
              </Text>
              <View style={styles.selectedColorInfo}>
                <View 
                  style={[
                    styles.selectedColorDisplay, 
                    { backgroundColor: selectedColor }
                  ]} 
                />
                <Text style={[styles.selectedColorValue, { color: colors.text }]}>
                  {selectedColor}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: colors.tint, margin: 16 }
              ]}
              onPress={() => setShowColorPicker(false)}
            >
              <Text style={styles.confirmButtonText}>Готово</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    );
  }

  // Основное модальное окно (когда color picker закрыт)
  return (
    <Modal
      visible={visible && !showColorPicker}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose} disabled={loading}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.title, { color: colors.text }]}>
            {isEdit ? 'Редактировать категорию' : 'Новая категория'}
          </Text>
          
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <Text style={[styles.saveButton, { color: loading ? colors.icon : colors.tint }]}>
              {loading ? '...' : 'Готово'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" // Добавляем для лучшей работы с клавиатурой
        >
          {/* Название категории */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Название категории
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border
              }]}
              placeholder="Например: Еда, Транспорт..."
              placeholderTextColor={colors.icon}
              value={name}
              onChangeText={setName}
              maxLength={20}
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={() => {
                // Скрываем клавиатуру при нажатии Done/Готово
                // но не сохраняем форму автоматически
              }}
            />
            <Text style={[styles.charCount, { color: colors.icon }]}>
              {name.length}/20
            </Text>
          </View>

          {/* Выбор цвета */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Цвет категории
            </Text>
            
            <TouchableOpacity 
              style={styles.colorSelector}
              onPress={() => setShowColorPicker(true)}
              disabled={loading}
            >
              <View style={[styles.selectedColorCircle, { backgroundColor: selectedColor }]} />
              <Text style={[styles.colorSelectorText, { color: colors.text }]}>
                Нажмите чтобы выбрать цвет
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.icon} />
            </TouchableOpacity>

            <View style={styles.currentColorInfo}>
              <Text style={[styles.currentColorLabel, { color: colors.icon }]}>
                Текущий цвет:
              </Text>
              <Text style={[styles.currentColorValue, { color: colors.text }]}>
                {selectedColor}
              </Text>
            </View>
          </View>

          {/* Предпросмотр */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Предпросмотр
            </Text>
            <View style={styles.preview}>
              <View 
                style={[
                  styles.previewColor,
                  { backgroundColor: selectedColor }
                ]}
              />
              <Text style={[styles.previewName, { color: colors.text }]}>
                {name || 'Название категории'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerLeft: {
    width: 80,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    padding: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
  },
  colorSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedColorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  colorSelectorText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  currentColorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentColorLabel: {
    fontSize: 14,
  },
  currentColorValue: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  colorPickerContainer: {
    flex: 1,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedColorPreview: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 16,
  },
  selectedColorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  selectedColorDisplay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedColorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedColorValue: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'monospace',
    flex: 1,
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CategoryModal;