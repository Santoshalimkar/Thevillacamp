import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Colors } from "../theme/colors";
import { useSearch } from "../context/SearchContext";

interface VillaHeaderProps {
  onPressMenu?: () => void;
  onPressNotifications?: () => void;
}

export const VillaHeader: React.FC<VillaHeaderProps> = ({
  onPressMenu,
  onPressNotifications,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { destination, searchSummary, isFiltered } = useSearch();

  const handlePressSearch = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    router.push("/modal/search" as any);
  };

  const handlePressFilter = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    router.push("/modal/search" as any);
  };

  const handlePressMenu = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    if (onPressMenu) {
      onPressMenu();
    } else {
      router.push("/(tabs)/profile" as any);
    }
  };

  return (
    <View style={[styles.wrapper, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Top Location Bar */}
      <View style={styles.topRow}>
        {/* Menu Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePressMenu}
          style={styles.iconCircle}
        >
          <Ionicons name="menu" size={22} color={Colors.text} />
        </TouchableOpacity>

        {/* Location Display */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePressSearch}
          style={styles.locationContainer}
        >
          <Text style={styles.locationLabel}>LOCATION:</Text>
          <Text style={styles.locationValue} numberOfLines={1}>
            {destination ? destination : "Lonavala, Maharashtra"}
          </Text>
          <Ionicons
            name="location-sharp"
            size={15}
            color={Colors.primary}
            style={styles.locationIcon}
          />
        </TouchableOpacity>

        {/* Notifications Bell */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPressNotifications || (() => router.push("/(tabs)/profile" as any))}
          style={styles.iconCircle}
        >
          <Ionicons name="notifications-outline" size={20} color={Colors.text} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* Floating Search Pill */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePressSearch}
        style={styles.searchBar}
      >
        <View style={styles.searchLeftIcon}>
          <Ionicons name="search" size={19} color={Colors.textSecondary} />
        </View>

        <View style={styles.searchTextWrapper}>
          <Text style={styles.searchPrimaryText} numberOfLines={1}>
            {destination ? destination : "Where to?"}
            <Text style={styles.searchDot}> • </Text>
            <Text style={styles.searchSecondaryText}>
              {searchSummary || "Villa • Oct 2 – Oct 5 • 3 guests"}
            </Text>
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePressFilter}
          style={[styles.filterIconCircle, isFiltered && styles.filterIconCircleActive]}
        >
          <Ionicons
            name="options-outline"
            size={17}
            color={isFiltered ? Colors.primary : Colors.textSecondary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    marginBottom: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.primary,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    maxWidth: "68%",
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginRight: 4,
  },
  locationValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F2937",
    maxWidth: 130,
  },
  locationIcon: {
    marginLeft: 3,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchLeftIcon: {
    marginRight: 10,
  },
  searchTextWrapper: {
    flex: 1,
  },
  searchPrimaryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  searchDot: {
    color: "#9CA3AF",
    fontWeight: "400",
  },
  searchSecondaryText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  filterIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  filterIconCircleActive: {
    backgroundColor: Colors.pillBg,
    borderColor: Colors.primary,
  },
});
