import React, { useState, useEffect } from "react";
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
import * as Haptics from "expo-haptics";
import { Colors } from "../../theme/colors";
import { fetchTrendingReels, ReelItem } from "../../services/propertyService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.44;

export const TrendingShortsSection: React.FC = () => {
  const router = useRouter();
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    fetchTrendingReels()
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && Array.isArray(res.data)) {
          setReels(res.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleWatchAll = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push("/(tabs)/shorts" as any);
  };

  return (
    <View style={styles.container}>
      {/* Eyebrow Badge */}
      <View style={styles.badgeRow}>
        <View style={styles.eyebrowBadge}>
          <Ionicons name="sparkles" size={12} color="#FF5A1F" style={{ marginRight: 4 }} />
          <Text style={styles.eyebrowText}>
            Curated Shorts <Text style={styles.dot}>•</Text> Real Guest Moments
          </Text>
        </View>
      </View>

      {/* Heading */}
      <Text style={styles.heading}>
        Trending <Text style={styles.headingOrange}>Videos & Shorts</Text>
      </Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Experience the vibe before you book. Browse real stays captured by guests and creators.
      </Text>

      {/* Watch All Shorts Button */}
      <View style={styles.ctaRow}>
        <TouchableOpacity style={styles.watchAllBtn} onPress={handleWatchAll} activeOpacity={0.8}>
          <View style={styles.playCircle}>
            <Ionicons name="play" size={11} color="#FFFFFF" style={{ marginLeft: 1 }} />
          </View>
          <Text style={styles.watchAllText}>Watch All Shorts</Text>
          <Ionicons name="arrow-forward" size={13} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Horizontal Video Cards */}
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
        {reels.map((reel) => {
          const catName = reel.category || "VILLA";
          const viewsCount = reel.views || "8K Views";

          return (
            <TouchableOpacity
              key={reel._id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={handleWatchAll}
            >
              <Image
                source={{
                  uri:
                    reel.thumbnail ||
                    "https://res.cloudinary.com/db60uwvhk/image/upload/v1753875530/villas/1bbfc3f9-181b-4015-858c-4f650f6b453f_qd0fep.jpg",
                }}
                style={styles.thumbnail}
                resizeMode="cover"
              />

              {/* Top Badges */}
              <View style={styles.topRow}>
                <View style={styles.viewsPill}>
                  <Ionicons name="eye-outline" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                  <Text style={styles.viewsText}>{viewsCount}</Text>
                </View>
                <View style={styles.catPill}>
                  <Text style={styles.catText}>{catName}</Text>
                </View>
              </View>

              {/* Center Play Icon */}
              <View style={styles.centerPlay}>
                <View style={styles.bigPlayCircle}>
                  <Ionicons name="play" size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
                </View>
              </View>

              {/* Bottom Details */}
              <View style={styles.bottomInfo}>
                <Text style={styles.videoTitle} numberOfLines={1}>
                  {reel.title}
                </Text>
                <View style={styles.authorRow}>
                  <View style={styles.authorAvatar}>
                    <Text style={styles.authorAvatarText}>
                      {(reel.creator || reel.title || "V").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.authorName} numberOfLines={1}>
                    {reel.creator || reel.title}
                  </Text>
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
  ctaRow: {
    alignItems: "center",
    marginVertical: 12,
  },
  watchAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#FED7AA",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 6,
  },
  playCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  watchAllText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.primary,
  },
  cardsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    height: 230,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#111827",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  topRow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },
  viewsPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  viewsText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  catPill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  catText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  centerPlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  bigPlayCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 90, 31, 0.88)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  videoTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  authorAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  authorAvatarText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  authorName: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
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
