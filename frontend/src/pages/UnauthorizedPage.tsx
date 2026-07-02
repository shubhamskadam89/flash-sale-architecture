import { Link } from "react-router-dom";
import { Button } from "../components/common/Button";

export function UnauthorizedPage() {
  return (
    <section className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
      <h1 className="text-2xl font-semibold text-slate-950">Access unavailable</h1>
      <p className="mt-2 text-sm text-slate-600">This area requires an admin role returned by the backend.</p>
      <Link to="/login" className="mt-5 inline-block">
        <Button>Back to login</Button>
      </Link>
    </section>
  );
}
