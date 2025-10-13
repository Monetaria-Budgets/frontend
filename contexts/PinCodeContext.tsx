// contexts/PinCodeContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PinCodeContextType = {
  isPinCodeRequired: boolean;
  isPinCodeSet: boolean;
  isUnlocked: boolean;
  setPinCode: (pin: string, userId: number, oldPin?: string) => Promise<void>;
  verifyPinCode: (pin: string, userId: number) => Promise<boolean>;
  resetPinCode: (userId: number) => Promise<void>;
  unlockApp: (pin: string, userId: number) => Promise<boolean>;
  lockApp: (userId: number) => Promise<void>;
  checkPinCodeStatus: (userId: number) => Promise<void>;
};

const PinCodeContext = createContext<PinCodeContextType | undefined>(undefined);

const UNLOCK_TIMEOUT = 5 * 60 * 1000; // 5 минут

export const PinCodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPinCodeRequired, setIsPinCodeRequired] = useState(false);
  const [isPinCodeSet, setIsPinCodeSet] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);

  // Генерируем ключ для хранения пин-кода на основе ID пользователя
  const getPinCodeKey = (userId: number) => `@app_pin_code_${userId}`;
  const getPinRequiredKey = (userId: number) => `@pin_code_required_${userId}`;
  const getLastUnlockKey = (userId: number) => `@last_unlock_time_${userId}`;

  const checkPinCodeStatus = async (userId: number): Promise<void> => {
    try {
      const pinCodeKey = getPinCodeKey(userId);
      const pinRequiredKey = getPinRequiredKey(userId);
      const lastUnlockKey = getLastUnlockKey(userId);
      
      const pinCode = await AsyncStorage.getItem(pinCodeKey);
      const pinRequired = await AsyncStorage.getItem(pinRequiredKey);
      const lastUnlockTime = await AsyncStorage.getItem(lastUnlockKey);
      
      const hasPin = !!pinCode;
      const requiresPin = hasPin && pinRequired === 'true';
      
      setIsPinCodeSet(hasPin);
      setIsPinCodeRequired(requiresPin);
      
      if (!hasPin) {
        setIsUnlocked(true);
        console.log('PIN not set, app unlocked');
        return;
      }

      if (lastUnlockTime) {
        const unlockTime = parseInt(lastUnlockTime);
        const now = Date.now();
        // Разблокировано если прошло меньше UNLOCK_TIMEOUT
        const recentlyUnlocked = (now - unlockTime) < UNLOCK_TIMEOUT;
        setIsUnlocked(recentlyUnlocked);
        console.log('PIN status:', { 
          recentlyUnlocked, 
          timePassed: (now - unlockTime) / 1000,
          timeout: UNLOCK_TIMEOUT / 1000 
        });
      } else {
        // Если пин установлен, но нет времени разблокировки - блокируем
        setIsUnlocked(false);
        console.log('PIN set but not unlocked');
      }
      
    } catch (error) {
      console.error("Error checking pin code status:", error);
    }
  };

  const setPinCode = async (pin: string, userId: number, oldPin?: string): Promise<void> => {
    try {
      const pinCodeKey = getPinCodeKey(userId);
      const pinRequiredKey = getPinRequiredKey(userId);
      const lastUnlockKey = getLastUnlockKey(userId);

      // Если пин-код уже установлен, проверяем старый пин-код
      if (isPinCodeSet && oldPin) {
        const isValidOldPin = await verifyPinCode(oldPin, userId);
        if (!isValidOldPin) {
          throw new Error("Неверный старый PIN-код");
        }
      }

      // Сохраняем новый пин-код
      await AsyncStorage.setItem(pinCodeKey, pin);
      await AsyncStorage.setItem(pinRequiredKey, "true");
      await AsyncStorage.setItem(lastUnlockKey, Date.now().toString());
      
      setIsPinCodeSet(true);
      setIsPinCodeRequired(true);
      setIsUnlocked(true);
      
      console.log('PIN code set successfully');
    } catch (error: any) {
      throw new Error(error.message || "Failed to set PIN code");
    }
  };

  const verifyPinCode = async (pin: string, userId: number): Promise<boolean> => {
    try {
      const pinCodeKey = getPinCodeKey(userId);
      const storedPin = await AsyncStorage.getItem(pinCodeKey);
      return storedPin === pin;
    } catch (error) {
      return false;
    }
  };

  const resetPinCode = async (userId: number): Promise<void> => {
    try {
      const pinCodeKey = getPinCodeKey(userId);
      const pinRequiredKey = getPinRequiredKey(userId);
      const lastUnlockKey = getLastUnlockKey(userId);

      await AsyncStorage.multiRemove([pinCodeKey, pinRequiredKey, lastUnlockKey]);
      
      setIsPinCodeSet(false);
      setIsPinCodeRequired(false);
      setIsUnlocked(true);
      
      console.log('PIN code reset successfully');
    } catch (error) {
      throw new Error("Failed to reset PIN code");
    }
  };

  const unlockApp = async (pin: string, userId: number): Promise<boolean> => {
    const isValid = await verifyPinCode(pin, userId);
    if (isValid) {
      const lastUnlockKey = getLastUnlockKey(userId);
      await AsyncStorage.setItem(lastUnlockKey, Date.now().toString());
      setIsUnlocked(true);
      console.log('App unlocked successfully');
    } else {
      console.log('PIN verification failed');
    }
    return isValid;
  };

  const lockApp = async (userId: number): Promise<void> => {
    const lastUnlockKey = getLastUnlockKey(userId);
    await AsyncStorage.removeItem(lastUnlockKey);
    setIsUnlocked(false);
    console.log('App locked');
  };

  return (
    <PinCodeContext.Provider value={{
      isPinCodeRequired,
      isPinCodeSet,
      isUnlocked,
      setPinCode,
      verifyPinCode,
      resetPinCode,
      unlockApp,
      lockApp,
      checkPinCodeStatus,
    }}>
      {children}
    </PinCodeContext.Provider>
  );
};

export const usePinCode = () => {
  const context = useContext(PinCodeContext);
  if (!context) {
    throw new Error("usePinCode must be used within PinCodeProvider");
  }
  return context;
};