import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Colors } from "../../theme/colors";
import { VillaHeader } from "../../components/VillaHeader";
import { PropertyCard } from "../../components/PropertyCard";
import { FloatingMascot } from "../../components/FloatingMascot";
import { fetchProperties, PropertyItem } from "../../services/propertyService";
import { useSearch } from "../../context/SearchContext";

const CATEGORY_CHIPS = [
  { id: "all", name: "All Stays", icon: "sparkles" },
  { id: "villa", name: "Villas", icon: "home" },
  { id: "camping", name: "Camps", icon: "bonfire" },
  { id: "cottage", name: "Cottages", icon: "leaf" },
  { id: "hotel", name: "Hotels", icon: "business" },
];

export default function StaysScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    activeCategoryId,
    setActiveCategoryId,
    destination,
    checkIn,
    checkOut,
    priceMin,
    priceMax,
    clearFilters,
    isFiltered,
  } = useSearch();

  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const searchParam = destination && destination !== "All" ? destination : undefined;
      const res = await fetchProperties({
        categoryId: activeCategoryId || undefined,
        search: searchParam,
        priceMin: priceMin !== null ? priceMin : undefined,
        priceMax: priceMax !== null ? priceMax : undefined,
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
        limit: 30,
      });

      if (res?.success && Array.isArray(res.data)) {
        setProperties(res.data);
      } else {
        setProperties([]);
      }
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategoryId, destination, checkIn, checkOut, priceMin, priceMax]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleOpenFilters = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    router.push("/modal/search" as any);
  };

  const handleOpenMapView = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    router.push("/search-your-gateway" as any);
  };

  const bottomPadding = Math.max(insets.bottom, 10) + 95;

  return (
    <View style={styles.container}>
      {/* 1. Safe Area Top Inset Header with Search Pill */}
      <VillaHeader />

      {/* 2. Category Horizontal Filter Bar */}
      <View style={styles.chipsBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
        >
          {CATEGORY_CHIPS.map((cat) => {
            const isSelected =
              cat.id === "all" ? !activeCategoryId : activeCategoryId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.7}
                onPress={() => setActiveCategoryId(cat.id === "all" ? null : cat.id)}
                style={[styles.chip, isSelected && styles.chipSelected]}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={isSelected ? "#FFFFFF" : "#4B5563"}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Main Property List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching available stays...</Text>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item, index) => item._id || item.id || `stay-${index}`}
          renderItem={({ item }) => <PropertyCard property={item} />}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="search-outline" size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No verified stays found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your filters or searching another destination.
              </Text>
              {isFiltered && (
                <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
                  <Text style={styles.clearBtnText}>Clear all filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* 4. Floating Pill: "Filters 1 | 🗺️ Map View" (Matching Screenshot 1) */}
      <View
        style={[
          styles.floatingBottomPillContainer,
          { bottom: Math.max(insets.bottom, 8) + 68 },
        ]}
      >
        <TouchableOpacity
          style={styles.pillButton}
          activeOpacity={0.85}
          onPress={handleOpenFilters}
        >
          <Text style={styles.pillText}>Filters</Text>
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>1</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.pillDivider} />

        <TouchableOpacity
          style={styles.pillButton}
          activeOpacity={0.85}
          onPress={handleOpenMapView}
        >
          <Ionicons name="map-outline" size={14} color="#FFFFFF" style={{ marginRight: 5 }} />
          <Text style={styles.pillText}>Map View</Text>
        </TouchableOpacity>
      </View>

      {/* Floating AI Concierge Mascot */}
      <FloatingMascot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  chipsBar: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  chipsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipSelected: {
    backgroundColor: "#FF5A1F",
    borderColor: "#FF5A1F",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContent: {
    paddingTop: 12,
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
    padding: 40,
    marginTop: 40,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  clearBtn: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FF5A1F",
  },
  clearBtnText: {
    color: "#FF5A1F",
    fontSize: 13,
    fontWeight: "700",
  },
  floatingBottomPillContainer: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "#111827",
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    zIndex: 100,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  pillButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pillText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  filterBadge: {
    marginLeft: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EA580C",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  pillDivider: {
    width: 1,
    height: 18,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    marginHorizontal: 4,
  },
});
