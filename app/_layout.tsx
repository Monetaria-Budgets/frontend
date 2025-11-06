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
import { NotificationProvider } from '@/contexts/NotificationContext';
import { LogBox } from 'react-native';
import { RealtimeNotificationsProvider } from '@/components/providers/RealtimeNotificationsProvider';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

export default function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <AuthProvider>
              <NotificationProvider>
                <RealtimeNotificationsProvider>
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
                </RealtimeNotificationsProvider>
              </NotificationProvider>
            </AuthProvider>
          </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.error('💥 GLOBAL ERROR:', error);
  console.error('💥 Is Fatal:', isFatal);
  console.error('💥 Stack:', error.stack);
});