// app/(screens)/_layout.tsx
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ScreensLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        header: ({ route, options }) => (
          <View style={[styles.header, { backgroundColor: colors.tint }]}>
            {/* Кнопка назад слева */}
            <Pressable
              onPress={() => router.back()}
              style={styles.headerButton}
              hitSlop={10}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color="white"
              />
            </Pressable>

            {/* Заголовок по центру */}
            <Text style={styles.headerTitle}>
              {options.title || route.name}
            </Text>

            {/* Заглушка справа для выравнивания */}
            <View style={styles.headerButton} />
          </View>
        ),
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="profile"
        options={{
          title: 'Профиль',
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: 'Уведомления',
        }}
      />
      <Stack.Screen
        name="premium"
        options={{
          title: 'Premium',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    color: 'white',
  },
});