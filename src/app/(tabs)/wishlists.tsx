import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../theme/colors";
import { PropertyCard } from "../../components/PropertyCard";
import { useWishlist } from "../../context/WishlistContext";

export default function WishlistsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { wishlistItems, wishlistIds } = useWishlist();

  const bottomPadding = Math.max(insets.bottom, 10) + 80;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTag}>FAVORITES</Text>
        <Text style={styles.headerTitle}>
          Saved <Text style={{ color: Colors.primary }}>Wishlists</Text>
        </Text>
        <Text style={styles.headerSubtitle}>
          {wishlistIds.length} {wishlistIds.length === 1 ? "saved stay" : "saved stays"}
        </Text>
      </View>

      {wishlistItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-outline" size={36} color={Colors.heartRed} />
          </View>
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtitle}>
            As you explore, tap the heart icon on any villa or campsite to save it to your wishlist.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.push("/(tabs)/stays" as any)}
          >
            <Text style={styles.exploreBtnText}>Explore Stays</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={(item, index) => item._id || item.id || `wish-${index}`}
          renderItem={({ item }) => <PropertyCard property={item} />}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
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
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 36,
    marginTop: 60,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  exploreBtn: {
    marginTop: 20,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: "#FF5A1F",
  },
  exploreBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  listContent: {
    paddingTop: 14,
  },
});
