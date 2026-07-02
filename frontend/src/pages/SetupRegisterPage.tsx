import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { normalizeApiError, type ApiError } from "../api/api-error";
import { registerSetupUser } from "../api/auth.api";
import { ApiErrorNotice } from "../components/common/ApiErrorNotice";
import { Button } from "../components/common/Button";
import { FormField } from "../components/common/FormField";
import { notifyError, notifySuccess } from "../utils/notify";

const schema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(6, "Use at least 6 characters."),
  role: z.enum(["ADMIN", "USER"])
});

type FormValues = z.infer<typeof schema>;

export function SetupRegisterPage() {
  const [error, setError] = useState<ApiError | null>(null);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "ADMIN"
    }
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    setCreatedEmail(null);
    try {
      await registerSetupUser(values);
      setCreatedEmail(values.email);
      notifySuccess("Account created successfully.", { id: "setup-register-success" });
      form.reset({ fullName: "", email: "", password: "", role: "USER" });
    } catch (caught) {
      const normalized = normalizeApiError(caught);
      setError(normalized);
      notifyError(normalized, "Unable to create account. Please try again.", { id: "setup-register-error" });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6">
          <p className="text-xl font-semibold text-slate-950">Create Setup User</p>
          <p className="mt-1 text-sm text-slate-600">
            Development/admin setup only. This uses the confirmed registration endpoint so a new backend user can sign in.
          </p>
        </div>

        {createdEmail ? (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
            Created {createdEmail}. You can sign in with that account now.
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <ApiErrorNotice error={error} title="Registration failed" />
          <FormField
            label="Full name"
            autoComplete="name"
            {...form.register("fullName")}
            error={form.formState.errors.fullName?.message}
          />
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
            autoComplete="new-password"
            {...form.register("password")}
            error={form.formState.errors.password?.message}
          />
          <label className="block text-sm font-medium text-slate-700">
            Role
            <select
              className="mt-1 block min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-soft outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20"
              {...form.register("role")}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>
          </label>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            <UserPlus size={16} /> {form.formState.isSubmitting ? "Creating..." : "Create setup user"}
          </Button>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link className="font-medium text-primary-700" to="/login">
            Back to login
          </Link>
          {createdEmail ? (
            <Button variant="secondary" onClick={() => navigate("/login")}>
              Sign in
            </Button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
