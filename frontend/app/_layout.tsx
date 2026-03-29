import { ensureModelLoaded } from "@/lib/tflite";
import { Stack, Redirect, useSegments } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import "./globals.css";
import Loading from "@/components/loading";
import * as NavigationBar from 'expo-navigation-bar'; // 1. นำเข้า Library

function AuthGate({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const segments = useSegments();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Loading />
      </View>
    );
  }

  const inAuthGroup = segments[0] === "(auth)";

  if (!token && !inAuthGroup) {
    return <Redirect href="/(auth)/sign_in" />;
  }
  if (token && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  useEffect(() => {
    async function init() {
      try {
        // --- 2. ส่วนจัดการการซ่อน Navigation Bar ---
        await NavigationBar.setVisibilityAsync("hidden"); // ซ่อนแถบ
        await NavigationBar.setBehaviorAsync("swipe");   // ปัดเพื่อแสดงชั่วคราว
        
        // --- 3. ส่วนโหลด Model TFLite เดิม ---
        await ensureModelLoaded();
      } catch (err) {
        console.error("Initialization error: ", err);
      }
    }

    init();
  }, []);

  return (
    <AuthProvider>
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="result" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="history_result" />
          <Stack.Screen name="camera" options={{ presentation: "modal" }} />
        </Stack>
      </AuthGate>
    </AuthProvider>
  );
}