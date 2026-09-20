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
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Colors } from "../theme/colors";
import { PropertyItem } from "../services/propertyService";
import { useWishlist } from "../context/WishlistContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 28;
const CARD_HEIGHT = 240;

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

  // Calculate pricing
  const price =
    property.price ||
    property.basePrice ||
    property.pricing?.basePrice ||
    property.pricing?.weekdayPrice ||
    12000;

  // Location display
  const locationText =
    property.address?.city ||
    property.city ||
    property.address?.locationName ||
    "Maharashtra, India";

  const ratingVal = (property.rating || 4.88).toFixed(1);
  const reviewsCount = property.reviewCount || property.reviewsCount || 24;

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
      params: { id: id || "", categoryId: property.categoryId || "" },
    } as any);
  };

  const handlePressHeart = (e: any) => {
    e.stopPropagation();
    toggleWishlist(property);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.93}
      onPress={handlePressCard}
      style={styles.cardContainer}
    >
      {/* Photo Carousel Container */}
      <View style={styles.imageContainer}>
        <FlatList
          data={photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyExtractor={(_, index) => `img-${index}`}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.cardImage}
              contentFit="cover"
              transition={200}
            />
          )}
        />

        {/* Top Badges Row */}
        <View style={styles.topRow}>
          {property.isFeatured ? (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>POPULAR</Text>
            </View>
          ) : (
            <View style={styles.superhostBadge}>
              <Text style={styles.superhostText}>VERIFIED</Text>
            </View>
          )}

          {/* Heart Wishlist Button */}
          <TouchableOpacity
            style={styles.heartButton}
            onPress={handlePressHeart}
            activeOpacity={0.8}
          >
            <Ionicons
              name={wishlisted ? "heart" : "heart-outline"}
              size={20}
              color={wishlisted ? Colors.heartRed : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>

        {/* Pagination Dots */}
        {photos.length > 1 && (
          <View style={styles.paginationDots}>
            {photos.slice(0, 5).map((_, idx) => (
              <View
                key={`dot-${idx}`}
                style={[styles.dot, activeImageIndex === idx && styles.dotActive]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Property Details Container */}
      <View style={styles.infoContainer}>
        {/* Header Title & Rating */}
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {property.title || property.propertyName || "Luxury Private Villa"}
          </Text>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={14} color={Colors.ratingGold} />
            <Text style={styles.ratingText}>
              {ratingVal}
              <Text style={styles.ratingCount}> ({reviewsCount})</Text>
            </Text>
          </View>
        </View>

        {/* Location & Specs */}
        <Text style={styles.location} numberOfLines={1}>
          {locationText} • {property.maxGuests || 8} Guests • {property.bedrooms || 3} BHK
        </Text>

        {/* Pricing Row */}
        <View style={styles.priceRow}>
          <Text style={styles.priceAmount}>
            ₹{price.toLocaleString("en-IN")}
          </Text>
          <Text style={styles.priceUnit}> / night</Text>
          <Text style={styles.taxesText}>+ taxes</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 14,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  imageContainer: {
    width: "100%",
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F3F4F6",
  },
  cardImage: {
    width: CARD_WIDTH - 20,
    height: CARD_HEIGHT,
  },
  topRow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featuredBadge: {
    backgroundColor: "#FF5A1F",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featuredText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  superhostBadge: {
    backgroundColor: "rgba(17, 24, 39, 0.75)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  superhostText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  heartButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  paginationDots: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  dotActive: {
    width: 16,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  infoContainer: {
    paddingHorizontal: 4,
    paddingTop: 10,
    paddingBottom: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.2,
    marginRight: 8,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  ratingCount: {
    fontWeight: "500",
    color: "#6B7280",
    fontSize: 11,
  },
  location: {
    fontSize: 12,
    color: "#4B5563",
    marginTop: 4,
    fontWeight: "500",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 6,
  },
  priceAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  priceUnit: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  taxesText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginLeft: 6,
  },
});
