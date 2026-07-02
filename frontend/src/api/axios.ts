import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { normalizeApiError } from "./api-error";
import type { AuthResponse } from "./contracts";
import { endpoints, publicAuthPaths } from "./endpoints";
import {
  clearSessionStorage,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setStoredUser,
  setTokens
} from "../auth/auth-storage";

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const baseURL = import.meta.env.VITE_API_BASE_URL || "";

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

function isPublicAuthRequest(url?: string): boolean {
  if (!url) return false;
  return publicAuthPaths.some((path) => url.includes(path));
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableRequest | undefined;
    const status = error.response?.status;

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isPublicAuthRequest(original.url)
    ) {
      original._retry = true;
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          const refreshResponse = await axios.post<AuthResponse>(
            `${baseURL}${endpoints.auth.refresh}`,
            { refreshToken },
            { headers: { "Content-Type": "application/json" } }
          );
          setTokens(refreshResponse.data.accessToken, refreshResponse.data.refreshToken);
          if (refreshResponse.data.userRole) {
            setStoredUser({ ...getStoredUser(), role: refreshResponse.data.userRole });
          }
          original.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
          return apiClient(original);
        } catch {
          clearSessionStorage();
          window.dispatchEvent(new Event("flash-sale:session-expired"));
        }
      }
    }

    return Promise.reject(normalizeApiError(error));
  }
);
