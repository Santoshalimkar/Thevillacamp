import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";
import {
  fetchCustomerBookings,
  BookingItem,
} from "../../services/bookingService";

export default function TripsScreen() {
  const router = useRouter();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = useCallback(async () => {
    if (!isAuthenticated || !user?._id) return;
    setLoading(true);
    try {
      const res = await fetchCustomerBookings(user._id);
      if (res?.success && Array.isArray(res.data)) {
        setBookings(res.data);
      } else if (Array.isArray(res)) {
        setBookings(res as any);
      } else {
        setBookings([]);
      }
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, user?._id]);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      loadBookings();
    }
  }, [isAuthenticated, user?._id, loadBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleOpenVoucherSupport = (booking: BookingItem) => {
    const bookingCode = booking.bookingId || booking._id?.slice(-8).toUpperCase();
    const text = encodeURIComponent(
      `Hello The Villa & Camp! I need assistance with my booking #${bookingCode} for ${booking.property?.name || "my stay"}.`
    );
    Linking.openURL(`https://wa.me/919820000000?text=${text}`);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trips</Text>
        </View>
        <View style={styles.authPromptContainer}>
          <View style={styles.authIconCircle}>
            <Ionicons name="briefcase-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.authPromptTitle}>No trips booked... yet!</Text>
          <Text style={styles.authPromptSubtitle}>
            Log in with your WhatsApp number to access your upcoming trip vouchers, check-in guides, and reservation history.
          </Text>
          <TouchableOpacity style={styles.loginBtn} onPress={openAuthModal}>
            <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
            <Text style={styles.loginBtnText}>Log In with WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trips</Text>
        <Text style={styles.headerSubtitle}>
          {bookings.length} {bookings.length === 1 ? "reservation" : "reservations"}
        </Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.authPromptContainer}>
          <View style={styles.authIconCircle}>
            <Ionicons name="compass-outline" size={40} color={Colors.textSecondary} />
          </View>
          <Text style={styles.authPromptTitle}>No reservations found</Text>
          <Text style={styles.authPromptSubtitle}>
            When you book a villa or campsite, your vouchers, direction pins, and host access codes will appear here.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.push("/(tabs)/" as any)}
          >
            <Text style={styles.exploreBtnText}>Start Exploring</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id || item.bookingId || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item }) => {
            const photo =
              item.property?.images?.[0] ||
              "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600";
            const bookingIdCode =
              item.bookingId || item._id?.slice(-8).toUpperCase() || "TVC-STAY";
            const isConfirmed =
              item.bookingStatus === "CONFIRMED" || item.paymentStatus === "PAID";

            return (
              <View style={styles.tripCard}>
                <Image source={{ uri: photo }} style={styles.tripImage} contentFit="cover" />
                <View style={styles.tripDetails}>
                  <View style={styles.tripHeaderRow}>
                    <Text style={styles.bookingIdText}>ID: #{bookingIdCode}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        isConfirmed ? styles.badgeConfirmed : styles.badgePending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          isConfirmed ? styles.statusTextConfirmed : styles.statusTextPending,
                        ]}
                      >
                        {item.bookingStatus || "CONFIRMED"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.tripPropName} numberOfLines={1}>
                    {item.property?.name || "The Villa Camp Haven"}
                  </Text>
                  <Text style={styles.tripLocation} numberOfLines={1}>
                    {item.property?.address?.city || item.property?.city || "Maharashtra"}
                  </Text>

                  <View style={styles.tripDatesRow}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.tripDatesText}>
                      {item.checkIn} → {item.checkOut}
                    </Text>
                  </View>

                  <View style={styles.tripFooter}>
                    <Text style={styles.tripPrice}>
                      ₹{(item.totalPrice || 14000).toLocaleString("en-IN")}
                    </Text>
                    <TouchableOpacity
                      style={styles.whatsappHelpBtn}
                      onPress={() => handleOpenVoucherSupport(item)}
                    >
                      <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                      <Text style={styles.whatsappHelpText}>Voucher Help</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  authPromptContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
  },
  authIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  authPromptTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
  },
  authPromptSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 28,
  },
  loginBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  exploreBtn: {
    marginTop: 24,
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  exploreBtnText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  tripCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  tripImage: {
    width: "100%",
    height: 140,
  },
  tripDetails: {
    padding: 14,
  },
  tripHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  bookingIdText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeConfirmed: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  badgePending: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusTextConfirmed: {
    color: Colors.success,
  },
  statusTextPending: {
    color: Colors.warning,
  },
  tripPropName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  tripLocation: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tripDatesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  tripDatesText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tripFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  tripPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
  },
  whatsappHelpBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(37, 211, 102, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  whatsappHelpText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#25D366",
  },
});
