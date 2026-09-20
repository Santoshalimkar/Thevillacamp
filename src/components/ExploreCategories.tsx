import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Colors } from "../theme/colors";
import { useSearch } from "../context/SearchContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.58;

const CATEGORIES = [
  {
    id: "villa",
    slug: "villa",
    name: "Villa",
    subtitle: "Private Pool & Luxury Estates",
    tag1: "MOST POPULAR",
    tag2: "250+ Stays",
    image: require("../../assets/brand/Villabanner.jpg"),
  },
  {
    id: "camp",
    slug: "camp",
    name: "Camp",
    subtitle: "Lakeside Glamping & Bonfires",
    tag1: "CURATED",
    tag2: "80+ Camps",
    image: require("../../assets/brand/Campbanner.jpg"),
  },
  {
    id: "cottage",
    slug: "cottage",
    name: "Cottage",
    subtitle: "Cozy Wooden & Hill Retreats",
    tag1: "NATURE VIBE",
    tag2: "110+ Cottages",
    image: require("../../assets/brand/Cottagebanner.jpg"),
  },
  {
    id: "hotel",
    slug: "hotel",
    name: "Hotel",
    subtitle: "Boutique Suites & Luxury Resorts",
    tag1: "TOP RATED",
    tag2: "60+ Resorts",
    image: require("../../assets/brand/Hotelbanner.jpg"),
  },
];

export const ExploreCategories: React.FC = () => {
  const { activeCategoryId, setActiveCategoryId } = useSearch();

  const handleSelect = async (slug: string) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setActiveCategoryId(activeCategoryId === slug ? null : slug);
  };

  return (
    <View style={styles.container}>
      {/* Header Tag */}
      <View style={styles.tagWrapper}>
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>
            ✨ Handpicked Getaways <Text style={{ color: "#9CA3AF" }}>•</Text> Choose Your Vibe
          </Text>
        </View>
      </View>

      {/* Section Title */}
      <Text style={styles.heading}>
        Explore by <Text style={styles.headingHighlight}>Categories</Text>
      </Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        From private pool villas to lakeside glamping, swipe through our real verified stays.
      </Text>

      {/* Horizontal Category Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + 14}
        decelerationRate="fast"
      >
        {CATEGORIES.map((cat) => {
          const isSelected = activeCategoryId === cat.slug;
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.9}
              onPress={() => handleSelect(cat.slug)}
              style={[
                styles.categoryCard,
                isSelected && styles.categoryCardSelected,
              ]}
            >
              {/* Image & Gradient Scrim */}
              <View style={styles.imageContainer}>
                <Image source={cat.image} style={styles.cardImage} resizeMode="cover" />
                <LinearGradient
                  colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.75)"]}
                  style={styles.cardGradient}
                />

                {/* Top Badges */}
                <View style={styles.badgeRow}>
                  <View style={styles.darkBadge}>
                    <Text style={styles.darkBadgeText}>{cat.tag1}</Text>
                  </View>
                  <View style={styles.orangeBadge}>
                    <Text style={styles.orangeBadgeText}>{cat.tag2}</Text>
                  </View>
                </View>

                {/* Card Title & Subtitle overlay at bottom */}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{cat.name}</Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>
                    {cat.subtitle}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingTop: 18,
    paddingBottom: 12,
  },
  tagWrapper: {
    alignItems: "center",
    marginBottom: 8,
  },
  tagPill: {
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FDBA74",
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#EA580C",
    letterSpacing: 0.2,
  },
  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    letterSpacing: -0.4,
  },
  headingHighlight: {
    color: "#FF5A1F",
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 24,
    lineHeight: 17,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  categoryCard: {
    width: CARD_WIDTH,
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  categoryCardSelected: {
    borderColor: "#FF5A1F",
    elevation: 6,
    shadowColor: "#FF5A1F",
    shadowOpacity: 0.3,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  badgeRow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  darkBadge: {
    backgroundColor: "rgba(17, 24, 39, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  darkBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  orangeBadge: {
    backgroundColor: "#FF5A1F",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orangeBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  cardInfo: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
});
