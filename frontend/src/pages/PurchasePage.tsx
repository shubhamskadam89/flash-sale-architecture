import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, CheckCircle2, ReceiptText, RotateCcw, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import type { ApiError } from "../api/api-error";
import type { SaleDetailResponse, SaleItemResponse } from "../api/contracts";
import { listAvailableSales, saleKeys } from "../api/sales.api";
import { ApiErrorNotice } from "../components/common/ApiErrorNotice";
import { Button } from "../components/common/Button";
import { FormField } from "../components/common/FormField";
import { StatusBadge } from "../components/common/StatusBadge";
import { InventoryBadge } from "../components/sales/InventoryBadge";
import { usePurchase } from "../hooks/usePurchase";
import { useRetryAfter } from "../hooks/useRetryAfter";
import { formatCurrency } from "../utils/currency";
import { formatDateTime } from "../utils/date";

const schema = z.object({
  quantity: z
    .string()
    .min(1, "Quantity is required.")
    .regex(/^[1-9]\d*$/, "Quantity must be a positive whole number.")
});

type FormValues = z.infer<typeof schema>;

const stateLabels = {
  idle: "Idle",
  processing: "Processing",
  successful: "Successful",
  unauthorized: "Unauthorized",
  "sale-unavailable": "Sale unavailable",
  conflict: "Conflict or sold out",
  "purchase-not-allowed": "Purchase not allowed",
  "rate-limited": "Rate limited",
  "network-uncertain": "Network uncertain"
} as const;

function statusTone(status?: string): "neutral" | "success" | "warning" | "info" {
  if (status === "ACTIVE") return "success";
  if (status === "DRAFT") return "warning";
  return "info";
}

function shortCode(value?: string): string {
  return value ? value.slice(0, 8).toUpperCase() : "N/A";
}

function totalItems(sale: SaleDetailResponse): number {
  return (sale.items ?? []).reduce((sum, item) => sum + (item.inventory ?? 0), 0);
}

export function PurchasePage() {
  const salesQuery = useQuery({ queryKey: saleKeys.available, queryFn: listAvailableSales });
  const [selectedSaleUuid, setSelectedSaleUuid] = useState("");
  const [selectedItem, setSelectedItem] = useState<SaleItemResponse | null>(null);
  const purchase = usePurchase();
  const retryAfter = useRetryAfter(purchase.error);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: "1" }
  });

  const selectedSale = useMemo(
    () => salesQuery.data?.find((sale) => sale.saleUuid === selectedSaleUuid) ?? null,
    [salesQuery.data, selectedSaleUuid]
  );
  const buttonDisabled = purchase.isProcessing || retryAfter > 0;

  function buy(item: SaleItemResponse, reuseUncertainKey = false) {
    if (!selectedSale?.saleUuid || !item.saleItemUuid) return;
    const values = form.getValues();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      form.trigger("quantity");
      return;
    }
    setSelectedItem(item);
    purchase.purchase({
      saleUuid: selectedSale.saleUuid,
      saleItemUuid: item.saleItemUuid,
      quantity: Number(parsed.data.quantity),
      reuseUncertainKey
    });
  }

  if (!selectedSale) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Purchase</h1>
          <p className="mt-1 text-sm text-slate-600">Choose a sale and browse its products.</p>
        </div>

        {salesQuery.isLoading ? <p className="text-sm text-slate-600">Loading sales...</p> : null}
        <ApiErrorNotice error={salesQuery.error as ApiError | null} title="Could not load sales" />
        {!salesQuery.isLoading && (salesQuery.data ?? []).length === 0 ? (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            No sales are available yet.
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(salesQuery.data ?? []).map((sale) => (
              <button
                key={sale.saleUuid}
                type="button"
                onClick={() => {
                  if (sale.saleUuid) setSelectedSaleUuid(sale.saleUuid);
                  setSelectedItem(null);
                  purchase.reset();
                  form.reset({ quantity: "1" });
                }}
                className="rounded-lg border border-slate-200 bg-white p-5 text-left shadow-soft transition hover:border-primary-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">{sale.name ?? "Sale"}</h2>
                    <p className="mt-1 text-sm text-slate-600">{sale.items?.length ?? 0} product{sale.items?.length === 1 ? "" : "s"}</p>
                  </div>
                  <StatusBadge tone={statusTone(sale.status)}>{sale.status ?? "DRAFT"}</StatusBadge>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-slate-500">Starts</dt>
                    <dd className="mt-1 text-slate-800">{formatDateTime(sale.startTime)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Inventory</dt>
                    <dd className="mt-1 text-slate-800">{totalItems(sale)}</dd>
                  </div>
                </dl>
              </button>
            ))}
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button
            variant="secondary"
            onClick={() => {
              setSelectedSaleUuid("");
              setSelectedItem(null);
              purchase.reset();
            }}
          >
            <ArrowLeft size={16} /> Back to sales
          </Button>
          <h1 className="mt-4 text-2xl font-semibold text-slate-950">{selectedSale.name ?? "Sale"}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {formatDateTime(selectedSale.startTime)} to {formatDateTime(selectedSale.endTime)}
          </p>
        </div>
        <StatusBadge tone={purchase.state === "successful" ? "success" : purchase.state === "rate-limited" ? "warning" : "info"}>
          {stateLabels[purchase.state]}
        </StatusBadge>
      </div>

      {(selectedSale.items?.length ?? 0) === 0 ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-soft">
          No products are assigned to this sale yet.
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(selectedSale.items ?? []).map((item) => (
              <article key={item.saleItemUuid} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex min-h-28 flex-col justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">{item.productName ?? "Product"}</h2>
                    <p className="mt-1 text-xs text-slate-500">Code {shortCode(item.productUuid)}</p>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-slate-500">Price</dt>
                      <dd className="mt-1 font-semibold text-slate-950">{formatCurrency(item.salePrice)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Remaining</dt>
                      <dd className="mt-1 text-slate-800">
                        <InventoryBadge saleItemUuid={item.saleItemUuid} />
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="mt-4 space-y-3">
                  <FormField
                    label="Quantity"
                    inputMode="numeric"
                    {...form.register("quantity")}
                    error={form.formState.errors.quantity?.message}
                  />
                  <Button className="w-full" disabled={buttonDisabled} onClick={() => buy(item)}>
                    <ShoppingCart size={16} />{" "}
                    {purchase.isProcessing && selectedItem?.saleItemUuid === item.saleItemUuid
                      ? "Processing..."
                      : retryAfter > 0
                        ? `Wait ${retryAfter}s`
                        : "Purchase"}
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <h2 className="text-base font-semibold text-slate-950">Purchase state</h2>
              <p className="mt-3 text-sm text-slate-700">{stateLabels[purchase.state]}</p>
              {selectedItem ? <p className="mt-2 text-sm text-slate-500">{selectedItem.productName}</p> : null}
              {purchase.state === "network-uncertain" && selectedItem ? (
                <Button className="mt-4 w-full" variant="secondary" onClick={() => buy(selectedItem, true)} disabled={purchase.isProcessing}>
                  <RotateCcw size={16} /> Retry same request
                </Button>
              ) : null}
            </div>
            {purchase.state === "network-uncertain" ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status" aria-live="polite">
                <div className="flex gap-2">
                  <AlertTriangle size={18} />
                  <p>The result could not be confirmed. Retrying uses the same protected request.</p>
                </div>
              </div>
            ) : null}
            <ApiErrorNotice error={purchase.error} title="Purchase request failed" />
          </aside>
        </section>
      )}

      {purchase.result ? (
        <section className="rounded-lg border border-green-200 bg-green-50 p-5 text-green-900" aria-live="polite">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5" size={20} />
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">Purchase successful</h2>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="font-medium">Product</dt>
                  <dd>{selectedItem?.productName ?? "Not returned"}</dd>
                </div>
                <div>
                  <dt className="font-medium">Remaining inventory</dt>
                  <dd>{purchase.result.remainingInventory ?? "Not returned"}</dd>
                </div>
                <div>
                  <dt className="font-medium">Order</dt>
                  <dd>{purchase.result.orderUuid ? "Created" : "Created, reference not returned"}</dd>
                </div>
              </dl>
              {purchase.result.orderUuid ? (
                <Link to={`/orders/${purchase.result.orderUuid}`} className="mt-4 inline-block">
                  <Button>
                    <ReceiptText size={16} /> View Order
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
