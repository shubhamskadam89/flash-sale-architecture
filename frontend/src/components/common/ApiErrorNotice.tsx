import type { ApiError } from "../../api/api-error";

export function ApiErrorNotice({ error, title = "Request failed" }: { error?: ApiError | null; title?: string }) {
  if (!error) return null;
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
      <p className="font-medium">{title}</p>
      <p className="mt-1">{error.message}</p>
      {error.code ? <p className="mt-1 text-xs text-red-700">Code: {error.code}</p> : null}
    </div>
  );
}
