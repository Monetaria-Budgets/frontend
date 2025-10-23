import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  Modal
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import DateTimePickerModal from '@/components/modals/DateTimePickerModal';
import CategoryPickerModal from '@/components/modals/CategoryPickerModal';
import { operationService, UpdateOperationData } from '@/services/operationService';
import { Category } from '@/services/categoryService';
import { eventBus } from '@/utils/eventBus';

interface EditOperationModalProps {
  visible: boolean;
  onClose: () => void;
  operation: any;
  categories: Category[];
  onOperationUpdated: () => void;
}

export const EditOperationModal = ({ 
  visible, 
  onClose, 
  operation, 
  categories,
  onOperationUpdated 
}: EditOperationModalProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isIncome, setIsIncome] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 ИСПРАВЛЕННАЯ ЛОГИКА: Заполняем данные при изменении операции
  useEffect(() => {
    if (visible && operation) {
      console.log('📝 Operation data for editing:', operation); // 🔥 ДЕБАГ
      
      setAmount(operation.amount.toString());
      setCategory(operation.category || '');
      setDescription(operation.description || '');
      setIsIncome(operation.operation === 'income');
      setSelectedDate(new Date(operation.created_at));
    }
  }, [visible, operation]); // 🔥 Добавляем operation в зависимости

  // 🔥 Очищаем категорию только при РУЧНОЙ смене типа операции
  const handleTypeChange = (income: boolean) => {
    if (isIncome !== income) {
      // Только если пользователь сам меняет тип, очищаем категорию
      setCategory('');
    }
    setIsIncome(income);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setShowCategoryPicker(false);
  };

  const handleClearCategory = () => {
    setCategory('');
  };

  const handleClearDescription = () => {
    setDescription('');
  };

  const handleClearDate = () => {
    setSelectedDate(new Date());
  };

  const formatDateForBackend = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }

    if (!category) {
      Alert.alert('Ошибка', isIncome ? 'Введите название дохода' : 'Выберите категорию');
      return;
    }

    try {
      setIsLoading(true);

      const operationData = {
        amount: parseFloat(amount),
        category: category,
        description: description || undefined,
        operation_type_id: isIncome ? 1 : 2,
        created_at: formatDateForBackend(selectedDate),
      };

      console.log('📤 Sending update data:', operationData); // 🔥 ДЕБАГ

      await operationService.updateOperation(operation.id, operationData);

      eventBus.emit('operationAdded');

      Alert.alert('Успех', 'Операция успешно обновлена', [
        {
          text: 'OK',
          onPress: () => {
            onOperationUpdated();
            onClose();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error updating operation:', error);
      Alert.alert('Ошибка', error.message || 'Не удалось обновить операцию');
    } finally {
      setIsLoading(false);
    }
  };

  // Получаем цвет выбранной категории
  const getCategoryColor = () => {
    if (!category || isIncome) return colors.tint;
    const foundCategory = categories.find(cat => cat.name === category);
    return foundCategory?.color || colors.tint;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]} // 🔥 СПОКОЙНЫЙ ЖЕЛТЫЙ ФОН
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Заголовок */}
        <View style={[styles.header, { 
          backgroundColor: colors.background,
          borderBottomColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }]}>
          <Pressable 
            onPress={onClose}
            style={styles.iconButton}
            disabled={isLoading}
          >
            <Ionicons name="close" size={22} color={colors.icon} />
          </Pressable>

          <Text style={[styles.title, { color: colors.text }]}>
            Редактировать операцию
          </Text>

          <Pressable
            onPress={handleSave}
            style={styles.iconButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <Ionicons name="hourglass" size={22} color={colors.icon} />
            ) : (
              <Ionicons name="checkmark" size={22} color={colors.tint} />
            )}
          </Pressable>
        </View>
        
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {/* Сумма */}
          <View style={[styles.amountCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.amountLabel, { color: colors.text }]}>Сумма</Text>
            <View style={styles.amountRow}>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                placeholder="0"
                placeholderTextColor={colors.icon}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                autoFocus
                editable={!isLoading}
              />
              <Text style={[styles.currency, { color: colors.icon }]}>₽</Text>
            </View>
          </View>

          {/* Тип операции */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Тип операции</Text>
            <View style={styles.typeSelector}>
              <Pressable
                style={[
                  styles.typeOption,
                  !isIncome && [styles.typeOptionActive, { 
                    backgroundColor: colors.tint,
                    borderColor: colors.tint 
                  }]
                ]}
                onPress={() => handleTypeChange(false)}
                disabled={isLoading}
              >
                <Ionicons 
                  name="arrow-down" 
                  size={20} 
                  color={!isIncome ? '#fff' : colors.icon} 
                />
                <Text style={[
                  styles.typeOptionText,
                  !isIncome && styles.typeOptionTextActive
                ]}>
                  Расход
                </Text>
              </Pressable>
              
              <Pressable
                style={[
                  styles.typeOption,
                  isIncome && [styles.typeOptionActive, { 
                    backgroundColor: colors.tint,
                    borderColor: colors.tint 
                  }]
                ]}
                onPress={() => handleTypeChange(true)}
                disabled={isLoading}
              >
                <Ionicons 
                  name="arrow-up" 
                  size={20} 
                  color={isIncome ? '#fff' : colors.icon} 
                />
                <Text style={[
                  styles.typeOptionText,
                  isIncome && styles.typeOptionTextActive
                ]}>
                  Доход
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Категория */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {isIncome ? 'Название дохода' : 'Категория'}
            </Text>
            
            {!isIncome ? (
              // Категория для расходов - с выбором из списка
              <Pressable
                style={[styles.inputCard, { 
                  backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
                }]}
                onPress={() => setShowCategoryPicker(true)}
                disabled={isLoading}
              >
                <View style={styles.inputRow}>
                  <Ionicons name="pricetag" size={20} color={getCategoryColor()} />
                  <Text style={[styles.input, { color: category ? colors.text : colors.icon }]}>
                    {category || "Категория"}
                  </Text>
                  {category ? (
                    <Pressable 
                      onPress={handleClearCategory}
                      style={styles.clearButton}
                      hitSlop={8}
                      disabled={isLoading}
                    >
                      <Ionicons name="close-circle" size={20} color={colors.icon} />
                    </Pressable>
                  ) : (
                    <Ionicons name="chevron-down" size={20} color={colors.icon} />
                  )}
                </View>
              </Pressable>
            ) : (
              // Название для доходов - обычный инпут
              <View style={[styles.inputCard, { 
                backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
              }]}>
                <View style={styles.inputRow}>
                  <Ionicons name="pricetag" size={20} color={colors.icon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Название дохода"
                    placeholderTextColor={colors.icon}
                    value={category}
                    onChangeText={setCategory}
                    returnKeyType="next"
                    editable={!isLoading}
                  />
                  {category ? (
                    <Pressable 
                      onPress={handleClearCategory}
                      style={styles.clearButton}
                      hitSlop={8}
                      disabled={isLoading}
                    >
                      <Ionicons name="close-circle" size={20} color={colors.icon} />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            )}
          </View>

          {/* Описание */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Описание</Text>
            <View style={[styles.inputCard, { 
              backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
            }]}>
              <View style={styles.inputRow}>
                <Ionicons name="document-text" size={20} color={colors.icon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Описание"
                  placeholderTextColor={colors.icon}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  returnKeyType="done"
                  blurOnSubmit={true}
                  editable={!isLoading}
                />
                {description ? (
                  <Pressable 
                    onPress={handleClearDescription}
                    style={styles.clearButton}
                    hitSlop={8}
                    disabled={isLoading}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.icon} />
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>

          {/* Дата и время */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Дата и время</Text>
            <Pressable
              style={[styles.inputCard, { 
                backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
              }]}
              onPress={() => setShowDatePicker(true)}
              disabled={isLoading}
            >
              <View style={styles.inputRow}>
                <Ionicons name="calendar" size={20} color={colors.icon} />
                <View style={styles.dateContent}>
                  <Text style={[styles.dateText, { color: colors.text }]}>
                    {formatDate(selectedDate)}
                  </Text>
                  <Text style={[styles.timeText, { color: colors.icon }]}>
                    {formatTime(selectedDate)}
                  </Text>
                </View>
                {selectedDate.getTime() !== new Date(operation.created_at).getTime() ? (
                  <Pressable 
                    onPress={handleClearDate}
                    style={styles.clearButton}
                    hitSlop={8}
                    disabled={isLoading}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.icon} />
                  </Pressable>
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                )}
              </View>
            </Pressable>
          </View>

          {/* Быстрые суммы */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Быстрые суммы</Text>
            <View style={styles.quickAmountsGrid}>
              {[100, 500, 1000, 2000].map((quickAmount) => (
                <Pressable
                  key={quickAmount}
                  style={({ pressed }) => [
                    styles.quickAmountButton, 
                    { 
                      backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      transform: [{ scale: pressed ? 0.95 : 1 }]
                    }
                  ]}
                  onPress={() => setAmount(quickAmount.toString())}
                  disabled={isLoading}
                >
                  <Text style={[styles.quickAmountText, { color: colors.text }]}>
                    {quickAmount}₽
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Модалки */}
        <DateTimePickerModal
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        <CategoryPickerModal
          visible={showCategoryPicker}
          onClose={() => setShowCategoryPicker(false)}
          onCategorySelect={handleCategorySelect}
          selectedCategory={category}
          userCategories={categories}
        />
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
    height: 90,
    paddingTop: 40,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  iconButton: {
    padding: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingTop: 20,
  },
  amountCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  amountLabel: {
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.7,
    fontWeight: '500',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountInput: {
    fontSize: 52,
    fontWeight: '300',
    textAlign: 'center',
    minWidth: 120,
  },
  currency: {
    fontSize: 28,
    fontWeight: '300',
    marginLeft: 8,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(122, 122, 122, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  typeOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  typeOptionTextActive: {
    color: '#fff',
  },
  inputCard: {
    borderRadius: 16,
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    fontWeight: '500',
  },
  clearButton: {
    padding: 2,
  },
  dateContent: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 14,
    marginTop: 2,
    opacity: 0.7,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAmountButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 15,
    fontWeight: '600',
  },
});     