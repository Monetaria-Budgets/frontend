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
  authInitialized: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        console.log('🔄 AuthProvider: Loading storage data...');
        const token = await AsyncStorage.getItem("@token");
        const user = await AsyncStorage.getItem("@user");
        
        console.log('📦 AuthProvider: Storage data loaded', { 
          token: !!token, 
          user: !!user 
        });
        
        if (token && user) {
          setToken(token);
          setUser(JSON.parse(user));
        }
      } catch (e) {
        console.error("❌ AuthProvider: Error loading token:", e);
      } finally {
        setLoading(false);
        setAuthInitialized(true);
        console.log('✅ AuthProvider: Auth initialization completed');
      }
    };
    loadStorageData();
  }, []);

  const login = async (loginInput: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Login process started');
      setLoading(true);

      console.log('📤 AuthContext: Sending login request...');
      const res = await axios.post(`${API_URL}/auth/login`, {
        login: loginInput,
        password,
      });

      console.log('✅ AuthContext: Login response received:', res.status);
      const { token, user } = res.data;

      console.log('💾 AuthContext: Saving token and user to storage...');
      await AsyncStorage.setItem("@token", token);
      await AsyncStorage.setItem("@user", JSON.stringify(user));

      console.log('🔄 AuthContext: Setting auth state...');
      setToken(token);
      setUser(user);

      console.log('👤 AuthContext: User after login:', user?.name);
      console.log('🔑 AuthContext: Token exists after login:', !!token);

      // ЖДЕМ проверку премиум статуса перед завершением
      console.log('👑 AuthContext: Checking premium status...');
      try {
        const premiumStatus = await premiumService.checkPremiumStatus();
        console.log('👑 AuthContext: Premium status:', premiumStatus);
        
        // Обновляем пользователя с актуальным премиум статусом
        const updatedUser = {
          ...user,
          premium: premiumStatus.hasActivePremium
        };

        console.log('💾 AuthContext: Updating user with premium status...');
        await AsyncStorage.setItem("@user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        console.log('✅ AuthContext: Premium status updated');
      } catch (premiumError) {
        console.warn("⚠️ AuthContext: Premium check failed:", premiumError);
        // Игнорируем ошибку проверки премиума, основной логин успешен
      }

      console.log('🎉 AuthContext: Login process completed successfully');
      
      // Даем время React обновить состояние
      await new Promise(resolve => setTimeout(resolve, 50));

    } catch (err: any) {
      console.error('💥 AuthContext: Login error:', err);
      console.error('💥 AuthContext: Error response:', err.response?.data);
      throw new Error(err.response?.data?.error || "Ошибка входа");
    } finally {
      console.log('🏁 AuthContext: Setting loading to false');
      setLoading(false);
    }
  };

  const register = async (login: string, email: string, password: string) => {
    setRegisterLoading(true);
    try {
      console.log('📝 AuthContext: Registration process started');
      const res = await axios.post(`${API_URL}/auth/register`, {
        login, 
        email, 
        password,
      });
      
      console.log('✅ AuthContext: Registration successful');
      return res.data;
    } catch (err: any) {
      console.error('💥 AuthContext: Registration error:', err);
      throw new Error(err.response?.data?.error || "Ошибка регистрации");
    } finally {
      setRegisterLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 AuthContext: Logout process started');
      if (token) {
        await axios.post(
          `${API_URL}/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      console.warn("⚠️ AuthContext: Logout API error (ignoring locally):", err);
    } finally {
      console.log('🗑️ AuthContext: Clearing storage and state...');
      await AsyncStorage.removeItem("@token");
      await AsyncStorage.removeItem("@user");
      setUser(null);
      setToken(null);
      console.log('✅ AuthContext: Logout completed');
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
      registerLoading,
      authInitialized 
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