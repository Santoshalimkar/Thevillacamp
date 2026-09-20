import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Colors } from "../../theme/colors";
import { GuestCountState } from "../../context/SearchContext";

interface GuestDrawerProps {
  visible: boolean;
  guests: GuestCountState;
  onUpdate: (type: keyof GuestCountState, value: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export const GuestDrawer: React.FC<GuestDrawerProps> = ({
  visible,
  guests,
  onUpdate,
  onConfirm,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  const totalGuests = (guests.adults || 1) + (guests.childrenn || 0);

  const summaryPill = React.useMemo(() => {
    const parts = [`${totalGuests} Guest${totalGuests > 1 ? "s" : ""}`];
    if (guests.infants > 0) {
      parts.push(`${guests.infants} Infant${guests.infants > 1 ? "s" : ""}`);
    }
    if (guests.pets > 0) {
      parts.push(`${guests.pets} Pet${guests.pets > 1 ? "s" : ""}`);
    }
    return parts.join(" • ");
  }, [totalGuests, guests.infants, guests.pets]);

  const handleStep = async (type: keyof GuestCountState, delta: number, min: number) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    const current = guests[type] || 0;
    const next = Math.max(min, current + delta);
    onUpdate(type, next);
  };

  const handleApply = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onConfirm();
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
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconBox}>
                <Ionicons name="people" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Who's Coming?</Text>
                <Text style={styles.subtitle}>{summaryPill}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* Counter Rows */}
          <View style={styles.rowsContainer}>
            {/* Adults */}
            <View style={styles.counterRow}>
              <View style={styles.labelCol}>
                <Text style={styles.rowLabel}>Adults</Text>
                <Text style={styles.rowHint}>Ages 13 or above</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={[styles.counterBtn, (guests.adults || 1) <= 1 && styles.counterBtnDisabled]}
                  onPress={() => handleStep("adults", -1, 1)}
                  disabled={(guests.adults || 1) <= 1}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="remove"
                    size={16}
                    color={(guests.adults || 1) <= 1 ? "#D1D5DB" : "#111827"}
                  />
                </TouchableOpacity>
                <Text style={styles.counterVal}>{guests.adults || 1}</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => handleStep("adults", 1, 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color="#111827" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Children */}
            <View style={styles.counterRow}>
              <View style={styles.labelCol}>
                <Text style={styles.rowLabel}>Children</Text>
                <Text style={styles.rowHint}>Ages 2–12 years</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={[styles.counterBtn, (guests.childrenn || 0) <= 0 && styles.counterBtnDisabled]}
                  onPress={() => handleStep("childrenn", -1, 0)}
                  disabled={(guests.childrenn || 0) <= 0}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="remove"
                    size={16}
                    color={(guests.childrenn || 0) <= 0 ? "#D1D5DB" : "#111827"}
                  />
                </TouchableOpacity>
                <Text style={styles.counterVal}>{guests.childrenn || 0}</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => handleStep("childrenn", 1, 0)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color="#111827" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Infants */}
            <View style={styles.counterRow}>
              <View style={styles.labelCol}>
                <Text style={styles.rowLabel}>Infants</Text>
                <Text style={styles.rowHint}>Under 2 years (doesn't count toward max)</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={[styles.counterBtn, (guests.infants || 0) <= 0 && styles.counterBtnDisabled]}
                  onPress={() => handleStep("infants", -1, 0)}
                  disabled={(guests.infants || 0) <= 0}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="remove"
                    size={16}
                    color={(guests.infants || 0) <= 0 ? "#D1D5DB" : "#111827"}
                  />
                </TouchableOpacity>
                <Text style={styles.counterVal}>{guests.infants || 0}</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => handleStep("infants", 1, 0)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color="#111827" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Pets */}
            <View style={[styles.counterRow, { borderBottomWidth: 0 }]}>
              <View style={styles.labelCol}>
                <Text style={styles.rowLabel}>Pets</Text>
                <Text style={styles.rowHint}>Bringing a service animal or companion?</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={[styles.counterBtn, (guests.pets || 0) <= 0 && styles.counterBtnDisabled]}
                  onPress={() => handleStep("pets", -1, 0)}
                  disabled={(guests.pets || 0) <= 0}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="remove"
                    size={16}
                    color={(guests.pets || 0) <= 0 ? "#D1D5DB" : "#111827"}
                  />
                </TouchableOpacity>
                <Text style={styles.counterVal}>{guests.pets || 0}</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => handleStep("pets", 1, 0)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color="#111827" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Confirm Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.88}>
              <Text style={styles.applyBtnText}>Confirm Guests ({totalGuests})</Text>
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
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "700",
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
  rowsContainer: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  labelCol: {
    flex: 1,
    paddingRight: 12,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  rowHint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  counterControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  counterBtnDisabled: {
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  counterVal: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    minWidth: 20,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginTop: 4,
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
