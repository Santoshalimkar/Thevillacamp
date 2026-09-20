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
import {
  fetchWeekendProperties,
  PropertyItem,
  CATEGORY_IDS,
} from "../../services/propertyService";
import { useWishlist } from "../../context/WishlistContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.46;

const TABS = [
  { id: "villa", name: "Villa", categoryId: CATEGORY_IDS.VILLA },
  { id: "camping", name: "Camping", categoryId: CATEGORY_IDS.CAMPING },
  { id: "cottage", name: "Cottage", categoryId: CATEGORY_IDS.COTTAGE },
  { id: "hotel", name: "Hotel", categoryId: CATEGORY_IDS.HOTEL },
];

export const AvailableThisWeekend: React.FC = () => {
  const router = useRouter();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [stays, setStays] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const targetTab = TABS.find((t) => t.id === activeTab) || TABS[0];

    fetchWeekendProperties(targetTab.categoryId)
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setStays(res.data.slice(0, 6));
        } else {
          // Fallback demo properties matching screenshot
          setStays([
            {
              _id: "stay-wknd-1",
              name: "Shkhoi villa",
              images: [
                "https://res.cloudinary.com/db60uwvhk/image/upload/v1753875530/villas/1bbfc3f9-181b-4015-858c-4f650f6b453f_qd0fep.jpg",
              ],
              price: 30000,
              rating: 5.0,
              badge: "✨ Spotlight",
            },
            {
              _id: "stay-wknd-2",
              name: "Vastalya Villa",
              images: [
                "https://res.cloudinary.com/db60uwvhk/image/upload/v1753875525/villas/e4ab61e9-ac3c-4c5f-a7fc-c2f5211014ad_c3y9cj.jpg",
              ],
              price: 70000,
              rating: 5.0,
              badge: "🔥 Most Booked",
            },
            {
              _id: "stay-wknd-3",
              name: "Pawna Lake Glamp",
              images: [
                "https://res.cloudinary.com/db60uwvhk/image/upload/v1753875530/villas/8a570db4-22b1-4d16-ae65-06aec4745c2c_etvwiw.jpg",
              ],
              price: 12000,
              rating: 4.9,
              badge: "✨ Spotlight",
            },
          ]);
        }
      })
      .catch(() => {
        if (isMounted) setStays([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const handleTabPress = async (tabId: string) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setActiveTab(tabId);
  };

  const formatPrice = (priceVal: any): string => {
    let num = 0;
    if (typeof priceVal === "number") num = priceVal;
    else if (typeof priceVal === "object" && priceVal !== null) {
      num = priceVal.weekendPrice || priceVal.basePrice || 0;
    }
    return `₹${Number(num).toLocaleString("en-IN")}`;
  };

  return (
    <View style={styles.container}>
      {/* Eyebrow Badge */}
      <View style={styles.badgeRow}>
        <View style={styles.eyebrowBadge}>
          <Ionicons name="sparkles" size={12} color="#FF5A1F" style={{ marginRight: 4 }} />
          <Text style={styles.eyebrowText}>
            Weekend Escapes <Text style={styles.dot}>•</Text> Instant Confirmation
          </Text>
        </View>
      </View>

      {/* Heading */}
      <Text style={styles.heading}>
        Available This <Text style={styles.headingOrange}>Weekend</Text>
      </Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Handpicked verified stays ready for your upcoming spontaneous getaway.
      </Text>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabChip, isSelected && styles.tabChipSelected]}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabChipText, isSelected && styles.tabChipTextSelected]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Carousel */}
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
          {stays.map((item, idx) => {
            const propId = item._id || item.id || `wknd-${idx}`;
            const isFav = isWishlisted(propId);
            const badgeText = item.badge || (idx === 0 ? "✨ Spotlight" : "🔥 Most Booked");

            return (
              <TouchableOpacity
                key={propId}
                style={styles.card}
                activeOpacity={0.88}
                onPress={() => router.push(`/property/${propId}` as any)}
              >
                {/* Photo */}
                <View style={styles.imageContainer}>
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

                  {/* Badge */}
                  <View style={styles.cardBadge}>
                    <Text style={styles.cardBadgeText}>{badgeText}</Text>
                  </View>

                  {/* Wishlist Heart */}
                  <TouchableOpacity
                    style={styles.heartBtn}
                    onPress={() => toggleWishlist(item)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isFav ? "heart" : "heart-outline"}
                      size={18}
                      color={isFav ? "#FF5A1F" : "#FFFFFF"}
                    />
                  </TouchableOpacity>

                  {/* Dot pagination preview */}
                  <View style={styles.imgDots}>
                    <View style={[styles.imgDot, styles.imgDotActive]} />
                    <View style={styles.imgDot} />
                    <View style={styles.imgDot} />
                  </View>
                </View>

                {/* Details */}
                <View style={styles.details}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.name || "Luxury Villa"}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
                    <Text style={styles.nightsLabel}> 2 nights</Text>
                    <View style={styles.ratingBox}>
                      <Ionicons name="star" size={11} color="#F59E0B" />
                      <Text style={styles.ratingText}>
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
      )}

      {/* Indicator Bar */}
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
  tabsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  tabChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
  },
  tabChipTextSelected: {
    color: "#FFFFFF",
  },
  loadingBox: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  cardsScroll: {
    paddingHorizontal: 16,
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
  imageContainer: {
    width: "100%",
    height: 155,
    position: "relative",
    backgroundColor: "#F3F4F6",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  cardBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#EA580C",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  heartBtn: {
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
  imgDots: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    flexDirection: "row",
    gap: 4,
  },
  imgDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
  },
  imgDotActive: {
    backgroundColor: "#FFFFFF",
    width: 7,
  },
  details: {
    padding: 10,
  },
  cardTitle: {
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
  priceText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  nightsLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  ratingText: {
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
