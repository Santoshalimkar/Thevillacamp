import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  Share,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Colors } from "../theme/colors";
import { PropertyItem } from "../services/propertyService";
import { useWishlist } from "../context/WishlistContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_MARGIN = 12;
const CARD_WIDTH = SCREEN_WIDTH - CARD_MARGIN * 2;
const IMAGE_HEIGHT = 220;

interface PropertyCardProps {
  property: PropertyItem;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const router = useRouter();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const id = property._id || property.id;
  const wishlisted = id ? isWishlisted(id) : false;

  // Extract photos list
  const photos = (() => {
    if (Array.isArray(property.images) && property.images.length > 0) {
      return property.images;
    }
    if (property.propertyImage) {
      return [property.propertyImage];
    }
    return ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800"];
  })();

  // Pricing calculations matching villa-web
  const basePrice: number =
    typeof property.pricing?.weekdayPrice === "number"
      ? property.pricing.weekdayPrice
      : typeof property.price === "number"
      ? property.price
      : typeof property.basePrice === "number"
      ? property.basePrice
      : typeof property.pricing?.basePrice === "number"
      ? property.pricing.basePrice
      : 15000;

  const weekendPrice: number =
    typeof property.pricing?.weekendPrice === "number"
      ? property.pricing.weekendPrice
      : typeof property.price === "number"
      ? Math.round(property.price * 1.5)
      : 35000;

  // Address
  const addressLine =
    property.address?.addressLine ||
    property.address?.city ||
    property.city ||
    "Malavli";
  const city = property.address?.city || property.city || "Lonavala";
  const locationText = `${addressLine}, ${city}`;

  const ratingVal = (property.rating || property.averageRating || 5.0).toFixed(1);
  const maxGuests = property.maxCapacity || property.maxGuests || 8;
  const bathsCount = property.baths != null ? property.baths : 2;

  // Great for tag
  const greatForTag =
    Array.isArray(property.greatFor) && property.greatFor.length > 0
      ? property.greatFor[0]
      : "Ideal for Families";

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
    if (slide !== activeImageIndex && slide >= 0 && slide < photos.length) {
      setActiveImageIndex(slide);
    }
  };

  const handlePressCard = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    router.push({
      pathname: "/property/[id]",
      params: { id: id || "", categoryId: property.categoryId || property.category || "" },
    } as any);
  };

  const handlePressHeart = (e: any) => {
    e.stopPropagation();
    toggleWishlist(property);
  };

  const handleShare = async (e: any) => {
    e.stopPropagation();
    try {
      await Share.share({
        message: `Check out ${property.name || property.title || "this luxury stay"} on The Villa & Camp: https://thevillacamp.com/view-Villa/${id}`,
      });
    } catch {}
  };

  const handlePressVideo = (e: any) => {
    e.stopPropagation();
    router.push("/(tabs)/shorts" as any);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.94}
      onPress={handlePressCard}
      style={styles.cardContainer}
    >
      {/* 1. Photo Carousel Container */}
      <View style={styles.imageContainer}>
        <FlatList
          data={photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyExtractor={(_, index) => `card-img-${index}`}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.cardImage}
              contentFit="cover"
              transition={200}
            />
          )}
        />

        {/* Top-Left: Red Gradient Most Booked Badge */}
        <View style={styles.topLeftBadge}>
          <LinearGradient
            colors={["#DC2626", "#D97706"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.mostBookedGradient}
          >
            <Ionicons name="flame" size={12} color="#FEF08A" style={{ marginRight: 3 }} />
            <Text style={styles.mostBookedText}>Most Booked</Text>
          </LinearGradient>
        </View>

        {/* Top-Right: Heart and Share Action Buttons */}
        <View style={styles.topRightActions}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={handlePressHeart}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={wishlisted ? "heart" : "heart-outline"}
              size={17}
              color={wishlisted ? "#FF5A1F" : "#374151"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={handleShare}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="share-social-outline" size={16} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Bottom-Left: Video Badge Button */}
        <TouchableOpacity
          style={styles.videoBadge}
          onPress={handlePressVideo}
          activeOpacity={0.85}
        >
          <Ionicons name="play" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
          <Text style={styles.videoText}>Video</Text>
        </TouchableOpacity>

        {/* Bottom-Center: Carousel Dots */}
        {photos.length > 1 && (
          <View style={styles.paginationDots}>
            {photos.slice(0, 6).map((_, idx) => (
              <View
                key={`dot-${idx}`}
                style={[
                  styles.dot,
                  activeImageIndex === idx ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* 2. Content Details Section */}
      <View style={styles.contentContainer}>
        {/* Title, Verified Checkmark & Rating */}
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <View style={styles.titleWithBadge}>
              <Text style={styles.propertyTitle} numberOfLines={1}>
                {property.name || property.title || "Vastalya Villa"}
              </Text>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color="#059669"
                style={{ marginLeft: 4 }}
              />
            </View>
            {/* Location */}
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={13} color="#FF5A1F" style={{ marginRight: 3 }} />
              <Text style={styles.locationText} numberOfLines={1}>
                {locationText}
              </Text>
            </View>
          </View>

          {/* Rating Pill */}
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={13} color="#F59E0B" style={{ marginRight: 3 }} />
            <Text style={styles.ratingText}>{ratingVal} of 5</Text>
          </View>
        </View>

        {/* Capacity Specs Pills */}
        <View style={styles.specsRow}>
          <View style={styles.specPill}>
            <Ionicons name="people-outline" size={13} color="#FF5A1F" style={{ marginRight: 4 }} />
            <Text style={styles.specText}>Upto {maxGuests} Guests</Text>
          </View>
          <View style={styles.specPill}>
            <Ionicons name="water-outline" size={13} color="#FF5A1F" style={{ marginRight: 4 }} />
            <Text style={styles.specText}>{bathsCount} Baths</Text>
          </View>
        </View>

        {/* Great For Pill */}
        <View style={styles.greatForRow}>
          <Text style={styles.greatForLabel}>Great for:</Text>
          <View style={styles.greatForPill}>
            <Ionicons name="people" size={12} color="#059669" style={{ marginRight: 4 }} />
            <Text style={styles.greatForText}>{greatForTag}</Text>
          </View>
        </View>

        {/* 5-Column Amenities Row (Matching Screenshot 1) */}
        <View style={styles.amenitiesGrid}>
          <View style={styles.amenityCol}>
            <View style={styles.amenityIconBox}>
              <MaterialCommunityIcons name="air-conditioner" size={18} color="#4B5563" />
            </View>
            <Text style={styles.amenityName} numberOfLines={1}>AC</Text>
          </View>

          <View style={styles.amenityCol}>
            <View style={styles.amenityIconBox}>
              <Ionicons name="battery-charging-outline" size={18} color="#4B5563" />
            </View>
            <Text style={styles.amenityName} numberOfLines={1}>Power Backup</Text>
          </View>

          <View style={styles.amenityCol}>
            <View style={styles.amenityIconBox}>
              <MaterialCommunityIcons name="pool" size={18} color="#4B5563" />
            </View>
            <Text style={styles.amenityName} numberOfLines={1}>Swimming Pool</Text>
          </View>

          <View style={styles.amenityCol}>
            <View style={styles.amenityIconBox}>
              <Ionicons name="volume-high-outline" size={18} color="#4B5563" />
            </View>
            <Text style={styles.amenityName} numberOfLines={1}>Sound System</Text>
          </View>

          <View style={styles.amenityCol}>
            <View style={styles.amenityIconBox}>
              <MaterialCommunityIcons name="flower" size={18} color="#4B5563" />
            </View>
            <Text style={styles.amenityName} numberOfLines={1}>Garden</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Price & Book Now CTA */}
        <View style={styles.pricingRow}>
          <View style={styles.priceLeft}>
            <Text style={styles.priceLabel}>Price start</Text>
            <Text style={styles.priceSub}>for 1 Nights</Text>
          </View>

          <View style={styles.priceRight}>
            <Text style={styles.priceAmount}>₹{basePrice.toLocaleString("en-IN")}</Text>
            {weekendPrice > basePrice && (
              <Text style={styles.weekendPriceText}>
                Weekend ₹{weekendPrice.toLocaleString("en-IN")}
              </Text>
            )}
          </View>
        </View>

        {/* Book Now Button */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePressCard}
          style={styles.bookNowButton}
        >
          <LinearGradient
            colors={["#FF5A1F", "#EA580C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookNowGradient}
          >
            <Text style={styles.bookNowText}>Book Now →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: CARD_MARGIN,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  imageContainer: {
    width: "100%",
    height: IMAGE_HEIGHT,
    backgroundColor: "#F3F4F6",
    position: "relative",
  },
  cardImage: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
  },
  topLeftBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
  mostBookedGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
  },
  mostBookedText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  topRightActions: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    gap: 7,
    zIndex: 10,
  },
  circleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  videoBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    zIndex: 10,
  },
  videoText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  paginationDots: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    flexDirection: "row",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 10,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 14,
    backgroundColor: "#FFFFFF",
  },
  dotInactive: {
    width: 4,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  contentContainer: {
    padding: 13,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  titleLeft: {
    flex: 1,
    marginRight: 8,
  },
  titleWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    flex: 1,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#FDE68A",
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#92400E",
  },
  specsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  specPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },
  specText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  greatForRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 11,
  },
  greatForLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
  greatForPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 0.5,
    borderColor: "#A7F3D0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
  },
  greatForText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#065F46",
  },
  amenitiesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    marginBottom: 10,
  },
  amenityCol: {
    alignItems: "center",
    flex: 1,
  },
  amenityIconBox: {
    width: 38,
    height: 38,
    borderRadius: 9,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  amenityName: {
    fontSize: 9,
    fontWeight: "600",
    color: "#4B5563",
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 10,
  },
  pricingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 11,
  },
  priceLeft: {
    justifyContent: "center",
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  priceSub: {
    fontSize: 11,
    fontWeight: "400",
    color: "#9CA3AF",
  },
  priceRight: {
    alignItems: "flex-end",
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.3,
  },
  weekendPriceText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 1,
  },
  bookNowButton: {
    borderRadius: 11,
    overflow: "hidden",
  },
  bookNowGradient: {
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  bookNowText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
