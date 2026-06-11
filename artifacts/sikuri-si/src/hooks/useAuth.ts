import { create } from "zustand";
import {
  useGetMe,
  useLogin,
  useLogout,
  setAuthTokenGetter,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

// Register a getter so every API request sends Authorization: Bearer <token>
// Reading from localStorage makes it always current regardless of Zustand state
setAuthTokenGetter(() => localStorage.getItem("token"));

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    set({ token });
  },
}));

export function useAuth() {
  const { token, setToken } = useAuthStore();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  const {
    data: user,
    isLoading: isUserLoading,
    error,
  } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
      queryKey: getGetMeQueryKey(),
    },
  });

  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (error) {
      setToken(null);
      qc.clear();
      setLocation("/login");
    }
  }, [error, setToken, setLocation, qc]);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await loginMutation.mutateAsync({ data: credentials });
    setToken(res.token);
    await qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
    setLocation("/dashboard");
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      setToken(null);
      qc.clear();
      setLocation("/login");
    }
  };

  return {
    user,
    token,
    isLoading: isUserLoading || loginMutation.isPending,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
