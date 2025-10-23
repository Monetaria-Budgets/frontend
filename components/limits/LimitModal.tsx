// components/limits/LimitModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Category, SpendingLimit, CreateLimitData, UpdateLimitData } from '@/services/limitService';

interface LimitModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (data: CreateLimitData) => Promise<void>;
  onUpdate: (data: UpdateLimitData) => Promise<void>;
  limit?: SpendingLimit | null;
  categories: Category[];
  isEdit?: boolean;
}

const LimitModal: React.FC<LimitModalProps> = ({
  visible,
  onClose,
  onCreate,
  onUpdate,
  limit,
  categories,
  isEdit = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (isEdit && limit) {
        setAmount(limit.amount.toString());
        // Находим категорию по category_id
        const category = categories.find(cat => cat.id === limit.category_id);
        setSelectedCategory(category || null);
      } else {
        resetForm();
      }
    }
  }, [visible, isEdit, limit, categories]);

  const resetForm = () => {
    setAmount('');
    setSelectedCategory(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert('Ошибка', 'Выберите категорию');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }

    setLoading(true);
    try {
      const limitData = {
        category_id: selectedCategory.id,
        amount: parseFloat(amount),
      };

      if (isEdit && limit) {
        await onUpdate(limitData);
      } else {
        await onCreate(limitData);
      }
      handleClose();
    } catch (error: any) {
      Alert.alert('Ошибка', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (value: string) => {
    // Убираем все символы кроме цифр и точки
    const cleaned = value.replace(/[^\d.]/g, '');
    // Оставляем только одну точку
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return cleaned;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            {isEdit ? 'Редактировать лимит' : 'Новый лимит'}
          </Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Выбор категории */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Категория
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              <View style={styles.categoriesContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      { 
                        backgroundColor: selectedCategory?.id === category.id 
                          ? category.color + '30' 
                          : colors.card,
                        borderColor: selectedCategory?.id === category.id 
                          ? category.color 
                          : 'transparent',
                      }
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <View 
                      style={[
                        styles.categoryColor,
                        { backgroundColor: category.color }
                      ]} 
                    />
                    <Text 
                      style={[
                        styles.categoryName,
                        { 
                          color: selectedCategory?.id === category.id 
                            ? colors.text 
                            : colors.icon 
                        }
                      ]}
                      numberOfLines={1}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Сумма лимита */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Сумма лимита
            </Text>
            <View style={[styles.amountInputContainer, { backgroundColor: colors.card }]}>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                value={amount}
                onChangeText={(text) => setAmount(formatAmount(text))}
                placeholder="0.00"
                placeholderTextColor={colors.icon}
                keyboardType="decimal-pad"
                maxLength={10}
              />
              <Text style={[styles.currency, { color: colors.icon }]}>₽</Text>
            </View>
          </View>

          {/* Информация */}
          <View style={[styles.infoCard, { backgroundColor: colors.tint + '10' }]}>
            <Ionicons name="information-circle" size={20} color={colors.tint} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {isEdit 
                ? 'Приложение будет уведомлять вас при превышении лимита'
                : 'Установите лимит для контроля расходов по категории'
              }
            </Text>
          </View>
        </ScrollView>

        {/* Кнопка сохранения */}
        <View style={[styles.footer, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              { 
                backgroundColor: colors.tint,
                opacity: (!selectedCategory || !amount || loading) ? 0.6 : 1 
              }
            ]}
            onPress={handleSubmit}
            disabled={!selectedCategory || !amount || loading}
          >
            {loading ? (
              <Text style={styles.saveButtonText}>Сохранение...</Text>
            ) : (
              <Text style={styles.saveButtonText}>
                {isEdit ? 'Сохранить изменения' : 'Создать лимит'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 4,
    width: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoriesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
    minWidth: 120,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    padding: 0,
  },
  currency: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LimitModal;