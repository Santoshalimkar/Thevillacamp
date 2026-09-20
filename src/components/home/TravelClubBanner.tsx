import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";

export const TravelClubBanner: React.FC = () => {
  const handleJoin = () => {
    Linking.openURL("https://api.whatsapp.com/send?phone=918669186483&text=Hi%20Thevillacamp%2C%20I%20want%20to%20join%20the%20VIP%20Travel%20Club!");
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Eyebrow */}
        <View style={styles.badge}>
          <Ionicons name="sparkles" size={11} color="#F59E0B" style={{ marginRight: 4 }} />
          <Text style={styles.badgeText}>The Villa Camp Travel Club</Text>
          <Text style={styles.badgeDot}>•</Text>
          <Text style={styles.badgeSub}>Get 10% Off First Stay</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          Unlock Secret Weekend Deals & Flash Sales
        </Text>

        <Text style={styles.desc}>
          Join over 15,000+ happy travelers getting private discounts, free barbecue nights, and
          early bird villa access.
        </Text>

        <TouchableOpacity style={styles.btn} onPress={handleJoin} activeOpacity={0.88}>
          <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.btnText}>Join VIP WhatsApp Club</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#F59E0B",
  },
  badgeDot: {
    color: "rgba(255, 255, 255, 0.4)",
    marginHorizontal: 4,
  },
  badgeSub: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 8,
    lineHeight: 18,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 18,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
