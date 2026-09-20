import { api, API_BASE_URL } from "./api";

export const CATEGORY_IDS = {
  ALL: "",
  VILLA: "6881f134f913338ef00dc750",
  CAMPING: "688277b8b1e412cebf53db1b",
  COTTAGE: "688cd5a16933bde04818ebea",
  HOTEL: "688de083f45eb5f578d74bbf",
};

export const CATEGORIES = [
  { id: "all", name: "All Stays", slug: "all", icon: "sparkles", categoryId: "" },
  { id: "villa", name: "Villas", slug: "villa", icon: "home", categoryId: CATEGORY_IDS.VILLA },
  { id: "camping", name: "Camps", slug: "camping", icon: "tent", categoryId: CATEGORY_IDS.CAMPING },
  { id: "cottage", name: "Cottages", slug: "cottage", icon: "trees", categoryId: CATEGORY_IDS.COTTAGE },
  { id: "hotel", name: "Hotels", slug: "hotel", icon: "building", categoryId: CATEGORY_IDS.HOTEL },
];

export interface PropertyItem {
  _id: string;
  id?: string;
  name: string;
  title?: string;
  description?: string;
  images: string[];
  propertyImage?: string;
  price?: number | { basePrice?: number; weekendPrice?: number; weekdayPrice?: number };
  basePrice?: number;
  weekendPrice?: number;
  weekdayPrice?: number;
  pricing?: {
    basePrice?: number;
    weekendPrice?: number;
    weekdayPrice?: number;
    cleaningFee?: number;
    taxRate?: number;
  };
  address?: {
    city?: string;
    state?: string;
    addressLine?: string;
    locationName?: string;
    coordinates?: [number, number];
  };
  coordinates?: {
    lat?: number;
    lng?: number;
  };
  city?: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  reviewsCount?: number;
  bhkType?: string;
  roomType?: string;
  category?: any;
  categoryId?: string;
  type?: string;
  maxGuests?: number;
  capacity?: {
    adults?: number;
    children?: number;
    maxGuests?: number;
  };
  amenities?: string[];
  facilities?: string[];
  rules?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  featured?: boolean;
  isFeatured?: boolean;
  propertyName?: string;
  bedrooms?: number;
  rooms?: number;
  baths?: number;
  maxCapacity?: number;
  averageRating?: number;
  totalReviews?: number;
  greatFor?: string[];
  topamenities?: string[];
  reelVideo?: string;
  owner?: any;
  isSuperhost?: boolean;
  badge?: string;
}

export interface DestinationItem {
  _id: string;
  name: string;
  description?: string;
  coverImage?: string;
  rating?: string | number;
  properties?: number;
  totalProperties?: number;
  location?: string;
}

export interface LocationItem {
  _id: string;
  name: string;
  isPopular?: boolean;
  coordinates?: [number, number];
}

export interface ReelItem {
  _id: string;
  title: string;
  videoUrl?: string;
  thumbnail?: string;
  views?: string | number;
  category?: string;
  creator?: string;
}

export interface GuestReviewItem {
  id: string;
  name: string;
  initials: string;
  country: string;
  rating: number;
  text: string;
  propertyName: string;
  verifiedStay: boolean;
}

export async function fetchProperties(params: {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  priceMin?: number;
  priceMax?: number;
  checkIn?: string;
  checkOut?: string;
}) {
  const query = new URLSearchParams();
  if (params.categoryId) query.append("categoryId", params.categoryId);
  if (params.search) query.append("search", params.search);
  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit || 20));
  if (params.sortBy) query.append("sortBy", params.sortBy);
  if (params.priceMin !== undefined) query.append("priceMin", String(params.priceMin));
  if (params.priceMax !== undefined) query.append("priceMax", String(params.priceMax));
  if (params.checkIn) query.append("checkIn", params.checkIn);
  if (params.checkOut) query.append("checkOut", params.checkOut);

  return api.get(`/User/properties/available?${query.toString()}`);
}

export async function fetchWeekendProperties(categoryId?: string) {
  const query = new URLSearchParams();
  if (categoryId && categoryId !== "all") query.append("categoryId", categoryId);
  return api.get(`/User/available-this-weekend?${query.toString()}`);
}

export async function fetchPropertyById(propertyId: string, categoryId?: string) {
  const cat = categoryId || CATEGORY_IDS.VILLA;
  const res = await api.get(`/User/property/${cat}/${propertyId}`);
  if (res?.success && res.data) return res;
  return api.get(`/User/properties/${propertyId}`);
}

export async function fetchDestinations(): Promise<{ success: boolean; data: DestinationItem[] }> {
  try {
    const res = await api.get(`/Location/highlights`);
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return { success: true, data: res.data as DestinationItem[] };
    }
  } catch {}

  // High quality curated fallbacks from Villa-web
  return {
    success: true,
    data: [
      {
        _id: "loc-lonavala",
        name: "Lonavala",
        description: "Scenic hill valleys & luxury pools",
        coverImage:
          "https://res.cloudinary.com/db60uwvhk/image/upload/v1753875530/villas/1bbfc3f9-181b-4015-858c-4f650f6b453f_qd0fep.jpg",
        rating: "5.0",
        properties: 12,
      },
      {
        _id: "loc-malavli",
        name: "Malavli",
        description: "Quiet green nature & mountain vistas",
        coverImage:
          "https://res.cloudinary.com/db60uwvhk/image/upload/v1753875525/villas/e4ab61e9-ac3c-4c5f-a7fc-c2f5211014ad_c3y9cj.jpg",
        rating: "4.8",
        properties: 8,
      },
      {
        _id: "loc-pawna",
        name: "Pawna Lake",
        description: "Lakeside glamping & sunset bonfire",
        coverImage:
          "https://res.cloudinary.com/db60uwvhk/image/upload/v1753875530/villas/8a570db4-22b1-4d16-ae65-06aec4745c2c_etvwiw.jpg",
        rating: "4.9",
        properties: 15,
      },
      {
        _id: "loc-karjat",
        name: "Karjat",
        description: "Riverside stays & waterfalls",
        coverImage:
          "https://res.cloudinary.com/db60uwvhk/image/upload/v1753875525/villas/e4ab61e9-ac3c-4c5f-a7fc-c2f5211014ad_c3y9cj.jpg",
        rating: "4.7",
        properties: 6,
      },
    ],
  };
}

export async function fetchLocationList(): Promise<{ success: boolean; data: LocationItem[] }> {
  try {
    const res = await api.get(`/Location/get/locations`);
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return { success: true, data: res.data as LocationItem[] };
    }
  } catch {}

  return {
    success: true,
    data: [
      { _id: "loc-all", name: "All Locations", isPopular: true },
      { _id: "loc-lonavala", name: "Lonavala", isPopular: true },
      { _id: "loc-malavli", name: "Malavli", isPopular: true },
      { _id: "loc-pawna", name: "Pawna Lake", isPopular: true },
      { _id: "loc-karjat", name: "Karjat", isPopular: false },
      { _id: "loc-igatpuri", name: "Igatpuri", isPopular: false },
    ],
  };
}

export async function fetchMapProperties(
  locationId?: string,
  categoryId?: string
): Promise<{ success: boolean; data: PropertyItem[] }> {
  try {
    const query = new URLSearchParams();
    if (locationId && locationId !== "loc-all") query.append("locationId", locationId);
    if (categoryId && categoryId !== "all") query.append("categoryId", categoryId);

    const res = await api.get(`/User/map/properties?${query.toString()}`);
    if (res?.success && Array.isArray(res.data)) {
      return { success: true, data: res.data as PropertyItem[] };
    }
  } catch {}

  // Fallback to available properties
  const fallback = await fetchProperties({
    categoryId: categoryId && categoryId !== "all" ? categoryId : undefined,
    limit: 25,
  });
  return {
    success: fallback?.success ?? false,
    data: Array.isArray(fallback?.data) ? (fallback.data as PropertyItem[]) : [],
  };
}

export async function fetchTrendingReels(): Promise<{ success: boolean; data: ReelItem[] }> {
  try {
    const res = await api.get(`/User/api/reels`);
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return { success: true, data: res.data as ReelItem[] };
    }
  } catch {}

  return {
    success: true,
    data: [
      {
        _id: "reel-1",
        title: "Hotel lagoona",
        views: "8K Views",
        category: "HOTEL",
        creator: "Hotel lagoona",
        thumbnail:
          "https://res.cloudinary.com/db60uwvhk/image/upload/v1753875530/villas/1bbfc3f9-181b-4015-858c-4f650f6b453f_qd0fep.jpg",
      },
      {
        _id: "reel-2",
        title: "Ayesha villa 2",
        views: "5K Views",
        category: "VILLA",
        creator: "Ayesha villa 2",
        thumbnail:
          "https://res.cloudinary.com/db60uwvhk/image/upload/v1753875525/villas/e4ab61e9-ac3c-4c5f-a7fc-c2f5211014ad_c3y9cj.jpg",
      },
      {
        _id: "reel-3",
        title: "Pawna Lake Glamp",
        views: "7K Views",
        category: "CAMPING",
        creator: "Pawna Bliss",
        thumbnail:
          "https://res.cloudinary.com/db60uwvhk/image/upload/v1753875530/villas/8a570db4-22b1-4d16-ae65-06aec4745c2c_etvwiw.jpg",
      },
    ],
  };
}

export function getCuratedGuestReviews(): GuestReviewItem[] {
  return [
    {
      id: "rev-1",
      name: "Santosh Alimkar",
      initials: "SA",
      country: "India",
      rating: 5.0,
      text: "Exceptional private pool villa in Lonavala! The hospitality and bonfire setup made our weekend completely unforgettable.",
      propertyName: "Food park hotel",
      verifiedStay: true,
    },
    {
      id: "rev-2",
      name: "Pooja Sharma",
      initials: "PS",
      country: "India",
      rating: 5.0,
      text: "The Pawna Lake camping experience was beyond picturesque. Clean tents, mouthwatering barbecue, and stars all night.",
      propertyName: "Pawna Bliss Camp",
      verifiedStay: true,
    },
    {
      id: "rev-3",
      name: "Rohit Deshmukh",
      initials: "RD",
      country: "India",
      rating: 4.9,
      text: "Super smooth WhatsApp OTP booking and instant confirmation. Villa was spotless and exactly as seen in the photos.",
      propertyName: "Vastalya Villa",
      verifiedStay: true,
    },
  ];
}
