import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";

export const AdminLoginScreen: React.FC = () => {
  const { adminLogin, setCurrentScreen } = useApp();
  const [mode, setMode] = useState<"login" | "register">("login");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register state
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regDepartment, setRegDepartment] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please enter your admin email and password.");
      return;
    }
    setLoading(true);
    const result = await adminLogin(email.trim(), password.trim());
    setLoading(false);
    if (!result.success) {
      Alert.alert("Access Denied", result.message);
    }
  };

  const handleRegister = async () => {
    if (!regFullName.trim() || !regEmail.trim() || !regPassword.trim()) {
      Alert.alert("Missing Fields", "Please fill in Name, Email and Password.");
      return;
    }
    setLoading(true);
    const res = await api.adminRegister({
      fullName: regFullName.trim(),
      email: regEmail.trim(),
      password: regPassword.trim(),
      school: regDepartment.trim(),
      subject: "Administration",
    });
    setLoading(false);

    if (res && res.success) {
      Alert.alert(
        "Admin Account Created",
        "Your administrator account is ready. Please log in.",
        [{ text: "Log In Now", onPress: () => setMode("login") }]
      );
    } else {
      Alert.alert("Registration Error", res?.message || "Could not register admin.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar with Back Button */}
          <View style={styles.navBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setCurrentScreen("welcome")}
            >
              <Ionicons name="arrow-back" size={24} color={Brand.text} />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Administrator Access</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Hero Banner Card */}
          <View style={styles.headerCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.portalTitle}>Admin Portal</Text>
            <Text style={styles.portalSubtitle}>
              Platform management, questions & system analytics
            </Text>

            {/* Mode Switcher */}
            <View style={styles.modeTabs}>
              <TouchableOpacity
                style={[styles.tabBtn, mode === "login" && styles.tabBtnActive]}
                onPress={() => setMode("login")}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    mode === "login" && styles.tabBtnTextActive,
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, mode === "register" && styles.tabBtnActive]}
                onPress={() => setMode("register")}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    mode === "register" && styles.tabBtnTextActive,
                  ]}
                >
                  New Admin
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {mode === "login" ? (
              <>
                <Text style={styles.inputLabel}>Admin Email</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color={Brand.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="admin@careerpath.lk"
                    placeholderTextColor={Brand.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={Brand.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter admin password"
                    placeholderTextColor={Brand.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={Brand.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <View style={styles.btnRow}>
                      <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.submitBtnText}>Sign In to Admin Panel</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={Brand.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="System Administrator"
                    placeholderTextColor={Brand.textMuted}
                    value={regFullName}
                    onChangeText={setRegFullName}
                  />
                </View>

                <Text style={styles.inputLabel}>Official Email *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color={Brand.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="admin@careerpath.lk"
                    placeholderTextColor={Brand.textMuted}
                    value={regEmail}
                    onChangeText={setRegEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <Text style={styles.inputLabel}>Password (min. 6 characters) *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={Brand.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Set admin password"
                    placeholderTextColor={Brand.textMuted}
                    value={regPassword}
                    onChangeText={setRegPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={Brand.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Department / Organization</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="business-outline" size={20} color={Brand.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ministry / UGC / System Admin"
                    placeholderTextColor={Brand.textMuted}
                    value={regDepartment}
                    onChangeText={setRegDepartment}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <View style={styles.btnRow}>
                      <Ionicons name="shield-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.submitBtnText}>Create Admin Account</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Brand.text,
  },
  headerCard: {
    backgroundColor: "#1E293B",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: Brand.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  portalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  portalSubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: "#0F172A",
    borderRadius: 12,
    padding: 4,
    width: "100%",
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: Brand.primary,
  },
  tabBtnText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 14,
  },
  tabBtnTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    marginTop: 14,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Brand.text,
  },
  submitBtn: {
    backgroundColor: Brand.primary,
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
