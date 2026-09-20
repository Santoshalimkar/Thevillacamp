import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "../theme/colors";
import { CATEGORIES } from "../services/propertyService";
import { useSearch } from "../context/SearchContext";

const ASSET_ICONS: Record<string, any> = {
  villa: require("../../assets/brand/villa.png"),
  camping: require("../../assets/brand/camp.png"),
  cottage: require("../../assets/brand/cottage.png"),
  hotel: require("../../assets/brand/hotel.png"),
};

export const CategoryBar: React.FC = () => {
  const { activeCategory, setActiveCategory } = useSearch();

  const handleSelect = async (slug: string) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setActiveCategory(slug);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.slug;
          const imageSource = ASSET_ICONS[cat.slug];

          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.7}
              onPress={() => handleSelect(cat.slug)}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
                {imageSource ? (
                  <Image
                    source={imageSource}
                    style={[
                      styles.iconImage,
                      isActive && { tintColor: Colors.primary },
                    ]}
                    resizeMode="contain"
                  />
                ) : (
                  <Ionicons
                    name="sparkles"
                    size={20}
                    color={isActive ? Colors.primary : Colors.textSecondary}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                ]}
              >
                {cat.name}
              </Text>
              {isActive && <View style={styles.activeLine} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 20,
  },
  tab: {
    alignItems: "center",
    paddingBottom: 10,
    minWidth: 62,
    position: "relative",
  },
  tabActive: {},
  iconBox: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  iconBoxActive: {},
  iconImage: {
    width: 24,
    height: 24,
    tintColor: Colors.textSecondary,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    letterSpacing: -0.1,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: "700",
  },
  activeLine: {
    position: "absolute",
    bottom: 0,
    left: 4,
    right: 4,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
});
