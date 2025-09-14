import { ensureModelLoaded } from "@/libs/tflite";
import { Stack } from "expo-router";
import { useEffect } from "react";
import "./globals.css";

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
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="result" options={{ headerShown: false }} />
    </Stack>
  );
}
