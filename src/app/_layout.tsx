import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { WishlistProvider } from "../context/WishlistContext";
import { SearchProvider } from "../context/SearchContext";
import { AuthModal } from "./modal/auth";
import { Colors } from "../theme/colors";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WishlistProvider>
          <SearchProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background },
                animation: "slide_from_right",
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="property/[id]"
                options={{ headerShown: false, animation: "slide_from_right" }}
              />
              <Stack.Screen
                name="booking/[id]"
                options={{ headerShown: false, animation: "slide_from_bottom" }}
              />
              <Stack.Screen
                name="booking/success"
                options={{ headerShown: false, animation: "fade" }}
              />
              <Stack.Screen
                name="modal/search"
                options={{
                  presentation: "modal",
                  headerShown: false,
                  animation: "slide_from_bottom",
                }}
              />
            </Stack>
            {/* Global WhatsApp OTP Modal */}
            <AuthModal />
          </SearchProvider>
        </WishlistProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
