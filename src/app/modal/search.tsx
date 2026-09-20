import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Colors } from "../../theme/colors";
import { useSearch } from "../../context/SearchContext";

const DESTINATIONS = [
  { name: "Lonavala", tagline: "Scenic hills & private pools" },
  { name: "Alibaug", tagline: "Beachfront villas & coastal air" },
  { name: "Pawna Lake", tagline: "Glamping by the lakeside" },
  { name: "Karjat", tagline: "Lush greenery & riverside stays" },
  { name: "Igatpuri", tagline: "Foggy mountains & waterfalls" },
  { name: "Mahabaleshwar", tagline: "Strawberry valleys & cottages" },
  { name: "Goa", tagline: "Sun, sand & luxury retreats" },
];

const PRICE_PRESETS = [
  { label: "All Prices", min: null, max: null },
  { label: "Under ₹10,000", min: 0, max: 10000 },
  { label: "₹10,000 – ₹20,000", min: 10000, max: 20000 },
  { label: "₹20,000 – ₹35,000", min: 20000, max: 35000 },
  { label: "Above ₹35,000", min: 35000, max: null },
];

export default function SearchModal() {
  const router = useRouter();
  const {
    destination,
    setDestination,
    guests,
    setGuests,
    priceMin,
    priceMax,
    setPriceRange,
    clearFilters,
  } = useSearch();

  const [localDest, setLocalDest] = useState(destination);
  const [localGuests, setLocalGuests] = useState(guests);
  const [activePriceIdx, setActivePriceIdx] = useState(0);

  const handleApply = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setDestination(localDest);
    setGuests(localGuests);
    const selectedPrice = PRICE_PRESETS[activePriceIdx];
    setPriceRange(selectedPrice.min, selectedPrice.max);

    router.back();
  };

  const handleReset = () => {
    setLocalDest("");
    setLocalGuests(1);
    setActivePriceIdx(0);
    clearFilters();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters & Search</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step 1: Where to? */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Where to?</Text>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search destination, city, or villa name..."
              placeholderTextColor={Colors.textTertiary}
              value={localDest}
              onChangeText={setLocalDest}
            />
            {localDest ? (
              <TouchableOpacity onPress={() => setLocalDest("")}>
                <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Destination Quick Picks */}
          <Text style={styles.quickPicksTitle}>POPULAR DESTINATIONS</Text>
          <View style={styles.destList}>
            {DESTINATIONS.map((dest) => {
              const isSelected = localDest.toLowerCase() === dest.name.toLowerCase();
              return (
                <TouchableOpacity
                  key={dest.name}
                  style={[styles.destItem, isSelected && styles.destItemSelected]}
                  onPress={() => setLocalDest(dest.name)}
                >
                  <View style={styles.destIconBox}>
                    <Ionicons
                      name="location"
                      size={18}
                      color={isSelected ? Colors.primary : Colors.textSecondary}
                    />
                  </View>
                  <View style={styles.destTextBox}>
                    <Text style={[styles.destName, isSelected && styles.destNameSelected]}>
                      {dest.name}
                    </Text>
                    <Text style={styles.destTagline}>{dest.tagline}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Step 2: Who's coming? */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Who's coming?</Text>
          <View style={styles.counterRow}>
            <View>
              <Text style={styles.counterTitle}>Total Guests</Text>
              <Text style={styles.counterSubtitle}>Adults, children, and friends</Text>
            </View>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setLocalGuests(Math.max(1, localGuests - 1))}
              >
                <Ionicons name="remove" size={18} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.stepCount}>{localGuests}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setLocalGuests(localGuests + 1)}
              >
                <Ionicons name="add" size={18} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Step 3: Price Range */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price range per night</Text>
          <View style={styles.priceGrid}>
            {PRICE_PRESETS.map((preset, idx) => {
              const isSelected = activePriceIdx === idx;
              return (
                <TouchableOpacity
                  key={preset.label}
                  style={[styles.priceChip, isSelected && styles.priceChipSelected]}
                  onPress={() => setActivePriceIdx(idx)}
                >
                  <Text
                    style={[
                      styles.priceChipText,
                      isSelected && styles.priceChipTextSelected,
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.footerBar}>
        <TouchableOpacity style={styles.applyBtn} activeOpacity={0.88} onPress={handleApply}>
          <Ionicons name="search" size={18} color="#FFFFFF" />
          <Text style={styles.applyBtnText}>Show Stays</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  resetText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    textDecorationLine: "underline",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
  },
  quickPicksTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 8,
  },
  destList: {
    gap: 8,
  },
  destItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  destItemSelected: {
    backgroundColor: "rgba(255, 90, 31, 0.08)",
    borderColor: "rgba(255, 90, 31, 0.3)",
  },
  destIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cardSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  destTextBox: {
    flex: 1,
  },
  destName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  destNameSelected: {
    color: Colors.primary,
  },
  destTagline: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counterTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  counterSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.cardSecondary,
  },
  stepCount: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    minWidth: 20,
    textAlign: "center",
  },
  priceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  priceChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Colors.cardSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceChipSelected: {
    backgroundColor: "rgba(255, 90, 31, 0.15)",
    borderColor: Colors.primary,
  },
  priceChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  priceChipTextSelected: {
    color: Colors.primary,
    fontWeight: "700",
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
  },
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 26,
  },
  applyBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
