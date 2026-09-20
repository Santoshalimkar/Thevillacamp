import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Image,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

export const FloatingMascot: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handlePress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    router.push("/(tabs)/concierge" as any);
  };

  const bottomOffset = Math.max(insets.bottom, 10) + 70;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[styles.container, { bottom: bottomOffset }]}
    >
      <View style={styles.mascotCircle}>
        <Image
          source={require("../../assets/brand/ai-mascot.png")}
          style={styles.mascotImage}
          resizeMode="cover"
        />
        {/* Active Online Indicator */}
        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 18,
    zIndex: 99,
  },
  mascotCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    borderWidth: 2.5,
    borderColor: "#FDBA74",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#FF5A1F",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  mascotImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
  },
});
