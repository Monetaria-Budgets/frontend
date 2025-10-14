// app/(auth)/pin-code.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Pressable } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { usePinCodeWithAuth } from '@/hooks/usePinCodeWithAuth';

// Импортируем компоненты
import PinCodeHeader from '@/components/pin-code/PinCodeHeader';
import PinCodeDots from '@/components/pin-code/PinCodeDots';
import PinCodeKeypad from '@/components/pin-code/PinCodeKeypad';

type PinCodeStep = 'enter_old' | 'enter_new' | 'confirm_new' | 'enter_unlock' | 'confirm_disable';

const PinCodeScreen = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<PinCodeStep>('enter_unlock');
  const [newPin, setNewPin] = useState('');
  const [oldPin, setOldPin] = useState('');
  
  const { user } = useAuth();
  const { unlockApp, setPinCode, isPinCodeSet, resetPinCode } = usePinCodeWithAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();

  const isSetup = params.setup === 'true';
  const isChange = params.change === 'true';
  const isDisable = params.disable === 'true';

  useEffect(() => {
    if (isSetup && !isPinCodeSet) {
      setStep('enter_new');
    } else if (isChange && isPinCodeSet) {
      setStep('enter_old');
    } else if (isDisable && isPinCodeSet) {
      setStep('confirm_disable');
    } else {
      setStep('enter_unlock');
    }
  }, [isSetup, isChange, isDisable, isPinCodeSet]);

  useEffect(() => {
    if (pin.length === 4) {
      handlePinComplete(pin);
    }
  }, [pin]);

  const handleNumberPress = (number: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + number);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const getStepConfig = () => {
    const configs = {
      enter_old: {
        title: 'Введите старый PIN-код',
        subtitle: 'Для смены PIN-кода',
        icon: 'lock-closed'
      },
      enter_new: {
        title: 'Введите новый PIN-код',
        subtitle: 'Придумайте новый PIN-код',
        icon: 'lock-closed'
      },
      confirm_new: {
        title: 'Повторите новый PIN-код',
        subtitle: 'Подтвердите новый PIN-код',
        icon: 'lock-closed'
      },
      confirm_disable: {
        title: 'Подтвердите отключение',
        subtitle: 'Введите текущий PIN-код для отключения',
        icon: 'lock-open'
      },
      enter_unlock: {
        title: isSetup ? 'Установите PIN-код' : 'Введите PIN-код',
        subtitle: isSetup 
          ? 'Для защиты ваших данных' 
          : `Для входа в приложение\n${user?.email || ''}`,
        icon: isSetup ? 'lock-closed' : 'lock-closed'
      }
    };

    return configs[step] || configs.enter_unlock;
  };

  const handleSuccessfulUnlock = () => {
    console.log('Successful unlock, navigating to tabs');
    // Явно навигируем на tabs после успешной разблокировки
    router.replace('/(tabs)');
  };

  const handlePinComplete = async (enteredPin: string) => {
    try {
      switch (step) {
        case 'enter_unlock':
          if (isSetup) {
            setNewPin(enteredPin);
            setStep('confirm_new');
            setPin('');
          } else {
            const isValid = await unlockApp(enteredPin);
            if (isValid) {
              // Успешная разблокировка - навигируем на главный экран
              handleSuccessfulUnlock();
            } else {
              setError('Неверный PIN-код');
              setPin('');
            }
          }
          break;

        case 'enter_old':
          const isValidOld = await unlockApp(enteredPin);
          if (isValidOld) {
            setOldPin(enteredPin);
            setStep('enter_new');
            setPin('');
          } else {
            setError('Неверный старый PIN-код');
            setPin('');
          }
          break;

        case 'enter_new':
          setNewPin(enteredPin);
          setStep('confirm_new');
          setPin('');
          break;

        case 'confirm_new':
          if (enteredPin === newPin) {
            if (isChange) {
              await setPinCode(enteredPin, oldPin);
            } else {
              await setPinCode(enteredPin);
            }
            
            Alert.alert('Успех', isChange ? 'PIN-код изменен' : 'PIN-код установлен', [
              { 
                text: 'OK', 
                onPress: () => {
                  // После установки/смены пин-кода возвращаемся назад
                  router.back();
                }
              }
            ]);
          } else {
            setError('PIN-коды не совпадают');
            setPin('');
            setNewPin('');
            setStep(isChange ? 'enter_new' : 'enter_new');
          }
          break;

        case 'confirm_disable':
          const isValid = await unlockApp(enteredPin);
          if (isValid) {
            await resetPinCode();
            Alert.alert('Успех', 'PIN-код отключен', [
              { 
                text: 'OK', 
                onPress: () => {
                  // После отключения возвращаемся назад
                  router.back();
                }
              }
            ]);
          } else {
            setError('Неверный PIN-код');
            setPin('');
          }
          break;
      }
    } catch (error: any) {
      setError(error.message || 'Ошибка при обработке PIN-кода');
      setPin('');
      setNewPin('');
      if (isChange && isPinCodeSet) setStep('enter_old');
      else if (isDisable && isPinCodeSet) setStep('confirm_disable');
      else setStep('enter_new');
    }
  };

  const stepConfig = getStepConfig();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PinCodeHeader
        title={stepConfig.title}
        subtitle={stepConfig.subtitle}
        icon={stepConfig.icon}
      />

      <PinCodeDots pinLength={pin.length} maxLength={4} />

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      <PinCodeKeypad
        onNumberPress={handleNumberPress}
        onBackspace={handleBackspace}
        onClear={handleClear}
      />

      {(step === 'enter_unlock' && !isSetup && !isDisable) && (
        <Pressable
          style={styles.forgotPinButton}
          onPress={() => {
            Alert.alert('Восстановление', 'Обратитесь в поддержку для сброса PIN-кода');
          }}
        >
          <Text style={[styles.forgotPinText, { color: colors.tint }]}>
            Забыли PIN-код?
          </Text>
        </Pressable>
      )}

      {(isSetup || isChange || isDisable) && (
        <Pressable
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.cancelText, { color: colors.icon }]}>
            Отмена
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  forgotPinButton: {
    marginTop: 30,
    alignItems: 'center',
    padding: 12,
  },
  forgotPinText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 20,
    alignItems: 'center',
    padding: 12,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PinCodeScreen;