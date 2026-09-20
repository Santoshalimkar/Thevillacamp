import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Colors } from "../../theme/colors";
import { HolidayService, LongWeekendItem } from "../../services/holidayService";
import { HolidayCard } from "./HolidayCard";

interface DatePickerModalProps {
  visible: boolean;
  initialCheckIn: string | null;
  initialCheckOut: string | null;
  onApply: (checkIn: string | null, checkOut: string | null) => void;
  onClose: () => void;
}

const DAYS_OF_WEEK = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  initialCheckIn,
  initialCheckOut,
  onApply,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedIn, setSelectedIn] = useState<Date | null>(
    initialCheckIn ? new Date(initialCheckIn) : null
  );
  const [selectedOut, setSelectedOut] = useState<Date | null>(
    initialCheckOut ? new Date(initialCheckOut) : null
  );
  const [selectedLwId, setSelectedLwId] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialCheckIn) setSelectedIn(new Date(initialCheckIn));
    else setSelectedIn(null);
    if (initialCheckOut) setSelectedOut(new Date(initialCheckOut));
    else setSelectedOut(null);
  }, [initialCheckIn, initialCheckOut, visible]);

  const longWeekends = useMemo(() => HolidayService.getLongWeekends(), []);

  const handleSelectLw = async (lw: LongWeekendItem) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const inDate = new Date(lw.startDate);
    const outDate = new Date(lw.endDate);
    setSelectedIn(inDate);
    setSelectedOut(outDate);
    setSelectedLwId(lw.id);
  };

  const handleClear = () => {
    setSelectedIn(null);
    setSelectedOut(null);
    setSelectedLwId(null);
  };

  const handleDatePress = async (targetDate: Date) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setSelectedLwId(null);

    const clicked = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );

    if (!selectedIn || (selectedIn && selectedOut)) {
      setSelectedIn(clicked);
      setSelectedOut(null);
    } else if (selectedIn) {
      if (clicked.getTime() < selectedIn.getTime()) {
        setSelectedIn(clicked);
        setSelectedOut(null);
      } else if (clicked.getTime() === selectedIn.getTime()) {
        setSelectedIn(null);
        setSelectedOut(null);
      } else {
        setSelectedOut(clicked);
      }
    }
  };

  const numberOfNights = useMemo(() => {
    if (selectedIn && selectedOut) {
      const diff = Math.round(
        (selectedOut.getTime() - selectedIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diff > 0 ? diff : 0;
    }
    return 0;
  }, [selectedIn, selectedOut]);

  const formatDateString = (dt: Date | null) => {
    if (!dt) return "";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(dt);
  };

  const handleDone = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    const inStr = selectedIn ? selectedIn.toISOString().split("T")[0] : null;
    const outStr = selectedOut ? selectedOut.toISOString().split("T")[0] : null;
    onApply(inStr, outStr);
    onClose();
  };

  // Generate 6 upcoming months from today
  const months = useMemo(() => {
    const list: Date[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      list.push(new Date(now.getFullYear(), now.getMonth() + i, 1));
    }
    return list;
  }, []);

  const todayMidnight = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const renderMonth = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(monthDate);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const cells: React.ReactNode[] = [];

    // Empty offset cells
    for (let i = 0; i < firstDay; i++) {
      cells.push(<View key={`empty-${month}-${i}`} style={styles.dayCellWrapper} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      const isPast = currentDay.getTime() < todayMidnight.getTime();

      const yyyy = currentDay.getFullYear();
      const mm = String(currentDay.getMonth() + 1).padStart(2, "0");
      const dd = String(currentDay.getDate()).padStart(2, "0");
      const dateKey = `${yyyy}-${mm}-${dd}`;

      const isHoliday = HolidayService.isHoliday(dateKey);
      const isLw = HolidayService.isLongWeekend(dateKey);

      const isCheckIn =
        selectedIn && currentDay.toDateString() === selectedIn.toDateString();
      const isCheckOut =
        selectedOut && currentDay.toDateString() === selectedOut.toDateString();
      const isInRange =
        selectedIn &&
        selectedOut &&
        currentDay.getTime() > selectedIn.getTime() &&
        currentDay.getTime() < selectedOut.getTime();

      const isRangeLeading = isCheckIn && selectedOut;
      const isRangeTrailing = isCheckOut && selectedIn;

      cells.push(
        <TouchableOpacity
          key={`day-${month}-${day}`}
          style={styles.dayCellWrapper}
          onPress={() => !isPast && handleDatePress(currentDay)}
          disabled={isPast}
          activeOpacity={0.7}
        >
          {/* Continuous Range Strip Background */}
          {(isInRange || isRangeLeading || isRangeTrailing) && (
            <View
              style={[
                styles.rangeStrip,
                isInRange && styles.rangeStripMiddle,
                isRangeLeading && styles.rangeStripLeading,
                isRangeTrailing && styles.rangeStripTrailing,
              ]}
            />
          )}

          {/* Date Circle */}
          <View
            style={[
              styles.dateCircle,
              (isCheckIn || isCheckOut) && styles.dateCircleSelected,
            ]}
          >
            <Text
              style={[
                styles.dayNum,
                isPast && styles.dayNumPast,
                (isCheckIn || isCheckOut) && styles.dayNumSelected,
              ]}
            >
              {day}
            </Text>

            {/* Holiday Dot Marker */}
            {isHoliday && !isCheckIn && !isCheckOut && (
              <View style={styles.holidayDotAmber} />
            )}
            {!isHoliday && isLw && !isCheckIn && !isCheckOut && (
              <View style={styles.holidayDotGreen} />
            )}
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View key={`${year}-${month}`} style={styles.monthSection}>
        <Text style={styles.monthHeader}>
          {monthName} {year}
        </Text>
        <View style={styles.daysGrid}>{cells}</View>
      </View>
    );
  };

  const bottomInset = Math.max(insets.bottom, 12);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={22} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Select Stay Dates</Text>
          </View>

          {(selectedIn || selectedOut) && (
            <TouchableOpacity onPress={handleClear} activeOpacity={0.7}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Long Weekend Auto-Select Strip */}
        {longWeekends && longWeekends.length > 0 && (
          <View style={styles.lwStrip}>
            <View style={styles.lwHeaderRow}>
              <View style={styles.lwTitleBox}>
                <Ionicons name="sparkles" size={13} color="#D97706" style={{ marginRight: 4 }} />
                <Text style={styles.lwTitle}>
                  Upcoming Indian Long Weekends ({longWeekends.length})
                </Text>
              </View>
              <Text style={styles.lwHint}>Tap to auto-select</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.lwScrollContent}
            >
              {longWeekends.map((lw) => {
                const sFmt = formatDateString(new Date(lw.startDate));
                const eFmt = formatDateString(new Date(lw.endDate));
                const isSelected = selectedLwId === lw.id;

                return (
                  <HolidayCard
                    key={lw.id}
                    name={lw.holidayNames?.[0] || lw.title}
                    totalDays={lw.totalDays}
                    dateRange={`${sFmt} - ${eFmt}`}
                    isSelected={isSelected}
                    onPress={() => handleSelectLw(lw)}
                  />
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Days of Week Row */}
        <View style={styles.weekdayRow}>
          {DAYS_OF_WEEK.map((d) => (
            <Text key={d} style={styles.weekdayText}>
              {d}
            </Text>
          ))}
        </View>

        {/* Calendar Scroll */}
        <ScrollView
          style={styles.calendarScroll}
          contentContainerStyle={{ paddingBottom: 110 + bottomInset }}
          showsVerticalScrollIndicator={false}
        >
          {months.map(renderMonth)}
        </ScrollView>

        {/* Bottom Floating Bar */}
        <View style={[styles.bottomBar, { paddingBottom: bottomInset + 8 }]}>
          <View style={styles.bottomInfo}>
            <Text style={styles.nightsText}>
              {numberOfNights > 0
                ? `${numberOfNights} ${numberOfNights === 1 ? "night" : "nights"}`
                : selectedIn
                ? "Select checkout date"
                : "Select check-in date"}
            </Text>
            <Text style={styles.datesDisplay}>
              {selectedIn ? formatDateString(selectedIn) : "Check-in"} –{" "}
              {selectedOut ? formatDateString(selectedOut) : "Check-out"}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.doneBtn,
              (!selectedIn || !selectedOut) && styles.doneBtnDisabled,
            ]}
            onPress={handleDone}
            disabled={!selectedIn || !selectedOut}
            activeOpacity={0.88}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  clearText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
    textDecorationLine: "underline",
  },
  lwStrip: {
    backgroundColor: "#FFFBEB",
    borderBottomWidth: 1,
    borderBottomColor: "#FEF3C7",
    paddingVertical: 10,
  },
  lwHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  lwTitleBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  lwTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#78350F",
  },
  lwHint: {
    fontSize: 11,
    fontWeight: "600",
    color: "#B45309",
  },
  lwScrollContent: {
    paddingHorizontal: 16,
  },
  weekdayRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    color: "#9CA3AF",
  },
  calendarScroll: {
    flex: 1,
  },
  monthSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  monthHeader: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCellWrapper: {
    width: "14.285%",
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  rangeStrip: {
    position: "absolute",
    top: 4,
    bottom: 4,
    backgroundColor: "#F3F4F6",
  },
  rangeStripMiddle: {
    left: 0,
    right: 0,
  },
  rangeStripLeading: {
    left: "50%",
    right: 0,
  },
  rangeStripTrailing: {
    left: 0,
    right: "50%",
  },
  dateCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  dateCircleSelected: {
    backgroundColor: "#111827",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  dayNum: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
  },
  dayNumPast: {
    color: "#D1D5DB",
    textDecorationLine: "line-through",
  },
  dayNumSelected: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  holidayDotAmber: {
    position: "absolute",
    bottom: 3,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#F59E0B",
  },
  holidayDotGreen: {
    position: "absolute",
    bottom: 3,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#10B981",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
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
  bottomInfo: {
    flex: 1,
  },
  nightsText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  datesDisplay: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
  },
  doneBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnDisabled: {
    opacity: 0.35,
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
