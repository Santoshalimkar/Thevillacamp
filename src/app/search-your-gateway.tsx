import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Colors } from "../theme/colors";
import {
  fetchLocationList,
  fetchMapProperties,
  LocationItem,
  PropertyItem,
  CATEGORIES,
} from "../services/propertyService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.82;

export default function SearchYourGatewayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ locationId?: string; locationName?: string }>();

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocId, setSelectedLocId] = useState<string>(params.locationId || "loc-all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const flatListRef = useRef<FlatList>(null);

  // Load locations
  useEffect(() => {
    fetchLocationList().then((res) => {
      if (res?.success && Array.isArray(res.data)) {
        setLocations(res.data);
      }
    });
  }, []);

  // Update selected location if query param changes
  useEffect(() => {
    if (params.locationId) {
      setSelectedLocId(params.locationId);
    }
  }, [params.locationId]);

  // Load properties based on location and category
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchMapProperties(selectedLocId, selectedCategory)
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && Array.isArray(res.data)) {
          setProperties(res.data);
          if (res.data.length > 0) {
            setActivePropertyId(res.data[0]._id || res.data[0].id || null);
          }
        } else {
          setProperties([]);
        }
      })
      .catch(() => {
        if (isMounted) setProperties([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedLocId, selectedCategory]);

  const handleLocationPress = async (locId: string) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setSelectedLocId(locId);
  };

  const handleCategoryPress = async (catSlug: string) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setSelectedCategory(catSlug);
  };

  const handleMarkerPress = async (item: PropertyItem, index: number) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    const id = item._id || item.id || "";
    setActivePropertyId(id);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const currentLocationName = useMemo(() => {
    const found = locations.find((l) => l._id === selectedLocId);
    return found ? found.name : params.locationName || "All Locations";
  }, [locations, selectedLocId, params.locationName]);

  const topInset = Math.max(insets.top, 10);
  const bottomInset = Math.max(insets.bottom, 14);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <View style={styles.locationTag}>
            <Ionicons name="map" size={13} color={Colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.locationTagText}>Map Explorer</Text>
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentLocationName}
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{properties.length} stays</Text>
        </View>
      </View>

      {/* Location Filter Strip */}
      <View style={styles.locationStrip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.locationScroll}
        >
          {locations.map((loc) => {
            const isSelected = selectedLocId === loc._id;
            return (
              <TouchableOpacity
                key={loc._id}
                style={[styles.locChip, isSelected && styles.locChipSelected]}
                onPress={() => handleLocationPress(loc._id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="location-sharp"
                  size={12}
                  color={isSelected ? "#FFFFFF" : "#6B7280"}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.locChipText, isSelected && styles.locChipTextSelected]}>
                  {loc.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Category Pills Strip */}
      <View style={styles.categoryStrip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, isSelected && styles.catChipSelected]}
                onPress={() => handleCategoryPress(cat.slug)}
                activeOpacity={0.8}
              >
                <Text style={[styles.catChipText, isSelected && styles.catChipTextSelected]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Interactive Map Visual Stage */}
      <View style={styles.mapCanvas}>
        {/* Styled Map Background Representation */}
        <Image
          source={require("../../assets/brand/google-maps.jpg")}
          style={styles.mapBg}
          resizeMode="cover"
        />

        {/* Floating Controls */}
        <View style={styles.mapControls}>
          <View style={styles.mapControlsBox}>
            <TouchableOpacity style={styles.mapControlBtn}>
              <Ionicons name="add" size={18} color="#111827" />
            </TouchableOpacity>
            <View style={styles.mapDivider} />
            <TouchableOpacity style={styles.mapControlBtn}>
              <Ionicons name="remove" size={18} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Property Pins with Price Badges */}
        {properties.map((item, idx) => {
          const propId = item._id || item.id || `map-prop-${idx}`;
          const isActive = activePropertyId === propId;

          // Coordinates offset distribution on visual map
          const topOffset = 25 + ((idx * 23) % 45);
          const leftOffset = 18 + ((idx * 31) % 65);

          const priceVal =
            typeof item.price === "number"
              ? item.price
              : item.price?.weekendPrice || item.price?.basePrice || 35000;

          const shortPrice = `₹${Math.round(priceVal / 1000)}k`;

          return (
            <TouchableOpacity
              key={propId}
              style={[
                styles.mapPin,
                { top: `${topOffset}%`, left: `${leftOffset}%` },
                isActive && styles.mapPinActive,
              ]}
              activeOpacity={0.85}
              onPress={() => handleMarkerPress(item, idx)}
            >
              <Text style={[styles.pinText, isActive && styles.pinTextActive]}>{shortPrice}</Text>
              {isActive && <View style={styles.pinArrow} />}
            </TouchableOpacity>
          );
        })}

        {loading && (
          <View style={styles.mapLoadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.mapLoadingText}>Updating map stays...</Text>
          </View>
        )}
      </View>

      {/* Bottom Synchronized Properties Carousel */}
      <View style={[styles.bottomCarouselContainer, { paddingBottom: bottomInset }]}>
        {properties.length === 0 && !loading ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>No properties found in this area.</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={properties}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bottomListContent}
            snapToInterval={CARD_WIDTH + 14}
            decelerationRate="fast"
            keyExtractor={(item, index) => item._id || item.id || `card-${index}`}
            renderItem={({ item }) => {
              const propId = item._id || item.id || "";
              const isActive = activePropertyId === propId;

              const priceVal =
                typeof item.price === "number"
                  ? item.price
                  : item.price?.weekendPrice || item.price?.basePrice || 35000;

              return (
                <TouchableOpacity
                  style={[styles.propertyCard, isActive && styles.propertyCardActive]}
                  activeOpacity={0.9}
                  onPress={() => router.push(`/property/${propId}` as any)}
                >
                  <Image
                    source={{
                      uri:
                        item.images?.[0] ||
                        item.propertyImage ||
                        "https://res.cloudinary.com/db60uwvhk/image/upload/v1753875530/villas/1bbfc3f9-181b-4015-858c-4f650f6b453f_qd0fep.jpg",
                    }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />

                  <View style={styles.cardDetails}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.cardRating}>
                        <Ionicons name="star" size={11} color="#F59E0B" />
                        <Text style={styles.cardRatingText}>
                          {" "}
                          {item.rating ? Number(item.rating).toFixed(1) : "5.0"}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                      {item.location || item.city || currentLocationName} •{" "}
                      {item.bhkType || "Luxury Retreat"}
                    </Text>

                    <View style={styles.cardPriceRow}>
                      <Text style={styles.cardPrice}>
                        ₹{Number(priceVal).toLocaleString("en-IN")}
                      </Text>
                      <Text style={styles.cardPriceUnit}> / night</Text>

                      <View style={styles.viewBtn}>
                        <Text style={styles.viewBtnText}>View</Text>
                        <Ionicons name="chevron-forward" size={12} color="#FFFFFF" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleCol: {
    flex: 1,
    marginLeft: 12,
  },
  locationTag: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginTop: 1,
  },
  countBadge: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.primary,
  },
  locationStrip: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FAFAFA",
  },
  locationScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  locChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  locChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  locChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
  },
  locChipTextSelected: {
    color: "#FFFFFF",
  },
  categoryStrip: {
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  catChipSelected: {
    backgroundColor: "#111827",
  },
  catChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
  },
  catChipTextSelected: {
    color: "#FFFFFF",
  },
  mapCanvas: {
    flex: 1,
    position: "relative",
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  mapBg: {
    width: "100%",
    height: "100%",
    opacity: 0.85,
  },
  mapControls: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 10,
  },
  mapControlsBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 3,
  },
  mapControlBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  mapDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  mapPin: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#111827",
    elevation: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
  },
  mapPinActive: {
    backgroundColor: Colors.primary,
    borderColor: "#FFFFFF",
    transform: [{ scale: 1.15 }],
    zIndex: 20,
  },
  pinText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
  },
  pinTextActive: {
    color: "#FFFFFF",
  },
  pinArrow: {
    position: "absolute",
    bottom: -5,
    alignSelf: "center",
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: Colors.primary,
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
  },
  mapLoadingText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
  },
  bottomCarouselContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  bottomListContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  propertyCard: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    flexDirection: "row",
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  propertyCardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 14,
  },
  cardDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
    marginRight: 6,
  },
  cardRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardRatingText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  cardPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  cardPriceUnit: {
    fontSize: 11,
    color: "#6B7280",
  },
  viewBtn: {
    marginLeft: "auto",
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
    marginRight: 2,
  },
  emptyCard: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  emptyCardText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
});
