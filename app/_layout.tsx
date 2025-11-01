// app/_layout.tsx (или где у тебя RootLayoutNav)
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AuthProvider } from '@/contexts/AuthContext';
import { PinCodeProvider } from '@/contexts/PinCodeContext';
import PinCodeGuard from '@/components/PinCodeGuard';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { CategoriesProvider } from '@/contexts/CategoriesContext';

export default function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <AuthProvider>
              <PinCodeProvider>
                <PinCodeGuard>
                  <CategoriesProvider>
                    <CurrencyProvider>
                      <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen 
                          name="(modals)" 
                          options={{ presentation: 'modal', headerShown: false }}
                        />
                      </Stack>
                      <StatusBar style="auto" />
                    </CurrencyProvider>
                  </CategoriesProvider>
                </PinCodeGuard>
              </PinCodeProvider>
            </AuthProvider>
          </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}