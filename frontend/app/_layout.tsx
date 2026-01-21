import { ensureModelLoaded } from "@/lib/tflite";
import { Stack, Redirect, useSegments } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import "./globals.css";
import Loading from "@/components/loading";


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
        await ensureModelLoaded();
      } catch (err) {
        console.error("preload model error: ", err);
      }
    }

    init();
  }, []);

  return (
    <AuthProvider>
      <AuthGate>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="result" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="history_result" options={{ headerShown: false }} />
          <Stack.Screen name="camera" options={{ presentation: "modal", headerShown: false }} />
        </Stack>
      </AuthGate>
    </AuthProvider>

  );
}
