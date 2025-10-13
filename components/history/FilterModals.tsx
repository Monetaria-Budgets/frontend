// app/(tabs)/history/components/FilterModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, Pressable, FlatList, StyleSheet, Animated } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  title: string;
  items: Array<{ key: string; label: string }>;
  selectedKey: string;
}

export const FilterModal = ({ 
  visible, 
  onClose, 
  onSelect, 
  title, 
  items, 
  selectedKey 
}: FilterModalProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [tempSelectedKey, setTempSelectedKey] = useState(selectedKey);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Анимация появления
  React.useEffect(() => {
    if (visible) {
      setTempSelectedKey(selectedKey);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, selectedKey]);

  const handleSelect = (key: string) => {
    setTempSelectedKey(key);
  };

  const handleConfirm = () => {
    onSelect(tempSelectedKey);
    // Запускаем анимацию исчезновения перед закрытием
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleCancel = () => {
    setTempSelectedKey(selectedKey);
    // Запускаем анимацию исчезновения перед закрытием
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleOverlayPress = () => {
    handleCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <Pressable style={styles.overlayPressable} onPress={handleOverlayPress}>
          <Animated.View 
            style={[
              styles.modalContent, 
              { 
                backgroundColor: colors.background,
                opacity: fadeAnim,
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  })
                }]
              }
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            
            <FlatList
              data={items}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.modalItem,
                    { backgroundColor: pressed ? 'rgba(0,0,0,0.05)' : 'transparent' },
                    tempSelectedKey === item.key && { backgroundColor: 'rgba(0,122,255,0.1)' }
                  ]}
                  onPress={() => handleSelect(item.key)}
                >
                  <Text style={[
                    styles.modalItemText,
                    { color: colors.text },
                    tempSelectedKey === item.key && { color: colors.tint, fontWeight: '600' }
                  ]}>
                    {item.label}
                  </Text>
                  {tempSelectedKey === item.key && (
                    <Ionicons name="checkmark" size={20} color={colors.tint} />
                  )}
                </Pressable>
              )}
            />
            
            <View style={styles.buttonsContainer}>
              <Pressable
                style={[styles.button, styles.cancelButton, { borderColor: colors.tint }]}
                onPress={handleCancel}
              >
                <Text style={[styles.buttonText, { color: colors.tint }]}>Отмена</Text>
              </Pressable>
              
              <Pressable
                style={[styles.button, styles.selectButton, { backgroundColor: colors.tint }]}
                onPress={handleConfirm}
              >
                <Text style={[styles.buttonText, styles.selectButtonText]}>Выбрать</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayPressable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalItemText: {
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  selectButton: {
    // backgroundColor задается инлайн
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectButtonText: {
    color: 'white',
  },
});