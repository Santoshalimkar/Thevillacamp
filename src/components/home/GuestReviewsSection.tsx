import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { getCuratedGuestReviews, GuestReviewItem } from "../../services/propertyService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.78;

const AVATAR_COLORS = ["#3B82F6", "#EC4899", "#8B5CF6", "#10B981"];

export const GuestReviewsSection: React.FC = () => {
  const reviews = getCuratedGuestReviews();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.container}>
      {/* Eyebrow Badge */}
      <View style={styles.badgeRow}>
        <View style={styles.eyebrowBadge}>
          <Ionicons name="sparkles" size={12} color="#FF5A1F" style={{ marginRight: 4 }} />
          <Text style={styles.eyebrowText}>
            Verified Guest Reviews <Text style={styles.dot}>•</Text> ★ 4.9 Rating
          </Text>
        </View>
      </View>

      {/* Heading */}
      <Text style={styles.heading}>
        Loved by <Text style={styles.headingOrange}>Our Guests</Text>
      </Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Authentic feedback and ratings from travelers who booked and stayed with us.
      </Text>

      {/* Review Cards Carousel */}
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
        {reviews.map((rev, idx) => {
          const avatarBg = AVATAR_COLORS[idx % AVATAR_COLORS.length];

          return (
            <View key={rev.id} style={styles.card}>
              {/* Header: Avatar, Name, Verified */}
              <View style={styles.cardHeader}>
                <View style={[styles.avatarCircle, { backgroundColor: avatarBg }]}>
                  <Text style={styles.avatarText}>{rev.initials}</Text>
                </View>

                <View style={styles.authorCol}>
                  <Text style={styles.authorName}>{rev.name}</Text>
                  <Text style={styles.authorSub}>
                    {rev.country} <Text style={styles.dot}>•</Text>{" "}
                    <Text style={{ color: "#FF5A1F" }}>Verified Guest</Text>
                  </Text>
                </View>

                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={13} color="#10B981" style={{ marginRight: 3 }} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>

              {/* Rating Stars */}
              <View style={styles.starsRow}>
                <View style={styles.starIcons}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons key={s} name="star" size={14} color="#F59E0B" style={{ marginRight: 2 }} />
                  ))}
                </View>
                <Text style={styles.ratingNum}>
                  {rev.rating.toFixed(1)} <Text style={styles.verifiedStayText}>• Verified Stay</Text>
                </Text>
              </View>

              {/* Review Text */}
              <Text style={styles.reviewBody}>{rev.text}</Text>

              {/* Property Tag */}
              <View style={styles.propertyTag}>
                <Ionicons name="home-outline" size={13} color="#FF5A1F" style={{ marginRight: 5 }} />
                <Text style={styles.propertyTagName}>{rev.propertyName}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Indicators */}
      <View style={styles.indicators}>
        {reviews.map((_, i) => (
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
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  authorCol: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  authorSub: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 1,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#065F46",
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  starIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 6,
  },
  ratingNum: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
  },
  verifiedStayText: {
    color: "#6B7280",
    fontWeight: "500",
  },
  reviewBody: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 19,
    marginTop: 10,
    fontWeight: "400",
  },
  propertyTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  propertyTagName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F2937",
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
