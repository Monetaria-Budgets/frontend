import React, { createContext, useContext, useEffect, useState } from "react";;
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

type User = {
    id: number;
    login: string;
    email: string;
    role: string;
    premium: boolean;
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    login: (login: string, password: string) => Promise<void>;
    register: (login: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStorageData = async () => {
            try {
                const token = await AsyncStorage.getItem("@token");
                const user = await AsyncStorage.getItem("@user");
                if (token && user) {
                    setToken(token);
                    setUser(JSON.parse(user));
                }
            }   catch (e) {
                console.error("Ошибка загрузки токена:", e);
            }   finally {
                setLoading(false);
            }
        };
        loadStorageData();
    }, []);

    const login = async (login: string, password: string) => {
        try {
            const res = await axios.post("http://192.168.1.181:3000/auth/login", {
                login,
                password,
            });

            const { token, user } = res.data;

            await AsyncStorage.setItem("@token", token);
            await AsyncStorage.setItem("@user", JSON.stringify(user));

            setToken(token);
            setUser(user);
        }   catch (err: any) {
            throw new Error(err.response?.data?.error || "Ошибка входа");
        }
    };

    const register = async (login: string, email: string, password: string) => {
        try {
            await axios.post("http://192.168.1.181:3000/auth/register", {
                login, 
                email, 
                password,
            });
        }   catch (err: any) {
            throw new Error(err.response?.data?.error || "Ошибка регистрации");
        }
    };

    const logout = async () => {
        try {
            await axios.post(
                "http://192.168.1.181:3000/auth/logout",
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
        }   catch (err) {
            console.warn("Ошибка при logout (игнорируем локально):", err);
        }   finally {
            await AsyncStorage.removeItem("@token");
            await AsyncStorage.removeItem("@user");
            setUser(null);
            setToken(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth должен использоваться внутри AuthProvider");
    return ctx;
}