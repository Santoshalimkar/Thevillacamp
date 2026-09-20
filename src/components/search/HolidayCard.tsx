import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";

interface HolidayCardProps {
  name: string;
  totalDays: number;
  dateRange: string;
  isSelected?: boolean;
  onPress: () => void;
}

export const HolidayCard: React.FC<HolidayCardProps> = ({
  name,
  totalDays,
  dateRange,
  isSelected = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Ionicons name="sparkles" size={10} color="#D97706" style={{ marginRight: 3 }} />
          <Text style={styles.badgeText}>{totalDays} DAYS</Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {name}
      </Text>

      <View style={styles.dateRow}>
        <Ionicons name="calendar-outline" size={12} color={Colors.primary} style={{ marginRight: 4 }} />
        <Text style={styles.dateText} numberOfLines={1}>
          {dateRange}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 175,
    minHeight: 88,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "space-between",
    marginRight: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: "#FFF7ED",
    borderWidth: 1.5,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#B45309",
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 17,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  dateText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
});
