import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, TOKEN_KEY, USER_KEY, USER_ID_KEY } from "./api";

export interface UserProfile {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone: string;
  mobileNumber?: string;
  role?: string;
  avatar?: string;
}

export async function sendWhatsAppOtp(phone: string): Promise<{
  success: boolean;
  message?: string;
  devOtp?: string;
}> {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  if (cleanPhone.length !== 10) {
    return { success: false, message: "Please enter a valid 10-digit mobile number." };
  }

  const res = await api.post("/auth/whatsapp/send-otp", {
    phoneNumber: cleanPhone,
    role: "user",
  });
  return res;
}

export async function verifyWhatsAppOtp(
  phone: string,
  otp: string
): Promise<{
  success: boolean;
  token?: string;
  user?: UserProfile;
  message?: string;
}> {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const cleanOtp = otp.trim();

  const res = await api.post("/auth/whatsapp/verify-otp", {
    phoneNumber: cleanPhone,
    otp: cleanOtp,
    code: cleanOtp,
    role: "user",
  });

  if (res?.success && res.token && res.user) {
    await AsyncStorage.setItem(TOKEN_KEY, res.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(res.user));
    if (res.user._id) {
      await AsyncStorage.setItem(USER_ID_KEY, res.user._id);
    }
  }

  return res;
}

export async function getStoredUser(): Promise<{
  token: string | null;
  user: UserProfile | null;
}> {
  try {
    const [token, userStr] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(USER_KEY),
    ]);
    return {
      token,
      user: userStr ? JSON.parse(userStr) : null,
    };
  } catch {
    return { token: null, user: null };
  }
}

export async function logoutUser(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(USER_KEY),
    AsyncStorage.removeItem(USER_ID_KEY),
  ]);
}
