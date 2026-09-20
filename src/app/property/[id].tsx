import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Share,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Colors } from "../../theme/colors";
import { fetchPropertyById, PropertyItem } from "../../services/propertyService";
import { useWishlist } from "../../context/WishlistContext";
import { FloatingMascot } from "../../components/FloatingMascot";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = 270;

const DETAIL_TABS = [
  { id: "highlights", label: "Highlights" },
  { id: "events", label: "Events", isLive: true },
  { id: "refund", label: "Refund Policy" },
  { id: "spaces", label: "Spaces" },
  { id: "reviews", label: "Reviews" },
  { id: "amenities", label: "Amenities" },
  { id: "meals", label: "Meals" },
  { id: "location", label: "Location" },
];

export default function PropertyDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, categoryId } = useLocalSearchParams<{ id: string; categoryId?: string }>();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [property, setProperty] = useState<PropertyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("highlights");

  const propId = property?._id || property?.id;
  const wishlisted = propId ? isWishlisted(propId) : false;

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  const loadProperty = async () => {
    try {
      const res = await fetchPropertyById(id as string, categoryId as string);
      if (res?.success && res.data) {
        setProperty(res.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${property?.name || "this luxury villa"} on The Villa & Camp: https://thevillacamp.com/view-Villa/${id}`,
      });
    } catch {}
  };

  const handleSelectDates = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    router.push({
      pathname: "/booking/[id]",
      params: { id: id as string, categoryId: categoryId || "" },
    } as any);
  };

  const handleViewBrochure = () => {
    Alert.alert(
      "Digital Brochure",
      `The luxury brochure for ${property?.name || "this property"} is ready. You will receive it via WhatsApp and email on reservation.`,
      [{ text: "OK" }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5A1F" />
        <Text style={styles.loadingText}>Fetching luxury details...</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundTitle}>Stay Not Found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const photos =
    Array.isArray(property.images) && property.images.length > 0
      ? property.images
      : property.propertyImage
      ? [property.propertyImage]
      : ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800"];

  const basePrice: number =
    typeof property.pricing?.weekdayPrice === "number"
      ? property.pricing.weekdayPrice
      : typeof property.price === "number"
      ? property.price
      : typeof property.basePrice === "number"
      ? property.basePrice
      : typeof property.pricing?.basePrice === "number"
      ? property.pricing.basePrice
      : 70000;

  const originalPrice = Math.round(basePrice * 1.25);

  const cityName = property.address?.city || property.city || "Lonavala";
  const addressLine = property.address?.addressLine || "Malavli";
  const maxGuests = property.maxCapacity || property.maxGuests || 8;
  const roomsCount = property.rooms || property.bedrooms || 2;
  const bathsCount = property.baths != null ? property.baths : 2;
  const ratingScore = property.averageRating || property.rating || 5.0;
  const reviewsCount = property.totalReviews || property.reviewCount || 1;

  return (
    <View style={styles.screenContainer}>
      {/* ========================================================================= */}
      {/* 1. TOP HEADER (Matching VillaHeader.js from Screenshot 2)                 */}
      {/* ========================================================================= */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 10) }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backIconBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {property.name || "Vastalya Villa"}
            </Text>
            <Text style={styles.headerBullet}>•</Text>
            <Text style={styles.headerCity} numberOfLines={1}>
              {cityName}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={20} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.push("/(tabs)/profile" as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color="#374151" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerAvatarBtn}
            onPress={() => router.push("/(tabs)/profile" as any)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#FF8533", "#FF5A1F"]}
              style={styles.headerAvatarGradient}
            >
              <Ionicons name="person" size={15} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 10) + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================================= */}
        {/* 2. HERO CAROUSEL (Matching VillaHero.js from Screenshot 2)                */}
        {/* ========================================================================= */}
        <View style={styles.heroContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActivePhotoIdx(idx);
            }}
          >
            {photos.map((photo, i) => (
              <Image key={i} source={{ uri: photo }} style={styles.heroImage} contentFit="cover" />
            ))}
          </ScrollView>

          {/* Top-Left: "★ Popular" Badge */}
          <View style={styles.popularBadge}>
            <Ionicons name="star" size={12} color="#F59E0B" style={{ marginRight: 4 }} />
            <Text style={styles.popularBadgeText}>Popular</Text>
          </View>

          {/* Top-Right: Wishlist Heart Button */}
          <TouchableOpacity
            style={styles.heroHeartBtn}
            onPress={() => toggleWishlist(property)}
            activeOpacity={0.85}
          >
            <Ionicons
              name={wishlisted ? "heart" : "heart-outline"}
              size={20}
              color={wishlisted ? "#EF4444" : "#1F2937"}
            />
          </TouchableOpacity>

          {/* Bottom-Right: "View Photos" & "▶ Video" Action Buttons */}
          <View style={styles.heroBottomActions}>
            <TouchableOpacity
              style={styles.heroPillBtn}
              activeOpacity={0.85}
              onPress={() => {}}
            >
              <Text style={styles.heroPillText}>View Photos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroPillBtn}
              activeOpacity={0.85}
              onPress={() => router.push("/(tabs)/shorts" as any)}
            >
              <Ionicons name="play" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.heroPillText}>Video</Text>
            </TouchableOpacity>
          </View>

          {/* Centered Dots Indicator */}
          {photos.length > 1 && (
            <View style={styles.heroDotsContainer}>
              {photos.slice(0, 8).map((_, idx) => (
                <View
                  key={`hdot-${idx}`}
                  style={[
                    styles.heroDot,
                    activePhotoIdx === idx ? styles.heroDotActive : styles.heroDotInactive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* 3. DETAILS & BROCHURE SECTION (Matching VillaDetails.js Screenshot 2)     */}
        {/* ========================================================================= */}
        <View style={styles.detailsContainer}>
          {/* Title & View Brochure Button */}
          <View style={styles.titleBrochureRow}>
            <View style={styles.titleTextBlock}>
              <Text style={styles.detailTitle}>
                {property.name || "Vastalya Villa"} - {addressLine}
              </Text>
              <Text style={styles.detailLocation}>
                {addressLine}, {cityName}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.brochureButton}
              activeOpacity={0.8}
              onPress={handleViewBrochure}
            >
              <Ionicons name="document-text-outline" size={14} color="#FF5A1F" style={{ marginRight: 4 }} />
              <Text style={styles.brochureText}>View Brochure</Text>
            </TouchableOpacity>
          </View>

          {/* Rating and Reviews Row */}
          <View style={styles.ratingReviewsRow}>
            <View style={styles.guestFavPill}>
              <Text style={styles.guestFavText}>Guest Favourite</Text>
            </View>

            <View style={styles.starScoreRow}>
              <Ionicons name="star" size={15} color="#F59E0B" style={{ marginRight: 3 }} />
              <Text style={styles.starScoreText}>{ratingScore}</Text>
              <Text style={styles.starOutOfText}> / 5</Text>
            </View>

            <TouchableOpacity activeOpacity={0.7} onPress={() => setActiveTab("reviews")}>
              <Text style={styles.reviewsLink}>{reviewsCount} Reviews</Text>
            </TouchableOpacity>
          </View>

          {/* 3 Key Spec Cards (Guests, Rooms, Baths) */}
          <View style={styles.specCardsRow}>
            <View style={styles.specCard}>
              <Ionicons name="people-outline" size={18} color="#FF5A1F" style={{ marginRight: 6 }} />
              <Text style={styles.specCardText}>Up to {maxGuests} Guests</Text>
            </View>

            <View style={styles.specCard}>
              <Ionicons name="bed-outline" size={18} color="#FF5A1F" style={{ marginRight: 6 }} />
              <Text style={styles.specCardText}>{roomsCount} Rooms</Text>
            </View>

            <View style={styles.specCard}>
              <Ionicons name="water-outline" size={18} color="#FF5A1F" style={{ marginRight: 6 }} />
              <Text style={styles.specCardText}>{bathsCount} Baths</Text>
            </View>
          </View>

          {/* Great For Tag */}
          <View style={styles.greatForDetailRow}>
            <Text style={styles.greatForDetailLabel}>Great for:</Text>
            <View style={styles.greatForDetailPill}>
              <Ionicons name="people" size={13} color="#059669" style={{ marginRight: 4 }} />
              <Text style={styles.greatForDetailText}>Ideal for Families</Text>
            </View>
          </View>

          {/* 5-Column Amenities Square Icons Row */}
          <View style={styles.amenitiesGridDetail}>
            <View style={styles.amenityBoxCol}>
              <View style={styles.amenitySquare}>
                <MaterialCommunityIcons name="air-conditioner" size={22} color="#FF5A1F" />
              </View>
              <Text style={styles.amenityBoxLabel} numberOfLines={1}>AC</Text>
            </View>

            <View style={styles.amenityBoxCol}>
              <View style={styles.amenitySquare}>
                <Ionicons name="battery-charging-outline" size={22} color="#FF5A1F" />
              </View>
              <Text style={styles.amenityBoxLabel} numberOfLines={1}>Power Backup</Text>
            </View>

            <View style={styles.amenityBoxCol}>
              <View style={styles.amenitySquare}>
                <MaterialCommunityIcons name="pool" size={22} color="#FF5A1F" />
              </View>
              <Text style={styles.amenityBoxLabel} numberOfLines={1}>Swimming Pool</Text>
            </View>

            <View style={styles.amenityBoxCol}>
              <View style={styles.amenitySquare}>
                <Ionicons name="volume-high-outline" size={22} color="#FF5A1F" />
              </View>
              <Text style={styles.amenityBoxLabel} numberOfLines={1}>Sound System</Text>
            </View>

            <View style={styles.amenityBoxCol}>
              <View style={styles.amenitySquare}>
                <MaterialCommunityIcons name="flower" size={22} color="#FF5A1F" />
              </View>
              <Text style={styles.amenityBoxLabel} numberOfLines={1}>Garden</Text>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 4. HORIZONTAL STICKY TABS (Matching StickyTabs.js from Screenshot 2)       */}
        {/* ========================================================================= */}
        <View style={styles.tabsBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {DETAIL_TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              if (tab.isLive) {
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={styles.liveEventTab}
                    onPress={() => setActiveTab(tab.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.livePulseDot} />
                    <Text style={styles.liveEventText}>Events</Text>
                    <View style={styles.liveTagBadge}>
                      <Text style={styles.liveTagText}>LIVE</Text>
                    </View>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.standardTab, isSelected && styles.standardTabSelected]}
                  onPress={() => setActiveTab(tab.id)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ========================================================================= */}
        {/* 5. TAB CONTENT SECTIONS (Matching AllTabsContent.js from villa-web)       */}
        {/* ========================================================================= */}
        <View style={styles.tabContentContainer}>
          {/* Title Header with Vertical Orange Bar */}
          <View style={styles.experienceHeader}>
            <View style={styles.orangeBar} />
            <Text style={styles.experienceTitle}>The Villacamp Experience</Text>
          </View>

          <Text style={styles.experienceBody}>
            {property.description ||
              "Indulge in secluded luxury with panoramic valley views, private crystal swimming pool, plush living areas, private lush lawn, and 24/7 personalized concierge service with in-house chef options."}
          </Text>

          {/* Highlights Features List */}
          <View style={styles.featureHighlights}>
            <View style={styles.featureItem}>
              <Ionicons name="sparkles-sharp" size={16} color="#FF5A1F" style={{ marginRight: 8 }} />
              <Text style={styles.featureItemText}>100% Verified Private Property</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={16} color="#FF5A1F" style={{ marginRight: 8 }} />
              <Text style={styles.featureItemText}>Caretaker & Housekeeping On-Site</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="wifi" size={16} color="#FF5A1F" style={{ marginRight: 8 }} />
              <Text style={styles.featureItemText}>Ultra-Fast High Speed Optical Wi-Fi</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="time" size={16} color="#FF5A1F" style={{ marginRight: 8 }} />
              <Text style={styles.featureItemText}>Check-in: 2:00 PM • Checkout: 11:00 AM</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ========================================================================= */}
      {/* 6. FIXED BOTTOM BOOKING BAR (Matching FixedBookingBar.js Screenshot 2)    */}
      {/* ========================================================================= */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.bottomLeft}>
          <View style={styles.bottomPriceRow}>
            <Text style={styles.bottomPrice}>₹{basePrice.toLocaleString("en-IN")}</Text>
            <Text style={styles.bottomStrikethrough}>₹{originalPrice.toLocaleString("en-IN")}</Text>
          </View>

          <View style={styles.guestsEditRow}>
            <Text style={styles.guestsCountText}>{maxGuests} Guests</Text>
            <Ionicons name="pencil" size={12} color="#FF5A1F" style={{ marginHorizontal: 4 }} />
            <Text style={styles.taxSubText}>• night + taxes</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.selectDatesButton}
          activeOpacity={0.9}
          onPress={handleSelectDates}
        >
          <LinearGradient
            colors={["#FF5A1F", "#EA580C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.selectDatesGradient}
          >
            <Text style={styles.selectDatesText}>Select Dates</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Floating AI Mascot */}
      <FloatingMascot />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    color: "#4B5563",
    fontSize: 13,
    marginTop: 12,
    fontWeight: "600",
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#FFFFFF",
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: "#FF5A1F",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    zIndex: 50,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  backIconBtn: {
    padding: 6,
    marginRight: 4,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    flexShrink: 1,
  },
  headerBullet: {
    fontSize: 12,
    color: "#9CA3AF",
    marginHorizontal: 4,
  },
  headerCity: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerIconBtn: {
    padding: 6,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF5A1F",
  },
  headerAvatarBtn: {
    marginLeft: 4,
  },
  headerAvatarGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    backgroundColor: "#FFFFFF",
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    backgroundColor: "#F3F4F6",
    position: "relative",
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
  popularBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1F2937",
  },
  heroHeartBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  heroBottomActions: {
    position: "absolute",
    bottom: 22,
    right: 12,
    flexDirection: "row",
    gap: 8,
    zIndex: 10,
  },
  heroPillBtn: {
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  heroPillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  heroDotsContainer: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    flexDirection: "row",
    gap: 5,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  heroDot: {
    height: 4,
    borderRadius: 2,
  },
  heroDotActive: {
    width: 14,
    backgroundColor: "#FFFFFF",
  },
  heroDotInactive: {
    width: 4,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  detailsContainer: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  titleBrochureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  titleTextBlock: {
    flex: 1,
    marginRight: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  detailLocation: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 2,
  },
  brochureButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF5A1F",
    backgroundColor: "#FFF7ED",
  },
  brochureText: {
    color: "#FF5A1F",
    fontSize: 11,
    fontWeight: "700",
  },
  ratingReviewsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  guestFavPill: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 14,
  },
  guestFavText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#C2410C",
  },
  starScoreRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  starScoreText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  starOutOfText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  reviewsLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF5A1F",
    textDecorationLine: "underline",
  },
  specCardsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  specCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 8,
    borderRadius: 10,
  },
  specCardText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },
  greatForDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  greatForDetailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  greatForDetailPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 0.5,
    borderColor: "#A7F3D0",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 14,
  },
  greatForDetailText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#065F46",
  },
  amenitiesGridDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  amenityBoxCol: {
    alignItems: "center",
    flex: 1,
  },
  amenitySquare: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  amenityBoxLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#4B5563",
    textAlign: "center",
  },
  tabsBar: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  tabsContent: {
    paddingHorizontal: 12,
    gap: 4,
    alignItems: "center",
  },
  standardTab: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  standardTabSelected: {
    borderBottomColor: "#FF5A1F",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextSelected: {
    color: "#FF5A1F",
    fontWeight: "800",
  },
  liveEventTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FF5A1F",
    backgroundColor: "#FFF7ED",
    marginHorizontal: 4,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
    marginRight: 5,
  },
  liveEventText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#C2410C",
  },
  liveTagBadge: {
    marginLeft: 4,
    backgroundColor: "#EF4444",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  liveTagText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  tabContentContainer: {
    padding: 14,
  },
  experienceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  orangeBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: "#FF5A1F",
    marginRight: 8,
  },
  experienceTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  experienceBody: {
    fontSize: 13,
    lineHeight: 20,
    color: "#4B5563",
    marginBottom: 16,
  },
  featureHighlights: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureItemText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  bottomLeft: {
    justifyContent: "center",
  },
  bottomPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.5,
  },
  bottomStrikethrough: {
    fontSize: 12,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
    marginLeft: 6,
  },
  guestsEditRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  guestsCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  taxSubText: {
    fontSize: 11,
    color: "#6B7280",
  },
  selectDatesButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  selectDatesGradient: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectDatesText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
