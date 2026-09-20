import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Colors } from "../../theme/colors";
import { useSearch } from "../../context/SearchContext";
import { HolidayService, HolidayQuickCard } from "../../services/holidayService";
import { SearchInputCard } from "../../components/search/SearchInputCard";
import { HolidayCard } from "../../components/search/HolidayCard";
import { StayTypeDrawer } from "../../components/search/StayTypeDrawer";
import { GuestDrawer } from "../../components/search/GuestDrawer";
import { DatePickerModal } from "../../components/search/DatePickerModal";

const STAY_IMAGES: Record<string, any> = {
  villa: require("../../../assets/brand/Villaimg.png"),
  camping: require("../../../assets/brand/Campimg.png"),
  cottage: require("../../../assets/brand/Cottageimg.png"),
  hotel: require("../../../assets/brand/Hotelimg.png"),
};

export default function SearchModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    stayType,
    stayTypeName,
    setStayType,
    checkIn,
    checkOut,
    setDates,
    numberOfNights,
    dateDisplay,
    selectedGuest,
    updateGuestCount,
    setIsGuestSelected,
    guestSummary,
    totalGuests,
    resetAllFilters,
  } = useSearch();

  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isGuestDrawerOpen, setIsGuestDrawerOpen] = useState(false);

  // Quick holiday cards
  const upcomingHolidayCards = useMemo(() => {
    return HolidayService.getUpcomingQuickCards();
  }, []);

  const handleSelectHolidayCard = async (card: HolidayQuickCard) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    // If already selected, toggle off
    if (checkIn === card.startDate && checkOut === card.endDate) {
      setDates(null, null);
    } else {
      setDates(card.startDate, card.endDate);
    }
  };

  const handleReset = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    resetAllFilters();
  };

  const handleSearch = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    router.push("/(tabs)/stays");
  };

  const handleCallConcierge = () => {
    Linking.openURL("tel:+918669186483");
  };

  const topInset = Math.max(insets.top, 10);
  const bottomInset = Math.max(insets.bottom, 12);

  const currentStayImage = STAY_IMAGES[stayType.toLowerCase()] || STAY_IMAGES.villa;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Search your Stay</Text>
            <Text style={styles.headerSubtitle}>Personalize dates, guests & stay type</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
          <Ionicons name="refresh" size={14} color="#6B7280" style={{ marginRight: 4 }} />
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 120 + bottomInset },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: STAY TYPE */}
        <SearchInputCard
          icon={
            <Image source={currentStayImage} style={styles.stayTypeIcon} resizeMode="contain" />
          }
          label="STAY TYPE"
          value={stayTypeName || "Villa"}
          subtitle="Villas, Campings, Cottages & Hotels"
          onPress={() => setIsCategoryDrawerOpen(true)}
        />

        {/* Card 2: DATES */}
        <SearchInputCard
          icon={
            <Ionicons name="calendar" size={20} color={Colors.primary} />
          }
          label="DATES"
          value={dateDisplay}
          subtitle={
            numberOfNights > 0
              ? `${numberOfNights} Night${numberOfNights > 1 ? "s" : ""} selected`
              : "Flexible or custom weekend dates"
          }
          badge={numberOfNights > 0 ? `${numberOfNights} Nights` : null}
          onPress={() => setIsDateModalOpen(true)}
        />

        {/* Card 3: Upcoming Indian Holidays & Long Weekends Strip */}
        {upcomingHolidayCards.length > 0 && (
          <View style={styles.holidaysSection}>
            <View style={styles.holidaysHeader}>
              <View style={styles.holidaysTitleRow}>
                <Ionicons name="sparkles" size={15} color="#D97706" style={{ marginRight: 5 }} />
                <Text style={styles.holidaysTitle}>
                  Upcoming Indian Holidays & Long Weekends
                </Text>
              </View>
              <View style={styles.tapPill}>
                <Text style={styles.tapPillText}>Tap to select</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.holidaysScroll}
            >
              {upcomingHolidayCards.map((card) => {
                const isSelected =
                  checkIn === card.startDate && checkOut === card.endDate;

                return (
                  <HolidayCard
                    key={card.id}
                    name={card.name}
                    totalDays={card.totalDays}
                    dateRange={card.dateRange}
                    isSelected={isSelected}
                    onPress={() => handleSelectHolidayCard(card)}
                  />
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Card 4: TOTAL GUESTS */}
        <SearchInputCard
          icon={
            <Ionicons name="people" size={20} color={Colors.primary} />
          }
          label="TOTAL GUESTS"
          value={guestSummary}
          subtitle="Adults, children, infants & pets"
          onPress={() => setIsGuestDrawerOpen(true)}
        />

        {/* Search Stays CTA Button */}
        <View style={styles.ctaWrapper}>
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.88}>
            <Ionicons name="search" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.searchBtnText}>SEARCH STAYS</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Support Section */}
        <View style={styles.footerSection}>
          <Text style={styles.footerHelpText}>
            Finding your ideal vacation spot should be easy, we're here to help!
          </Text>

          <TouchableOpacity
            style={styles.conciergeBtn}
            onPress={handleCallConcierge}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={14} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.conciergeBtnText}>Talk to Booking Concierge</Text>
          </TouchableOpacity>

          <Text style={styles.footerDomain}>www.thevillacamp.com</Text>
        </View>
      </ScrollView>

      {/* Drawer: Choose Stay Type */}
      <StayTypeDrawer
        visible={isCategoryDrawerOpen}
        selectedId={stayType}
        onSelect={(id, name) => setStayType(id, name)}
        onClose={() => setIsCategoryDrawerOpen(false)}
      />

      {/* Drawer: Who's Coming? */}
      <GuestDrawer
        visible={isGuestDrawerOpen}
        guests={selectedGuest}
        onUpdate={(type, val) => updateGuestCount(type, val)}
        onConfirm={() => setIsGuestSelected(true)}
        onClose={() => setIsGuestDrawerOpen(false)}
      />

      {/* Modal: Select Stay Dates */}
      <DatePickerModal
        visible={isDateModalOpen}
        initialCheckIn={checkIn}
        initialCheckOut={checkOut}
        onApply={(inDate, outDate) => setDates(inDate, outDate)}
        onClose={() => setIsDateModalOpen(false)}
      />
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
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 22,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 1,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  resetText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  stayTypeIcon: {
    width: 28,
    height: 28,
  },
  holidaysSection: {
    backgroundColor: "#FFFBEB",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  holidaysHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  holidaysTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },
  holidaysTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#78350F",
  },
  tapPill: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tapPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#B45309",
  },
  holidaysScroll: {
    paddingRight: 4,
  },
  ctaWrapper: {
    marginTop: 4,
  },
  searchBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  searchBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  footerSection: {
    alignItems: "center",
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerHelpText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 12,
  },
  conciergeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  conciergeBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.primary,
  },
  footerDomain: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    marginTop: 10,
  },
});
