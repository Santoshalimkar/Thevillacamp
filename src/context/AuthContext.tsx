import React, { createContext, useContext, useEffect, useState } from "react";
import {
  UserProfile,
  getStoredUser,
  verifyWhatsAppOtp,
  logoutUser,
  sendWhatsAppOtp,
} from "../services/authService";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  requestOtp: (phone: string) => Promise<{ success: boolean; message?: string; devOtp?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await getStoredUser();
      setUser(stored.user);
      setToken(stored.token);
    } finally {
      setIsLoading(false);
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const requestOtp = async (phone: string) => {
    return sendWhatsAppOtp(phone);
  };

  const verifyOtp = async (phone: string, otp: string) => {
    const res = await verifyWhatsAppOtp(phone, otp);
    if (res.success && res.user && res.token) {
      setUser(res.user);
      setToken(res.token);
      closeAuthModal();
      return { success: true };
    }
    return { success: false, message: res.message || "Invalid OTP code" };
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setToken(null);
  };

  const refreshProfile = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        requestOtp,
        verifyOtp,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
