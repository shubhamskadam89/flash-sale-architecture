import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { normalizeApiError, type ApiError } from "../api/api-error";
import { useAuth } from "../auth/useAuth";
import { ApiErrorNotice } from "../components/common/ApiErrorNotice";
import { Button } from "../components/common/Button";
import { FormField } from "../components/common/FormField";
import { notifyError, notifySuccess } from "../utils/notify";

const schema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Password is required.")
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState<ApiError | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  if (isAuthenticated) return <Navigate to="/purchase" replace />;

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const user = await login(values);
      notifySuccess("Signed in successfully.", { id: "auth-login-success" });
      navigate(from ?? (user.role === "ADMIN" ? "/admin/sales" : "/purchase"), { replace: true });
    } catch (caught) {
      const normalized = normalizeApiError(caught);
      const customError = {
        ...normalized,
        message:
          normalized.status === 500
            ? "Sign in failed. Check your credentials and try again."
            : normalized.message
      };
      setError(customError);
      notifyError(customError, "Unable to sign in. Please verify your credentials and try again.", {
        id: "auth-login-error"
      });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6">
          <p className="text-xl font-semibold text-slate-950">Flash Sale Console</p>
          <p className="mt-1 text-sm text-slate-600">Sign in to manage products or complete purchase requests.</p>
        </div>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <ApiErrorNotice error={error} title="Sign in failed" />
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            {...form.register("email")}
            error={form.formState.errors.email?.message}
          />
          <FormField
            label="Password"
            type="password"
            autoComplete="current-password"
            {...form.register("password")}
            error={form.formState.errors.password?.message}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            <LogIn size={16} /> {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        {import.meta.env.DEV ? <div className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600">
          <p>
            New local user?{" "}
            <Link className="font-medium text-primary-700" to="/setup/register">
              Create a setup account
            </Link>
          </p>
        </div> : null}
      </section>
    </main>
  );
}
