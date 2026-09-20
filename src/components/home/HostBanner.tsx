import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "../../theme/colors";

export const HostBanner: React.FC = () => {
  const handlePress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    Linking.openURL("https://thevillacamp.com/become-host");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btn} onPress={handlePress} activeOpacity={0.88}>
        <Text style={styles.btnText}>List your villa now</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  btn: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});
