// src/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

//เอาไว้อ่านค่า token เพื่อเช็คว่า login หรือยัง เอาไปใช้กับ root layout

type AuthContextType = {
  token: string | null;
  isLoading: boolean;
  setToken: (t: string | null) => void;
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await SecureStore.getItemAsync("authToken");
      setToken(t);
      setIsLoading(false);
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ token, isLoading, setToken}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
