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
  Image as RNImage,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Colors } from "../theme/colors";
import { PropertyItem } from "../services/propertyService";
import { useWishlist } from "../context/WishlistContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = 260;

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
      activeOpacity={0.92}
      onPress={handlePressCard}
      style={styles.cardContainer}
    >
      {/* Photo Carousel */}
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

        {/* Top Badges */}
        <View style={styles.topRow}>
          {property.featured ? (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>EXCLUSIVE</Text>
            </View>
          ) : (
            <View style={styles.superhostBadge}>
              <Text style={styles.superhostText}>VERIFIED STAY</Text>
            </View>
          )}

          {/* Wishlist Button */}
          <TouchableOpacity
            style={styles.heartButton}
            activeOpacity={0.8}
            onPress={handlePressHeart}
          >
            <Ionicons
              name={wishlisted ? "heart" : "heart-outline"}
              size={22}
              color={wishlisted ? Colors.heartRed : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>

        {/* Carousel Pagination Dots */}
        {photos.length > 1 && (
          <View style={styles.paginationDots}>
            {photos.slice(0, 6).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === activeImageIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        {/* Title and Rating */}
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {property.name || property.title || "The Villa Camp Haven"}
          </Text>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={14} color={Colors.ratingGold} />
            <Text style={styles.ratingText}>{ratingVal}</Text>
          </View>
        </View>

        {/* Location / Tagline */}
        <Text style={styles.location} numberOfLines={1}>
          {locationText} • {property.bhkType ? `${property.bhkType} • ` : ""}
          {property.maxGuests || 8} Guests
        </Text>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text style={styles.priceAmount}>₹{price.toLocaleString("en-IN")}</Text>
          <Text style={styles.priceUnit}> / night</Text>
          <Text style={styles.taxesText}>+ taxes</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginBottom: 26,
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    backgroundColor: Colors.cardSecondary,
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  topRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featuredBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  featuredText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  superhostBadge: {
    backgroundColor: "rgba(18, 19, 23, 0.75)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  superhostText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  heartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(10, 11, 14, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  paginationDots: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  infoContainer: {
    marginTop: 10,
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
    color: Colors.text,
    letterSpacing: -0.2,
    marginRight: 8,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  location: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 6,
  },
  priceAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  priceUnit: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  taxesText: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginLeft: 6,
  },
});
