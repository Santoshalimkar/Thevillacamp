import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "../../theme/colors";
import { PropertyItem } from "../../services/propertyService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.46;

interface RecentlyVisitedSectionProps {
  properties: PropertyItem[];
}

export const RecentlyVisitedSection: React.FC<RecentlyVisitedSectionProps> = ({ properties }) => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const displayList = properties.length > 0 ? properties.slice(0, 4) : [
    {
      _id: "recent-1",
      name: "Shkhoi villa",
      images: [
        "https://res.cloudinary.com/db60uwvhk/image/upload/v1753875530/villas/1bbfc3f9-181b-4015-858c-4f650f6b453f_qd0fep.jpg",
      ],
      price: 30000,
      rating: 5.0,
      badge: "Guest favourite",
    },
    {
      _id: "recent-2",
      name: "Vastalya Villa",
      images: [
        "https://res.cloudinary.com/db60uwvhk/image/upload/v1753875525/villas/e4ab61e9-ac3c-4c5f-a7fc-c2f5211014ad_c3y9cj.jpg",
      ],
      price: 70000,
      rating: 5.0,
      badge: "Guest favourite",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Eyebrow Badge */}
      <View style={styles.badgeRow}>
        <View style={styles.eyebrowBadge}>
          <Ionicons name="time-outline" size={12} color="#FF5A1F" style={{ marginRight: 4 }} />
          <Text style={styles.eyebrowText}>
            Browsing History <Text style={styles.dot}>•</Text> Pick Up Where You Left Off
          </Text>
        </View>
      </View>

      {/* Heading */}
      <Text style={styles.heading}>
        Recently Visited <Text style={styles.headingOrange}>Properties</Text>
      </Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Quickly revisit the handpicked stays you recently explored.
      </Text>

      {/* Cards Scroll */}
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
        {displayList.map((item, idx) => {
          const propId = item._id || item.id || `rec-${idx}`;
          const badgeText = item.badge || "Guest favourite";

          const priceVal =
            typeof item.price === "number"
              ? item.price
              : item.price?.weekendPrice || item.price?.basePrice || 30000;

          return (
            <TouchableOpacity
              key={propId}
              style={styles.card}
              activeOpacity={0.88}
              onPress={() => router.push(`/property/${propId}` as any)}
            >
              <View style={styles.imageBox}>
                <Image
                  source={{
                    uri:
                      item.images?.[0] ||
                      item.propertyImage ||
                      "https://res.cloudinary.com/db60uwvhk/image/upload/v1753875530/villas/1bbfc3f9-181b-4015-858c-4f650f6b453f_qd0fep.jpg",
                  }}
                  style={styles.photo}
                  resizeMode="cover"
                />

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badgeText}</Text>
                </View>

                <View style={styles.heartCircle}>
                  <Ionicons name="heart" size={16} color="#FF5A1F" />
                </View>
              </View>

              <View style={styles.details}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.name}
                </Text>

                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{Number(priceVal).toLocaleString("en-IN")}</Text>
                  <Text style={styles.nights}> 2 nights</Text>
                  <View style={styles.starRow}>
                    <Ionicons name="star" size={11} color="#F59E0B" />
                    <Text style={styles.starText}>
                      {" "}
                      {item.rating ? Number(item.rating).toFixed(1) : "5.0"}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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
    height: 155,
    position: "relative",
    backgroundColor: "#F3F4F6",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#111827",
  },
  heartCircle: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    padding: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    flexWrap: "wrap",
  },
  price: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  nights: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  starText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#111827",
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
