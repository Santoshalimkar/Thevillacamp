import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Colors } from "../../theme/colors";

interface StayTypeOption {
  id: string;
  name: string;
  description: string;
  image: any;
  fallbackIcon: keyof typeof Ionicons.glyphMap;
}

const STAY_TYPES: StayTypeOption[] = [
  {
    id: "villa",
    name: "Villa",
    description: "Private pools & luxury estates",
    image: require("../../../assets/brand/Villaimg.png"),
    fallbackIcon: "home",
  },
  {
    id: "camping",
    name: "Camping",
    description: "Lakeside tents & bonfire nights",
    image: require("../../../assets/brand/Campimg.png"),
    fallbackIcon: "bonfire",
  },
  {
    id: "cottage",
    name: "Cottage",
    description: "Cozy nature & hill retreats",
    image: require("../../../assets/brand/Cottageimg.png"),
    fallbackIcon: "leaf",
  },
  {
    id: "hotel",
    name: "Hotel",
    description: "Resorts & boutique suites",
    image: require("../../../assets/brand/Hotelimg.png"),
    fallbackIcon: "business",
  },
];

interface StayTypeDrawerProps {
  visible: boolean;
  selectedId: string;
  onSelect: (id: string, name: string) => void;
  onClose: () => void;
}

export const StayTypeDrawer: React.FC<StayTypeDrawerProps> = ({
  visible,
  selectedId,
  onSelect,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [currentSelected, setCurrentSelected] = React.useState(selectedId || "villa");

  React.useEffect(() => {
    if (selectedId) setCurrentSelected(selectedId);
  }, [selectedId]);

  const handleChoose = async (item: StayTypeOption) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setCurrentSelected(item.id);
  };

  const handleApply = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    const found = STAY_TYPES.find((t) => t.id === currentSelected) || STAY_TYPES[0];
    onSelect(found.id, found.name);
    onClose();
  };

  const bottomPadding = Math.max(insets.bottom, 14);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.sheetContainer, { paddingBottom: bottomPadding }]}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextCol}>
              <Text style={styles.title}>Choose Stay Type</Text>
              <Text style={styles.subtitle}>Explore handpicked properties for your getaway</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* Options List */}
          <View style={styles.optionsList}>
            {STAY_TYPES.map((item) => {
              const isSelected =
                currentSelected.toLowerCase() === item.id.toLowerCase() ||
                (currentSelected.toLowerCase() === "all" && item.id === "villa");

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => handleChoose(item)}
                  activeOpacity={0.85}
                >
                  {/* Thumbnail / Icon */}
                  <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                    <Image source={item.image} style={styles.optionImg} resizeMode="contain" />
                  </View>

                  {/* Details */}
                  <View style={styles.details}>
                    <Text style={styles.optionName}>{item.name}</Text>
                    <Text style={styles.optionDesc}>{item.description}</Text>
                  </View>

                  {/* Radio / Checkmark */}
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Apply Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.88}>
              <Text style={styles.applyBtnText}>Apply Stay Type</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginTop: 6,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTextCol: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  optionsList: {
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 10,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: "#FFF7ED",
    borderWidth: 1.5,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  iconBoxSelected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FED7AA",
  },
  optionImg: {
    width: 32,
    height: 32,
  },
  details: {
    flex: 1,
  },
  optionName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  optionDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginTop: 14,
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
