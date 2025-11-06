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

export default function RegisterScreen() {
  const { register, registerLoading } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    if (!login.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Ошибка", "Пожалуйста, заполните все поля");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Ошибка", "Пароль должен содержать минимум 6 символов");
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert("Ошибка", "Пожалуйста, введите корректный email");
      return;
    }

    if (login.length < 3) {
      Alert.alert("Ошибка", "Логин должен содержать минимум 3 символа");
      return;
    }

    try {
      console.log('🚀 RegisterScreen: Starting registration process...');
      setIsRegistering(true);
      
      await register(login, email, password);
      
      console.log('✅ RegisterScreen: Registration successful');
      Alert.alert(
        "Успешно", 
        "Регистрация прошла успешно! Теперь вы можете войти в систему.",
        [
          {
            text: "OK",
            onPress: () => {
              console.log('🔄 RegisterScreen: Navigating to login...');
              router.replace("/(auth)/login");
            }
          }
        ]
      );
      
    } catch (err: any) {
      console.error('💥 RegisterScreen: Registration error:', err);
      Alert.alert("Ошибка регистрации", err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  const isLoading = registerLoading || isRegistering;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Image source={require("@/assets/logo.png")} style={styles.logo} />

          <Text style={[styles.title, { color: colors.text }]}>
            Создайте аккаунт
          </Text>

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
            value={login}
            onChangeText={setLogin}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          <TextInput
            placeholder="Ваш email"
            placeholderTextColor={colors.placeholder}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          <TextInput
            placeholder="Ваш пароль (мин. 6 символов)"
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
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <TouchableOpacity 
            onPress={handleRegister} 
            style={styles.buttonContainer}
            disabled={isLoading}
          >
            <LinearGradient 
              colors={["#007bff", "#0056d2"]} 
              style={[
                styles.button,
                isLoading && styles.buttonDisabled
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Зарегистрироваться</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity 
              onPress={() => router.replace("/(auth)/login")}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.footerLink,
                  styles.footerLinkActive,
                  { color: colors.tint },
                  isLoading && styles.disabledText
                ]}
              >
                Уже есть аккаунт? Войти
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
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  disabledText: {
    opacity: 0.5,
  },
});