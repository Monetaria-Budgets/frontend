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

  const handleRegister = async () => {
    if (!login.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Ошибка", "Пожалуйста, заполните все поля");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Ошибка", "Пароль должен содержать минимум 6 символов");
      return;
    }

    if (!email.includes('@')) {
      Alert.alert("Ошибка", "Пожалуйста, введите корректный email");
      return;
    }

    try {
      await register(login, email, password);
      Alert.alert("Успешно", "Регистрация прошла успешно! Теперь вы можете войти в систему.");
      router.replace("/(auth)/login");
    } catch (err: any) {
      Alert.alert("Ошибка регистрации", err.message);
    }
  };

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
            value={login}
            onChangeText={setLogin}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!registerLoading}
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
            editable={!registerLoading}
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
            autoCapitalize="none"
            autoCorrect={false}
            editable={!registerLoading}
          />

          <TouchableOpacity 
            onPress={handleRegister} 
            style={styles.buttonContainer}
            disabled={registerLoading}
          >
            <LinearGradient 
              colors={["#007bff", "#0056d2"]} 
              style={[
                styles.button,
                registerLoading && styles.buttonDisabled
              ]}
            >
              <Text style={styles.buttonText}>
                {registerLoading ? "Регистрация..." : "Зарегистрироваться"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity 
              onPress={() => router.replace("/(auth)/login")}
              disabled={registerLoading}
            >
              <Text
                style={[
                  styles.footerLink,
                  styles.footerLinkActive,
                  { color: colors.tint },
                  registerLoading && styles.disabledText
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
  },
  button: {
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
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
    alignItems: "center",
    width: "100%",
  },
  footerLink: {
    fontSize: 14,
  },
  footerLinkActive: {
    fontWeight: "500",
  },
  disabledText: {
    opacity: 0.5,
  },
});