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
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";

export const TeacherLoginScreen = () => {
  const { teacherLogin, setCurrentScreen, isLoading } = useApp();
  const [mode, setMode] = useState<"login" | "register">("login");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register state
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regSchool, setRegSchool] = useState("");
  const [regSubject, setRegSubject] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    const result = await teacherLogin(email.trim(), password.trim());
    setLoading(false);
    if (!result.success) {
      Alert.alert("Login Failed", result.message);
    }
  };

  const handleRegister = async () => {
    if (!regFullName.trim() || !regEmail.trim() || !regPassword.trim()) {
      Alert.alert("Missing Fields", "Please fill in Name, Email and Password.");
      return;
    }
    setLoading(true);
    const res = await api.teacherRegister({
      fullName: regFullName.trim(),
      email: regEmail.trim(),
      password: regPassword.trim(),
      school: regSchool.trim(),
      subject: regSubject.trim(),
    });
    setLoading(false);
    if (res.success) {
      Alert.alert("Success", "Teacher account created! Please log in.", [
        { text: "OK", onPress: () => setMode("login") },
      ]);
    } else {
      Alert.alert("Registration Failed", res.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentScreen("welcome")}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🎓</Text>
          </View>
          <Text style={styles.title}>Teacher Portal</Text>
          <Text style={styles.subtitle}>
            {mode === "login"
              ? "Log in with your teacher primary email"
              : "Create your teacher account"}
          </Text>
        </View>

        {/* Tab Toggle */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, mode === "login" && styles.tabActive]}
            onPress={() => setMode("login")}
          >
            <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === "register" && styles.tabActive]}
            onPress={() => setMode("register")}
          >
            <Text style={[styles.tabText, mode === "register" && styles.tabTextActive]}>Register</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {mode === "login" ? (
            <>
              <Text style={styles.label}>Primary Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="teacher@school.edu.lk"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((p) => !p)}>
                  <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁"}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.btnDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Sign In to Dashboard</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={regFullName}
                onChangeText={setRegFullName}
                placeholder="Mr. / Mrs. Full Name"
                placeholderTextColor="#94a3b8"
              />

              <Text style={styles.label}>Primary Email *</Text>
              <TextInput
                style={styles.input}
                value={regEmail}
                onChangeText={setRegEmail}
                placeholder="teacher@school.edu.lk"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Password *</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={regPassword}
                  onChangeText={setRegPassword}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((p) => !p)}>
                  <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁"}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>School / Institution</Text>
              <TextInput
                style={styles.input}
                value={regSchool}
                onChangeText={setRegSchool}
                placeholder="e.g. Ananda College, Colombo"
                placeholderTextColor="#94a3b8"
              />

              <Text style={styles.label}>Subject Taught</Text>
              <TextInput
                style={styles.input}
                value={regSubject}
                onChangeText={setRegSubject}
                placeholder="e.g. Combined Maths, Physics"
                placeholderTextColor="#94a3b8"
              />

              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.btnDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Create Teacher Account</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.note}>
          🔒 Teacher Portal is separate from the student app.{"\n"}Student data is read-only for monitoring purposes.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const PURPLE = "#6c63ff";
const DARK = "#0f172a";

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: DARK },
  container: { flexGrow: 1, backgroundColor: DARK, padding: 24 },
  header: { alignItems: "center", marginTop: 20, marginBottom: 28 },
  backBtn: { position: "absolute", left: 0, top: 0, padding: 8 },
  backIcon: { fontSize: 22, color: "#94a3b8" },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: `${PURPLE}33`, justifyContent: "center", alignItems: "center",
    marginBottom: 14,
  },
  iconText: { fontSize: 34 },
  title: { fontSize: 26, fontWeight: "800", color: "#fff", marginBottom: 6 },
  subtitle: { fontSize: 13, color: "#94a3b8", textAlign: "center", maxWidth: 260 },
  tabRow: {
    flexDirection: "row", backgroundColor: "#1e293b",
    borderRadius: 12, padding: 4, marginBottom: 22,
  },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
  },
  tabActive: { backgroundColor: PURPLE },
  tabText: { fontSize: 14, color: "#94a3b8", fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  card: {
    backgroundColor: "#1e293b", borderRadius: 20, padding: 22,
    marginBottom: 20,
  },
  label: { fontSize: 13, color: "#94a3b8", marginBottom: 6, marginTop: 12, fontWeight: "600" },
  input: {
    backgroundColor: "#0f172a", borderRadius: 12, padding: 14,
    color: "#fff", fontSize: 15, borderWidth: 1, borderColor: "#334155",
  },
  passwordRow: { position: "relative" },
  passwordInput: { paddingRight: 50 },
  eyeBtn: {
    position: "absolute", right: 14, top: 0, bottom: 0,
    justifyContent: "center",
  },
  eyeText: { fontSize: 18 },
  submitBtn: {
    backgroundColor: PURPLE, borderRadius: 14, paddingVertical: 15,
    alignItems: "center", marginTop: 24,
  },
  btnDisabled: { opacity: 0.6 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  note: {
    fontSize: 12, color: "#475569", textAlign: "center", lineHeight: 18,
    paddingHorizontal: 16, paddingBottom: 24,
  },
});
