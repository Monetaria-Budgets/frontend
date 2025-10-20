// app/(tabs)/history/components/ActionMenu.tsx
import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Operation, operationService } from '@/services/operationService';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ActionMenuProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  operation: Operation;
  onOperationUpdated: () => void;
}

export const ActionMenu = ({ 
  visible, 
  onClose, 
  onEdit, 
  operation,
  onOperationUpdated 
}: ActionMenuProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleDelete = async () => {
    try {
      await operationService.deleteOperation(operation.id);
      onOperationUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error deleting operation:', error);
      Alert.alert('Ошибка', error.message || 'Ошибка при удалении операции');
    }
  };

  const confirmDelete = () => {
    onClose();
    // Показываем подтверждение удаления
    setTimeout(() => {
      Alert.alert(
        'Удалить операцию?',
        `Вы уверены, что хотите удалить операцию "${operation.category}"?`,
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Удалить', style: 'destructive', onPress: handleDelete }
        ]
      );
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
          <Pressable 
            style={styles.menuItem}
            onPress={() => {
              onClose();
              onEdit();
            }}
          >
            <Ionicons name="pencil" size={20} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>Редактировать</Text>
          </Pressable>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <Pressable 
            style={[styles.menuItem, styles.deleteItem]}
            onPress={confirmDelete}
          >
            <Ionicons name="trash" size={20} color="#FF3B30" />
            <Text style={[styles.menuText, styles.deleteText]}>Удалить</Text>
          </Pressable>
        </View>
      </Pressable>
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
  menuContainer: {
    width: 200,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  deleteItem: {
    // Стили для удаления
  },
  deleteText: {
    color: '#FF3B30',
  },
});