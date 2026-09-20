import React, { useEffect, useState } from "react";
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
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Colors } from "../../theme/colors";
import {
  fetchPropertyById,
  PropertyItem,
} from "../../services/propertyService";
import { useWishlist } from "../../context/WishlistContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = 300;

export default function PropertyDetailScreen() {
  const router = useRouter();
  const { id, categoryId } = useLocalSearchParams<{ id: string; categoryId?: string }>();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [property, setProperty] = useState<PropertyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

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
        message: `Check out ${property?.name || "this amazing villa"} on The Villa & Camp! https://thevillacamp.com/view-Villa/${id}`,
      });
    } catch {}
  };

  const handleReserve = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    router.push({
      pathname: "/booking/[id]",
      params: { id: id as string, categoryId: categoryId || "" },
    } as any);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading villa details...</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundTitle}>Property Not Found</Text>
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

  const price =
    property.price ||
    property.basePrice ||
    property.pricing?.basePrice ||
    14000;

  const amenitiesList = [
    { icon: "water-outline", label: "Private Swimming Pool" },
    { icon: "wifi-outline", label: "High Speed Wi-Fi" },
    { icon: "snow-outline", label: "Air Conditioning" },
    { icon: "restaurant-outline", label: "Kitchen & Private Chef Available" },
    { icon: "car-outline", label: "Free Private Parking" },
    { icon: "flame-outline", label: "Bonfire & BBQ Setup" },
    { icon: "shield-checkmark-outline", label: "24/7 Caretaker & Security" },
    { icon: "tv-outline", label: "Smart TV & Sound System" },
  ];

  return (
    <View style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Photo Carousel */}
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

          {/* Floating Navigation Controls */}
          <SafeAreaView style={styles.heroNavRow}>
            <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.heroRightActions}>
              <TouchableOpacity style={styles.circleBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.circleBtn}
                onPress={() => property && toggleWishlist(property)}
              >
                <Ionicons
                  name={wishlisted ? "heart" : "heart-outline"}
                  size={22}
                  color={wishlisted ? Colors.heartRed : "#FFFFFF"}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Pagination Counter Badge */}
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {activePhotoIdx + 1} / {photos.length}
            </Text>
          </View>
        </View>

        {/* Content Details */}
        <View style={styles.detailsContent}>
          {/* Title & Rating */}
          <View style={styles.headerBlock}>
            <Text style={styles.propertyTitle}>{property.name || property.title}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={15} color={Colors.ratingGold} />
              <Text style={styles.ratingScore}>
                {(property.rating || 4.92).toFixed(2)}
              </Text>
              <Text style={styles.ratingDot}>•</Text>
              <Text style={styles.ratingReviews}>
                {property.reviewCount || 28} reviews
              </Text>
              <Text style={styles.ratingDot}>•</Text>
              <Text style={styles.locationText}>
                {property.address?.city || property.city || "Maharashtra"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Key Specs Bar */}
          <View style={styles.specsRow}>
            <View style={styles.specItem}>
              <Ionicons name="people-outline" size={20} color={Colors.primary} />
              <Text style={styles.specLabel}>{property.maxGuests || 12} Guests</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="bed-outline" size={20} color={Colors.primary} />
              <Text style={styles.specLabel}>{property.bhkType || "4 Bedrooms"}</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="water-outline" size={20} color={Colors.primary} />
              <Text style={styles.specLabel}>Private Pool</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Host Card */}
          <View style={styles.hostCard}>
            <View style={styles.hostAvatar}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.primary} />
            </View>
            <View style={styles.hostInfo}>
              <Text style={styles.hostName}>The Villa & Camp Verified Host</Text>
              <Text style={styles.hostBadge}>Superhost • 100% Verified Quality</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this place</Text>
            <Text style={styles.descriptionText}>
              {property.description ||
                "Escape the city hustle into this ultra-luxurious private sanctuary. Enjoy panoramic nature views, a temperature-controlled swimming pool, plush living areas, private lawns, and mouth-watering customized meals prepared by our in-house chef."}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Amenities Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What this place offers</Text>
            <View style={styles.amenitiesGrid}>
              {amenitiesList.map((item, idx) => (
                <View key={idx} style={styles.amenityRow}>
                  <Ionicons name={item.icon as any} size={22} color={Colors.textSecondary} />
                  <Text style={styles.amenityLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* House Rules */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Things to know</Text>
            <View style={styles.rulesList}>
              <View style={styles.ruleItem}>
                <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.ruleText}>Check-in: 2:00 PM • Checkout: 11:00 AM</Text>
              </View>
              <View style={styles.ruleItem}>
                <Ionicons name="paw-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.ruleText}>Pet-friendly with advance notice</Text>
              </View>
              <View style={styles.ruleItem}>
                <Ionicons name="volume-mute-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.ruleText}>Quiet hours after 10:00 PM</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceBlock}>
          <View style={styles.bottomPriceRow}>
            <Text style={styles.bottomPriceAmount}>₹{price.toLocaleString("en-IN")}</Text>
            <Text style={styles.bottomPriceNight}> / night</Text>
          </View>
          <Text style={styles.bottomPriceTaxes}>Taxes & fees included</Text>
        </View>

        <TouchableOpacity
          style={styles.reserveBtn}
          activeOpacity={0.88}
          onPress={handleReserve}
        >
          <Text style={styles.reserveBtnText}>Reserve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  backBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    position: "relative",
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
  heroNavRow: {
    position: "absolute",
    top: Platform.OS === "ios" ? 10 : 20,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroRightActions: {
    flexDirection: "row",
    gap: 10,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(10, 11, 14, 0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  counterBadge: {
    position: "absolute",
    bottom: 14,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  detailsContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  headerBlock: {
    marginBottom: 14,
  },
  propertyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  ratingScore: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    marginLeft: 4,
  },
  ratingDot: {
    color: Colors.textTertiary,
    marginHorizontal: 6,
  },
  ratingReviews: {
    fontSize: 13,
    color: Colors.textSecondary,
    textDecorationLine: "underline",
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 18,
  },
  specsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.card,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  specItem: {
    alignItems: "center",
    gap: 4,
  },
  specLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },
  hostCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 90, 31, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 90, 31, 0.3)",
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  hostBadge: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  amenitiesGrid: {
    gap: 14,
  },
  amenityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  amenityLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  rulesList: {
    gap: 12,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ruleText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomPriceBlock: {
    flex: 1,
  },
  bottomPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  bottomPriceAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
  },
  bottomPriceNight: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bottomPriceTaxes: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  reserveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 26,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  reserveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
