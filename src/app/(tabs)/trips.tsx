import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";
import {
  fetchCustomerBookings,
  BookingItem,
} from "../../services/bookingService";

export default function TripsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    const text = encodeURIComponent(
      `Hello The Villa & Camp! I have a question regarding my booking #${booking.orderId || booking._id || ""}.`
    );
    Linking.openURL(`https://wa.me/919820000000?text=${text}`);
  };

  const bottomPadding = Math.max(insets.bottom, 10) + 80;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTag}>RESERVATIONS & PASSES</Text>
        <Text style={styles.headerTitle}>
          My <Text style={{ color: Colors.primary }}>Bookings</Text>
        </Text>
      </View>

      {!isAuthenticated ? (
        <View style={styles.authBannerContainer}>
          <View style={styles.authCard}>
            <View style={styles.authIconCircle}>
              <Ionicons name="calendar" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.authTitle}>Sign in to view your trips</Text>
            <Text style={styles.authSubtitle}>
              Log in with your WhatsApp number to view upcoming check-ins, access booking vouchers, and connect with hosts.
            </Text>
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.authButton}
              onPress={openAuthModal}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.authButtonText}>Sign In via WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching your reservations...</Text>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="briefcase-outline" size={36} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>No trips booked... yet!</Text>
          <Text style={styles.emptySubtitle}>
            Time to dust off your bags and start planning your next lakeside or private pool escape.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.push("/(tabs)/stays" as any)}
          >
            <Text style={styles.exploreBtnText}>Start Exploring Stays</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item, index) => item._id || item.orderId || `booking-${index}`}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          renderItem={({ item }) => {
            const photo =
              item.property?.images?.[0] ||
              item.property?.propertyImage ||
              "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800";
            const bookingIdCode = (item.orderId || item._id || "VC").slice(-6).toUpperCase();
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
                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
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
                      <Ionicons name="logo-whatsapp" size={15} color="#25D366" />
                      <Text style={styles.whatsappHelpText}>Voucher Help</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTag: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FF5A1F",
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
    letterSpacing: -0.3,
  },
  authBannerContainer: {
    padding: 20,
    marginTop: 30,
  },
  authCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  authIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FDBA74",
  },
  authTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  authSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#25D366",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
  },
  authButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 12,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 36,
    marginTop: 40,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  exploreBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: "#FF5A1F",
  },
  exploreBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  listContent: {
    padding: 14,
  },
  tripCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
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
  },
  bookingIdText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9CA3AF",
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeConfirmed: {
    backgroundColor: "#ECFDF5",
    borderWidth: 0.5,
    borderColor: "#A7F3D0",
  },
  badgePending: {
    backgroundColor: "#FFFBEB",
    borderWidth: 0.5,
    borderColor: "#FDE68A",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  statusTextConfirmed: {
    color: "#059669",
  },
  statusTextPending: {
    color: "#D97706",
  },
  tripPropName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginTop: 6,
  },
  tripLocation: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  tripDatesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  tripDatesText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  tripFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  tripPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  whatsappHelpBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    gap: 4,
  },
  whatsappHelpText: {
    color: "#15803D",
    fontSize: 12,
    fontWeight: "700",
  },
});
