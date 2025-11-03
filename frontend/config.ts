// export const API_URL = "http://3.107.236.113:3000";

// lib/config.ts
import Constants from "expo-constants";

const isDev = __DEV__; // true ถ้า run expo start, false ถ้า build APK
export const API_URL = isDev
  ? Constants.expoConfig?.extra?.backend?.dev
  : Constants.expoConfig?.extra?.backend?.prod;
