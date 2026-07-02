import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { AuthenticatedUser } from "../api/contracts";
import { getMe, login as loginRequest, logout as logoutRequest } from "../api/auth.api";
import { notifyError, notifySuccess } from "../utils/notify";
import { AuthContext, type AuthContextValue, type LoginInput } from "./auth-context";
import {
  clearSessionStorage,
  getRefreshToken,
  getStoredUser,
  setStoredUser,
  setTokens
} from "./auth-storage";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const clearSession = useCallback(() => {
    clearSessionStorage();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    const onExpired = () => {
      clearSession();
      notifyError({ message: "Your session has expired. Please sign in again." }, "Your session has expired. Please sign in again.", {
        id: "session-expired"
      });
      navigate("/login", { replace: true });
    };
    window.addEventListener("flash-sale:session-expired", onExpired);
    return () => window.removeEventListener("flash-sale:session-expired", onExpired);
  }, [clearSession, navigate]);

  const login = useCallback(async (input: LoginInput) => {
    setIsLoading(true);
    try {
      const tokens = await loginRequest(input);
      setTokens(tokens.accessToken, tokens.refreshToken);
      const me = await getMe();
      const user = { ...me, role: me.role ?? tokens.userRole };
      setStoredUser(user);
      setUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await logoutRequest(refreshToken);
      }
    } finally {
      clearSession();
      notifySuccess("Signed out successfully.", { id: "auth-logout-success" });
      navigate("/login", { replace: true });
    }
  }, [clearSession, navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "ADMIN",
      isLoading,
      login,
      logout
    }),
    [isLoading, login, logout, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
