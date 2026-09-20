import { api } from "./api";

export interface BookingPayload {
  propertyId: string;
  categoryId?: string;
  checkIn: string;
  checkOut: string;
  adultsCount: number;
  childrenCount: number;
  totalGuests: number;
  totalPrice: number;
  basePrice?: number;
  taxes?: number;
  cleaningFee?: number;
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  };
  mealPackage?: any;
}

export interface BookingItem {
  _id: string;
  orderId?: string;
  bookingId?: string;
  property?: {
    _id: string;
    name: string;
    title?: string;
    images?: string[];
    propertyImage?: string;
    address?: {
      city?: string;
      addressLine?: string;
    };
    city?: string;
  };
  checkIn: string;
  checkOut: string;
  totalGuests: number;
  totalPrice: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | string;
  bookingStatus: "CONFIRMED" | "PENDING" | "CANCELLED" | "COMPLETED" | string;
  createdAt: string;
}

export async function createBookingOrder(payload: BookingPayload) {
  return api.post("/Booking/create", payload);
}

export async function verifyBookingPayment(payload: {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
  bookingId: string;
}) {
  return api.post("/Booking/verify", payload);
}

export async function fetchCustomerBookings(customerId: string) {
  return api.get<BookingItem[]>(`/Booking/customer/${customerId}`);
}

export async function fetchWishlist(userId?: string) {
  const query = userId ? `?userId=${userId}` : "";
  return api.get(`/Wishlist/wishlist${query}`);
}

export async function toggleWishlistApi(propertyId: string, userId?: string) {
  return api.post("/Wishlist/toggle", { propertyId, userId });
}
