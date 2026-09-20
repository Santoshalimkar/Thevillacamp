import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../theme/colors";
import { VillaHeader } from "../../components/VillaHeader";
import { ExploreCategories } from "../../components/ExploreCategories";
import { AvailableThisWeekend } from "../../components/home/AvailableThisWeekend";
import { DestinationHighlights } from "../../components/home/DestinationHighlights";
import { TrendingShortsSection } from "../../components/home/TrendingShortsSection";
import { GuestReviewsSection } from "../../components/home/GuestReviewsSection";
import { HostBanner } from "../../components/home/HostBanner";
import { RecentlyVisitedSection } from "../../components/home/RecentlyVisitedSection";
import { TravelClubBanner } from "../../components/home/TravelClubBanner";
import { FloatingMascot } from "../../components/FloatingMascot";
import { fetchProperties, PropertyItem } from "../../services/propertyService";
import { useSearch } from "../../context/SearchContext";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { activeCategoryId, destination, checkIn, checkOut, priceMin, priceMax } = useSearch();

  const [properties, setProperties] = useState<PropertyItem[]>([]);
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
        limit: 10,
      });

      if (res?.success && Array.isArray(res.data)) {
        setProperties(res.data);
      }
    } catch {
      setProperties([]);
    } finally {
      setRefreshing(false);
    }
  }, [activeCategoryId, destination, checkIn, checkOut, priceMin, priceMax]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const bottomPadding = Math.max(insets.bottom, 10) + 85;

  return (
    <View style={styles.screen}>
      {/* 1. Header with Location, Notifications & Booking Search Pill */}
      <VillaHeader />

      {/* 2. Scrollable Body containing all Villa-web Homepage Sections */}
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
        {/* Section 1: Shop by Category Banners */}
        <ExploreCategories />

        {/* Section 2: Available This Weekend with Category Tabs (Screenshot 1) */}
        <AvailableThisWeekend />

        {/* Section 3: Choose Your Destination with Map Navigation (Screenshot 2) */}
        <DestinationHighlights />

        {/* Section 4: Trending Videos & Shorts (Screenshot 3) */}
        <TrendingShortsSection />

        {/* Section 5: Loved by Our Guests Reviews (Screenshot 4) */}
        <GuestReviewsSection />

        {/* Section 6: Host Recruitment Banner (Screenshot 5) */}
        <HostBanner />

        {/* Section 7: Recently Visited Properties (Screenshot 5) */}
        <RecentlyVisitedSection properties={properties} />

        {/* Section 8: Secret Weekend Deals & Travel Club (Screenshot 5) */}
        <TravelClubBanner />
      </ScrollView>

      {/* 3. Floating AI Concierge Mascot with Green Online Indicator */}
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
});
