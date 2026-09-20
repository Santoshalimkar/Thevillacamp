import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Colors } from "../theme/colors";
import { useSearch } from "../context/SearchContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const HERO_SLIDES = [
  {
    tag: "✨ Lakeside Adventures • Maharashtra",
    titlePrefix: "Escape to Extraordinary.\nScenic Lakeside Camping in ",
    highlightCity: "Pawna",
    description:
      "Stargaze beside crystal waters with premium tent stays, evening acoustic music, and lakeside bonfires.",
    categorySlug: "camp",
    buttonText: "Book Lakeside Glamping",
    bgImage: require("../../assets/brand/Campbanner.jpg"),
  },
  {
    tag: "✨ Luxury Private Stays • Maharashtra",
    titlePrefix: "Escape to Extraordinary.\nPrivate Pool Villas in ",
    highlightCity: "Lonavala",
    description:
      "Indulge in secluded luxury with panoramic valley views, private temperature-controlled pools, and personal chef.",
    categorySlug: "villa",
    buttonText: "Book Villas with Pool",
    bgImage: require("../../assets/brand/Villabanner.jpg"),
  },
  {
    tag: "✨ Nature Retreats • Western Ghats",
    titlePrefix: "Escape to Extraordinary.\nHeritage Cottages in ",
    highlightCity: "Kamshet",
    description:
      "Recharge in nature-embraced wooden chalets, lush agro-estates, and tranquil mountain breezes.",
    categorySlug: "cottage",
    buttonText: "Book Cozy Cottages",
    bgImage: require("../../assets/brand/Cottagebanner.jpg"),
  },
];

const POPULAR_DESTINATIONS = [
  { name: "Lonavala", emoji: "📍", destination: "Lonavala" },
  { name: "Pawna Lake", emoji: "🌊", destination: "Pawna Lake" },
  { name: "Alibaug", emoji: "🏖️", destination: "Alibaug" },
  { name: "Cottages", emoji: "🏡", destination: "Cottage" },
  { name: "Private Pool", emoji: "🏊", destination: "Pool" },
  { name: "Hotels", emoji: "🏨", destination: "Hotel" },
];

export const VillaHero: React.FC = () => {
  const router = useRouter();
  const { setDestination, setActiveCategoryId } = useSearch();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  const handleBookNow = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    router.push("/modal/search" as any);
  };

  const handleExploreAll = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setDestination("");
    setActiveCategoryId(null);
  };

  const handleSelectDest = async (destName: string) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setDestination(destName);
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={slide.bgImage}
        style={styles.heroBackground}
        imageStyle={styles.heroImageStyle}
        resizeMode="cover"
      >
        {/* Cinematic Gradient Overlays */}
        <LinearGradient
          colors={[
            "rgba(12, 13, 15, 0.45)",
            "rgba(12, 13, 15, 0.65)",
            "rgba(12, 13, 15, 0.92)",
          ]}
          style={styles.gradient}
        >
          {/* Tag Badge */}
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{slide.tag}</Text>
          </View>

          {/* Headline */}
          <Text style={styles.headline}>
            {slide.titlePrefix}
            <Text style={styles.headlineHighlight}>{slide.highlightCity}</Text>
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle} numberOfLines={2}>
            {slide.description}
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            {/* Primary Orange Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleBookNow}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>{slide.buttonText}</Text>
              <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Outlined Explore Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleExploreAll}
              style={styles.secondaryButton}
            >
              <Ionicons name="flame" size={15} color="#FF6900" style={{ marginRight: 4 }} />
              <Text style={styles.secondaryButtonText}>Explore All</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Destination Chips */}
          <View style={styles.chipsSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScrollContent}
            >
              <View style={styles.topLabel}>
                <Ionicons name="compass" size={13} color="#FF6900" style={{ marginRight: 3 }} />
                <Text style={styles.topLabelText}>TOP:</Text>
              </View>

              {POPULAR_DESTINATIONS.map((dest) => (
                <TouchableOpacity
                  key={dest.name}
                  activeOpacity={0.75}
                  onPress={() => handleSelectDest(dest.destination)}
                  style={styles.destChip}
                >
                  <Text style={styles.destEmoji}>{dest.emoji}</Text>
                  <Text style={styles.destName}>{dest.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Social Proof & Slide Dots Footer */}
          <View style={styles.footerRow}>
            <View style={styles.socialProof}>
              <Text style={styles.socialProofText}>
                <Text style={styles.starText}>⭐ 4.9★ </Text>
                Rated • 500+ Stays •{" "}
                <Text style={styles.verifiedText}>100% Verified</Text>
              </Text>
            </View>

            {/* Carousel Dots */}
            <View style={styles.dotsContainer}>
              {HERO_SLIDES.map((_, idx) => (
                <TouchableOpacity
                  key={`dot-${idx}`}
                  onPress={() => setCurrentSlide(idx)}
                  style={[
                    styles.dot,
                    currentSlide === idx && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: "#FFFFFF",
  },
  heroBackground: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
  },
  heroImageStyle: {
    borderRadius: 24,
  },
  gradient: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 16,
  },
  tagBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    marginBottom: 12,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  headline: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  headlineHighlight: {
    color: "#FF7A1A",
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 17,
    marginTop: 8,
    fontWeight: "400",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF5A1F",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
    shadowColor: "#FF5A1F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  chipsSection: {
    marginTop: 14,
  },
  chipsScrollContent: {
    alignItems: "center",
    gap: 6,
  },
  topLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 2,
  },
  topLabelText: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  destChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    gap: 4,
  },
  destEmoji: {
    fontSize: 11,
  },
  destName: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
  },
  socialProof: {
    flex: 1,
  },
  socialProofText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 10,
    fontWeight: "500",
  },
  starText: {
    color: "#FFB800",
    fontWeight: "700",
  },
  verifiedText: {
    color: "#34D399",
    fontWeight: "700",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  dotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF5A1F",
  },
});
