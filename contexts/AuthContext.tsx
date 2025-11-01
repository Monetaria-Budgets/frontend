import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "@/config";
import { premiumService } from "@/services/premiumService";
import { Alert } from "react-native";

type User = {
  id: number;
  login: string;
  name: string;
  email: string;
  role: string;
  premium: boolean;
  color_scheme?: string;
  currency?: {
    id: number;
    code: string;
    name: string;
  };
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (login: string, password: string) => Promise<void>;
  register: (login: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  registerLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [registerLoading, setRegisterLoading] = useState(false);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const token = await AsyncStorage.getItem("@token");
        const user = await AsyncStorage.getItem("@user");
        if (token && user) {
          setToken(token);
          setUser(JSON.parse(user));
        }
      } catch (e) {
        console.error("Ошибка загрузки токена:", e);
      } finally {
        setLoading(false);
      }
    };
    loadStorageData();
  }, []);

  const login = async (loginInput: string, password: string) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/login`, {
        login: loginInput,
        password,
      });

      const { token, user } = res.data;

      // СОХРАНЯЕМ токен и пользователя ПЕРВЫМИ
      await AsyncStorage.setItem("@token", token);
      await AsyncStorage.setItem("@user", JSON.stringify(user));

      // УСТАНАВЛИВАЕМ в состояние
      setToken(token);
      setUser(user);

      // ЖДЕМ немного и только ПОТОМ проверяем премиум статус
      setTimeout(async () => {
        try {
          const premiumStatus = await premiumService.checkPremiumStatus();
          
          // Обновляем пользователя с актуальным премиум статусом
          const updatedUser = {
            ...user,
            premium: premiumStatus.hasActivePremium // ← используем hasActivePremium из premiumStatus
          };

          await AsyncStorage.setItem("@user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        } catch (premiumError) {
          console.warn("Не удалось проверить премиум статус:", premiumError);
          // Игнорируем ошибку проверки премиума, основной логин успешен
        }
      }, 100);

    } catch (err: any) {
      throw new Error(err.response?.data?.error || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  const register = async (login: string, email: string, password: string) => {
    setRegisterLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        login, 
        email, 
        password,
      });
      
      // Возвращаем данные для возможного использования
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || "Ошибка регистрации");
    } finally {
      setRegisterLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await axios.post(
          `${API_URL}/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      console.warn("Ошибка при logout (игнорируем локально):", err);
    } finally {
      await AsyncStorage.removeItem("@token");
      await AsyncStorage.removeItem("@user");
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      loading,
      registerLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth должен использоваться внутри AuthProvider");
  return ctx;
};