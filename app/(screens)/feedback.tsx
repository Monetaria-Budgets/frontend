// app/premium.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native';

export default function PremiumScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: "Feedback",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} style={{ marginLeft: 16 }} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.content}>
        <View style={[styles.placeholder, { backgroundColor: colors.card }]}>
          <Ionicons name="diamond" size={64} color={colors.tint} />
          <Text style={[styles.placeholderTitle, { color: colors.text }]}>
            Обратная свящь
          </Text>
          <Text style={[styles.placeholderText, { color: colors.icon }]}>
            Раздел в разработке
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  placeholder: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    gap: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});