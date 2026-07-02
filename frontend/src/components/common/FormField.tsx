import { forwardRef, InputHTMLAttributes, type Ref, TextareaHTMLAttributes } from "react";

type BaseProps = {
  label: string;
  error?: string;
  hint?: string;
};

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { textarea: true };

export const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps | TextareaProps>(
  (props, ref) => {
  const { label, error, hint, className = "", ...rest } = props;
  const id = rest.id ?? rest.name;
  const controlClass =
    "mt-1 block min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-soft outline-none transition placeholder:text-slate-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20";

  if ("textarea" in rest) {
    const { textarea: _textarea, ...textareaProps } = rest;
    return (
      <label className="block text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
        <textarea
          ref={ref as Ref<HTMLTextAreaElement>}
          id={id}
          className={`${controlClass} ${className}`}
          {...textareaProps}
        />
        {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
        {error ? (
          <span className="mt-1 block text-sm text-red-700" role="alert">
            {error}
          </span>
        ) : null}
      </label>
    );
  }

  return (
    <label className="block text-sm font-medium text-slate-700" htmlFor={id}>
      {label}
      <input ref={ref as Ref<HTMLInputElement>} id={id} className={`${controlClass} ${className}`} {...rest} />
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
      {error ? (
        <span className="mt-1 block text-sm text-red-700" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
  }
);

FormField.displayName = "FormField";
