import { Search } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { FormField } from "../components/common/FormField";

export function OrderLookupPage() {
  const [orderReference, setOrderReference] = useState("");
  const navigate = useNavigate();

  return (
    <section className="max-w-xl rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <h1 className="text-2xl font-semibold text-slate-950">Order Lookup</h1>
      <p className="mt-1 text-sm text-slate-600">Use the order reference from a completed purchase.</p>
      <form
        className="mt-5 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (orderReference.trim()) navigate(`/orders/${orderReference.trim()}`);
        }}
      >
        <FormField
          label="Order reference"
          value={orderReference}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setOrderReference(event.target.value)}
        />
        <Button type="submit" disabled={!orderReference.trim()}>
          <Search size={16} /> Lookup order
        </Button>
      </form>
    </section>
  );
}
