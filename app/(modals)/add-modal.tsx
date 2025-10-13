import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useState, useEffect } from 'react';
import DateTimePickerModal from '@/components/modals/DateTimePickerModal';
import CategoryPickerModal from '@/components/modals/CategoryPickerModal';

export default function AddModal() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isIncome, setIsIncome] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Очищаем категорию при смене типа операции
  useEffect(() => {
    setCategory('');
  }, [isIncome]);

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

  const handleTypeChange = (income: boolean) => {
    setIsIncome(income);
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen 
        options={{ 
          headerShown: true,
          header: () => (
            <View style={[styles.header, { 
              backgroundColor: colors.background,
              borderBottomColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }]}>
              <Pressable 
                onPress={() => router.back()}
                style={styles.iconButton}
              >
                <Ionicons name="close" size={22} color={colors.icon} />
              </Pressable>

              <Text style={[styles.title, { color: colors.text }]}>
                Новая операция
              </Text>

              <Pressable
                onPress={() => console.log('Сохранить')}
                style={styles.iconButton}
              >
                <Ionicons name="checkmark" size={22} color={colors.tint} />
              </Pressable>
            </View>
          )
        }} 
      />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {/* Главный блок с суммой */}
        <View style={[styles.mainCard, { 
          backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
        }]}>
          <Text style={[styles.amountLabel, { color: colors.text }]}>Сумма</Text>
          <View style={styles.amountInputContainer}>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.icon}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              autoFocus
              returnKeyType="next"
            />
            <Text style={[styles.currency, { color: colors.icon }]}>₽</Text>
          </View>
        </View>

        {/* Переключатель Доход/Расход */}
        <View style={styles.typeSection}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Тип операции</Text>
          <View style={styles.typeSelector}>
            <Pressable
              style={[
                styles.typeButton,
                !isIncome && [styles.typeButtonActive, { 
                  backgroundColor: colors.tint,
                  shadowColor: colors.tint 
                }]
              ]}
              onPress={() => handleTypeChange(false)}
            >
              <Ionicons 
                name="arrow-down" 
                size={20} 
                color={!isIncome ? '#fff' : colors.icon} 
              />
              <Text style={[
                styles.typeButtonText,
                !isIncome && styles.typeButtonTextActive
              ]}>
                Расход
              </Text>
            </Pressable>
            
            <Pressable
              style={[
                styles.typeButton,
                isIncome && [styles.typeButtonActive, { 
                  backgroundColor: colors.tint,
                  shadowColor: colors.tint 
                }]
              ]}
              onPress={() => handleTypeChange(true)}
            >
              <Ionicons 
                name="arrow-up" 
                size={20} 
                color={isIncome ? '#fff' : colors.icon} 
              />
              <Text style={[
                styles.typeButtonText,
                isIncome && styles.typeButtonTextActive
              ]}>
                Доход
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Поля формы */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Детали</Text>
          
          {/* Поле категории/названия */}
          {!isIncome ? (
            // Категория для расходов - с выбором из списка
            <Pressable
              style={[styles.inputCard, { 
                backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
              }]}
              onPress={() => setShowCategoryPicker(true)}
            >
              <View style={styles.inputRow}>
                <Ionicons name="pricetag" size={20} color={colors.icon} />
                <Text style={[styles.input, { color: category ? colors.text : colors.icon }]}>
                  {category || "Категория"}
                </Text>
                {category ? (
                  <Pressable 
                    onPress={handleClearCategory}
                    style={styles.clearButton}
                    hitSlop={8}
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
                />
                {category ? (
                  <Pressable 
                    onPress={handleClearCategory}
                    style={styles.clearButton}
                    hitSlop={8}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.icon} />
                  </Pressable>
                ) : null}
              </View>
            </View>
          )}

          {/* Описание */}
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
              />
              {description ? (
                <Pressable 
                  onPress={() => setDescription('')}
                  style={styles.clearButton}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={20} color={colors.icon} />
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* Дата и время */}
          <Pressable
            style={[styles.inputCard, { 
              backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
            }]}
            onPress={() => setShowDatePicker(true)}
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
              <Ionicons name="chevron-forward" size={20} color={colors.icon} />
            </View>
          </Pressable>
        </View>

        {/* Быстрые суммы */}
        <View style={styles.quickAmounts}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Быстрые суммы
          </Text>
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
              >
                <Text style={[styles.quickAmountText, { color: colors.text }]}>
                  {quickAmount}₽
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Пустое пространство для скролла */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Модалка выбора даты и времени */}
      <DateTimePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Модалка выбора категории */}
      <CategoryPickerModal
        visible={showCategoryPicker}
        onClose={() => setShowCategoryPicker(false)}
        onCategorySelect={handleCategorySelect}
        selectedCategory={category}
      />
    </KeyboardAvoidingView>
  );
}

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
    paddingVertical: 20,
  },
  mainCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.7,
    fontWeight: '500',
  },
  amountInputContainer: {
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
  typeSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(122, 122, 122, 0.1)',
    borderRadius: 16,
    padding: 6,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  typeButtonActive: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  formSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  inputCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
  quickAmounts: {
    marginHorizontal: 20,
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
  bottomSpacer: {
    height: 300, // Достаточно места для скролла
  },
});