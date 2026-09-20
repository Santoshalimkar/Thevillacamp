import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Colors } from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";
import {
  fetchPropertyById,
  PropertyItem,
} from "../../services/propertyService";
import {
  createBookingOrder,
  verifyBookingPayment,
} from "../../services/bookingService";
import { RazorpayModal } from "../../components/RazorpayModal";
import { RAZORPAY_KEY_ID } from "../../services/api";

export default function BookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, categoryId } = useLocalSearchParams<{ id: string; categoryId?: string }>();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [property, setProperty] = useState<PropertyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [nights, setNights] = useState(2);

  // Form details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  // Payment state
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayVisible, setRazorpayVisible] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [activeBookingId, setActiveBookingId] = useState<string>("");

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      setFullName(user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim());
      setMobile(user.phone || "");
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  const loadProperty = async () => {
    try {
      const res = await fetchPropertyById(id as string, categoryId as string);
      if (res?.success && res.data) {
        setProperty(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const basePricePerNight =
    property?.price ||
    property?.basePrice ||
    property?.pricing?.basePrice ||
    14000;

  const stayTotal = basePricePerNight * nights;
  const cleaningFee = 1500;
  const taxes = Math.round(stayTotal * 0.18);
  const grandTotal = stayTotal + cleaningFee + taxes;

  const handlePay = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    if (!fullName.trim() || !mobile.trim() || mobile.length < 10) {
      Alert.alert(
        "Missing Contact Details",
        "Please provide your full name and 10-digit mobile number for check-in confirmation."
      );
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setIsProcessing(true);

    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 2);
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 2 + nights);

    const payload = {
      propertyId: id as string,
      categoryId: categoryId || property?.categoryId,
      checkIn: checkInDate.toISOString().split("T")[0],
      checkOut: checkOutDate.toISOString().split("T")[0],
      adultsCount: adults,
      childrenCount: children,
      totalGuests: adults + children,
      totalPrice: grandTotal,
      basePrice: stayTotal,
      taxes,
      cleaningFee,
      customerDetails: {
        firstName: fullName.split(" ")[0] || "Guest",
        lastName: fullName.split(" ").slice(1).join(" ") || "",
        email: email.trim() || `${mobile}@thevillacamp.guest`,
        mobile: mobile.trim(),
      },
    };

    try {
      const res = await createBookingOrder(payload);
      if (res?.success && res.data?.order) {
        setActiveOrder(res.data.order);
        setActiveBookingId(res.data.booking?._id || "");
        setRazorpayVisible(true);
      } else {
        Alert.alert("Booking Error", res?.message || "Could not generate order. Please retry.");
      }
    } catch (err: any) {
      Alert.alert("Booking Failed", err?.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (data: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => {
    setRazorpayVisible(false);
    setIsProcessing(true);

    try {
      const verifyRes = await verifyBookingPayment({
        razorpayPaymentId: data.razorpay_payment_id,
        razorpayOrderId: data.razorpay_order_id,
        razorpaySignature: data.razorpay_signature,
        bookingId: activeBookingId,
      });

      if (verifyRes?.success) {
        router.replace({
          pathname: "/booking/success",
          params: {
            bookingId: activeBookingId,
            propertyName: property?.name || "The Villa Camp",
            totalPaid: grandTotal.toString(),
            phone: mobile,
          },
        } as any);
      } else {
        Alert.alert(
          "Verification Pending",
          "Your payment succeeded, but verification is finalizing. Please check Trips tab shortly."
        );
        router.replace("/(tabs)/trips" as any);
      }
    } catch (e: any) {
      Alert.alert("Verification Notice", e?.message || "Please check Trips tab.");
      router.replace("/(tabs)/trips" as any);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const thumbnail =
    property?.images?.[0] ||
    property?.propertyImage ||
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400";

  return (
    <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Confirm and Pay</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Property Brief Card */}
        <View style={styles.propCard}>
          <Image source={{ uri: thumbnail }} style={styles.propThumbnail} contentFit="cover" />
          <View style={styles.propInfo}>
            <Text style={styles.propName} numberOfLines={1}>
              {property?.name || "The Villa Camp Haven"}
            </Text>
            <Text style={styles.propLocation} numberOfLines={1}>
              {property?.address?.city || property?.city || "Maharashtra"}
            </Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={13} color={Colors.ratingGold} />
              <Text style={styles.ratingValue}>{(property?.rating || 4.92).toFixed(1)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Trip Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your trip</Text>

          {/* Nights Selector */}
          <View style={styles.counterRow}>
            <View>
              <Text style={styles.counterLabel}>Duration</Text>
              <Text style={styles.counterSub}>{nights} Nights</Text>
            </View>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setNights(Math.max(1, nights - 1))}
              >
                <Ionicons name="remove" size={18} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.stepValue}>{nights}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setNights(nights + 1)}
              >
                <Ionicons name="add" size={18} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Guests Selector */}
          <View style={styles.counterRow}>
            <View>
              <Text style={styles.counterLabel}>Guests</Text>
              <Text style={styles.counterSub}>{adults + children} Total Guests</Text>
            </View>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setAdults(Math.max(1, adults - 1))}
              >
                <Ionicons name="remove" size={18} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.stepValue}>{adults}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setAdults(adults + 1)}
              >
                <Ionicons name="add" size={18} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Guest Details Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guest Information</Text>
          <Text style={styles.sectionSubtitle}>
            Booking vouchers and WhatsApp arrival instructions will be sent to these details.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rahul Sharma"
              placeholderTextColor={Colors.textTertiary}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>WhatsApp Mobile Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile number"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="phone-pad"
              value={mobile}
              onChangeText={setMobile}
              maxLength={10}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="rahul@example.com"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Price Itemization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price details</Text>

          <View style={styles.priceLine}>
            <Text style={styles.priceLineLabel}>
              ₹{basePricePerNight.toLocaleString("en-IN")} × {nights} nights
            </Text>
            <Text style={styles.priceLineVal}>₹{stayTotal.toLocaleString("en-IN")}</Text>
          </View>

          <View style={styles.priceLine}>
            <Text style={styles.priceLineLabel}>Cleaning & Sanitization</Text>
            <Text style={styles.priceLineVal}>₹{cleaningFee.toLocaleString("en-IN")}</Text>
          </View>

          <View style={styles.priceLine}>
            <Text style={styles.priceLineLabel}>GST & Service Tax (18%)</Text>
            <Text style={styles.priceLineVal}>₹{taxes.toLocaleString("en-IN")}</Text>
          </View>

          <View style={[styles.priceLine, styles.totalLine]}>
            <Text style={styles.totalLabel}>Total (INR)</Text>
            <Text style={styles.totalVal}>₹{grandTotal.toLocaleString("en-IN")}</Text>
          </View>
        </View>

        {/* Secure Razorpay Guarantee Notice */}
        <View style={styles.guaranteeBox}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
          <Text style={styles.guaranteeText}>
            256-bit SSL Encrypted • 100% Safe Payments via Razorpay
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA Bar */}
      <View style={styles.footerBar}>
        <View>
          <Text style={styles.footerTotal}>₹{grandTotal.toLocaleString("en-IN")}</Text>
          <Text style={styles.footerSub}>Final Amount</Text>
        </View>

        <TouchableOpacity
          style={[styles.payBtn, isProcessing && styles.payBtnDisabled]}
          disabled={isProcessing}
          activeOpacity={0.88}
          onPress={handlePay}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.payBtnContent}>
              <Text style={styles.payBtnText}>Pay with Razorpay</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Razorpay In-App Modal */}
      <RazorpayModal
        visible={razorpayVisible}
        orderData={activeOrder}
        propertyTitle={property?.name || "The Villa Camp"}
        customerDetails={{
          name: fullName,
          email: email || `${mobile}@thevillacamp.guest`,
          contact: mobile,
        }}
        razorpayKey={RAZORPAY_KEY_ID}
        onSuccess={handlePaymentSuccess}
        onDismiss={() => setRazorpayVisible(false)}
        onError={(err) => {
          setRazorpayVisible(false);
          Alert.alert("Payment Cancelled or Failed", err?.description || "Payment was not completed.");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: {
    padding: 6,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  propCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  propThumbnail: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  propInfo: {
    flex: 1,
    justifyContent: "center",
  },
  propName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  propLocation: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 20,
  },
  section: {},
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  counterLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  counterSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.cardSecondary,
  },
  stepValue: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    minWidth: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  priceLineLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceLineVal: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "600",
  },
  totalLine: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 12,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primary,
  },
  guaranteeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
  },
  guaranteeText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: "600",
    flex: 1,
  },
  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerTotal: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
  },
  footerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  payBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 26,
  },
  payBtnDisabled: {
    opacity: 0.5,
  },
  payBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  payBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
