"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi, setToken, removeToken } from "@/lib/api-client";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
          const response = await authApi.verifyToken();
          setUser(response.user);
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.signIn({ email, password });
      setToken(response.token);
      setUser(response.user);
      router.push("/resumes");
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const response = await authApi.signUp({ name, email, password });
      setToken(response.token);
      setUser(response.user);
      router.push("/resumes");
    } catch (error) {
      throw error;
    }
  };

  const signOut = () => {
    removeToken();
    setUser(null);
    router.push("/sign-in");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
