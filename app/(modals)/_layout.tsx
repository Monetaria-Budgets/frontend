import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true, // ← Включаем header для всех модалов
        presentation: 'modal',
      }}
    >
      <Stack.Screen 
        name="add" 
        options={{ 
          title: 'Добавить операцию',
          headerBackTitle: 'Назад', 
        }} 
      />
      <Stack.Screen 
        name="notification-detail"
        options={{
          title: 'Уведомление',
          headerBackTitle: 'Назад',
        }}
      />
    </Stack>
  );
  
}