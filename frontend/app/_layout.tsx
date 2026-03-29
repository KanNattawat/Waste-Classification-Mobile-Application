import { ensureModelLoaded } from "@/lib/tflite";
import { Stack, Redirect, useSegments } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import "./globals.css";
import Loading from "@/components/loading";
// --- เพิ่ม Import สองตัวนี้ ---
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const segments = useSegments();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F9F8FA]">
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
        await ensureModelLoaded();
      } catch (err) {
        console.error("preload model error: ", err);
      }
    }
    init();
  }, []);

  return (
    // 1. ครอบด้วย SafeAreaProvider เพื่อจัดการพื้นที่ปลอดภัยของระบบ
    <SafeAreaProvider>
      <AuthProvider>
        <AuthGate>
          {/* 2. ใช้ SafeAreaView หุ้ม Stack ทั้งหมด 
             - flex-1: ให้กินพื้นที่เต็มจอ
             - bg-[#F9F8FA]: กำหนดสีพื้นหลังให้เนียนไปกับหน้า Index
          */}
          <SafeAreaView style={{ flex: 1, backgroundColor: '#F9F8FA' }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="result" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="history_result" />
              <Stack.Screen name="camera" options={{ presentation: "modal" }} />
            </Stack>
          </SafeAreaView>
        </AuthGate>
      </AuthProvider>
    </SafeAreaProvider>
  );
}