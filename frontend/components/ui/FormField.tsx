import { useId } from "react";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

// Shared label + error/hint chrome so every field across the auth and
// dashboard forms validates and reads the same way.
export function FormField({ label, htmlFor, error, hint, children, className }: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 block text-xs font-bold text-[#5C5048]">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

const baseInputClass =
  "w-full rounded-xl border px-4 py-3 text-sm text-ink outline-none transition focus:ring-2";

function borderClass(hasError?: boolean): string {
  return hasError
    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
    : "border-border focus:border-accent focus:ring-accent/15";
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

// Convenience wrapper combining FormField + a styled <input>, for the common
// case where a field doesn't need a custom control (like PasswordInput).
// Falls back to a generated id so the label is always programmatically
// associated with the input, even when the caller doesn't pass one.
export function TextField({ label, error, hint, id, className, ...rest }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <FormField label={label} htmlFor={inputId} error={error} hint={hint}>
      <input
        id={inputId}
        {...rest}
        className={`${baseInputClass} ${borderClass(Boolean(error))} ${className ?? ""}`}
      />
    </FormField>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextAreaField({ label, error, hint, id, className, ...rest }: TextAreaFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <FormField label={label} htmlFor={inputId} error={error} hint={hint}>
      <textarea
        id={inputId}
        {...rest}
        className={`${baseInputClass} resize-none ${borderClass(Boolean(error))} ${className ?? ""}`}
      />
    </FormField>
  );
}
