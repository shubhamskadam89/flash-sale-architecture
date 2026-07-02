import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { type ApiError } from "../api/api-error";
import { getProduct, productKeys } from "../api/products.api";
import { ApiErrorNotice } from "../components/common/ApiErrorNotice";
import { Button } from "../components/common/Button";
import { StatusBadge } from "../components/common/StatusBadge";
import { formatCurrency } from "../utils/currency";

export function ProductDetailPage() {
  const { productUuid = "" } = useParams();
  const query = useQuery({
    queryKey: productKeys.detail(productUuid),
    queryFn: () => getProduct(productUuid),
    enabled: Boolean(productUuid),
    retry: false
  });

  return (
    <div className="space-y-5">
      <Button variant="secondary" onClick={() => history.back()}>
        <ArrowLeft size={16} /> Back
      </Button>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        {query.isLoading ? <p className="text-sm text-slate-600">Loading product...</p> : null}
        <ApiErrorNotice error={query.error as ApiError | null} title="Could not load product" />
        {query.data ? (
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-950">{query.data.name ?? "Product"}</h1>
              <p className="mt-1 text-sm text-slate-500">{productUuid}</p>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-slate-500">Base price</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-950">{formatCurrency(query.data.basePrice)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Active</dt>
                <dd className="mt-1">
                  <StatusBadge tone={query.data.isActive ? "success" : "neutral"}>
                    {query.data.isActive === undefined ? "Not returned" : query.data.isActive ? "Active" : "Inactive"}
                  </StatusBadge>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500">Description</dt>
                <dd className="mt-1 text-sm text-slate-700">{query.data.description ?? "Not returned"}</dd>
              </div>
            </dl>
            {query.data.metadata ? (
              <details className="rounded-md border border-slate-200 p-3">
                <summary className="cursor-pointer text-sm font-medium text-primary-700">Metadata</summary>
                <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(query.data.metadata, null, 2)}</pre>
              </details>
            ) : null}
          </div>
        ) : null}
      </section>
      <Link to="/products" className="text-sm font-medium text-primary-700">
        Return to products
      </Link>
    </div>
  );
}
