import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-600",
  secondary: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus:ring-primary-600",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
  ghost: "text-slate-700 hover:bg-slate-100 focus:ring-primary-600"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-soft transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    />
  )
);

Button.displayName = "Button";
