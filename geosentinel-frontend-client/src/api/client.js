import axios from "axios";
import { tokenStore } from "./tokenStore";

// The backend currently has no /api or /api/v1 prefix — every module is
// mounted directly on the root (see geosentinel_backend_description.md).
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

function broadcastSessionExpired() {
  tokenStore.clear();
  window.dispatchEvent(new CustomEvent("gs:auth:expired"));
}

async function refreshSession() {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  // Use a bare axios call (not apiClient) to avoid recursive interceptors.
  const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-session`, {
    refreshToken,
  });

  if (!data.success) throw new Error(data.message || "Failed to refresh session");

  tokenStore.setSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });

  return data.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // Only attempt one silent refresh-and-retry per request, and only for
    // authenticated 401s that aren't the refresh call itself.
    const isAuthEndpoint =
      config?.url?.includes("/auth/sign-in") ||
      config?.url?.includes("/auth/sign-up") ||
      config?.url?.includes("/auth/refresh-session");

    if (response?.status === 401 && !config?._retried && !isAuthEndpoint && tokenStore.getRefreshToken()) {
      config._retried = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshSession().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;
        config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(config);
      } catch (refreshError) {
        broadcastSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Normalizes the { success: false, message } shape used throughout the
// backend into a plain Error so callers can just `catch (err) { err.message }`.
export function unwrapError(err) {
  const backendMessage = err?.response?.data?.message;
  if (backendMessage) return new Error(backendMessage);
  if (err?.message === "Network Error") {
    return new Error(
      `Could not reach the GeoSentinel backend at ${API_BASE_URL}. Is it running?`
    );
  }
  return err instanceof Error ? err : new Error("Something went wrong");
}
