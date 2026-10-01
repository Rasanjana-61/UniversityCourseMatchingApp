import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";

type ResetStep = "email" | "otp" | "password" | "success";

export const ForgotPasswordScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  
  // 6 digit OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Resend countdown timer
  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle OTP digit changes
  const handleOtpChange = (text: string, index: number) => {
    setErrorMessage(null);
    const cleaned = text.replace(/[^0-9]/g, "");

    // If pasted whole code
    if (cleaned.length > 1) {
      const digits = cleaned.slice(0, 6).split("");
      const newDigits = [...otpDigits];
      digits.forEach((d, i) => {
        newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned;
    setOtpDigits(newDigits);

    // Auto advance to next box
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const getCombinedOtp = () => otpDigits.join("");

  // 1. Step 1: Send OTP to Email
  const handleSendOtp = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email format (e.g. name@example.com).");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.forgotPassword(cleanEmail);
      if (res && res.success) {
        setSuccessMessage(res.message);
        setStep("otp");
        setResendTimer(30); // 30s countdown
        setOtpDigits(["", "", "", "", "", ""]);
        if (res.demoOtp) {
          // If in dev mode
          const digits = res.demoOtp.slice(0, 6).split("");
          setOtpDigits(digits);
        }
      } else {
        setErrorMessage(res?.message || "Failed to send reset code. Please check email address.");
      }
    } catch (err) {
      setErrorMessage("Network connection error. Please check your internet.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    setErrorMessage(null);
    const code = getCombinedOtp();

    if (!code || code.length < 6) {
      setErrorMessage("Please enter all 6 digits of the verification code.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.verifyOtp(email.trim(), code);
      if (res && res.success) {
        setStep("password");
        setSuccessMessage(null);
      } else {
        setErrorMessage(res?.message || "Invalid or expired verification code.");
      }
    } catch (err) {
      setErrorMessage("Network error verifying code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Step 3: Reset Password
  const handleResetPassword = async () => {
    setErrorMessage(null);
    const code = getCombinedOtp();

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.resetPassword({
        email: email.trim(),
        otp: code,
        newPassword,
      });

      if (res && res.success) {
        setStep("success");
      } else {
        setErrorMessage(res?.message || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Network error resetting password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top navigation header */}
          <TouchableOpacity
            style={styles.backNav}
            onPress={() => setCurrentScreen("login")}
            activeOpacity={0.7}
          >
            <View style={styles.backNavCircle}>
              <Ionicons name="arrow-back" size={18} color={Brand.primary} />
            </View>
            <Text style={styles.backNavText}>Back to Login</Text>
          </TouchableOpacity>

          {/* Step Progress Indicator */}
          {step !== "success" ? (
            <View style={styles.stepIndicatorContainer}>
              <View style={[styles.stepDot, styles.stepDotActive]}>
                <Text style={styles.stepDotText}>1</Text>
              </View>
              <Text style={[styles.stepLabel, styles.stepLabelActive]}>Email</Text>

              <View style={[styles.stepLine, (step === "otp" || step === "password") && styles.stepLineActive]} />

              <View style={[styles.stepDot, (step === "otp" || step === "password") && styles.stepDotActive]}>
                <Text style={[styles.stepDotText, !(step === "otp" || step === "password") && styles.stepDotTextInactive]}>2</Text>
              </View>
              <Text style={[styles.stepLabel, (step === "otp" || step === "password") && styles.stepLabelActive]}>Code</Text>

              <View style={[styles.stepLine, step === "password" && styles.stepLineActive]} />

              <View style={[styles.stepDot, step === "password" && styles.stepDotActive]}>
                <Text style={[styles.stepDotText, step !== "password" && styles.stepDotTextInactive]}>3</Text>
              </View>
              <Text style={[styles.stepLabel, step === "password" && styles.stepLabelActive]}>Password</Text>
            </View>
          ) : null}

          {/* Error Banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" style={{ marginRight: 8 }} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Success / Info Notice */}
          {successMessage && step === "otp" ? (
            <View style={styles.infoBanner}>
              <Ionicons name="checkmark-circle" size={20} color="#059669" style={{ marginRight: 8 }} />
              <Text style={styles.infoBannerText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* ================= STEP 1: Enter Email ================= */}
          {step === "email" && (
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <Ionicons name="lock-open-outline" size={32} color={Brand.primary} />
              </View>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Enter your registered email and we will send a 6-digit verification code directly to your email inbox.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Registered Email</Text>
                <View style={styles.inputWrapper}>
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
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleSendOtp}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.primaryButtonText}>Send Verification Code</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ================= STEP 2: Enter 6-Digit OTP ================= */}
          {step === "otp" && (
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark" size={32} color={Brand.primary} />
              </View>
              <Text style={styles.title}>Enter 6-Digit Code</Text>
              <Text style={styles.subtitle}>
                We sent a verification code to{"\n"}
                <Text style={{ fontWeight: "700", color: Brand.primaryDark }}>{email}</Text>
              </Text>

              {/* 6 Individual Digit Boxes */}
              <View style={styles.otpBoxesContainer}>
                {otpDigits.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    style={[
                      styles.otpBox,
                      digit ? styles.otpBoxFilled : null,
                    ]}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, idx)}
                    onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                    keyboardType="number-pad"
                    maxLength={idx === 0 ? 6 : 1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify Code</Text>
                )}
              </TouchableOpacity>

              {/* Resend OTP Row */}
              <View style={styles.resendRow}>
                <Text style={styles.resendLabel}>Didn't receive code?</Text>
                {resendTimer > 0 ? (
                  <Text style={styles.timerText}>Resend in {resendTimer}s</Text>
                ) : (
                  <TouchableOpacity onPress={handleSendOtp} disabled={isLoading}>
                    <Text style={styles.resendBtnText}>Resend Code</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.changeEmailBtn}
                onPress={() => {
                  setStep("email");
                  setErrorMessage(null);
                }}
              >
                <Text style={styles.changeEmailText}>Change Email Address</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ================= STEP 3: Enter New Password ================= */}
          {step === "password" && (
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <Ionicons name="key-outline" size={32} color={Brand.primary} />
              </View>
              <Text style={styles.title}>Create New Password</Text>
              <Text style={styles.subtitle}>
                Set a strong password for your account (minimum 6 characters).
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} color={Brand.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="At least 6 characters"
                    placeholderTextColor={Brand.textMuted}
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeIcon}>
                    <Ionicons
                      name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color={Brand.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={Brand.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Re-type new password"
                    placeholderTextColor={Brand.textMuted}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                    <Ionicons
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color={Brand.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Save New Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ================= STEP 4: Success View ================= */}
          {step === "success" && (
            <View style={[styles.card, { alignItems: "center", paddingVertical: 36 }]}>
              <View style={[styles.iconCircle, { backgroundColor: "#DCFCE7" }]}>
                <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
              </View>
              <Text style={styles.title}>Password Reset Done!</Text>
              <Text style={[styles.subtitle, { textAlign: "center", marginHorizontal: 12 }]}>
                Your password has been changed successfully. You can now log into your account with your new password.
              </Text>

              <TouchableOpacity
                style={[styles.primaryButton, { width: "100%", marginTop: 20 }]}
                onPress={() => setCurrentScreen("login")}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Go to Login</Text>
              </TouchableOpacity>
            </View>
          )}
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
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    flexGrow: 1,
  },
  backNav: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  backNavCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  backNavText: {
    color: Brand.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: {
    backgroundColor: Brand.primary,
  },
  stepDotText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stepDotTextInactive: {
    color: "#64748B",
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94A3B8",
    marginLeft: 4,
  },
  stepLabelActive: {
    color: Brand.primaryDark,
    fontWeight: "700",
  },
  stepLine: {
    width: 28,
    height: 2,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: Brand.primary,
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
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  infoBannerText: {
    color: "#065F46",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Brand.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    alignSelf: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: Brand.textSecondary,
    lineHeight: 19,
    marginBottom: 20,
    textAlign: "center",
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
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Brand.text,
    height: "100%",
  },
  otpBoxesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 18,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: Brand.primaryDark,
  },
  otpBoxFilled: {
    borderColor: Brand.primary,
    backgroundColor: "#EFF6FF",
  },
  eyeIcon: {
    padding: 6,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: Brand.primary,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    gap: 6,
  },
  resendLabel: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  timerText: {
    fontSize: 13,
    color: Brand.textMuted,
    fontWeight: "600",
  },
  resendBtnText: {
    fontSize: 13,
    color: Brand.primary,
    fontWeight: "600",
  },
  changeEmailBtn: {
    alignItems: "center",
    marginTop: 14,
  },
  changeEmailText: {
    fontSize: 13,
    color: Brand.textSecondary,
    textDecorationLine: "underline",
  },
});
