import { Platform, StyleSheet, Button, Pressable, useColorScheme } from 'react-native';

import { ThemedGradientView } from '@/components/themed-gradient-view';
import { InCreatingTable } from '@/components/in-creating-table';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';




export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedGradientView style={styles.container}>
      <Stack.Screen
          options={{ 
            headerShown: true,
            headerTitle: "Профиль",
        }} 
      />
        <InCreatingTable>
          Главная страница
        </InCreatingTable>


    </ThemedGradientView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
})