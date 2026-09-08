import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { tokenStore } from "../api/tokenStore";
import { logout as apiLogout } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenStore.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(tokenStore.getAccessToken()));

  useEffect(() => {
    function handleExpired() {
      setUser(null);
      setIsAuthenticated(false);
    }
    window.addEventListener("gs:auth:expired", handleExpired);
    return () => window.removeEventListener("gs:auth:expired", handleExpired);
  }, []);

  const completeSignIn = useCallback(({ user: u, accessToken, refreshToken }) => {
    tokenStore.setSession({ accessToken, refreshToken, user: u });
    setUser(u);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenStore.getRefreshToken();
    try {
      if (refreshToken) await apiLogout({ refreshToken });
    } catch {
      // Best-effort — clear the local session regardless of server response.
    }
    tokenStore.clear();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated, completeSignIn, logout }),
    [user, isAuthenticated, completeSignIn, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
