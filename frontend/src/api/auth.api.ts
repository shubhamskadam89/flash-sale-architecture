import { apiClient } from "./axios";
import type {
  AuthenticatedUser,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  Role
} from "./contracts";
import { endpoints } from "./endpoints";

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(endpoints.auth.login, request);
  return response.data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post(endpoints.auth.logout, { refreshToken });
}

export async function registerUser(request: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>(endpoints.auth.register, request);
  return response.data;
}

export async function registerSetupUser(request: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>(endpoints.auth.setupRegister, request);
  return response.data;
}

function isRole(value: unknown): value is Role {
  return value === "ADMIN" || value === "USER";
}

export async function getMe(): Promise<AuthenticatedUser> {
  const response = await apiClient.get<unknown>(endpoints.auth.me);
  const data = response.data;

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    return {
      uuid: typeof record.uuid === "string" ? record.uuid : undefined,
      email: typeof record.email === "string" ? record.email : undefined,
      fullName:
        typeof record.fullName === "string"
          ? record.fullName
          : typeof record.name === "string"
            ? record.name
            : undefined,
      role: isRole(record.role) ? record.role : undefined
    };
  }

  if (typeof data === "string") {
    return { email: data };
  }

  return {};
}
