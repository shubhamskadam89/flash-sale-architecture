import axios, { AxiosError } from "axios";

export type ApiError = {
  status?: number;
  code?: string;
  message: string;
  details?: unknown;
  retryAfterSeconds?: number;
  path?: string;
};

export const ERROR_MESSAGES: Record<string, string> = {
  USER_ALREADY_EXISTS: "An account with this email already exists.",
  REFRESH_TOKEN_NOT_FOUND: "Your session has expired. Please sign in again.",
  REFRESH_TOKEN_EXPIRED: "Your session has expired. Please sign in again.",
  REFRESH_TOKEN_REVOKED: "Your session has expired. Please sign in again.",
  PRODUCT_NOT_FOUND: "This product is no longer available.",
  SALE_NOT_ACTIVE: "This sale is not active yet.",
  SALE_ALREADY_ACTIVE: "This sale has already been activated.",
  PURCHASE_NOT_ALLOWED: "Purchases are not allowed for this sale at the moment.",
  PURCHASE_LIMIT_EXCEEDED: "You have reached the purchase limit for this item.",
  SOLD_OUT: "This item has sold out.",
  RATE_LIMIT_EXCEEDED: "Too many requests. Please wait before trying again.",
  IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST: "This purchase request conflicts with a previous request.",
  INVENTORY_STATE_UNAVAILABLE: "Inventory is temporarily unavailable. Please try again shortly.",
  UNAUTHORIZED: "Your session has expired. Please sign in again.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested item could not be found.",
  CONFLICT: "This action could not be completed because the data has changed."
};

const fallbackMessages: Record<number, string> = {
  400: "The request was not accepted.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have access to perform this action.",
  404: "The requested resource was not found.",
  409: "The request conflicts with the current backend state.",
  429: "Too many requests. Please wait before trying again.",
  500: "The server could not complete the request."
};

function cleanMessage(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const lower = trimmed.toLowerCase();
  if (trimmed === "Error" || trimmed === "AxiosError" || trimmed === "[object Object]") return undefined;
  if (trimmed.startsWith("{") || trimmed.startsWith("[") || trimmed.includes("\n\tat ")) return undefined;
  if (lower.includes("exception") || lower.includes("stacktrace") || lower.includes("java.")) return undefined;
  return trimmed.length > 240 ? undefined : trimmed;
}

function parseRetryAfter(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, Math.ceil(seconds));
  const dateMs = Date.parse(value);
  if (!Number.isNaN(dateMs)) {
    return Math.max(0, Math.ceil((dateMs - Date.now()) / 1000));
  }
  return undefined;
}

function extractMessage(data: unknown, status?: number): string {
  if (data && typeof data === "object") {
    const maybe = data as Record<string, unknown>;
    if (typeof maybe.msg === "string") {
      const message = cleanMessage(maybe.msg);
      if (message) return message;
    }
    if (typeof maybe.message === "string") {
      const message = cleanMessage(maybe.message);
      if (message) return message;
    }
    if (typeof maybe.error === "string" && ERROR_MESSAGES[maybe.error]) return ERROR_MESSAGES[maybe.error];
  }
  if (typeof data === "string") {
    const message = cleanMessage(data);
    if (message) return message;
  }
  if (status && fallbackMessages[status]) return fallbackMessages[status];
  return "Something went wrong. Please try again.";
}

export function normalizeApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (!axios.isAxiosError(error)) {
    return {
      message: error instanceof Error ? cleanMessage(error.message) ?? "Something went wrong. Please try again." : "Something went wrong. Please try again."
    };
  }

  const axiosError = error as AxiosError;
  const status = axiosError.response?.status;
  const data = axiosError.response?.data;
  const headers = axiosError.response?.headers ?? {};
  const retryAfter = parseRetryAfter(String(headers["retry-after"] ?? ""));

  if (!axiosError.response) {
    return {
      message: "Network connection was interrupted. The result may be unknown."
    };
  }

  return {
    status,
    code:
      data && typeof data === "object" && typeof (data as Record<string, unknown>).error === "string"
        ? String((data as Record<string, unknown>).error)
        : undefined,
    message: extractMessage(data, status),
    details:
      data && typeof data === "object" && "details" in data
        ? (data as Record<string, unknown>).details
        : undefined,
    retryAfterSeconds: retryAfter,
    path:
      data && typeof data === "object" && typeof (data as Record<string, unknown>).path === "string"
        ? String((data as Record<string, unknown>).path)
        : undefined
  };
}

export function isApiError(error: unknown): error is ApiError {
  return Boolean(
    error &&
    typeof error === "object" &&
    !(error instanceof Error) &&
    "message" in error
  );
}
