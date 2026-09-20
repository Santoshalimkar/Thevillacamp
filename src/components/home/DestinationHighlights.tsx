import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Colors } from "../../theme/colors";
import { fetchDestinations, DestinationItem } from "../../services/propertyService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.48;

export const DestinationHighlights: React.FC = () => {
  const router = useRouter();
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    fetchDestinations()
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && Array.isArray(res.data)) {
          setDestinations(res.data);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenMap = async (dest: DestinationItem) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: "/search-your-gateway" as any,
      params: { locationId: dest._id, locationName: dest.name },
    });
  };

  return (
    <View style={styles.container}>
      {/* Eyebrow Badge */}
      <View style={styles.badgeRow}>
        <View style={styles.eyebrowBadge}>
          <Ionicons name="sparkles" size={12} color="#FF5A1F" style={{ marginRight: 4 }} />
          <Text style={styles.eyebrowText}>
            Top Getaways <Text style={styles.dot}>•</Text> Explore Locations
          </Text>
        </View>
      </View>

      {/* Heading */}
      <Text style={styles.heading}>
        Choose Your <Text style={styles.headingOrange}>Destination</Text>
      </Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Discover the perfect escape across Lonavala, Pawna Lake, and scenic Maharashtra hill
        stations.
      </Text>

      {/* Horizontal Carousel */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsScroll}
          snapToInterval={CARD_WIDTH + 14}
          decelerationRate="fast"
          onScroll={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            const idx = Math.round(x / (CARD_WIDTH + 14));
            setActiveIndex(idx);
          }}
          scrollEventThrottle={16}
        >
          {destinations.map((dest) => {
            const staysCount = dest.properties || dest.totalProperties || 3;
            const ratingVal = dest.rating || "5.0";

            return (
              <TouchableOpacity
                key={dest._id}
                style={styles.card}
                activeOpacity={0.88}
                onPress={() => handleOpenMap(dest)}
              >
                {/* Photo & Overlays */}
                <View style={styles.imageBox}>
                  <Image
                    source={{
                      uri:
                        dest.coverImage ||
                        "https://res.cloudinary.com/db60uwvhk/image/upload/v1753875530/villas/1bbfc3f9-181b-4015-858c-4f650f6b453f_qd0fep.jpg",
                    }}
                    style={styles.photo}
                    resizeMode="cover"
                  />

                  {/* Top Badges */}
                  <View style={styles.topBadgesRow}>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={10} color="#F59E0B" style={{ marginRight: 2 }} />
                      <Text style={styles.ratingBadgeText}>{ratingVal}</Text>
                    </View>

                    <View style={styles.staysBadge}>
                      <Ionicons name="home" size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
                      <Text style={styles.staysBadgeText}>{staysCount} stays</Text>
                    </View>
                  </View>

                  {/* Gradient Overlay & Bottom Info */}
                  <View style={styles.gradientOverlay}>
                    <View style={styles.locationTitleRow}>
                      <Ionicons
                        name="location-sharp"
                        size={13}
                        color={Colors.primary}
                        style={{ marginRight: 2 }}
                      />
                      <Text style={styles.locationName} numberOfLines={1}>
                        {dest.name}
                      </Text>
                    </View>
                    {dest.description ? (
                      <Text style={styles.locationDesc} numberOfLines={1}>
                        {dest.description}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Bottom Action */}
                <View style={styles.bottomBar}>
                  <Text style={styles.viewOnMapText}>View on map</Text>
                  <Ionicons name="arrow-forward" size={12} color={Colors.primary} />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Indicator Dots */}
      <View style={styles.indicators}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[styles.indicatorPill, activeIndex === i && styles.indicatorPillActive]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 18,
    backgroundColor: "#FFFFFF",
  },
  badgeRow: {
    alignItems: "center",
    marginBottom: 6,
  },
  eyebrowBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FF5A1F",
  },
  dot: {
    color: "#D1D5DB",
    marginHorizontal: 2,
  },
  heading: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },
  headingOrange: {
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 24,
    marginTop: 4,
    lineHeight: 18,
  },
  loadingBox: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  cardsScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  imageBox: {
    width: "100%",
    height: 140,
    position: "relative",
    backgroundColor: "#F3F4F6",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  topBadgesRow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  ratingBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#111827",
  },
  staysBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  staysBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  locationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  locationDesc: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 1,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  viewOnMapText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
  },
  indicatorPill: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
  },
  indicatorPillActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
});
