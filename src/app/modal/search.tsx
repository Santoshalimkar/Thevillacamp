import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
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
    clearFilters();
    setLocalDest("");
    setLocalGuests(2);
    setActivePriceIdx(0);
  };

  const bottomInset = Math.max(insets.bottom, 12);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters & Search</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 1: Where to? */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Where to?</Text>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={18} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search destination, city, or villa name..."
              placeholderTextColor="#9CA3AF"
              value={localDest}
              onChangeText={setLocalDest}
            />
            {localDest ? (
              <TouchableOpacity onPress={() => setLocalDest("")}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
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
                  activeOpacity={0.7}
                  onPress={() => setLocalDest(dest.name)}
                >
                  <View style={styles.destIconWrapper}>
                    <Ionicons
                      name="location-sharp"
                      size={18}
                      color={isSelected ? Colors.primary : "#9CA3AF"}
                    />
                  </View>
                  <View style={styles.destTextWrapper}>
                    <Text
                      style={[styles.destName, isSelected && styles.destNameSelected]}
                    >
                      {dest.name}
                    </Text>
                    <Text style={styles.destTagline}>{dest.tagline}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Step 2: Who is coming? */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Who is coming?</Text>
          <View style={styles.counterRow}>
            <View>
              <Text style={styles.counterLabel}>Guests</Text>
              <Text style={styles.counterHint}>Ages 13 or above</Text>
            </View>
            <View style={styles.counterButtons}>
              <TouchableOpacity
                style={[styles.counterBtn, localGuests <= 1 && styles.counterBtnDisabled]}
                disabled={localGuests <= 1}
                onPress={() => setLocalGuests((g) => Math.max(1, g - 1))}
              >
                <Ionicons
                  name="remove"
                  size={18}
                  color={localGuests <= 1 ? "#D1D5DB" : "#111827"}
                />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{localGuests}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setLocalGuests((g) => Math.min(30, g + 1))}
              >
                <Ionicons name="add" size={18} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Step 3: Price Range */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price per night</Text>
          <View style={styles.priceChipsGrid}>
            {PRICE_PRESETS.map((preset, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.priceChip,
                  activePriceIdx === idx && styles.priceChipSelected,
                ]}
                onPress={() => setActivePriceIdx(idx)}
              >
                <Text
                  style={[
                    styles.priceChipText,
                    activePriceIdx === idx && styles.priceChipTextSelected,
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Apply Bar */}
      <View style={[styles.footerBar, { paddingBottom: bottomInset + 8 }]}>
        <TouchableOpacity style={styles.applyBtn} activeOpacity={0.88} onPress={handleApply}>
          <Ionicons name="search" size={18} color="#FFFFFF" />
          <Text style={styles.applyBtnText}>Search Stays</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  resetText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 14,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
  },
  quickPicksTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#9CA3AF",
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 10,
  },
  destList: {
    gap: 8,
  },
  destItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  destItemSelected: {
    backgroundColor: "#FFF7ED",
    borderColor: Colors.primary,
  },
  destIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  destTextWrapper: {
    flex: 1,
  },
  destName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  destNameSelected: {
    color: Colors.primary,
  },
  destTagline: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 1,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counterLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  counterHint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  counterButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  counterBtnDisabled: {
    borderColor: "#E5E7EB",
    backgroundColor: "#F3F4F6",
  },
  counterValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    minWidth: 20,
    textAlign: "center",
  },
  priceChipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  priceChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  priceChipSelected: {
    backgroundColor: "#FFF7ED",
    borderColor: Colors.primary,
  },
  priceChipText: {
    fontSize: 12,
    color: "#4B5563",
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
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingTop: 12,
    elevation: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
    }),
  },
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: 26,
  },
  applyBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
