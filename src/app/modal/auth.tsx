import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, requestOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleClose = () => {
    setStep("phone");
    setPhone("");
    setOtp("");
    setLoading(false);
    closeAuthModal();
  };

  const handleSendOtp = async () => {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      Alert.alert("Invalid Phone Number", "Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    setLoading(true);
    try {
      const res = await requestOtp(cleanPhone);
      if (res?.success) {
        setStep("otp");
        setCountdown(60);
        if (res.devOtp) {
          setOtp(res.devOtp);
          Alert.alert("Dev Mode OTP", `Code ${res.devOtp} auto-filled.`);
        }
      } else {
        Alert.alert("Error Sending OTP", res?.message || "Could not send OTP. Please retry.");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      Alert.alert("Invalid Code", "Please enter the complete 6-digit OTP.");
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setLoading(true);
    try {
      const res = await verifyOtp(phone, otp);
      if (res?.success) {
        handleClose();
      } else {
        Alert.alert("Invalid OTP", res?.message || "Verification code is incorrect.");
      }
    } catch (e: any) {
      Alert.alert("Verification Failed", e?.message || "Please check the code and retry.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <Modal visible={isAuthModalOpen} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            {step === "otp" ? (
              <TouchableOpacity onPress={() => setStep("phone")}>
                <Ionicons name="arrow-back" size={22} color={Colors.text} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 22 }} />
            )}

            <Text style={styles.sheetTitle}>
              {step === "phone" ? "Log in or sign up" : "Verify WhatsApp code"}
            </Text>

            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.sheetContent}>
            {/* WhatsApp Logo Highlight */}
            <View style={styles.brandRow}>
              <View style={styles.whatsappIconCircle}>
                <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
              </View>
              <Text style={styles.welcomeTitle}>The Villa & Camp</Text>
              <Text style={styles.welcomeSubtitle}>
                {step === "phone"
                  ? "We'll send you an instant verification code on WhatsApp."
                  : `Enter the 6-digit code sent to +91 ${phone}`}
              </Text>
            </View>

            {step === "phone" ? (
              <>
                <View style={styles.phoneInputRow}>
                  <View style={styles.countryCodeBox}>
                    <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter mobile number"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    maxLength={10}
                    autoFocus
                  />
                </View>

                <TouchableOpacity
                  style={[styles.actionBtn, loading && styles.actionBtnDisabled]}
                  disabled={loading}
                  onPress={handleSendOtp}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.actionBtnText}>Send WhatsApp Code</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.otpInput}
                  placeholder="• • • • • •"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={setOtp}
                  maxLength={6}
                  autoFocus
                />

                <TouchableOpacity
                  style={[styles.actionBtn, loading && styles.actionBtnDisabled]}
                  disabled={loading}
                  onPress={handleVerifyOtp}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.actionBtnText}>Verify & Continue</Text>
                  )}
                </TouchableOpacity>

                {countdown > 0 ? (
                  <Text style={styles.resendText}>
                    Resend code via WhatsApp in <Text style={{ color: Colors.primary }}>{countdown}s</Text>
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleSendOtp}>
                    <Text style={styles.resendBtn}>Resend WhatsApp Code</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  sheetContent: {
    padding: 24,
    alignItems: "center",
  },
  brandRow: {
    alignItems: "center",
    marginBottom: 24,
  },
  whatsappIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(37, 211, 102, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  phoneInputRow: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: Colors.cardSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    marginBottom: 18,
  },
  countryCodeBox: {
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: Colors.divider,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  phoneInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 14,
    fontSize: 16,
    color: Colors.text,
  },
  otpInput: {
    width: "100%",
    height: 54,
    backgroundColor: Colors.cardSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 10,
    textAlign: "center",
    marginBottom: 18,
  },
  actionBtn: {
    width: "100%",
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  resendText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 18,
  },
  resendBtn: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "700",
    marginTop: 18,
    textDecorationLine: "underline",
  },
});
