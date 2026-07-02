import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, PackagePlus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { normalizeApiError, type ApiError } from "../api/api-error";
import { createProduct, listProducts, productKeys } from "../api/products.api";
import { useAuth } from "../auth/useAuth";
import { ApiErrorNotice } from "../components/common/ApiErrorNotice";
import { Button } from "../components/common/Button";
import { FormField } from "../components/common/FormField";
import { StatusBadge } from "../components/common/StatusBadge";
import { formatCurrency } from "../utils/currency";
import { notifyError, notifySuccess } from "../utils/notify";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required."),
  description: z.string().optional(),
  basePrice: z.coerce.number().positive("Base price must be positive."),
  metadata: z.string().optional()
});

type ProductForm = z.infer<typeof productSchema>;

function parseMetadata(value?: string): Record<string, unknown> | undefined {
  if (!value?.trim()) return undefined;
  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Metadata must be a JSON object.");
  }
  return parsed as Record<string, unknown>;
}

export function ProductsPage() {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [formError, setFormError] = useState<ApiError | null>(null);
  const queryClient = useQueryClient();
  const productsQuery = useQuery({ queryKey: productKeys.all, queryFn: listProducts });
  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", basePrice: 0, metadata: "" }
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productKeys.all });
      form.reset();
      setShowCreate(false);
      notifySuccess("Product created successfully.", { id: "product-create-success" });
    },
    onError: (caught) => {
      const normalized = normalizeApiError(caught);
      setFormError(normalized);
      notifyError(normalized, "Unable to create product. Please try again.", { id: "product-create-error" });
    }
  });

  const products = useMemo(() => {
    const rows = productsQuery.data ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((product) => (product.name ?? "").toLowerCase().includes(term));
  }, [productsQuery.data, search]);

  function onSubmit(values: ProductForm) {
    setFormError(null);
    try {
      createMutation.mutate({
        name: values.name,
        description: values.description,
        basePrice: values.basePrice,
        metadata: parseMetadata(values.metadata)
      });
    } catch (caught) {
      setFormError({ message: caught instanceof Error ? caught.message : "Metadata must be valid JSON." });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Products</h1>
          <p className="mt-1 text-sm text-slate-600">Products are fetched from the confirmed product API.</p>
        </div>
        {isAdmin ? (
          <Button onClick={() => setShowCreate((current) => !current)}>
            {showCreate ? <X size={16} /> : <PackagePlus size={16} />}
            {showCreate ? "Close form" : "Create product"}
          </Button>
        ) : null}
      </div>

      {showCreate ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-base font-semibold text-slate-950">Create Product</h2>
          <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <ApiErrorNotice error={formError} />
            <FormField label="Name" {...form.register("name")} error={form.formState.errors.name?.message} />
            <FormField
              label="Base price"
              inputMode="decimal"
              {...form.register("basePrice")}
              error={form.formState.errors.basePrice?.message}
            />
            <div className="md:col-span-2">
              <FormField label="Description" textarea rows={3} {...form.register("description")} />
            </div>
            <div className="md:col-span-2">
              <FormField
                label="Metadata JSON"
                textarea
                rows={4}
                placeholder='{"color":"blue"}'
                {...form.register("metadata")}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create product"}
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white shadow-soft">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full max-w-sm">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20"
              placeholder="Search by name"
            />
          </label>
          <StatusBadge tone="info">{products.length} shown</StatusBadge>
        </div>
        {productsQuery.isLoading ? <p className="p-4 text-sm text-slate-600">Loading products...</p> : null}
        <ApiErrorNotice error={productsQuery.error as ApiError | null} title="Could not load products" />
        {!productsQuery.isLoading && !productsQuery.error && products.length === 0 ? (
          <p className="p-4 text-sm text-slate-600">No products found.</p>
        ) : null}
        {products.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Base price</th>
                  <th className="px-4 py-3">Metadata</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product, index) => (
                  <tr key={product.uuid ?? `${product.name}-${index}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-950">{product.name ?? "Unnamed product"}</p>
                      {product.description ? <p className="mt-1 max-w-xl text-slate-600">{product.description}</p> : null}
                    </td>
                    <td className="px-4 py-3">{formatCurrency(product.basePrice)}</td>
                    <td className="px-4 py-3">
                      {product.metadata ? (
                        <details>
                          <summary className="cursor-pointer text-primary-700">View JSON</summary>
                          <pre className="mt-2 max-w-sm overflow-auto rounded bg-slate-50 p-2 text-xs">
                            {JSON.stringify(product.metadata, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-slate-500">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {product.uuid ? (
                        <Link className="inline-flex items-center gap-2 text-sm font-medium text-primary-700" to={`/products/${product.uuid}`}>
                          <Eye size={16} /> View
                        </Link>
                      ) : (
                        <span className="text-slate-500">Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
