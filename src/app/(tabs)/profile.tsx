import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* User Card */}
        {isAuthenticated && user ? (
          <View style={styles.userCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {(user.name || user.firstName || "U").charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Valued Guest"}
              </Text>
              <Text style={styles.userPhone}>+91 {user.phone}</Text>
              {user.email && <Text style={styles.userEmail}>{user.email}</Text>}
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.loginBanner} activeOpacity={0.88} onPress={openAuthModal}>
            <View style={styles.loginBannerLeft}>
              <View style={styles.whatsappLogoCircle}>
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              </View>
              <View>
                <Text style={styles.loginBannerTitle}>Log In with WhatsApp</Text>
                <Text style={styles.loginBannerSubtitle}>Instant OTP • No password required</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Host Banner */}
        <TouchableOpacity
          style={styles.hostBanner}
          activeOpacity={0.88}
          onPress={handleListProperty}
        >
          <View style={styles.hostBannerText}>
            <Text style={styles.hostBannerTitle}>Host your villa or camp</Text>
            <Text style={styles.hostBannerSubtitle}>
              Earn top revenue with zero hassle. Join 200+ partner hosts across Maharashtra.
            </Text>
          </View>
          <Ionicons name="home-outline" size={28} color={Colors.primary} />
        </TouchableOpacity>

        {/* Menu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SUPPORT & ASSISTANCE</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleOpenWhatsApp}>
            <View style={styles.menuLeft}>
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              <Text style={styles.menuTitle}>24/7 WhatsApp Concierge</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Linking.openURL("https://thevillacamp.com/contact")
            }
          >
            <View style={styles.menuLeft}>
              <Ionicons name="call-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.menuTitle}>Contact Support Desk</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>LEGAL & POLICIES</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Linking.openURL("https://thevillacamp.com/terms-of-service")
            }
          >
            <View style={styles.menuLeft}>
              <Ionicons name="document-text-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.menuTitle}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Linking.openURL("https://thevillacamp.com/privacy-policy")
            }
          >
            <View style={styles.menuLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.menuTitle}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleConfirmLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>
        )}

        {/* App Version Info */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>THE VILLA & CAMP</Text>
          <Text style={styles.footerVersion}>Version 1.0.0 (Expo SDK 57)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  userPhone: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  loginBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  loginBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  whatsappLogoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(37, 211, 102, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  loginBannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  loginBannerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  hostBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.cardSecondary,
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  hostBannerText: {
    flex: 1,
    marginRight: 12,
  },
  hostBannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  hostBannerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.textTertiary,
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.25)",
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.error,
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
  },
  footerBrand: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: Colors.textTertiary,
  },
  footerVersion: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
  },
});
