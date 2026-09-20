import React, { createContext, useContext, useState, useMemo } from "react";
import { CATEGORIES } from "../services/propertyService";

export interface GuestCountState {
  adults: number;
  childrenn: number;
  infants: number;
  pets: number;
}

interface SearchContextType {
  // Stay type / Category
  stayType: string;
  stayTypeName: string;
  setStayType: (type: string, name: string) => void;

  // Dates
  checkIn: string | null;
  checkOut: string | null;
  setDates: (inDate: string | null, outDate: string | null) => void;
  numberOfNights: number;
  dateDisplay: string;

  // Guests
  selectedGuest: GuestCountState;
  updateGuestCount: (type: keyof GuestCountState, value: number) => void;
  isGuestSelected: boolean;
  setIsGuestSelected: (selected: boolean) => void;
  guestSummary: string;
  totalGuests: number;

  // Backward-compatible fields
  destination: string;
  setDestination: (dest: string) => void;
  guests: number;
  setGuests: (count: number) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  activeCategoryId: string;
  setActiveCategoryId: (catIdOrSlug: string | null) => void;
  priceMin: number | null;
  priceMax: number | null;
  setPriceRange: (min: number | null, max: number | null) => void;
  clearFilters: () => void;
  resetAllFilters: () => void;
  isFiltered: boolean;
  searchSummary: string;
}

const SearchContext = createContext<SearchContextType>({} as SearchContextType);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stayType, setStayTypeState] = useState<string>("villa");
  const [stayTypeName, setStayTypeName] = useState<string>("Villa");
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);

  const [selectedGuest, setSelectedGuest] = useState<GuestCountState>({
    adults: 1,
    childrenn: 0,
    infants: 0,
    pets: 0,
  });
  const [isGuestSelected, setIsGuestSelected] = useState<boolean>(false);

  // Backward compatibility
  const [destination, setDestination] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("villa");
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);

  const setStayType = (type: string, name: string) => {
    setStayTypeState(type);
    setStayTypeName(name);
    setActiveCategory(type.toLowerCase());
  };

  const setDates = (inDate: string | null, outDate: string | null) => {
    setCheckIn(inDate);
    setCheckOut(outDate);
  };

  const updateGuestCount = (type: keyof GuestCountState, value: number) => {
    setSelectedGuest((prev) => ({
      ...prev,
      [type]: Math.max(0, value),
    }));
  };

  // Compute number of nights
  const numberOfNights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    try {
      const inD = new Date(checkIn);
      const outD = new Date(checkOut);
      const diff = Math.round((outD.getTime() - inD.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  }, [checkIn, checkOut]);

  // Formatted date display string
  const dateDisplay = useMemo(() => {
    if (checkIn && checkOut) {
      try {
        const inD = new Date(checkIn);
        const outD = new Date(checkOut);
        const inFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(inD);
        const outFmt = new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }).format(outD);
        return `${inFmt} – ${outFmt}`;
      } catch {
        return `${checkIn} – ${checkOut}`;
      }
    }
    if (checkIn) {
      try {
        const inD = new Date(checkIn);
        const inFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(inD);
        return `${inFmt} (Select checkout)`;
      } catch {
        return checkIn;
      }
    }
    return "Select Check-in & Check-out";
  }, [checkIn, checkOut]);

  // Guest summary calculation matching web
  const totalGuests = (selectedGuest.adults || 1) + (selectedGuest.childrenn || 0);

  const guestSummary = useMemo(() => {
    if (!isGuestSelected && totalGuests === 1 && selectedGuest.infants === 0 && selectedGuest.pets === 0) {
      return "Add guests";
    }
    const parts = [`${totalGuests} Guest${totalGuests > 1 ? "s" : ""}`];
    if (selectedGuest.infants > 0) {
      parts.push(`${selectedGuest.infants} Infant${selectedGuest.infants > 1 ? "s" : ""}`);
    }
    if (selectedGuest.pets > 0) {
      parts.push(`${selectedGuest.pets} Pet${selectedGuest.pets > 1 ? "s" : ""}`);
    }
    return parts.join(", ");
  }, [selectedGuest, isGuestSelected, totalGuests]);

  const matchedCat = CATEGORIES.find((c) => c.slug === activeCategory);
  const activeCategoryId = matchedCat?.categoryId || "";

  const setActiveCategoryId = (catIdOrSlug: string | null) => {
    if (!catIdOrSlug || catIdOrSlug === "all") {
      setActiveCategory("all");
      setStayTypeState("all");
      setStayTypeName("All Stays");
      return;
    }
    const found = CATEGORIES.find(
      (c) => c.slug === catIdOrSlug || c.categoryId === catIdOrSlug || c.id === catIdOrSlug
    );
    if (found) {
      setActiveCategory(found.slug);
      setStayTypeState(found.slug);
      setStayTypeName(found.name);
    } else {
      setActiveCategory(catIdOrSlug);
      setStayTypeState(catIdOrSlug);
      setStayTypeName(catIdOrSlug.charAt(0).toUpperCase() + catIdOrSlug.slice(1));
    }
  };

  const setPriceRange = (min: number | null, max: number | null) => {
    setPriceMin(min);
    setPriceMax(max);
  };

  const resetAllFilters = () => {
    setStayTypeState("villa");
    setStayTypeName("Villa");
    setCheckIn(null);
    setCheckOut(null);
    setSelectedGuest({ adults: 1, childrenn: 0, infants: 0, pets: 0 });
    setIsGuestSelected(false);
    setDestination("");
    setActiveCategory("villa");
    setPriceMin(null);
    setPriceMax(null);
  };

  const clearFilters = resetAllFilters;

  const isFiltered = !!(
    destination ||
    checkIn ||
    checkOut ||
    totalGuests > 1 ||
    selectedGuest.infants > 0 ||
    selectedGuest.pets > 0 ||
    activeCategory !== "all" ||
    priceMin !== null ||
    priceMax !== null
  );

  const searchSummary = (() => {
    const parts: string[] = [];
    parts.push(stayTypeName || "Anywhere");
    if (checkIn && checkOut) parts.push(dateDisplay);
    else parts.push("Any week");

    if (totalGuests > 1 || isGuestSelected) parts.push(`${totalGuests} guests`);
    else parts.push("Add guests");

    return parts.join(" • ");
  })();

  return (
    <SearchContext.Provider
      value={{
        stayType,
        stayTypeName,
        setStayType,
        checkIn,
        checkOut,
        setDates,
        numberOfNights,
        dateDisplay,
        selectedGuest,
        updateGuestCount,
        isGuestSelected,
        setIsGuestSelected,
        guestSummary,
        totalGuests,
        destination,
        setDestination,
        guests: totalGuests,
        setGuests: (cnt: number) => updateGuestCount("adults", cnt),
        activeCategory,
        setActiveCategory,
        activeCategoryId,
        setActiveCategoryId,
        priceMin,
        priceMax,
        setPriceRange,
        clearFilters,
        resetAllFilters,
        isFiltered,
        searchSummary,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
