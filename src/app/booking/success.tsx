import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Colors } from "../../theme/colors";

export default function BookingSuccessScreen() {
  const router = useRouter();
  const { bookingId, propertyName, totalPaid, phone } = useLocalSearchParams<{
    bookingId?: string;
    propertyName?: string;
    totalPaid?: string;
    phone?: string;
  }>();

  useEffect(() => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  }, []);

  const bookingCode =
    bookingId ? bookingId.slice(-8).toUpperCase() : "TVC-SUCCESS";

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello! I just confirmed booking #${bookingCode} for ${propertyName || "my stay"}. Can you share my voucher and directions?`
    );
    Linking.openURL(`https://wa.me/919820000000?text=${text}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Success Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-sharp" size={48} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your stay at {propertyName || "The Villa Camp Haven"} is successfully locked in.
        </Text>

        {/* Voucher Receipt Card */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Booking ID</Text>
            <Text style={styles.receiptCode}>#{bookingCode}</Text>
          </View>
          <View style={styles.receiptDivider} />

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Status</Text>
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeSuccessText}>PAID & CONFIRMED</Text>
            </View>
          </View>
          <View style={styles.receiptDivider} />

          {totalPaid && (
            <>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Total Paid</Text>
                <Text style={styles.receiptAmount}>
                  ₹{Number(totalPaid).toLocaleString("en-IN")}
                </Text>
              </View>
              <View style={styles.receiptDivider} />
            </>
          )}

          <View style={styles.whatsappNoticeRow}>
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            <Text style={styles.whatsappNoticeText}>
              Check-in voucher & GPS gate pin sent to WhatsApp on +91 {phone || "your number"}
            </Text>
          </View>
        </View>

        {/* WhatsApp Voucher Button */}
        <TouchableOpacity style={styles.whatsappBtn} onPress={handleOpenWhatsApp}>
          <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
          <Text style={styles.whatsappBtnText}>Open Voucher on WhatsApp</Text>
        </TouchableOpacity>

        {/* Navigation CTAs */}
        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={styles.tripsBtn}
            onPress={() => router.replace("/(tabs)/trips" as any)}
          >
            <Text style={styles.tripsBtnText}>View in Trips</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => router.replace("/(tabs)/" as any)}
          >
            <Text style={styles.homeBtnText}>Explore More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  receiptCard: {
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    marginTop: 24,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  receiptLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  receiptCode: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "monospace",
  },
  receiptDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 10,
  },
  badgeSuccess: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeSuccessText: {
    color: Colors.success,
    fontSize: 11,
    fontWeight: "800",
  },
  receiptAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.primary,
  },
  whatsappNoticeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(37, 211, 102, 0.1)",
    padding: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  whatsappNoticeText: {
    flex: 1,
    fontSize: 12,
    color: "#25D366",
    fontWeight: "600",
    lineHeight: 16,
  },
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#25D366",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 20,
  },
  whatsappBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  ctaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    width: "100%",
  },
  tripsBtn: {
    flex: 1,
    backgroundColor: Colors.cardSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
  },
  tripsBtnText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  homeBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
  },
  homeBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
