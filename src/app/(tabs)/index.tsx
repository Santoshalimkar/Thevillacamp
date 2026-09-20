import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { SearchHeader } from "../../components/SearchHeader";
import { CategoryBar } from "../../components/CategoryBar";
import { PropertyCard } from "../../components/PropertyCard";
import {
  fetchProperties,
  fetchWeekendProperties,
  PropertyItem,
} from "../../services/propertyService";
import { useSearch } from "../../context/SearchContext";

const POPULAR_DESTINATIONS = [
  "All",
  "Lonavala",
  "Alibaug",
  "Pawna Lake",
  "Karjat",
  "Igatpuri",
  "Mahabaleshwar",
  "Goa",
];

export default function ExploreScreen() {
  const {
    activeCategoryId,
    destination,
    setDestination,
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
        limit: 25,
      });

      if (res?.success && Array.isArray(res.data)) {
        setProperties(res.data);
      } else {
        setProperties([]);
      }

      // Fetch weekend deals on initial load
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

  const handleSelectDestinationTag = (dest: string) => {
    if (dest === "All") {
      setDestination("");
    } else {
      setDestination(dest);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Floating Airbnb Search Pill */}
      <SearchHeader />

      {/* Category Slider */}
      <CategoryBar />

      {/* Quick Destination Chips */}
      <View style={styles.chipsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
          {POPULAR_DESTINATIONS.map((dest) => {
            const isSelected =
              dest === "All" ? !destination : destination.toLowerCase() === dest.toLowerCase();
            return (
              <TouchableOpacity
                key={dest}
                activeOpacity={0.7}
                onPress={() => handleSelectDestinationTag(dest)}
                style={[styles.chip, isSelected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {dest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Feed */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Finding extraordinary stays...</Text>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item, index) => item._id || item.id || `prop-${index}`}
          renderItem={({ item }) => <PropertyCard property={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
                <Ionicons name="search-outline" size={32} color={Colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>No stays match your criteria</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search location, dates, or price filters.
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chipsRow: {
    paddingVertical: 10,
    backgroundColor: Colors.background,
  },
  chipsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 14,
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  clearBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.cardSecondary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  clearBtnText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
});
