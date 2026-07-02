import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, PackagePlus, Tags } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { normalizeApiError, type ApiError } from "../api/api-error";
import type { SaleDetailResponse, SaleItemResponse } from "../api/contracts";
import { listProducts, productKeys } from "../api/products.api";
import { activateSale, addSaleItem, createSale, listAdminSales, saleKeys } from "../api/sales.api";
import { ApiErrorNotice } from "../components/common/ApiErrorNotice";
import { Button } from "../components/common/Button";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { FormField } from "../components/common/FormField";
import { StatusBadge } from "../components/common/StatusBadge";
import { InventoryBadge } from "../components/sales/InventoryBadge";
import { formatCurrency } from "../utils/currency";
import { formatDateTime } from "../utils/date";
import { notifyError, notifySuccess } from "../utils/notify";

const saleSchema = z
  .object({
    name: z.string().min(1, "Sale name is required."),
    startTime: z.string().min(1, "Start time is required."),
    endTime: z.string().min(1, "End time is required.")
  })
  .refine((value) => new Date(value.endTime).getTime() > new Date(value.startTime).getTime(), {
    message: "End time must be after start time.",
    path: ["endTime"]
  });

const itemSchema = z.object({
  productUuid: z.string().min(1, "Choose a product."),
  salePrice: z.coerce.number().positive("Sale price must be positive."),
  inventory: z.coerce.number().int("Inventory must be a whole number.").positive("Inventory must be positive."),
  maxPerUser: z.coerce.number().int("Max per user must be a whole number.").positive("Max per user must be positive.")
});

type SaleForm = z.infer<typeof saleSchema>;
type ItemForm = z.infer<typeof itemSchema>;

function shortCode(value?: string): string {
  return value ? value.slice(0, 8).toUpperCase() : "N/A";
}

function statusTone(status?: string): "neutral" | "success" | "warning" | "info" {
  if (status === "ACTIVE") return "success";
  if (status === "DRAFT") return "warning";
  return "info";
}

export function AdminSalesPage() {
  const queryClient = useQueryClient();
  const [selectedSaleUuid, setSelectedSaleUuid] = useState("");
  const [saleError, setSaleError] = useState<ApiError | null>(null);
  const [itemError, setItemError] = useState<ApiError | null>(null);
  const [activateError, setActivateError] = useState<ApiError | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const saleForm = useForm<SaleForm>({ resolver: zodResolver(saleSchema) });
  const itemForm = useForm<ItemForm>({ resolver: zodResolver(itemSchema) });
  const salesQuery = useQuery({ queryKey: saleKeys.adminList, queryFn: listAdminSales });
  const productsQuery = useQuery({ queryKey: productKeys.all, queryFn: listProducts });
  const selectedProductUuid = itemForm.watch("productUuid");
  const selectedSale = useMemo(
    () =>
      salesQuery.data?.find((sale) => sale.saleUuid === selectedSaleUuid) ??
      salesQuery.data?.[0] ??
      null,
    [salesQuery.data, selectedSaleUuid]
  );
  const selectedProduct = useMemo(
    () => productsQuery.data?.find((product) => product.uuid === selectedProductUuid),
    [productsQuery.data, selectedProductUuid]
  );

  const createSaleMutation = useMutation({
    mutationFn: createSale,
    onSuccess: async (data) => {
      if (data.saleUuid) {
        setSelectedSaleUuid(data.saleUuid);
      }
      saleForm.reset();
      await queryClient.invalidateQueries({ queryKey: saleKeys.adminList });
      notifySuccess("Sale created successfully.", { id: "sale-create-success" });
    },
    onError: (caught) => {
      const normalized = normalizeApiError(caught);
      setSaleError(normalized);
      notifyError(normalized, "Unable to create sale. Please try again.", { id: "sale-create-error" });
    }
  });

  const addItemMutation = useMutation({
    mutationFn: (values: ItemForm) => {
      if (!selectedSale?.saleUuid) throw new Error("Select a sale first.");
      return addSaleItem(selectedSale.saleUuid, {
        productUuid: values.productUuid,
        salePrice: values.salePrice,
        inventory: values.inventory,
        maxPerUser: values.maxPerUser
      });
    },
    onSuccess: async () => {
      if (!selectedSale?.saleUuid) return;
      setSelectedSaleUuid(selectedSale.saleUuid);
      itemForm.reset({ productUuid: "", salePrice: 0, inventory: 0, maxPerUser: 1 });
      await queryClient.invalidateQueries({ queryKey: saleKeys.adminList });
      notifySuccess("Product added to the sale.", { id: "sale-item-add-success" });
    },
    onError: (caught) => {
      const normalized = normalizeApiError(caught);
      setItemError(normalized);
      notifyError(normalized, "Unable to add product to sale. Please try again.", { id: "sale-item-add-error" });
    }
  });

  const activateMutation = useMutation({
    mutationFn: () => {
      if (!selectedSale?.saleUuid) throw new Error("Select a sale first.");
      return activateSale(selectedSale.saleUuid);
    },
    onSuccess: async (data) => {
      if (data.saleUuid) {
        setSelectedSaleUuid(data.saleUuid);
      }
      setConfirmOpen(false);
      await queryClient.invalidateQueries({ queryKey: saleKeys.adminList });
      notifySuccess("Sale activated. Inventory is now available in Redis.", { id: "sale-activate-success" });
    },
    onError: (caught) => {
      const normalized = normalizeApiError(caught);
      setActivateError(normalized);
      notifyError(normalized, "Unable to activate sale. Please try again.", { id: "sale-activate-error" });
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Sales Management</h1>
        <p className="mt-1 text-sm text-slate-600">Create sales, select one, and manage its products.</p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <Tags size={18} className="text-primary-700" />
          <h2 className="text-base font-semibold text-slate-950">Create Sale</h2>
        </div>
        <form
          className="grid gap-4 md:grid-cols-3"
          onSubmit={saleForm.handleSubmit((values) => {
            setSaleError(null);
            createSaleMutation.mutate(values);
          })}
        >
          <ApiErrorNotice error={saleError} />
          <FormField label="Sale name" {...saleForm.register("name")} error={saleForm.formState.errors.name?.message} />
          <FormField label="Start time" type="datetime-local" {...saleForm.register("startTime")} error={saleForm.formState.errors.startTime?.message} />
          <FormField label="End time" type="datetime-local" {...saleForm.register("endTime")} error={saleForm.formState.errors.endTime?.message} />
          <div className="md:col-span-3">
            <Button type="submit" disabled={createSaleMutation.isPending}>
              {createSaleMutation.isPending ? "Creating..." : "Create sale"}
            </Button>
          </div>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <h2 className="text-base font-semibold text-slate-950">Sales</h2>
          <div className="mt-4 space-y-2">
            {salesQuery.isLoading ? <p className="text-sm text-slate-600">Loading sales...</p> : null}
            <ApiErrorNotice error={salesQuery.error as ApiError | null} title="Could not load sales" />
            {!salesQuery.isLoading && (salesQuery.data ?? []).length === 0 ? <p className="text-sm text-slate-600">No sales created yet.</p> : null}
            {(salesQuery.data ?? []).map((sale: SaleDetailResponse) => (
              <button
                key={sale.saleUuid}
                type="button"
                onClick={() => {
                  if (sale.saleUuid) setSelectedSaleUuid(sale.saleUuid);
                  setItemError(null);
                  setActivateError(null);
                }}
                className={`w-full rounded-md border p-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                  sale.saleUuid === selectedSale?.saleUuid
                    ? "border-primary-600 bg-blue-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-950">{sale.name ?? "Untitled sale"}</span>
                  <StatusBadge tone={statusTone(sale.status)}>{sale.status ?? "DRAFT"}</StatusBadge>
                </div>
                <p className="mt-2 text-xs text-slate-500">{sale.items?.length ?? 0} product{sale.items?.length === 1 ? "" : "s"}</p>
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">{selectedSale?.name ?? "Select a sale"}</h2>
                {selectedSale ? (
                  <p className="mt-1 text-sm text-slate-600">
                    {formatDateTime(selectedSale.startTime)} to {formatDateTime(selectedSale.endTime)}
                  </p>
                ) : null}
              </div>
              {selectedSale ? <StatusBadge tone={statusTone(selectedSale.status)}>{selectedSale.status ?? "DRAFT"}</StatusBadge> : null}
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-950">Assigned products</h3>
              {selectedSale && (selectedSale.items?.length ?? 0) === 0 ? (
                <p className="mt-3 text-sm text-slate-600">No products added to this sale yet.</p>
              ) : null}
              {selectedSale?.items?.length ? (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Product</th>
                        <th className="px-3 py-2">Sale price</th>
                        <th className="px-3 py-2">Inventory</th>
                        <th className="px-3 py-2">Limit</th>
                        <th className="px-3 py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedSale.items.map((item: SaleItemResponse) => (
                        <tr key={item.saleItemUuid}>
                          <td className="px-3 py-2">
                            <p className="font-medium text-slate-950">{item.productName ?? "Product"}</p>
                            <p className="text-xs text-slate-500">Code {shortCode(item.productUuid)}</p>
                          </td>
                          <td className="px-3 py-2">{formatCurrency(item.salePrice)}</td>
                          <td className="px-3 py-2">
                            <InventoryBadge saleItemUuid={item.saleItemUuid} />
                          </td>
                          <td className="px-3 py-2">{item.maxPerUser ?? "Not returned"}</td>
                          <td className="px-3 py-2">
                            <span className="text-slate-500">Available on Purchase page</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <PackagePlus size={18} className="text-primary-700" />
              <h2 className="text-base font-semibold text-slate-950">Add Product</h2>
            </div>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={itemForm.handleSubmit((values) => {
                setItemError(null);
                addItemMutation.mutate(values);
              })}
            >
              <ApiErrorNotice error={itemError} />
              <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                Product
                <select
                  className="mt-1 block min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-soft outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                  disabled={productsQuery.isLoading || Boolean(productsQuery.error) || !selectedSale}
                  {...itemForm.register("productUuid")}
                >
                  <option value="">
                    {productsQuery.isLoading
                      ? "Loading products..."
                      : productsQuery.error
                        ? "Could not load products"
                        : "Select a product"}
                  </option>
                  {(productsQuery.data ?? [])
                    .filter((product) => Boolean(product.uuid))
                    .map((product) => (
                      <option key={product.uuid} value={product.uuid}>
                        {product.name ?? "Unnamed product"} · Code {shortCode(product.uuid)} · {formatCurrency(product.basePrice)}
                      </option>
                    ))}
                </select>
                {itemForm.formState.errors.productUuid?.message ? (
                  <span className="mt-1 block text-sm text-red-700" role="alert">
                    {itemForm.formState.errors.productUuid.message}
                  </span>
                ) : null}
              </label>
              {selectedProduct ? (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 md:col-span-2">
                  <p className="font-medium">{selectedProduct.name ?? "Selected product"}</p>
                  <p className="mt-1">Base price {formatCurrency(selectedProduct.basePrice)}</p>
                </div>
              ) : null}
              <FormField label="Sale price" inputMode="decimal" {...itemForm.register("salePrice")} error={itemForm.formState.errors.salePrice?.message} />
              <FormField label="Inventory" inputMode="numeric" {...itemForm.register("inventory")} error={itemForm.formState.errors.inventory?.message} />
              <FormField label="Max per user" inputMode="numeric" {...itemForm.register("maxPerUser")} error={itemForm.formState.errors.maxPerUser?.message} />
              <div className="flex items-end gap-3">
                <Button type="submit" disabled={addItemMutation.isPending || productsQuery.isLoading || !selectedSale}>
                  {addItemMutation.isPending ? "Adding..." : "Add product"}
                </Button>
              </div>
            </form>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-base font-semibold text-slate-950">Activate Sale</h2>
            <p className="mt-1 text-sm text-slate-600">Activation loads inventory into Redis and enables purchases.</p>
            <ApiErrorNotice error={activateError} />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button disabled={!selectedSale || activateMutation.isPending} onClick={() => setConfirmOpen(true)}>
                {activateMutation.isPending ? "Activating..." : "Activate selected sale"}
              </Button>
              {activateMutation.data?.saleUuid ? (
                <span className="inline-flex items-center gap-2 text-sm text-green-800">
                  <CheckCircle2 size={16} /> Activated {activateMutation.data.name ?? selectedSale?.name ?? "sale"}.
                </span>
              ) : null}
            </div>
          </section>
        </div>
      </section>

      <ConfirmModal
        open={confirmOpen}
        title="Activate sale?"
        description="Activation loads inventory into Redis and enables purchase requests for this sale. Backend validation remains authoritative."
        confirmLabel="Activate"
        busy={activateMutation.isPending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setActivateError(null);
          activateMutation.mutate();
        }}
      />
    </div>
  );
}
