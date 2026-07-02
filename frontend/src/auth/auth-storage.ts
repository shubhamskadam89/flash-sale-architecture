import type { AuthenticatedUser } from "../api/contracts";

const accessTokenKey = "flash_sale_access_token";
const refreshTokenKey = "flash_sale_refresh_token";
const userKey = "flash_sale_user";

export function getAccessToken(): string | null {
  return localStorage.getItem(accessTokenKey);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(refreshTokenKey);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(accessTokenKey, accessToken);
  localStorage.setItem(refreshTokenKey, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(accessTokenKey);
  localStorage.removeItem(refreshTokenKey);
}

export function getStoredUser(): AuthenticatedUser | null {
  const raw = localStorage.getItem(userKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthenticatedUser;
  } catch {
    localStorage.removeItem(userKey);
    return null;
  }
}

export function setStoredUser(user: AuthenticatedUser): void {
  localStorage.setItem(userKey, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(userKey);
}

export function clearSessionStorage(): void {
  clearTokens();
  clearStoredUser();
}
