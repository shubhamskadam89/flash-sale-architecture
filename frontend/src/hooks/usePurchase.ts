import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { normalizeApiError, type ApiError } from "../api/api-error";
import type { PurchaseResponse } from "../api/contracts";
import { purchaseSaleItem } from "../api/sales.api";
import { notifyError, notifySuccess } from "../utils/notify";
import { newUuid } from "../utils/uuid";

export type PurchaseState =
  | "idle"
  | "processing"
  | "successful"
  | "unauthorized"
  | "sale-unavailable"
  | "conflict"
  | "purchase-not-allowed"
  | "rate-limited"
  | "network-uncertain";

type PurchaseInput = {
  saleUuid: string;
  saleItemUuid: string;
  quantity: number;
  reuseUncertainKey?: boolean;
};

export function usePurchase() {
  const [state, setState] = useState<PurchaseState>("idle");
  const [error, setError] = useState<ApiError | null>(null);
  const [result, setResult] = useState<PurchaseResponse | null>(null);
  const idempotencyKeyRef = useRef(newUuid());

  const mutation = useMutation({
    mutationFn: (input: PurchaseInput) =>
      purchaseSaleItem(input.saleUuid, input.saleItemUuid, { quantity: input.quantity }, idempotencyKeyRef.current),
    retry: false,
    onMutate: () => {
      setState("processing");
      setError(null);
    },
    onSuccess: (data) => {
      setResult(data);
      setState("successful");
      idempotencyKeyRef.current = newUuid();
      const shortOrderUuid = data.orderUuid ? data.orderUuid.slice(0, 8) : "pending";
      notifySuccess(`Purchase successful. Order reference: ${shortOrderUuid}`, { id: "purchase-success" });
    },
    onError: (caught) => {
      const normalized = normalizeApiError(caught);
      setError(normalized);
      if (!normalized.status) setState("network-uncertain");
      else if (normalized.status === 401) setState("unauthorized");
      else if (normalized.status === 403) setState("purchase-not-allowed");
      else if (normalized.status === 409) setState("conflict");
      else if (normalized.status === 429) setState("rate-limited");
      else setState("sale-unavailable");
      notifyError(normalized, "We could not confirm your purchase. Retry safely using the same request.", {
        id: normalized.status === 429 ? "purchase-rate-limit" : "purchase-error"
      });
    }
  });

  const purchase = useCallback(
    (input: PurchaseInput) => {
      if (!input.reuseUncertainKey && state !== "network-uncertain") {
        idempotencyKeyRef.current = newUuid();
      }
      mutation.mutate(input);
    },
    [mutation, state]
  );

  return {
    state,
    error,
    result,
    isProcessing: mutation.isPending,
    idempotencyKey: idempotencyKeyRef.current,
    purchase,
    reset: () => {
      setState("idle");
      setError(null);
      setResult(null);
      idempotencyKeyRef.current = newUuid();
    }
  };
}
