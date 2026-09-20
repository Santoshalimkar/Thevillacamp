import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      "Hello The Villa & Camp! I need customer support or want to inquire about a stay."
    );
    Linking.openURL(`https://wa.me/919820000000?text=${text}`);
  };

  const handleListProperty = () => {
    const text = encodeURIComponent(
      "Hello The Villa & Camp! I am interested in listing my luxury villa or campsite on your platform."
    );
    Linking.openURL(`https://wa.me/919820000000?text=${text}`);
  };

  const handleConfirmLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of The Villa & Camp?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: logout },
      ]
    );
  };

  const bottomPadding = Math.max(insets.bottom, 10) + 80;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTag}>ACCOUNT & SETTINGS</Text>
        <Text style={styles.headerTitle}>
          My <Text style={{ color: Colors.primary }}>Profile</Text>
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        {isAuthenticated && user ? (
          <View style={styles.userCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {(user.name || user.firstName || "U").charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name || "Valued Guest"}</Text>
              <Text style={styles.userPhone}>+91 {user.mobileNumber || user.phone}</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#10B981" />
                <Text style={styles.verifiedText}>Verified Account</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.loginBanner}>
            <View style={styles.loginBannerContent}>
              <Text style={styles.loginBannerTitle}>Log in to manage your stays</Text>
              <Text style={styles.loginBannerSubtitle}>
                Access WhatsApp instant check-in, saved wishlists, and customized perks.
              </Text>
              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.loginBtn}
                onPress={openAuthModal}
              >
                <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.loginBtnText}>Log In with WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Host Banner */}
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.hostBanner}
          onPress={handleListProperty}
        >
          <View style={styles.hostBannerText}>
            <View style={styles.hostBadge}>
              <Text style={styles.hostBadgeText}>PARTNER WITH US</Text>
            </View>
            <Text style={styles.hostBannerTitle}>List your villa or campsite</Text>
            <Text style={styles.hostBannerSubtitle}>
              Earn verified bookings from thousands of high-intent travelers across Maharashtra.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Menu Section 1: Support & AI */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SUPPORT & ASSISTANCE</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleOpenWhatsApp}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: "#F0FDF4" }]}>
                <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              </View>
              <Text style={styles.menuTitle}>24/7 WhatsApp Hotline</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL("tel:919820000000")}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="call-outline" size={18} color="#3B82F6" />
              </View>
              <Text style={styles.menuTitle}>Direct Concierge Call</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Menu Section 2: Legal & About */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ABOUT THE VILLA & CAMP</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL("https://thevillacamp.com/terms")}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: "#F9FAFB" }]}>
                <Ionicons name="document-text-outline" size={18} color="#4B5563" />
              </View>
              <Text style={styles.menuTitle}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL("https://thevillacamp.com/privacy")}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: "#F9FAFB" }]}>
                <Ionicons name="shield-outline" size={18} color="#4B5563" />
              </View>
              <Text style={styles.menuTitle}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        {isAuthenticated && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.logoutBtn}
            onPress={handleConfirmLogout}
          >
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>THE VILLA & CAMP</Text>
          <Text style={styles.footerVersion}>Version 1.0.0 • Verified Stays</Text>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingTop: 16,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFF7ED",
    borderWidth: 1.5,
    borderColor: "#FF5A1F",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FF5A1F",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  userPhone: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#10B981",
  },
  loginBanner: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  loginBannerContent: {
    alignItems: "center",
  },
  loginBannerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  loginBannerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 17,
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#25D366",
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 24,
    marginTop: 16,
  },
  loginBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  hostBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  hostBannerText: {
    flex: 1,
    marginRight: 12,
  },
  hostBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  hostBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#EA580C",
    letterSpacing: 0.5,
  },
  hostBannerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  hostBannerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
    lineHeight: 17,
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: "800",
    color: "#9CA3AF",
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginHorizontal: 16,
    marginTop: 4,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#EF4444",
  },
  footer: {
    alignItems: "center",
    marginTop: 26,
  },
  footerBrand: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#9CA3AF",
  },
  footerVersion: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 3,
  },
});
