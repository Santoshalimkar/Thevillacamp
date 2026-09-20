import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL = "https://villa-camping-backend.onrender.com/api/v1";
export const RAZORPAY_KEY_ID = "rzp_test_XTSdEhg9hsStKd";
export const WHATSAPP_SUPPORT_PHONE = "+919820000000";

export const TOKEN_KEY = "thevilla_token";
export const USER_KEY = "thevilla_user";
export const USER_ID_KEY = "thevilla_user_id";

export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["token"] = token;
    }
    if (userId) {
      headers["user-id"] = userId;
    }
    return headers;
  } catch {
    return { "Content-Type": "application/json" };
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; [key: string]: any }> {
  try {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = await getAuthHeaders();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    });

    const json = await response.json();
    return json;
  } catch (error: any) {
    console.warn(`[API Error] ${endpoint}:`, error?.message || error);
    return {
      success: false,
      message: error?.message || "Network request failed. Please check your connection.",
    };
  }
}

export const api = {
  get: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: "GET" }),
  post: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: "DELETE" }),
};
