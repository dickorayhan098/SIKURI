import { create } from "zustand";
import { useGetMe, useLogin, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

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

  const { data: user, isLoading: isUserLoading, error } = useGetMe({
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
      setLocation("/login");
    }
  }, [error, setToken, setLocation]);

  const login = async (credentials: any) => {
    try {
      const res = await loginMutation.mutateAsync({ data: credentials });
      setToken(res.token);
      setLocation("/dashboard");
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      setToken(null);
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
