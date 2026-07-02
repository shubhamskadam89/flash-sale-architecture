import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { Button } from "../components/common/Button";

export function NotFoundPage() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
      <h1 className="text-2xl font-semibold text-slate-950">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">The page you opened does not exist in the console.</p>
      <Link to={isAuthenticated ? "/products" : "/login"} className="mt-5 inline-block">
        <Button>{isAuthenticated ? "Go to products" : "Go to login"}</Button>
      </Link>
    </section>
  );
}
