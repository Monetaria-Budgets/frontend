// components/PinCodeGuard.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePinCodeWithAuth } from '@/hooks/usePinCodeWithAuth';
import { useRouter, usePathname } from 'expo-router';
import PinCodeScreen from '@/app/(auth)/pin-code';
import { Text, View } from 'react-native';

const PinCodeGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { isPinCodeSet, isUnlocked, checkPinCodeStatus } = usePinCodeWithAuth();
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkPinCodeRequirement();
  }, [user, authLoading, isPinCodeSet, isUnlocked, pathname]);

  const checkPinCodeRequirement = async () => {
    console.log('PinCodeGuard check:', { 
      user: !!user, 
      authLoading, 
      isPinCodeSet, 
      isUnlocked,
      pathname 
    });

    // Ждем загрузки аутентификации
    if (authLoading) {
      console.log('Auth still loading...');
      return;
    }

    // Если пользователь не авторизован - НЕ показываем пин-код
    if (!user) {
      console.log('User not authenticated, skipping PIN check');
      setIsChecking(false);
      return;
    }

    // Перепроверяем статус пин-кода для этого пользователя
    await checkPinCodeStatus();

    // Если пин-код НЕ установлен - пропускаем проверку
    if (!isPinCodeSet) {
      console.log('PIN not set, allowing access');
      setIsChecking(false);
      return;
    }

    // Если уже на экране пин-кода - остаемся на нем
    if (pathname === '/(auth)/pin-code') {
      console.log('Already on PIN screen');
      setIsChecking(false);
      return;
    }

    // Если приложение разблокировано - пропускаем
    if (isUnlocked) {
      console.log('App is unlocked, allowing access');
      setIsChecking(false);
      return;
    }

    // Если дошли сюда - показываем пин-код
    console.log('Showing PIN screen - app is locked');
    setIsChecking(false);
  };

  // Если проверка еще идет
  if (authLoading || isChecking) {
    console.log('Showing splash screen');
    return <SplashScreen />;
  }

  // Показываем пин-код только если:
  // - пользователь авторизован
  // - пин-код установлен  
  // - приложение не разблокировано
  // - не находимся уже на экране пин-кода
  const shouldShowPin = user && isPinCodeSet && !isUnlocked && pathname !== '/(auth)/pin-code';
  
  if (shouldShowPin) {
    console.log('Rendering PIN screen');
    return <PinCodeScreen />;
  }

  console.log('Rendering children');
  return <>{children}</>;
};

const SplashScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Загрузка...</Text>
  </View>
);

export default PinCodeGuard;