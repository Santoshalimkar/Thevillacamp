import React, { createContext, useContext, useEffect, useState } from "react";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { fetchWishlist, toggleWishlistApi } from "../services/bookingService";
import { PropertyItem } from "../services/propertyService";

const WISHLIST_STORAGE_KEY = "thevilla_wishlist_ids";

interface WishlistContextType {
  wishlistIds: string[];
  wishlistItems: PropertyItem[];
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (property: PropertyItem) => Promise<void>;
  isLoading: boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType>({} as WishlistContextType);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [wishlistItems, setWishlistItems] = useState<PropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCachedWishlist();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      loadRemoteWishlist(user._id);
    }
  }, [isAuthenticated, user?._id]);

  const loadCachedWishlist = async () => {
    try {
      const cached = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
      if (cached) {
        setWishlistIds(JSON.parse(cached));
      }
    } catch {}
  };

  const loadRemoteWishlist = async (userId: string) => {
    setIsLoading(true);
    try {
      const res = await fetchWishlist(userId);
      if (res?.success && Array.isArray(res.data)) {
        const ids = res.data.map((item: any) => item.propertyId?._id || item._id || item.propertyId);
        setWishlistIds(ids);
        setWishlistItems(res.data.map((item: any) => item.propertyId || item));
        await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const isWishlisted = (id: string) => wishlistIds.includes(id);

  const toggleWishlist = async (property: PropertyItem) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const id = property._id || (property as any).id;
    if (!id) return;

    // Optimistic toggle
    const exists = wishlistIds.includes(id);
    const newIds = exists ? wishlistIds.filter((i) => i !== id) : [...wishlistIds, id];
    setWishlistIds(newIds);
    if (exists) {
      setWishlistItems((prev) => prev.filter((p) => (p._id || (p as any).id) !== id));
    } else {
      setWishlistItems((prev) => [property, ...prev]);
    }

    try {
      await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(newIds));
      if (isAuthenticated && user?._id) {
        await toggleWishlistApi(id, user._id);
      }
    } catch {
      // Revert if critical error
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistItems,
        isWishlisted,
        toggleWishlist,
        isLoading,
        refreshWishlist: () => loadRemoteWishlist(user?._id || ""),
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
