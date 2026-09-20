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
  price?: number;
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
  isSuperhost?: boolean;
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
  if (categoryId) query.append("categoryId", categoryId);
  return api.get(`/User/available-this-weekend?${query.toString()}`);
}

export async function fetchPropertyById(propertyId: string, categoryId?: string) {
  // If categoryId is available, call the full endpoint
  const cat = categoryId || CATEGORY_IDS.VILLA;
  const res = await api.get(`/User/property/${cat}/${propertyId}`);
  if (res?.success && res.data) return res;

  // Fallback direct check
  return api.get(`/User/properties/${propertyId}`);
}

export async function fetchDestinations() {
  return api.get(`/User/destinations`);
}
