import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Alert,
  ActivityIndicator
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export default function LoginScreen() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!loginInput.trim() || !password.trim()) {
      Alert.alert("Ошибка", "Заполните все поля");
      return;
    }

    try {
      console.log('🚀 LoginScreen: Starting login process...');
      setIsLoggingIn(true);
      
      await login(loginInput, password);
      
      console.log('✅ LoginScreen: Auth successful, navigating to tabs...');
      
      // Навигация после успешного логина
      router.replace("/(tabs)");
      
    } catch (err: any) {
      console.error('💥 LoginScreen: Login error:', err);
      Alert.alert("Ошибка входа", err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const isLoading = loading || isLoggingIn;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Image source={require("@/assets/logo.png")} style={styles.logo} />

          <TextInput
            placeholder="Ваш логин"
            placeholderTextColor={colors.placeholder}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={loginInput}
            onChangeText={setLoginInput}
            editable={!isLoading}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Ваш пароль"
            placeholderTextColor={colors.placeholder}
            secureTextEntry
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
            autoCapitalize="none"
          />

          <TouchableOpacity 
            onPress={handleLogin} 
            style={styles.buttonContainer}
            disabled={isLoading}    
          >
            <LinearGradient colors={["#007bff", "#0056d2"]} style={styles.button}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Войти</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => Alert.alert("Функция восстановления пароля")}
            disabled={isLoading}
          >
            <Text style={[styles.footerLink, { color: colors.tint }]}>
              Забыли пароль?
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity 
              onPress={() => router.replace("/(auth)/register")}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.footerLink,
                  styles.footerLinkActive,
                  { color: colors.tint },
                ]}
              >
                Нет аккаунта? Зарегистрироваться
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 30,
    resizeMode: "contain",
  },
  input: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    fontSize: 16,
  },
  buttonContainer: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 15,
  },
  button: {
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 54,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPasswordContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  footerLink: {
    fontSize: 14,
  },
  footerLinkActive: {
    fontWeight: "500",
    textAlign: "center",
  },
});