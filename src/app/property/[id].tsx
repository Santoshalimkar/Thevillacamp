import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Share,
  Platform,
  Modal,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Colors } from "../../theme/colors";
import { fetchPropertyById, PropertyItem } from "../../services/propertyService";
import { useWishlist } from "../../context/WishlistContext";
import { FloatingMascot } from "../../components/FloatingMascot";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = 270;

const DETAIL_TABS = [
  { id: "highlights", label: "Highlights" },
  { id: "events", label: "Events", isLive: true },
  { id: "refund", label: "Refund Policy" },
  { id: "spaces", label: "Spaces" },
  { id: "reviews", label: "Reviews" },
  { id: "amenities", label: "Amenities" },
  { id: "meals", label: "Meals" },
  { id: "location", label: "Location" },
];

const SIGNATURE_EXPERIENCES = [
  {
    title: "FULLY-SERVICED",
    subtitle: "VILLAS",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  },
  {
    title: "CURATED",
    subtitle: "DINING",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
  },
  {
    title: "SCENIC",
    subtitle: "PANORAMA",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  },
];

const SAMPLE_HIGHLIGHTS = [
  {
    title: "Peaceful natural stay",
    description: "Enjoye morning/evening walks and a calm environment surrounded by nature.",
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&q=80",
  },
  {
    title: "Ideal for group party",
    description: "Enjoy your celebration party with modern amenities and private pool",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
  },
];

const SAMPLE_SPACES = [
  {
    name: "Outdoor",
    category: "Outdoor & Nature",
    description: "Stunning natutre view from terrace",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
    features: ["Open-Air Setting", "Scenic Views", "Relaxation Seating"],
  },
  {
    name: "Private Pool & Deck",
    category: "Pool & Deck",
    description: "Private swimming pool with sun deck and evening party lighting",
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80",
    features: ["Private Swimming Pool", "Sun Loungers", "Poolside Barbecue"],
  },
  {
    name: "Master Bedroom",
    category: "Bedrooms & Suites",
    description: "AC bedroom with king size bed and attached ensuite bathroom",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
    features: ["Air Conditioned", "Attached Ensuite Bath", "Plush Linens"],
  },
];

const ALL_AMENITIES_LIST = [
  { icon: "wifi", label: "WiFi" },
  { icon: "snow-outline", label: "Heating" },
  { icon: "air-conditioner", label: "Air Conditioning", isMdi: true },
  { icon: "battery-charging-outline", label: "Power Backup" },
  { icon: "water-outline", label: "Water Supply" },
  { icon: "shield-checkmark-outline", label: "Security" },
  { icon: "videocam-outline", label: "CCTV" },
  { icon: "car-outline", label: "Parking" },
  { icon: "pool", label: "Swimming Pool", isMdi: true },
  { icon: "volume-high-outline", label: "Sound System" },
  { icon: "flower", label: "Garden", isMdi: true },
  { icon: "tv-outline", label: "Smart TV" },
  { icon: "restaurant-outline", label: "In-House Chef" },
  { icon: "flame-outline", label: "Bonfire & BBQ" },
  { icon: "cafe-outline", label: "Coffee Maker" },
  { icon: "bed-outline", label: "Extra Mattresses" },
];

const REVIEW_FILTER_TAGS = ["All", "Amenities", "Stay", "Food", "Service", "View"];

export default function PropertyDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, categoryId } = useLocalSearchParams<{ id: string; categoryId?: string }>();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [property, setProperty] = useState<PropertyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("highlights");
  const [isReadMore, setIsReadMore] = useState(false);
  const [spaceCurrentIndex, setSpaceCurrentIndex] = useState(0);

  // Reviews state
  const [reviewFilter, setReviewFilter] = useState("All");
  const [reviewSort, setReviewSort] = useState("Most Popular");
  const [isAllReviewsModalOpen, setIsAllReviewsModalOpen] = useState(false);

  // Amenities state
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // Location Map state
  const [mapType, setMapType] = useState<"map" | "satellite">("map");

  // Modals
  const [isBrochureOpen, setIsBrochureOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const sectionYPositions = useRef<{ [key: string]: number }>({});

  const propId = property?._id || property?.id;
  const wishlisted = propId ? isWishlisted(propId) : false;

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  const loadProperty = async () => {
    try {
      const res = await fetchPropertyById(id as string, categoryId as string);
      if (res?.success && res.data) {
        setProperty(res.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${property?.name || "this luxury villa"} on The Villa & Camp: https://thevillacamp.com/view-Villa/${id}`,
      });
    } catch {}
  };

  const handleSelectDates = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    router.push({
      pathname: "/booking/[id]",
      params: { id: id as string, categoryId: categoryId || "" },
    } as any);
  };

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    const targetY = sectionYPositions.current[tabId];
    if (targetY !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: targetY - 40, animated: true });
    }
  };

  const handleOpenMapExternal = () => {
    const query = encodeURIComponent(`${property?.name || "Villa"}, Malavli, Lonavala`);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {
        Linking.openURL(`https://maps.google.com/?q=${query}`);
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5A1F" />
        <Text style={styles.loadingText}>Fetching luxury details...</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundTitle}>Stay Not Found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const photos =
    Array.isArray(property.images) && property.images.length > 0
      ? property.images
      : property.propertyImage
      ? [property.propertyImage]
      : ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800"];

  const basePrice: number =
    typeof property.pricing?.weekdayPrice === "number"
      ? property.pricing.weekdayPrice
      : typeof property.price === "number"
      ? property.price
      : typeof property.basePrice === "number"
      ? property.basePrice
      : typeof property.pricing?.basePrice === "number"
      ? property.pricing.basePrice
      : 70000;

  const originalPrice = Math.round(basePrice * 1.25);

  const cityName = property.address?.city || property.city || "Lonavala";
  const addressLine = property.address?.addressLine || "Malavli";
  const fullAddress = `${addressLine}, Boraj Road, Near Gharkul Society, ${cityName}`;
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const dynamicMapUri = useMemo(() => {
    if (googleMapsApiKey && googleMapsApiKey.trim().length > 0) {
      const locQuery = encodeURIComponent(fullAddress || `${property?.name || "Villa"}, ${cityName}`);
      const mapTypeParam = mapType === "satellite" ? "satellite" : "roadmap";
      return `https://maps.googleapis.com/maps/api/staticmap?center=${locQuery}&zoom=14&size=640x360&scale=2&maptype=${mapTypeParam}&markers=color:red%7Clabel:V%7C${locQuery}&key=${googleMapsApiKey.trim()}`;
    }
    return null;
  }, [googleMapsApiKey, fullAddress, property?.name, cityName, mapType]);

  const maxGuests = property.maxCapacity || property.maxGuests || 8;
  const roomsCount = property.rooms || property.bedrooms || 2;
  const bathsCount = property.baths != null ? property.baths : 2;

  const defaultDescription =
    `A serene getaway in ${addressLine}, ${cityName} with private swimming pool, garden area, and modern amenities. Ideal for families and groups, offering a peaceful nature-centric stay with homely food and dedicated concierge service.`;
  const descriptionText = property.description || defaultDescription;

  const displayedAmenities = showAllAmenities ? ALL_AMENITIES_LIST : ALL_AMENITIES_LIST.slice(0, 8);

  return (
    <View style={styles.screenContainer}>
      {/* ========================================================================= */}
      {/* 1. TOP HEADER                                                             */}
      {/* ========================================================================= */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 10) }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backIconBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {property.name || "Vastalya Villa"}
            </Text>
            <Text style={styles.headerBullet}>•</Text>
            <Text style={styles.headerCity} numberOfLines={1}>
              {cityName}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={20} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.push("/(tabs)/profile" as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color="#374151" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerAvatarBtn}
            onPress={() => router.push("/(tabs)/profile" as any)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#FF8533", "#FF5A1F"]}
              style={styles.headerAvatarGradient}
            >
              <Ionicons name="person" size={15} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 12) + 95 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================================= */}
        {/* 2. HERO CAROUSEL                                                          */}
        {/* ========================================================================= */}
        <View style={styles.heroContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActivePhotoIdx(idx);
            }}
          >
            {photos.map((photo, i) => (
              <Image key={i} source={{ uri: photo }} style={styles.heroImage} contentFit="cover" />
            ))}
          </ScrollView>

          {/* Top-Left: "★ Popular" Badge */}
          <View style={styles.popularBadge}>
            <Ionicons name="star" size={12} color="#F59E0B" style={{ marginRight: 4 }} />
            <Text style={styles.popularBadgeText}>Popular</Text>
          </View>

          {/* Top-Right: Wishlist Heart Button */}
          <TouchableOpacity
            style={styles.heroHeartBtn}
            onPress={() => toggleWishlist(property)}
            activeOpacity={0.85}
          >
            <Ionicons
              name={wishlisted ? "heart" : "heart-outline"}
              size={20}
              color={wishlisted ? "#EF4444" : "#1F2937"}
            />
          </TouchableOpacity>

          {/* Bottom-Right: "View Photos" & "▶ Video" Action Buttons */}
          <View style={styles.heroBottomActions}>
            <TouchableOpacity
              style={styles.heroPillBtn}
              activeOpacity={0.85}
              onPress={() => {}}
            >
              <Text style={styles.heroPillText}>View Photos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroPillBtn}
              activeOpacity={0.85}
              onPress={() => router.push("/(tabs)/shorts" as any)}
            >
              <Ionicons name="play" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.heroPillText}>Video</Text>
            </TouchableOpacity>
          </View>

          {/* Centered Dots Indicator */}
          {photos.length > 1 && (
            <View style={styles.heroDotsContainer}>
              {photos.slice(0, 8).map((_, idx) => (
                <View
                  key={`hdot-${idx}`}
                  style={[
                    styles.heroDot,
                    activePhotoIdx === idx ? styles.heroDotActive : styles.heroDotInactive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* 3. DETAILS HEADER                                                         */}
        {/* ========================================================================= */}
        <View style={styles.detailsContainer}>
          <View style={styles.titleBrochureRow}>
            <View style={styles.titleTextBlock}>
              <Text style={styles.detailTitle}>
                {property.name || "Vastalya Villa"} - {addressLine}
              </Text>
              <Text style={styles.detailLocation}>
                {addressLine}, {cityName}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.brochureButton}
              activeOpacity={0.8}
              onPress={() => setIsBrochureOpen(true)}
            >
              <Ionicons name="document-text-outline" size={14} color="#FF5A1F" style={{ marginRight: 4 }} />
              <Text style={styles.brochureText}>View Brochure</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ratingReviewsRow}>
            <View style={styles.guestFavPill}>
              <Text style={styles.guestFavText}>Guest Favourite</Text>
            </View>

            <View style={styles.starScoreRow}>
              <Ionicons name="star" size={15} color="#F59E0B" style={{ marginRight: 3 }} />
              <Text style={styles.starScoreText}>5</Text>
              <Text style={styles.starOutOfText}> / 5</Text>
            </View>

            <TouchableOpacity activeOpacity={0.7} onPress={() => handleTabPress("reviews")}>
              <Text style={styles.reviewsLink}>(1 Reviews)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.specCardsRow}>
            <View style={styles.specCard}>
              <Ionicons name="people-outline" size={18} color="#FF5A1F" style={{ marginRight: 6 }} />
              <Text style={styles.specCardText}>Up to {maxGuests} Guests</Text>
            </View>

            <View style={styles.specCard}>
              <Ionicons name="bed-outline" size={18} color="#FF5A1F" style={{ marginRight: 6 }} />
              <Text style={styles.specCardText}>{roomsCount} Rooms</Text>
            </View>

            <View style={styles.specCard}>
              <Ionicons name="water-outline" size={18} color="#FF5A1F" style={{ marginRight: 6 }} />
              <Text style={styles.specCardText}>{bathsCount} Baths</Text>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 4. HORIZONTAL STICKY TABS BAR                                             */}
        {/* ========================================================================= */}
        <View style={styles.tabsBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {DETAIL_TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              if (tab.isLive) {
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={styles.liveEventTab}
                    onPress={() => handleTabPress(tab.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.livePulseDot} />
                    <Text style={styles.liveEventText}>Events</Text>
                    <View style={styles.liveTagBadge}>
                      <Text style={styles.liveTagText}>LIVE</Text>
                    </View>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.standardTab, isSelected && styles.standardTabSelected]}
                  onPress={() => handleTabPress(tab.id)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ========================================================================= */}
        {/* 5. HIGHLIGHTS & VILLACAMP EXPERIENCE                                      */}
        {/* ========================================================================= */}
        <View
          onLayout={(e) => (sectionYPositions.current["highlights"] = e.nativeEvent.layout.y)}
          style={styles.sectionContainer}
        >
          <View style={styles.sectionHeaderRow}>
            <View style={styles.orangeBar} />
            <Text style={styles.sectionHeading}>The Villacamp Experience</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.signatureCardsScroll}
          >
            {SIGNATURE_EXPERIENCES.map((exp, idx) => (
              <View key={idx} style={styles.signatureCard}>
                <Image
                  source={{ uri: exp.image }}
                  style={styles.signatureCardImage}
                  contentFit="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.85)"]}
                  style={styles.signatureGradient}
                >
                  <Text style={styles.signatureTitle}>{exp.title}</Text>
                  <Text style={styles.signatureSub}>{exp.subtitle}</Text>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>

          <View style={styles.subSectionHeader}>
            <Ionicons name="sparkles" size={16} color="#FF5A1F" style={{ marginRight: 6 }} />
            <Text style={styles.subSectionTitle}>Special Villa Highlights</Text>
          </View>

          <View style={styles.highlightsList}>
            {SAMPLE_HIGHLIGHTS.map((item, idx) => (
              <View key={idx} style={styles.highlightCard}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.highlightThumb}
                  contentFit="cover"
                />
                <View style={styles.highlightInfo}>
                  <Text style={styles.highlightTitle}>{item.title}</Text>
                  <Text style={styles.highlightDesc}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
            <View style={styles.orangeBar} />
            <Text style={styles.sectionHeading}>{property.name || "Vastalya Villa"}</Text>
          </View>

          <Text style={styles.descriptionParagraph}>
            {isReadMore ? descriptionText : `${descriptionText.slice(0, 195)}...`}
          </Text>

          <TouchableOpacity
            onPress={() => setIsReadMore(!isReadMore)}
            activeOpacity={0.7}
            style={{ marginBottom: 12 }}
          >
            <Text style={styles.readMoreText}>{isReadMore ? "Read Less" : "Read More"}</Text>
          </TouchableOpacity>

          <View style={styles.tagChipsRow}>
            <View style={styles.orangeTagChip}>
              <Text style={styles.orangeTagText}>✦ Ideal for Families</Text>
            </View>
            <View style={styles.orangeTagChip}>
              <Text style={styles.orangeTagText}>✦ Ideal for Groups</Text>
            </View>
            <View style={styles.orangeTagChip}>
              <Text style={styles.orangeTagText}>✦ Pet-Friendly</Text>
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.orangeActionButton}
              activeOpacity={0.88}
              onPress={() => setIsBrochureOpen(true)}
            >
              <Text style={styles.orangeActionText}>View Brochure</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.faqActionButton}
              activeOpacity={0.8}
              onPress={() => setIsFaqOpen(true)}
            >
              <Text style={styles.faqActionText}>FAQ's</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 6. PROPERTY EVENTS                                                        */}
        {/* ========================================================================= */}
        <View
          onLayout={(e) => (sectionYPositions.current["events"] = e.nativeEvent.layout.y)}
          style={styles.sectionContainer}
        >
          <View style={styles.sectionHeaderWithBadge}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.orangeBar} />
              <Text style={styles.sectionHeading}>Property Events</Text>
            </View>
            <View style={styles.liveCountBadge}>
              <Text style={styles.liveCountText}>🔴 1 Event Live</Text>
            </View>
          </View>

          <View style={styles.eventCard}>
            <View style={styles.eventBannerContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
                }}
                style={styles.eventBannerImage}
                contentFit="cover"
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.88)"]}
                style={styles.eventGradient}
              >
                <View style={styles.eventTopBadge}>
                  <Text style={styles.eventTopBadgeText}>🎉 bbq_night</Text>
                </View>

                <Text style={styles.eventTitleOnImage}>
                  Sunset Sundowner & Live Barbecue
                </Text>
                <View style={styles.eventDateRow}>
                  <Ionicons name="calendar-outline" size={12} color="#FED7AA" style={{ marginRight: 4 }} />
                  <Text style={styles.eventDateText}>13 Sept - 13 Oct 2026</Text>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.eventBody}>
              <Text style={styles.eventDescText}>
                Exclusive poolside barbecue dinner with curated indie music for staying guests.
              </Text>

              <TouchableOpacity
                style={styles.eventCtaButton}
                activeOpacity={0.88}
                onPress={() => setIsEventModalOpen(true)}
              >
                <Ionicons name="ticket-outline" size={16} color="#FBBF24" style={{ marginRight: 6 }} />
                <Text style={styles.eventCtaText}>View Event Details & Inclusions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 7. RULES AND REFUND POLICY                                                */}
        {/* ========================================================================= */}
        <View
          onLayout={(e) => (sectionYPositions.current["refund"] = e.nativeEvent.layout.y)}
          style={styles.sectionContainer}
        >
          <View style={styles.sectionHeaderRow}>
            <View style={styles.orangeBar} />
            <Text style={styles.sectionHeading}>Rules and Refund Policy</Text>
          </View>

          <View style={styles.policyGrid}>
            <View style={styles.policyGridCard}>
              <Text style={styles.policyCardLabel}>🕒 CHECK-IN</Text>
              <Text style={styles.policyCardValue}>1 PM</Text>
            </View>

            <View style={styles.policyGridCard}>
              <Text style={styles.policyCardLabel}>🕒 CHECK-OUT</Text>
              <Text style={styles.policyCardValue}>11 AM</Text>
            </View>

            <View style={styles.policyGridCard}>
              <Text style={styles.policyCardLabel}>🛡️ SECURITY DEPOSIT</Text>
              <Text style={styles.policyCardValue}>₹3,000</Text>
              <Text style={styles.policyCardSub}>100% Refundable</Text>
            </View>

            <View style={styles.policyGridCard}>
              <Text style={styles.policyCardLabel}>💵 LATE CHECKOUT</Text>
              <Text style={styles.policyCardValue}>₹1,000/hr</Text>
              <Text style={styles.policyCardSub}>Subject to slot</Text>
            </View>
          </View>

          <View style={styles.ruleCard}>
            <Text style={styles.ruleCardHeader}>• Cancellation Policy</Text>
            <View style={styles.ruleBullet}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Advance Payment will be strictly non-refundable</Text>
            </View>
            <View style={styles.ruleBullet}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Advance payment is strictly non-refundable after 48 hours from booking</Text>
            </View>
            <View style={styles.ruleBullet}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Exceptions may be considered for genuine emergencies within 48 hours of booking</Text>
            </View>
          </View>

          <View style={styles.ruleCard}>
            <Text style={styles.ruleCardHeader}>• House Rules</Text>
            <View style={styles.ruleBullet}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>No smoking inside the villa</Text>
            </View>
            <View style={styles.ruleBullet}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Smoking allowed only in outdoor areas</Text>
            </View>
            <View style={styles.ruleBullet}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>No parties or events without prior approval</Text>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 8. SPACES & LIVING AREAS                                                  */}
        {/* ========================================================================= */}
        <View
          onLayout={(e) => (sectionYPositions.current["spaces"] = e.nativeEvent.layout.y)}
          style={styles.sectionContainer}
        >
          <View style={styles.sectionHeaderWithBadge}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.orangeBar} />
              <Text style={styles.sectionHeading}>Spaces & Living Areas</Text>
            </View>
            <Text style={styles.spacesCountText}>
              {spaceCurrentIndex + 1} of {SAMPLE_SPACES.length}
            </Text>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH * 0.85));
              setSpaceCurrentIndex(Math.min(idx, SAMPLE_SPACES.length - 1));
            }}
            contentContainerStyle={styles.spacesScroll}
          >
            {SAMPLE_SPACES.map((space, idx) => (
              <View key={idx} style={styles.spaceCard}>
                <View style={styles.spaceImageContainer}>
                  <Image
                    source={{ uri: space.image }}
                    style={styles.spaceImage}
                    contentFit="cover"
                  />
                  <View style={styles.spaceCategoryBadge}>
                    <Ionicons name="home-outline" size={11} color="#FF5A1F" style={{ marginRight: 4 }} />
                    <Text style={styles.spaceCategoryText}>{space.category}</Text>
                  </View>

                  <View style={styles.viewPhotoBadge}>
                    <Text style={styles.viewPhotoText}>View Photo</Text>
                  </View>
                </View>

                <View style={styles.spaceContent}>
                  <Text style={styles.spaceTitle}>{space.name}</Text>
                  <Text style={styles.spaceDesc}>{space.description}</Text>

                  <View style={styles.spaceTagsRow}>
                    {space.features.map((f, i) => (
                      <View key={i} style={styles.spaceTag}>
                        <Text style={styles.spaceTagText}>✓ {f}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ========================================================================= */}
        {/* 9. GUEST REVIEWS (Screenshots 1 & 2)                                      */}
        {/* ========================================================================= */}
        <View
          onLayout={(e) => (sectionYPositions.current["reviews"] = e.nativeEvent.layout.y)}
          style={styles.sectionContainer}
        >
          {/* 5 Big Gold Stars Summary */}
          <View style={styles.reviewsSummaryCenter}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons key={s} name="star" size={28} color="#FBBF24" style={{ marginHorizontal: 2 }} />
              ))}
            </View>
            <Text style={styles.bigScoreText}>5/5</Text>
            <View style={styles.guestFavReviewsRow}>
              <Text style={styles.guestFavBoldText}>Guest Favourite</Text>
              <TouchableOpacity onPress={() => setIsAllReviewsModalOpen(true)}>
                <Text style={styles.reviewCountLink}> (1 Reviews)</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Filter Pills Row (Screenshot 1) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPillsScroll}
          >
            {REVIEW_FILTER_TAGS.map((tag) => {
              const isSelected = reviewFilter === tag;
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.filterPill, isSelected && styles.filterPillSelected]}
                  onPress={() => setReviewFilter(tag)}
                  activeOpacity={0.75}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={13} color="#059669" style={{ marginRight: 3 }} />
                  )}
                  <Text style={[styles.filterPillText, isSelected && styles.filterPillTextSelected]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sort By Row */}
          <View style={styles.sortByRow}>
            <Text style={styles.sortByLabel}>Sort by:</Text>
            <TouchableOpacity
              style={[styles.sortPill, reviewSort === "Most Popular" && styles.sortPillSelected]}
              onPress={() => setReviewSort("Most Popular")}
              activeOpacity={0.75}
            >
              {reviewSort === "Most Popular" && (
                <Ionicons name="checkmark" size={13} color="#059669" style={{ marginRight: 3 }} />
              )}
              <Text style={[styles.sortPillText, reviewSort === "Most Popular" && styles.sortPillTextSelected]}>
                Most Popular
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortPill, reviewSort === "Most Recent" && styles.sortPillSelected]}
              onPress={() => setReviewSort("Most Recent")}
              activeOpacity={0.75}
            >
              {reviewSort === "Most Recent" && (
                <Ionicons name="checkmark" size={13} color="#059669" style={{ marginRight: 3 }} />
              )}
              <Text style={[styles.sortPillText, reviewSort === "Most Recent" && styles.sortPillTextSelected]}>
                Most Recent
              </Text>
            </TouchableOpacity>
          </View>

          {/* Review Card (Matching Screenshot 1) */}
          <View style={styles.reviewCard}>
            <View style={styles.reviewerHeader}>
              <View style={styles.orangeAvatarCircle}>
                <Text style={styles.orangeAvatarLetter}>S</Text>
              </View>
              <View style={styles.reviewerMeta}>
                <Text style={styles.reviewTimeText}>9 months ago</Text>
                <View style={styles.ratingScorePillRow}>
                  <Ionicons name="star" size={13} color="#F59E0B" style={{ marginRight: 3 }} />
                  <Text style={styles.reviewScoreVal}>5 /5</Text>
                </View>
              </View>
            </View>

            <View style={styles.reviewTagBadge}>
              <Ionicons name="checkmark" size={11} color="#059669" style={{ marginRight: 3 }} />
              <Text style={styles.reviewTagBadgeText}>Amenities</Text>
            </View>

            <Text style={styles.reviewBodyText}>
              Exceptional property! The swimming pool and mountain views were unbelievable. The in-house caretaker was extremely helpful.
            </Text>

            {/* Attached Photo Thumbnail */}
            <View style={styles.reviewAttachmentThumb}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=80",
                }}
                style={styles.reviewAttachmentImg}
                contentFit="cover"
              />
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 10. VILLA AMENITIES (Screenshot 3)                                        */}
        {/* ========================================================================= */}
        <View
          onLayout={(e) => (sectionYPositions.current["amenities"] = e.nativeEvent.layout.y)}
          style={styles.sectionContainer}
        >
          <View style={styles.sectionHeaderWithBadge}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.orangeBar} />
              <Text style={styles.sectionHeading}>Villa Amenities</Text>
            </View>
            <Text style={styles.totalAmenitiesBadge}>32 Total</Text>
          </View>

          {/* Top Amenities Box (Screenshot 3) */}
          <View style={styles.topAmenitiesBanner}>
            <View style={styles.topAmenitiesHeaderRow}>
              <Ionicons name="sparkles" size={14} color="#EA580C" style={{ marginRight: 4 }} />
              <Text style={styles.topAmenitiesHeading}>TOP AMENITIES:</Text>
            </View>
            <View style={styles.topAmenitiesPillWrap}>
              {["AC", "Power Backup", "Swimming Pool", "Sound System", "Garden"].map((am, i) => (
                <View key={i} style={styles.topAmenityPill}>
                  <Text style={styles.topAmenityPillText}>✓ {am}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 2-Column Amenity Cards Grid */}
          <View style={styles.amenityCardsGrid}>
            {displayedAmenities.map((item, idx) => (
              <View key={idx} style={styles.amenityGridCard}>
                <View style={styles.amenityCardIconBox}>
                  {item.isMdi ? (
                    <MaterialCommunityIcons name={item.icon as any} size={18} color="#EA580C" />
                  ) : (
                    <Ionicons name={item.icon as any} size={18} color="#EA580C" />
                  )}
                </View>
                <Text style={styles.amenityCardLabel} numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Show All Amenities Button */}
          <TouchableOpacity
            style={styles.showAllAmenitiesBtn}
            onPress={() => setShowAllAmenities(!showAllAmenities)}
            activeOpacity={0.8}
          >
            <Text style={styles.showAllAmenitiesText}>
              {showAllAmenities ? "Show fewer amenities" : "Show all 32 amenities"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* 11. MEALS & DINING EXPERIENCE (Screenshot 4)                              */}
        {/* ========================================================================= */}
        <View
          onLayout={(e) => (sectionYPositions.current["meals"] = e.nativeEvent.layout.y)}
          style={styles.sectionContainer}
        >
          <View style={styles.sectionHeaderRow}>
            <View style={styles.orangeBar} />
            <Text style={styles.sectionHeading}>Meals & Dining Experience</Text>
          </View>

          {/* Adult Meal Package Card */}
          <View style={styles.mealPackageCard}>
            <View style={styles.mealPackageHeaderRow}>
              <View>
                <Text style={styles.mealPackageBadge}>GOURMET SPREAD</Text>
                <Text style={styles.mealPackageTitle}>Adult Meal Package</Text>
              </View>
              <View style={styles.mealPackagePriceCol}>
                <Text style={styles.mealPackagePrice}>₹2,000</Text>
                <Text style={styles.mealPackageUnit}>/adult/day</Text>
              </View>
            </View>
            <Text style={styles.mealPackageDesc}>
              Includes full course breakfast, regional lunch, evening high-tea & snacks, and gourmet dinner prepared by our chef.
            </Text>
            <View style={styles.mealFeaturesRow}>
              <Text style={styles.mealFeatureGreen}>✓ Veg & Non-Veg</Text>
              <Text style={styles.mealFeatureDot}>•</Text>
              <Text style={styles.mealFeatureGreen}>✓ Jain Available</Text>
              <Text style={styles.mealFeatureDot}>•</Text>
              <Text style={styles.mealFeatureGreen}>✓ Unlimited</Text>
            </View>
          </View>

          {/* Child Meal Package Card */}
          <View style={styles.childPackageCard}>
            <View style={styles.mealPackageHeaderRow}>
              <View>
                <Text style={styles.childPackageBadge}>5 - 10 YEARS</Text>
                <Text style={styles.mealPackageTitle}>Child Meal Package</Text>
              </View>
              <View style={styles.freeChildPill}>
                <Text style={styles.freeChildText}>Free for Kids Under 5</Text>
              </View>
            </View>
            <Text style={styles.mealPackageDesc}>
              Mild, kid-friendly comfort preparations, fresh rotis, warm milk, and snacks.
            </Text>
          </View>

          {/* 4 Meal Timings Grid (2x2) */}
          <View style={styles.timingsGrid}>
            <View style={styles.timingCard}>
              <Text style={styles.timingTitle}>☕ Breakfast</Text>
              <Text style={styles.timingHours}>8:30 AM – 10:30 AM</Text>
            </View>
            <View style={styles.timingCard}>
              <Text style={styles.timingTitle}>🍽️ Lunch</Text>
              <Text style={styles.timingHours}>1:00 PM – 3:00 PM</Text>
            </View>
            <View style={styles.timingCard}>
              <Text style={styles.timingTitle}>☕ High Tea</Text>
              <Text style={styles.timingHours}>5:00 PM – 6:30 PM</Text>
            </View>
            <View style={styles.timingCard}>
              <Text style={styles.timingTitle}>✨ Dinner</Text>
              <Text style={styles.timingHours}>8:30 PM – 10:30 PM</Text>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 12. LOCATION & SURROUNDINGS (Screenshot 5)                                */}
        {/* ========================================================================= */}
        <View
          onLayout={(e) => (sectionYPositions.current["location"] = e.nativeEvent.layout.y)}
          style={styles.sectionContainer}
        >
          <View style={styles.sectionHeaderRow}>
            <View style={styles.orangeBar} />
            <Text style={styles.sectionHeading}>Location & Surroundings</Text>
          </View>

          {/* Interactive Google Map Preview Box (Screenshot 5) */}
          <View style={styles.mapBoxContainer}>
            <Image
              source={
                dynamicMapUri
                  ? { uri: dynamicMapUri }
                  : mapType === "map"
                  ? require("../../../assets/brand/google-maps.jpg")
                  : {
                      uri: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80",
                    }
              }
              style={styles.mapImage}
              contentFit="cover"
            />

            {/* Top-Left Map / Satellite Switcher */}
            <View style={styles.mapSwitcherContainer}>
              <TouchableOpacity
                style={[styles.mapSwitchBtn, mapType === "map" && styles.mapSwitchBtnActive]}
                onPress={() => setMapType("map")}
                activeOpacity={0.8}
              >
                <Text style={[styles.mapSwitchText, mapType === "map" && styles.mapSwitchTextActive]}>
                  Map
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mapSwitchBtn, mapType === "satellite" && styles.mapSwitchBtnActive]}
                onPress={() => setMapType("satellite")}
                activeOpacity={0.8}
              >
                <Text style={[styles.mapSwitchText, mapType === "satellite" && styles.mapSwitchTextActive]}>
                  Satellite
                </Text>
              </TouchableOpacity>
            </View>

            {/* Center Red Map Marker */}
            <View style={styles.centerMapMarker}>
              <Ionicons name="location" size={38} color="#DC2626" />
            </View>

            {/* Right Controls */}
            <View style={styles.mapControlsRight}>
              <TouchableOpacity style={styles.mapCircleIcon} onPress={handleOpenMapExternal}>
                <Ionicons name="scan-outline" size={17} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.mapCircleIcon} onPress={handleOpenMapExternal}>
                <Ionicons name="locate-outline" size={17} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Bottom Google attribution */}
            <View style={styles.mapBottomAttribution}>
              <Text style={styles.mapGoogleLogo}>Google</Text>
              <Text style={styles.mapTermsText}>Map data ©2026 • Terms</Text>
            </View>
          </View>

          {/* Full Property Address Card */}
          <View style={styles.addressInfoCard}>
            <View style={styles.addressHeaderRow}>
              <Ionicons name="location-sharp" size={16} color="#FF5A1F" style={{ marginRight: 6 }} />
              <Text style={styles.addressHeaderTitle}>Full Property Address</Text>
            </View>
            <Text style={styles.fullAddressText}>{fullAddress}</Text>
          </View>

          {/* Nearby Sightseeing Distances */}
          <View style={styles.sightseeingCard}>
            <View style={styles.sightseeingHeaderRow}>
              <Ionicons name="compass-outline" size={16} color="#FF5A1F" style={{ marginRight: 6 }} />
              <Text style={styles.sightseeingHeaderTitle}>Nearby Sightseeing Distances</Text>
            </View>

            <View style={styles.sightseeingList}>
              <View style={styles.sightseeingItem}>
                <Text style={styles.sightseeingItemName}>• Bhaje Caves</Text>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceBadgeText}>6 km</Text>
                </View>
              </View>

              <View style={styles.sightseeingItem}>
                <Text style={styles.sightseeingItemName}>• Karla caves</Text>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceBadgeText}>3 km</Text>
                </View>
              </View>

              <View style={styles.sightseeingItem}>
                <Text style={styles.sightseeingItemName}>• Pawna Lake</Text>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceBadgeText}>14 km</Text>
                </View>
              </View>

              <View style={styles.sightseeingItem}>
                <Text style={styles.sightseeingItemName}>• Lohagad Fort</Text>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceBadgeText}>10 km</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ========================================================================= */}
      {/* 13. FIXED BOTTOM BOOKING BAR                                              */}
      {/* ========================================================================= */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.bottomLeft}>
          <View style={styles.bottomPriceRow}>
            <Text style={styles.bottomPrice}>₹{basePrice.toLocaleString("en-IN")}</Text>
            <Text style={styles.bottomStrikethrough}>₹{originalPrice.toLocaleString("en-IN")}</Text>
          </View>

          <View style={styles.guestsEditRow}>
            <Text style={styles.guestsCountText}>{maxGuests} Guests</Text>
            <Ionicons name="pencil" size={12} color="#FF5A1F" style={{ marginHorizontal: 4 }} />
            <Text style={styles.taxSubText}>• night + taxes</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.selectDatesButton}
          activeOpacity={0.9}
          onPress={handleSelectDates}
        >
          <LinearGradient
            colors={["#FF5A1F", "#EA580C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.selectDatesGradient}
          >
            <Text style={styles.selectDatesText}>Select Dates</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ========================================================================= */}
      {/* MODALS: All Reviews Drawer (Screenshot 2), Brochure, FAQs, Event           */}
      {/* ========================================================================= */}
      <Modal visible={isAllReviewsModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.allReviewsModalCard}>
            <View style={styles.allReviewsHeader}>
              <Text style={styles.allReviewsTitle}>All Reviews (1)</Text>
              <TouchableOpacity onPress={() => setIsAllReviewsModalOpen(false)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }}>
              <View style={styles.reviewCard}>
                <View style={styles.reviewerHeader}>
                  <View style={styles.orangeAvatarCircle}>
                    <Text style={styles.orangeAvatarLetter}>S</Text>
                  </View>
                  <View style={styles.reviewerMeta}>
                    <Text style={styles.reviewTimeText}>9 months ago</Text>
                    <View style={styles.ratingScorePillRow}>
                      <Ionicons name="star" size={13} color="#F59E0B" style={{ marginRight: 3 }} />
                      <Text style={styles.reviewScoreVal}>5 /5</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.reviewTagBadge}>
                  <Ionicons name="checkmark" size={11} color="#059669" style={{ marginRight: 3 }} />
                  <Text style={styles.reviewTagBadgeText}>Amenities</Text>
                </View>

                <Text style={styles.reviewBodyText}>
                  Exceptional property! The swimming pool and mountain views were unbelievable. The in-house caretaker was extremely helpful.
                </Text>

                <View style={styles.reviewAttachmentThumb}>
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=80",
                    }}
                    style={styles.reviewAttachmentImg}
                    contentFit="cover"
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={isBrochureOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{property.name} — Brochure</Text>
              <TouchableOpacity onPress={() => setIsBrochureOpen(false)}>
                <Ionicons name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalSectionLabel}>PROPERTY SNAPSHOT</Text>
              <View style={styles.factGrid}>
                <Text style={styles.factItem}>• BHK: 4BHK</Text>
                <Text style={styles.factItem}>• Capacity: Up to {maxGuests} Guests</Text>
                <Text style={styles.factItem}>• Bedrooms: {roomsCount} Rooms</Text>
                <Text style={styles.factItem}>• Bathrooms: {bathsCount} Baths</Text>
              </View>

              <Text style={[styles.modalSectionLabel, { marginTop: 14 }]}>KEY FEATURES</Text>
              <Text style={styles.featureLine}>• Private Swimming Pool with Sun Deck</Text>
              <Text style={styles.featureLine}>• Dedicated In-House Chef & Caretaker</Text>
              <Text style={styles.featureLine}>• Lush Lawn with Outdoor Seating</Text>
              <Text style={styles.featureLine}>• Generator Power Backup & Optical Wi-Fi</Text>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isFaqOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Frequently Asked Questions</Text>
              <TouchableOpacity onPress={() => setIsFaqOpen(false)}>
                <Ionicons name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.faqQ}>Q: What is the check-in and check-out time?</Text>
              <Text style={styles.faqA}>A: Check-in is at 1:00 PM and check-out is at 11:00 AM.</Text>

              <Text style={styles.faqQ}>Q: Is self-cooking allowed in the kitchen?</Text>
              <Text style={styles.faqA}>A: Yes, kitchen access is available with basic cookware and induction.</Text>

              <Text style={styles.faqQ}>Q: Are pets allowed?</Text>
              <Text style={styles.faqA}>A: Yes, friendly pets are warmly welcomed on the property.</Text>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isEventModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Event Inclusions & Details</Text>
              <TouchableOpacity onPress={() => setIsEventModalOpen(false)}>
                <Ionicons name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.modalSectionLabel}>SUNSET SUNDOWNER & LIVE BARBECUE</Text>
              <Text style={styles.featureLine}>• Live poolside charcoal grill setup</Text>
              <Text style={styles.featureLine}>• Veg and Non-veg curated marinated starters</Text>
              <Text style={styles.featureLine}>• Ambient acoustic / indie music playlist</Text>
              <Text style={styles.featureLine}>• Included free with direct app booking</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating AI Mascot */}
      <FloatingMascot />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    color: "#4B5563",
    fontSize: 13,
    marginTop: 12,
    fontWeight: "600",
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#FFFFFF",
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: "#FF5A1F",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    zIndex: 50,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  backIconBtn: {
    padding: 6,
    marginRight: 4,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    flexShrink: 1,
  },
  headerBullet: {
    fontSize: 12,
    color: "#9CA3AF",
    marginHorizontal: 4,
  },
  headerCity: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerIconBtn: {
    padding: 6,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF5A1F",
  },
  headerAvatarBtn: {
    marginLeft: 4,
  },
  headerAvatarGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    backgroundColor: "#FFFFFF",
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    backgroundColor: "#F3F4F6",
    position: "relative",
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
  popularBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1F2937",
  },
  heroHeartBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  heroBottomActions: {
    position: "absolute",
    bottom: 22,
    right: 12,
    flexDirection: "row",
    gap: 8,
    zIndex: 10,
  },
  heroPillBtn: {
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  heroPillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  heroDotsContainer: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    flexDirection: "row",
    gap: 5,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  heroDot: {
    height: 4,
    borderRadius: 2,
  },
  heroDotActive: {
    width: 14,
    backgroundColor: "#FFFFFF",
  },
  heroDotInactive: {
    width: 4,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  detailsContainer: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  titleBrochureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  titleTextBlock: {
    flex: 1,
    marginRight: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  detailLocation: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 2,
  },
  brochureButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF5A1F",
    backgroundColor: "#FFF7ED",
  },
  brochureText: {
    color: "#FF5A1F",
    fontSize: 11,
    fontWeight: "700",
  },
  ratingReviewsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  guestFavPill: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 14,
  },
  guestFavText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#C2410C",
  },
  starScoreRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  starScoreText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  starOutOfText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  reviewsLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF5A1F",
    textDecorationLine: "underline",
  },
  specCardsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  specCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 8,
    borderRadius: 10,
  },
  specCardText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },
  tabsBar: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  tabsContent: {
    paddingHorizontal: 12,
    gap: 4,
    alignItems: "center",
  },
  standardTab: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  standardTabSelected: {
    borderBottomColor: "#FF5A1F",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextSelected: {
    color: "#FF5A1F",
    fontWeight: "800",
  },
  liveEventTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FF5A1F",
    backgroundColor: "#FFF7ED",
    marginHorizontal: 4,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
    marginRight: 5,
  },
  liveEventText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#C2410C",
  },
  liveTagBadge: {
    marginLeft: 4,
    backgroundColor: "#EF4444",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  liveTagText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  sectionContainer: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionHeaderWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  orangeBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: "#FF5A1F",
    marginRight: 8,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  signatureCardsScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  signatureCard: {
    width: 170,
    height: 110,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  signatureCardImage: {
    width: "100%",
    height: "100%",
  },
  signatureGradient: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
  },
  signatureTitle: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  signatureSub: {
    color: "#D1D5DB",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  subSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  highlightsList: {
    gap: 8,
  },
  highlightCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 9,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  highlightThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    marginRight: 10,
  },
  highlightInfo: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 2,
  },
  highlightDesc: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 15,
  },
  descriptionParagraph: {
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 18,
    marginBottom: 4,
  },
  readMoreText: {
    color: "#FF5A1F",
    fontSize: 12,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
  tagChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
  },
  orangeTagChip: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  orangeTagText: {
    color: "#EA580C",
    fontSize: 11,
    fontWeight: "700",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  orangeActionButton: {
    backgroundColor: "#FF5A1F",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
  },
  orangeActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  faqActionButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
  },
  faqActionText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "700",
  },
  liveCountBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  liveCountText: {
    color: "#DC2626",
    fontSize: 10,
    fontWeight: "800",
  },
  eventCard: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  eventBannerContainer: {
    width: "100%",
    height: 160,
    position: "relative",
  },
  eventBannerImage: {
    width: "100%",
    height: "100%",
  },
  eventGradient: {
    position: "absolute",
    inset: 0,
    justifyContent: "space-between",
    padding: 10,
  },
  eventTopBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  eventTopBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#111827",
  },
  eventTitleOnImage: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  eventDateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  eventDateText: {
    color: "#FED7AA",
    fontSize: 11,
    fontWeight: "600",
  },
  eventBody: {
    padding: 12,
  },
  eventDescText: {
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 17,
    marginBottom: 10,
  },
  eventCtaButton: {
    backgroundColor: "#111827",
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  eventCtaText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  policyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  policyGridCard: {
    width: (SCREEN_WIDTH - 36) / 2,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 10,
  },
  policyCardLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 4,
  },
  policyCardValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  policyCardSub: {
    fontSize: 9,
    color: "#9CA3AF",
    marginTop: 1,
  },
  ruleCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    marginBottom: 10,
  },
  ruleCardHeader: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  ruleBullet: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 3,
  },
  bulletDot: {
    color: "#FF5A1F",
    fontSize: 13,
    fontWeight: "900",
    marginRight: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    color: "#4B5563",
    lineHeight: 16,
  },
  spacesCountText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "700",
  },
  spacesScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  spaceCard: {
    width: SCREEN_WIDTH * 0.78,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  spaceImageContainer: {
    width: "100%",
    height: 140,
    position: "relative",
  },
  spaceImage: {
    width: "100%",
    height: "100%",
  },
  spaceCategoryBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  spaceCategoryText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#111827",
  },
  viewPhotoBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  viewPhotoText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  spaceContent: {
    padding: 10,
  },
  spaceTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  spaceDesc: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
    marginBottom: 6,
  },
  spaceTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  spaceTag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  spaceTagText: {
    fontSize: 9,
    color: "#374151",
    fontWeight: "600",
  },

  /* Reviews Styles (Screenshots 1 & 2) */
  reviewsSummaryCenter: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  starsRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bigScoreText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 2,
  },
  guestFavReviewsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  guestFavBoldText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  reviewCountLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
    textDecorationLine: "underline",
  },
  filterPillsScroll: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  filterPillSelected: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  filterPillText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "600",
  },
  filterPillTextSelected: {
    color: "#059669",
    fontWeight: "700",
  },
  sortByRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sortByLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  sortPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  sortPillSelected: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  sortPillText: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "600",
  },
  sortPillTextSelected: {
    color: "#059669",
    fontWeight: "700",
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
  },
  reviewerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  orangeAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF5A1F",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  orangeAvatarLetter: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  reviewerMeta: {
    flex: 1,
  },
  reviewTimeText: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 2,
  },
  ratingScorePillRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewScoreVal: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
  },
  reviewTagBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
  },
  reviewTagBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#065F46",
  },
  reviewBodyText: {
    fontSize: 12,
    color: "#111827",
    lineHeight: 17,
    marginBottom: 8,
  },
  reviewAttachmentThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  reviewAttachmentImg: {
    width: "100%",
    height: "100%",
  },

  /* Amenities Styles (Screenshot 3) */
  totalAmenitiesBadge: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FF5A1F",
  },
  topAmenitiesBanner: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  topAmenitiesHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  topAmenitiesHeading: {
    fontSize: 10,
    fontWeight: "800",
    color: "#EA580C",
    letterSpacing: 0.5,
  },
  topAmenitiesPillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  topAmenityPill: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FED7AA",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
  },
  topAmenityPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1F2937",
  },
  amenityCardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  amenityGridCard: {
    width: (SCREEN_WIDTH - 36) / 2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 8,
  },
  amenityCardIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  amenityCardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  showAllAmenitiesBtn: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  showAllAmenitiesText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#EA580C",
  },

  /* Meals Styles (Screenshot 4) */
  mealPackageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FED7AA",
    padding: 12,
    marginBottom: 10,
  },
  childPackageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    marginBottom: 12,
  },
  mealPackageHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  mealPackageBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#EA580C",
    letterSpacing: 0.5,
  },
  childPackageBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6B7280",
    letterSpacing: 0.5,
  },
  freeChildPill: {
    backgroundColor: "#D1FAE5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  freeChildText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#065F46",
  },
  mealPackageTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    marginTop: 1,
  },
  mealPackagePriceCol: {
    alignItems: "flex-end",
  },
  mealPackagePrice: {
    fontSize: 16,
    fontWeight: "900",
    color: "#EA580C",
  },
  mealPackageUnit: {
    fontSize: 10,
    color: "#6B7280",
  },
  mealPackageDesc: {
    fontSize: 11,
    color: "#4B5563",
    lineHeight: 16,
    marginBottom: 6,
  },
  mealFeaturesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  mealFeatureGreen: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  mealFeatureDot: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  timingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timingCard: {
    width: (SCREEN_WIDTH - 36) / 2,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 8,
  },
  timingTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#EA580C",
    marginBottom: 2,
  },
  timingHours: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1F2937",
  },

  /* Location Styles (Screenshot 5) */
  mapBoxContainer: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#E5E7EB",
    marginBottom: 10,
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapSwitcherContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#D1D5DB",
    overflow: "hidden",
  },
  mapSwitchBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  mapSwitchBtnActive: {
    backgroundColor: "#F3F4F6",
  },
  mapSwitchText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
  },
  mapSwitchTextActive: {
    color: "#111827",
    fontWeight: "800",
  },
  centerMapMarker: {
    position: "absolute",
    top: "40%",
    left: "48%",
    alignItems: "center",
    justifyContent: "center",
  },
  mapControlsRight: {
    position: "absolute",
    top: 8,
    right: 8,
    gap: 6,
  },
  mapCircleIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#D1D5DB",
  },
  mapBottomAttribution: {
    position: "absolute",
    bottom: 4,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mapGoogleLogo: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4B5563",
  },
  mapTermsText: {
    fontSize: 9,
    color: "#4B5563",
  },
  addressInfoCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    marginBottom: 8,
  },
  addressHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  addressHeaderTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
  },
  fullAddressText: {
    fontSize: 11,
    color: "#4B5563",
    lineHeight: 16,
    paddingLeft: 22,
  },
  sightseeingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
  },
  sightseeingHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sightseeingHeaderTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
  },
  sightseeingList: {
    gap: 6,
  },
  sightseeingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sightseeingItemName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1F2937",
  },
  distanceBadge: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  distanceBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#EA580C",
  },

  /* Bottom Bar */
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  bottomLeft: {
    justifyContent: "center",
  },
  bottomPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.5,
  },
  bottomStrikethrough: {
    fontSize: 12,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
    marginLeft: 6,
  },
  guestsEditRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  guestsCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  taxSubText: {
    fontSize: 11,
    color: "#6B7280",
  },
  selectDatesButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  selectDatesGradient: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectDatesText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  /* Modals */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  allReviewsModalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
  },
  allReviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  allReviewsTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  modalContent: {
    paddingVertical: 6,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FF5A1F",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  factGrid: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 10,
    gap: 4,
  },
  factItem: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  featureLine: {
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 18,
    marginTop: 2,
  },
  faqQ: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
    marginTop: 8,
  },
  faqA: {
    fontSize: 11,
    color: "#4B5563",
    marginTop: 2,
    marginBottom: 4,
  },
});
