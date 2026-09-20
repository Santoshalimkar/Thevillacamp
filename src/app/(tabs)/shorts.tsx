import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import * as Haptics from "expo-haptics";
import { Colors } from "../../theme/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 42) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.6;

interface ReelItem {
  id: string;
  title: string;
  propertyType: string;
  location: string;
  views: string;
  image: any;
  videoUrl?: string;
}

const REELS_DATA: ReelItem[] = [
  {
    id: "reel-1",
    title: "Infinity Pool Villa Sunset View",
    propertyType: "Villa",
    location: "Lonavala",
    views: "24.5K",
    image: require("../../../assets/brand/Villabanner.jpg"),
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
  },
  {
    id: "reel-2",
    title: "Pawna Lakeside Bonfire & Acoustic Stays",
    propertyType: "Camp",
    location: "Pawna Lake",
    views: "18.2K",
    image: require("../../../assets/brand/Campbanner.jpg"),
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
  },
  {
    id: "reel-3",
    title: "Forest Wooden Cottage Morning Mist",
    propertyType: "Cottage",
    location: "Kamshet",
    views: "12.8K",
    image: require("../../../assets/brand/Cottagebanner.jpg"),
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
  },
  {
    id: "reel-4",
    title: "Luxury Suite with Private Jacuzzi",
    propertyType: "Hotel",
    location: "Alibaug",
    views: "31.0K",
    image: require("../../../assets/brand/Hotelbanner.jpg"),
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
  },
];

export default function ShortsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedVideo, setSelectedVideo] = useState<ReelItem | null>(null);

  const handleOpenVideo = async (reel: ReelItem) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setSelectedVideo(reel);
  };

  const bottomPadding = Math.max(insets.bottom, 10) + 80;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTag}>FEATURED SHORTS</Text>
          <Text style={styles.headerTitle}>
            Trending <Text style={{ color: Colors.primary }}>Stays & Reels</Text>
          </Text>
        </View>
        <View style={styles.badgePill}>
          <Ionicons name="flame" size={14} color="#FF5A1F" style={{ marginRight: 4 }} />
          <Text style={styles.badgePillText}>Live Tours</Text>
        </View>
      </View>

      {/* Grid of Reels */}
      <FlatList
        data={REELS_DATA}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleOpenVideo(item)}
            style={styles.reelCard}
          >
            <Image source={item.image} style={styles.reelImage} resizeMode="cover" />
            <LinearGradient
              colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.85)"]}
              style={styles.gradient}
            />

            {/* Top View Badge */}
            <View style={styles.topBadgeRow}>
              <View style={styles.viewsBadge}>
                <Ionicons name="eye" size={10} color="#FF6900" style={{ marginRight: 3 }} />
                <Text style={styles.viewsText}>{item.views}</Text>
              </View>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{item.propertyType}</Text>
              </View>
            </View>

            {/* Center Play Button */}
            <View style={styles.playCenter}>
              <View style={styles.playCircle}>
                <Ionicons name="play" size={20} color="#FFFFFF" style={{ marginLeft: 2 }} />
              </View>
            </View>

            {/* Bottom Title & Location */}
            <View style={styles.bottomInfo}>
              <Text style={styles.reelTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={11} color="rgba(255,255,255,0.7)" />
                <Text style={styles.locationText}>{item.location}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Video Modal Preview */}
      <Modal
        visible={!!selectedVideo}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedVideo(null)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {selectedVideo?.title}
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedVideo(null)}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
          {selectedVideo?.videoUrl && (
            <WebView
              source={{ uri: selectedVideo.videoUrl }}
              style={styles.webview}
              allowsFullscreenVideo
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTag: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FF5A1F",
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FDBA74",
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#EA580C",
  },
  listContent: {
    padding: 14,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 14,
  },
  reelCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#111827",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  reelImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBadgeRow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  viewsText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
  typeBadge: {
    backgroundColor: "#FF5A1F",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  playCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomInfo: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
  },
  reelTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 3,
  },
  locationText: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 10,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    marginRight: 10,
  },
  closeBtn: {
    padding: 4,
  },
  webview: {
    flex: 1,
  },
});
