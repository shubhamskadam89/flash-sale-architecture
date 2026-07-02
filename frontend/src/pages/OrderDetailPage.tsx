import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { type ApiError } from "../api/api-error";
import { getOrder, orderKeys } from "../api/orders.api";
import { ApiErrorNotice } from "../components/common/ApiErrorNotice";
import { Button } from "../components/common/Button";
import { StatusBadge } from "../components/common/StatusBadge";
import { formatCurrency } from "../utils/currency";
import { formatDateTime } from "../utils/date";

export function OrderDetailPage() {
  const { orderUuid = "" } = useParams();
  const query = useQuery({
    queryKey: orderKeys.detail(orderUuid),
    queryFn: getOrder.bind(null, orderUuid),
    enabled: Boolean(orderUuid) && orderUuid !== "lookup",
    retry: (failureCount, error) => {
      const apiError = error as ApiError;
      return apiError.status === 404 && failureCount < 5;
    },
    retryDelay: 2000
  });

  const error = query.error as ApiError | null;
  const persisting = error?.status === 404 && query.failureCount < 5;

  return (
    <div className="space-y-5">
      <Button variant="secondary" onClick={() => history.back()}>
        <ArrowLeft size={16} /> Back
      </Button>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Order Details</h1>
            <p className="mt-1 text-sm text-slate-500">Order reference</p>
          </div>
          {query.data?.status ? <StatusBadge tone="info">{query.data.status}</StatusBadge> : null}
        </div>
        {query.isLoading || query.isFetching ? (
          <p className="mt-4 text-sm text-slate-600">
            {persisting ? "Order is being persisted. Checking again..." : "Loading order..."}
          </p>
        ) : null}
        {!persisting ? <ApiErrorNotice error={error} title="Could not load order" /> : null}
        {error?.status === 404 && query.failureCount >= 5 ? (
          <div className="mt-4">
            <Button variant="secondary" onClick={() => query.refetch()}>
              <RotateCcw size={16} /> Retry lookup
            </Button>
          </div>
        ) : null}
        {query.data ? (
          <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-slate-500">Order reference</dt>
              <dd className="mt-1 break-all font-mono text-sm">{query.data.orderUuid ?? "Not returned"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Product</dt>
              <dd className="mt-1 text-sm">{query.data.productName ?? query.data.productUuid ?? "Not returned"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Quantity</dt>
              <dd className="mt-1 text-sm">{query.data.quantity ?? "Not returned"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Unit price</dt>
              <dd className="mt-1 text-sm">{formatCurrency(query.data.unitPrice)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Total price</dt>
              <dd className="mt-1 text-sm">{formatCurrency(query.data.totalPrice)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Created</dt>
              <dd className="mt-1 text-sm">{formatDateTime(query.data.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Sale item reference</dt>
              <dd className="mt-1 break-all font-mono text-sm">{query.data.saleItemUuid ?? "Not returned"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Product reference</dt>
              <dd className="mt-1 break-all font-mono text-sm">{query.data.productUuid ?? "Not returned"}</dd>
            </div>
          </dl>
        ) : null}
        {import.meta.env.DEV && query.data ? (
          <details className="mt-5 rounded-md border border-slate-200 p-3">
            <summary className="cursor-pointer text-sm font-medium text-primary-700">Raw API details</summary>
            <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(query.data, null, 2)}</pre>
          </details>
        ) : null}
      </section>
      <Link to="/purchase" className="text-sm font-medium text-primary-700">
        Back to purchase workspace
      </Link>
    </div>
  );
}
