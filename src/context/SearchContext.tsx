import React, { createContext, useContext, useState } from "react";
import { CATEGORIES } from "../services/propertyService";

interface SearchContextType {
  destination: string;
  setDestination: (dest: string) => void;
  checkIn: string | null;
  setCheckIn: (date: string | null) => void;
  checkOut: string | null;
  setCheckOut: (date: string | null) => void;
  guests: number;
  setGuests: (count: number) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  activeCategoryId: string;
  priceMin: number | null;
  priceMax: number | null;
  setPriceRange: (min: number | null, max: number | null) => void;
  clearFilters: () => void;
  isFiltered: boolean;
  searchSummary: string;
}

const SearchContext = createContext<SearchContextType>({} as SearchContextType);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [destination, setDestination] = useState<string>("");
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);

  const matchedCat = CATEGORIES.find((c) => c.slug === activeCategory);
  const activeCategoryId = matchedCat?.categoryId || "";

  const setPriceRange = (min: number | null, max: number | null) => {
    setPriceMin(min);
    setPriceMax(max);
  };

  const clearFilters = () => {
    setDestination("");
    setCheckIn(null);
    setCheckOut(null);
    setGuests(1);
    setActiveCategory("all");
    setPriceMin(null);
    setPriceMax(null);
  };

  const isFiltered = !!(
    destination ||
    checkIn ||
    checkOut ||
    guests > 1 ||
    activeCategory !== "all" ||
    priceMin !== null ||
    priceMax !== null
  );

  const searchSummary = (() => {
    const parts: string[] = [];
    if (destination) parts.push(destination);
    else parts.push("Anywhere");

    if (checkIn && checkOut) parts.push(`${checkIn} - ${checkOut}`);
    else parts.push("Any week");

    if (guests > 1) parts.push(`${guests} guests`);
    else parts.push("Add guests");

    return parts.join(" • ");
  })();

  return (
    <SearchContext.Provider
      value={{
        destination,
        setDestination,
        checkIn,
        setCheckIn,
        checkOut,
        setCheckOut,
        guests,
        setGuests,
        activeCategory,
        setActiveCategory,
        activeCategoryId,
        priceMin,
        priceMax,
        setPriceRange,
        clearFilters,
        isFiltered,
        searchSummary,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
