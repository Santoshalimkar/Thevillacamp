import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../theme/colors";
import { VillaHeader } from "../../components/VillaHeader";
import { VillaHero } from "../../components/VillaHero";
import { ExploreCategories } from "../../components/ExploreCategories";
import { PropertyCard } from "../../components/PropertyCard";
import { FloatingMascot } from "../../components/FloatingMascot";
import {
  fetchProperties,
  fetchWeekendProperties,
  PropertyItem,
} from "../../services/propertyService";
import { useSearch } from "../../context/SearchContext";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    activeCategoryId,
    destination,
    checkIn,
    checkOut,
    priceMin,
    priceMax,
    clearFilters,
    isFiltered,
  } = useSearch();

  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [weekendStays, setWeekendStays] = useState<PropertyItem[]>([]);
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
        limit: 15,
      });

      if (res?.success && Array.isArray(res.data)) {
        setProperties(res.data);
      } else {
        setProperties([]);
      }

      // Fetch weekend deals
      const weekendRes = await fetchWeekendProperties(activeCategoryId || undefined);
      if (weekendRes?.success && Array.isArray(weekendRes.data)) {
        setWeekendStays(weekendRes.data.slice(0, 4));
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

  const bottomPadding = Math.max(insets.bottom, 10) + 85;

  return (
    <View style={styles.screen}>
      {/* 1. Top Location Bar & Floating Search Pill with Safe Area Inset */}
      <VillaHeader />

      {/* 2. Scrollable Body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* 3. Hero Section matching Villa-web Hero.js & mobile screenshot */}
        <VillaHero />

        {/* 4. Explore by Categories Section matching Villa-web */}
        <ExploreCategories />

        {/* 5. Featured Stays Feed */}
        <View style={styles.sectionHeader}>
          <View>
            <View style={styles.sectionBadge}>
              <Ionicons name="sparkles" size={11} color="#FF5A1F" style={{ marginRight: 3 }} />
              <Text style={styles.sectionBadgeText}>TOP RATED EXPERIENCES</Text>
            </View>
            <Text style={styles.sectionTitle}>
              Featured <Text style={{ color: Colors.primary }}>Verified Stays</Text>
            </Text>
          </View>

          {isFiltered && (
            <TouchableOpacity onPress={clearFilters} style={styles.resetPill}>
              <Text style={styles.resetPillText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Curating extraordinary stays...</Text>
          </View>
        ) : properties.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="search-outline" size={32} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No stays match your criteria</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search location, dates, or category filters.
            </Text>
            {isFiltered && (
              <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
                <Text style={styles.clearBtnText}>Clear all filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.feedList}>
            {properties.map((item, index) => (
              <PropertyCard
                key={item._id || item.id || `home-stay-${index}`}
                property={item}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* 6. Floating AI Mascot Avatar with Green Online Status Dot */}
      <FloatingMascot />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    backgroundColor: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  sectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FF5A1F",
    letterSpacing: 0.6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  resetPill: {
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FF5A1F",
  },
  resetPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF5A1F",
  },
  feedList: {
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: "center",
    justifyContent: "center",
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
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F9FAFB",
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
});
