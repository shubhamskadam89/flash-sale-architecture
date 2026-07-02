import { toast } from "sonner";
import { isApiError, normalizeApiError, type ApiError } from "../api/api-error";

type NotifyOptions = {
  id?: string;
  description?: string;
};

function show(kind: "success" | "error" | "warning" | "info", message: string, options?: NotifyOptions) {
  const id = options?.id ?? `${kind}:${message}`;
  toast.dismiss(id);
  toast[kind](message, { id, description: options?.description });
}

export function notifySuccess(message: string, options?: NotifyOptions) {
  show("success", message, options);
}

export function notifyError(error: unknown, fallback = "Something went wrong. Please try again.", options?: NotifyOptions) {
  const apiError: ApiError = isApiError(error) ? error : normalizeApiError(error);
  show("error", apiError.message || fallback, options);
}

export function notifyWarning(message: string, options?: NotifyOptions) {
  show("warning", message, options);
}

export function notifyInfo(message: string, options?: NotifyOptions) {
  show("info", message, options);
}
