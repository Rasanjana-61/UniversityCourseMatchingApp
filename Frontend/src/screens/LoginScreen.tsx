import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";

export const LoginScreen: React.FC = () => {
  const { setCurrentScreen, login, isLoading } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);

    // Validation
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email format (e.g. name@example.com).");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    const res = await login(cleanEmail, password);
    if (res.success) {
      setCurrentScreen("home");
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="school" size={28} color={Brand.primary} />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Log in to access your course matches and profile</Text>
          </View>

          {/* Error Message Alert Banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" style={{ marginRight: 8 }} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errorMessage && !email ? styles.inputWrapperError : null,
                ]}
              >
                <Ionicons name="mail-outline" size={18} color={Brand.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={Brand.textMuted}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errorMessage && !password ? styles.inputWrapperError : null,
                ]}
              >
                <Ionicons name="lock-closed-outline" size={18} color={Brand.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={Brand.textMuted}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={Brand.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Secure Info Card */}
            <View style={styles.securityCard}>
              <Ionicons name="shield-checkmark" size={20} color={Brand.primary} style={styles.shieldIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.securityTitle}>Secure Authentication</Text>
                <Text style={styles.securitySub}>Your password and academic data are encrypted and safely stored.</Text>
              </View>
            </View>

            {/* Primary Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={() => setCurrentScreen("forgot-password")}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Create Account Outline Button */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => setCurrentScreen("register")}
              activeOpacity={0.85}
            >
              <Text style={styles.registerButtonText}>Don't have an account? Create one</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 40 : 30,
    paddingBottom: 30,
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Brand.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Brand.textSecondary,
    textAlign: "center",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inputWrapperError: {
    borderColor: "#EF4444",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Brand.text,
    height: "100%",
  },
  eyeIcon: {
    padding: 6,
  },
  securityCard: {
    flexDirection: "row",
    backgroundColor: Brand.primaryLight,
    padding: 14,
    borderRadius: 12,
    marginVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  shieldIcon: {
    marginRight: 12,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.primaryDark,
  },
  securitySub: {
    fontSize: 11,
    color: "#3B82F6",
    marginTop: 2,
  },
  loginButton: {
    backgroundColor: Brand.primary,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotButton: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  forgotText: {
    color: Brand.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  registerButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  registerButtonText: {
    color: Brand.text,
    fontSize: 14,
    fontWeight: "600",
  },
});
