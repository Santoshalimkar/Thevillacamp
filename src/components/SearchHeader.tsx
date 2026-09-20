import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Colors } from "../theme/colors";
import { useSearch } from "../context/SearchContext";

interface SearchHeaderProps {
  onOpenFilter?: () => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({ onOpenFilter }) => {
  const router = useRouter();
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
    if (onOpenFilter) {
      onOpenFilter();
    } else {
      router.push("/modal/search" as any);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handlePressSearch}
        style={styles.searchPill}
      >
        <View style={styles.searchIconWrapper}>
          <Ionicons name="search" size={20} color={Colors.primary} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.primaryText} numberOfLines={1}>
            {destination ? destination : "Where to?"}
          </Text>
          <Text style={styles.secondaryText} numberOfLines={1}>
            {searchSummary}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.filterButton, isFiltered && styles.filterButtonActive]}
          onPress={handlePressFilter}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={isFiltered ? Colors.primary : Colors.textSecondary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.background,
  },
  searchPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 36,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cardSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  primaryText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  secondaryText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    backgroundColor: Colors.cardSecondary,
  },
  filterButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(255, 90, 31, 0.12)",
  },
});
