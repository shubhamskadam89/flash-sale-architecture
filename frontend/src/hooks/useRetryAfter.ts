import type { ApiError } from "../api/api-error";
import { useCountdown } from "./useCountdown";

export function useRetryAfter(error?: ApiError | null) {
  return useCountdown(error?.retryAfterSeconds);
}
