// hooks/usePinCodeWithAuth.ts
import { useAuth } from '@/contexts/AuthContext';
import { usePinCode } from '@/contexts/PinCodeContext';
import { useEffect } from 'react';

export const usePinCodeWithAuth = () => {
  const { user } = useAuth();
  const pinCode = usePinCode();

  useEffect(() => {
    if (user) {
      console.log('Checking PIN status for user:', user.id);
      pinCode.checkPinCodeStatus(user.id);
    } else {
      // Если пользователь разлогинен, сбрасываем состояние
      console.log('User logged out, resetting PIN state');
    }
  }, [user]);

  // Обертки функций с автоматической передачей userId
  const setPinCode = async (pin: string, oldPin?: string) => {
    if (!user) throw new Error("User not authenticated");
    return pinCode.setPinCode(pin, user.id, oldPin);
  };

  const verifyPinCode = async (pin: string) => {
    if (!user) return false;
    return pinCode.verifyPinCode(pin, user.id);
  };

  const resetPinCode = async (currentPin?: string) => {
    if (!user) throw new Error("User not authenticated");
    
    // Если передан текущий пин-код, проверяем его
    if (currentPin) {
      const isValid = await verifyPinCode(currentPin);
      if (!isValid) {
        throw new Error("Неверный текущий PIN-код");
      }
    }
    
    return pinCode.resetPinCode(user.id);
  };

  const unlockApp = async (pin: string) => {
    if (!user) return false;
    return pinCode.unlockApp(pin, user.id);
  };

  const lockApp = async () => {
    if (!user) return;
    return pinCode.lockApp(user.id);
  };

  const checkPinCodeStatus = async () => {
    if (!user) return;
    return pinCode.checkPinCodeStatus(user.id);
  };

  return {
    ...pinCode,
    setPinCode,
    verifyPinCode,
    resetPinCode,
    unlockApp,
    lockApp,
    checkPinCodeStatus,
  };
};